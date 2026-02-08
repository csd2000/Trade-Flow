import { Candle, FVGZone, WickZone, ORBBox, Zones, TrendDirection, DisplacementCandle, SessionInfo } from './types';
import { calculateRollingAvgBody, calculateRollingAvgRange } from './marketState';

export function detectDisplacementCandle(
  candles: Candle[],
  lookback: number = 20,
  bodyMultiplierThreshold: number = 3,
  rangeMultiplierThreshold: number = 1.5
): DisplacementCandle | null {
  if (candles.length < lookback + 1) return null;
  
  const baselineCandles = candles.slice(-lookback - 1, -1);
  const avgBody = calculateRollingAvgBody(baselineCandles, lookback);
  const avgRange = calculateRollingAvgRange(baselineCandles, lookback);
  
  if (avgBody === 0 || avgRange === 0) return null;
  
  for (let i = candles.length - 1; i >= candles.length - 5 && i >= 0; i--) {
    const candle = candles[i];
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    
    const bodyMultiplier = body / avgBody;
    const rangeMultiplier = range / avgRange;
    
    if (bodyMultiplier >= bodyMultiplierThreshold && rangeMultiplier >= rangeMultiplierThreshold) {
      const isBullish = candle.close > candle.open;
      const closeLocation = (candle.close - candle.low) / range;
      
      const bullishCloseQuality = isBullish && closeLocation >= 0.8;
      const bearishCloseQuality = !isBullish && closeLocation <= 0.2;
      
      if (bullishCloseQuality || bearishCloseQuality) {
        const quality = (bodyMultiplier / bodyMultiplierThreshold + 
                        rangeMultiplier / rangeMultiplierThreshold + 
                        (bullishCloseQuality ? closeLocation : 1 - closeLocation)) / 3;
        
        return {
          candle,
          index: i,
          bodyMultiplier,
          rangeMultiplier,
          closeLocation,
          direction: isBullish ? 'bullish' : 'bearish',
          quality: Math.min(1, quality)
        };
      }
    }
  }
  
  return null;
}

export function detectFVGZones(candles: Candle[], maxZones: number = 5): FVGZone[] {
  const zones: FVGZone[] = [];
  
  if (candles.length < 5) return zones;
  
  const avgBody = calculateRollingAvgBody(candles.slice(-50), 30);
  const avgRange = calculateRollingAvgRange(candles.slice(-50), 30);
  
  for (let i = 2; i < candles.length; i++) {
    const candle1 = candles[i - 2];
    const candle2 = candles[i - 1];
    const candle3 = candles[i];
    
    const body2 = Math.abs(candle2.close - candle2.open);
    const isBullishDisplacement = candle2.close > candle2.open && body2 >= avgBody * 2;
    const isBearishDisplacement = candle2.close < candle2.open && body2 >= avgBody * 2;
    
    if (isBullishDisplacement && candle3.low > candle1.high) {
      const gapSize = candle3.low - candle1.high;
      if (gapSize >= avgRange * 0.3) {
        zones.push({
          type: 'bullish',
          high: candle3.low,
          low: candle1.high,
          midpoint: (candle3.low + candle1.high) / 2,
          creationIndex: i - 1,
          creationTime: candle2.time,
          displacementQuality: Math.min(1, body2 / (avgBody * 3)),
          mitigated: false,
          mitigationLevel: 0,
          touchCount: 0,
          isFirstTouch: true
        });
      }
    }
    
    if (isBearishDisplacement && candle3.high < candle1.low) {
      const gapSize = candle1.low - candle3.high;
      if (gapSize >= avgRange * 0.3) {
        zones.push({
          type: 'bearish',
          high: candle1.low,
          low: candle3.high,
          midpoint: (candle1.low + candle3.high) / 2,
          creationIndex: i - 1,
          creationTime: candle2.time,
          displacementQuality: Math.min(1, body2 / (avgBody * 3)),
          mitigated: false,
          mitigationLevel: 0,
          touchCount: 0,
          isFirstTouch: true
        });
      }
    }
  }
  
  const currentPrice = candles[candles.length - 1].close;
  for (const zone of zones) {
    if (zone.type === 'bullish') {
      if (currentPrice < zone.high && currentPrice > zone.low) {
        zone.touchCount++;
        zone.mitigationLevel = (zone.high - currentPrice) / (zone.high - zone.low);
      }
      if (currentPrice < zone.low) {
        zone.mitigated = true;
        zone.isFirstTouch = false;
      }
    } else {
      if (currentPrice > zone.low && currentPrice < zone.high) {
        zone.touchCount++;
        zone.mitigationLevel = (currentPrice - zone.low) / (zone.high - zone.low);
      }
      if (currentPrice > zone.high) {
        zone.mitigated = true;
        zone.isFirstTouch = false;
      }
    }
  }
  
  return zones
    .filter(z => !z.mitigated)
    .sort((a, b) => Math.abs(currentPrice - a.midpoint) - Math.abs(currentPrice - b.midpoint))
    .slice(0, maxZones);
}

