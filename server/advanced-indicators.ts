import type { Candle } from './zero-lag-indicators';

export interface AdvancedIndicators {
  superSmoother: number[];
  tsi: number[];
  adaptiveRsi: number[];
  squeezeOn: boolean;
  squeezeFiring: 'long' | 'short' | 'none';
  squeezeHistogram: number[];
  marketStructure: MarketStructure;
  sessionFilter: SessionFilter;
  volatilityThreshold: VolatilityThreshold;
}

export interface MarketStructure {
  lastSwingHigh: number;
  lastSwingLow: number;
  bosDetected: boolean;
  bosDirection: 'bullish' | 'bearish' | 'none';
  chochDetected: boolean;
  chochDirection: 'bullish' | 'bearish' | 'none';
  trendBias: 'bullish' | 'bearish' | 'neutral';
  structureConfirmed: boolean;
}

export interface SessionFilter {
  currentSession: 'asian' | 'london' | 'newyork' | 'overlap' | 'off_hours';
  isHighVolatilitySession: boolean;
  shouldTrade: boolean;
  minutesSinceOpen: number;
  isFirstHour: boolean;
  isLastHour: boolean;
  reason: string;
}

export interface VolatilityThreshold {
  currentATR: number;
  averageATR: number;
  atrMultiple: number;
  minSweepSize: number;
  isVolatilityExpanding: boolean;
  normalizedVolatility: number;
}

export interface MultiTimeframeAlignment {
  htfTrend: 'bullish' | 'bearish' | 'neutral';
  mtfTrend: 'bullish' | 'bearish' | 'neutral';
  ltfTrend: 'bullish' | 'bearish' | 'neutral';
  isAligned: boolean;
  alignmentScore: number;
  trendStrength: number;
  recommendation: 'long' | 'short' | 'wait';
}

export interface OrderBookData {
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  bidDepth: number;
  askDepth: number;
  imbalance: number;
  trueDelta: number;
  bidWall: number | null;
  askWall: number | null;
}

export interface EnhancedSignalScore {
  technicalScore: number;
  structureScore: number;
  volumeScore: number;
  timingScore: number;
  alignmentScore: number;
  totalScore: number;
  confidence: number;
  passesThreshold: boolean;
  requiredConfirmations: number;
  metConfirmations: number;
}

class AdvancedIndicatorEngine {
  
  calculateSuperSmoother(data: number[], period: number = 10): number[] {
    if (data.length < 3) return data.map(() => NaN);
    
    const a = Math.exp(-Math.sqrt(2) * Math.PI / period);
    const b = 2 * a * Math.cos(Math.sqrt(2) * Math.PI / period);
    const c2 = b;
    const c3 = -a * a;
    const c1 = 1 - c2 - c3;
    
    const ss: number[] = new Array(data.length).fill(NaN);
    ss[0] = data[0];
    ss[1] = data[1];
    
    for (let i = 2; i < data.length; i++) {
      ss[i] = c1 * (data[i] + data[i - 1]) / 2 + c2 * ss[i - 1] + c3 * ss[i - 2];
    }
    
    return ss;
  }

