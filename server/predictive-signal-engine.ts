import { zeroLagIndicatorEngine, OrderFlowData, RegimeData } from './zero-lag-indicators';
import { advancedIndicatorEngine, MarketStructure, SessionFilter, VolatilityThreshold, MultiTimeframeAlignment, EnhancedSignalScore } from './advanced-indicators';
import { fetchBinanceOrderBook, fetchBinanceRecentTrades, OrderBookSnapshot, AggregatedTrade } from './realtime-streaming';

interface AdvancedData {
  superSmoother: number;
  tsi: number;
  tsiSignal: number;
  tsiHistogram: number;
  adaptiveRsi: number;
  squeezeOn: boolean;
  squeezeFiring: 'long' | 'short' | 'none';
  marketStructure: MarketStructure;
  sessionFilter: SessionFilter;
  volatilityThreshold: VolatilityThreshold;
  mtfAlignment?: MultiTimeframeAlignment;
  enhancedScore?: EnhancedSignalScore;
  orderBook?: OrderBookSnapshot | null;
  trueOrderFlow?: AggregatedTrade | null;
}

interface ZeroLagData {
  zlema20: number;
  hma20: number;
  tema20: number;
  dema20: number;
  kama10: number;
  roc10: number;
  zlemaMACD: { macd: number; signal: number; histogram: number };
  temaMACD: { macd: number; signal: number; histogram: number };
}

interface FairValueGap {
  type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  midpoint: number;
  candleIndex: number;
  distanceFromPrice: number;
}

interface LiquiditySweepSignal {
  status: 'sweep_confirmed' | 'sweep_rejected' | 'liquidity_building';
  gate1Passed: boolean;
  gate2Passed: boolean;
  gate3Passed: boolean;
  swingLow: number;
  currentLow: number;
  currentClose: number;
  volumeMultiplier: number;
  volumeSMA: number;
  currentVolume: number;
  isConsolidating: boolean;
  isWeakSweep: boolean;
  targetFVG: FairValueGap | null;
  allFVGs: FairValueGap[];
  reasons: string[];
}

interface PredictedMovingAverages {
  shortTerm: number;
  mediumTerm: number;
  longTerm: number;
  shortTermPredicted: number;
  mediumTermPredicted: number;
  longTermPredicted: number;
  crossovers: {
    shortMediumCross: 'bullish' | 'bearish' | 'none';
    mediumLongCross: 'bullish' | 'bearish' | 'none';
    crossedDaysAgo: number;
  };
}

interface NeuralIndex {
  direction: 'up' | 'down' | 'neutral';
  confidence: number;
  daysAhead: 1 | 2 | 3;
  indicatorAgreement: {
    momentum: 'bullish' | 'bearish' | 'neutral';
    trend: 'bullish' | 'bearish' | 'neutral';
    volume: 'bullish' | 'bearish' | 'neutral';
    intermarket: 'bullish' | 'bearish' | 'neutral';
  };
  completeAgreement: boolean;
}

interface TrendStrength {
  adx: number;
  adxTrend: 'strong' | 'moderate' | 'weak';
  momentum: number;
  momentumDirection: 'accelerating' | 'decelerating' | 'stable';
  rvol: number;
  rvolSignal: 'high' | 'normal' | 'low';
  zScore: number;
  overallStrength: number;
}

interface PredictedRange {
  predictedHigh: number;
  predictedLow: number;
  currentPrice: number;
  upPotential: number;
  downRisk: number;
  riskRewardRatio: number;
  confidence: number;
}

interface DoubleConfirmation {
  confirmed: boolean;
  signals: string[];
  score: number;
  requiredScore: number;
  filters: {
    neuralIndexUp: boolean;
    masCrossed: boolean;
    momentumAligned: boolean;
    volumeConfirmed: boolean;
    intermarketAligned: boolean;
    trendStrong: boolean;
  };
}

