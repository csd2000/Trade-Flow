/**
 * Technical Indicators Service
 * Calculates technical indicators for stock analysis
 */

import type { HistoricalBar } from './stock-data.service';

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHist: number;
  ma20: number;
  ma50: number;
  ma200: number;
  ema12: number;
  ema26: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  atr: number;
  adx: number;
  stochastic: number;
  volume: number;
  avgVolume: number;
}

/**
 * Calculate Simple Moving Average
 */
function sma(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
function ema(data: number[], period: number, previousEma?: number): number {
  if (data.length === 0) return 0;
  const current = data[data.length - 1];
  if (previousEma === undefined) {
    return sma(data, Math.min(period, data.length));
  }
  const multiplier = 2 / (period + 1);
  return (current - previousEma) * multiplier + previousEma;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50;
  
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  
  const avgGain = sma(gains.slice(-period), period);
  const avgLoss = sma(losses.slice(-period), period);
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
function calculateMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  if (closes.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  let ema12Val = sma(closes.slice(0, 12), 12);
  let ema26Val = sma(closes.slice(0, 26), 26);
  
  for (let i = 26; i < closes.length; i++) {
    ema12Val = ema([closes[i]], 12, ema12Val);
    ema26Val = ema([closes[i]], 26, ema26Val);
  }
  
  const macdLine = ema12Val - ema26Val;
  const signalLine = macdLine; // Simplified
  const histogram = macdLine - signalLine;
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: histogram,
  };
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollinger(closes: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} {
  const middle = sma(closes, period);
  const slice = closes.slice(-period);
  
  // Calculate standard deviation
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
  const sd = Math.sqrt(variance);
  
  return {
    upper: middle + (stdDev * sd),
    middle: middle,
    lower: middle - (stdDev * sd),
  };
}

/**
 * Calculate ATR (Average True Range)
 */
function calculateATR(bars: HistoricalBar[], period: number = 14): number {
  if (bars.length < 2) return 0;
  
  const trueRanges: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const high = bars[i].high;
    const low = bars[i].low;
    const prevClose = bars[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  return sma(trueRanges, Math.min(period, trueRanges.length));
}

/**
 * Calculate Stochastic Oscillator
 */
function calculateStochastic(bars: HistoricalBar[], period: number = 14): number {
  if (bars.length < period) return 50;
  
  const slice = bars.slice(-period);
  const currentClose = bars[bars.length - 1].close;
  const highestHigh = Math.max(...slice.map(b => b.high));
  const lowestLow = Math.min(...slice.map(b => b.low));
  
  if (highestHigh === lowestLow) return 50;
  return ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
}

/**
 * Calculate all technical indicators for a stock
 */
export function calculateIndicators(bars: HistoricalBar[]): TechnicalIndicators {
  if (bars.length === 0) {
    throw new Error('No historical data provided');
  }
  
  const closes = bars.map(b => b.close);
  const volumes = bars.map(b => b.volume);
  const currentBar = bars[bars.length - 1];
  
  const rsi = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes);
  const bollinger = calculateBollinger(closes, 20, 2);
  
  return {
    rsi,
    macd: macdData.macd,
    macdSignal: macdData.signal,
    macdHist: macdData.histogram,
    ma20: sma(closes, 20),
    ma50: sma(closes, 50),
    ma200: sma(closes, 200),
    ema12: ema(closes, 12),
    ema26: ema(closes, 26),
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    atr: calculateATR(bars, 14),
    adx: 0, // Simplified - would need full ADX calculation
    stochastic: calculateStochastic(bars, 14),
    volume: currentBar.volume,
    avgVolume: sma(volumes, 20),
  };
}
