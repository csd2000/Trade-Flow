import Anthropic from "@anthropic-ai/sdk";
import { Candle, LiquidityLevel, LiquiditySweep, FVGZone, TrendDirection, SwingPoint } from './strategy/types';
import { detectFVGZones, detectDisplacementCandle, detectORBBox } from './strategy/zones';
import { buildLiquidityLevels, detectLiquiditySweeps, getSessionHighLow, getPreviousDayHighLow } from './strategy/liquidity';
import { detectSwingPoints } from './strategy/structure';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';
import { orderBookManager, OBIResult, getOBIPressureLabel } from './strategy/orderbook';

interface GateResult {
  name: string;
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
}

interface SevenGateAnalysis {
  symbol: string;
  timestamp: number;
  totalScore: number;
  maxScore: number;
  gates: GateResult[];
  signalType: 'A+_ENTRY' | 'ENTRY' | 'WAIT' | 'GATE_LOCKED';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskRewardRatio: number;
  reasoning: string[];
  gateLockReason?: string;
  auditData: AuditData;
}

interface AuditData {
  price: number;
  fibLevels: FibonacciLevels;
  fvgZones: FVGZone[];
  liquidityLevels: LiquidityLevel[];
  sweeps: LiquiditySweep[];
  indicators: IndicatorSnapshot;
  sentiment?: SentimentData;
  orderFlow?: OrderFlowData;
  pressureMeter?: PressureMeterState;
}

interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  level236: number;
  level382: number;
  level50: number;
  level618: number;
  level786: number;
  inOptimalZone: boolean;
}

interface IndicatorSnapshot {
  ema8: number;
  ema18: number;
  ema200: number;
  adx: number;
  rsi: number;
  rvol: number;
  atr: number;
  macd: { line: number; signal: number; histogram: number; prevLine: number; prevSignal: number };
  macdCrossover: 'bullish' | 'bearish' | 'none';
}

interface RollingSweepResult {
  sweepUp: boolean;
  sweepDown: boolean;
  prevHigh20: number;
  prevLow20: number;
  sweepDirection: 'bullish' | 'bearish' | null;
}

interface SentimentData {
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  headlines: string[];
  gateLocked: boolean;
}

interface CircuitBreakerState {
  userId: string;
  dailyDrawdown: number;
  isPaused: boolean;
  pauseUntil: number;
  trades: TradeRecord[];
}

interface TradeRecord {
  symbol: string;
  entryTime: number;
  exitTime?: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
}

interface OpeningRange {
  high: number;
  low: number;
  midpoint: number;
  isOutside: boolean;
  direction: 'above' | 'below' | 'inside';
}

class HFCApexEngine {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private sentimentCache: Map<string, { data: SentimentData; timestamp: number }> = new Map();
  private priceCache: Map<string, Candle[]> = new Map();
  private dailyCache: Map<string, Candle[]> = new Map();
  private anthropic: Anthropic;
  private readonly SENTIMENT_CACHE_TTL = 300000;
  private readonly DRAWDOWN_THRESHOLD = 0.10;
  private readonly PAUSE_DURATION = 24 * 60 * 60 * 1000;

  constructor() {
    this.anthropic = new Anthropic();
  }

