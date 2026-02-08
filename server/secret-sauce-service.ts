interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LiquiditySweep {
  type: 'bullish' | 'bearish';
  level: 'previous_day_high' | 'previous_day_low' | 'session_high' | 'session_low';
  sweepPrice: number;
  closePrice: number;
  sweepCandle: CandleData;
  candleIndex: number;
  strength: number;
}

interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  fib382: number;
  fib50: number;
  fib618: number;
  fib1618: number;
  currentPullbackLevel: number;
  isWeakPullback: boolean;
  priceAtFib382: boolean;
}

interface MismatchSignal {
  type: 'candle_mismatch' | 'macd_decreasing' | 'price_in_fvg';
  description: string;
  severity: 'warning' | 'exit';
}

interface HFCGateResult {
  gate0_liquiditySweep: boolean;
  gate1_priceAbove50EMA: boolean;
  gate2_reserved: boolean;
  gate3_reserved: boolean;
  gate4_highRVOL: boolean;
  gate5_iccIndication: boolean;
  gate6_openingRange: boolean;
  gate7_fibPullback: boolean;
  gatesPassed: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  sweepData: LiquiditySweep | null;
  fibData: FibonacciLevels | null;
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  midpoint: number;
  strength: number;
  candleIndex: number;
}

interface FVGFillZone {
  type: 'bullish' | 'bearish';
  zoneHigh: number;
  zoneLow: number;
  wickExtreme: number;
  bodyEdge: number;
  candleIndex: number;
  wickRatio: number;
}

interface DisplacementCandle {
  index: number;
  type: 'bullish' | 'bearish';
  bodySize: number;
  avgBodySize: number;
  multiplier: number;
  candle: CandleData;
}

interface ICCSetup {
  indication: DisplacementCandle;
  fvg: FairValueGap | null;
  correctionComplete: boolean;
  correctionCandles: number;
  entryZone: { high: number; low: number };
  direction: 'long' | 'short';
}

interface OpeningRange {
  high: number;
  low: number;
  midpoint: number;
  rangeSize: number;
  startTime: number;
  endTime: number;
  breakoutDirection: 'bullish' | 'bearish' | 'none';
  breakoutConfirmed: boolean;
}

interface FiveGateResult {
  gate1_emaStack: boolean;
  gate2_adx: boolean;
  gate3_macdCrossover: boolean;
  gate4_price50EMA: boolean;
  gate5_rvol: boolean;
  gatesPassed: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  details: {
    ema8: number;
    ema18: number;
    ema50: number;
    adx: number;
    macdLine: number;
    macdSignal: number;
    macdCrossover: 'bullish' | 'bearish' | 'none';
    currentPrice: number;
    rvol: number;
  };
}

export interface SecretSauceSignal {
  symbol: string;
  displayName: string;
  assetClass: string;
  signalType: 'ICC_LONG' | 'ICC_SHORT' | 'WICK_FILL_LONG' | 'WICK_FILL_SHORT' | 'ORB_LONG' | 'ORB_SHORT' | 'SWEEP_LONG' | 'SWEEP_SHORT' | 'NO_SIGNAL';
  signalStrength: number;
  confluenceScore: number;
  maxScore: number;
  fiveGates: FiveGateResult;
  hfcGates: HFCGateResult | null;
  iccSetup: ICCSetup | null;
  fvgFillZone: FVGFillZone | null;
  openingRange: OpeningRange | null;
  liquiditySweep: LiquiditySweep | null;
  fibonacciLevels: FibonacciLevels | null;
  mismatchSignals: MismatchSignal[];
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  optionsContract: {
    delta: number;
    type: 'call' | 'put';
    daysToExpiry: string;
  } | null;
  reasoning: string[];
  indicators: {
    rsi: number;
    atr: number;
    ema8: number;
    ema18: number;
    ema50: number;
    adx: number;
    macdLine: number;
    macdSignal: number;
    macdHistogram: number;
    rvol: number;
  };
  timestamp: string;
  timeframe: string;
  audioTrigger: 'entry' | 'exit' | null;
}

export class SecretSauceService {
  private macroCache: { data: any; timestamp: number } | null = null;
  private readonly MACRO_CACHE_TTL = 60000;

  async fetchCandleData(symbol: string, timeframe: string): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      
      let interval = '5m';
      let lookback = 432000;
      
      switch (timeframe) {
        case '1m': interval = '1m'; lookback = 86400; break;
        case '5m': interval = '5m'; lookback = 432000; break;
        case '15m': interval = '15m'; lookback = 604800; break;
        case '30m': interval = '30m'; lookback = 604800; break;
        case '1h': interval = '1h'; lookback = 2592000; break;
      }
      
