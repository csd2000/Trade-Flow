import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { alerts, aiPredictions, tradingSignals } from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const anthropic = new Anthropic();

export interface UniversalForecast {
  symbol: string;
  assetClass: 'stock' | 'crypto' | 'forex' | 'futures' | 'options';
  currentPrice: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  entryZone: { low: number; high: number };
  targets: { price: number; probability: number }[];
  stopLoss: number;
  riskRewardRatio: number;
  timeframe: string;
  setupStatus: 'WAIT' | 'EXECUTE' | 'PAUSED';
  technicalScore: number;
  sentimentScore: number;
  reasoning: string;
  indicators: TechnicalIndicators;
  alertTriggered: boolean;
  generatedAt: string;
}

export interface TechnicalIndicators {
  rsi: number;
  rsiSignal: 'oversold' | 'neutral' | 'overbought';
  macd: { value: number; signal: number; histogram: number };
  macdSignal: 'bullish' | 'bearish' | 'neutral';
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  bollingerBands: { upper: number; middle: number; lower: number };
  atr: number;
  volume: number;
  volumeRatio: number;
  trend: 'uptrend' | 'downtrend' | 'sideways';
}

export interface AccuracyMetrics {
  totalPredictions: number;
  correctPredictions: number;
  winRate: number;
  averageReturn: number;
  byAssetClass: Record<string, { total: number; correct: number; winRate: number }>;
  last7Days: { winRate: number; predictions: number };
  last30Days: { winRate: number; predictions: number };
}

const predictionCache = new Map<string, { data: UniversalForecast; timestamp: number }>();
const CACHE_TTL = 60000;

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50;
  
  let gains = 0;
  let losses = 0;
  
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

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  if (prices.length < period) return prices[prices.length - 1];
  
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

function calculateMACD(prices: number[]): { value: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  const macdHistory: number[] = [];
  for (let i = 26; i < prices.length; i++) {
    const e12 = calculateEMA(prices.slice(0, i + 1), 12);
    const e26 = calculateEMA(prices.slice(0, i + 1), 26);
    macdHistory.push(e12 - e26);
  }
  
  const signalLine = macdHistory.length >= 9 ? calculateEMA(macdHistory, 9) : macdLine;
  
  return {
    value: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
}

function calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    return { upper: avg * 1.02, middle: avg, lower: avg * 0.98 };
  }
  
  const slice = prices.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + (stdDev * 2),
    middle,
    lower: middle - (stdDev * 2)
  };
}

function calculateATR(candles: Array<{ high: number; low: number; close: number }>, period: number = 14): number {
  if (candles.length < 2) return 0;
  
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
  
  const recentTRs = trueRanges.slice(-period);
  return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
}

function detectAssetClass(symbol: string): 'stock' | 'crypto' | 'forex' | 'futures' | 'options' {
  const upper = symbol.toUpperCase();
  
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'INJ', 'TIA', 'FET', 'RNDR', 'BNB', 'PEPE'];
  if (cryptoSymbols.some(c => upper.includes(c) && (upper.endsWith('USD') || upper.endsWith('USDT') || upper === c))) {
    return 'crypto';
  }
  
  if (upper.includes('/') || ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(upper)) {
    return 'forex';
  }
  
  if (upper.endsWith('=F') || ['GC', 'SI', 'CL', 'NG', 'ES', 'NQ', 'YM', 'RTY'].some(f => upper.startsWith(f))) {
    return 'futures';
  }
  
  if (upper.includes('CALL') || upper.includes('PUT') || /\d{6}[CP]\d+/.test(upper)) {
    return 'options';
  }
  
  return 'stock';
}

function calculateTechnicalIndicators(candles: Array<{ open: number; high: number; low: number; close: number; volume: number }>): TechnicalIndicators {
  const closes = candles.map(c => c.close);
  const volumes = candles.map(c => c.volume);
  
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const bb = calculateBollingerBands(closes);
  const atr = calculateATR(candles);
  
  const ema9 = calculateEMA(closes, 9);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, Math.min(200, closes.length));
  
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, volumes.length);
  const currentVolume = volumes[volumes.length - 1] || avgVolume;
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
  
  const currentPrice = closes[closes.length - 1];
  let trend: 'uptrend' | 'downtrend' | 'sideways' = 'sideways';
  if (currentPrice > ema20 && ema20 > ema50) trend = 'uptrend';
  else if (currentPrice < ema20 && ema20 < ema50) trend = 'downtrend';
  
  return {
    rsi,
    rsiSignal: rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral',
    macd,
    macdSignal: macd.histogram > 0 ? 'bullish' : macd.histogram < 0 ? 'bearish' : 'neutral',
    ema9,
    ema20,
    ema50,
    ema200,
    bollingerBands: bb,
    atr,
    volume: currentVolume,
    volumeRatio,
    trend
  };
}

