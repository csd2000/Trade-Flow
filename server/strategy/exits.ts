import { 
  Candle, ExitSignal, ExitReason, MismatchState, LossStreakState, 
  TrendDirection, FVGZone, EntrySignal 
} from './types';

export function detectCandleMismatch(
  candles: Candle[],
  direction: TrendDirection
): boolean {
  if (candles.length < 2) return false;
  
  const current = candles[candles.length - 1];
  const isBullish = current.close > current.open;
  
  if (direction === 'bullish' && !isBullish) {
    const body = Math.abs(current.close - current.open);
    const range = current.high - current.low;
    const bodyRatio = range > 0 ? body / range : 0;
    
    if (bodyRatio >= 0.6) return true;
  }
  
  if (direction === 'bearish' && isBullish) {
    const body = Math.abs(current.close - current.open);
    const range = current.high - current.low;
    const bodyRatio = range > 0 ? body / range : 0;
    
    if (bodyRatio >= 0.6) return true;
  }
  
  return false;
}

export function calculateMACD(closes: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macdLine: number, signalLine: number, histogram: number } {
  if (closes.length < slowPeriod + signalPeriod) {
    return { macdLine: 0, signalLine: 0, histogram: 0 };
  }
  
  const ema = (data: number[], period: number): number[] => {
    const multiplier = 2 / (period + 1);
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push((data[i] - result[i - 1]) * multiplier + result[i - 1]);
    }
    return result;
  };
  
  const fastEMA = ema(closes, fastPeriod);
  const slowEMA = ema(closes, slowPeriod);
  
  const macdValues: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdValues.push(fastEMA[i] - slowEMA[i]);
  }
  
  const signalEMA = ema(macdValues, signalPeriod);
  
  const macdLine = macdValues[macdValues.length - 1];
  const signalLine = signalEMA[signalEMA.length - 1];
  const histogram = macdLine - signalLine;
  
  return { macdLine, signalLine, histogram };
}

export function detectMACDMomentumLoss(
  candles: Candle[],
  direction: TrendDirection
): boolean {
  if (candles.length < 30) return false;
  
  const closes = candles.map(c => c.close);
  const current = calculateMACD(closes);
  const previous = calculateMACD(closes.slice(0, -1));
  
  if (direction === 'bullish') {
    const decreasingHistogram = current.histogram < previous.histogram;
    const histogramNegative = current.histogram < 0;
    const crossedBelow = previous.macdLine > previous.signalLine && 
                         current.macdLine < current.signalLine;
    
    return (decreasingHistogram && histogramNegative) || crossedBelow;
  }
  
  if (direction === 'bearish') {
    const increasingHistogram = current.histogram > previous.histogram;
    const histogramPositive = current.histogram > 0;
    const crossedAbove = previous.macdLine < previous.signalLine && 
                         current.macdLine > current.signalLine;
    
    return (increasingHistogram && histogramPositive) || crossedAbove;
  }
  
  return false;
}

export function detectFVGBreach(
  candles: Candle[],
  fvg: FVGZone | null,
  direction: TrendDirection
): boolean {
  if (!fvg || candles.length < 1) return false;
  
  const current = candles[candles.length - 1];
  
  if (direction === 'bullish' && fvg.type === 'bullish') {
    return current.close < fvg.low;
  }
  
  if (direction === 'bearish' && fvg.type === 'bearish') {
    return current.close > fvg.high;
  }
  
  return false;
}

export function detectStructureBreakAgainst(
  candles: Candle[],
  direction: TrendDirection,
  recentSwingHigh: number,
  recentSwingLow: number
): boolean {
  if (candles.length < 1) return false;
  
  const current = candles[candles.length - 1];
  
  if (direction === 'bullish' && current.close < recentSwingLow) {
    return true;
  }
  
  if (direction === 'bearish' && current.close > recentSwingHigh) {
    return true;
  }
  
  return false;
}

export function analyzeMismatchState(
  candles: Candle[],
  direction: TrendDirection,
  fvg: FVGZone | null,
  recentSwingHigh: number,
  recentSwingLow: number
): MismatchState {
  const candleMismatch = detectCandleMismatch(candles, direction);
  const macdMomentumLoss = detectMACDMomentumLoss(candles, direction);
  const fvgBreach = detectFVGBreach(candles, fvg, direction);
  const structureBreak = detectStructureBreakAgainst(candles, direction, recentSwingHigh, recentSwingLow);
  
  let mismatchCount = 0;
  if (candleMismatch) mismatchCount++;
  if (macdMomentumLoss) mismatchCount++;
  if (fvgBreach) mismatchCount++;
  if (structureBreak) mismatchCount++;
  
  const shouldExit = structureBreak || fvgBreach || mismatchCount >= 2;
  
  return {
    candleMismatch,
    macdMomentumLoss,
    fvgBreach,
    structureBreak,
    mismatchCount,
    shouldExit
  };
}