  async analyze7Gates(
    symbol: string,
    candles1m: Candle[],
    candles5m: Candle[],
    candles15m: Candle[],
    candles1h: Candle[],
    candlesDaily: Candle[],
    userId?: string
  ): Promise<SevenGateAnalysis> {
    const timestamp = Date.now();
    const gates: GateResult[] = [];
    const reasoning: string[] = [];
    const currentPrice = candles1m[candles1m.length - 1]?.close || 0;

    if (userId && this.isCircuitBreakerActive(userId)) {
      const state = this.circuitBreakers.get(userId)!;
      return this.createLockedAnalysis(symbol, timestamp, currentPrice, 
        `Circuit breaker active: ${(state.dailyDrawdown * 100).toFixed(1)}% drawdown. Paused until ${new Date(state.pauseUntil).toLocaleString()}`);
    }

    const indicators = this.calculateIndicators(candles1m, candles15m, candlesDaily);
    const swings = detectSwingPoints(candles15m, 5);
    const swingHighs = swings.highs;
    const swingLows = swings.lows;
    const liquidityLevels = buildLiquidityLevels(candles15m, swingHighs, swingLows);
    const sweeps = detectLiquiditySweeps(candles1m, liquidityLevels);
    const fvgZones = detectFVGZones(candles5m, 10);
    const displacement = detectDisplacementCandle(candles5m);
    const fibLevels = this.calculateFibonacci(swingHighs, swingLows, currentPrice);
    const orb = this.calculate15mOpeningRange(candles15m, currentPrice);

    const rollingSweep = this.detect20PeriodSweep(candles1m.slice(0, -1));
    const prevCandleSweep = rollingSweep.sweepDirection;

    const gate0 = this.evaluateGate0LiquiditySweep(sweeps, currentPrice, prevCandleSweep, indicators.macdCrossover);
    gates.push(gate0);
    if (gate0.passed) reasoning.push(`Gate 0: Liquidity sweep detected - ${gate0.details}`);

    const gate1 = this.evaluateGate1EMACross(indicators);
    gates.push(gate1);
    if (gate1.passed) reasoning.push(`Gate 1: EMA 8/18 cross confirmed - ${gate1.details}`);

    const gate2 = this.evaluateGate2ADX(indicators);
    gates.push(gate2);
    if (gate2.passed) reasoning.push(`Gate 2: ADX strength confirmed - ${gate2.details}`);

    const gate3 = this.evaluateGate3RVOL(indicators);
    gates.push(gate3);
    if (gate3.passed) reasoning.push(`Gate 3: Volume surge confirmed - ${gate3.details}`);

    const gate4 = this.evaluateGate4SMCDisplacement(displacement, fvgZones);
    gates.push(gate4);
    if (gate4.passed) reasoning.push(`Gate 4: SMC displacement + FVG - ${gate4.details}`);

    const gate5 = this.evaluateGate5OpeningRange(orb);
    gates.push(gate5);
    if (gate5.passed) reasoning.push(`Gate 5: Outside 15m opening range - ${gate5.details}`);

    const gate6 = this.evaluateGate6FibPullback(fibLevels, currentPrice);
    gates.push(gate6);
    if (gate6.passed) reasoning.push(`Gate 6: Fibonacci 0.382 pullback zone - ${gate6.details}`);

    const macroGate = this.evaluateMacroGate(candlesDaily, currentPrice, indicators);
    gates.push(macroGate);
    if (macroGate.passed) reasoning.push(`Macro Gate: Price above Daily 200 SMA - ${macroGate.details}`);

    const hasLiquiditySweep = gate0.passed;
    const orderFlowData = orderFlowIntelligence.analyzeOrderFlow(candles1m, hasLiquiditySweep);
    const pressureMeter = orderFlowIntelligence.calculatePressure(candles1m, hasLiquiditySweep);

    const orderFlowGate = this.evaluateOrderFlowGate(orderFlowData, pressureMeter);
    gates.push(orderFlowGate);
    if (orderFlowGate.passed) reasoning.push(`Order Flow Gate: ${orderFlowGate.details}`);

    // Gate 8: OBI Pressure Gauge - Level 2 Order Book Imbalance
    const obiResult = orderBookManager.getOBI(symbol, 5);
    const lastSweepDir = sweeps.length > 0 ? sweeps[sweeps.length - 1].direction : null;
    const obiDirection: 'bullish' | 'bearish' | null = lastSweepDir === 'bullish' || lastSweepDir === 'bearish' ? lastSweepDir : null;
    const gate8 = this.evaluateGate8OBIPressure(obiResult, obiDirection);
    gates.push(gate8);
    if (gate8.passed) reasoning.push(`Gate 8 (Pressure Gauge): ${gate8.details}`);

    const totalScore = gates.reduce((sum, g) => sum + g.score, 0);
    const maxScore = gates.reduce((sum, g) => sum + g.maxScore, 0);
    const passedGates = gates.filter(g => g.passed).length;

    let direction: 'LONG' | 'SHORT' | 'NEUTRAL' = 'NEUTRAL';
    if (gate0.passed && sweeps.length > 0) {
      const lastSweep = sweeps[sweeps.length - 1];
      direction = lastSweep.direction === 'bullish' ? 'LONG' : 'SHORT';
    }

    if (direction === 'LONG' && !macroGate.passed) {
      direction = 'NEUTRAL';
      reasoning.push('Long entry blocked: Price below Daily 200 SMA');
    }

    if (gate6.passed && direction !== 'NEUTRAL') {
      const deltaFlipCheck = orderFlowIntelligence.shouldEnterOnFib382(candles1m, direction);
      if (!deltaFlipCheck.canEnter) {
        reasoning.push(`Entry refinement: ${deltaFlipCheck.reason}`);
      } else {
        reasoning.push(`Entry confirmed: ${deltaFlipCheck.reason}`);
      }
    }

    if (orderFlowData.absorptionDetected) {
      reasoning.push('Institutional Absorption detected at liquidity level - potential reversal zone');
    }

    if (orderFlowData.hasMomentumSurge) {
      reasoning.push(`Momentum Surge: ${orderFlowData.consecutiveImbalances}+ levels with >300% imbalance`);
    }

    let signalType: 'A+_ENTRY' | 'ENTRY' | 'WAIT' | 'GATE_LOCKED' = 'WAIT';
    if (gate0.passed && passedGates >= 8) {
      signalType = 'A+_ENTRY';
    } else if (gate0.passed && passedGates >= 6) {
      signalType = 'ENTRY';
    }

    const { entryPrice, stopLoss, target1, target2, riskRewardRatio } = 
      this.calculateTradeLevels(currentPrice, direction, indicators.atr, fibLevels);

    return {
      symbol,
      timestamp,
      totalScore,
      maxScore,
      gates,
      signalType,
      direction,
      entryPrice,
      stopLoss,
      target1,
      target2,
      riskRewardRatio,
      reasoning,
      auditData: {
        price: currentPrice,
        fibLevels,
        fvgZones,
        liquidityLevels,
        sweeps,
        indicators,
        orderFlow: orderFlowData,
        pressureMeter
      }
    };
  }

