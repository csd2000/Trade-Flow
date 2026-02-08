export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ZeroLagIndicators {
  zlema: number[];
  hma: number[];
  tema: number[];
  dema: number[];
  kama: number[];
  roc: number[];
  zlemaMACD: { macd: number; signal: number; histogram: number };
  temaMACD: { macd: number; signal: number; histogram: number };
}

export interface OrderFlowData {
  cumulativeDelta: number;
  deltaHistory: number[];
  buyVolume: number;
  sellVolume: number;
  volumeImbalance: number;
  vwap: number;
  vwapUpper: number;
  vwapLower: number;
  volumeClusters: { price: number; volume: number; isBuying: boolean }[];
  pressureRatio: number;
}

export interface RegimeData {
  regime: 'trending_up' | 'trending_down' | 'ranging' | 'volatile' | 'consolidating';
  adx: number;
  atrPercentile: number;
  volumeZScore: number;
  trendStrength: number;
  volatilityLevel: 'low' | 'medium' | 'high' | 'extreme';
  shouldTrade: boolean;
  reason: string;
}

class ZeroLagIndicatorEngine {
  
  private calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => NaN);
    const multiplier = 2 / (period + 1);
    const ema: number[] = new Array(data.length).fill(NaN);
    
    let validStart = 0;
    while (validStart < data.length && (isNaN(data[validStart]) || data[validStart] === 0)) {
      validStart++;
    }
    
    const effectiveStart = Math.max(validStart, period - 1);
    if (effectiveStart >= data.length) return ema;
    
    let sum = 0;
    let count = 0;
    for (let i = validStart; i <= effectiveStart && count < period; i++) {
      if (!isNaN(data[i])) {
        sum += data[i];
        count++;
      }
    }
    if (count === 0) return ema;
    ema[effectiveStart] = sum / count;
    
    for (let i = effectiveStart + 1; i < data.length; i++) {
      const val = isNaN(data[i]) ? ema[i - 1] : data[i];
      ema[i] = (val - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }
  
  private calculateWilderSmoothing(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => NaN);
    const smoothed: number[] = new Array(data.length).fill(NaN);
    
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += isNaN(data[i]) ? 0 : data[i];
    }
    smoothed[period - 1] = sum;
    
    for (let i = period; i < data.length; i++) {
      const currentVal = isNaN(data[i]) ? 0 : data[i];
      smoothed[i] = smoothed[i - 1] - (smoothed[i - 1] / period) + currentVal;
    }
    return smoothed;
  }

  private calculateWMA(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => NaN);
    const wma: number[] = new Array(data.length).fill(NaN);
    const divisor = (period * (period + 1)) / 2;
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j] * (period - j);
      }
      wma[i] = sum / divisor;
    }
    return wma;
  }

  calculateZLEMA(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => NaN);
    const lag = Math.floor((period - 1) / 2);
    const zlData: number[] = new Array(data.length).fill(NaN);
    
    for (let i = lag; i < data.length; i++) {
      zlData[i] = 2 * data[i] - data[i - lag];
    }
    
    return this.calculateEMA(zlData.map((v, i) => isNaN(v) ? data[i] : v), period);
  }

  calculateHullMA(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => 0);
    
    const halfPeriod = Math.floor(period / 2);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    
    const wmaHalf = this.calculateWMA(data, halfPeriod);
    const wmaFull = this.calculateWMA(data, period);
    
    const rawHull: number[] = [];
    for (let i = 0; i < data.length; i++) {
      rawHull[i] = 2 * wmaHalf[i] - wmaFull[i];
    }
    
    return this.calculateWMA(rawHull, sqrtPeriod);
  }

  calculateDEMA(data: number[], period: number): number[] {
    const ema1 = this.calculateEMA(data, period);
    const ema2 = this.calculateEMA(ema1, period);
    
    const dema: number[] = new Array(data.length).fill(NaN);
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(ema1[i]) && !isNaN(ema2[i])) {
        dema[i] = 2 * ema1[i] - ema2[i];
      }
    }
    return dema;
  }

  calculateTEMA(data: number[], period: number): number[] {
    const ema1 = this.calculateEMA(data, period);
    const ema2 = this.calculateEMA(ema1, period);
    const ema3 = this.calculateEMA(ema2, period);
    
    const tema: number[] = new Array(data.length).fill(NaN);
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(ema1[i]) && !isNaN(ema2[i]) && !isNaN(ema3[i])) {
        tema[i] = 3 * ema1[i] - 3 * ema2[i] + ema3[i];
      }
    }
    return tema;
  }

  calculateKAMA(data: number[], period: number = 10, fastPeriod: number = 2, slowPeriod: number = 30): number[] {
    if (data.length < period + 1) return data.map(() => NaN);
    
    const fastSC = 2 / (fastPeriod + 1);
    const slowSC = 2 / (slowPeriod + 1);
    
    const kama: number[] = new Array(data.length).fill(NaN);
    kama[period] = data[period];
    
    for (let i = period + 1; i < data.length; i++) {
      const change = Math.abs(data[i] - data[i - period]);
      let volatility = 0;
      for (let j = 0; j < period; j++) {
        if (i - j - 1 >= 0) {
          volatility += Math.abs(data[i - j] - data[i - j - 1]);
        }
      }
      
      const er = volatility !== 0 ? change / volatility : 0;
      const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
      
      kama[i] = kama[i - 1] + sc * (data[i] - kama[i - 1]);
    }
    
    return kama;
  }

  calculateROC(data: number[], period: number = 10): number[] {
    const roc: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        roc[i] = 0;
      } else {
        const prevPrice = data[i - period];
        roc[i] = prevPrice !== 0 ? ((data[i] - prevPrice) / prevPrice) * 100 : 0;
      }
    }
    return roc;
  }

  calculateTEMAMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number; signal: number; histogram: number } {
    const temaFast = this.calculateTEMA(data, fastPeriod);
    const temaSlow = this.calculateTEMA(data, slowPeriod);
    
    const macdLine: number[] = [];
    for (let i = 0; i < data.length; i++) {
      macdLine[i] = temaFast[i] - temaSlow[i];
    }
    
    const signalLine = this.calculateTEMA(macdLine, signalPeriod);
    const lastIdx = data.length - 1;
    
    return {
      macd: macdLine[lastIdx] || 0,
      signal: signalLine[lastIdx] || 0,
      histogram: (macdLine[lastIdx] || 0) - (signalLine[lastIdx] || 0)
    };
  }

  calculateZLEMAMACD(data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number; signal: number; histogram: number } {
    const zlemaFast = this.calculateZLEMA(data, fastPeriod);
    const zlemaSlow = this.calculateZLEMA(data, slowPeriod);
    
    const macdLine: number[] = [];
    for (let i = 0; i < data.length; i++) {
      macdLine[i] = zlemaFast[i] - zlemaSlow[i];
    }
    
    const signalLine = this.calculateZLEMA(macdLine, signalPeriod);
    const lastIdx = data.length - 1;
    
    return {
      macd: macdLine[lastIdx] || 0,
      signal: signalLine[lastIdx] || 0,
      histogram: (macdLine[lastIdx] || 0) - (signalLine[lastIdx] || 0)
    };
  }

  /**
   * Calculate order flow metrics using candle-based heuristics.
   * 
   * IMPORTANT: This is a HEURISTIC ESTIMATION, not true order flow from tape data.
   * Buy/sell volume is estimated by candle position within the range:
   * - Close near high = mostly buying pressure
   * - Close near low = mostly selling pressure
   * 
   * For institutional-grade order flow, integrate tick-by-tick trade data or
   * footprint chart providers (e.g., Sierra Chart, Bookmap, Jigsaw).
   * 
   * Cumulative delta and pressure ratios should be used as directional hints,
   * not as precise order flow measurements.
   */
  calculateOrderFlow(candles: Candle[]): OrderFlowData {
    if (candles.length < 5) {
      return {
        cumulativeDelta: 0,
        deltaHistory: [],
        buyVolume: 0,
        sellVolume: 0,
        volumeImbalance: 0,
        vwap: 0,
        vwapUpper: 0,
        vwapLower: 0,
        volumeClusters: [],
        pressureRatio: 0.5
      };
    }

    let cumulativeDelta = 0;
    let buyVolume = 0;
    let sellVolume = 0;
    const deltaHistory: number[] = [];
    let totalTypicalPriceVolume = 0;
    let totalVolume = 0;
    const priceVolumeMap = new Map<number, { buy: number; sell: number }>();

    for (const candle of candles) {
      const isBullish = candle.close >= candle.open;
      const range = candle.high - candle.low;
      
      let buyRatio = 0.5;
      if (range > 0) {
        buyRatio = (candle.close - candle.low) / range;
      }
      
      const candleBuyVol = candle.volume * buyRatio;
      const candleSellVol = candle.volume * (1 - buyRatio);
      const delta = candleBuyVol - candleSellVol;
      
      cumulativeDelta += delta;
      deltaHistory.push(delta);
      buyVolume += candleBuyVol;
      sellVolume += candleSellVol;

      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      totalTypicalPriceVolume += typicalPrice * candle.volume;
      totalVolume += candle.volume;

      const roundedPrice = Math.round(typicalPrice * 100) / 100;
      const existing = priceVolumeMap.get(roundedPrice) || { buy: 0, sell: 0 };
      existing.buy += candleBuyVol;
      existing.sell += candleSellVol;
      priceVolumeMap.set(roundedPrice, existing);
    }

    const vwap = totalVolume > 0 ? totalTypicalPriceVolume / totalVolume : 0;
    
    let sumSquaredDev = 0;
    for (const candle of candles) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      sumSquaredDev += Math.pow(typicalPrice - vwap, 2) * candle.volume;
    }
    const vwapStdDev = totalVolume > 0 ? Math.sqrt(sumSquaredDev / totalVolume) : 0;
    
    const volumeClusters = Array.from(priceVolumeMap.entries())
      .map(([price, vol]) => ({
        price,
        volume: vol.buy + vol.sell,
        isBuying: vol.buy > vol.sell
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    const totalVol = buyVolume + sellVolume;
    const pressureRatio = totalVol > 0 ? buyVolume / totalVol : 0.5;
    const volumeImbalance = buyVolume - sellVolume;

    return {
      cumulativeDelta,
      deltaHistory,
      buyVolume,
      sellVolume,
      volumeImbalance,
      vwap,
      vwapUpper: vwap + vwapStdDev * 2,
      vwapLower: vwap - vwapStdDev * 2,
      volumeClusters,
      pressureRatio
    };
  }

  calculateRegime(candles: Candle[], period: number = 14): RegimeData {
    if (candles.length < period * 2) {
      return {
        regime: 'consolidating',
        adx: 0,
        atrPercentile: 50,
        volumeZScore: 0,
        trendStrength: 0,
        volatilityLevel: 'medium',
        shouldTrade: false,
        reason: 'Insufficient data for regime detection'
      };
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    const plusDM: number[] = [];
    const minusDM: number[] = [];
    const tr: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const highDiff = highs[i] - highs[i - 1];
      const lowDiff = lows[i - 1] - lows[i];
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
      
      const trVal = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      tr.push(trVal);
    }

    const smoothPlusDM = this.calculateWilderSmoothing(plusDM, period);
    const smoothMinusDM = this.calculateWilderSmoothing(minusDM, period);
    const smoothTR = this.calculateWilderSmoothing(tr, period);

    const lastIdx = smoothTR.length - 1;
    const lastTR = isNaN(smoothTR[lastIdx]) ? 0 : smoothTR[lastIdx];
    const lastPlusDM = isNaN(smoothPlusDM[lastIdx]) ? 0 : smoothPlusDM[lastIdx];
    const lastMinusDM = isNaN(smoothMinusDM[lastIdx]) ? 0 : smoothMinusDM[lastIdx];
    const plusDI = lastTR > 0 ? (lastPlusDM / lastTR) * 100 : 0;
    const minusDI = lastTR > 0 ? (lastMinusDM / lastTR) * 100 : 0;
    const diSum = plusDI + minusDI;
    const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;

    const dxHistory: number[] = [];
    for (let i = period - 1; i < smoothTR.length; i++) {
      const trVal = isNaN(smoothTR[i]) ? 0 : smoothTR[i];
      const pdmVal = isNaN(smoothPlusDM[i]) ? 0 : smoothPlusDM[i];
      const mdmVal = isNaN(smoothMinusDM[i]) ? 0 : smoothMinusDM[i];
      if (trVal > 0) {
        const pdi = (pdmVal / trVal) * 100;
        const mdi = (mdmVal / trVal) * 100;
        const sum = pdi + mdi;
        dxHistory.push(sum > 0 ? (Math.abs(pdi - mdi) / sum) * 100 : 0);
      }
    }
    
    let adx = 0;
    if (dxHistory.length >= period) {
      let adxSum = 0;
      for (let i = 0; i < period; i++) {
        adxSum += dxHistory[i];
      }
      adx = adxSum / period;
      
      for (let i = period; i < dxHistory.length; i++) {
        adx = ((adx * (period - 1)) + dxHistory[i]) / period;
      }
    } else if (dxHistory.length > 0) {
      adx = dxHistory.reduce((a, b) => a + b, 0) / dxHistory.length;
    }

    const currentATR = isNaN(smoothTR[lastIdx]) ? 0 : smoothTR[lastIdx];
    const validTR = tr.filter(v => !isNaN(v) && v > 0);
    const sortedTR = [...validTR].sort((a, b) => a - b);
    let atrRank = 0;
    for (let i = 0; i < sortedTR.length; i++) {
      if (sortedTR[i] <= currentATR) atrRank = i + 1;
    }
    const atrPercentile = sortedTR.length > 0 ? (atrRank / sortedTR.length) * 100 : 50;

    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const stdVolume = Math.sqrt(
      volumes.slice(-20).reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / 20
    );
    const currentVolume = volumes[volumes.length - 1];
    const volumeZScore = stdVolume > 0 ? (currentVolume - avgVolume) / stdVolume : 0;

    let regime: RegimeData['regime'];
    let shouldTrade = true;
    let reason = '';

    const currentPrice = closes[closes.length - 1];
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const priceAboveSMA = currentPrice > sma20;
    const trendStrength = adx;

    if (adx < 20) {
      if (atrPercentile < 30) {
        regime = 'consolidating';
        shouldTrade = false;
        reason = 'Low ADX + Low volatility = Consolidation. Wait for breakout.';
      } else {
        regime = 'ranging';
        shouldTrade = false;
        reason = 'ADX below 20 indicates no clear trend. Avoid trend-following entries.';
      }
    } else if (adx >= 20 && adx < 40) {
      regime = priceAboveSMA ? 'trending_up' : 'trending_down';
      shouldTrade = true;
      reason = `Moderate trend detected (ADX: ${adx.toFixed(1)}). ${regime === 'trending_up' ? 'Bullish' : 'Bearish'} bias confirmed.`;
    } else if (adx >= 40) {
      if (atrPercentile > 80) {
        regime = 'volatile';
        shouldTrade = volumeZScore > 1;
        reason = `Strong trend but extreme volatility. ${shouldTrade ? 'Volume confirms move.' : 'Wait for volume confirmation.'}`;
      } else {
        regime = priceAboveSMA ? 'trending_up' : 'trending_down';
        shouldTrade = true;
        reason = `Strong ${regime === 'trending_up' ? 'uptrend' : 'downtrend'} (ADX: ${adx.toFixed(1)}). High probability setup.`;
      }
    } else {
      regime = 'consolidating';
      shouldTrade = false;
      reason = 'Market structure unclear.';
    }

    let volatilityLevel: RegimeData['volatilityLevel'];
    if (atrPercentile < 25) volatilityLevel = 'low';
    else if (atrPercentile < 50) volatilityLevel = 'medium';
    else if (atrPercentile < 75) volatilityLevel = 'high';
    else volatilityLevel = 'extreme';

    return {
      regime,
      adx,
      atrPercentile,
      volumeZScore,
      trendStrength,
      volatilityLevel,
      shouldTrade,
      reason
    };
  }

  generateFullAnalysis(candles: Candle[]): {
    zeroLag: ZeroLagIndicators;
    orderFlow: OrderFlowData;
    regime: RegimeData;
  } {
    const closes = candles.map(c => c.close);
    
    const zeroLag: ZeroLagIndicators = {
      zlema: this.calculateZLEMA(closes, 20),
      hma: this.calculateHullMA(closes, 20),
      tema: this.calculateTEMA(closes, 20),
      dema: this.calculateDEMA(closes, 20),
      kama: this.calculateKAMA(closes, 10),
      roc: this.calculateROC(closes, 10),
      zlemaMACD: this.calculateZLEMAMACD(closes),
      temaMACD: this.calculateTEMAMACD(closes)
    };

    const orderFlow = this.calculateOrderFlow(candles);
    const regime = this.calculateRegime(candles);

    return { zeroLag, orderFlow, regime };
  }

  getLatestValues(candles: Candle[]): {
    zlema20: number;
    hma20: number;
    tema20: number;
    dema20: number;
    kama10: number;
    roc10: number;
    zlemaMACD: { macd: number; signal: number; histogram: number };
    temaMACD: { macd: number; signal: number; histogram: number };
    orderFlow: OrderFlowData;
    regime: RegimeData;
  } {
    const analysis = this.generateFullAnalysis(candles);
    const lastIdx = candles.length - 1;

    return {
      zlema20: analysis.zeroLag.zlema[lastIdx] || 0,
      hma20: analysis.zeroLag.hma[lastIdx] || 0,
      tema20: analysis.zeroLag.tema[lastIdx] || 0,
      dema20: analysis.zeroLag.dema[lastIdx] || 0,
      kama10: analysis.zeroLag.kama[lastIdx] || 0,
      roc10: analysis.zeroLag.roc[lastIdx] || 0,
      zlemaMACD: analysis.zeroLag.zlemaMACD,
      temaMACD: analysis.zeroLag.temaMACD,
      orderFlow: analysis.orderFlow,
      regime: analysis.regime
    };
  }
}

export const zeroLagIndicatorEngine = new ZeroLagIndicatorEngine();
