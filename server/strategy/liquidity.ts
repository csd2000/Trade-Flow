import { Candle, LiquidityLevel, LiquiditySweep, Liquidity, SwingPoint, TrendDirection } from './types';

export function detectEqualLevels(swings: SwingPoint[], tolerance: number = 0.001): number[] {
  const equalLevels: number[] = [];
  
  for (let i = 0; i < swings.length; i++) {
    for (let j = i + 1; j < swings.length; j++) {
      const diff = Math.abs(swings[i].price - swings[j].price) / swings[i].price;
      if (diff <= tolerance) {
        const avgPrice = (swings[i].price + swings[j].price) / 2;
        if (!equalLevels.some(l => Math.abs(l - avgPrice) / avgPrice < tolerance)) {
          equalLevels.push(avgPrice);
        }
      }
    }
  }
  
  return equalLevels;
}

export function getPreviousDayHighLow(candles: Candle[]): { pdh: number, pdl: number } {
  if (candles.length < 2) return { pdh: 0, pdl: 0 };
  
  const now = candles[candles.length - 1].time;
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  
  const yesterday = new Date(todayStart);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = yesterday.getTime();
  
  const yesterdayCandles = candles.filter(c => 
    c.time >= yesterdayStart && c.time < todayStart
  );
  
  if (yesterdayCandles.length === 0) {
    const lookback = Math.min(candles.length, 100);
    const recent = candles.slice(-lookback, -1);
    return {
      pdh: Math.max(...recent.map(c => c.high)),
      pdl: Math.min(...recent.map(c => c.low))
    };
  }
  
  return {
    pdh: Math.max(...yesterdayCandles.map(c => c.high)),
    pdl: Math.min(...yesterdayCandles.map(c => c.low))
  };
}

export function getSessionHighLow(candles: Candle[]): { high: number, low: number } {
  if (candles.length === 0) return { high: 0, low: 0 };
  
  const now = candles[candles.length - 1].time;
  const date = new Date(now);
  const utcHour = date.getUTCHours();
  
  let sessionStart: number;
  if (utcHour >= 13) {
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(13, 30, 0, 0);
    sessionStart = sessionDate.getTime();
  } else if (utcHour >= 8) {
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(8, 0, 0, 0);
    sessionStart = sessionDate.getTime();
  } else {
    const sessionDate = new Date(date);
    sessionDate.setUTCHours(0, 0, 0, 0);
    sessionStart = sessionDate.getTime();
  }
  
  const sessionCandles = candles.filter(c => c.time >= sessionStart);
  
  if (sessionCandles.length === 0) {
    return {
      high: candles[candles.length - 1].high,
      low: candles[candles.length - 1].low
    };
  }
  
  return {
    high: Math.max(...sessionCandles.map(c => c.high)),
    low: Math.min(...sessionCandles.map(c => c.low))
  };
}