  private evaluateGate8OBIPressure(obiResult: OBIResult | null, sweepDirection: 'bullish' | 'bearish' | null): GateResult {
    const maxScore = 15;
    
    if (!obiResult || !obiResult.isValid) {
      return {
        name: 'Gate 8: OBI Pressure Gauge',
        passed: false,
        score: 0,
        maxScore,
        details: 'L2 order book data not available'
      };
    }
    
    let score = 0;
    let passed = false;
    const details: string[] = [];
    
    const obi = obiResult.obi;
    const label = getOBIPressureLabel(obi);
    
    // For LONG: OBI must be > 0.60 (strong buy pressure)
    // For SHORT: OBI must be < -0.60 (strong sell pressure)
    if (sweepDirection === 'bullish' && obi > 0.60) {
      passed = true;
      score = 15;
      details.push(`OBI ${obi.toFixed(3)} > 0.60 ✓ Whales stacking bids for LONG`);
    } else if (sweepDirection === 'bearish' && obi < -0.60) {
      passed = true;
      score = 15;
      details.push(`OBI ${obi.toFixed(3)} < -0.60 ✓ Whales stacking asks for SHORT`);
    } else if (Math.abs(obi) > 0.60) {
      // Strong pressure but wrong direction
      score = 5;
      details.push(`OBI ${obi.toFixed(3)} - ${label} (conflicting with sweep direction)`);
    } else if (Math.abs(obi) > 0.30) {
      score = 3;
      details.push(`OBI ${obi.toFixed(3)} - Moderate pressure (waiting for >0.60)`);
    } else {
      score = 0;
      details.push(`OBI ${obi.toFixed(3)} - Neutral order book (need stronger imbalance)`);
    }
    
    return {
      name: 'Gate 8: OBI Pressure Gauge',
      passed,
      score,
      maxScore,
      details: details.join('; ')
    };
  }

  private evaluateOrderFlowGate(orderFlow: OrderFlowData, pressure: PressureMeterState): GateResult {
    let score = 0;
    let passed = false;
    const details: string[] = [];

    if (orderFlow.hasMomentumSurge) {
      score += 5;
      details.push('Momentum Surge detected');
    }

    if (orderFlow.absorptionDetected) {
      score += 4;
      details.push('Absorption at key level');
    }

    if (orderFlow.deltaFlip) {
      score += 4;
      details.push(`Delta Flip (${orderFlow.deltaFlipDirection})`);
    }

    if (pressure.pressure === 'buy' && pressure.score > 70) {
      score += 3;
      details.push('Strong buy pressure');
    } else if (pressure.pressure === 'sell' && pressure.score < 30) {
      score += 3;
      details.push('Strong sell pressure');
    }

    passed = score >= 8;

    return {
      name: 'Order Flow Gate: Pressure & Delta',
      passed,
      score: Math.min(score, 15),
      maxScore: 15,
      details: details.length > 0 ? details.join(', ') : 'Neutral order flow'
    };
  }

