import { Candle, MarketState, TrendDirection, VolatilityRegime, MarketPhase, SessionInfo } from './types';

export function calculateATR(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 0;
  
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }
  
  const recentTRs = trs.slice(-period);
  return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
}

export function calculateRollingAvgBody(candles: Candle[], period: number = 20): number {
  const recent = candles.slice(-period);
  if (recent.length === 0) return 0;
  const bodies = recent.map(c => Math.abs(c.close - c.open));
  return bodies.reduce((a, b) => a + b, 0) / bodies.length;
}

export function calculateRollingAvgRange(candles: Candle[], period: number = 20): number {
  const recent = candles.slice(-period);
  if (recent.length === 0) return 0;
  const ranges = recent.map(c => c.high - c.low);
  return ranges.reduce((a, b) => a + b, 0) / ranges.length;
}

export function detectTrendDirection(candles: Candle[], lookback: number = 20): TrendDirection {
  if (candles.length < lookback) return 'neutral';
  
  const recent = candles.slice(-lookback);
  let higherHighs = 0;
  let lowerLows = 0;
  let higherLows = 0;
  let lowerHighs = 0;
  
  for (let i = 5; i < recent.length; i += 5) {
    const currentHigh = Math.max(...recent.slice(i - 5, i).map(c => c.high));
    const prevHigh = Math.max(...recent.slice(Math.max(0, i - 10), i - 5).map(c => c.high));
    const currentLow = Math.min(...recent.slice(i - 5, i).map(c => c.low));
    const prevLow = Math.min(...recent.slice(Math.max(0, i - 10), i - 5).map(c => c.low));
    
    if (currentHigh > prevHigh) higherHighs++;
    if (currentLow > prevLow) higherLows++;
    if (currentHigh < prevHigh) lowerHighs++;
    if (currentLow < prevLow) lowerLows++;
  }
  
  const bullishScore = higherHighs + higherLows;
  const bearishScore = lowerHighs + lowerLows;
  
  if (bullishScore > bearishScore + 1) return 'bullish';
  if (bearishScore > bullishScore + 1) return 'bearish';
  return 'neutral';
}

export function detectVolatilityRegime(candles: Candle[], shortPeriod: number = 5, longPeriod: number = 20): VolatilityRegime {
  if (candles.length < longPeriod) return 'normal';
  
  const shortATR = calculateATR(candles.slice(-shortPeriod - 1), shortPeriod);
  const longATR = calculateATR(candles, longPeriod);
  
  if (longATR === 0) return 'normal';
  
  const ratio = shortATR / longATR;
  
  if (ratio > 1.3) return 'expansion';
  if (ratio < 0.7) return 'contraction';
  return 'normal';
}

export function detectMarketPhase(candles: Candle[], lookback: number = 30): MarketPhase {
  if (candles.length < lookback) return 'ranging';
  
  const recent = candles.slice(-lookback);
  const closes = recent.map(c => c.close);
  
  const slope = calculateSlope(closes);
  const avgRange = calculateRollingAvgRange(recent, lookback);
  const priceRange = Math.max(...closes) - Math.min(...closes);
  
  const trendStrength = Math.abs(slope) / avgRange;
  const rangeRatio = priceRange / (avgRange * lookback);
  
  if (trendStrength > 0.5 && rangeRatio > 2) return 'trending';
  if (trendStrength < 0.2 && rangeRatio < 1.5) return 'ranging';
  return 'transitioning';
}

function calculateSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;
  
  return (n * sumXY - sumX * sumY) / denominator;
}

export function isExpansionAfterContraction(candles: Candle[], lookback: number = 10): boolean {
  if (candles.length < lookback + 5) return false;
  
  const priorCandles = candles.slice(-lookback - 5, -5);
  const recentCandles = candles.slice(-5);
  
  const priorRegime = detectVolatilityRegime(priorCandles, 3, 7);
  const currentRegime = detectVolatilityRegime(recentCandles, 2, 5);
  
  return priorRegime === 'contraction' && currentRegime === 'expansion';
}

export function getSessionInfo(time: number): SessionInfo {
  const date = new Date(time);
  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();
  const totalMinutes = utcHour * 60 + utcMinute;
  
  const asiaOpen = 0 * 60;
  const asiaClose = 8 * 60;
  const londonOpen = 8 * 60;
  const londonClose = 16 * 60;
  const nyOpen = 13 * 60 + 30;
  const nyClose = 20 * 60;
  const lunchStart = 16 * 60 + 30;
  const lunchEnd = 18 * 60;
  
  let name: SessionInfo['name'] = 'off_hours';
  let isOpen = false;
  let minutesSinceOpen = 0;
  
  if (totalMinutes >= nyOpen && totalMinutes < londonClose) {
    name = 'overlap';
    isOpen = true;
    minutesSinceOpen = totalMinutes - nyOpen;
  } else if (totalMinutes >= londonOpen && totalMinutes < nyOpen) {
    name = 'london';
    isOpen = true;
    minutesSinceOpen = totalMinutes - londonOpen;
  } else if (totalMinutes >= nyOpen && totalMinutes < nyClose) {
    name = 'new_york';
    isOpen = true;
    minutesSinceOpen = totalMinutes - nyOpen;
  } else if (totalMinutes >= asiaOpen && totalMinutes < asiaClose) {
    name = 'asia';
    isOpen = true;
    minutesSinceOpen = totalMinutes - asiaOpen;
  }
  
  const isORBWindow = isOpen && minutesSinceOpen <= 30;
  const isLunchDead = totalMinutes >= lunchStart && totalMinutes < lunchEnd;
  
  return { name, isOpen, minutesSinceOpen, isORBWindow, isLunchDead };
}

export function analyzeMarketState(
  htfCandles: Candle[],
  mtfCandles: Candle[],
  ltfCandles: Candle[]
): MarketState {
  const htfBias = detectTrendDirection(htfCandles, 20);
  const mtfBias = detectTrendDirection(mtfCandles, 20);
  const ltfBias = detectTrendDirection(ltfCandles, 20);
  
  const volatilityRegime = detectVolatilityRegime(mtfCandles, 5, 20);
  const marketPhase = detectMarketPhase(mtfCandles, 30);
  
  const atr = calculateATR(mtfCandles, 14);
  const avgRange = calculateRollingAvgRange(mtfCandles, 20);
  const avgBody = calculateRollingAvgBody(mtfCandles, 20);
  
  const expansionAfterContraction = isExpansionAfterContraction(mtfCandles, 10);
  
  return {
    htfBias,
    mtfBias,
    ltfBias,
    volatilityRegime,
    marketPhase,
    atr,
    avgRange,
    avgBody,
    isExpansionAfterContraction: expansionAfterContraction
  };
}