export interface PredictiveSnapshot {
  symbol: string;
  timestamp: number;
  predictedMAs: PredictedMovingAverages;
  neuralIndex: NeuralIndex;
  trendStrength: TrendStrength;
  predictedRange: PredictedRange;
  doubleConfirmation: DoubleConfirmation;
  liquiditySweep: LiquiditySweepSignal;
  zeroLag: ZeroLagData;
  orderFlow: OrderFlowData;
  regime: RegimeData;
  advanced: AdvancedData;
  overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  signalConfidence: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IntermarketData {
  spyTrend: 'bullish' | 'bearish' | 'neutral';
  dxyTrend: 'bullish' | 'bearish' | 'neutral';
  vixLevel: 'elevated' | 'normal' | 'low';
  yieldTrend: 'rising' | 'falling' | 'stable';
  goldTrend: 'bullish' | 'bearish' | 'neutral';
  correlationStrength: number;
}

class PredictiveSignalEngine {
  private cache: Map<string, { data: PredictiveSnapshot; expiry: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  }

  private calculateADX(candles: Candle[], period: number = 14): number {
    if (candles.length < period + 1) return 25;
    
    let plusDM = 0, minusDM = 0, tr = 0;
    
    for (let i = 1; i < Math.min(candles.length, period + 1); i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevHigh = candles[i - 1].high;
      const prevLow = candles[i - 1].low;
      const prevClose = candles[i - 1].close;
      
      const upMove = high - prevHigh;
      const downMove = prevLow - low;
      
      if (upMove > downMove && upMove > 0) plusDM += upMove;
      if (downMove > upMove && downMove > 0) minusDM += downMove;
      
      tr += Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    }
    
    if (tr === 0) return 25;
    
    const plusDI = (plusDM / tr) * 100;
    const minusDI = (minusDM / tr) * 100;
    const diSum = plusDI + minusDI;
    
    if (diSum === 0) return 25;
    
    const dx = Math.abs(plusDI - minusDI) / diSum * 100;
    return dx;
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateATR(candles: Candle[], period: number = 14): number {
    if (candles.length < 2) return 0;
    
    let atr = 0;
    const len = Math.min(candles.length, period + 1);
    
    for (let i = 1; i < len; i++) {
      const tr = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1].close),
        Math.abs(candles[i].low - candles[i - 1].close)
      );
      atr += tr;
    }
    
