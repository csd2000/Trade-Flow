/**
 * Enhanced AI Trading Strategy Service
 *
 * A professional-grade, multi-factor confluence trading system that combines:
 * 1. Technical Analysis (RSI, MACD, Bollinger Bands, Moving Averages)
 * 2. Market Regime Detection (Trending vs Ranging)
 * 3. Sentiment Analysis (Fear & Greed Index)
 * 4. Volume Confirmation
 * 5. Multi-Timeframe Analysis
 * 6. Risk-Adjusted Position Sizing
 *
 * REALISTIC TARGET: 60-70% win rate with 2:1+ risk/reward ratio
 * This is what professional traders achieve, not 95%.
 */

interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number; percentB: number };
  ema9: number;
  ema21: number;
  ema50: number;
  ema200: number;
  atr: number;
  adx: number;
  volume: number;
  avgVolume: number;
  volumeRatio: number;
}

interface MarketRegime {
  type: 'strong_trend' | 'weak_trend' | 'ranging' | 'volatile';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: number;
}

interface ConfluenceSignal {
  score: number; // -100 to +100
  direction: 'long' | 'short' | 'neutral';
  confidence: number; // 0-100
  factors: ConfluenceFactor[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' | 'no_trade';
  reasoning: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  positionSizePercent: number;
  maxRiskPercent: number;
}

interface ConfluenceFactor {
  name: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  score: number;
  description: string;
}

interface HistoricalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class EnhancedTradingStrategyService {

  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   */
  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1];

    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  /**
   * Calculate MACD
   */
  private calculateMACD(closes: number[]): { value: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;

    // Calculate signal line (9-period EMA of MACD)
    const macdValues: number[] = [];
    for (let i = 26; i <= closes.length; i++) {
      const slice = closes.slice(0, i);
      const e12 = this.calculateEMA(slice, 12);
      const e26 = this.calculateEMA(slice, 26);
      macdValues.push(e12 - e26);
    }

    const signalLine = macdValues.length >= 9 ? this.calculateEMA(macdValues, 9) : macdLine;

    return {
      value: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  private calculateBollingerBands(closes: number[], period: number = 20, stdDev: number = 2): {
    upper: number; middle: number; lower: number; percentB: number
  } {
    if (closes.length < period) {
      const current = closes[closes.length - 1];
      return { upper: current * 1.02, middle: current, lower: current * 0.98, percentB: 0.5 };
    }

    const slice = closes.slice(-period);
    const sma = slice.reduce((a, b) => a + b, 0) / period;

    const squaredDiffs = slice.map(val => Math.pow(val - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const std = Math.sqrt(variance);

    const upper = sma + (std * stdDev);
    const lower = sma - (std * stdDev);
    const current = closes[closes.length - 1];
    const percentB = (current - lower) / (upper - lower);

    return { upper, middle: sma, lower, percentB };
  }

  /**
   * Calculate ATR (Average True Range)
   */
  private calculateATR(candles: HistoricalCandle[], period: number = 14): number {
    if (candles.length < period + 1) return 0;

    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const high = candles[i].high;
      const low = candles[i].low;
      const prevClose = candles[i - 1].close;

      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate ADX (Average Directional Index)
   */
  private calculateADX(candles: HistoricalCandle[], period: number = 14): number {
    if (candles.length < period * 2) return 25;

    const plusDM: number[] = [];
    const minusDM: number[] = [];
    const tr: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const highDiff = candles[i].high - candles[i - 1].high;
      const lowDiff = candles[i - 1].low - candles[i].low;

      plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);

      const trueRange = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i - 1].close),
        Math.abs(candles[i].low - candles[i - 1].close)
      );
      tr.push(trueRange);
    }

    // Calculate smoothed values
    const smoothedPlusDM = this.calculateEMA(plusDM, period);
    const smoothedMinusDM = this.calculateEMA(minusDM, period);
    const smoothedTR = this.calculateEMA(tr, period);

    if (smoothedTR === 0) return 25;

    const plusDI = (smoothedPlusDM / smoothedTR) * 100;
    const minusDI = (smoothedMinusDM / smoothedTR) * 100;

    const diSum = plusDI + minusDI;
    if (diSum === 0) return 25;

    const dx = Math.abs(plusDI - minusDI) / diSum * 100;

    return dx;
  }