  private evaluateGate0LiquiditySweep(
    sweeps: LiquiditySweep[], 
    currentPrice: number,
    prevCandleSweep: 'bullish' | 'bearish' | null,
    macdCrossover: 'bullish' | 'bearish' | 'none'
  ): GateResult {
    const recentSweeps = sweeps.filter(s => 
      Math.abs(s.sweepPrice - currentPrice) / currentPrice < 0.02 &&
      s.quality >= 0.6
    );

    const bestSweep = recentSweeps.sort((a, b) => b.quality - a.quality)[0];
    
    const has20PeriodSweepThenMACD = 
      (prevCandleSweep === 'bullish' && macdCrossover === 'bullish') ||
      (prevCandleSweep === 'bearish' && macdCrossover === 'bearish');

    const hasStructuralSweepWithMACD = 
      recentSweeps.length > 0 && 
      macdCrossover !== 'none' &&
      ((bestSweep?.direction === 'bullish' && macdCrossover === 'bullish') ||
       (bestSweep?.direction === 'bearish' && macdCrossover === 'bearish'));
    
    const passed = has20PeriodSweepThenMACD || hasStructuralSweepWithMACD;
    
    let details: string;
    let score = 0;
    
    if (has20PeriodSweepThenMACD) {
      score = 15;
      details = `20-period ${prevCandleSweep} sweep + MACD(8,17,9) ${macdCrossover} cross confirmed`;
    } else if (hasStructuralSweepWithMACD) {
      score = 12;
      details = `Structural ${bestSweep!.direction} sweep + MACD ${macdCrossover} cross at ${bestSweep!.sweepPrice.toFixed(2)}`;
    } else if (recentSweeps.length > 0) {
      score = 5;
      details = `Sweep detected at ${bestSweep!.sweepPrice.toFixed(2)} but awaiting MACD(8,17,9) cross confirmation`;
    } else if (macdCrossover !== 'none') {
      score = 3;
      details = `MACD ${macdCrossover} cross detected but no preceding sweep`;
    } else {
      details = 'No liquidity sweep + MACD cross pattern detected';
    }

    return {
      name: 'Gate 0: Liquidity Sweep + MACD Cross',
      passed,
      score,
      maxScore: 15,
      details
    };
  }

  private evaluateGate1EMACross(indicators: IndicatorSnapshot): GateResult {
    const bullishCross = indicators.ema8 > indicators.ema18;
    const bearishCross = indicators.ema8 < indicators.ema18;
    const crossStrength = Math.abs(indicators.ema8 - indicators.ema18) / indicators.ema18 * 100;
    const passed = bullishCross || bearishCross;

    return {
      name: 'Gate 1: EMA 8/18 Cross',
      passed,
      score: passed ? Math.min(10, 5 + crossStrength) : 0,
      maxScore: 10,
      details: passed 
        ? `${bullishCross ? 'Bullish' : 'Bearish'} cross, strength: ${crossStrength.toFixed(2)}%`
        : 'No clear EMA cross'
    };
  }

  private evaluateGate2ADX(indicators: IndicatorSnapshot): GateResult {
    const passed = indicators.adx > 25;
    const score = passed ? Math.min(10, (indicators.adx - 20) / 2) : 0;

    return {
      name: 'Gate 2: ADX > 25',
      passed,
      score,
      maxScore: 10,
      details: `ADX: ${indicators.adx.toFixed(1)} ${passed ? '(Strong trend)' : '(Weak trend)'}`
    };
  }

  private evaluateGate3RVOL(indicators: IndicatorSnapshot): GateResult {
    const passed = indicators.rvol > 2.5;
    const score = passed ? Math.min(10, (indicators.rvol - 1.5) * 5) : indicators.rvol > 1.5 ? 5 : 0;

    return {
      name: 'Gate 3: RVOL > 2.5',
      passed,
      score,
      maxScore: 10,
      details: `RVOL: ${indicators.rvol.toFixed(2)}x ${passed ? '(Volume surge)' : '(Normal volume)'}`
    };
  }

  private evaluateGate4SMCDisplacement(
    displacement: ReturnType<typeof detectDisplacementCandle>,
    fvgZones: FVGZone[]
  ): GateResult {
    const hasDisplacement = displacement !== null && displacement.quality >= 0.6;
    const hasFVG = fvgZones.filter(z => !z.mitigated).length > 0;
    const passed = hasDisplacement && hasFVG;

    return {
      name: 'Gate 4: SMC Displacement + FVG',
      passed,
      score: passed ? 12 : (hasDisplacement || hasFVG ? 6 : 0),
      maxScore: 12,
      details: passed 
        ? `Displacement (${displacement!.direction}, quality: ${(displacement!.quality * 100).toFixed(0)}%) with ${fvgZones.filter(z => !z.mitigated).length} active FVGs`
        : hasDisplacement 
          ? 'Displacement without FVG'
          : hasFVG 
            ? 'FVG without displacement'
            : 'No SMC structure'
    };
  }

  private evaluateGate5OpeningRange(orb: OpeningRange): GateResult {
    const passed = orb.isOutside;

    return {
      name: 'Gate 5: Outside 15m Opening Range',
      passed,
      score: passed ? 10 : 0,
      maxScore: 10,
      details: passed 
        ? `Price ${orb.direction} ORB (H: ${orb.high.toFixed(2)}, L: ${orb.low.toFixed(2)})`
        : `Inside ORB, range: ${orb.high.toFixed(2)} - ${orb.low.toFixed(2)}`
    };
  }

