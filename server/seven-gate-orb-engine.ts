import { Candle, LiquidityLevel } from './strategy/types';
import { getSECFlags, SECRiskFlags } from './sec-edgar-service';

export interface SimpleLiquiditySweep {
  timestamp: number;
  direction: 'up' | 'down';
  level: number;
  sweepHigh: number;
  sweepLow: number;
  reclaimed: boolean;
}

export interface Gate0NewsStatus {
  checked: boolean;
  checkTime: number;
  hasHighImpactNews: boolean;
  newsEvents: NewsEvent[];
  systemStatus: 'ACTIVE' | 'PAUSED' | 'RELEASED';
  releaseTime?: number;
  pauseReason?: string;
}

export interface NewsEvent {
  title: string;
  pubDate: string;
  source: string;
  category: string;
  keywords: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  isHighImpact: boolean;
  scheduledTime?: string;
}

export interface OpeningRangeBox {
  high: number;
  low: number;
  midpoint: number;
  range: number;
  captureTime: number;
  isComplete: boolean;
}

export interface LiquidityPool {
  level: number;
  type: 'BSL' | 'SSL';
  swept: boolean;
  sweepTime?: number;
  sweepCandle?: Candle;
}

export interface Gate3Validation {
  passed: boolean;
  breakoutCandle?: Candle;
  breakoutDirection: 'LONG' | 'SHORT' | null;
  bodyCloseOutside: boolean;
  antiTrapTriggered: boolean;
  powerBarDetected: boolean;
}

export interface Gate5Execution {
  passed: boolean;
  retestCandle?: Candle;
  rejectionType: 'WICK' | 'ENGULFING' | 'NONE';
  kissedLevel: number | null;
  confidenceScore: number;
  riskAllocation: 'STANDARD' | 'HIGH';
}

export interface Gate7Management {
  entryPrice: number;
  stopLoss: number;
  breakeven: number;
  target05SD: number;
  target10SD: number;
  standardDeviation: number;
  currentPnL: number;
  slMovedToBreakeven: boolean;
}

export interface SevenGateORBAnalysis {
  symbol: string;
  timestamp: number;
  gates: {
    gate0: Gate0NewsStatus;
    gate1_2: { openingRange: OpeningRangeBox; liquidityPools: LiquidityPool[]; sweeps: SimpleLiquiditySweep[] };
    gate3: Gate3Validation;
    gate4_5: Gate5Execution;
    gate6_7: Gate7Management | null;
  };
  secRisk?: SECRiskFlags;
  overallStatus: 'PAUSED' | 'WAITING_RANGE' | 'WAITING_BREAKOUT' | 'WAITING_RETEST' | 'ACTIVE_TRADE' | 'COMPLETE';
  signalType: 'EXECUTE' | 'WAIT' | 'PAUSED';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidenceScore: number;
  reasoning: string[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  timestamp: number;
  gate: string;
  action: string;
  details: Record<string, any>;
}

export interface TradingJournalEntry {
  id?: number;
  symbol: string;
  entryTime: number;
  exitTime?: number;
  entryPrice: number;
  exitPrice?: number;
  direction: 'LONG' | 'SHORT';
  stopLoss: number;
  target: number;
  confidenceScore: number;
  gateStatuses: Record<string, boolean>;
  pnl?: number;
  notes?: string;
}

const HIGH_IMPACT_KEYWORDS = [
  'fed', 'federal reserve', 'fomc', 'interest rate', 'rate decision',
  'nfp', 'non-farm payroll', 'employment', 'jobs report', 'unemployment',
  'cpi', 'inflation', 'ppi', 'gdp', 'retail sales',
  'powell', 'yellen', 'treasury', 'central bank',
  'crisis', 'recession', 'default', 'debt ceiling'
];

class SevenGateORBEngine {
  private gate0Cache: Map<string, Gate0NewsStatus> = new Map();
  private openingRanges: Map<string, OpeningRangeBox> = new Map();
  private activeSignals: Map<string, SevenGateORBAnalysis> = new Map();
  private journalEntries: TradingJournalEntry[] = [];
  private manualReleaseStatus: boolean = false;
  private releaseDate: string | null = null;