export function generateExitSignals(
  mismatchState: MismatchState,
  entrySignal: EntrySignal | null,
  currentPrice: number
): ExitSignal[] {
  const exits: ExitSignal[] = [];
  const now = Date.now();
  
  if (!entrySignal) return exits;
  
  if (mismatchState.structureBreak) {
    exits.push({
      reason: 'structure_break',
      severity: 'exit',
      price: currentPrice,
      description: 'Structure break against position - immediate exit required',
      timestamp: now
    });
  }
  
  if (mismatchState.fvgBreach) {
    exits.push({
      reason: 'fvg_breach',
      severity: 'exit',
      price: currentPrice,
      description: 'Price breached FVG zone - trade invalidated',
      timestamp: now
    });
  }
  
  if (mismatchState.candleMismatch && !mismatchState.structureBreak && !mismatchState.fvgBreach) {
    exits.push({
      reason: 'candle_mismatch',
      severity: mismatchState.mismatchCount >= 2 ? 'exit' : 'warning',
      price: currentPrice,
      description: 'Candle color mismatch with trade direction',
      timestamp: now
    });
  }
  
  if (mismatchState.macdMomentumLoss && !mismatchState.structureBreak) {
    exits.push({
      reason: 'macd_loss',
      severity: mismatchState.mismatchCount >= 2 ? 'exit' : 'warning',
      price: currentPrice,
      description: 'MACD momentum decreasing against position',
      timestamp: now
    });
  }
  
  const direction = entrySignal.direction;
  if (direction === 'bullish' && currentPrice <= entrySignal.stopLoss) {
    exits.push({
      reason: 'stop_hit',
      severity: 'exit',
      price: currentPrice,
      description: 'Stop loss hit',
      timestamp: now
    });
  }
  
  if (direction === 'bearish' && currentPrice >= entrySignal.stopLoss) {
    exits.push({
      reason: 'stop_hit',
      severity: 'exit',
      price: currentPrice,
      description: 'Stop loss hit',
      timestamp: now
    });
  }
  
  if (direction === 'bullish' && currentPrice >= entrySignal.target1) {
    exits.push({
      reason: 'target_hit',
      severity: 'exit',
      price: currentPrice,
      description: `Target 1 reached at ${entrySignal.target1.toFixed(4)}`,
      timestamp: now
    });
  }
  
  if (direction === 'bearish' && currentPrice <= entrySignal.target1) {
    exits.push({
      reason: 'target_hit',
      severity: 'exit',
      price: currentPrice,
      description: `Target 1 reached at ${entrySignal.target1.toFixed(4)}`,
      timestamp: now
    });
  }
  
  return exits;
}

export function checkStaleSignal(
  entrySignal: EntrySignal | null,
  currentBar: number,
  entryBar: number,
  staleBars: number
): ExitSignal | null {
  if (!entrySignal) return null;
  
  const barsSinceEntry = currentBar - entryBar;
  
  if (barsSinceEntry >= staleBars) {
    return {
      reason: 'stale_signal',
      severity: 'exit',
      price: entrySignal.entryPrice,
      description: `Signal stale after ${staleBars} bars without progress`,
      timestamp: Date.now()
    };
  }
  
  return null;
}

export function updateLossStreak(
  current: LossStreakState,
  isLoss: boolean,
  maxStreak: number,
  lockDurationMs: number = 30 * 60 * 1000
): LossStreakState {
  if (isLoss) {
    const newStreak = current.currentStreak + 1;
    const isLocked = newStreak >= maxStreak;
    
    return {
      currentStreak: newStreak,
      maxStreak,
      isLocked,
      lockUntil: isLocked ? Date.now() + lockDurationMs : null
    };
  }
  
  return {
    currentStreak: 0,
    maxStreak,
    isLocked: false,
    lockUntil: null
  };
}

export function checkLossStreakLock(lossStreak: LossStreakState): boolean {
  if (!lossStreak.isLocked) return false;
  
  if (lossStreak.lockUntil && Date.now() >= lossStreak.lockUntil) {
    return false;
  }
  
  return true;
}
