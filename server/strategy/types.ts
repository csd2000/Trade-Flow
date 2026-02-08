export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandlesByTimeframe {
  '1h'?: Candle[];
  '15m'?: Candle[];
  '5m'?: Candle[];
  '3m'?: Candle[];
  '1m'?: Candle[];
  [key: string]: Candle[] | undefined;
}

export interface SessionInfo {
  name: 'asia' | 'london' | 'new_york' | 'overlap' | 'off_hours';
  isOpen: boolean;
  minutesSinceOpen: number;
  isORBWindow: boolean;
  isLunchDead: boolean;
}

export interface EngineInput {
  symbol: string;
  time: number;
  candlesByTf: CandlesByTimeframe;
  lastPrice: number;
  sessionInfo: SessionInfo;
}

export interface EngineConfig {
  htfTimeframe: string;
  mtfTimeframe: string;
  ltfTimeframe: string;
  requireCandleClose: boolean;
  iccThreshold: number;
  wickFillThreshold: number;
  orbThreshold: number;
  gateWeights: GateWeights;
  riskPerTrade: number;
  maxLossStreak: number;
  staleSignalBars: number;
}

export interface GateWeights {
  htfBias: number;
  liquiditySweep: number;
  displacementQuality: number;
  zoneQuality: number;
  volatilityRegime: number;
  sessionContext: number;
  proximityFilter: number;
}

export type TrendDirection = 'bullish' | 'bearish' | 'neutral';
export type VolatilityRegime = 'expansion' | 'contraction' | 'normal';
export type MarketPhase = 'trending' | 'ranging' | 'transitioning';

export interface MarketState {
  htfBias: TrendDirection;
  mtfBias: TrendDirection;
  ltfBias: TrendDirection;
  volatilityRegime: VolatilityRegime;
  marketPhase: MarketPhase;
  atr: number;
  avgRange: number;
  avgBody: number;
  isExpansionAfterContraction: boolean;
}

export interface SwingPoint {
  type: 'high' | 'low';
  price: number;
  index: number;
  time: number;
  strength: number;
}

export interface StructureBreak {
  type: 'BOS' | 'CHOCH';
  direction: TrendDirection;
  level: number;
  index: number;
  time: number;
}

export interface PullbackClassification {
  type: 'shallow' | 'deep' | 'extended';
  depth: number;
  candleCount: number;
  isSlowCorrection: boolean;
  avgRangeRatio: number;
  avgBodyRatio: number;
}

export interface Structure {
  swingHighs: SwingPoint[];
  swingLows: SwingPoint[];
  recentBreaks: StructureBreak[];
  currentTrend: TrendDirection;
  lastBOS: StructureBreak | null;
  lastCHOCH: StructureBreak | null;
  pullback: PullbackClassification | null;
}

export interface LiquidityLevel {
  type: 'equal_highs' | 'equal_lows' | 'pdh' | 'pdl' | 'session_high' | 'session_low' | 'swing_high' | 'swing_low';
  price: number;
  strength: number;
  touched: boolean;
  swept: boolean;
  reclaimed: boolean;
  sweepTime?: number;
}

export interface LiquiditySweep {
  level: LiquidityLevel;
  sweepPrice: number;
  reclaimPrice: number;
  direction: TrendDirection;
  quality: number;
  time: number;
}

export interface Liquidity {
  levels: LiquidityLevel[];
  recentSweeps: LiquiditySweep[];
  pdh: number;
  pdl: number;
  sessionHigh: number;
  sessionLow: number;
  equalHighs: number[];
  equalLows: number[];
}

export interface FVGZone {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  midpoint: number;
  creationIndex: number;
  creationTime: number;
  displacementQuality: number;
  mitigated: boolean;
  mitigationLevel: number;
  touchCount: number;
  isFirstTouch: boolean;
}

export interface WickZone {
  type: 'bullish' | 'bearish';
  zoneHigh: number;
  zoneLow: number;
  wickExtreme: number;
  wickRatio: number;
  bodyEdge: number;
  creationIndex: number;
  mitigated: boolean;
  touchCount: number;
}