export function detectWickZones(candles: Candle[], maxZones: number = 5): WickZone[] {
  const zones: WickZone[] = [];
  
  if (candles.length < 10) return zones;
  
  for (let i = candles.length - 1; i >= Math.max(0, candles.length - 30); i--) {
    const candle = candles[i];
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    
    if (range === 0) continue;
    
    const upperWick = candle.high - Math.max(candle.open, candle.close);
    const lowerWick = Math.min(candle.open, candle.close) - candle.low;
    
    const upperWickRatio = upperWick / range;
    const lowerWickRatio = lowerWick / range;
    
    if (lowerWickRatio >= 0.5) {
      zones.push({
        type: 'bullish',
        zoneHigh: Math.min(candle.open, candle.close),
        zoneLow: candle.low,
        wickExtreme: candle.low,
        wickRatio: lowerWickRatio,
        bodyEdge: Math.min(candle.open, candle.close),
        creationIndex: i,
        mitigated: false,
        touchCount: 0
      });
    }
    
    if (upperWickRatio >= 0.5) {
      zones.push({
        type: 'bearish',
        zoneHigh: candle.high,
        zoneLow: Math.max(candle.open, candle.close),
        wickExtreme: candle.high,
        wickRatio: upperWickRatio,
        bodyEdge: Math.max(candle.open, candle.close),
        creationIndex: i,
        mitigated: false,
        touchCount: 0
      });
    }
  }
  
  const currentPrice = candles[candles.length - 1].close;
  for (const zone of zones) {
    if (zone.type === 'bullish' && currentPrice < zone.zoneLow) {
      zone.mitigated = true;
    }
    if (zone.type === 'bearish' && currentPrice > zone.zoneHigh) {
      zone.mitigated = true;
    }
  }
  
  return zones
    .filter(z => !z.mitigated)
    .sort((a, b) => b.wickRatio - a.wickRatio)
    .slice(0, maxZones);
}

export function detectORBBox(candles: Candle[], sessionInfo: SessionInfo): ORBBox | null {
  if (!sessionInfo.isOpen) return null;
  
  const now = candles[candles.length - 1]?.time || Date.now();
  const date = new Date(now);
  
  let orbStart: number;
  if (sessionInfo.name === 'new_york' || sessionInfo.name === 'overlap') {
    const orbDate = new Date(date);
    orbDate.setUTCHours(13, 30, 0, 0);
    orbStart = orbDate.getTime();
  } else if (sessionInfo.name === 'london') {
    const orbDate = new Date(date);
    orbDate.setUTCHours(8, 0, 0, 0);
    orbStart = orbDate.getTime();
  } else {
    return null;
  }
  
  const orbEnd = orbStart + 30 * 60 * 1000;
  
  const orbCandles = candles.filter(c => c.time >= orbStart && c.time < orbEnd);
  
  if (orbCandles.length < 2) return null;
  
  const high = Math.max(...orbCandles.map(c => c.high));
  const low = Math.min(...orbCandles.map(c => c.low));
  const rangeSize = high - low;
  
  const currentPrice = candles[candles.length - 1].close;
  const currentTime = candles[candles.length - 1].time;
  
  let breakoutDirection: TrendDirection | null = null;
  let breakoutConfirmed = false;
  let breakoutPrice: number | null = null;
  let retestComplete = false;
  
  if (currentTime > orbEnd) {
    const postORBCandles = candles.filter(c => c.time >= orbEnd);
    
    for (const candle of postORBCandles) {
      if (candle.close > high && !breakoutDirection) {
        breakoutDirection = 'bullish';
        breakoutPrice = candle.close;
        breakoutConfirmed = true;
      } else if (candle.close < low && !breakoutDirection) {
        breakoutDirection = 'bearish';
        breakoutPrice = candle.close;
        breakoutConfirmed = true;
      }
      
      if (breakoutDirection === 'bullish' && candle.low <= high && candle.close > high) {
        retestComplete = true;
      } else if (breakoutDirection === 'bearish' && candle.high >= low && candle.close < low) {
        retestComplete = true;
      }
    }
  }
  
  return {
    high,
    low,
    rangeSize,
    midpoint: (high + low) / 2,
    breakoutDirection,
    breakoutConfirmed,
    breakoutPrice,
    retestComplete
  };
}

export function analyzeZones(candles: Candle[], sessionInfo: SessionInfo): Zones {
  const fvgZones = detectFVGZones(candles, 5);
  const wickZones = detectWickZones(candles, 5);
  const orbBox = detectORBBox(candles, sessionInfo);
  
  const currentPrice = candles[candles.length - 1]?.close || 0;
  
  const activeFVG = fvgZones.find(z => 
    !z.mitigated && 
    z.isFirstTouch && 
    currentPrice >= z.low && 
    currentPrice <= z.high
  ) || null;
  
  const activeWickZone = wickZones.find(z => 
    !z.mitigated && 
    ((z.type === 'bullish' && currentPrice >= z.zoneLow && currentPrice <= z.zoneHigh) ||
     (z.type === 'bearish' && currentPrice >= z.zoneLow && currentPrice <= z.zoneHigh))
  ) || null;
  
  return {
    fvgZones,
    wickZones,
    orbBox,
    activeFVG,
    activeWickZone
  };
}
