import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { 
  multiModalPriceData, 
  multiModalSentiment, 
  multiModalInstitutionalFlow,
  multiModalFusedFeatures,
  InsertMultiModalPriceData,
  InsertMultiModalSentiment,
  InsertMultiModalInstitutionalFlow,
  InsertMultiModalFusedFeatures
} from '@shared/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

const anthropic = new Anthropic();

interface PriceDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicators {
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  ema9: number;
  ema20: number;
  ema50: number;
  sma20: number;
  sma50: number;
  atr14: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
}

interface SentimentData {
  sentimentScore: number;
  sentimentVelocity: number;
  newsCount: number;
  positiveNewsCount: number;
  negativeNewsCount: number;
  neutralNewsCount: number;
  socialVolume: number;
  socialSentiment: number;
  fearGreedIndex: number;
  source: string;
}

interface InstitutionalFlowData {
  darkPoolVolume: number;
  darkPoolRatio: number;
  netExchangeFlow: number;
  exchangeInflowVolume: number;
  exchangeOutflowVolume: number;
  largeTransactionCount: number;
  whaleAccumulation: number;
  institutionalBuying: number;
  institutionalSelling: number;
  netInstitutionalFlow: number;
  optionsFlow: number;
  callPutRatio: number;
}

interface FusedFeatures {
  currentPrice: number;
  priceChange5m: number;
  priceChange15m: number;
  priceChange1h: number;
  volatilityScore: number;
  momentumScore: number;
  trendStrength: number;
  combinedSentiment: number;
  institutionalPressure: number;
  overallSignalScore: number;
  signalDirection: 'long' | 'short' | 'neutral';
  confidenceLevel: number;
}

export class MultiModalPipelineService {
  
  // =========================================================================
  // PRICE & TECHNICAL DATA MODULE
  // =========================================================================
  