  private evaluateGate6FibPullback(fibLevels: FibonacciLevels, currentPrice: number): GateResult {
    const passed = fibLevels.inOptimalZone;
    const distTo382 = Math.abs(currentPrice - fibLevels.level382) / fibLevels.level382 * 100;

    return {
      name: 'Gate 6: Fibonacci 0.382 Pullback',
      passed,
      score: passed ? 12 : (distTo382 < 2 ? 6 : 0),
      maxScore: 12,
      details: passed 
        ? `In optimal zone (0.382-0.50), current: ${currentPrice.toFixed(2)}`
        : `Distance to 0.382: ${distTo382.toFixed(2)}%`
    };
  }

  private evaluateMacroGate(candlesDaily: Candle[], currentPrice: number, indicators: IndicatorSnapshot): GateResult {
    const passed = currentPrice > indicators.ema200;
    
    return {
      name: 'Macro Gate: Price > 200 SMA',
      passed,
      score: passed ? 10 : 0,
      maxScore: 10,
      details: passed 
        ? `Price ${currentPrice.toFixed(2)} above 200 SMA ${indicators.ema200.toFixed(2)}`
        : `Price ${currentPrice.toFixed(2)} below 200 SMA ${indicators.ema200.toFixed(2)} - LONGS BLOCKED`
    };
  }

  async applySentimentGateLock(
    analysis: SevenGateAnalysis,
    headlines: string[]
  ): Promise<SevenGateAnalysis> {
    const cacheKey = analysis.symbol;
    const cached = this.sentimentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.SENTIMENT_CACHE_TTL) {
      return this.applyGateLockFromSentiment(analysis, cached.data);
    }