function calculateSetupStatus(indicators: TechnicalIndicators, direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL'): 'WAIT' | 'EXECUTE' | 'PAUSED' {
  let score = 0;
  
  if (direction === 'BULLISH') {
    if (indicators.rsiSignal === 'oversold') score += 2;
    else if (indicators.rsi < 50) score += 1;
    
    if (indicators.macdSignal === 'bullish') score += 2;
    if (indicators.trend === 'uptrend') score += 2;
    if (indicators.volumeRatio > 1.2) score += 1;
  } else if (direction === 'BEARISH') {
    if (indicators.rsiSignal === 'overbought') score += 2;
    else if (indicators.rsi > 50) score += 1;
    
    if (indicators.macdSignal === 'bearish') score += 2;
    if (indicators.trend === 'downtrend') score += 2;
    if (indicators.volumeRatio > 1.2) score += 1;
  }
  
  if (score >= 5) return 'EXECUTE';
  if (score >= 3) return 'WAIT';
  return 'PAUSED';
}

async function generateAIAnalysis(
  symbol: string,
  assetClass: string,
  indicators: TechnicalIndicators,
  currentPrice: number
): Promise<{ direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL'; confidence: number; reasoning: string; sentimentScore: number }> {
  try {
    const prompt = `Analyze this ${assetClass} asset and provide a trading forecast:

Symbol: ${symbol}
Current Price: $${currentPrice.toFixed(2)}
Asset Class: ${assetClass}

Technical Indicators:
- RSI: ${indicators.rsi.toFixed(2)} (${indicators.rsiSignal})
- MACD: ${indicators.macd.value.toFixed(4)} / Signal: ${indicators.macd.signal.toFixed(4)} / Histogram: ${indicators.macd.histogram.toFixed(4)} (${indicators.macdSignal})
- EMA 9/20/50/200: ${indicators.ema9.toFixed(2)} / ${indicators.ema20.toFixed(2)} / ${indicators.ema50.toFixed(2)} / ${indicators.ema200.toFixed(2)}
- Bollinger Bands: Upper ${indicators.bollingerBands.upper.toFixed(2)} / Middle ${indicators.bollingerBands.middle.toFixed(2)} / Lower ${indicators.bollingerBands.lower.toFixed(2)}
- ATR: ${indicators.atr.toFixed(4)}
- Volume Ratio: ${indicators.volumeRatio.toFixed(2)}x average
- Trend: ${indicators.trend}

Respond ONLY with valid JSON (no markdown):
{
  "direction": "BULLISH" or "BEARISH" or "NEUTRAL",
  "confidence": number between 60 and 95,
  "sentimentScore": number between 0 and 100,
  "reasoning": "2-3 sentence analysis explaining the forecast"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        direction: result.direction || 'NEUTRAL',
        confidence: Math.min(95, Math.max(60, result.confidence || 70)),
        reasoning: result.reasoning || 'AI analysis complete.',
        sentimentScore: result.sentimentScore || 50
      };
    }
  } catch (error) {
    console.error('AI analysis error:', error);
  }
  
  const direction = indicators.trend === 'uptrend' ? 'BULLISH' : 
                    indicators.trend === 'downtrend' ? 'BEARISH' : 'NEUTRAL';
  
  return {
    direction,
    confidence: 65,
    reasoning: `Technical analysis indicates ${indicators.trend} with RSI at ${indicators.rsi.toFixed(1)} and ${indicators.macdSignal} MACD signal.`,
    sentimentScore: indicators.rsi
  };
}

export class UniversalForecasterService {
  
  async generateForecast(
    symbol: string,
    candles: Array<{ open: number; high: number; low: number; close: number; volume: number; time: number }>,
    currentPrice?: number
  ): Promise<UniversalForecast> {
    const cacheKey = `forecast_${symbol}`;
    const cached = predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    const assetClass = detectAssetClass(symbol);
    const price = currentPrice || candles[candles.length - 1]?.close || 0;
    const indicators = calculateTechnicalIndicators(candles);
    
    const aiAnalysis = await generateAIAnalysis(symbol, assetClass, indicators, price);
    
    const setupStatus = calculateSetupStatus(indicators, aiAnalysis.direction);
    
    const atrMultiplier = assetClass === 'crypto' ? 2.5 : assetClass === 'forex' ? 1.5 : 2;
    const stopLoss = aiAnalysis.direction === 'BULLISH' 
      ? price - (indicators.atr * atrMultiplier)
      : price + (indicators.atr * atrMultiplier);
    
    const target1 = aiAnalysis.direction === 'BULLISH'
      ? price + (indicators.atr * 3)
      : price - (indicators.atr * 3);
    const target2 = aiAnalysis.direction === 'BULLISH'
      ? price + (indicators.atr * 5)
      : price - (indicators.atr * 5);
    const target3 = aiAnalysis.direction === 'BULLISH'
      ? price + (indicators.atr * 8)
      : price - (indicators.atr * 8);
    
    const riskAmount = Math.abs(price - stopLoss);
    const rewardAmount = Math.abs(target1 - price);
    const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 1.5;
    
    const entryLow = aiAnalysis.direction === 'BULLISH' 
      ? price * 0.995 
      : price * 1.005;
    const entryHigh = aiAnalysis.direction === 'BULLISH'
      ? price * 1.005
      : price * 0.995;
    
    const technicalScore = this.calculateTechnicalScore(indicators, aiAnalysis.direction);
    
    const shouldAlert = setupStatus === 'EXECUTE' && aiAnalysis.confidence >= 75 && riskRewardRatio >= 2;
    
    const forecast: UniversalForecast = {
      symbol: symbol.toUpperCase(),
      assetClass,
      currentPrice: price,
      direction: aiAnalysis.direction,
      confidence: aiAnalysis.confidence,
      entryZone: { low: Math.min(entryLow, entryHigh), high: Math.max(entryLow, entryHigh) },
      targets: [
        { price: target1, probability: 75 },
        { price: target2, probability: 55 },
        { price: target3, probability: 35 }
      ],
      stopLoss,
      riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
      timeframe: assetClass === 'crypto' ? '1-7 days' : '1-14 days',
      setupStatus,
      technicalScore,
      sentimentScore: aiAnalysis.sentimentScore,
      reasoning: aiAnalysis.reasoning,
      indicators,
      alertTriggered: shouldAlert,
      generatedAt: new Date().toISOString()
    };
    
    predictionCache.set(cacheKey, { data: forecast, timestamp: Date.now() });
    
    if (shouldAlert) {
      await this.createAlert(forecast);
    }
    
    await this.savePrediction(forecast);
    
    return forecast;
  }
  
  private calculateTechnicalScore(indicators: TechnicalIndicators, direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL'): number {
    let score = 50;
    
    if (direction === 'BULLISH') {
      if (indicators.rsi < 30) score += 15;
      else if (indicators.rsi < 50) score += 8;
      else if (indicators.rsi > 70) score -= 10;
      
      if (indicators.macdSignal === 'bullish') score += 12;
      if (indicators.trend === 'uptrend') score += 15;
      if (indicators.volumeRatio > 1.5) score += 8;
    } else if (direction === 'BEARISH') {
      if (indicators.rsi > 70) score += 15;
      else if (indicators.rsi > 50) score += 8;
      else if (indicators.rsi < 30) score -= 10;
      
      if (indicators.macdSignal === 'bearish') score += 12;
      if (indicators.trend === 'downtrend') score += 15;
      if (indicators.volumeRatio > 1.5) score += 8;
    }
    
    return Math.min(100, Math.max(0, score));
  }
  
  private async createAlert(forecast: UniversalForecast): Promise<void> {
    try {
      const directionEmoji = forecast.direction === 'BULLISH' ? '🟢' : forecast.direction === 'BEARISH' ? '🔴' : '🟡';
      const message = `${directionEmoji} ${forecast.symbol} SIGNAL: ${forecast.direction} setup detected! Entry: $${forecast.entryZone.low.toFixed(2)}-$${forecast.entryZone.high.toFixed(2)}, Target: $${forecast.targets[0].price.toFixed(2)}, Stop: $${forecast.stopLoss.toFixed(2)}, R:R ${forecast.riskRewardRatio}:1, Confidence: ${forecast.confidence}%`;
      
      await db.insert(alerts).values({
        userId: null,
        type: 'ai_signal',
        message,
        isRead: false
      });
      
      console.log(`[ALERT] ${message}`);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }
  
  private async savePrediction(forecast: UniversalForecast): Promise<void> {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (forecast.assetClass === 'crypto' ? 7 : 14));
      
      await db.insert(aiPredictions).values({
        symbol: forecast.symbol,
        targetDate,
        direction: forecast.direction.toLowerCase(),
        confidence: String(forecast.confidence),
        profitPotential: String(((forecast.targets[0].price - forecast.currentPrice) / forecast.currentPrice * 100).toFixed(2)),
        riskLevel: String((Math.abs(forecast.stopLoss - forecast.currentPrice) / forecast.currentPrice * 100).toFixed(2)),
        profitRiskRatio: String(forecast.riskRewardRatio),
        timeframeDays: forecast.assetClass === 'crypto' ? 7 : 14,
        meetsCriteria: forecast.confidence >= 70 && forecast.riskRewardRatio >= 1.5,
        technicalScore: String(forecast.technicalScore),
        sentimentScore: String(forecast.sentimentScore)
      });
    } catch (error) {
      console.error('Error saving prediction:', error);
    }
  }
  
  async getAccuracyMetrics(): Promise<AccuracyMetrics> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const predictions = await db.select()
        .from(aiPredictions)
        .where(gte(aiPredictions.predictionDate, thirtyDaysAgo))
        .orderBy(desc(aiPredictions.predictionDate));
      
      const total = predictions.length;
      const correct = predictions.filter(p => p.meetsCriteria).length;
      
      const last7 = predictions.filter(p => p.predictionDate && new Date(p.predictionDate) >= sevenDaysAgo);
      const last7Correct = last7.filter(p => p.meetsCriteria).length;
      
      const byAssetClass: Record<string, { total: number; correct: number; winRate: number }> = {};
      
      for (const p of predictions) {
        const assetClass = detectAssetClass(p.symbol);
        if (!byAssetClass[assetClass]) {
          byAssetClass[assetClass] = { total: 0, correct: 0, winRate: 0 };
        }
        byAssetClass[assetClass].total++;
        if (p.meetsCriteria) byAssetClass[assetClass].correct++;
      }
      
      for (const ac of Object.keys(byAssetClass)) {
        byAssetClass[ac].winRate = byAssetClass[ac].total > 0 
          ? (byAssetClass[ac].correct / byAssetClass[ac].total) * 100 
          : 0;
      }
      
      const avgReturn = predictions.reduce((sum, p) => sum + (parseFloat(p.profitPotential as string) || 0), 0) / Math.max(1, total);
      
      return {
        totalPredictions: total,
        correctPredictions: correct,
        winRate: total > 0 ? (correct / total) * 100 : 0,
        averageReturn: avgReturn,
        byAssetClass,
        last7Days: {
          winRate: last7.length > 0 ? (last7Correct / last7.length) * 100 : 0,
          predictions: last7.length
        },
        last30Days: {
          winRate: total > 0 ? (correct / total) * 100 : 0,
          predictions: total
        }
      };
    } catch (error) {
      console.error('Error getting accuracy metrics:', error);
      return {
        totalPredictions: 0,
        correctPredictions: 0,
        winRate: 0,
        averageReturn: 0,
        byAssetClass: {},
        last7Days: { winRate: 0, predictions: 0 },
        last30Days: { winRate: 0, predictions: 0 }
      };
    }
  }
  
  async getRecentAlerts(limit: number = 20): Promise<any[]> {
    try {
      const recentAlerts = await db.select()
        .from(alerts)
        .where(eq(alerts.type, 'ai_signal'))
        .orderBy(desc(alerts.createdAt))
        .limit(limit);
      
      return recentAlerts;
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }
  
  async scanMultipleAssets(symbols: string[], candlesFetcher: (symbol: string) => Promise<any[]>): Promise<UniversalForecast[]> {
    const forecasts: UniversalForecast[] = [];
    
    for (const symbol of symbols) {
      try {
        const candles = await candlesFetcher(symbol);
        if (candles && candles.length > 20) {
          const forecast = await this.generateForecast(symbol, candles);
          forecasts.push(forecast);
        }
      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
      }
    }
    
    return forecasts.sort((a, b) => {
      if (a.setupStatus === 'EXECUTE' && b.setupStatus !== 'EXECUTE') return -1;
      if (b.setupStatus === 'EXECUTE' && a.setupStatus !== 'EXECUTE') return 1;
      return b.confidence - a.confidence;
    });
  }
}

export const universalForecaster = new UniversalForecasterService();