  async checkGate0NewsFilter(): Promise<Gate0NewsStatus> {
    this.checkAndResetDailyRelease();
    
    const now = new Date();
    const estOffset = -5 * 60;
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const estMinutes = utcMinutes + estOffset;
    const estHour = Math.floor(((estMinutes % 1440) + 1440) % 1440 / 60);
    
    const cacheKey = now.toISOString().split('T')[0];
    const cached = this.gate0Cache.get(cacheKey);
    
    if (cached && !this.manualReleaseStatus && cached.systemStatus !== 'RELEASED') {
      return cached;
    }

    if (this.manualReleaseStatus) {
      const releasedStatus: Gate0NewsStatus = {
        checked: true,
        checkTime: Date.now(),
        hasHighImpactNews: false,
        newsEvents: [],
        systemStatus: 'RELEASED',
        releaseTime: Date.now(),
        pauseReason: undefined
      };
      this.gate0Cache.set(cacheKey, releasedStatus);
      return releasedStatus;
    }

    try {
      const apiKey = process.env.NEWSDATA_API_KEY;
      if (!apiKey) {
        console.warn('NEWSDATA_API_KEY not configured');
        return this.createDefaultGate0Status(false);
      }

      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${apiKey}&country=us&category=business&language=en&q=USD OR economy OR federal reserve OR inflation`
      );

      if (!response.ok) {
        console.error('NewsData.io API error:', response.status);
        return this.createDefaultGate0Status(false);
      }

      const data = await response.json();
      const newsEvents: NewsEvent[] = (data.results || []).map((item: any) => {
        const isHighImpact = this.checkHighImpactNews(item.title, item.description);
        return {
          title: item.title || '',
          pubDate: item.pubDate || '',
          source: item.source_id || '',
          category: item.category?.[0] || 'business',
          keywords: item.keywords || [],
          sentiment: this.analyzeSentiment(item.title, item.description),
          isHighImpact
        };
      });

      const highImpactEvents = newsEvents.filter(e => e.isHighImpact);
      const estMin = estMinutes % 60;
      const shouldPause = highImpactEvents.length > 0 && this.isWithinCriticalWindow(estHour, estMin);

      const status: Gate0NewsStatus = {
        checked: true,
        checkTime: Date.now(),
        hasHighImpactNews: highImpactEvents.length > 0,
        newsEvents: newsEvents.slice(0, 10),
        systemStatus: shouldPause ? 'PAUSED' : 'ACTIVE',
        pauseReason: shouldPause 
          ? `High-impact USD news detected: ${highImpactEvents.map(e => e.title).slice(0, 2).join(', ')}`
          : undefined
      };

      this.gate0Cache.set(cacheKey, status);
      return status;
    } catch (error) {
      console.error('Gate 0 news check failed:', error);
      return this.createDefaultGate0Status(false);
    }
  }

  private checkHighImpactNews(title: string, description: string): boolean {
    const combined = `${title} ${description}`.toLowerCase();
    return HIGH_IMPACT_KEYWORDS.some(keyword => combined.includes(keyword));
  }

  private analyzeSentiment(title: string, description: string): 'positive' | 'negative' | 'neutral' {
    const combined = `${title} ${description}`.toLowerCase();
    const positiveWords = ['surge', 'rise', 'gain', 'bullish', 'strong', 'growth', 'rally'];
    const negativeWords = ['fall', 'drop', 'crash', 'bearish', 'weak', 'decline', 'crisis'];
    
    const positiveCount = positiveWords.filter(w => combined.includes(w)).length;
    const negativeCount = negativeWords.filter(w => combined.includes(w)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private isWithinCriticalWindow(estHour: number, estMinutes?: number): boolean {
    const totalMinutes = estMinutes !== undefined ? estHour * 60 + estMinutes : estHour * 60;
    const windowStart = 8 * 60 + 30;
    const windowEnd = 10 * 60 + 30;
    return totalMinutes >= windowStart && totalMinutes <= windowEnd;
  }

  private createDefaultGate0Status(paused: boolean): Gate0NewsStatus {
    return {
      checked: true,
      checkTime: Date.now(),
      hasHighImpactNews: false,
      newsEvents: [],
      systemStatus: paused ? 'PAUSED' : 'ACTIVE'
    };
  }

  releaseGate0(): Gate0NewsStatus {
    this.manualReleaseStatus = true;
    this.releaseDate = new Date().toISOString().split('T')[0];
    const cacheKey = this.releaseDate;
    const status: Gate0NewsStatus = {
      checked: true,
      checkTime: Date.now(),
      hasHighImpactNews: false,
      newsEvents: [],
      systemStatus: 'RELEASED',
      releaseTime: Date.now()
    };
    this.gate0Cache.set(cacheKey, status);
    return status;
  }
  
  private checkAndResetDailyRelease(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.releaseDate && this.releaseDate !== today) {
      this.manualReleaseStatus = false;
      this.releaseDate = null;
    }
  }

  captureOpeningRange(symbol: string, candles15m: Candle[]): OpeningRangeBox {
    const now = new Date();
    const estOffset = -5 * 60;
    const marketOpenEST = 9 * 60 + 30;
    const rangeEndEST = 9 * 60 + 45;
    
    const nowUtcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const nowEstMinutes = ((nowUtcMinutes + estOffset) % 1440 + 1440) % 1440;
    const isPastOpeningWindow = nowEstMinutes >= rangeEndEST;
    
    const openingCandles = candles15m.filter(c => {
      const candleDate = new Date(c.time);
      const candleUtcMinutes = candleDate.getUTCHours() * 60 + candleDate.getUTCMinutes();
      const candleEstMinutes = ((candleUtcMinutes + estOffset) % 1440 + 1440) % 1440;
      return candleEstMinutes >= marketOpenEST && candleEstMinutes < rangeEndEST;
    });

    if (openingCandles.length === 0) {
      const sessionCandles = candles15m.filter(c => {
        const candleDate = new Date(c.time);
        const candleUtcMinutes = candleDate.getUTCHours() * 60 + candleDate.getUTCMinutes();
        const candleEstMinutes = ((candleUtcMinutes + estOffset) % 1440 + 1440) % 1440;
        return candleEstMinutes >= marketOpenEST && candleEstMinutes < 16 * 60;
      });
      
      const fallbackCandles = sessionCandles.length > 0 ? sessionCandles.slice(0, 2) : 
                              candles15m.slice(-3);
      
      if (fallbackCandles.length === 0) {
        const range: OpeningRangeBox = {
          high: 0, low: 0, midpoint: 0, range: 0, captureTime: Date.now(), isComplete: false
        };
        this.openingRanges.set(symbol, range);
        return range;
      }
      
      const high = Math.max(...fallbackCandles.map(c => c.high));
      const low = Math.min(...fallbackCandles.map(c => c.low));
      
      const range: OpeningRangeBox = {
        high,
        low,
        midpoint: (high + low) / 2,
        range: high - low,
        captureTime: Date.now(),
        isComplete: isPastOpeningWindow
      };
      this.openingRanges.set(symbol, range);
      return range;
    }

    const high = Math.max(...openingCandles.map(c => c.high));
    const low = Math.min(...openingCandles.map(c => c.low));
    
    const range: OpeningRangeBox = {
      high,
      low,
      midpoint: (high + low) / 2,
      range: high - low,
      captureTime: Date.now(),
      isComplete: isPastOpeningWindow || openingCandles.length >= 1
    };

    this.openingRanges.set(symbol, range);
    return range;
  }

  detectLiquidityPools(openingRange: OpeningRangeBox): LiquidityPool[] {
    return [
      { level: openingRange.high, type: 'BSL', swept: false },
      { level: openingRange.low, type: 'SSL', swept: false }
    ];
  }

  detectLiquiditySweep(
    pools: LiquidityPool[], 
    candles: Candle[]
  ): { pools: LiquidityPool[]; sweeps: SimpleLiquiditySweep[] } {
    const sweeps: SimpleLiquiditySweep[] = [];
    const updatedPools = pools.map(pool => ({ ...pool }));

    for (let i = 1; i < candles.length; i++) {
      const candle = candles[i];
      
      for (const pool of updatedPools) {
        if (pool.swept) continue;

        if (pool.type === 'BSL') {
          if (candle.high > pool.level && candle.close < pool.level) {
            pool.swept = true;
            pool.sweepTime = candle.time;
            pool.sweepCandle = candle;
            sweeps.push({
              timestamp: candle.time,
              direction: 'up',
              level: pool.level,
              sweepHigh: candle.high,
              sweepLow: candle.low,
              reclaimed: true
            });
          }
        } else if (pool.type === 'SSL') {
          if (candle.low < pool.level && candle.close > pool.level) {
            pool.swept = true;
            pool.sweepTime = candle.time;
            pool.sweepCandle = candle;
            sweeps.push({
              timestamp: candle.time,
              direction: 'down',
              level: pool.level,
              sweepHigh: candle.high,
              sweepLow: candle.low,
              reclaimed: true
            });
          }
        }
      }
    }

    return { pools: updatedPools, sweeps };
  }

  validateGate3Breakout(
    openingRange: OpeningRangeBox,
    candles5m: Candle[]
  ): Gate3Validation {
    if (candles5m.length < 2) {
      return {
        passed: false,
        breakoutDirection: null,
        bodyCloseOutside: false,
        antiTrapTriggered: false,
        powerBarDetected: false
      };
    }

    const latestCandle = candles5m[candles5m.length - 1];
    const previousCandle = candles5m[candles5m.length - 2];

    const bullishBreakout = latestCandle.close > openingRange.high;
    const bearishBreakout = latestCandle.close < openingRange.low;
    const bodyCloseOutside = bullishBreakout || bearishBreakout;
    const breakoutDirection = bullishBreakout ? 'LONG' : bearishBreakout ? 'SHORT' : null;

    let powerBarDetected = false;
    let antiTrapTriggered = false;

    if (breakoutDirection && candles5m.length >= 3) {
      const followupCandle = candles5m[candles5m.length - 1];
      const breakoutCandle = candles5m[candles5m.length - 2];

      const breakoutCandleValid = breakoutDirection === 'LONG' 
        ? breakoutCandle.close > openingRange.high
        : breakoutCandle.close < openingRange.low;

      if (breakoutCandleValid) {
        const followupCloseInside = followupCandle.close >= openingRange.low && 
                                     followupCandle.close <= openingRange.high;
        const isPowerBar = Math.abs(followupCandle.close - followupCandle.open) > 
                          (openingRange.range * 0.5);

        if (followupCloseInside && isPowerBar) {
          powerBarDetected = true;
          antiTrapTriggered = true;
        }
      }
    }

    return {
      passed: bodyCloseOutside && !antiTrapTriggered,
      breakoutCandle: bodyCloseOutside ? latestCandle : undefined,
      breakoutDirection,
      bodyCloseOutside,
      antiTrapTriggered,
      powerBarDetected
    };
  }

  validateGate5Retest(
    openingRange: OpeningRangeBox,
    breakoutDirection: 'LONG' | 'SHORT',
    candles1m: Candle[]
  ): Gate5Execution {
    if (candles1m.length < 3) {
      return {
        passed: false,
        rejectionType: 'NONE',
        kissedLevel: null,
        confidenceScore: 0,
        riskAllocation: 'STANDARD'
      };
    }

    const level = breakoutDirection === 'LONG' ? openingRange.high : openingRange.low;
    const tolerance = openingRange.range * 0.1;

    for (let i = candles1m.length - 1; i >= Math.max(0, candles1m.length - 10); i--) {
      const candle = candles1m[i];
      const touchedLevel = breakoutDirection === 'LONG'
        ? candle.low <= level + tolerance && candle.low >= level - tolerance
        : candle.high >= level - tolerance && candle.high <= level + tolerance;

      if (touchedLevel) {
        const isWickRejection = breakoutDirection === 'LONG'
          ? candle.close > candle.open && (candle.open - candle.low) > (candle.high - candle.close)
          : candle.close < candle.open && (candle.high - candle.open) > (candle.close - candle.low);

        let isEngulfing = false;
        if (i > 0) {
          const prevCandle = candles1m[i - 1];
          isEngulfing = breakoutDirection === 'LONG'
            ? candle.close > candle.open && 
              candle.close > prevCandle.high && 
              candle.open < prevCandle.low
            : candle.close < candle.open && 
              candle.close < prevCandle.low && 
              candle.open > prevCandle.high;
        }

        if (isWickRejection || isEngulfing) {
          const confidenceScore = this.calculateConfidenceScore(candle, level, breakoutDirection, isEngulfing);
          return {
            passed: true,
            retestCandle: candle,
            rejectionType: isEngulfing ? 'ENGULFING' : 'WICK',
            kissedLevel: level,
            confidenceScore,
            riskAllocation: confidenceScore > 85 ? 'HIGH' : 'STANDARD'
          };
        }
      }
    }

    return {
      passed: false,
      rejectionType: 'NONE',
      kissedLevel: null,
      confidenceScore: 0,
      riskAllocation: 'STANDARD'
    };
  }

  private calculateConfidenceScore(
    candle: Candle,
    level: number,
    direction: 'LONG' | 'SHORT',
    isEngulfing: boolean
  ): number {
    let score = 50;

    if (isEngulfing) score += 20;
    
    const wickSize = direction === 'LONG' 
      ? candle.open - candle.low 
      : candle.high - candle.open;
    const bodySize = Math.abs(candle.close - candle.open);
    
    if (wickSize > bodySize * 1.5) score += 15;
    if (wickSize > bodySize * 2) score += 10;

    const distanceFromLevel = Math.abs(
      (direction === 'LONG' ? candle.low : candle.high) - level
    );
    const precision = 1 - (distanceFromLevel / (candle.high - candle.low));
    score += Math.round(precision * 15);

    return Math.min(100, Math.max(0, score));
  }

  calculateGate7Management(
    entryPrice: number,
    direction: 'LONG' | 'SHORT',
    openingRange: OpeningRangeBox,
    candles: Candle[]
  ): Gate7Management {
    const standardDeviation = this.calculateStandardDeviation(candles);
    
    const stopLoss = direction === 'LONG'
      ? openingRange.low - (openingRange.range * 0.1)
      : openingRange.high + (openingRange.range * 0.1);

    const target05SD = direction === 'LONG'
      ? entryPrice + (standardDeviation * 0.5)
      : entryPrice - (standardDeviation * 0.5);

    const target10SD = direction === 'LONG'
      ? entryPrice + standardDeviation
      : entryPrice - standardDeviation;

    return {
      entryPrice,
      stopLoss,
      breakeven: entryPrice,
      target05SD,
      target10SD,
      standardDeviation,
      currentPnL: 0,
      slMovedToBreakeven: false
    };
  }

  private calculateStandardDeviation(candles: Candle[]): number {
    if (candles.length < 2) return 0;
    
    const closes = candles.map(c => c.close);
    const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
    const squaredDiffs = closes.map(c => Math.pow(c - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / closes.length;
    
    return Math.sqrt(variance);
  }

  async runFullAnalysis(
    symbol: string,
    candles15m: Candle[],
    candles5m: Candle[],
    candles1m: Candle[]
  ): Promise<SevenGateORBAnalysis> {
    const auditTrail: AuditEntry[] = [];
    const reasoning: string[] = [];

    const gate0 = await this.checkGate0NewsFilter();
    auditTrail.push({
      timestamp: Date.now(),
      gate: 'GATE_0',
      action: 'NEWS_CHECK',
      details: { status: gate0.systemStatus, newsCount: gate0.newsEvents.length }
    });

    if (gate0.systemStatus === 'PAUSED') {
      reasoning.push(`Gate 0 PAUSED: ${gate0.pauseReason}`);
      return this.createPausedAnalysis(symbol, gate0, auditTrail, reasoning);
    }

    const openingRange = this.captureOpeningRange(symbol, candles15m);
    const liquidityPools = this.detectLiquidityPools(openingRange);
    const { pools: updatedPools, sweeps } = this.detectLiquiditySweep(liquidityPools, candles15m);
    
    auditTrail.push({
      timestamp: Date.now(),
      gate: 'GATE_1_2',
      action: 'OPENING_RANGE_CAPTURE',
      details: { high: openingRange.high, low: openingRange.low, sweeps: sweeps.length }
    });
    reasoning.push(`Opening Range: ${openingRange.high.toFixed(2)} - ${openingRange.low.toFixed(2)}`);

    let secRisk: SECRiskFlags | undefined;
    if (sweeps.length > 0) {
      try {
        secRisk = await getSECFlags(symbol);
        auditTrail.push({
          timestamp: Date.now(),
          gate: 'SEC_RISK',
          action: 'RISK_CHECK',
          details: { status: secRisk.status, riskScore: secRisk.riskScore, keywords: secRisk.keywordsFound }
        });
        if (secRisk.status === 'ALERT') {
          reasoning.push(`⚠️ SEC Risk ALERT: Found ${secRisk.riskScore} risk keywords (${secRisk.keywordsFound.join(', ')})`);
        } else if (secRisk.status === 'CLEAR') {
          reasoning.push(`✅ SEC Risk CLEAR: No significant risk factors detected`);
        }
      } catch (error) {
        console.warn(`SEC risk check failed for ${symbol}:`, error);
      }
    }

    if (!openingRange.isComplete) {
      reasoning.push('Waiting for 15-min opening range to complete (09:30-09:45 EST)');
      return this.createWaitingAnalysis(symbol, gate0, openingRange, updatedPools, sweeps, 'WAITING_RANGE', auditTrail, reasoning, undefined, secRisk);
    }

    const gate3 = this.validateGate3Breakout(openingRange, candles5m);
    auditTrail.push({
      timestamp: Date.now(),
      gate: 'GATE_3',
      action: 'BREAKOUT_VALIDATION',
      details: { passed: gate3.passed, direction: gate3.breakoutDirection, antiTrap: gate3.antiTrapTriggered }
    });

    if (!gate3.passed) {
      if (gate3.antiTrapTriggered) {
        reasoning.push('Gate 3 REJECTED: Power Bar detected - Sweep Trap pattern');
      } else {
        reasoning.push('Gate 3 WAITING: No valid 5-min breakout detected');
      }
      return this.createWaitingAnalysis(symbol, gate0, openingRange, updatedPools, sweeps, 'WAITING_BREAKOUT', auditTrail, reasoning, gate3, secRisk);
    }

    reasoning.push(`Gate 3 PASSED: ${gate3.breakoutDirection} breakout confirmed on 5-min`);

    const gate5 = this.validateGate5Retest(openingRange, gate3.breakoutDirection!, candles1m);
    auditTrail.push({
      timestamp: Date.now(),
      gate: 'GATE_4_5',
      action: 'RETEST_EXECUTION',
      details: { passed: gate5.passed, rejection: gate5.rejectionType, confidence: gate5.confidenceScore }
    });

    if (!gate5.passed) {
      reasoning.push('Gate 5 WAITING: No 1-min retest rejection detected');
      return this.createWaitingAnalysis(symbol, gate0, openingRange, updatedPools, sweeps, 'WAITING_RETEST', auditTrail, reasoning, gate3, secRisk);
    }

    reasoning.push(`Gate 5 PASSED: ${gate5.rejectionType} rejection at ${gate5.kissedLevel?.toFixed(2)}`);
    reasoning.push(`Confidence Score: ${gate5.confidenceScore}% - Risk Allocation: ${gate5.riskAllocation}`);

    const currentPrice = candles1m[candles1m.length - 1]?.close || 0;
    const gate7 = this.calculateGate7Management(currentPrice, gate3.breakoutDirection!, openingRange, candles1m);
    
    auditTrail.push({
      timestamp: Date.now(),
      gate: 'GATE_6_7',
      action: 'TRADE_MANAGEMENT',
      details: { 
        entry: gate7.entryPrice, 
        stopLoss: gate7.stopLoss, 
        target05SD: gate7.target05SD,
        target10SD: gate7.target10SD
      }
    });

    reasoning.push(`Entry: ${gate7.entryPrice.toFixed(2)} | SL: ${gate7.stopLoss.toFixed(2)} | BE Target: ${gate7.target05SD.toFixed(2)} | TP: ${gate7.target10SD.toFixed(2)}`);

    const analysis: SevenGateORBAnalysis = {
      symbol,
      timestamp: Date.now(),
      gates: {
        gate0,
        gate1_2: { openingRange, liquidityPools: updatedPools, sweeps },
        gate3,
        gate4_5: gate5,
        gate6_7: gate7
      },
      secRisk,
      overallStatus: 'ACTIVE_TRADE',
      signalType: 'EXECUTE',
      direction: gate3.breakoutDirection!,
      confidenceScore: gate5.confidenceScore,
      reasoning,
      auditTrail
    };

    this.activeSignals.set(symbol, analysis);
    return analysis;
  }

  private createPausedAnalysis(
    symbol: string,
    gate0: Gate0NewsStatus,
    auditTrail: AuditEntry[],
    reasoning: string[]
  ): SevenGateORBAnalysis {
    return {
      symbol,
      timestamp: Date.now(),
      gates: {
        gate0,
        gate1_2: { openingRange: { high: 0, low: 0, midpoint: 0, range: 0, captureTime: 0, isComplete: false }, liquidityPools: [], sweeps: [] },
        gate3: { passed: false, breakoutDirection: null, bodyCloseOutside: false, antiTrapTriggered: false, powerBarDetected: false },
        gate4_5: { passed: false, rejectionType: 'NONE', kissedLevel: null, confidenceScore: 0, riskAllocation: 'STANDARD' },
        gate6_7: null
      },
      overallStatus: 'PAUSED',
      signalType: 'PAUSED',
      direction: 'NEUTRAL',
      confidenceScore: 0,
      reasoning,
      auditTrail
    };
  }

  private createWaitingAnalysis(
    symbol: string,
    gate0: Gate0NewsStatus,
    openingRange: OpeningRangeBox,
    pools: LiquidityPool[],
    sweeps: SimpleLiquiditySweep[],
    status: 'WAITING_RANGE' | 'WAITING_BREAKOUT' | 'WAITING_RETEST',
    auditTrail: AuditEntry[],
    reasoning: string[],
    gate3?: Gate3Validation,
    secRisk?: SECRiskFlags
  ): SevenGateORBAnalysis {
    return {
      symbol,
      timestamp: Date.now(),
      gates: {
        gate0,
        gate1_2: { openingRange, liquidityPools: pools, sweeps },
        gate3: gate3 || { passed: false, breakoutDirection: null, bodyCloseOutside: false, antiTrapTriggered: false, powerBarDetected: false },
        gate4_5: { passed: false, rejectionType: 'NONE', kissedLevel: null, confidenceScore: 0, riskAllocation: 'STANDARD' },
        gate6_7: null
      },
      secRisk,
      overallStatus: status,
      signalType: 'WAIT',
      direction: 'NEUTRAL',
      confidenceScore: 0,
      reasoning,
      auditTrail
    };
  }

  getActiveSignal(symbol: string): SevenGateORBAnalysis | undefined {
    return this.activeSignals.get(symbol);
  }

  getAllActiveSignals(): SevenGateORBAnalysis[] {
    return Array.from(this.activeSignals.values());
  }

  addJournalEntry(entry: TradingJournalEntry): void {
    this.journalEntries.push(entry);
  }

  getJournalEntries(): TradingJournalEntry[] {
    return this.journalEntries;
  }
}

export const sevenGateORBEngine = new SevenGateORBEngine();