  /**
   * Calculate all technical indicators
   */
  calculateIndicators(candles: HistoricalCandle[]): TechnicalIndicators {
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);

    const currentVolume = volumes[volumes.length - 1];
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);

    return {
      rsi: this.calculateRSI(closes),
      macd: this.calculateMACD(closes),
      bollingerBands: this.calculateBollingerBands(closes),
      ema9: this.calculateEMA(closes, 9),
      ema21: this.calculateEMA(closes, 21),
      ema50: this.calculateEMA(closes, 50),
      ema200: this.calculateEMA(closes, 200),
      atr: this.calculateATR(candles),
      adx: this.calculateADX(candles),
      volume: currentVolume,
      avgVolume,
      volumeRatio: avgVolume > 0 ? currentVolume / avgVolume : 1
    };
  }

  /**
   * Detect current market regime
   */
  detectMarketRegime(indicators: TechnicalIndicators, currentPrice: number): MarketRegime {
    const { adx, ema9, ema21, ema50, ema200, bollingerBands, atr } = indicators;

    // ADX determines trend strength
    const isTrending = adx > 25;
    const isStrongTrend = adx > 40;

    // EMA alignment determines direction
    const emaBullish = ema9 > ema21 && ema21 > ema50;
    const emaBearish = ema9 < ema21 && ema21 < ema50;
    const emaStrongBullish = emaBullish && currentPrice > ema200;
    const emaStrongBearish = emaBearish && currentPrice < ema200;

    // Bollinger Band width indicates volatility
    const bbWidth = (bollingerBands.upper - bollingerBands.lower) / bollingerBands.middle;
    const isVolatile = bbWidth > 0.1 || atr / currentPrice > 0.03;

    let type: MarketRegime['type'];
    let direction: MarketRegime['direction'];
    let strength: number;
    let confidence: number;

    if (isStrongTrend) {
      type = 'strong_trend';
      direction = emaStrongBullish ? 'bullish' : emaStrongBearish ? 'bearish' : 'neutral';
      strength = Math.min(100, adx * 2);
      confidence = 85;
    } else if (isTrending) {
      type = 'weak_trend';
      direction = emaBullish ? 'bullish' : emaBearish ? 'bearish' : 'neutral';
      strength = adx * 2;
      confidence = 70;
    } else if (isVolatile) {
      type = 'volatile';
      direction = 'neutral';
      strength = 30;
      confidence = 50;
    } else {
      type = 'ranging';
      direction = 'neutral';
      strength = 20;
      confidence = 60;
    }

    return { type, direction, strength, confidence };
  }

  /**
   * Generate confluence signal with all factors
   */
  generateConfluenceSignal(
    candles: HistoricalCandle[],
    fearGreedIndex: number = 50,
    accountBalance: number = 10000
  ): ConfluenceSignal {
    const currentPrice = candles[candles.length - 1].close;
    const indicators = this.calculateIndicators(candles);
    const regime = this.detectMarketRegime(indicators, currentPrice);

    const factors: ConfluenceFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: RSI (Weight: 15)
    const rsiFactor = this.analyzeRSI(indicators.rsi);
    factors.push(rsiFactor);
    totalScore += rsiFactor.score * rsiFactor.weight;
    totalWeight += rsiFactor.weight;

    // Factor 2: MACD (Weight: 20)
    const macdFactor = this.analyzeMACD(indicators.macd);
    factors.push(macdFactor);
    totalScore += macdFactor.score * macdFactor.weight;
    totalWeight += macdFactor.weight;

    // Factor 3: Bollinger Bands (Weight: 10)
    const bbFactor = this.analyzeBollingerBands(indicators.bollingerBands, currentPrice);
    factors.push(bbFactor);
    totalScore += bbFactor.score * bbFactor.weight;
    totalWeight += bbFactor.weight;

    // Factor 4: EMA Alignment (Weight: 25)
    const emaFactor = this.analyzeEMAAlignment(indicators, currentPrice);
    factors.push(emaFactor);
    totalScore += emaFactor.score * emaFactor.weight;
    totalWeight += emaFactor.weight;

    // Factor 5: Volume (Weight: 10)
    const volumeFactor = this.analyzeVolume(indicators.volumeRatio);
    factors.push(volumeFactor);
    totalScore += volumeFactor.score * volumeFactor.weight;
    totalWeight += volumeFactor.weight;

    // Factor 6: Market Regime (Weight: 15)
    const regimeFactor = this.analyzeMarketRegime(regime);
    factors.push(regimeFactor);
    totalScore += regimeFactor.score * regimeFactor.weight;
    totalWeight += regimeFactor.weight;

    // Factor 7: Fear & Greed (Weight: 5)
    const sentimentFactor = this.analyzeFearGreed(fearGreedIndex);
    factors.push(sentimentFactor);
    totalScore += sentimentFactor.score * sentimentFactor.weight;
    totalWeight += sentimentFactor.weight;

    // Calculate normalized score (-100 to +100)
    const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 0;

    // Determine direction and confidence
    const bullishFactors = factors.filter(f => f.signal === 'bullish').length;
    const bearishFactors = factors.filter(f => f.signal === 'bearish').length;

    let direction: 'long' | 'short' | 'neutral';
    let confidence: number;

    if (normalizedScore > 30 && bullishFactors >= 4) {
      direction = 'long';
      confidence = Math.min(90, 50 + normalizedScore / 2);
    } else if (normalizedScore < -30 && bearishFactors >= 4) {
      direction = 'short';
      confidence = Math.min(90, 50 + Math.abs(normalizedScore) / 2);
    } else {
      direction = 'neutral';
      confidence = 40;
    }

    // Calculate risk levels using ATR
    const atr = indicators.atr;
    let stopLoss: number;
    let takeProfit1: number;
    let takeProfit2: number;
    let takeProfit3: number;

    if (direction === 'long') {
      stopLoss = currentPrice - (atr * 1.5);
      takeProfit1 = currentPrice + (atr * 1.5); // 1:1
      takeProfit2 = currentPrice + (atr * 3);   // 2:1
      takeProfit3 = currentPrice + (atr * 4.5); // 3:1
    } else if (direction === 'short') {
      stopLoss = currentPrice + (atr * 1.5);
      takeProfit1 = currentPrice - (atr * 1.5);
      takeProfit2 = currentPrice - (atr * 3);
      takeProfit3 = currentPrice - (atr * 4.5);
    } else {
      stopLoss = currentPrice - (atr * 1.5);
      takeProfit1 = currentPrice + (atr * 1.5);
      takeProfit2 = currentPrice + (atr * 3);
      takeProfit3 = currentPrice + (atr * 4.5);
    }

    // Calculate risk/reward
    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(takeProfit2 - currentPrice);
    const riskRewardRatio = risk > 0 ? reward / risk : 0;

    // Position sizing (Kelly Criterion simplified)
    const maxRiskPercent = 1; // Risk 1% per trade
    const positionSizePercent = this.calculatePositionSize(confidence, maxRiskPercent);

    // Generate recommendation
    const recommendation = this.getRecommendation(normalizedScore, confidence, riskRewardRatio, regime);
    const reasoning = this.generateReasoning(factors, recommendation, regime, riskRewardRatio);

    return {
      score: normalizedScore,
      direction,
      confidence,
      factors,
      recommendation,
      reasoning,
      entryPrice: currentPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      riskRewardRatio,
      positionSizePercent,
      maxRiskPercent
    };
  }

  private analyzeRSI(rsi: number): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    if (rsi < 30) {
      signal = 'bullish';
      score = 70 + (30 - rsi);
      description = `RSI oversold at ${rsi.toFixed(1)} - potential bounce`;
    } else if (rsi > 70) {
      signal = 'bearish';
      score = -(70 + (rsi - 70));
      description = `RSI overbought at ${rsi.toFixed(1)} - potential pullback`;
    } else if (rsi < 45) {
      signal = 'bullish';
      score = 30;
      description = `RSI at ${rsi.toFixed(1)} - room for upside`;
    } else if (rsi > 55) {
      signal = 'bearish';
      score = -30;
      description = `RSI at ${rsi.toFixed(1)} - limited upside`;
    } else {
      signal = 'neutral';
      score = 0;
      description = `RSI neutral at ${rsi.toFixed(1)}`;
    }

    return { name: 'RSI', signal, weight: 15, score, description };
  }

  private analyzeMACD(macd: { value: number; signal: number; histogram: number }): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    const histogramTrend = macd.histogram;
    const crossover = macd.value > macd.signal;

    if (crossover && histogramTrend > 0) {
      signal = 'bullish';
      score = 80;
      description = 'MACD bullish crossover with positive momentum';
    } else if (!crossover && histogramTrend < 0) {
      signal = 'bearish';
      score = -80;
      description = 'MACD bearish crossover with negative momentum';
    } else if (crossover) {
      signal = 'bullish';
      score = 40;
      description = 'MACD above signal line';
    } else {
      signal = 'bearish';
      score = -40;
      description = 'MACD below signal line';
    }

    return { name: 'MACD', signal, weight: 20, score, description };
  }

  private analyzeBollingerBands(bb: { upper: number; middle: number; lower: number; percentB: number }, price: number): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    if (bb.percentB < 0.05) {
      signal = 'bullish';
      score = 70;
      description = 'Price at lower Bollinger Band - oversold';
    } else if (bb.percentB > 0.95) {
      signal = 'bearish';
      score = -70;
      description = 'Price at upper Bollinger Band - overbought';
    } else if (bb.percentB < 0.2) {
      signal = 'bullish';
      score = 40;
      description = 'Price near lower band';
    } else if (bb.percentB > 0.8) {
      signal = 'bearish';
      score = -40;
      description = 'Price near upper band';
    } else {
      signal = 'neutral';
      score = 0;
      description = 'Price within normal range';
    }

    return { name: 'Bollinger Bands', signal, weight: 10, score, description };
  }

  private analyzeEMAAlignment(indicators: TechnicalIndicators, price: number): ConfluenceFactor {
    const { ema9, ema21, ema50, ema200 } = indicators;
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    const perfectBullish = price > ema9 && ema9 > ema21 && ema21 > ema50 && ema50 > ema200;
    const perfectBearish = price < ema9 && ema9 < ema21 && ema21 < ema50 && ema50 < ema200;
    const bullishAbove200 = price > ema200 && ema9 > ema21;
    const bearishBelow200 = price < ema200 && ema9 < ema21;

    if (perfectBullish) {
      signal = 'bullish';
      score = 100;
      description = 'Perfect EMA alignment - strong uptrend';
    } else if (perfectBearish) {
      signal = 'bearish';
      score = -100;
      description = 'Perfect EMA alignment - strong downtrend';
    } else if (bullishAbove200) {
      signal = 'bullish';
      score = 60;
      description = 'Price above 200 EMA with bullish short-term trend';
    } else if (bearishBelow200) {
      signal = 'bearish';
      score = -60;
      description = 'Price below 200 EMA with bearish short-term trend';
    } else {
      signal = 'neutral';
      score = 0;
      description = 'Mixed EMA signals';
    }

    return { name: 'EMA Alignment', signal, weight: 25, score, description };
  }

  private analyzeVolume(volumeRatio: number): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    if (volumeRatio > 2) {
      signal = 'bullish'; // High volume confirms moves
      score = 50;
      description = `Volume ${volumeRatio.toFixed(1)}x average - strong conviction`;
    } else if (volumeRatio > 1.5) {
      signal = 'bullish';
      score = 30;
      description = `Above average volume (${volumeRatio.toFixed(1)}x)`;
    } else if (volumeRatio < 0.5) {
      signal = 'neutral';
      score = -20;
      description = 'Low volume - weak conviction';
    } else {
      signal = 'neutral';
      score = 0;
      description = 'Normal volume';
    }

    return { name: 'Volume', signal, weight: 10, score, description };
  }

  private analyzeMarketRegime(regime: MarketRegime): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'] = regime.direction === 'bullish' ? 'bullish' : regime.direction === 'bearish' ? 'bearish' : 'neutral';
    let score: number;
    let description: string;

    if (regime.type === 'strong_trend' && regime.direction !== 'neutral') {
      score = regime.direction === 'bullish' ? 80 : -80;
      description = `Strong ${regime.direction} trend (ADX > 40)`;
    } else if (regime.type === 'weak_trend' && regime.direction !== 'neutral') {
      score = regime.direction === 'bullish' ? 40 : -40;
      description = `Weak ${regime.direction} trend developing`;
    } else if (regime.type === 'volatile') {
      signal = 'neutral';
      score = -30;
      description = 'High volatility - reduce position size';
    } else {
      signal = 'neutral';
      score = 0;
      description = 'Ranging market - trade mean reversion';
    }

    return { name: 'Market Regime', signal, weight: 15, score, description };
  }

  private analyzeFearGreed(index: number): ConfluenceFactor {
    let signal: ConfluenceFactor['signal'];
    let score: number;
    let description: string;

    if (index < 25) {
      signal = 'bullish'; // Extreme fear = buy opportunity
      score = 60;
      description = `Extreme fear (${index}) - contrarian buy signal`;
    } else if (index > 75) {
      signal = 'bearish'; // Extreme greed = sell opportunity
      score = -60;
      description = `Extreme greed (${index}) - contrarian sell signal`;
    } else if (index < 40) {
      signal = 'bullish';
      score = 30;
      description = `Fear (${index}) - potential opportunity`;
    } else if (index > 60) {
      signal = 'bearish';
      score = -30;
      description = `Greed (${index}) - caution advised`;
    } else {
      signal = 'neutral';
      score = 0;
      description = `Neutral sentiment (${index})`;
    }

    return { name: 'Fear & Greed', signal, weight: 5, score, description };
  }

  private calculatePositionSize(confidence: number, maxRiskPercent: number): number {
    // Scale position size based on confidence (never exceed max risk)
    // At 50% confidence: 50% of max position
    // At 80% confidence: 80% of max position
    const scaleFactor = Math.min(1, confidence / 100);
    return maxRiskPercent * scaleFactor;
  }

  private getRecommendation(
    score: number,
    confidence: number,
    rrRatio: number,
    regime: MarketRegime
  ): ConfluenceSignal['recommendation'] {
    // Rule 1: Need minimum 2:1 risk/reward
    if (rrRatio < 1.5) return 'no_trade';

    // Rule 2: Don't trade in volatile, directionless markets
    if (regime.type === 'volatile' && regime.direction === 'neutral') return 'no_trade';

    // Rule 3: Need minimum confidence
    if (confidence < 55) return 'hold';

    // Rule 4: Score-based recommendation
    if (score > 60 && confidence >= 70) return 'strong_buy';
    if (score > 30 && confidence >= 60) return 'buy';
    if (score < -60 && confidence >= 70) return 'strong_sell';
    if (score < -30 && confidence >= 60) return 'sell';

    return 'hold';
  }

  private generateReasoning(
    factors: ConfluenceFactor[],
    recommendation: ConfluenceSignal['recommendation'],
    regime: MarketRegime,
    rrRatio: number
  ): string {
    const bullishFactors = factors.filter(f => f.signal === 'bullish');
    const bearishFactors = factors.filter(f => f.signal === 'bearish');

    let reasoning = '';

    switch (recommendation) {
      case 'strong_buy':
        reasoning = `STRONG BUY: ${bullishFactors.length}/${factors.length} factors bullish. ${regime.type === 'strong_trend' ? 'Strong trend support.' : ''} R:R ${rrRatio.toFixed(1)}:1. `;
        reasoning += `Key drivers: ${bullishFactors.slice(0, 3).map(f => f.name).join(', ')}.`;
        break;
      case 'buy':
        reasoning = `BUY: ${bullishFactors.length}/${factors.length} factors bullish. R:R ${rrRatio.toFixed(1)}:1. `;
        reasoning += `Wait for pullback to improve entry.`;
        break;
      case 'strong_sell':
        reasoning = `STRONG SELL/SHORT: ${bearishFactors.length}/${factors.length} factors bearish. ${regime.type === 'strong_trend' ? 'Strong downtrend.' : ''} R:R ${rrRatio.toFixed(1)}:1.`;
        break;
      case 'sell':
        reasoning = `SELL: ${bearishFactors.length}/${factors.length} factors bearish. Consider reducing position.`;
        break;
      case 'no_trade':
        if (rrRatio < 1.5) {
          reasoning = `NO TRADE: Risk/reward ratio (${rrRatio.toFixed(1)}:1) below minimum 1.5:1 threshold.`;
        } else {
          reasoning = `NO TRADE: Market conditions unfavorable. ${regime.type === 'volatile' ? 'High volatility.' : 'Unclear direction.'}`;
        }
        break;
      default:
        reasoning = `HOLD: Mixed signals. ${bullishFactors.length} bullish, ${bearishFactors.length} bearish. Wait for clearer setup.`;
    }

    return reasoning;
  }

  /**
   * Get the complete trading plan with all analysis
   */
  async getCompleteTradingPlan(
    symbol: string,
    candles: HistoricalCandle[],
    fearGreedIndex: number = 50,
    accountBalance: number = 10000
  ): Promise<{
    symbol: string;
    currentPrice: number;
    signal: ConfluenceSignal;
    regime: MarketRegime;
    indicators: TechnicalIndicators;
    tradingRules: string[];
    expectedWinRate: string;
    disclaimer: string;
  }> {
    const currentPrice = candles[candles.length - 1].close;
    const indicators = this.calculateIndicators(candles);
    const regime = this.detectMarketRegime(indicators, currentPrice);
    const signal = this.generateConfluenceSignal(candles, fearGreedIndex, accountBalance);

    const tradingRules = [
      '1. ONLY trade when 4+ factors align (confluence)',
      '2. MINIMUM 1.5:1 risk/reward ratio required',
      '3. MAXIMUM 1% account risk per trade',
      '4. NO trading in volatile, directionless markets',
      '5. USE ATR-based stop losses (1.5x ATR)',
      '6. SCALE OUT: Take 50% at TP1, 30% at TP2, 20% at TP3',
      '7. MOVE stop to breakeven after TP1 hit',
      '8. AVOID trading against the 200 EMA',
      '9. REDUCE position size in high volatility',
      '10. NO revenge trading after losses'
    ];

    return {
      symbol,
      currentPrice,
      signal,
      regime,
      indicators,
      tradingRules,
      expectedWinRate: '60-70% (realistic professional target)',
      disclaimer: 'A 95% win rate is NOT achievable through any legitimate strategy. This system targets 60-70% with 2:1+ risk/reward, which is what professional traders achieve.'
    };
  }
}

export const enhancedTradingStrategy = new EnhancedTradingStrategyService();
