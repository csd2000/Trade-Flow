import { 
  GateScore, GateWeights, MarketState, Structure, Liquidity, Zones, 
  DisplacementCandle, SessionInfo, TrendDirection, FVGZone, WickZone, ORBBox 
} from './types';

export function scoreHTFBias(
  marketState: MarketState,
  direction: TrendDirection,
  weight: number
): number {
  if (direction === 'neutral') return weight * 0.5;
  
  let score = 0;
  
  if (marketState.htfBias === direction) score += 0.6;
  if (marketState.mtfBias === direction) score += 0.3;
  if (marketState.ltfBias === direction) score += 0.1;
  
  return score * weight;
}

export function scoreLiquiditySweep(
  liquidity: Liquidity,
  direction: TrendDirection,
  weight: number
): number {
  const relevantSweeps = liquidity.recentSweeps.filter(s => s.direction === direction);
  
  if (relevantSweeps.length === 0) return 0;
  
  const bestSweep = relevantSweeps[0];
  const qualityScore = Math.min(1, bestSweep.quality / 3);
  
  const levelBoost = ['pdh', 'pdl', 'session_high', 'session_low'].includes(bestSweep.level.type) ? 0.2 : 0;
  
  return Math.min(weight, (qualityScore + levelBoost) * weight);
}

export function scoreDisplacementQuality(
  displacement: DisplacementCandle | null,
  weight: number
): number {
  if (!displacement) return 0;
  
  const bodyScore = Math.min(1, displacement.bodyMultiplier / 5);
  const rangeScore = Math.min(1, displacement.rangeMultiplier / 2.5);
  const closeScore = displacement.direction === 'bullish' 
    ? displacement.closeLocation 
    : 1 - displacement.closeLocation;
  
  const totalScore = (bodyScore * 0.4 + rangeScore * 0.3 + closeScore * 0.3);
  
  return totalScore * weight;
}

export function scoreZoneQuality(
  zone: FVGZone | WickZone | ORBBox | null,
  zoneType: 'fvg' | 'wick' | 'orb',
  weight: number
): number {
  if (!zone) return 0;
  
  let score = 0;
  
  if (zoneType === 'fvg') {
    const fvg = zone as FVGZone;
    score = fvg.displacementQuality * 0.5;
    if (fvg.isFirstTouch) score += 0.3;
    if (fvg.touchCount === 0) score += 0.2;
  } else if (zoneType === 'wick') {
    const wick = zone as WickZone;
    score = wick.wickRatio * 0.7;
    if (wick.touchCount === 0) score += 0.3;
  } else if (zoneType === 'orb') {
    const orb = zone as ORBBox;
    if (orb.breakoutConfirmed) score += 0.5;
    if (orb.retestComplete) score += 0.3;
    const rangeQuality = Math.min(1, orb.rangeSize / 0.005);
    score += rangeQuality * 0.2;
  }
  
  return Math.min(weight, score * weight);
}

export function scoreVolatilityRegime(
  marketState: MarketState,
  weight: number
): number {
  let score = 0;
  
  if (marketState.isExpansionAfterContraction) score = 1;
  else if (marketState.volatilityRegime === 'expansion') score = 0.7;
  else if (marketState.volatilityRegime === 'normal') score = 0.4;
  else score = 0.2;
  
  if (marketState.marketPhase === 'trending') score *= 1.1;
  else if (marketState.marketPhase === 'ranging') score *= 0.8;
  
  return Math.min(weight, score * weight);
}

export function scoreSessionContext(
  sessionInfo: SessionInfo,
  setupType: 'icc' | 'wick' | 'orb',
  weight: number
): number {
  let score = 0;
  
  if (sessionInfo.name === 'overlap') score = 1;
  else if (sessionInfo.name === 'new_york') score = 0.9;
  else if (sessionInfo.name === 'london') score = 0.8;
  else if (sessionInfo.name === 'asia') score = 0.5;
  else score = 0.3;
  
  if (setupType === 'orb') {
    if (sessionInfo.isORBWindow) score *= 1.2;
    else if (sessionInfo.minutesSinceOpen <= 60) score *= 0.9;
    else score *= 0.6;
  }
  
  if (sessionInfo.isLunchDead) {
    score *= 0.5;
  }
  
  return Math.min(weight, score * weight);
}