    try {
      const sentimentPrompt = `Analyze these market headlines for ${analysis.symbol} and return a JSON response:
Headlines: ${headlines.slice(0, 10).join(' | ')}

Return ONLY valid JSON:
{
  "score": <number 0-1, where 0=very bearish, 0.5=neutral, 1=very bullish>,
  "sentiment": "<bullish|bearish|neutral>",
  "gateLock": <true if score < 0.3 or score > 0.85 (extreme sentiment)>
}`;

      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: sentimentPrompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const sentimentResult = JSON.parse(jsonMatch[0]);
          const sentimentData: SentimentData = {
            score: sentimentResult.score,
            sentiment: sentimentResult.sentiment,
            headlines: headlines.slice(0, 5),
            gateLocked: sentimentResult.gateLock || sentimentResult.score < 0.3
          };

          this.sentimentCache.set(cacheKey, { data: sentimentData, timestamp: Date.now() });
          return this.applyGateLockFromSentiment(analysis, sentimentData);
        }
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
    }

    return analysis;
  }

  private applyGateLockFromSentiment(analysis: SevenGateAnalysis, sentiment: SentimentData): SevenGateAnalysis {
    analysis.auditData.sentiment = sentiment;

    if (sentiment.gateLocked) {
      return {
        ...analysis,
        signalType: 'GATE_LOCKED',
        gateLockReason: `AI Sentiment Filter: ${sentiment.sentiment} sentiment (score: ${(sentiment.score * 100).toFixed(0)}%)`,
        reasoning: [
          ...analysis.reasoning,
          `⚠️ GATE LOCKED: ${sentiment.sentiment} news sentiment detected (${(sentiment.score * 100).toFixed(0)}%)`
        ]
      };
    }

    analysis.gates.push({
      name: 'AI Sentiment Gate',
      passed: true,
      score: 8,
      maxScore: 8,
      details: `${sentiment.sentiment} sentiment (${(sentiment.score * 100).toFixed(0)}%)`
    });

    analysis.totalScore += 8;
    analysis.maxScore += 8;

    return analysis;
  }

  updateCircuitBreaker(userId: string, tradePnL: number, accountBalance: number): void {
    let state = this.circuitBreakers.get(userId);
    
    if (!state) {
      state = {
        userId,
        dailyDrawdown: 0,
        isPaused: false,
        pauseUntil: 0,
        trades: []
      };
      this.circuitBreakers.set(userId, state);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    state.trades = state.trades.filter(t => t.entryTime >= today.getTime());

    state.trades.push({
      symbol: 'TRADE',
      entryTime: Date.now(),
      entryPrice: 0,
      pnl: tradePnL
    });

    const dailyPnL = state.trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    state.dailyDrawdown = Math.abs(Math.min(0, dailyPnL)) / accountBalance;

    if (state.dailyDrawdown >= this.DRAWDOWN_THRESHOLD) {
      state.isPaused = true;
      state.pauseUntil = Date.now() + this.PAUSE_DURATION;
      console.log(`Circuit breaker triggered for user ${userId}: ${(state.dailyDrawdown * 100).toFixed(1)}% drawdown`);
    }
  }

  private isCircuitBreakerActive(userId: string): boolean {
    const state = this.circuitBreakers.get(userId);
    if (!state) return false;

    if (state.isPaused && Date.now() >= state.pauseUntil) {
      state.isPaused = false;
      state.dailyDrawdown = 0;
      state.trades = [];
    }

    return state.isPaused;
  }

  private calculateIndicators(candles1m: Candle[], candles15m: Candle[], candlesDaily: Candle[]): IndicatorSnapshot {
    const closes1m = candles1m.map(c => c.close);
    const closes15m = candles15m.map(c => c.close);
    const closesDaily = candlesDaily.map(c => c.close);
    const volumes1m = candles1m.map(c => c.volume);

    const macd = this.calculateMACD(closes1m);
    
    let macdCrossover: 'bullish' | 'bearish' | 'none' = 'none';
    if (macd.prevLine <= macd.prevSignal && macd.line > macd.signal) {
      macdCrossover = 'bullish';
    } else if (macd.prevLine >= macd.prevSignal && macd.line < macd.signal) {
      macdCrossover = 'bearish';
    }

    return {
      ema8: this.calculateEMA(closes1m, 8),
      ema18: this.calculateEMA(closes1m, 18),
      ema200: this.calculateSMA(closesDaily, 200),
      adx: this.calculateADX(candles15m, 14),
      rsi: this.calculateRSI(closes15m, 14),
      rvol: this.calculateRVOL(volumes1m),
      atr: this.calculateATR(candles15m, 14),
      macd,
      macdCrossover
    };
  }

  private detect20PeriodSweep(candles: Candle[]): RollingSweepResult {
    if (candles.length < 21) {
      return { sweepUp: false, sweepDown: false, prevHigh20: 0, prevLow20: 0, sweepDirection: null };
    }

    const prevCandles = candles.slice(-21, -1);
    const currentCandle = candles[candles.length - 1];
    
    const prevHigh20 = Math.max(...prevCandles.map(c => c.high));
    const prevLow20 = Math.min(...prevCandles.map(c => c.low));

    const sweepUp = currentCandle.high > prevHigh20 && currentCandle.close < prevHigh20;
    const sweepDown = currentCandle.low < prevLow20 && currentCandle.close > prevLow20;

    let sweepDirection: 'bullish' | 'bearish' | null = null;
    if (sweepDown) sweepDirection = 'bullish';
    if (sweepUp) sweepDirection = 'bearish';

    return { sweepUp, sweepDown, prevHigh20, prevLow20, sweepDirection };
  }

  private calculateEMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1] || 0;
    const k = 2 / (period + 1);
    let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < values.length; i++) {
      ema = values[i] * k + ema * (1 - k);
    }
    return ema;
  }

  private calculateSMA(values: number[], period: number): number {
    if (values.length < period) return values[values.length - 1] || 0;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  private calculateRSI(closes: number[], period: number): number {
    if (closes.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateATR(candles: Candle[], period: number): number {
    if (candles.length < period + 1) return 0;
    let atr = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1]?.close || candles[i].open;
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      atr += tr;
    }
    return atr / period;
  }

  private calculateADX(candles: Candle[], period: number): number {
    if (candles.length < period * 2) return 20;
    
    let plusDM = 0, minusDM = 0, trSum = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevHigh = candles[i - 1]?.high || high;
      const prevLow = candles[i - 1]?.low || low;
      const prevClose = candles[i - 1]?.close || candles[i].open;

      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      if (upMove > downMove && upMove > 0) plusDM += upMove;
      if (downMove > upMove && downMove > 0) minusDM += downMove;
      
      const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
      trSum += tr;
    }

    if (trSum === 0) return 20;
    const plusDI = (plusDM / trSum) * 100;
    const minusDI = (minusDM / trSum) * 100;
    const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI || 1) * 100;
    
    return Math.min(60, Math.max(10, dx));
  }

  private calculateRVOL(volumes: number[]): number {
    if (volumes.length < 20) return 1;
    const recent = volumes.slice(-5);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const baseline = volumes.slice(-20, -5);
    const avgBaseline = baseline.reduce((a, b) => a + b, 0) / baseline.length;
    return avgBaseline > 0 ? avgRecent / avgBaseline : 1;
  }

  private calculateMACD(
    closes: number[], 
    fast: number = 8, 
    slow: number = 17, 
    signalPeriod: number = 9
  ): { line: number; signal: number; histogram: number; prevLine: number; prevSignal: number } {
    const emaFast = this.calculateEMA(closes, fast);
    const emaSlow = this.calculateEMA(closes, slow);
    const line = emaFast - emaSlow;
    
    const macdValues = closes.slice(-signalPeriod).map((_, i) => {
      const slice = closes.slice(0, closes.length - signalPeriod + 1 + i);
      return this.calculateEMA(slice, fast) - this.calculateEMA(slice, slow);
    });
    const signal = this.calculateEMA(macdValues, signalPeriod);
    
    const prevSlice = closes.slice(0, -1);
    const prevEmaFast = this.calculateEMA(prevSlice, fast);
    const prevEmaSlow = this.calculateEMA(prevSlice, slow);
    const prevLine = prevEmaFast - prevEmaSlow;
    const prevMacdValues = prevSlice.slice(-signalPeriod).map((_, i) => {
      const slice = prevSlice.slice(0, prevSlice.length - signalPeriod + 1 + i);
      return this.calculateEMA(slice, fast) - this.calculateEMA(slice, slow);
    });
    const prevSignal = this.calculateEMA(prevMacdValues, signalPeriod);
    
    return { line, signal, histogram: line - signal, prevLine, prevSignal };
  }

  private calculateFibonacci(swingHighs: SwingPoint[], swingLows: SwingPoint[], currentPrice: number): FibonacciLevels {
    const recentHigh = swingHighs.length > 0 ? Math.max(...swingHighs.slice(-3).map(s => s.price)) : currentPrice * 1.02;
    const recentLow = swingLows.length > 0 ? Math.min(...swingLows.slice(-3).map(s => s.price)) : currentPrice * 0.98;
    const range = recentHigh - recentLow;

    const level236 = recentHigh - range * 0.236;
    const level382 = recentHigh - range * 0.382;
    const level50 = recentHigh - range * 0.5;
    const level618 = recentHigh - range * 0.618;
    const level786 = recentHigh - range * 0.786;

    const inOptimalZone = currentPrice <= level382 && currentPrice >= level50;

    return {
      swingHigh: recentHigh,
      swingLow: recentLow,
      level236,
      level382,
      level50,
      level618,
      level786,
      inOptimalZone
    };
  }

  private calculate15mOpeningRange(candles15m: Candle[], currentPrice: number): OpeningRange {
    if (candles15m.length === 0) {
      return { high: currentPrice, low: currentPrice, midpoint: currentPrice, isOutside: false, direction: 'inside' };
    }

    const now = new Date();
    const marketOpen = new Date(now);
    marketOpen.setHours(9, 30, 0, 0);
    
    const orbCandles = candles15m.filter(c => {
      const candleTime = new Date(c.time);
      return candleTime >= marketOpen && candleTime < new Date(marketOpen.getTime() + 15 * 60 * 1000);
    });

    if (orbCandles.length === 0) {
      const firstCandle = candles15m[0];
      return {
        high: firstCandle.high,
        low: firstCandle.low,
        midpoint: (firstCandle.high + firstCandle.low) / 2,
        isOutside: currentPrice > firstCandle.high || currentPrice < firstCandle.low,
        direction: currentPrice > firstCandle.high ? 'above' : currentPrice < firstCandle.low ? 'below' : 'inside'
      };
    }

    const orbHigh = Math.max(...orbCandles.map(c => c.high));
    const orbLow = Math.min(...orbCandles.map(c => c.low));
    const midpoint = (orbHigh + orbLow) / 2;
    const isOutside = currentPrice > orbHigh || currentPrice < orbLow;
    const direction = currentPrice > orbHigh ? 'above' : currentPrice < orbLow ? 'below' : 'inside';

    return { high: orbHigh, low: orbLow, midpoint, isOutside, direction };
  }

  private calculateTradeLevels(
    currentPrice: number,
    direction: 'LONG' | 'SHORT' | 'NEUTRAL',
    atr: number,
    fibLevels: FibonacciLevels
  ): { entryPrice: number; stopLoss: number; target1: number; target2: number; riskRewardRatio: number } {
    const entryPrice = currentPrice;
    let stopLoss: number, target1: number, target2: number;

    if (direction === 'LONG') {
      stopLoss = Math.max(fibLevels.level618, currentPrice - atr * 1.5);
      target1 = currentPrice + atr * 2;
      target2 = fibLevels.swingHigh;
    } else if (direction === 'SHORT') {
      stopLoss = Math.min(fibLevels.level382, currentPrice + atr * 1.5);
      target1 = currentPrice - atr * 2;
      target2 = fibLevels.swingLow;
    } else {
      stopLoss = currentPrice - atr;
      target1 = currentPrice + atr;
      target2 = currentPrice + atr * 2;
    }

    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(target1 - entryPrice);
    const riskRewardRatio = risk > 0 ? reward / risk : 0;

    return { entryPrice, stopLoss, target1, target2, riskRewardRatio };
  }

  private createLockedAnalysis(symbol: string, timestamp: number, price: number, reason: string): SevenGateAnalysis {
    return {
      symbol,
      timestamp,
      totalScore: 0,
      maxScore: 100,
      gates: [],
      signalType: 'GATE_LOCKED',
      direction: 'NEUTRAL',
      entryPrice: price,
      stopLoss: price,
      target1: price,
      target2: price,
      riskRewardRatio: 0,
      reasoning: [reason],
      gateLockReason: reason,
      auditData: {
        price,
        fibLevels: { swingHigh: price, swingLow: price, level236: price, level382: price, level50: price, level618: price, level786: price, inOptimalZone: false },
        fvgZones: [],
        liquidityLevels: [],
        sweeps: [],
        indicators: { ema8: price, ema18: price, ema200: price, adx: 0, rsi: 50, rvol: 1, atr: 0, macd: { line: 0, signal: 0, histogram: 0, prevLine: 0, prevSignal: 0 }, macdCrossover: 'none' as const }
      }
    };
  }

  generateAuditReport(analysis: SevenGateAnalysis): object {
    const { fibLevels, indicators } = analysis.auditData;
    
    const gateScores = analysis.gates.map(g => g.score);
    const gateLabels = analysis.gates.map(g => g.name.replace('Gate ', 'G').substring(0, 15));
    const gateChartConfig = {
      type: 'bar',
      data: {
        labels: gateLabels,
        datasets: [{
          label: 'Gate Scores',
          data: gateScores,
          backgroundColor: analysis.gates.map(g => g.passed ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)')
        }]
      },
      options: { 
        plugins: { title: { display: true, text: `${analysis.symbol} 7-Gate Analysis` } },
        scales: { y: { beginAtZero: true } }
      }
    };
    const gateChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(gateChartConfig))}&w=600&h=300&bkg=rgb(30,41,59)`;

    const fibChartConfig = {
      type: 'bar',
      data: {
        labels: ['Current', '0.236', '0.382', '0.500', '0.618', '0.786'],
        datasets: [{
          label: 'Fibonacci Levels',
          data: [
            analysis.auditData.price,
            fibLevels.level236,
            fibLevels.level382,
            fibLevels.level50,
            fibLevels.level618,
            fibLevels.level786
          ],
          backgroundColor: 'rgba(59,130,246,0.8)'
        }]
      },
      options: { 
        indexAxis: 'y',
        plugins: { title: { display: true, text: `${analysis.symbol} Fibonacci Levels` } }
      }
    };
    const fibChartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(fibChartConfig))}&w=600&h=300&bkg=rgb(30,41,59)`;

    return {
      timestamp: new Date(analysis.timestamp).toISOString(),
      symbol: analysis.symbol,
      signal: {
        type: analysis.signalType,
        direction: analysis.direction,
        score: `${analysis.totalScore}/${analysis.maxScore}`,
        confidence: ((analysis.totalScore / analysis.maxScore) * 100).toFixed(1) + '%'
      },
      tradeLevels: {
        entry: analysis.entryPrice.toFixed(4),
        stopLoss: analysis.stopLoss.toFixed(4),
        target1: analysis.target1.toFixed(4),
        target2: analysis.target2.toFixed(4),
        riskReward: analysis.riskRewardRatio.toFixed(2)
      },
      gates: analysis.gates.map(g => ({
        name: g.name,
        status: g.passed ? 'PASSED' : 'FAILED',
        score: `${g.score}/${g.maxScore}`,
        details: g.details
      })),
      reasoning: analysis.reasoning,
      gateLock: analysis.gateLockReason || null,
      technicalData: {
        fibonacci: analysis.auditData.fibLevels,
        indicators: analysis.auditData.indicators,
        activeFVGs: analysis.auditData.fvgZones.filter(z => !z.mitigated).length,
        liquidityLevels: analysis.auditData.liquidityLevels.length,
        recentSweeps: analysis.auditData.sweeps.length
      },
      sentiment: analysis.auditData.sentiment || null,
      visualReports: {
        gateAnalysisChart: gateChartUrl,
        fibonacciLevelsChart: fibChartUrl,
        description: 'Visual chart URLs for 7-Gate scores and Fibonacci level analysis'
      }
    };
  }

  getCircuitBreakerStatus(userId: string): CircuitBreakerState | null {
    return this.circuitBreakers.get(userId) || null;
  }
}

export const hfcApexEngine = new HFCApexEngine();
export type { SevenGateAnalysis, GateResult, AuditData, CircuitBreakerState };