      const period1 = now - lookback;
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=${interval}`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!response.ok) throw new Error(`Yahoo API error: ${response.status}`);
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result?.timestamp) return [];
      
      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      if (!quotes) return [];
      
      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
          });
        }
      }
      
      return candles;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return [];
    }
  }

  private formatSymbol(symbol: string): string {
    const forexPairs = [
      'EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD',
      'EURGBP', 'EURJPY', 'EURCHF', 'EURCAD', 'EURNZD', 'GBPAUD', 'GBPJPY',
      'AUDJPY', 'EURAUD', 'GBPCHF', 'USDTRY', 'USDMXN', 'USDZAR', 'USDSGD', 'EURTRY'
    ];
    if (forexPairs.includes(symbol.toUpperCase())) {
      return `${symbol.toUpperCase()}=X`;
    }
    return symbol.toUpperCase();
  }

  calculateEMA(closes: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    let sum = 0;
    for (let i = 0; i < Math.min(period, closes.length); i++) {
      sum += closes[i];
    }
    ema.push(sum / Math.min(period, closes.length));
    
    for (let i = period; i < closes.length; i++) {
      ema.push((closes[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
    }
    
    return ema;
  }

  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    if (avgLoss === 0) return 100;
    return 100 - (100 / (1 + avgGain / avgLoss));
  }

  calculateATR(candles: CandleData[], period: number = 14): number {
    if (candles.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trueRanges.push(tr);
    }
    
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b, 0) / recentTR.length;
  }

  calculateADX(candles: CandleData[], period: number = 14): number {
    if (candles.length < period * 2) return 20;
    
    const plusDM: number[] = [];
    const minusDM: number[] = [];
    const tr: number[] = [];
    
    for (let i = 1; i < candles.length; i++) {
      const highDiff = candles[i].high - candles[i - 1].high;
      const lowDiff = candles[i - 1].low - candles[i].low;
      
      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
      
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
    }
    
    const smoothedPlusDM = this.wilderSmooth(plusDM, period);
    const smoothedMinusDM = this.wilderSmooth(minusDM, period);
    const smoothedTR = this.wilderSmooth(tr, period);
    
    const plusDI = smoothedTR !== 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
    const minusDI = smoothedTR !== 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;
    
    const dx = (plusDI + minusDI) !== 0 ? Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100 : 0;
    
    return dx;
  }

  private wilderSmooth(data: number[], period: number): number {
    if (data.length < period) return 0;
    
    let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
    let smoothed = sum;
    
    for (let i = period; i < data.length; i++) {
      smoothed = smoothed - (smoothed / period) + data[i];
    }
    
    return smoothed / period;
  }

  calculateMACD(closes: number[]): { line: number; signal: number; histogram: number; crossover: 'bullish' | 'bearish' | 'none' } {
    if (closes.length < 35) return { line: 0, signal: 0, histogram: 0, crossover: 'none' };
    
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    
    const macdLine: number[] = [];
    const startIdx = 26 - 12;
    
    for (let i = 0; i < ema12.length; i++) {
      if (i >= startIdx && (i - startIdx) < ema26.length) {
        macdLine.push(ema12[i] - ema26[i - startIdx]);
      }
    }
    
    if (macdLine.length < 9) return { line: 0, signal: 0, histogram: 0, crossover: 'none' };
    
    const signalLine = this.calculateEMA(macdLine, 9);
    
    const currentMacd = macdLine[macdLine.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];
    const prevMacd = macdLine[macdLine.length - 2] || currentMacd;
    const prevSignal = signalLine[signalLine.length - 2] || currentSignal;
    
    let crossover: 'bullish' | 'bearish' | 'none' = 'none';
    if (prevMacd <= prevSignal && currentMacd > currentSignal) {
      crossover = 'bullish';
    } else if (prevMacd >= prevSignal && currentMacd < currentSignal) {
      crossover = 'bearish';
    }
    
    return {
      line: currentMacd,
      signal: currentSignal,
      histogram: currentMacd - currentSignal,
      crossover
    };
  }

  calculateRVOL(candles: CandleData[], period: number = 20): number {
    if (candles.length < period + 1) return 1;
    
    const volumes = candles.map(c => c.volume);
    const avgVolume = volumes.slice(-period - 1, -1).reduce((a, b) => a + b, 0) / period;
    const currentVolume = volumes[volumes.length - 1];
    
    return avgVolume > 0 ? currentVolume / avgVolume : 1;
  }

  detectDisplacement(candles: CandleData[], lookback: number = 20): DisplacementCandle | null {
    if (candles.length < lookback + 10) return null;
    
    const recentCandles = candles.slice(-lookback - 5, -5);
    const bodySizes = recentCandles.map(c => Math.abs(c.close - c.open));
    const avgBody = bodySizes.reduce((a, b) => a + b, 0) / bodySizes.length;
    
    for (let i = candles.length - 8; i < candles.length - 3; i++) {
      const candle = candles[i];
      const bodySize = Math.abs(candle.close - candle.open);
      const range = candle.high - candle.low;
      const multiplier = bodySize / avgBody;
      const bodyToRange = range > 0 ? bodySize / range : 0;
      
      if (multiplier >= 2.5 && bodyToRange >= 0.7) {
        const type = candle.close > candle.open ? 'bullish' : 'bearish';
        
        const afterCandles = candles.slice(i + 1, Math.min(i + 5, candles.length));
        if (afterCandles.length < 2) continue;
        
        let slowCorrection = true;
        for (const c of afterCandles) {
          const cBody = Math.abs(c.close - c.open);
          if (cBody > avgBody * 2) {
            slowCorrection = false;
            break;
          }
        }
        
        if (!slowCorrection) continue;
        
        if (type === 'bullish') {
          const lowestAfter = Math.min(...afterCandles.map(c => c.low));
          if (lowestAfter < candle.open) continue;
        } else {
          const highestAfter = Math.max(...afterCandles.map(c => c.high));
          if (highestAfter > candle.open) continue;
        }
        
        return {
          index: i,
          type,
          bodySize,
          avgBodySize: avgBody,
          multiplier,
          candle
        };
      }
    }
    
    return null;
  }

  detectFVG(candles: CandleData[], displacementIndex: number): FairValueGap | null {
    if (displacementIndex < 1 || displacementIndex >= candles.length - 1) return null;
    
    const candle1 = candles[displacementIndex - 1];
    const candle2 = candles[displacementIndex];
    const candle3 = candles[displacementIndex + 1];
    
    if (!candle1 || !candle2 || !candle3) return null;
    
    const isBullish = candle2.close > candle2.open;
    
    if (isBullish) {
      if (candle1.high < candle3.low) {
        return {
          type: 'bullish',
          high: candle3.low,
          low: candle1.high,
          midpoint: (candle3.low + candle1.high) / 2,
          strength: (candle3.low - candle1.high) / candle1.high * 100,
          candleIndex: displacementIndex
        };
      }
    } else {
      if (candle1.low > candle3.high) {
        return {
          type: 'bearish',
          high: candle1.low,
          low: candle3.high,
          midpoint: (candle1.low + candle3.high) / 2,
          strength: (candle1.low - candle3.high) / candle3.high * 100,
          candleIndex: displacementIndex
        };
      }
    }
    
    return null;
  }

  detectFVGFillZone(candles: CandleData[], lookback: number = 15): FVGFillZone | null {
    if (candles.length < lookback + 3) return null;
    
    for (let i = candles.length - lookback; i < candles.length - 3; i++) {
      const candle = candles[i];
      const range = candle.high - candle.low;
      if (range === 0) continue;
      
      const isBullish = candle.close > candle.open;
      const bodyHigh = Math.max(candle.open, candle.close);
      const bodyLow = Math.min(candle.open, candle.close);
      
      const lowerWick = bodyLow - candle.low;
      const upperWick = candle.high - bodyHigh;
      
      if (lowerWick / range >= 0.5) {
        const zoneHigh = bodyLow;
        const zoneLow = candle.low + (lowerWick * 0.3);
        
        const afterCandles = candles.slice(i + 1);
        let priceRevisited = false;
        let rejectionFound = false;
        
        for (let j = 0; j < afterCandles.length - 1; j++) {
          const c = afterCandles[j];
          if (c.low <= zoneHigh && c.low >= zoneLow) {
            priceRevisited = true;
            const nextC = afterCandles[j + 1];
            if (nextC && nextC.close > c.close && nextC.close > zoneHigh) {
              rejectionFound = true;
              break;
            }
          }
        }
        
        const currentPrice = candles[candles.length - 1].close;
        const currentInZone = currentPrice >= zoneLow && currentPrice <= zoneHigh;
        const lastCandle = candles[candles.length - 1];
        const lastCandleBullish = lastCandle.close > lastCandle.open;
        
        if ((priceRevisited && rejectionFound) || (currentInZone && lastCandleBullish)) {
          return {
            type: 'bullish',
            zoneHigh,
            zoneLow,
            wickExtreme: candle.low,
            bodyEdge: bodyLow,
            candleIndex: i,
            wickRatio: lowerWick / range
          };
        }
      }
      
      if (upperWick / range >= 0.5) {
        const zoneLow = bodyHigh;
        const zoneHigh = candle.high - (upperWick * 0.3);
        
        const afterCandles = candles.slice(i + 1);
        let priceRevisited = false;
        let rejectionFound = false;
        
        for (let j = 0; j < afterCandles.length - 1; j++) {
          const c = afterCandles[j];
          if (c.high >= zoneLow && c.high <= zoneHigh) {
            priceRevisited = true;
            const nextC = afterCandles[j + 1];
            if (nextC && nextC.close < c.close && nextC.close < zoneLow) {
              rejectionFound = true;
              break;
            }
          }
        }
        
        const currentPrice = candles[candles.length - 1].close;
        const currentInZone = currentPrice >= zoneLow && currentPrice <= zoneHigh;
        const lastCandle = candles[candles.length - 1];
        const lastCandleBearish = lastCandle.close < lastCandle.open;
        
        if ((priceRevisited && rejectionFound) || (currentInZone && lastCandleBearish)) {
          return {
            type: 'bearish',
            zoneHigh,
            zoneLow,
            wickExtreme: candle.high,
            bodyEdge: bodyHigh,
            candleIndex: i,
            wickRatio: upperWick / range
          };
        }
      }
    }
    
    return null;
  }

  detectOpeningRange(candles: CandleData[], assetClass: string = 'stocks'): OpeningRange | null {
    if (candles.length < 20) return null;
    
    const sessionAssets = ['stocks', 'indices'];
    if (!sessionAssets.includes(assetClass)) {
      return null;
    }
    
    const lastCandle = candles[candles.length - 1];
    const lastCandleDate = new Date(lastCandle.timestamp);
    
    const marketOpen = new Date(lastCandleDate);
    marketOpen.setHours(9, 30, 0, 0);
    const rangeEnd = new Date(lastCandleDate);
    rangeEnd.setHours(9, 45, 0, 0);
    const currentTime = new Date(lastCandle.timestamp);
    
    if (currentTime < rangeEnd) {
      return null;
    }
    
    const openTimestamp = marketOpen.getTime();
    const endTimestamp = rangeEnd.getTime();
    
    const rangeCandles = candles.filter(c => 
      c.timestamp >= openTimestamp && c.timestamp <= endTimestamp
    );
    
    if (rangeCandles.length < 2) {
      return null;
    }
    
    const high = Math.max(...rangeCandles.map(c => c.high));
    const low = Math.min(...rangeCandles.map(c => c.low));
    const currentPrice = candles[candles.length - 1].close;
    const lastCandleClose = candles[candles.length - 1].close;
    const prevCandleClose = candles[candles.length - 2]?.close || lastCandleClose;
    
    let breakoutDirection: 'bullish' | 'bearish' | 'none' = 'none';
    let breakoutConfirmed = false;
    
    if (lastCandleClose > high && prevCandleClose <= high) {
      breakoutDirection = 'bullish';
      breakoutConfirmed = true;
    } else if (lastCandleClose < low && prevCandleClose >= low) {
      breakoutDirection = 'bearish';
      breakoutConfirmed = true;
    } else if (currentPrice > high) {
      breakoutDirection = 'bullish';
      breakoutConfirmed = false;
    } else if (currentPrice < low) {
      breakoutDirection = 'bearish';
      breakoutConfirmed = false;
    }
    
    return {
      high,
      low,
      midpoint: (high + low) / 2,
      rangeSize: high - low,
      startTime: openTimestamp,
      endTime: endTimestamp,
      breakoutDirection,
      breakoutConfirmed
    };
  }

  detectICCSetup(candles: CandleData[]): ICCSetup | null {
    const displacement = this.detectDisplacement(candles);
    if (!displacement) return null;
    
    const fvg = this.detectFVG(candles, displacement.index);
    
    const candlesSinceDisplacement = candles.length - 1 - displacement.index;
    const correctionComplete = candlesSinceDisplacement >= 3;
    
    if (!correctionComplete) return null;
    
    const correctionCandles = candles.slice(displacement.index + 1);
    const currentPrice = candles[candles.length - 1].close;
    
    let entryZone: { high: number; low: number };
    if (fvg) {
      entryZone = { high: fvg.high, low: fvg.low };
    } else {
      if (displacement.type === 'bullish') {
        entryZone = { 
          high: displacement.candle.close, 
          low: displacement.candle.open 
        };
      } else {
        entryZone = { 
          high: displacement.candle.open, 
          low: displacement.candle.close 
        };
      }
    }
    
    const inZone = currentPrice >= entryZone.low && currentPrice <= entryZone.high;
    if (!inZone) return null;
    
    return {
      indication: displacement,
      fvg,
      correctionComplete,
      correctionCandles: candlesSinceDisplacement,
      entryZone,
      direction: displacement.type === 'bullish' ? 'long' : 'short'
    };
  }

  calculateFiveGates(candles: CandleData[]): FiveGateResult {
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    
    const ema8 = this.calculateEMA(closes, 8);
    const ema18 = this.calculateEMA(closes, 18);
    const ema50 = this.calculateEMA(closes, 50);
    
    const currentEma8 = ema8[ema8.length - 1] || currentPrice;
    const currentEma18 = ema18[ema18.length - 1] || currentPrice;
    const currentEma50 = ema50[ema50.length - 1] || currentPrice;
    
    const adx = this.calculateADX(candles);
    const macd = this.calculateMACD(closes);
    const rvol = this.calculateRVOL(candles);
    
    const bullishEmaStack = currentEma8 > currentEma18 && currentEma18 > currentEma50;
    const bearishEmaStack = currentEma8 < currentEma18 && currentEma18 < currentEma50;
    
    const gate4_bullish = currentPrice > currentEma50;
    const gate4_bearish = currentPrice < currentEma50;
    
    const gate2 = adx > 25;
    const gate5 = rvol > 1.5;
    
    let bullishGates = 0;
    let bearishGates = 0;
    
    if (bullishEmaStack) bullishGates++;
    if (bearishEmaStack) bearishGates++;
    
    if (gate2) { bullishGates++; bearishGates++; }
    
    if (macd.crossover === 'bullish') bullishGates++;
    else if (macd.crossover === 'bearish') bearishGates++;
    
    if (gate4_bullish) bullishGates++;
    if (gate4_bearish) bearishGates++;
    
    if (gate5) { bullishGates++; bearishGates++; }
    
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let gatesPassed = 0;
    
    if (bullishGates > bearishGates && bullishGates >= 3) {
      direction = 'bullish';
      gatesPassed = bullishGates;
    } else if (bearishGates > bullishGates && bearishGates >= 3) {
      direction = 'bearish';
      gatesPassed = bearishGates;
    } else {
      gatesPassed = Math.max(bullishGates, bearishGates);
    }
    
    const gate1 = bullishEmaStack || bearishEmaStack;
    const gate3 = macd.crossover !== 'none';
    const gate4 = gate4_bullish || gate4_bearish;
    
    return {
      gate1_emaStack: gate1,
      gate2_adx: gate2,
      gate3_macdCrossover: gate3,
      gate4_price50EMA: gate4,
      gate5_rvol: gate5,
      gatesPassed,
      direction,
      details: {
        ema8: currentEma8,
        ema18: currentEma18,
        ema50: currentEma50,
        adx,
        macdLine: macd.line,
        macdSignal: macd.signal,
        macdCrossover: macd.crossover,
        currentPrice,
        rvol
      }
    };
  }

  detectLiquiditySweep(candles: CandleData[]): LiquiditySweep | null {
    if (candles.length < 100) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    const yesterdayCandles = candles.filter(c => c.timestamp < todayStart);
    const todayCandles = candles.filter(c => c.timestamp >= todayStart);
    
    if (yesterdayCandles.length < 10) {
      const midpoint = Math.floor(candles.length / 2);
      const firstHalf = candles.slice(0, midpoint);
      const secondHalf = candles.slice(midpoint);
      
      const prevHigh = Math.max(...firstHalf.map(c => c.high));
      const prevLow = Math.min(...firstHalf.map(c => c.low));
      
      for (let i = secondHalf.length - 5; i < secondHalf.length; i++) {
        const candle = secondHalf[i];
        if (!candle) continue;
        
        if (candle.high > prevHigh && candle.close < prevHigh) {
          return {
            type: 'bearish',
            level: 'previous_day_high',
            sweepPrice: candle.high,
            closePrice: candle.close,
            sweepCandle: candle,
            candleIndex: midpoint + i,
            strength: (candle.high - prevHigh) / prevHigh * 100
          };
        }
        
        if (candle.low < prevLow && candle.close > prevLow) {
          return {
            type: 'bullish',
            level: 'previous_day_low',
            sweepPrice: candle.low,
            closePrice: candle.close,
            sweepCandle: candle,
            candleIndex: midpoint + i,
            strength: (prevLow - candle.low) / prevLow * 100
          };
        }
      }
      
      return null;
    }
    
    const prevDayHigh = Math.max(...yesterdayCandles.map(c => c.high));
    const prevDayLow = Math.min(...yesterdayCandles.map(c => c.low));
    
    const sessionStart = new Date(today);
    sessionStart.setHours(9, 30, 0, 0);
    const sessionStartTime = sessionStart.getTime();
    
    const sessionCandles = todayCandles.filter(c => c.timestamp >= sessionStartTime);
    const sessionHigh = sessionCandles.length > 0 ? Math.max(...sessionCandles.map(c => c.high)) : prevDayHigh;
    const sessionLow = sessionCandles.length > 0 ? Math.min(...sessionCandles.map(c => c.low)) : prevDayLow;
    
    const recentCandles = candles.slice(-10);
    
    for (let i = 0; i < recentCandles.length; i++) {
      const candle = recentCandles[i];
      
      if (candle.high > prevDayHigh && candle.close < prevDayHigh) {
        return {
          type: 'bearish',
          level: 'previous_day_high',
          sweepPrice: candle.high,
          closePrice: candle.close,
          sweepCandle: candle,
          candleIndex: candles.length - 10 + i,
          strength: (candle.high - prevDayHigh) / prevDayHigh * 100
        };
      }
      
      if (candle.low < prevDayLow && candle.close > prevDayLow) {
        return {
          type: 'bullish',
          level: 'previous_day_low',
          sweepPrice: candle.low,
          closePrice: candle.close,
          sweepCandle: candle,
          candleIndex: candles.length - 10 + i,
          strength: (prevDayLow - candle.low) / prevDayLow * 100
        };
      }
      
      if (candle.high > sessionHigh && candle.close < sessionHigh && sessionCandles.length > 5) {
        return {
          type: 'bearish',
          level: 'session_high',
          sweepPrice: candle.high,
          closePrice: candle.close,
          sweepCandle: candle,
          candleIndex: candles.length - 10 + i,
          strength: (candle.high - sessionHigh) / sessionHigh * 100
        };
      }
      
      if (candle.low < sessionLow && candle.close > sessionLow && sessionCandles.length > 5) {
        return {
          type: 'bullish',
          level: 'session_low',
          sweepPrice: candle.low,
          closePrice: candle.close,
          sweepCandle: candle,
          candleIndex: candles.length - 10 + i,
          strength: (sessionLow - candle.low) / sessionLow * 100
        };
      }
    }
    
    return null;
  }

  calculateFibonacciLevels(candles: CandleData[], direction: 'bullish' | 'bearish'): FibonacciLevels | null {
    if (candles.length < 20) return null;
    
    const recentCandles = candles.slice(-50);
    let swingHigh = Math.max(...recentCandles.map(c => c.high));
    let swingLow = Math.min(...recentCandles.map(c => c.low));
    
    const range = swingHigh - swingLow;
    if (range === 0) return null;
    
    const currentPrice = candles[candles.length - 1].close;
    let fib382: number, fib50: number, fib618: number, fib1618: number;
    
    if (direction === 'bullish') {
      fib382 = swingHigh - (range * 0.382);
      fib50 = swingHigh - (range * 0.5);
      fib618 = swingHigh - (range * 0.618);
      fib1618 = swingHigh + (range * 0.618);
    } else {
      fib382 = swingLow + (range * 0.382);
      fib50 = swingLow + (range * 0.5);
      fib618 = swingLow + (range * 0.618);
      fib1618 = swingLow - (range * 0.618);
    }
    
    const tolerance = range * 0.02;
    
    const currentPullbackLevel = direction === 'bullish' 
      ? (swingHigh - currentPrice) / range
      : (currentPrice - swingLow) / range;
    
    const isWeakPullback = currentPullbackLevel >= 0.35 && currentPullbackLevel <= 0.45;
    const priceAtFib382 = Math.abs(currentPrice - fib382) <= tolerance;
    
    return {
      swingHigh,
      swingLow,
      fib382,
      fib50,
      fib618,
      fib1618,
      currentPullbackLevel,
      isWeakPullback,
      priceAtFib382
    };
  }

  detectMismatchSignals(candles: CandleData[], direction: 'bullish' | 'bearish', fvg: FairValueGap | null): MismatchSignal[] {
    const signals: MismatchSignal[] = [];
    
    const lastCandle = candles[candles.length - 1];
    const isBullishCandle = lastCandle.close > lastCandle.open;
    
    if (direction === 'bullish' && !isBullishCandle) {
      signals.push({
        type: 'candle_mismatch',
        description: '1m candle bearish vs bullish bias',
        severity: 'warning'
      });
    } else if (direction === 'bearish' && isBullishCandle) {
      signals.push({
        type: 'candle_mismatch',
        description: '1m candle bullish vs bearish bias',
        severity: 'warning'
      });
    }
    
    const closes = candles.map(c => c.close);
    const macd = this.calculateMACD(closes);
    const prevHistogram = macd.histogram;
    
    if (candles.length >= 2) {
      const prevCloses = candles.slice(0, -1).map(c => c.close);
      const prevMacd = this.calculateMACD(prevCloses);
      
      if (direction === 'bullish' && macd.histogram < prevMacd.histogram) {
        signals.push({
          type: 'macd_decreasing',
          description: 'MACD histogram decreasing (momentum loss)',
          severity: 'warning'
        });
      } else if (direction === 'bearish' && macd.histogram > prevMacd.histogram) {
        signals.push({
          type: 'macd_decreasing',
          description: 'MACD histogram increasing (momentum loss)',
          severity: 'warning'
        });
      }
    }
    
    if (fvg) {
      const currentPrice = lastCandle.close;
      if (currentPrice > fvg.low && currentPrice < fvg.high) {
        signals.push({
          type: 'price_in_fvg',
          description: 'Price closed inside FVG zone',
          severity: 'exit'
        });
      }
    }
    
    return signals;
  }

  calculateHFCGates(
    candles: CandleData[], 
    assetClass: string
  ): HFCGateResult {
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    
    const sweep = this.detectLiquiditySweep(candles);
    const gate0 = sweep !== null;
    
    const ema50 = this.calculateEMA(closes, 50);
    const currentEma50 = ema50[ema50.length - 1] || currentPrice;
    const gate1_bullish = currentPrice > currentEma50;
    const gate1_bearish = currentPrice < currentEma50;
    
    const rvol = this.calculateRVOL(candles);
    const gate4 = rvol > 2.5;
    
    const displacement = this.detectDisplacement(candles);
    let gate5 = false;
    let hasFVG = false;
    if (displacement) {
      const bodySize = Math.abs(displacement.candle.close - displacement.candle.open);
      const range = displacement.candle.high - displacement.candle.low;
      const bodyRatio = range > 0 ? bodySize / range : 0;
      
      if (bodyRatio >= 0.8) {
        const fvg = this.detectFVG(candles, displacement.index);
        if (fvg) {
          gate5 = true;
          hasFVG = true;
        }
      }
    }
    
    const openingRange = this.detectOpeningRange(candles, assetClass);
    let gate6 = false;
    if (openingRange) {
      if (sweep?.type === 'bullish' && currentPrice > openingRange.high) {
        gate6 = true;
      } else if (sweep?.type === 'bearish' && currentPrice < openingRange.low) {
        gate6 = true;
      }
    }
    
    const direction = sweep?.type || (gate1_bullish ? 'bullish' : gate1_bearish ? 'bearish' : 'neutral');
    const fibLevels = this.calculateFibonacciLevels(candles, direction === 'neutral' ? 'bullish' : direction);
    const gate7 = fibLevels?.isWeakPullback && fibLevels?.priceAtFib382;
    
    let gatesPassed = 0;
    if (gate0) gatesPassed++;
    if (direction === 'bullish' ? gate1_bullish : gate1_bearish) gatesPassed++;
    if (gate4) gatesPassed++;
    if (gate5) gatesPassed++;
    if (gate6) gatesPassed++;
    if (gate7) gatesPassed++;
    
    return {
      gate0_liquiditySweep: gate0,
      gate1_priceAbove50EMA: direction === 'bullish' ? gate1_bullish : gate1_bearish,
      gate2_reserved: false,
      gate3_reserved: false,
      gate4_highRVOL: gate4,
      gate5_iccIndication: gate5,
      gate6_openingRange: gate6,
      gate7_fibPullback: gate7 || false,
      gatesPassed,
      direction: direction === 'neutral' ? 'neutral' : direction,
      sweepData: sweep,
      fibData: fibLevels
    };
  }

  async analyzeAsset(symbol: string, timeframe: string = '5m', assetClass: string = 'stocks'): Promise<SecretSauceSignal | null> {
    const candles = await this.fetchCandleData(symbol, timeframe);
    
    if (candles.length < 30) {
      console.log(`Insufficient data for ${symbol}: ${candles.length} candles`);
      return null;
    }
    
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    let atr = this.calculateATR(candles);
    if (atr === 0 || atr < currentPrice * 0.001) {
      atr = currentPrice * 0.02;
    }
    const rsi = this.calculateRSI(closes);
    const fiveGates = this.calculateFiveGates(candles);
    
    const iccSetup = this.detectICCSetup(candles);
    const fvgFillZone = this.detectFVGFillZone(candles);
    const openingRange = this.detectOpeningRange(candles, assetClass);
    
    const hfcGates = this.calculateHFCGates(candles, assetClass);
    const liquiditySweep = this.detectLiquiditySweep(candles);
    const fibonacciLevels = hfcGates.fibData;
    
    const reasoning: string[] = [];
    let signalType: SecretSauceSignal['signalType'] = 'NO_SIGNAL';
    let entryPrice = currentPrice;
    let stopLoss = currentPrice - (atr * 1.0);
    let target1 = currentPrice + (atr * 1.5);
    let target2 = currentPrice + (atr * 2.5);
    let signalStrength = 0;
    let audioTrigger: 'entry' | 'exit' | null = null;
    let optionsContract: SecretSauceSignal['optionsContract'] = null;
    let mismatchSignals: MismatchSignal[] = [];
    
    if (hfcGates.gate0_liquiditySweep) {
      reasoning.push(`🎯 LIQUIDITY SWEEP DETECTED: ${liquiditySweep?.level.replace(/_/g, ' ')} (${liquiditySweep?.type})`);
      reasoning.push(`HFC 7-Gate Score: ${hfcGates.gatesPassed}/7`);
    }
    
    reasoning.push(`5-Gate Score: ${fiveGates.gatesPassed}/5 (${fiveGates.direction})`);
    reasoning.push(`ADX: ${fiveGates.details.adx.toFixed(1)} | RVOL: ${fiveGates.details.rvol.toFixed(2)}`);
    
    if (iccSetup && fiveGates.gatesPassed >= 4) {
      if (iccSetup.direction === 'long' && fiveGates.direction === 'bullish') {
        signalType = 'ICC_LONG';
        entryPrice = currentPrice;
        stopLoss = iccSetup.entryZone.low - (atr * 0.5);
        target1 = currentPrice + (atr * 1.5);
        target2 = currentPrice + (atr * 2.5);
        signalStrength = 8 + (fiveGates.gatesPassed - 4);
        reasoning.push(`ICC LONG: Displacement ${iccSetup.indication.multiplier.toFixed(1)}x avg body`);
        if (iccSetup.fvg) reasoning.push(`FVG Zone: ${iccSetup.fvg.low.toFixed(2)} - ${iccSetup.fvg.high.toFixed(2)}`);
        reasoning.push(`Correction: ${iccSetup.correctionCandles} candles`);
        audioTrigger = 'entry';
      } else if (iccSetup.direction === 'short' && fiveGates.direction === 'bearish') {
        signalType = 'ICC_SHORT';
        entryPrice = currentPrice;
        stopLoss = iccSetup.entryZone.high + (atr * 0.5);
        target1 = currentPrice - (atr * 1.5);
        target2 = currentPrice - (atr * 2.5);
        signalStrength = 8 + (fiveGates.gatesPassed - 4);
        reasoning.push(`ICC SHORT: Displacement ${iccSetup.indication.multiplier.toFixed(1)}x avg body`);
        if (iccSetup.fvg) reasoning.push(`FVG Zone: ${iccSetup.fvg.low.toFixed(2)} - ${iccSetup.fvg.high.toFixed(2)}`);
        reasoning.push(`Correction: ${iccSetup.correctionCandles} candles`);
        audioTrigger = 'entry';
      }
    }
    
    if (signalType === 'NO_SIGNAL' && fvgFillZone && fiveGates.gatesPassed >= 3) {
      if (fvgFillZone.type === 'bullish' && fiveGates.direction !== 'bearish') {
        signalType = 'WICK_FILL_LONG';
        entryPrice = currentPrice;
        stopLoss = fvgFillZone.wickExtreme - (atr * 0.3);
        target1 = currentPrice + (atr * 1.5);
        target2 = currentPrice + (atr * 2);
        signalStrength = 7 + (fiveGates.gatesPassed - 3) * 0.5;
        reasoning.push(`WICK FILL LONG: ${(fvgFillZone.wickRatio * 100).toFixed(0)}% wick rejection`);
        reasoning.push(`Zone: ${fvgFillZone.zoneLow.toFixed(2)} - ${fvgFillZone.zoneHigh.toFixed(2)}`);
        audioTrigger = 'entry';
      } else if (fvgFillZone.type === 'bearish' && fiveGates.direction !== 'bullish') {
        signalType = 'WICK_FILL_SHORT';
        entryPrice = currentPrice;
        stopLoss = fvgFillZone.wickExtreme + (atr * 0.3);
        target1 = currentPrice - (atr * 1.5);
        target2 = currentPrice - (atr * 2);
        signalStrength = 7 + (fiveGates.gatesPassed - 3) * 0.5;
        reasoning.push(`WICK FILL SHORT: ${(fvgFillZone.wickRatio * 100).toFixed(0)}% wick rejection`);
        reasoning.push(`Zone: ${fvgFillZone.zoneLow.toFixed(2)} - ${fvgFillZone.zoneHigh.toFixed(2)}`);
        audioTrigger = 'entry';
      }
    }
    
    if (signalType === 'NO_SIGNAL' && openingRange?.breakoutConfirmed && fiveGates.gatesPassed >= 3) {
      if (openingRange.breakoutDirection === 'bullish' && fiveGates.direction !== 'bearish') {
        signalType = 'ORB_LONG';
        entryPrice = currentPrice;
        stopLoss = openingRange.low - (atr * 0.3);
        target1 = currentPrice + openingRange.rangeSize;
        target2 = currentPrice + (openingRange.rangeSize * 2);
        signalStrength = 7.5 + (fiveGates.gatesPassed - 3) * 0.5;
        reasoning.push(`ORB LONG: Breakout above ${openingRange.high.toFixed(2)}`);
        reasoning.push(`Range: ${openingRange.rangeSize.toFixed(2)} | Target: 1x/2x range`);
        audioTrigger = 'entry';
      } else if (openingRange.breakoutDirection === 'bearish' && fiveGates.direction !== 'bullish') {
        signalType = 'ORB_SHORT';
        entryPrice = currentPrice;
        stopLoss = openingRange.high + (atr * 0.3);
        target1 = currentPrice - openingRange.rangeSize;
        target2 = currentPrice - (openingRange.rangeSize * 2);
        signalStrength = 7.5 + (fiveGates.gatesPassed - 3) * 0.5;
        reasoning.push(`ORB SHORT: Breakout below ${openingRange.low.toFixed(2)}`);
        reasoning.push(`Range: ${openingRange.rangeSize.toFixed(2)} | Target: 1x/2x range`);
        audioTrigger = 'entry';
      }
    }
    
    if (signalType === 'NO_SIGNAL' && hfcGates.gate0_liquiditySweep && hfcGates.gatesPassed >= 4) {
      if (liquiditySweep?.type === 'bullish') {
        signalType = 'SWEEP_LONG';
        entryPrice = currentPrice;
        stopLoss = fibonacciLevels?.fib50 || (currentPrice - atr);
        target1 = fibonacciLevels?.fib1618 || (currentPrice + atr * 1.5);
        target2 = currentPrice + atr * 2.5;
        signalStrength = 9 + (hfcGates.gatesPassed - 4) * 0.5;
        reasoning.push(`SWEEP LONG: Liquidity taken at ${liquiditySweep.level.replace(/_/g, ' ')}`);
        if (fibonacciLevels?.isWeakPullback) reasoning.push(`Weak pullback to 0.382 Fib confirmed`);
        optionsContract = { delta: 0.80, type: 'call', daysToExpiry: '25-35' };
        audioTrigger = 'entry';
      } else if (liquiditySweep?.type === 'bearish') {
        signalType = 'SWEEP_SHORT';
        entryPrice = currentPrice;
        stopLoss = fibonacciLevels?.fib50 || (currentPrice + atr);
        target1 = fibonacciLevels?.fib1618 || (currentPrice - atr * 1.5);
        target2 = currentPrice - atr * 2.5;
        signalStrength = 9 + (hfcGates.gatesPassed - 4) * 0.5;
        reasoning.push(`SWEEP SHORT: Liquidity taken at ${liquiditySweep.level.replace(/_/g, ' ')}`);
        if (fibonacciLevels?.isWeakPullback) reasoning.push(`Weak pullback to 0.382 Fib confirmed`);
        optionsContract = { delta: 0.80, type: 'put', daysToExpiry: '25-35' };
        audioTrigger = 'entry';
      }
    }
    
    if (signalType === 'NO_SIGNAL') {
      reasoning.push(`No valid setup: Gates ${fiveGates.gatesPassed}/5`);
      if (!iccSetup) reasoning.push(`No ICC displacement detected`);
      if (!fvgFillZone) reasoning.push(`No fvg-fill zone in range`);
      if (!openingRange?.breakoutConfirmed) reasoning.push(`No ORB breakout confirmed`);
      if (!hfcGates.gate0_liquiditySweep) reasoning.push(`No liquidity sweep detected`);
      
      if (fiveGates.direction === 'bearish') {
        stopLoss = currentPrice + (atr * 1.0);
        target1 = currentPrice - (atr * 1.5);
        target2 = currentPrice - (atr * 2.5);
      }
      signalStrength = Math.max(1, fiveGates.gatesPassed * 1.5);
    }
    
    if (signalType !== 'NO_SIGNAL') {
      const direction = signalType.includes('LONG') ? 'bullish' : 'bearish';
      mismatchSignals = this.detectMismatchSignals(candles, direction, iccSetup?.fvg || null);
      
      if (mismatchSignals.some(s => s.severity === 'exit')) {
        reasoning.push(`⚠️ KILL-SWITCH: ${mismatchSignals.find(s => s.severity === 'exit')?.description}`);
        audioTrigger = 'exit';
      }
    }
    
    const riskReward = stopLoss !== entryPrice 
      ? Math.abs(target1 - entryPrice) / Math.abs(entryPrice - stopLoss)
      : 0;
    
    return {
      symbol,
      displayName: symbol,
      assetClass,
      signalType,
      signalStrength: Math.min(10, signalStrength),
      confluenceScore: fiveGates.gatesPassed,
      maxScore: 5,
      fiveGates,
      hfcGates,
      iccSetup,
      fvgFillZone,
      openingRange,
      liquiditySweep,
      fibonacciLevels,
      mismatchSignals,
      entryPrice,
      stopLoss,
      target1,
      target2,
      riskRewardRatio: riskReward,
      optionsContract,
      reasoning,
      indicators: {
        rsi,
        atr,
        ema8: fiveGates.details.ema8,
        ema18: fiveGates.details.ema18,
        ema50: fiveGates.details.ema50,
        adx: fiveGates.details.adx,
        macdLine: fiveGates.details.macdLine,
        macdSignal: fiveGates.details.macdSignal,
        macdHistogram: fiveGates.details.macdLine - fiveGates.details.macdSignal,
        rvol: fiveGates.details.rvol
      },
      timestamp: new Date().toISOString(),
      timeframe,
      audioTrigger
    };
  }

  calculateTrendStrength(candles: CandleData[]): {
    value: number;
    direction: 'bullish' | 'bearish' | 'neutral';
    sweepDetected: boolean;
    sweepType: 'bullish' | 'bearish' | null;
    adx: number;
    adxRising: boolean;
    rsi: number;
    emaCross: 'bullish' | 'bearish' | 'none';
    intensity: number;
  } {
    if (candles.length < 50) {
      return { value: 0, direction: 'neutral', sweepDetected: false, sweepType: null, adx: 0, adxRising: false, rsi: 50, emaCross: 'none', intensity: 0 };
    }

    const closes = candles.map(c => c.close);
    
    // GATE 1: PRIMARY TRIGGER - Liquidity Sweep (High Priority)
    const sweep = this.detectLiquiditySweep(candles);
    const sweepBullish = sweep?.type === 'bullish';
    const sweepBearish = sweep?.type === 'bearish';
    const sweepDetected = sweep !== null;
    
    // GATE 2-7: Momentum & Trend Confirmation
    const adx = this.calculateADX(candles); // Trend Intensity (0-100)
    const prevAdx = this.calculateADX(candles.slice(0, -5)); // ADX 5 candles ago
    const adxRising = adx > prevAdx; // True when ADX is gaining strength
    const rsi = this.calculateRSI(closes);   // Momentum
    
    // EMA Cross for Directional bias
    const ema8 = this.calculateEMA(closes, 8);
    const ema18 = this.calculateEMA(closes, 18);
    const currentEma8 = ema8[ema8.length - 1] || closes[closes.length - 1];
    const currentEma18 = ema18[ema18.length - 1] || closes[closes.length - 1];
    const prevEma8 = ema8[ema8.length - 2] || currentEma8;
    const prevEma18 = ema18[ema18.length - 2] || currentEma18;
    
    let emaCross: 'bullish' | 'bearish' | 'none' = 'none';
    if (prevEma8 <= prevEma18 && currentEma8 > currentEma18) {
      emaCross = 'bullish';
    } else if (prevEma8 >= prevEma18 && currentEma8 < currentEma18) {
      emaCross = 'bearish';
    }
    
    // WEIGHTING SYSTEM
    let score = 0;
    
    // Liquidity sweep gives immediate high weight (+/- 50)
    if (sweepBullish) score += 50;
    if (sweepBearish) score -= 50;
    
    // Scale the ADX intensity into the score (0-50 range)
    const intensity = (adx / 100) * 50;
    
    // RSI momentum adjustment (+/- 10 range)
    const rsiMomentum = ((rsi - 50) / 50) * 10;
    
    // EMA cross confirmation (+/- 15)
    if (emaCross === 'bullish') score += 15;
    if (emaCross === 'bearish') score -= 15;
    
    // Add RSI momentum
    score += rsiMomentum;
    
    // Add intensity based on current direction
    if (score > 0) {
      score += intensity;
    } else if (score < 0) {
      score -= intensity;
    } else {
      // If no sweep, use RSI to determine direction for intensity
      score = rsi > 50 ? intensity : -intensity;
    }
    
    // Clamp to -100 to +100
    const finalValue = Math.max(-100, Math.min(100, score));
    
    // Determine direction
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (finalValue >= 20) direction = 'bullish';
    else if (finalValue <= -20) direction = 'bearish';
    
    return {
      value: Math.round(finalValue),
      direction,
      sweepDetected,
      sweepType: sweep?.type || null,
      adx: Math.round(adx),
      adxRising,
      rsi: Math.round(rsi),
      emaCross,
      intensity: Math.round(intensity)
    };
  }

  async scanMultipleAssets(symbols: string[], timeframe: string = '5m', assetClass: string = 'stocks'): Promise<SecretSauceSignal[]> {
    console.log(`🔥 Secret Sauce scanning ${symbols.length} assets on ${timeframe}...`);
    
    const results = await Promise.allSettled(
      symbols.map(symbol => this.analyzeAsset(symbol, timeframe, assetClass))
    );
    
    const signals: SecretSauceSignal[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        signals.push(result.value);
      }
    }
    
    signals.sort((a, b) => {
      if (a.signalType === 'NO_SIGNAL' && b.signalType !== 'NO_SIGNAL') return 1;
      if (a.signalType !== 'NO_SIGNAL' && b.signalType === 'NO_SIGNAL') return -1;
      return b.signalStrength - a.signalStrength;
    });
    
    console.log(`🔥 Secret Sauce scan complete: ${signals.filter(s => s.signalType !== 'NO_SIGNAL').length} active signals`);
    
    return signals;
  }
}

export const secretSauceService = new SecretSauceService();