    return atr / (len - 1);
  }

  private predictFutureMA(currentMA: number, prices: number[], period: number): number {
    if (prices.length < 3) return currentMA;
    
    const recentPrices = prices.slice(-5);
    const trend = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices.length;
    const momentum = this.calculateMomentum(prices);
    
    const predictedChange = trend * (1 + momentum * 0.1);
    return currentMA * (1 + predictedChange / currentMA);
  }

  private calculateMomentum(prices: number[]): number {
    if (prices.length < 10) return 0;
    
    const recent = prices.slice(-5);
    const older = prices.slice(-10, -5);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    return (recentAvg - olderAvg) / olderAvg;
  }

  private detectCrossover(
    shortMA: number, 
    mediumMA: number, 
    prevShortMA: number, 
    prevMediumMA: number
  ): { type: 'bullish' | 'bearish' | 'none'; daysAgo: number } {
    if (prevShortMA <= prevMediumMA && shortMA > mediumMA) {
      return { type: 'bullish', daysAgo: 1 };
    }
    if (prevShortMA >= prevMediumMA && shortMA < mediumMA) {
      return { type: 'bearish', daysAgo: 1 };
    }
    return { type: 'none', daysAgo: 0 };
  }

  private calculateZScore(prices: number[]): number {
    if (prices.length < 20) return 0;
    
    const recent = prices.slice(-20);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return 0;
    return (prices[prices.length - 1] - mean) / stdDev;
  }

  private calculateRVOL(candles: Candle[]): number {
    if (candles.length < 20) return 1;
    
    const recentVol = candles.slice(-5).reduce((a, c) => a + c.volume, 0) / 5;
    const avgVol = candles.slice(-20).reduce((a, c) => a + c.volume, 0) / 20;
    
    return avgVol > 0 ? recentVol / avgVol : 1;
  }

  private predictHighLow(candles: Candle[], atr: number): { high: number; low: number; confidence: number } {
    if (candles.length < 5) {
      const last = candles[candles.length - 1];
      return { high: last?.high || 0, low: last?.low || 0, confidence: 0.3 };
    }
    
    const current = candles[candles.length - 1];
    const volatilityMultiplier = 1.2;
    
    const recentHighs = candles.slice(-5).map(c => c.high);
    const recentLows = candles.slice(-5).map(c => c.low);
    const avgRange = candles.slice(-5).reduce((a, c) => a + (c.high - c.low), 0) / 5;
    
    const trend = (current.close - candles[candles.length - 5].close) / candles[candles.length - 5].close;
    
    let predictedHigh: number, predictedLow: number;
    
    if (trend > 0.01) {
      predictedHigh = Math.max(...recentHighs) + (atr * volatilityMultiplier * 0.5);
      predictedLow = current.close - (atr * 0.8);
    } else if (trend < -0.01) {
      predictedHigh = current.close + (atr * 0.8);
      predictedLow = Math.min(...recentLows) - (atr * volatilityMultiplier * 0.5);
    } else {
      predictedHigh = current.close + (avgRange * 0.6);
      predictedLow = current.close - (avgRange * 0.6);
    }
    
    const confidence = Math.min(0.85, 0.5 + (candles.length / 100) * 0.2);
    
    return { high: predictedHigh, low: predictedLow, confidence };
  }

  detectFVG(candles: Candle[], currentPrice: number): FairValueGap[] {
    const fvgs: FairValueGap[] = [];
    
    if (candles.length < 3) return fvgs;
    
    for (let i = 2; i < candles.length; i++) {
      const candle1 = candles[i - 2];
      const candle3 = candles[i];
      
      if (candle3.low > candle1.high) {
        const gap: FairValueGap = {
          type: 'bullish',
          top: candle3.low,
          bottom: candle1.high,
          midpoint: (candle3.low + candle1.high) / 2,
          candleIndex: i,
          distanceFromPrice: candle1.high - currentPrice
        };
        fvgs.push(gap);
      }
      
      if (candle3.high < candle1.low) {
        const gap: FairValueGap = {
          type: 'bearish',
          top: candle1.low,
          bottom: candle3.high,
          midpoint: (candle1.low + candle3.high) / 2,
          candleIndex: i,
          distanceFromPrice: candle3.high - currentPrice
        };
        fvgs.push(gap);
      }
    }
    
    return fvgs.sort((a, b) => Math.abs(a.distanceFromPrice) - Math.abs(b.distanceFromPrice));
  }

  calculateLiquiditySweep(candles: Candle[]): LiquiditySweepSignal {
    const reasons: string[] = [];
    const window = 20;
    const volumeWindow = 10;
    
    if (candles.length < window + 1) {
      return {
        status: 'liquidity_building',
        gate1Passed: false,
        gate2Passed: false,
        gate3Passed: false,
        swingLow: 0,
        currentLow: candles[candles.length - 1]?.low || 0,
        currentClose: candles[candles.length - 1]?.close || 0,
        volumeMultiplier: 0,
        volumeSMA: 0,
        currentVolume: candles[candles.length - 1]?.volume || 0,
        isConsolidating: true,
        isWeakSweep: false,
        targetFVG: null,
        allFVGs: [],
        reasons: ['Insufficient data for liquidity analysis']
      };
    }

    const current = candles[candles.length - 1];
    const lookbackCandles = candles.slice(-window - 1, -1);
    
    const swingLow = Math.min(...lookbackCandles.map(c => c.low));
    
    const gate1Passed = current.low < swingLow && current.close > swingLow;
    
    if (gate1Passed) {
      reasons.push(`GATE 1 OPEN: Swept swing low $${swingLow.toFixed(2)} and rejected`);
    } else if (current.low < swingLow && current.close <= swingLow) {
      reasons.push(`Sweep detected but no rejection (close below swing low)`);
    } else if (current.low >= swingLow) {
      reasons.push(`No sweep: current low $${current.low.toFixed(2)} >= swing low $${swingLow.toFixed(2)}`);
    }

    const volumeSlice = candles.slice(-volumeWindow - 1, -1);
    const volumeSMA = volumeSlice.reduce((sum, c) => sum + c.volume, 0) / volumeSlice.length;
    const volumeMultiplier = volumeSMA > 0 ? current.volume / volumeSMA : 0;
    const gate2Passed = volumeMultiplier >= 1.5;
    
    if (gate2Passed) {
      reasons.push(`GATE 2 OPEN: Volume ${volumeMultiplier.toFixed(2)}x SMA (>1.5x required)`);
    } else {
      reasons.push(`Gate 2 closed: Volume ${volumeMultiplier.toFixed(2)}x SMA (<1.5x)`);
    }

    const allFVGs = this.detectFVG(candles, current.close);
    const bearishFVGsAbovePrice = allFVGs.filter(fvg => 
      fvg.type === 'bearish' && fvg.bottom > current.close
    );
    
    let gate3Passed = false;
    let targetFVG: FairValueGap | null = null;
    let isWeakSweep = false;
    
    if (gate1Passed && gate2Passed) {
      if (bearishFVGsAbovePrice.length > 0) {
        targetFVG = bearishFVGsAbovePrice.reduce((nearest, fvg) => 
          fvg.bottom < nearest.bottom ? fvg : nearest
        );
        gate3Passed = true;
        reasons.push(`GATE 3 OPEN: Found Magnet Zone at $${targetFVG.top.toFixed(2)}-$${targetFVG.bottom.toFixed(2)} (Target Exit)`);
      } else {
        isWeakSweep = true;
        reasons.push(`GATE 3 CLOSED: No Bearish FVG above price - Sweep is WEAK`);
      }
    } else {
      if (bearishFVGsAbovePrice.length > 0) {
        reasons.push(`Gate 3: ${bearishFVGsAbovePrice.length} Bearish FVG(s) detected above price (awaiting Gate 1 & 2)`);
      } else {
        reasons.push(`Gate 3: No Bearish FVG detected above current price`);
      }
    }

    const atr = this.calculateATR(candles, 14);
    const recentCloses = candles.slice(-10).map(c => c.close);
    const closeRange = Math.max(...recentCloses) - Math.min(...recentCloses);
    const adx = this.calculateADX(candles, 14);
    
    const isConsolidating = closeRange <= atr && adx < 25;
    
    if (isConsolidating) {
      reasons.push(`CONSOLIDATION: Range ${closeRange.toFixed(2)} <= ATR ${atr.toFixed(2)}, ADX ${adx.toFixed(1)} < 25`);
    }

    let status: 'sweep_confirmed' | 'sweep_rejected' | 'liquidity_building';
    
    if (isConsolidating) {
      status = 'liquidity_building';
      reasons.unshift('⏳ WAIT MODE: Liquidity Building - Sideways Movement Detected');
    } else if (gate1Passed && gate2Passed && gate3Passed) {
      status = 'sweep_confirmed';
      reasons.unshift('✅ FULL LIQUIDITY SWEEP CONFIRMED: All 3 Gates Open');
    } else if (gate1Passed && gate2Passed && !gate3Passed) {
      status = 'sweep_rejected';
      reasons.unshift('⚠️ WEAK SWEEP: Gate 1 & 2 Open but No FVG Target - Reduced Confidence');
    } else {
      status = 'sweep_rejected';
      if (!gate1Passed) {
        reasons.unshift('❌ NO ENTRY: Gate 1 Closed - No Valid Liquidity Sweep');
      } else {
        reasons.unshift('❌ NO ENTRY: Gate 2 Closed - Insufficient Volume Confirmation');
      }
    }

    return {
      status,
      gate1Passed,
      gate2Passed,
      gate3Passed,
      swingLow,
      currentLow: current.low,
      currentClose: current.close,
      volumeMultiplier,
      volumeSMA,
      currentVolume: current.volume,
      isConsolidating,
      isWeakSweep,
      targetFVG,
      allFVGs,
      reasons
    };
  }

  calculatePredictedMAs(candles: Candle[]): PredictedMovingAverages {
    const closes = candles.map(c => c.close);
    
    const shortTerm = this.calculateEMA(closes, 9);
    const mediumTerm = this.calculateEMA(closes, 21);
    const longTerm = this.calculateEMA(closes, 50);
    
    const shortTermPredicted = this.predictFutureMA(shortTerm, closes, 9);
    const mediumTermPredicted = this.predictFutureMA(mediumTerm, closes, 21);
    const longTermPredicted = this.predictFutureMA(longTerm, closes, 50);
    
    const prevCloses = closes.slice(0, -1);
    const prevShort = this.calculateEMA(prevCloses, 9);
    const prevMedium = this.calculateEMA(prevCloses, 21);
    const prevLong = this.calculateEMA(prevCloses, 50);
    
    const shortMediumCrossover = this.detectCrossover(shortTerm, mediumTerm, prevShort, prevMedium);
    const mediumLongCrossover = this.detectCrossover(mediumTerm, longTerm, prevMedium, prevLong);
    
    return {
      shortTerm,
      mediumTerm,
      longTerm,
      shortTermPredicted,
      mediumTermPredicted,
      longTermPredicted,
      crossovers: {
        shortMediumCross: shortMediumCrossover.type,
        mediumLongCross: mediumLongCrossover.type,
        crossedDaysAgo: Math.max(shortMediumCrossover.daysAgo, mediumLongCrossover.daysAgo)
      }
    };
  }

  calculateNeuralIndex(
    candles: Candle[], 
    intermarket?: IntermarketData
  ): NeuralIndex {
    const closes = candles.map(c => c.close);
    
    const rsi = this.calculateRSI(closes);
    const momentum = this.calculateMomentum(closes);
    const rvol = this.calculateRVOL(candles);
    const adx = this.calculateADX(candles);
    const zScore = this.calculateZScore(closes);
    
    const momentumSignal: 'bullish' | 'bearish' | 'neutral' = 
      momentum > 0.02 ? 'bullish' : momentum < -0.02 ? 'bearish' : 'neutral';
    
    const trendSignal: 'bullish' | 'bearish' | 'neutral' = 
      rsi > 55 && zScore > 0.5 ? 'bullish' : 
      rsi < 45 && zScore < -0.5 ? 'bearish' : 'neutral';
    
    const volumeSignal: 'bullish' | 'bearish' | 'neutral' = 
      rvol > 1.5 && momentum > 0 ? 'bullish' : 
      rvol > 1.5 && momentum < 0 ? 'bearish' : 'neutral';
    
    const intermarketSignal: 'bullish' | 'bearish' | 'neutral' = 
      intermarket?.spyTrend || 'neutral';
    
    const signals = [momentumSignal, trendSignal, volumeSignal, intermarketSignal];
    const bullishCount = signals.filter(s => s === 'bullish').length;
    const bearishCount = signals.filter(s => s === 'bearish').length;
    
    const direction: 'up' | 'down' | 'neutral' = 
      bullishCount >= 3 ? 'up' : bearishCount >= 3 ? 'down' : 'neutral';
    
    const completeAgreement = bullishCount === 4 || bearishCount === 4;
    const confidence = Math.max(bullishCount, bearishCount) / 4 * 100;
    
    return {
      direction,
      confidence,
      daysAhead: 1,
      indicatorAgreement: {
        momentum: momentumSignal,
        trend: trendSignal,
        volume: volumeSignal,
        intermarket: intermarketSignal
      },
      completeAgreement
    };
  }

  calculateTrendStrength(candles: Candle[]): TrendStrength {
    const closes = candles.map(c => c.close);
    
    const adx = this.calculateADX(candles);
    const momentum = this.calculateMomentum(closes);
    const rvol = this.calculateRVOL(candles);
    const zScore = this.calculateZScore(closes);
    
    const adxTrend: 'strong' | 'moderate' | 'weak' = 
      adx > 40 ? 'strong' : adx > 25 ? 'moderate' : 'weak';
    
    const momentumDirection: 'accelerating' | 'decelerating' | 'stable' = 
      Math.abs(momentum) > 0.03 ? (momentum > 0 ? 'accelerating' : 'decelerating') : 'stable';
    
    const rvolSignal: 'high' | 'normal' | 'low' = 
      rvol > 1.5 ? 'high' : rvol < 0.7 ? 'low' : 'normal';
    
    const overallStrength = (
      (adx / 50) * 30 + 
      (Math.abs(momentum) * 100) * 25 + 
      (rvol > 1 ? Math.min(rvol, 3) / 3 * 25 : 0) +
      (Math.abs(zScore) > 1 ? 20 : Math.abs(zScore) * 20)
    );
    
    return {
      adx,
      adxTrend,
      momentum: momentum * 100,
      momentumDirection,
      rvol,
      rvolSignal,
      zScore,
      overallStrength: Math.min(100, overallStrength)
    };
  }

  calculatePredictedRange(candles: Candle[]): PredictedRange {
    const atr = this.calculateATR(candles);
    const current = candles[candles.length - 1];
    const { high, low, confidence } = this.predictHighLow(candles, atr);
    
    const currentPrice = current?.close || 0;
    const upPotential = currentPrice > 0 ? ((high - currentPrice) / currentPrice) * 100 : 0;
    const downRisk = currentPrice > 0 ? ((currentPrice - low) / currentPrice) * 100 : 0;
    const riskRewardRatio = downRisk > 0 ? upPotential / downRisk : 1;
    
    return {
      predictedHigh: high,
      predictedLow: low,
      currentPrice,
      upPotential,
      downRisk,
      riskRewardRatio,
      confidence
    };
  }

  calculateDoubleConfirmation(
    neuralIndex: NeuralIndex,
    predictedMAs: PredictedMovingAverages,
    trendStrength: TrendStrength
  ): DoubleConfirmation {
    const filters = {
      neuralIndexUp: neuralIndex.direction === 'up',
      masCrossed: predictedMAs.crossovers.shortMediumCross !== 'none' || 
                  predictedMAs.crossovers.mediumLongCross !== 'none',
      momentumAligned: neuralIndex.indicatorAgreement.momentum !== 'neutral',
      volumeConfirmed: neuralIndex.indicatorAgreement.volume !== 'neutral',
      intermarketAligned: neuralIndex.indicatorAgreement.intermarket !== 'neutral',
      trendStrong: trendStrength.adxTrend !== 'weak'
    };
    
    const signals: string[] = [];
    let score = 0;
    
    if (filters.neuralIndexUp) { signals.push('Neural Index UP'); score += 20; }
    if (filters.masCrossed) { signals.push('MA Crossover Detected'); score += 15; }
    if (filters.momentumAligned) { signals.push('Momentum Aligned'); score += 15; }
    if (filters.volumeConfirmed) { signals.push('Volume Confirmed'); score += 15; }
    if (filters.intermarketAligned) { signals.push('Intermarket Aligned'); score += 15; }
    if (filters.trendStrong) { signals.push('Strong Trend (ADX)'); score += 20; }
    
    if (neuralIndex.completeAgreement) {
      signals.push('COMPLETE AGREEMENT');
      score += 30;
    }
    
    const requiredScore = 70;
    
    return {
      confirmed: score >= requiredScore,
      signals,
      score: Math.min(100, score),
      requiredScore,
      filters
    };
  }

  async generatePredictiveSnapshot(
    symbol: string,
    candles: Candle[],
    intermarket?: IntermarketData
  ): Promise<PredictiveSnapshot> {
    const cacheKey = `${symbol}-${candles.length}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }
    
    const predictedMAs = this.calculatePredictedMAs(candles);
    const neuralIndex = this.calculateNeuralIndex(candles, intermarket);
    const trendStrength = this.calculateTrendStrength(candles);
    const predictedRange = this.calculatePredictedRange(candles);
    const doubleConfirmation = this.calculateDoubleConfirmation(neuralIndex, predictedMAs, trendStrength);
    const liquiditySweep = this.calculateLiquiditySweep(candles);
    
    const zeroLagAnalysis = zeroLagIndicatorEngine.getLatestValues(candles);
    const zeroLag: ZeroLagData = {
      zlema20: zeroLagAnalysis.zlema20,
      hma20: zeroLagAnalysis.hma20,
      tema20: zeroLagAnalysis.tema20,
      dema20: zeroLagAnalysis.dema20,
      kama10: zeroLagAnalysis.kama10,
      roc10: zeroLagAnalysis.roc10,
      zlemaMACD: zeroLagAnalysis.zlemaMACD,
      temaMACD: zeroLagAnalysis.temaMACD
    };
    const orderFlow = zeroLagAnalysis.orderFlow;
    const regime = zeroLagAnalysis.regime;
    
    const advancedAnalysis = advancedIndicatorEngine.getLatestValues(candles);
    
    let orderBook: OrderBookSnapshot | null = null;
    let trueOrderFlow: AggregatedTrade | null = null;
    
    const isCrypto = symbol.endsWith('USDT') || symbol.endsWith('BTC') || symbol.endsWith('ETH');
    if (isCrypto) {
      try {
        [orderBook, trueOrderFlow] = await Promise.all([
          fetchBinanceOrderBook(symbol),
          fetchBinanceRecentTrades(symbol)
        ]);
      } catch (e) {
      }
    }
    
    const mtfAlignment = advancedIndicatorEngine.calculateMultiTimeframeAlignment(
      candles.slice(-20),
      candles.slice(-60),
      candles
    );
    
    const enhancedScore = advancedIndicatorEngine.calculateEnhancedSignalScore(
      doubleConfirmation.score / 100,
      advancedAnalysis.marketStructure.structureConfirmed,
      liquiditySweep.gate2Passed,
      advancedAnalysis.sessionFilter.shouldTrade,
      mtfAlignment.isAligned || mtfAlignment.alignmentScore >= 0.66,
      advancedAnalysis.volatilityThreshold.atrMultiple >= 0.5 && advancedAnalysis.volatilityThreshold.atrMultiple <= 2.5
    );
    
    const advanced: AdvancedData = {
      superSmoother: advancedAnalysis.superSmoother,
      tsi: advancedAnalysis.tsi,
      tsiSignal: advancedAnalysis.tsiSignal,
      tsiHistogram: advancedAnalysis.tsiHistogram,
      adaptiveRsi: advancedAnalysis.adaptiveRsi,
      squeezeOn: advancedAnalysis.squeezeOn,
      squeezeFiring: advancedAnalysis.squeezeFiring,
      marketStructure: advancedAnalysis.marketStructure,
      sessionFilter: advancedAnalysis.sessionFilter,
      volatilityThreshold: advancedAnalysis.volatilityThreshold,
      mtfAlignment,
      enhancedScore,
      orderBook,
      trueOrderFlow
    };
    
    let overallSignal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
    let signalConfidence: number;
    
    const isConsolidating = liquiditySweep.isConsolidating || 
                            regime.regime === 'consolidating' || 
                            regime.regime === 'ranging' ||
                            !regime.shouldTrade;
    
    const sessionBlocked = !advancedAnalysis.sessionFilter.shouldTrade;
    const structureNotConfirmed = !advancedAnalysis.marketStructure.structureConfirmed && !advancedAnalysis.marketStructure.bosDetected;
    
    if (isConsolidating || sessionBlocked) {
      overallSignal = 'neutral';
      signalConfidence = sessionBlocked ? 15 : 20;
    } else if (liquiditySweep.status === 'liquidity_building') {
      overallSignal = 'neutral';
      signalConfidence = 30;
    } else if (enhancedScore.passesThreshold && liquiditySweep.status === 'sweep_confirmed') {
      const structureBias = advancedAnalysis.marketStructure.trendBias;
      const tsiPositive = advancedAnalysis.tsi > advancedAnalysis.tsiSignal;
      const squeezeConfirm = advancedAnalysis.squeezeFiring !== 'none';
      
      if (structureBias === 'bullish' || (neuralIndex.direction === 'up' && tsiPositive)) {
        overallSignal = (enhancedScore.metConfirmations >= 5 || squeezeConfirm) ? 'strong_buy' : 'buy';
        signalConfidence = enhancedScore.totalScore;
      } else if (structureBias === 'bearish' || (neuralIndex.direction === 'down' && !tsiPositive)) {
        overallSignal = (enhancedScore.metConfirmations >= 5 || squeezeConfirm) ? 'strong_sell' : 'sell';
        signalConfidence = enhancedScore.totalScore;
      } else {
        overallSignal = 'neutral';
        signalConfidence = 40;
      }
    } else if (liquiditySweep.status === 'sweep_confirmed' && doubleConfirmation.confirmed && neuralIndex.direction === 'up') {
      overallSignal = neuralIndex.completeAgreement ? 'strong_buy' : 'buy';
      signalConfidence = doubleConfirmation.score;
    } else if (liquiditySweep.status === 'sweep_confirmed' && doubleConfirmation.confirmed && neuralIndex.direction === 'down') {
      overallSignal = neuralIndex.completeAgreement ? 'strong_sell' : 'sell';
      signalConfidence = doubleConfirmation.score;
    } else if (doubleConfirmation.confirmed && neuralIndex.direction === 'up') {
      overallSignal = 'buy';
      signalConfidence = Math.min(doubleConfirmation.score, 60);
    } else if (doubleConfirmation.confirmed && neuralIndex.direction === 'down') {
      overallSignal = 'sell';
      signalConfidence = Math.min(doubleConfirmation.score, 60);
    } else {
      overallSignal = 'neutral';
      signalConfidence = 50;
    }
    
    const snapshot: PredictiveSnapshot = {
      symbol,
      timestamp: Date.now(),
      predictedMAs,
      neuralIndex,
      trendStrength,
      predictedRange,
      doubleConfirmation,
      liquiditySweep,
      zeroLag,
      orderFlow,
      regime,
      advanced,
      overallSignal,
      signalConfidence
    };
    
    this.cache.set(cacheKey, { data: snapshot, expiry: Date.now() + this.CACHE_TTL });
    
    return snapshot;
  }

  async batchGenerateSnapshots(
    assets: { symbol: string; candles: Candle[] }[],
    intermarket?: IntermarketData
  ): Promise<Map<string, PredictiveSnapshot>> {
    const results = new Map<string, PredictiveSnapshot>();
    
    await Promise.all(
      assets.map(async ({ symbol, candles }) => {
        const snapshot = await this.generatePredictiveSnapshot(symbol, candles, intermarket);
        results.set(symbol, snapshot);
      })
    );
    
    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const predictiveSignalEngine = new PredictiveSignalEngine();
export type { PredictedMovingAverages, NeuralIndex, TrendStrength, PredictedRange, DoubleConfirmation, IntermarketData, Candle, LiquiditySweepSignal, FairValueGap, AdvancedData };