export interface ORBBox {
  high: number;
  low: number;
  rangeSize: number;
  midpoint: number;
  breakoutDirection: TrendDirection | null;
  breakoutConfirmed: boolean;
  breakoutPrice: number | null;
  retestComplete: boolean;
}

export interface Zones {
  fvgZones: FVGZone[];
  wickZones: WickZone[];
  orbBox: ORBBox | null;
  activeFVG: FVGZone | null;
  activeWickZone: WickZone | null;
}

export interface GateScore {
  htfBias: number;
  liquiditySweep: number;
  displacementQuality: number;
  zoneQuality: number;
  volatilityRegime: number;
  sessionContext: number;
  proximityFilter: number;
  total: number;
  maxPossible: number;
  normalized: number;
}

export interface DisplacementCandle {
  candle: Candle;
  index: number;
  bodyMultiplier: number;
  rangeMultiplier: number;
  closeLocation: number;
  direction: TrendDirection;
  quality: number;
}

export type SetupType = 'ICC_LONG' | 'ICC_SHORT' | 'WICK_FILL_LONG' | 'WICK_FILL_SHORT' | 'ORB_LONG' | 'ORB_SHORT';

export type EntryTriggerType = 
  | 'tap_reject'
  | 'reclaim_hold'
  | 'ltf_bos'
  | 'ltf_choch'
  | 'candle_close'
  | 'orb_breakout';

export interface EntryTrigger {
  type: EntryTriggerType;
  price: number;
  time: number;
  confidence: number;
  intrabar: boolean;
}

export interface EntrySignal {
  setupType: SetupType;
  direction: TrendDirection;
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  riskRewardRatio: number;
  gateScore: GateScore;
  trigger: EntryTrigger;
  zone: FVGZone | WickZone | ORBBox | null;
  displacement: DisplacementCandle | null;
  sweep: LiquiditySweep | null;
  reasoning: string[];
  timestamp: number;
  symbol: string;
  timeframe: string;
}

export type ExitReason = 
  | 'candle_mismatch'
  | 'macd_loss'
  | 'fvg_breach'
  | 'structure_break'
  | 'stale_signal'
  | 'target_hit'
  | 'stop_hit'
  | 'manual';

export interface ExitSignal {
  reason: ExitReason;
  severity: 'warning' | 'exit';
  price: number;
  description: string;
  timestamp: number;
}

export interface MismatchState {
  candleMismatch: boolean;
  macdMomentumLoss: boolean;
  fvgBreach: boolean;
  structureBreak: boolean;
  mismatchCount: number;
  shouldExit: boolean;
}

export interface LossStreakState {
  currentStreak: number;
  maxStreak: number;
  isLocked: boolean;
  lockUntil: number | null;
}

export interface DebugState {
  marketState: MarketState;
  structure: Structure;
  liquidity: Liquidity;
  zones: Zones;
  gateScore: GateScore | null;
  displacement: DisplacementCandle | null;
  mismatch: MismatchState;
  lossStreak: LossStreakState;
  activeSetup: SetupType | null;
  pendingTriggers: EntryTrigger[];
  logs: string[];
}

export interface EngineOutput {
  signal: EntrySignal | null;
  exits: ExitSignal[];
  stateDebug: DebugState;
}

export const DEFAULT_CONFIG: EngineConfig = {
  htfTimeframe: '1h',
  mtfTimeframe: '15m',
  ltfTimeframe: '1m',
  requireCandleClose: false,
  iccThreshold: 6,
  wickFillThreshold: 5,
  orbThreshold: 5,
  gateWeights: {
    htfBias: 2,
    liquiditySweep: 2,
    displacementQuality: 2,
    zoneQuality: 1.5,
    volatilityRegime: 1,
    sessionContext: 1,
    proximityFilter: 0.5
  },
  riskPerTrade: 0.01,
  maxLossStreak: 3,
  staleSignalBars: 10
};