  calculateTSI(data: number[], longPeriod: number = 25, shortPeriod: number = 13, signalPeriod: number = 7): {
    tsi: number[];
    signal: number[];
    histogram: number[];
  } {
    if (data.length < longPeriod + shortPeriod + 2) {
      return {
        tsi: data.map(() => NaN),
        signal: data.map(() => NaN),
        histogram: data.map(() => NaN)
      };
    }
    
    const momentum: number[] = [NaN];
    for (let i = 1; i < data.length; i++) {
      momentum.push(data[i] - data[i - 1]);
    }
    
    const absMomentum = momentum.map(m => isNaN(m) ? NaN : Math.abs(m));
    
    const smoothMom1 = this.calculateEMA(momentum, longPeriod);
    const smoothMom2 = this.calculateEMA(smoothMom1, shortPeriod);
    
    const smoothAbsMom1 = this.calculateEMA(absMomentum, longPeriod);
    const smoothAbsMom2 = this.calculateEMA(smoothAbsMom1, shortPeriod);
    
    const tsi: number[] = new Array(data.length).fill(NaN);
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(smoothMom2[i]) && !isNaN(smoothAbsMom2[i]) && smoothAbsMom2[i] !== 0) {
        tsi[i] = 100 * (smoothMom2[i] / smoothAbsMom2[i]);
      }
    }
    
    const signal = this.calculateEMA(tsi, signalPeriod);
    const histogram = tsi.map((t, i) => isNaN(t) || isNaN(signal[i]) ? NaN : t - signal[i]);
    
    return { tsi, signal, histogram };
  }

  calculateAdaptiveRSI(data: number[], period: number = 14, smoothPeriod: number = 5): number[] {
    if (data.length < period + smoothPeriod) return data.map(() => NaN);
    
    const gains: number[] = [0];
    const losses: number[] = [0];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    const volatility = this.calculateVolatility(data, period);
    const adaptiveRsi: number[] = new Array(data.length).fill(NaN);
    
    for (let i = period; i < data.length; i++) {
      const vol = volatility[i] || 1;
      const adaptivePeriod = Math.max(5, Math.min(28, Math.round(period * (1 + vol))));
      
      let avgGain = 0;
      let avgLoss = 0;
      const start = Math.max(1, i - adaptivePeriod + 1);
      const count = i - start + 1;
      
      for (let j = start; j <= i; j++) {
        avgGain += gains[j];
        avgLoss += losses[j];
      }
      avgGain /= count;
      avgLoss /= count;
      
      if (avgLoss === 0) {
        adaptiveRsi[i] = 100;
      } else {
        const rs = avgGain / avgLoss;
        adaptiveRsi[i] = 100 - (100 / (1 + rs));
      }
    }
    
    return this.calculateEMA(adaptiveRsi, smoothPeriod);
  }

  private calculateVolatility(data: number[], period: number): number[] {
    const vol: number[] = new Array(data.length).fill(0);
    
    for (let i = period; i < data.length; i++) {
      let sum = 0;
      let mean = 0;
      for (let j = i - period + 1; j <= i; j++) {
        mean += data[j];
      }
      mean /= period;
      
      for (let j = i - period + 1; j <= i; j++) {
        sum += Math.pow(data[j] - mean, 2);
      }
      vol[i] = Math.sqrt(sum / period) / mean;
    }
    
    return vol;
  }

  calculateSqueezeDetector(candles: Candle[], bbPeriod: number = 20, kcPeriod: number = 20, bbMult: number = 2, kcMult: number = 1.5): {
    squeezeOn: boolean;
    squeezeFiring: 'long' | 'short' | 'none';
    histogram: number[];
    momentum: number[];
  } {
    if (candles.length < Math.max(bbPeriod, kcPeriod) + 10) {
      return { squeezeOn: false, squeezeFiring: 'none', histogram: [], momentum: [] };
    }
    
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    
    const sma = this.calculateSMA(closes, bbPeriod);
    const stdDev = this.calculateStdDev(closes, bbPeriod);
    
    const bbUpper = sma.map((s, i) => s + bbMult * stdDev[i]);
    const bbLower = sma.map((s, i) => s - bbMult * stdDev[i]);
    
    const tr = this.calculateTR(candles);
    const atr = this.calculateEMA(tr, kcPeriod);
    const kcMiddle = this.calculateEMA(closes, kcPeriod);
    const kcUpper = kcMiddle.map((k, i) => k + kcMult * atr[i]);
    const kcLower = kcMiddle.map((k, i) => k - kcMult * atr[i]);
    
    const lastIdx = candles.length - 1;
    const squeezeOn = bbLower[lastIdx] > kcLower[lastIdx] && bbUpper[lastIdx] < kcUpper[lastIdx];
    
    const highest = this.calculateHighest(highs, kcPeriod);
    const lowest = this.calculateLowest(lows, kcPeriod);
    const midline = highest.map((h, i) => (h + lowest[i]) / 2);
    const avgMid = midline.map((m, i) => (m + kcMiddle[i]) / 2);
    
    const momentum = closes.map((c, i) => c - avgMid[i]);
    const histogram = this.linearRegression(momentum, kcPeriod);
    
    let squeezeFiring: 'long' | 'short' | 'none' = 'none';
    if (histogram.length >= 2) {
      const curr = histogram[histogram.length - 1];
      const prev = histogram[histogram.length - 2];
      if (curr > 0 && curr > prev) squeezeFiring = 'long';
      else if (curr < 0 && curr < prev) squeezeFiring = 'short';
    }
    
    return { squeezeOn, squeezeFiring, histogram, momentum };
  }

  private linearRegression(data: number[], period: number): number[] {
    const result: number[] = new Array(data.length).fill(NaN);
    
    for (let i = period - 1; i < data.length; i++) {
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let j = 0; j < period; j++) {
        const x = j;
        const y = data[i - period + 1 + j];
        if (isNaN(y)) continue;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
      }
      const n = period;
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      result[i] = intercept + slope * (period - 1);
    }
    
    return result;
  }

  detectMarketStructure(candles: Candle[], lookback: number = 20): MarketStructure {
    if (candles.length < lookback * 2) {
      return {
        lastSwingHigh: 0,
        lastSwingLow: 0,
        bosDetected: false,
        bosDirection: 'none',
        chochDetected: false,
        chochDirection: 'none',
        trendBias: 'neutral',
        structureConfirmed: false
      };
    }
    
    const swingHighs: { index: number; price: number }[] = [];
    const swingLows: { index: number; price: number }[] = [];
    
    for (let i = 2; i < candles.length - 2; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      
      if (high > candles[i - 1].high && high > candles[i - 2].high &&
          high > candles[i + 1].high && high > candles[i + 2].high) {
        swingHighs.push({ index: i, price: high });
      }
      
      if (low < candles[i - 1].low && low < candles[i - 2].low &&
          low < candles[i + 1].low && low < candles[i + 2].low) {
        swingLows.push({ index: i, price: low });
      }
    }
    
    const recentHighs = swingHighs.slice(-3);
    const recentLows = swingLows.slice(-3);
    
    const lastSwingHigh = recentHighs.length > 0 ? recentHighs[recentHighs.length - 1].price : candles[candles.length - 1].high;
    const lastSwingLow = recentLows.length > 0 ? recentLows[recentLows.length - 1].price : candles[candles.length - 1].low;
    
    let bosDetected = false;
    let bosDirection: 'bullish' | 'bearish' | 'none' = 'none';
    let chochDetected = false;
    let chochDirection: 'bullish' | 'bearish' | 'none' = 'none';
    
    const currentClose = candles[candles.length - 1].close;
    const prevClose = candles[candles.length - 2].close;
    
    if (recentHighs.length >= 2) {
      const prevHigh = recentHighs[recentHighs.length - 2].price;
      if (currentClose > prevHigh && prevClose <= prevHigh) {
        bosDetected = true;
        bosDirection = 'bullish';
      }
    }
    
    if (recentLows.length >= 2) {
      const prevLow = recentLows[recentLows.length - 2].price;
      if (currentClose < prevLow && prevClose >= prevLow) {
        bosDetected = true;
        bosDirection = 'bearish';
      }
    }
    
    let higherHighs = 0, lowerLows = 0;
    for (let i = 1; i < recentHighs.length; i++) {
      if (recentHighs[i].price > recentHighs[i - 1].price) higherHighs++;
    }
    for (let i = 1; i < recentLows.length; i++) {
      if (recentLows[i].price < recentLows[i - 1].price) lowerLows++;
    }
    
    let trendBias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (higherHighs >= 1 && recentLows.length >= 2 && 
        recentLows[recentLows.length - 1].price > recentLows[recentLows.length - 2].price) {
      trendBias = 'bullish';
    } else if (lowerLows >= 1 && recentHighs.length >= 2 &&
               recentHighs[recentHighs.length - 1].price < recentHighs[recentHighs.length - 2].price) {
      trendBias = 'bearish';
    }
    
    if (bosDetected && bosDirection !== 'none') {
      if ((trendBias === 'bearish' && bosDirection === 'bullish') ||
          (trendBias === 'bullish' && bosDirection === 'bearish')) {
        chochDetected = true;
        chochDirection = bosDirection;
      }
    }
    
    const structureConfirmed = bosDetected || (trendBias !== 'neutral');
    
    return {
      lastSwingHigh,
      lastSwingLow,
      bosDetected,
      bosDirection,
      chochDetected,
      chochDirection,
      trendBias,
      structureConfirmed
    };
  }

  calculateSessionFilter(timestamp?: number): SessionFilter {
    const now = timestamp ? new Date(timestamp) : new Date();
    const utcHour = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const dayOfWeek = now.getUTCDay();
    
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let currentSession: 'asian' | 'london' | 'newyork' | 'overlap' | 'off_hours';
    let isHighVolatilitySession = false;
    
    if (utcHour >= 0 && utcHour < 8) {
      currentSession = 'asian';
      isHighVolatilitySession = utcHour >= 1 && utcHour <= 6;
    } else if (utcHour >= 8 && utcHour < 12) {
      currentSession = 'london';
      isHighVolatilitySession = true;
    } else if (utcHour >= 12 && utcHour < 17) {
      currentSession = 'overlap';
      isHighVolatilitySession = true;
    } else if (utcHour >= 17 && utcHour < 21) {
      currentSession = 'newyork';
      isHighVolatilitySession = utcHour < 20;
    } else {
      currentSession = 'off_hours';
      isHighVolatilitySession = false;
    }
    
    const nyOpen = 14;
    const minutesSinceOpen = (utcHour >= nyOpen) 
      ? (utcHour - nyOpen) * 60 + utcMinutes 
      : 0;
    
    const isFirstHour = minutesSinceOpen > 0 && minutesSinceOpen <= 60;
    const isLastHour = utcHour >= 20 && utcHour < 21;
    
    let shouldTrade = true;
    let reason = 'Trading session active';
    
    if (isWeekend) {
      shouldTrade = false;
      reason = 'Weekend - markets closed';
    } else if (currentSession === 'off_hours') {
      shouldTrade = false;
      reason = 'Off-hours - low liquidity';
    } else if (isFirstHour) {
      reason = 'First hour of NY session - increased volatility';
    } else if (isLastHour) {
      reason = 'Last hour - reduced position sizing recommended';
    }
    
    return {
      currentSession,
      isHighVolatilitySession,
      shouldTrade,
      minutesSinceOpen,
      isFirstHour,
      isLastHour,
      reason
    };
  }

  calculateVolatilityThreshold(candles: Candle[], period: number = 14): VolatilityThreshold {
    if (candles.length < period * 2) {
      return {
        currentATR: 0,
        averageATR: 0,
        atrMultiple: 1,
        minSweepSize: 0,
        isVolatilityExpanding: false,
        normalizedVolatility: 1
      };
    }
    
    const tr = this.calculateTR(candles);
    const atr = this.calculateEMA(tr, period);
    
    const currentATR = atr[atr.length - 1] || 0;
    
    const atrValues = atr.filter(a => !isNaN(a) && a > 0);
    const averageATR = atrValues.length > 0 
      ? atrValues.reduce((a, b) => a + b, 0) / atrValues.length 
      : currentATR;
    
    const atrMultiple = averageATR > 0 ? currentATR / averageATR : 1;
    
    const minSweepSize = currentATR * 0.5;
    
    const recentATRs = atr.slice(-5).filter(a => !isNaN(a));
    const isVolatilityExpanding = recentATRs.length >= 2 && 
      recentATRs[recentATRs.length - 1] > recentATRs[0] * 1.1;
    
    const lastPrice = candles[candles.length - 1].close;
    const normalizedVolatility = lastPrice > 0 ? (currentATR / lastPrice) * 100 : 0;
    
    return {
      currentATR,
      averageATR,
      atrMultiple,
      minSweepSize,
      isVolatilityExpanding,
      normalizedVolatility
    };
  }

  calculateMultiTimeframeAlignment(
    ltfCandles: Candle[],
    mtfCandles: Candle[],
    htfCandles: Candle[]
  ): MultiTimeframeAlignment {
    const ltfTrend = this.detectTrendDirection(ltfCandles);
    const mtfTrend = this.detectTrendDirection(mtfCandles);
    const htfTrend = this.detectTrendDirection(htfCandles);
    
    const trends = [ltfTrend, mtfTrend, htfTrend];
    const bullishCount = trends.filter(t => t === 'bullish').length;
    const bearishCount = trends.filter(t => t === 'bearish').length;
    
    const isAligned = bullishCount === 3 || bearishCount === 3;
    
    const alignmentScore = Math.max(bullishCount, bearishCount) / 3;
    
    const trendStrength = this.calculateTrendStrength(htfCandles);
    
    let recommendation: 'long' | 'short' | 'wait' = 'wait';
    if (isAligned) {
      recommendation = htfTrend === 'bullish' ? 'long' : 'short';
    } else if (alignmentScore >= 0.66) {
      recommendation = bullishCount > bearishCount ? 'long' : 'short';
    }
    
    return {
      htfTrend,
      mtfTrend,
      ltfTrend,
      isAligned,
      alignmentScore,
      trendStrength,
      recommendation
    };
  }

  private detectTrendDirection(candles: Candle[]): 'bullish' | 'bearish' | 'neutral' {
    if (candles.length < 20) return 'neutral';
    
    const closes = candles.map(c => c.close);
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    
    const lastIdx = candles.length - 1;
    const ema9Val = ema9[lastIdx];
    const ema21Val = ema21[lastIdx];
    const currentPrice = closes[lastIdx];
    
    if (ema9Val > ema21Val && currentPrice > ema9Val) {
      return 'bullish';
    } else if (ema9Val < ema21Val && currentPrice < ema9Val) {
      return 'bearish';
    }
    
    return 'neutral';
  }

  private calculateTrendStrength(candles: Candle[]): number {
    if (candles.length < 20) return 0;
    
    const closes = candles.map(c => c.close);
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    
    const lastIdx = candles.length - 1;
    const diff = Math.abs(ema9[lastIdx] - ema21[lastIdx]);
    const avgPrice = (ema9[lastIdx] + ema21[lastIdx]) / 2;
    
    return Math.min(100, (diff / avgPrice) * 1000);
  }

  calculateEnhancedSignalScore(
    technicalSignal: number,
    structureConfirmed: boolean,
    volumeConfirmed: boolean,
    sessionValid: boolean,
    mtfAligned: boolean,
    volatilityValid: boolean
  ): EnhancedSignalScore {
    const technicalScore = Math.min(100, Math.max(0, technicalSignal * 100));
    const structureScore = structureConfirmed ? 100 : 0;
    const volumeScore = volumeConfirmed ? 100 : 0;
    const timingScore = sessionValid ? 100 : 0;
    const alignmentScore = mtfAligned ? 100 : 0;
    
    const weights = {
      technical: 0.25,
      structure: 0.2,
      volume: 0.2,
      timing: 0.15,
      alignment: 0.2
    };
    
    const totalScore = 
      technicalScore * weights.technical +
      structureScore * weights.structure +
      volumeScore * weights.volume +
      timingScore * weights.timing +
      alignmentScore * weights.alignment;
    
    const confirmations = [
      technicalScore > 60,
      structureConfirmed,
      volumeConfirmed,
      sessionValid,
      mtfAligned,
      volatilityValid
    ];
    
    const metConfirmations = confirmations.filter(Boolean).length;
    const requiredConfirmations = 4;
    
    const confidence = totalScore / 100;
    const passesThreshold = metConfirmations >= requiredConfirmations && totalScore >= 65;
    
    return {
      technicalScore,
      structureScore,
      volumeScore,
      timingScore,
      alignmentScore,
      totalScore,
      confidence,
      passesThreshold,
      requiredConfirmations,
      metConfirmations
    };
  }

  private calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return data.map(() => NaN);
    const multiplier = 2 / (period + 1);
    const ema: number[] = new Array(data.length).fill(NaN);
    
    let sum = 0;
    let count = 0;
    for (let i = 0; i < period; i++) {
      if (!isNaN(data[i])) {
        sum += data[i];
        count++;
      }
    }
    if (count === 0) return ema;
    ema[period - 1] = sum / count;
    
    for (let i = period; i < data.length; i++) {
      const val = isNaN(data[i]) ? ema[i - 1] : data[i];
      ema[i] = (val - ema[i - 1]) * multiplier + ema[i - 1];
    }
    return ema;
  }

  private calculateSMA(data: number[], period: number): number[] {
    const sma: number[] = new Array(data.length).fill(NaN);
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      sma[i] = sum / period;
    }
    
    return sma;
  }

  private calculateStdDev(data: number[], period: number): number[] {
    const stdDev: number[] = new Array(data.length).fill(NaN);
    const sma = this.calculateSMA(data, period);
    
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += Math.pow(data[i - j] - sma[i], 2);
      }
      stdDev[i] = Math.sqrt(sum / period);
    }
    
    return stdDev;
  }

  private calculateTR(candles: Candle[]): number[] {
    const tr: number[] = [candles[0].high - candles[0].low];
    
    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;
      
      tr.push(Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      ));
    }
    
    return tr;
  }

  private calculateHighest(data: number[], period: number): number[] {
    const highest: number[] = new Array(data.length).fill(NaN);
    
    for (let i = period - 1; i < data.length; i++) {
      let max = data[i];
      for (let j = 1; j < period; j++) {
        if (data[i - j] > max) max = data[i - j];
      }
      highest[i] = max;
    }
    
    return highest;
  }

  private calculateLowest(data: number[], period: number): number[] {
    const lowest: number[] = new Array(data.length).fill(NaN);
    
    for (let i = period - 1; i < data.length; i++) {
      let min = data[i];
      for (let j = 1; j < period; j++) {
        if (data[i - j] < min) min = data[i - j];
      }
      lowest[i] = min;
    }
    
    return lowest;
  }

  generateFullAnalysis(candles: Candle[]): AdvancedIndicators {
    const closes = candles.map(c => c.close);
    
    const superSmoother = this.calculateSuperSmoother(closes, 10);
    const tsiData = this.calculateTSI(closes);
    const adaptiveRsi = this.calculateAdaptiveRSI(closes);
    const squeeze = this.calculateSqueezeDetector(candles);
    const marketStructure = this.detectMarketStructure(candles);
    const sessionFilter = this.calculateSessionFilter();
    const volatilityThreshold = this.calculateVolatilityThreshold(candles);
    
    return {
      superSmoother,
      tsi: tsiData.tsi,
      adaptiveRsi,
      squeezeOn: squeeze.squeezeOn,
      squeezeFiring: squeeze.squeezeFiring,
      squeezeHistogram: squeeze.histogram,
      marketStructure,
      sessionFilter,
      volatilityThreshold
    };
  }

  getLatestValues(candles: Candle[]): {
    superSmoother: number;
    tsi: number;
    tsiSignal: number;
    tsiHistogram: number;
    adaptiveRsi: number;
    squeezeOn: boolean;
    squeezeFiring: 'long' | 'short' | 'none';
    marketStructure: MarketStructure;
    sessionFilter: SessionFilter;
    volatilityThreshold: VolatilityThreshold;
  } {
    const closes = candles.map(c => c.close);
    const lastIdx = candles.length - 1;
    
    const superSmoother = this.calculateSuperSmoother(closes, 10);
    const tsiData = this.calculateTSI(closes);
    const adaptiveRsi = this.calculateAdaptiveRSI(closes);
    const squeeze = this.calculateSqueezeDetector(candles);
    const marketStructure = this.detectMarketStructure(candles);
    const sessionFilter = this.calculateSessionFilter();
    const volatilityThreshold = this.calculateVolatilityThreshold(candles);
    
    return {
      superSmoother: superSmoother[lastIdx] || 0,
      tsi: tsiData.tsi[lastIdx] || 0,
      tsiSignal: tsiData.signal[lastIdx] || 0,
      tsiHistogram: tsiData.histogram[lastIdx] || 0,
      adaptiveRsi: adaptiveRsi[lastIdx] || 50,
      squeezeOn: squeeze.squeezeOn,
      squeezeFiring: squeeze.squeezeFiring,
      marketStructure,
      sessionFilter,
      volatilityThreshold
    };
  }
}

export const advancedIndicatorEngine = new AdvancedIndicatorEngine();