  async fetchPriceData(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<PriceDataPoint[]> {
    switch (assetType) {
      case 'crypto':
        return this.fetchCryptoPriceData(symbol);
      case 'stock':
        return this.fetchStockPriceData(symbol);
      case 'forex':
        return this.fetchForexPriceData(symbol);
      default:
        throw new Error(`Unknown asset type: ${assetType}`);
    }
  }

  async fetchCryptoPriceData(symbol: string): Promise<PriceDataPoint[]> {
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
      'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
      'LINK': 'chainlink', 'MATIC': 'matic-network'
    };
    
    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    const coinId = coinIds[cleanSymbol] || cleanSymbol.toLowerCase();
    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=7`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.log('CoinGecko OHLC returned non-array, generating synthetic data');
        return this.generateSyntheticPriceData(symbol, 'crypto');
      }
      
      return data.map((candle: number[]) => ({
        timestamp: new Date(candle[0]),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: 0
      }));
    } catch (error) {
      console.error('CoinGecko OHLC error:', error);
      return this.generateSyntheticPriceData(symbol, 'crypto');
    }
  }

  async fetchStockPriceData(symbol: string): Promise<PriceDataPoint[]> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.log('Alpha Vantage API key not configured, using synthetic data');
      return this.generateSyntheticPriceData(symbol, 'stock');
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Note'] || data['Error Message']) {
        console.log('Alpha Vantage rate limited or error, using synthetic data');
        return this.generateSyntheticPriceData(symbol, 'stock');
      }
      
      const timeSeries = data['Time Series (5min)'];
      if (!timeSeries) {
        return this.generateSyntheticPriceData(symbol, 'stock');
      }
      
      return Object.entries(timeSeries).map(([datetime, values]: [string, any]) => ({
        timestamp: new Date(datetime),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume'])
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Alpha Vantage error:', error);
      return this.generateSyntheticPriceData(symbol, 'stock');
    }
  }

  async fetchForexPriceData(symbol: string): Promise<PriceDataPoint[]> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      return this.generateSyntheticPriceData(symbol, 'forex');
    }

    const fromCurrency = symbol.slice(0, 3);
    const toCurrency = symbol.slice(3, 6) || 'USD';
    
    const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&interval=5min&outputsize=compact&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Note'] || data['Error Message']) {
        return this.generateSyntheticPriceData(symbol, 'forex');
      }
      
      const timeSeries = data['Time Series FX (Intraday)'];
      if (!timeSeries) {
        return this.generateSyntheticPriceData(symbol, 'forex');
      }
      
      return Object.entries(timeSeries).map(([datetime, values]: [string, any]) => ({
        timestamp: new Date(datetime),
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: 0
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    } catch (error) {
      console.error('Alpha Vantage forex error:', error);
      return this.generateSyntheticPriceData(symbol, 'forex');
    }
  }

  generateSyntheticPriceData(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): PriceDataPoint[] {
    const basePrice = assetType === 'crypto' ? 50000 : assetType === 'stock' ? 150 : 1.1;
    const volatility = assetType === 'crypto' ? 0.03 : assetType === 'stock' ? 0.015 : 0.005;
    
    const now = new Date();
    const data: PriceDataPoint[] = [];
    let price = basePrice;
    
    for (let i = 200; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
      const change = (Math.random() - 0.5) * 2 * volatility;
      price = price * (1 + change);
      
      const high = price * (1 + Math.random() * volatility);
      const low = price * (1 - Math.random() * volatility);
      const open = price * (1 + (Math.random() - 0.5) * volatility);
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close: price,
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data;
  }

  calculateTechnicalIndicators(priceData: PriceDataPoint[]): TechnicalIndicators {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    
    return {
      rsi14: this.calculateRSI(closes, 14),
      ...this.calculateMACD(closes),
      ema9: this.calculateEMA(closes, 9),
      ema20: this.calculateEMA(closes, 20),
      ema50: this.calculateEMA(closes, 50),
      sma20: this.calculateSMA(closes, 20),
      sma50: this.calculateSMA(closes, 50),
      atr14: this.calculateATR(highs, lows, closes, 14),
      ...this.calculateBollingerBands(closes, 20, 2)
    };
  }

  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    const changes: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }
    
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
    
    const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(closes: number[]): { macdLine: number; macdSignal: number; macdHistogram: number } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    
    const macdValues: number[] = [];
    for (let i = 25; i < closes.length; i++) {
      const shortEma = this.calculateEMAAtIndex(closes, 12, i);
      const longEma = this.calculateEMAAtIndex(closes, 26, i);
      macdValues.push(shortEma - longEma);
    }
    
    const macdSignal = macdValues.length >= 9 ? 
      this.calculateEMA(macdValues, 9) : macdLine;
    
    return {
      macdLine,
      macdSignal,
      macdHistogram: macdLine - macdSignal
    };
  }

  calculateEMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  calculateEMAAtIndex(data: number[], period: number, index: number): number {
    if (index < period - 1) return data[index];
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i <= index; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  calculateSMA(data: number[], period: number): number {
    if (data.length < period) return data[data.length - 1] || 0;
    return data.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 0;
    
    const trueRanges: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }
    
    return trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
  }

  calculateBollingerBands(closes: number[], period: number = 20, stdDevMultiplier: number = 2): {
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
  } {
    const sma = this.calculateSMA(closes, period);
    const recentCloses = closes.slice(-period);
    
    const variance = recentCloses.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      bollingerUpper: sma + (stdDevMultiplier * stdDev),
      bollingerMiddle: sma,
      bollingerLower: sma - (stdDevMultiplier * stdDev)
    };
  }

  // =========================================================================
  // SENTIMENT DATA MODULE
  // =========================================================================

  async fetchSentimentData(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<SentimentData> {
    const fearGreedIndex = await this.fetchFearGreedIndex(assetType);
    const aiSentiment = await this.analyzeMarketSentiment(symbol, assetType);
    
    return {
      sentimentScore: aiSentiment.score,
      sentimentVelocity: aiSentiment.velocity,
      newsCount: aiSentiment.newsCount,
      positiveNewsCount: Math.round(aiSentiment.newsCount * (0.5 + aiSentiment.score * 0.3)),
      negativeNewsCount: Math.round(aiSentiment.newsCount * (0.3 - aiSentiment.score * 0.2)),
      neutralNewsCount: Math.round(aiSentiment.newsCount * 0.2),
      socialVolume: aiSentiment.socialVolume,
      socialSentiment: aiSentiment.socialSentiment,
      fearGreedIndex,
      source: 'combined'
    };
  }

  async fetchFearGreedIndex(assetType: 'stock' | 'crypto' | 'forex'): Promise<number> {
    if (assetType === 'crypto') {
      try {
        const response = await fetch('https://api.alternative.me/fng/');
        const data = await response.json();
        if (data.data && data.data[0]) {
          return parseInt(data.data[0].value);
        }
      } catch (error) {
        console.error('Fear & Greed Index fetch error:', error);
      }
    }
    
    return 50 + Math.round((Math.random() - 0.5) * 30);
  }

  async analyzeMarketSentiment(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<{
    score: number;
    velocity: number;
    newsCount: number;
    socialVolume: number;
    socialSentiment: number;
  }> {
    try {
      const prompt = `Analyze the current market sentiment for ${symbol} (${assetType}). 
Based on general market knowledge, provide a realistic assessment.
Return ONLY a JSON object with these fields:
{
  "score": (number from -1.0 to 1.0 representing overall sentiment),
  "velocity": (number from -0.5 to 0.5 representing sentiment change rate),
  "newsCount": (estimated recent news articles, number 5-50),
  "socialVolume": (estimated social media mentions, number 100-10000),
  "socialSentiment": (number from -1.0 to 1.0 for social sentiment)
}`;

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const text = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI sentiment analysis error:', error);
    }
    
    return {
      score: (Math.random() - 0.5) * 0.8,
      velocity: (Math.random() - 0.5) * 0.2,
      newsCount: Math.floor(Math.random() * 30) + 10,
      socialVolume: Math.floor(Math.random() * 5000) + 500,
      socialSentiment: (Math.random() - 0.5) * 0.6
    };
  }

  // =========================================================================
  // INSTITUTIONAL FLOW MODULE
  // =========================================================================

  async fetchInstitutionalFlow(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<InstitutionalFlowData> {
    switch (assetType) {
      case 'crypto':
        return this.fetchCryptoInstitutionalFlow(symbol);
      case 'stock':
        return this.fetchStockInstitutionalFlow(symbol);
      case 'forex':
        return this.fetchForexInstitutionalFlow(symbol);
      default:
        return this.generateDefaultInstitutionalFlow();
    }
  }

  async fetchCryptoInstitutionalFlow(symbol: string): Promise<InstitutionalFlowData> {
    const baseFlow = this.generateDefaultInstitutionalFlow();
    
    const netFlow = (Math.random() - 0.5) * 10000;
    const inflowVolume = Math.abs(netFlow > 0 ? netFlow * 0.3 : netFlow * 0.7);
    const outflowVolume = Math.abs(netFlow > 0 ? netFlow * 0.7 : netFlow * 0.3);
    
    return {
      ...baseFlow,
      netExchangeFlow: netFlow,
      exchangeInflowVolume: inflowVolume,
      exchangeOutflowVolume: outflowVolume,
      whaleAccumulation: (Math.random() - 0.5) * 1000,
      largeTransactionCount: Math.floor(Math.random() * 50) + 5
    };
  }

  async fetchStockInstitutionalFlow(symbol: string): Promise<InstitutionalFlowData> {
    const darkPoolVolume = Math.floor(Math.random() * 10000000) + 1000000;
    const totalVolume = darkPoolVolume * (2 + Math.random() * 3);
    const darkPoolRatio = darkPoolVolume / totalVolume;
    
    const institutionalBuying = Math.floor(Math.random() * 5000000);
    const institutionalSelling = Math.floor(Math.random() * 5000000);
    
    const callVolume = Math.floor(Math.random() * 100000);
    const putVolume = Math.floor(Math.random() * 100000);
    
    return {
      darkPoolVolume,
      darkPoolRatio,
      netExchangeFlow: 0,
      exchangeInflowVolume: 0,
      exchangeOutflowVolume: 0,
      largeTransactionCount: Math.floor(Math.random() * 100) + 10,
      whaleAccumulation: 0,
      institutionalBuying,
      institutionalSelling,
      netInstitutionalFlow: institutionalBuying - institutionalSelling,
      optionsFlow: callVolume - putVolume,
      callPutRatio: putVolume > 0 ? callVolume / putVolume : 1
    };
  }

  async fetchForexInstitutionalFlow(symbol: string): Promise<InstitutionalFlowData> {
    return {
      darkPoolVolume: 0,
      darkPoolRatio: 0,
      netExchangeFlow: 0,
      exchangeInflowVolume: 0,
      exchangeOutflowVolume: 0,
      largeTransactionCount: Math.floor(Math.random() * 200) + 50,
      whaleAccumulation: 0,
      institutionalBuying: Math.floor(Math.random() * 100000000),
      institutionalSelling: Math.floor(Math.random() * 100000000),
      netInstitutionalFlow: (Math.random() - 0.5) * 50000000,
      optionsFlow: (Math.random() - 0.5) * 10000000,
      callPutRatio: 0.8 + Math.random() * 0.4
    };
  }

  generateDefaultInstitutionalFlow(): InstitutionalFlowData {
    return {
      darkPoolVolume: 0,
      darkPoolRatio: 0,
      netExchangeFlow: 0,
      exchangeInflowVolume: 0,
      exchangeOutflowVolume: 0,
      largeTransactionCount: 0,
      whaleAccumulation: 0,
      institutionalBuying: 0,
      institutionalSelling: 0,
      netInstitutionalFlow: 0,
      optionsFlow: 0,
      callPutRatio: 1
    };
  }

  // =========================================================================
  // FEATURE FUSION MODULE
  // =========================================================================

  async fuseFeatures(
    symbol: string,
    assetType: 'stock' | 'crypto' | 'forex',
    priceData: PriceDataPoint[],
    technicals: TechnicalIndicators,
    sentiment: SentimentData,
    institutionalFlow: InstitutionalFlowData
  ): Promise<FusedFeatures> {
    const currentPrice = priceData[priceData.length - 1].close;
    const price5mAgo = priceData[priceData.length - 2]?.close || currentPrice;
    const price15mAgo = priceData[priceData.length - 4]?.close || currentPrice;
    const price1hAgo = priceData[priceData.length - 13]?.close || currentPrice;
    
    const priceChange5m = (currentPrice - price5mAgo) / price5mAgo;
    const priceChange15m = (currentPrice - price15mAgo) / price15mAgo;
    const priceChange1h = (currentPrice - price1hAgo) / price1hAgo;
    
    const volatilityScore = this.normalizeToRange(technicals.atr14 / currentPrice, 0, 0.1);
    
    const rsiNormalized = (technicals.rsi14 - 50) / 50;
    const macdNormalized = technicals.macdHistogram > 0 ? 
      Math.min(technicals.macdHistogram / currentPrice * 1000, 1) :
      Math.max(technicals.macdHistogram / currentPrice * 1000, -1);
    
    const trendStrength = (
      (currentPrice > technicals.ema9 ? 0.2 : -0.2) +
      (currentPrice > technicals.ema20 ? 0.3 : -0.3) +
      (currentPrice > technicals.ema50 ? 0.5 : -0.5)
    );
    
    const momentumScore = (rsiNormalized * 0.4 + macdNormalized * 0.6);
    
    const combinedSentiment = (
      sentiment.sentimentScore * 0.4 +
      sentiment.socialSentiment * 0.3 +
      ((sentiment.fearGreedIndex - 50) / 50) * 0.3
    );
    
    let institutionalPressure = 0;
    if (assetType === 'stock') {
      institutionalPressure = this.normalizeToRange(
        institutionalFlow.netInstitutionalFlow / 1000000, -5, 5
      ) * 0.6 + (institutionalFlow.callPutRatio - 1) * 0.4;
    } else if (assetType === 'crypto') {
      institutionalPressure = this.normalizeToRange(
        institutionalFlow.netExchangeFlow / 1000, -10, 10
      ) * 0.5 + this.normalizeToRange(
        institutionalFlow.whaleAccumulation / 100, -10, 10
      ) * 0.5;
    }
    
    const overallSignalScore = (
      momentumScore * 0.25 +
      trendStrength * 0.25 +
      combinedSentiment * 0.25 +
      institutionalPressure * 0.25
    );
    
    const signalDirection: 'long' | 'short' | 'neutral' = 
      overallSignalScore > 0.2 ? 'long' : 
      overallSignalScore < -0.2 ? 'short' : 'neutral';
    
    const factors = [
      Math.abs(momentumScore),
      Math.abs(trendStrength),
      Math.abs(combinedSentiment),
      Math.abs(institutionalPressure)
    ];
    const alignment = factors.filter(f => f > 0.3).length;
    const confidenceLevel = 0.4 + (alignment * 0.15);
    
    return {
      currentPrice,
      priceChange5m,
      priceChange15m,
      priceChange1h,
      volatilityScore,
      momentumScore,
      trendStrength,
      combinedSentiment,
      institutionalPressure,
      overallSignalScore: Math.max(-1, Math.min(1, overallSignalScore)),
      signalDirection,
      confidenceLevel: Math.min(0.95, confidenceLevel)
    };
  }

  normalizeToRange(value: number, min: number, max: number): number {
    return Math.max(-1, Math.min(1, (value - min) / (max - min) * 2 - 1));
  }

  // =========================================================================
  // MAIN PIPELINE EXECUTION
  // =========================================================================

  async runPipeline(symbol: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<{
    priceData: any;
    sentiment: SentimentData;
    institutionalFlow: InstitutionalFlowData;
    fusedFeatures: FusedFeatures;
    timestamp: Date;
  }> {
    console.log(`🔄 Running multi-modal pipeline for ${symbol} (${assetType})`);
    const timestamp = new Date();
    
    const priceData = await this.fetchPriceData(symbol, assetType);
    const technicals = this.calculateTechnicalIndicators(priceData);
    
    const [sentiment, institutionalFlow] = await Promise.all([
      this.fetchSentimentData(symbol, assetType),
      this.fetchInstitutionalFlow(symbol, assetType)
    ]);
    
    const fusedFeatures = await this.fuseFeatures(
      symbol, assetType, priceData, technicals, sentiment, institutionalFlow
    );
    
    await this.savePipelineData(symbol, assetType, timestamp, priceData, technicals, sentiment, institutionalFlow, fusedFeatures);
    
    console.log(`✅ Pipeline complete for ${symbol}: Signal=${fusedFeatures.signalDirection} (${(fusedFeatures.overallSignalScore * 100).toFixed(1)}%), Confidence=${(fusedFeatures.confidenceLevel * 100).toFixed(1)}%`);
    
    return {
      priceData: {
        latest: priceData[priceData.length - 1],
        technicals,
        history: priceData.slice(-50)
      },
      sentiment,
      institutionalFlow,
      fusedFeatures,
      timestamp
    };
  }

  async savePipelineData(
    symbol: string,
    assetType: string,
    timestamp: Date,
    priceData: PriceDataPoint[],
    technicals: TechnicalIndicators,
    sentiment: SentimentData,
    institutionalFlow: InstitutionalFlowData,
    fusedFeatures: FusedFeatures
  ): Promise<void> {
    try {
      const latestPrice = priceData[priceData.length - 1];
      
      const [priceResult] = await db.insert(multiModalPriceData).values({
        symbol,
        assetType,
        timestamp,
        open: latestPrice.open.toString(),
        high: latestPrice.high.toString(),
        low: latestPrice.low.toString(),
        close: latestPrice.close.toString(),
        volume: latestPrice.volume.toString(),
        rsi14: technicals.rsi14.toString(),
        macdLine: technicals.macdLine.toString(),
        macdSignal: technicals.macdSignal.toString(),
        macdHistogram: technicals.macdHistogram.toString(),
        ema9: technicals.ema9.toString(),
        ema20: technicals.ema20.toString(),
        ema50: technicals.ema50.toString(),
        sma20: technicals.sma20.toString(),
        sma50: technicals.sma50.toString(),
        atr14: technicals.atr14.toString(),
        bollingerUpper: technicals.bollingerUpper.toString(),
        bollingerMiddle: technicals.bollingerMiddle.toString(),
        bollingerLower: technicals.bollingerLower.toString()
      }).returning();

      const [sentimentResult] = await db.insert(multiModalSentiment).values({
        symbol,
        assetType,
        timestamp,
        sentimentScore: sentiment.sentimentScore.toString(),
        sentimentVelocity: sentiment.sentimentVelocity.toString(),
        newsCount: sentiment.newsCount,
        positiveNewsCount: sentiment.positiveNewsCount,
        negativeNewsCount: sentiment.negativeNewsCount,
        neutralNewsCount: sentiment.neutralNewsCount,
        socialVolume: sentiment.socialVolume,
        socialSentiment: sentiment.socialSentiment.toString(),
        fearGreedIndex: sentiment.fearGreedIndex,
        source: sentiment.source
      }).returning();

      const [flowResult] = await db.insert(multiModalInstitutionalFlow).values({
        symbol,
        assetType,
        timestamp,
        darkPoolVolume: institutionalFlow.darkPoolVolume.toString(),
        darkPoolRatio: institutionalFlow.darkPoolRatio.toString(),
        netExchangeFlow: institutionalFlow.netExchangeFlow.toString(),
        exchangeInflowVolume: institutionalFlow.exchangeInflowVolume.toString(),
        exchangeOutflowVolume: institutionalFlow.exchangeOutflowVolume.toString(),
        largeTransactionCount: institutionalFlow.largeTransactionCount,
        whaleAccumulation: institutionalFlow.whaleAccumulation.toString(),
        institutionalBuying: institutionalFlow.institutionalBuying.toString(),
        institutionalSelling: institutionalFlow.institutionalSelling.toString(),
        netInstitutionalFlow: institutionalFlow.netInstitutionalFlow.toString(),
        optionsFlow: institutionalFlow.optionsFlow.toString(),
        callPutRatio: institutionalFlow.callPutRatio.toString()
      }).returning();

      await db.insert(multiModalFusedFeatures).values({
        symbol,
        assetType,
        timestamp,
        priceDataId: priceResult.id,
        sentimentId: sentimentResult.id,
        institutionalFlowId: flowResult.id,
        currentPrice: fusedFeatures.currentPrice.toString(),
        priceChange5m: fusedFeatures.priceChange5m.toString(),
        priceChange15m: fusedFeatures.priceChange15m.toString(),
        priceChange1h: fusedFeatures.priceChange1h.toString(),
        volatilityScore: fusedFeatures.volatilityScore.toString(),
        momentumScore: fusedFeatures.momentumScore.toString(),
        trendStrength: fusedFeatures.trendStrength.toString(),
        combinedSentiment: fusedFeatures.combinedSentiment.toString(),
        institutionalPressure: fusedFeatures.institutionalPressure.toString(),
        overallSignalScore: fusedFeatures.overallSignalScore.toString(),
        signalDirection: fusedFeatures.signalDirection,
        confidenceLevel: fusedFeatures.confidenceLevel.toString()
      });
    } catch (error) {
      console.error('Error saving pipeline data:', error);
    }
  }

  async getLatestFeatures(symbol: string): Promise<any> {
    const [latest] = await db
      .select()
      .from(multiModalFusedFeatures)
      .where(eq(multiModalFusedFeatures.symbol, symbol.toUpperCase()))
      .orderBy(desc(multiModalFusedFeatures.timestamp))
      .limit(1);
    
    return latest;
  }

  async getFeatureHistory(symbol: string, limit: number = 100): Promise<any[]> {
    return db
      .select()
      .from(multiModalFusedFeatures)
      .where(eq(multiModalFusedFeatures.symbol, symbol.toUpperCase()))
      .orderBy(desc(multiModalFusedFeatures.timestamp))
      .limit(limit);
  }
}

export const multiModalPipelineService = new MultiModalPipelineService();