export function buildLiquidityLevels(
  candles: Candle[],
  swingHighs: SwingPoint[],
  swingLows: SwingPoint[]
): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];
  const currentPrice = candles[candles.length - 1]?.close || 0;
  
  const { pdh, pdl } = getPreviousDayHighLow(candles);
  const { high: sessionHigh, low: sessionLow } = getSessionHighLow(candles);
  
  if (pdh > 0) {
    levels.push({
      type: 'pdh',
      price: pdh,
      strength: 2,
      touched: currentPrice >= pdh * 0.998,
      swept: false,
      reclaimed: false
    });
  }
  
  if (pdl > 0) {
    levels.push({
      type: 'pdl',
      price: pdl,
      strength: 2,
      touched: currentPrice <= pdl * 1.002,
      swept: false,
      reclaimed: false
    });
  }
  
  levels.push({
    type: 'session_high',
    price: sessionHigh,
    strength: 1.5,
    touched: currentPrice >= sessionHigh * 0.999,
    swept: false,
    reclaimed: false
  });
  
  levels.push({
    type: 'session_low',
    price: sessionLow,
    strength: 1.5,
    touched: currentPrice <= sessionLow * 1.001,
    swept: false,
    reclaimed: false
  });
  
  const equalHighs = detectEqualLevels(swingHighs, 0.002);
  const equalLows = detectEqualLevels(swingLows, 0.002);
  
  equalHighs.forEach(price => {
    levels.push({
      type: 'equal_highs',
      price,
      strength: 1.5,
      touched: currentPrice >= price * 0.999,
      swept: false,
      reclaimed: false
    });
  });
  
  equalLows.forEach(price => {
    levels.push({
      type: 'equal_lows',
      price,
      strength: 1.5,
      touched: currentPrice <= price * 1.001,
      swept: false,
      reclaimed: false
    });
  });
  
  const recentSwingHighs = swingHighs.slice(-3);
  const recentSwingLows = swingLows.slice(-3);
  
  recentSwingHighs.forEach(swing => {
    if (!levels.some(l => Math.abs(l.price - swing.price) / swing.price < 0.002)) {
      levels.push({
        type: 'swing_high',
        price: swing.price,
        strength: swing.strength,
        touched: currentPrice >= swing.price * 0.999,
        swept: false,
        reclaimed: false
      });
    }
  });
  
  recentSwingLows.forEach(swing => {
    if (!levels.some(l => Math.abs(l.price - swing.price) / swing.price < 0.002)) {
      levels.push({
        type: 'swing_low',
        price: swing.price,
        strength: swing.strength,
        touched: currentPrice <= swing.price * 1.001,
        swept: false,
        reclaimed: false
      });
    }
  });
  
  return levels;
}

export function detectLiquiditySweeps(
  candles: Candle[],
  levels: LiquidityLevel[],
  lookback: number = 10
): LiquiditySweep[] {
  const sweeps: LiquiditySweep[] = [];
  const recent = candles.slice(-lookback);
  
  for (const level of levels) {
    const isHighLevel = ['pdh', 'session_high', 'equal_highs', 'swing_high'].includes(level.type);
    const isLowLevel = ['pdl', 'session_low', 'equal_lows', 'swing_low'].includes(level.type);
    
    for (let i = 0; i < recent.length - 1; i++) {
      const candle = recent[i];
      const nextCandle = recent[i + 1];
      
      if (isHighLevel) {
        const wickedAbove = candle.high > level.price && candle.close < level.price;
        const reclaimed = nextCandle.close < level.price && nextCandle.close > candle.low;
        
        if (wickedAbove && reclaimed) {
          level.swept = true;
          level.reclaimed = true;
          level.sweepTime = candle.time;
          
          sweeps.push({
            level,
            sweepPrice: candle.high,
            reclaimPrice: nextCandle.close,
            direction: 'bearish',
            quality: level.strength * (1 + (candle.high - level.price) / level.price * 100),
            time: candle.time
          });
        }
      }
      
      if (isLowLevel) {
        const wickedBelow = candle.low < level.price && candle.close > level.price;
        const reclaimed = nextCandle.close > level.price && nextCandle.close < candle.high;
        
        if (wickedBelow && reclaimed) {
          level.swept = true;
          level.reclaimed = true;
          level.sweepTime = candle.time;
          
          sweeps.push({
            level,
            sweepPrice: candle.low,
            reclaimPrice: nextCandle.close,
            direction: 'bullish',
            quality: level.strength * (1 + (level.price - candle.low) / level.price * 100),
            time: candle.time
          });
        }
      }
    }
  }
  
  return sweeps.sort((a, b) => b.time - a.time);
}

export function analyzeLiquidity(
  candles: Candle[],
  swingHighs: SwingPoint[],
  swingLows: SwingPoint[]
): Liquidity {
  const { pdh, pdl } = getPreviousDayHighLow(candles);
  const { high: sessionHigh, low: sessionLow } = getSessionHighLow(candles);
  
  const levels = buildLiquidityLevels(candles, swingHighs, swingLows);
  const recentSweeps = detectLiquiditySweeps(candles, levels, 20);
  
  const equalHighs = detectEqualLevels(swingHighs, 0.002);
  const equalLows = detectEqualLevels(swingLows, 0.002);
  
  return {
    levels,
    recentSweeps,
    pdh,
    pdl,
    sessionHigh,
    sessionLow,
    equalHighs,
    equalLows
  };
}
