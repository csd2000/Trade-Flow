import { Candle, SwingPoint, StructureBreak, Structure, TrendDirection, PullbackClassification } from './types';
import { calculateRollingAvgRange, calculateRollingAvgBody } from './marketState';

export function detectSwingPoints(candles: Candle[], lookback: number = 5): { highs: SwingPoint[], lows: SwingPoint[] } {
  const highs: SwingPoint[] = [];
  const lows: SwingPoint[] = [];
  
  if (candles.length < lookback * 2 + 1) return { highs, lows };
  
  for (let i = lookback; i < candles.length - lookback; i++) {
    const current = candles[i];
    let isSwingHigh = true;
    let isSwingLow = true;
    let strength = 0;
    
    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].high >= current.high || candles[i + j].high >= current.high) {
        isSwingHigh = false;
      }
      if (candles[i - j].low <= current.low || candles[i + j].low <= current.low) {
        isSwingLow = false;
      }
      
      if (candles[i - j].high < current.high) strength++;
      if (candles[i + j].high < current.high) strength++;
      if (candles[i - j].low > current.low) strength++;
      if (candles[i + j].low > current.low) strength++;
    }
    
    if (isSwingHigh) {
      highs.push({
        type: 'high',
        price: current.high,
        index: i,
        time: current.time,
        strength: strength / (lookback * 2)
      });
    }
    
    if (isSwingLow) {
      lows.push({
        type: 'low',
        price: current.low,
        index: i,
        time: current.time,
        strength: strength / (lookback * 2)
      });
    }
  }
  
  return { highs, lows };
}

export function detectStructureBreaks(
  candles: Candle[],
  swingHighs: SwingPoint[],
  swingLows: SwingPoint[],
  currentTrend: TrendDirection
): StructureBreak[] {
  const breaks: StructureBreak[] = [];
  
  if (candles.length < 3) return breaks;
  
  const recentCandles = candles.slice(-10);
  const lastSwingHigh = swingHighs[swingHighs.length - 1];
  const lastSwingLow = swingLows[swingLows.length - 1];
  const prevSwingHigh = swingHighs[swingHighs.length - 2];
  const prevSwingLow = swingLows[swingLows.length - 2];
  
  for (let i = 0; i < recentCandles.length; i++) {
    const candle = recentCandles[i];
    const candleIndex = candles.length - 10 + i;
    
    if (lastSwingHigh && candle.close > lastSwingHigh.price) {
      const breakType = currentTrend === 'bearish' ? 'CHOCH' : 'BOS';
      breaks.push({
        type: breakType,
        direction: 'bullish',
        level: lastSwingHigh.price,
        index: candleIndex,
        time: candle.time
      });
    }
    
    if (lastSwingLow && candle.close < lastSwingLow.price) {
      const breakType = currentTrend === 'bullish' ? 'CHOCH' : 'BOS';
      breaks.push({
        type: breakType,
        direction: 'bearish',
        level: lastSwingLow.price,
        index: candleIndex,
        time: candle.time
      });
    }
  }
  
  return breaks;
}

export function classifyPullback(
  candles: Candle[],
  swingHighs: SwingPoint[],
  swingLows: SwingPoint[],
  direction: TrendDirection
): PullbackClassification | null {
  if (candles.length < 10) return null;
  
  const recent = candles.slice(-20);
  const baselineAvgRange = calculateRollingAvgRange(candles.slice(-50), 30);
  const baselineAvgBody = calculateRollingAvgBody(candles.slice(-50), 30);
  
  if (baselineAvgRange === 0 || baselineAvgBody === 0) return null;
  
  let pullbackStart = -1;
  let pullbackEnd = recent.length - 1;
  
  if (direction === 'bullish') {
    for (let i = recent.length - 1; i >= 3; i--) {
      if (recent[i].close > recent[i - 1].close && 
          recent[i - 1].close > recent[i - 2].close) {
        pullbackEnd = i - 2;
        break;
      }
    }
    
    for (let i = pullbackEnd; i >= 0; i--) {
      if (recent[i].high > recent[pullbackEnd].high * 1.01) {
        pullbackStart = i;
        break;
      }
    }
  } else if (direction === 'bearish') {
    for (let i = recent.length - 1; i >= 3; i--) {
      if (recent[i].close < recent[i - 1].close && 
          recent[i - 1].close < recent[i - 2].close) {
        pullbackEnd = i - 2;
        break;
      }
    }
    
    for (let i = pullbackEnd; i >= 0; i--) {
      if (recent[i].low < recent[pullbackEnd].low * 0.99) {
        pullbackStart = i;
        break;
      }
    }
  }
  
  if (pullbackStart < 0 || pullbackEnd <= pullbackStart) return null;
  
  const pullbackCandles = recent.slice(pullbackStart, pullbackEnd + 1);
  const candleCount = pullbackCandles.length;
  
  const pullbackAvgRange = calculateRollingAvgRange(pullbackCandles, candleCount);
  const pullbackAvgBody = calculateRollingAvgBody(pullbackCandles, candleCount);
  
  const avgRangeRatio = pullbackAvgRange / baselineAvgRange;
  const avgBodyRatio = pullbackAvgBody / baselineAvgBody;
  
  const swingRange = direction === 'bullish' 
    ? (swingHighs[swingHighs.length - 1]?.price || 0) - (swingLows[swingLows.length - 2]?.price || 0)
    : (swingHighs[swingHighs.length - 2]?.price || 0) - (swingLows[swingLows.length - 1]?.price || 0);
  
  const pullbackRange = Math.max(...pullbackCandles.map(c => c.high)) - 
                        Math.min(...pullbackCandles.map(c => c.low));
  
  const depth = swingRange > 0 ? pullbackRange / swingRange : 0;
  
  const isSlowCorrection = candleCount >= 3 && 
                           avgRangeRatio <= 0.8 && 
                           avgBodyRatio <= 0.6;
  
  let type: PullbackClassification['type'] = 'shallow';
  if (depth > 0.618) type = 'extended';
  else if (depth > 0.382) type = 'deep';
  
  return {
    type,
    depth,
    candleCount,
    isSlowCorrection,
    avgRangeRatio,
    avgBodyRatio
  };
}

export function analyzeStructure(candles: Candle[], lookback: number = 5): Structure {
  const { highs, lows } = detectSwingPoints(candles, lookback);
  
  let currentTrend: TrendDirection = 'neutral';
  
  if (highs.length >= 2 && lows.length >= 2) {
    const lastHighs = highs.slice(-2);
    const lastLows = lows.slice(-2);
    
    const higherHighs = lastHighs[1].price > lastHighs[0].price;
    const higherLows = lastLows[1].price > lastLows[0].price;
    const lowerHighs = lastHighs[1].price < lastHighs[0].price;
    const lowerLows = lastLows[1].price < lastLows[0].price;
    
    if (higherHighs && higherLows) currentTrend = 'bullish';
    else if (lowerHighs && lowerLows) currentTrend = 'bearish';
  }
  
  const recentBreaks = detectStructureBreaks(candles, highs, lows, currentTrend);
  
  const lastBOS = recentBreaks.filter(b => b.type === 'BOS').slice(-1)[0] || null;
  const lastCHOCH = recentBreaks.filter(b => b.type === 'CHOCH').slice(-1)[0] || null;
  
  const pullback = classifyPullback(candles, highs, lows, currentTrend);
  
  return {
    swingHighs: highs,
    swingLows: lows,
    recentBreaks,
    currentTrend,
    lastBOS,
    lastCHOCH,
    pullback
  };
}
