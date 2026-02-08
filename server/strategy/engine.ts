import {
  EngineInput, EngineOutput, EngineConfig, EntrySignal, ExitSignal, DebugState,
  Candle, CandlesByTimeframe, SessionInfo, MarketState, Structure, Liquidity, Zones,
  GateScore, DisplacementCandle, MismatchState, LossStreakState, SetupType, TrendDirection,
  DEFAULT_CONFIG
} from './types';
import { analyzeMarketState, getSessionInfo } from './marketState';
import { analyzeStructure } from './structure';
import { analyzeLiquidity } from './liquidity';
import { analyzeZones, detectDisplacementCandle } from './zones';
import { calculateGateScore, meetsThreshold } from './scoring';
import { findBestTrigger, buildEntrySignal } from './execution';
import { analyzeMismatchState, generateExitSignals, checkStaleSignal, checkLossStreakLock } from './exits';

export class StrategyEngineV2 {
  private config: EngineConfig;
  private activeSignal: EntrySignal | null = null;
  private entryBar: number = 0;
  private currentBar: number = 0;
  private lossStreak: LossStreakState = {
    currentStreak: 0,
    maxStreak: 3,
    isLocked: false,
    lockUntil: null
  };
  private logs: string[] = [];

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.lossStreak.maxStreak = this.config.maxLossStreak;
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
    if (this.logs.length > 100) this.logs.shift();
  }

  private getCandles(candlesByTf: CandlesByTimeframe, timeframe: string): Candle[] {
    return candlesByTf[timeframe] || [];
  }

  private detectSetups(
    mtfCandles: Candle[],
    ltfCandles: Candle[],
    marketState: MarketState,
    structure: Structure,
    liquidity: Liquidity,
    zones: Zones,
    sessionInfo: SessionInfo,
    currentPrice: number
  ): { setupType: SetupType, direction: TrendDirection, zone: any, displacement: DisplacementCandle | null }[] {
    const setups: any[] = [];
    
    const displacement = detectDisplacementCandle(mtfCandles, 20, 3, 1.5);
    
    if (zones.activeFVG && displacement) {
      const direction = zones.activeFVG.type as TrendDirection;
      const slowCorrection = structure.pullback?.isSlowCorrection;
      
      if (slowCorrection || (structure.pullback?.candleCount ?? 0) >= 3) {
        setups.push({
          setupType: direction === 'bullish' ? 'ICC_LONG' : 'ICC_SHORT',
          direction,
          zone: zones.activeFVG,
          displacement
        });
        this.log(`ICC setup detected: ${direction} FVG with displacement`);
      }
    }
    
    if (zones.activeWickZone) {
      const direction = zones.activeWickZone.type as TrendDirection;
      setups.push({
        setupType: direction === 'bullish' ? 'WICK_FILL_LONG' : 'WICK_FILL_SHORT',
        direction,
        zone: zones.activeWickZone,
        displacement: null
      });
      this.log(`Wick Fill setup detected: ${direction}`);
    }
    
    if (zones.orbBox?.breakoutConfirmed && zones.orbBox.breakoutDirection) {
      setups.push({
        setupType: zones.orbBox.breakoutDirection === 'bullish' ? 'ORB_LONG' : 'ORB_SHORT',
        direction: zones.orbBox.breakoutDirection,
        zone: zones.orbBox,
        displacement: null
      });
      this.log(`ORB setup detected: ${zones.orbBox.breakoutDirection}`);
    }
    
    return setups;
  }

  public process(input: EngineInput): EngineOutput {
    this.currentBar++;
    this.logs = [];
    
    const { symbol, time, candlesByTf, lastPrice, sessionInfo } = input;
    
    const htfCandles = this.getCandles(candlesByTf, this.config.htfTimeframe);
    const mtfCandles = this.getCandles(candlesByTf, this.config.mtfTimeframe);
    const ltfCandles = this.getCandles(candlesByTf, this.config.ltfTimeframe);
    
    this.log(`Processing ${symbol} at ${new Date(time).toISOString()}, price: ${lastPrice}`);
    
    if (mtfCandles.length < 30) {
      this.log(`Insufficient data: ${mtfCandles.length} MTF candles`);
      return this.buildOutput(null, [], mtfCandles, sessionInfo);
    }
    
    const marketState = analyzeMarketState(htfCandles, mtfCandles, ltfCandles);
    const structure = analyzeStructure(mtfCandles, 5);
    const liquidity = analyzeLiquidity(mtfCandles, structure.swingHighs, structure.swingLows);
    const zones = analyzeZones(mtfCandles, sessionInfo);
    
    this.log(`Market: ${marketState.htfBias} bias, ${marketState.volatilityRegime} volatility, ${marketState.marketPhase} phase`);
    this.log(`Structure: ${structure.currentTrend} trend, ${structure.recentBreaks.length} breaks`);
    this.log(`Liquidity: ${liquidity.levels.length} levels, ${liquidity.recentSweeps.length} sweeps`);
    this.log(`Zones: ${zones.fvgZones.length} FVG, ${zones.wickZones.length} wick, ORB: ${zones.orbBox ? 'yes' : 'no'}`);
    
    const exits: ExitSignal[] = [];
    
    if (this.activeSignal) {
      const recentSwingHigh = structure.swingHighs[structure.swingHighs.length - 1]?.price || lastPrice * 1.1;
      const recentSwingLow = structure.swingLows[structure.swingLows.length - 1]?.price || lastPrice * 0.9;
      
      const mismatch = analyzeMismatchState(
        mtfCandles,
        this.activeSignal.direction,
        zones.activeFVG,
        recentSwingHigh,
        recentSwingLow
      );
      
      const mismatchExits = generateExitSignals(mismatch, this.activeSignal, lastPrice);
      exits.push(...mismatchExits);
      
      const staleExit = checkStaleSignal(
        this.activeSignal,
        this.currentBar,
        this.entryBar,
        this.config.staleSignalBars
      );
      if (staleExit) exits.push(staleExit);
      
      if (exits.some(e => e.severity === 'exit')) {
        this.log(`Exit signal triggered: ${exits.find(e => e.severity === 'exit')?.reason}`);
        this.activeSignal = null;
      }
      
      return this.buildOutput(null, exits, mtfCandles, sessionInfo);
    }
    
    if (checkLossStreakLock(this.lossStreak)) {
      this.log(`Trading locked due to ${this.lossStreak.currentStreak} consecutive losses`);
      return this.buildOutput(null, [], mtfCandles, sessionInfo);
    }
    
    const setups = this.detectSetups(
      mtfCandles, ltfCandles, marketState, structure, liquidity, zones, sessionInfo, lastPrice
    );
    
    let bestSignal: EntrySignal | null = null;
    let bestScore = 0;
    
    for (const setup of setups) {
      const setupCategory = setup.setupType.includes('ICC') ? 'icc' :
                           setup.setupType.includes('WICK') ? 'wick' : 'orb';
      
      const gateScore = calculateGateScore(
        marketState,
        structure,
        liquidity,
        zones,
        setup.displacement,
        sessionInfo,
        setup.direction,
        setupCategory,
        lastPrice,
        this.config.gateWeights
      );
      
      this.log(`${setup.setupType} score: ${gateScore.normalized.toFixed(1)}/10`);
      
      const threshold = setupCategory === 'icc' ? this.config.iccThreshold :
                       setupCategory === 'wick' ? this.config.wickFillThreshold :
                       this.config.orbThreshold;
      
      if (!meetsThreshold(gateScore, setupCategory, { icc: this.config.iccThreshold, wick: this.config.wickFillThreshold, orb: this.config.orbThreshold })) {
        this.log(`${setup.setupType} below threshold (${threshold})`);
        continue;
      }
      
      const ltfStructure = analyzeStructure(ltfCandles, 3);
      
      const trigger = findBestTrigger(
        mtfCandles,
        ltfCandles,
        setup.zone,
        setup.direction,
        ltfStructure,
        this.config.requireCandleClose
      );
      
      if (!trigger) {
        this.log(`${setup.setupType}: no valid trigger found`);
        continue;
      }
      
      const sweep = liquidity.recentSweeps.find(s => s.direction === setup.direction) || null;
      
      const signal = buildEntrySignal(
        symbol,
        setup.setupType,
        setup.direction,
        trigger,
        setup.zone,
        setup.displacement,
        sweep,
        gateScore,
        mtfCandles,
        this.config.mtfTimeframe
      );
      
      if (gateScore.normalized > bestScore) {
        bestScore = gateScore.normalized;
        bestSignal = signal;
      }
    }
    
    if (bestSignal) {
      this.activeSignal = bestSignal;
      this.entryBar = this.currentBar;
      this.log(`Signal generated: ${bestSignal.setupType} at ${bestSignal.entryPrice.toFixed(4)}`);
    }
    
    return this.buildOutput(bestSignal, exits, mtfCandles, sessionInfo);
  }

  private buildOutput(
    signal: EntrySignal | null,
    exits: ExitSignal[],
    candles: Candle[],
    sessionInfo: SessionInfo
  ): EngineOutput {
    const htfCandles = candles;
    const mtfCandles = candles;
    const ltfCandles = candles;
    
    const marketState = analyzeMarketState(htfCandles, mtfCandles, ltfCandles);
    const structure = analyzeStructure(mtfCandles, 5);
    const liquidity = analyzeLiquidity(mtfCandles, structure.swingHighs, structure.swingLows);
    const zones = analyzeZones(mtfCandles, sessionInfo);
    const displacement = detectDisplacementCandle(mtfCandles, 20, 3, 1.5);
    
    const recentSwingHigh = structure.swingHighs[structure.swingHighs.length - 1]?.price || 0;
    const recentSwingLow = structure.swingLows[structure.swingLows.length - 1]?.price || 0;
    
    const mismatch = this.activeSignal 
      ? analyzeMismatchState(mtfCandles, this.activeSignal.direction, zones.activeFVG, recentSwingHigh, recentSwingLow)
      : { candleMismatch: false, macdMomentumLoss: false, fvgBreach: false, structureBreak: false, mismatchCount: 0, shouldExit: false };
    
    const stateDebug: DebugState = {
      marketState,
      structure,
      liquidity,
      zones,
      gateScore: signal?.gateScore || null,
      displacement,
      mismatch,
      lossStreak: this.lossStreak,
      activeSetup: this.activeSignal?.setupType || null,
      pendingTriggers: [],
      logs: [...this.logs]
    };
    
    return {
      signal,
      exits,
      stateDebug
    };
  }

  public updateConfig(config: Partial<EngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.lossStreak.maxStreak = this.config.maxLossStreak;
  }

  public getConfig(): EngineConfig {
    return { ...this.config };
  }

  public reset(): void {
    this.activeSignal = null;
    this.entryBar = 0;
    this.currentBar = 0;
    this.lossStreak = {
      currentStreak: 0,
      maxStreak: this.config.maxLossStreak,
      isLocked: false,
      lockUntil: null
    };
    this.logs = [];
  }

  public getActiveSignal(): EntrySignal | null {
    return this.activeSignal;
  }
}

export const strategyEngine = new StrategyEngineV2();