export function scoreProximityFilter(
  currentPrice: number,
  liquidity: Liquidity,
  direction: TrendDirection,
  weight: number
): number {
  const nearbyLevels = liquidity.levels.filter(level => {
    const distance = Math.abs(level.price - currentPrice) / currentPrice;
    return distance < 0.01;
  });
  
  if (nearbyLevels.length === 0) return weight;
  
  let penalty = 0;
  for (const level of nearbyLevels) {
    const distance = Math.abs(level.price - currentPrice) / currentPrice;
    const distancePenalty = (0.01 - distance) / 0.01;
    
    const isBlocking = (direction === 'bullish' && level.price > currentPrice && 
                        ['pdh', 'session_high', 'equal_highs', 'swing_high'].includes(level.type)) ||
                       (direction === 'bearish' && level.price < currentPrice && 
                        ['pdl', 'session_low', 'equal_lows', 'swing_low'].includes(level.type));
    
    if (isBlocking) {
      penalty += distancePenalty * level.strength * 0.3;
    }
  }
  
  return Math.max(0, weight * (1 - penalty));
}

export function calculateGateScore(
  marketState: MarketState,
  structure: Structure,
  liquidity: Liquidity,
  zones: Zones,
  displacement: DisplacementCandle | null,
  sessionInfo: SessionInfo,
  direction: TrendDirection,
  setupType: 'icc' | 'wick' | 'orb',
  currentPrice: number,
  weights: GateWeights
): GateScore {
  const zone = setupType === 'icc' ? zones.activeFVG :
               setupType === 'wick' ? zones.activeWickZone :
               zones.orbBox;
  
  const htfBias = scoreHTFBias(marketState, direction, weights.htfBias);
  const liquiditySweep = scoreLiquiditySweep(liquidity, direction, weights.liquiditySweep);
  const displacementQuality = scoreDisplacementQuality(displacement, weights.displacementQuality);
  const zoneType = setupType === 'icc' ? 'fvg' : setupType;
  const zoneQuality = scoreZoneQuality(zone, zoneType as 'fvg' | 'wick' | 'orb', weights.zoneQuality);
  const volatilityRegime = scoreVolatilityRegime(marketState, weights.volatilityRegime);
  const sessionContext = scoreSessionContext(sessionInfo, setupType, weights.sessionContext);
  const proximityFilter = scoreProximityFilter(currentPrice, liquidity, direction, weights.proximityFilter);
  
  const total = htfBias + liquiditySweep + displacementQuality + zoneQuality + 
                volatilityRegime + sessionContext + proximityFilter;
  
  const maxPossible = weights.htfBias + weights.liquiditySweep + weights.displacementQuality + 
                      weights.zoneQuality + weights.volatilityRegime + weights.sessionContext + 
                      weights.proximityFilter;
  
  return {
    htfBias,
    liquiditySweep,
    displacementQuality,
    zoneQuality,
    volatilityRegime,
    sessionContext,
    proximityFilter,
    total,
    maxPossible,
    normalized: maxPossible > 0 ? (total / maxPossible) * 10 : 0
  };
}

export function meetsThreshold(
  gateScore: GateScore,
  setupType: 'icc' | 'wick' | 'orb',
  thresholds: { icc: number, wick: number, orb: number }
): boolean {
  const threshold = setupType === 'icc' ? thresholds.icc :
                    setupType === 'wick' ? thresholds.wick :
                    thresholds.orb;
  
  return gateScore.normalized >= threshold;
}
