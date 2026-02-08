import { 
  Candle, EntrySignal, EntryTrigger, EntryTriggerType, SetupType, TrendDirection,
  FVGZone, WickZone, ORBBox, GateScore, DisplacementCandle, LiquiditySweep,
  Structure, MarketState, EngineConfig
} from './types';
import { calculateATR } from './marketState';

export function detectTapReject(
  candles: Candle[],
  zone: FVGZone | WickZone,
  direction: TrendDirection
): EntryTrigger | null {
  if (candles.length < 3) return null;
  
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  const zoneHigh = 'high' in zone ? zone.high : zone.zoneHigh;
  const zoneLow = 'low' in zone ? zone.low : zone.zoneLow;
  const zoneMid = (zoneHigh + zoneLow) / 2;
  
  if (direction === 'bullish') {
    const tappedZone = prev.low <= zoneHigh && prev.low >= zoneLow;
    const rejected = current.close > zoneMid && current.close > prev.close;
    const momentum = current.close > current.open;
    
    if (tappedZone && rejected && momentum) {
      return {
        type: 'tap_reject',
        price: current.close,
        time: current.time,
        confidence: 0.7,
        intrabar: true
      };
    }
  } else if (direction === 'bearish') {
    const tappedZone = prev.high >= zoneLow && prev.high <= zoneHigh;
    const rejected = current.close < zoneMid && current.close < prev.close;
    const momentum = current.close < current.open;
    
    if (tappedZone && rejected && momentum) {
      return {
        type: 'tap_reject',
        price: current.close,
        time: current.time,
        confidence: 0.7,
        intrabar: true
      };
    }
  }
  
  return null;
}

export function detectReclaimHold(
  candles: Candle[],
  level: number,
  direction: TrendDirection,
  holdBars: number = 3
): EntryTrigger | null {
  if (candles.length < holdBars + 2) return null;
  
  const recent = candles.slice(-(holdBars + 2));
  
  if (direction === 'bullish') {
    const crossedAbove = recent[0].close < level && recent[1].close > level;
    const heldAbove = recent.slice(2).every(c => c.close > level);
    
    if (crossedAbove && heldAbove) {
      return {
        type: 'reclaim_hold',
        price: recent[recent.length - 1].close,
        time: recent[recent.length - 1].time,
        confidence: 0.65,
        intrabar: false
      };
    }
  } else if (direction === 'bearish') {
    const crossedBelow = recent[0].close > level && recent[1].close < level;
    const heldBelow = recent.slice(2).every(c => c.close < level);
    
    if (crossedBelow && heldBelow) {
      return {
        type: 'reclaim_hold',
        price: recent[recent.length - 1].close,
        time: recent[recent.length - 1].time,
        confidence: 0.65,
        intrabar: false
      };
    }
  }
  
  return null;
}

export function detectLTFStructureBreak(
  structure: Structure,
  direction: TrendDirection
): EntryTrigger | null {
  const { lastBOS, lastCHOCH } = structure;
  
  if (lastCHOCH && lastCHOCH.direction === direction) {
    return {
      type: 'ltf_choch',
      price: lastCHOCH.level,
      time: lastCHOCH.time,
      confidence: 0.8,
      intrabar: true
    };
  }
  
  if (lastBOS && lastBOS.direction === direction) {
    return {
      type: 'ltf_bos',
      price: lastBOS.level,
      time: lastBOS.time,
      confidence: 0.6,
      intrabar: true
    };
  }
  
  return null;
}

export function detectORBBreakout(
  candles: Candle[],
  orbBox: ORBBox
): EntryTrigger | null {
  if (!orbBox.breakoutConfirmed || !orbBox.breakoutDirection) return null;
  
  const current = candles[candles.length - 1];
  
  return {
    type: 'orb_breakout',
    price: orbBox.breakoutPrice || current.close,
    time: current.time,
    confidence: orbBox.retestComplete ? 0.8 : 0.65,
    intrabar: !orbBox.retestComplete
  };
}

export function detectCandleCloseConfirmation(
  candles: Candle[],
  zone: FVGZone | WickZone,
  direction: TrendDirection
): EntryTrigger | null {
  if (candles.length < 2) return null;
  
  const current = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  const zoneHigh = 'high' in zone ? zone.high : zone.zoneHigh;
  const zoneLow = 'low' in zone ? zone.low : zone.zoneLow;
  
  if (direction === 'bullish') {
    const inZone = prev.low <= zoneHigh && prev.low >= zoneLow;
    const closedAbove = current.close > zoneHigh;
    const bullishClose = current.close > current.open;
    
    if (inZone && closedAbove && bullishClose) {
      return {
        type: 'candle_close',
        price: current.close,
        time: current.time,
        confidence: 0.75,
        intrabar: false
      };
    }
  } else if (direction === 'bearish') {
    const inZone = prev.high >= zoneLow && prev.high <= zoneHigh;
    const closedBelow = current.close < zoneLow;
    const bearishClose = current.close < current.open;
    
    if (inZone && closedBelow && bearishClose) {
      return {
        type: 'candle_close',
        price: current.close,
        time: current.time,
        confidence: 0.75,
        intrabar: false
      };
    }
  }
  
  return null;
}

export function findBestTrigger(
  candles: Candle[],
  ltfCandles: Candle[],
  zone: FVGZone | WickZone | ORBBox | null,
  direction: TrendDirection,
  structure: Structure,
  requireCandleClose: boolean
): EntryTrigger | null {
  const triggers: EntryTrigger[] = [];
  
  if (zone && 'breakoutConfirmed' in zone) {
    const orbTrigger = detectORBBreakout(candles, zone);
    if (orbTrigger) triggers.push(orbTrigger);
  } else if (zone) {
    const zoneTyped = zone as FVGZone | WickZone;
    
    const tapReject = detectTapReject(ltfCandles, zoneTyped, direction);
    if (tapReject) triggers.push(tapReject);
    
    const zoneMid = 'midpoint' in zoneTyped ? zoneTyped.midpoint : 
                    (zoneTyped.zoneHigh + zoneTyped.zoneLow) / 2;
    const reclaimHold = detectReclaimHold(ltfCandles, zoneMid, direction, 3);
    if (reclaimHold) triggers.push(reclaimHold);
    
    const structureBreak = detectLTFStructureBreak(structure, direction);
    if (structureBreak) triggers.push(structureBreak);
    
    const candleClose = detectCandleCloseConfirmation(candles, zoneTyped, direction);
    if (candleClose) triggers.push(candleClose);
  }
  
  if (triggers.length === 0) return null;
  
  if (requireCandleClose) {
    const closeOnlyTriggers = triggers.filter(t => !t.intrabar);
    if (closeOnlyTriggers.length > 0) {
      return closeOnlyTriggers.sort((a, b) => b.confidence - a.confidence)[0];
    }
  }
  
  return triggers.sort((a, b) => b.confidence - a.confidence)[0];
}

export function calculateTargets(
  entryPrice: number,
  stopLoss: number,
  direction: TrendDirection,
  atr: number
): { target1: number, target2: number, target3: number } {
  const risk = Math.abs(entryPrice - stopLoss);
  
  if (direction === 'bullish') {
    return {
      target1: entryPrice + risk * 1.5,
      target2: entryPrice + risk * 2.5,
      target3: entryPrice + risk * 4
    };
  } else {
    return {
      target1: entryPrice - risk * 1.5,
      target2: entryPrice - risk * 2.5,
      target3: entryPrice - risk * 4
    };
  }
}

export function calculateStopLoss(
  entryPrice: number,
  zone: FVGZone | WickZone | ORBBox | null,
  direction: TrendDirection,
  atr: number
): number {
  const buffer = atr * 0.3;
  
  if (!zone) {
    return direction === 'bullish' ? entryPrice - atr : entryPrice + atr;
  }
  
  if ('breakoutConfirmed' in zone) {
    return direction === 'bullish' ? zone.low - buffer : zone.high + buffer;
  }
  
  if ('low' in zone) {
    return direction === 'bullish' ? zone.low - buffer : zone.high + buffer;
  }
  
  return direction === 'bullish' ? zone.zoneLow - buffer : zone.zoneHigh + buffer;
}

export function buildEntrySignal(
  symbol: string,
  setupType: SetupType,
  direction: TrendDirection,
  trigger: EntryTrigger,
  zone: FVGZone | WickZone | ORBBox | null,
  displacement: DisplacementCandle | null,
  sweep: LiquiditySweep | null,
  gateScore: GateScore,
  candles: Candle[],
  timeframe: string
): EntrySignal {
  const atr = calculateATR(candles, 14);
  const entryPrice = trigger.price;
  const stopLoss = calculateStopLoss(entryPrice, zone, direction, atr);
  const { target1, target2, target3 } = calculateTargets(entryPrice, stopLoss, direction, atr);
  
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(target1 - entryPrice);
  const riskRewardRatio = risk > 0 ? reward / risk : 0;
  
  const reasoning: string[] = [];
  reasoning.push(`${setupType} detected with ${gateScore.normalized.toFixed(1)}/10 gate score`);
  reasoning.push(`Trigger: ${trigger.type} at ${trigger.price.toFixed(4)} (${(trigger.confidence * 100).toFixed(0)}% confidence)`);
  if (sweep) reasoning.push(`Liquidity sweep: ${sweep.level.type} at ${sweep.sweepPrice.toFixed(4)}`);
  if (displacement) reasoning.push(`Displacement: ${displacement.bodyMultiplier.toFixed(1)}x body, ${displacement.rangeMultiplier.toFixed(1)}x range`);
  reasoning.push(`R:R = 1:${riskRewardRatio.toFixed(2)}`);
  
  return {
    setupType,
    direction,
    entryPrice,
    stopLoss,
    target1,
    target2,
    target3,
    riskRewardRatio,
    gateScore,
    trigger,
    zone,
    displacement,
    sweep,
    reasoning,
    timestamp: Date.now(),
    symbol,
    timeframe
  };
}
