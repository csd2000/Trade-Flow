import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { 
  quantAssets,
  quantIndicators,
  quantSentiment,
  quantSignals,
  quantPredictions
} from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const anthropic = new Anthropic();

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface IndicatorResult {
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  macdHistogram: number;
  stochK: number;
  stochD: number;
  ema9: number;
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  sma50: number;
  atr14: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  bollingerWidth: number;
  volatilityPercent: number;
  obv: number;
  vpt: number;
  volumeSma20: number;
  volumeRatio: number;
}

interface SignalFactors {
  technical: number;
  momentum: number;
  trend: number;
  volume: number;
  sentiment: number;
}

interface TradingSignal {
  signalType: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  factors: SignalFactors;
  reasoning: string;
  keyFactors: string[];
}

// Common crypto symbols mapped to CoinGecko IDs
const CRYPTO_MAP: Record<string, string> = {
  'BTC': 'bitcoin', 'ETH': 'ethereum', 'XRP': 'ripple', 'SOL': 'solana',
  'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
  'MATIC': 'matic-network', 'LINK': 'chainlink', 'UNI': 'uniswap', 'ATOM': 'cosmos',
  'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'XLM': 'stellar', 'ALGO': 'algorand',
  'VET': 'vechain', 'FIL': 'filecoin', 'NEAR': 'near', 'APT': 'aptos',
  'ARB': 'arbitrum', 'OP': 'optimism', 'INJ': 'injective-protocol', 'SUI': 'sui',
  'SHIB': 'shiba-inu', 'PEPE': 'pepe', 'BONK': 'bonk', 'WIF': 'dogwifhat'
};

export class QuantTradingService {

  // Check if symbol is a cryptocurrency
  private isCrypto(symbol: string): boolean {
    return symbol.toUpperCase() in CRYPTO_MAP;
  }

  // =====================================================
  // MOMENTUM INDICATORS
  // =====================================================

  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    const changes: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      changes.push(closes[i] - closes[i - 1]);
    }
    
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
    
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    }
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateMACD(closes: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { line: number; signal: number; histogram: number } {
    if (closes.length < slowPeriod + signalPeriod) {
      return { line: 0, signal: 0, histogram: 0 };
    }
    
    const emaFast = this.calculateEMA(closes, fastPeriod);
    const emaSlow = this.calculateEMA(closes, slowPeriod);
    
    const macdLine: number[] = [];
    const startIndex = slowPeriod - fastPeriod;
    for (let i = 0; i < emaSlow.length; i++) {
      macdLine.push(emaFast[i + startIndex] - emaSlow[i]);
    }
    
    const signalLine = this.calculateEMA(macdLine, signalPeriod);
    const lastMacd = macdLine[macdLine.length - 1];
    const lastSignal = signalLine[signalLine.length - 1];
    
    return {
      line: lastMacd,
      signal: lastSignal,
      histogram: lastMacd - lastSignal
    };
  }

  calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3): { k: number; d: number } {
    if (closes.length < kPeriod + dPeriod) {
      return { k: 50, d: 50 };
    }
    
    const kValues: number[] = [];
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
      const periodLows = lows.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...periodHighs);
      const lowestLow = Math.min(...periodLows);
      const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(isNaN(k) ? 50 : k);
    }
    
    const dValues = this.calculateSMA(kValues, dPeriod);
    
    return {
      k: kValues[kValues.length - 1],
      d: dValues[dValues.length - 1]
    };
  }

  // =====================================================
  // TREND INDICATORS (Moving Averages)
  // =====================================================

  calculateSMA(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return [];
    
    const result: number[] = [];
    const multiplier = 2 / (period + 1);
    
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(ema);
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      result.push(ema);
    }
    return result;
  }

  getLatestEMA(data: number[], period: number): number {
    const emas = this.calculateEMA(data, period);
    return emas.length > 0 ? emas[emas.length - 1] : data[data.length - 1];
  }

  getLatestSMA(data: number[], period: number): number {
    const smas = this.calculateSMA(data, period);
    return smas.length > 0 ? smas[smas.length - 1] : data[data.length - 1];
  }

  // =====================================================
  // VOLATILITY INDICATORS
  // =====================================================

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
    
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
    }
    
    return atr;
  }

  calculateBollingerBands(closes: number[], period: number = 20, stdDevMultiplier: number = 2): { upper: number; middle: number; lower: number; width: number } {
    if (closes.length < period) {
      const price = closes[closes.length - 1];
      return { upper: price, middle: price, lower: price, width: 0 };
    }
    
    const sma = this.getLatestSMA(closes, period);
    const recentCloses = closes.slice(-period);
    const squaredDiffs = recentCloses.map(c => Math.pow(c - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = sma + (stdDevMultiplier * stdDev);
    const lower = sma - (stdDevMultiplier * stdDev);
    const width = (upper - lower) / sma;
    
    return { upper, middle: sma, lower, width };
  }

  calculateVolatility(closes: number[], period: number = 20): number {
    if (closes.length < period) return 0;
    
    const recentCloses = closes.slice(-period);
    const mean = recentCloses.reduce((a, b) => a + b, 0) / period;
    const squaredDiffs = recentCloses.map(c => Math.pow(c - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    return (Math.sqrt(variance) / mean) * 100;
  }

  // =====================================================
  // VOLUME INDICATORS
  // =====================================================

  calculateOBV(closes: number[], volumes: number[]): number {
    if (closes.length < 2) return volumes[0] || 0;
    
    let obv = 0;
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i];
      }
    }
    return obv;
  }

  calculateVPT(closes: number[], volumes: number[]): number {
    if (closes.length < 2) return 0;
    
    let vpt = 0;
    for (let i = 1; i < closes.length; i++) {
      const priceChange = (closes[i] - closes[i - 1]) / closes[i - 1];
      vpt += volumes[i] * priceChange;
    }
    return vpt;
  }

  calculateVolumeRatio(volumes: number[], period: number = 20): number {
    if (volumes.length < period + 1) return 1;
    
    const avgVolume = volumes.slice(-period - 1, -1).reduce((a, b) => a + b, 0) / period;
    const currentVolume = volumes[volumes.length - 1];
    return avgVolume > 0 ? currentVolume / avgVolume : 1;
  }

  // =====================================================
  // COMPREHENSIVE INDICATOR CALCULATION
  // =====================================================

  calculateAllIndicators(priceData: PriceData[]): IndicatorResult {
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const volumes = priceData.map(d => d.volume);
    
    const macd = this.calculateMACD(closes);
    const stoch = this.calculateStochastic(highs, lows, closes);
    const bollinger = this.calculateBollingerBands(closes);
    
    return {
      rsi14: this.calculateRSI(closes, 14),
      macdLine: macd.line,
      macdSignal: macd.signal,
      macdHistogram: macd.histogram,
      stochK: stoch.k,
      stochD: stoch.d,
      ema9: this.getLatestEMA(closes, 9),
      ema20: this.getLatestEMA(closes, 20),
      ema50: this.getLatestEMA(closes, 50),
      ema200: this.getLatestEMA(closes, 200),
      sma20: this.getLatestSMA(closes, 20),
      sma50: this.getLatestSMA(closes, 50),
      atr14: this.calculateATR(highs, lows, closes, 14),
      bollingerUpper: bollinger.upper,
      bollingerMiddle: bollinger.middle,
      bollingerLower: bollinger.lower,
      bollingerWidth: bollinger.width,
      volatilityPercent: this.calculateVolatility(closes),
      obv: this.calculateOBV(closes, volumes),
      vpt: this.calculateVPT(closes, volumes),
      volumeSma20: this.getLatestSMA(volumes, 20),
      volumeRatio: this.calculateVolumeRatio(volumes)
    };
  }

  // =====================================================
  // SIGNAL GENERATION
  // =====================================================

  calculateSignalFactors(indicators: IndicatorResult, currentPrice: number): SignalFactors {
    let technical = 0;
    let momentum = 0;
    let trend = 0;
    let volume = 0;
    
    if (indicators.rsi14 < 30) momentum += 30;
    else if (indicators.rsi14 > 70) momentum -= 30;
    else momentum += (50 - indicators.rsi14) * 0.5;
    
    if (indicators.macdHistogram > 0) {
      momentum += Math.min(25, indicators.macdHistogram * 10);
    } else {
      momentum += Math.max(-25, indicators.macdHistogram * 10);
    }
    
    if (indicators.stochK < 20) momentum += 20;
    else if (indicators.stochK > 80) momentum -= 20;
    
    if (currentPrice > indicators.ema9) trend += 15;
    else trend -= 15;
    
    if (currentPrice > indicators.ema20) trend += 15;
    else trend -= 15;
    
    if (currentPrice > indicators.ema50) trend += 15;
    else trend -= 15;
    
    if (currentPrice > indicators.ema200) trend += 15;
    else trend -= 15;
    
    if (indicators.ema9 > indicators.ema20) trend += 10;
    if (indicators.ema20 > indicators.ema50) trend += 10;
    if (indicators.ema50 > indicators.ema200) trend += 10;
    
    if (currentPrice <= indicators.bollingerLower) technical += 30;
    else if (currentPrice >= indicators.bollingerUpper) technical -= 30;
    else {
      const bbPosition = (currentPrice - indicators.bollingerLower) / (indicators.bollingerUpper - indicators.bollingerLower);
      technical += (0.5 - bbPosition) * 40;
    }
    
    if (indicators.bollingerWidth < 0.02) technical += 10;
    
    if (indicators.volatilityPercent < 2) technical += 10;
    else if (indicators.volatilityPercent > 5) technical -= 10;
    
    if (indicators.volumeRatio > 1.5) volume += 20;
    else if (indicators.volumeRatio > 1.2) volume += 10;
    else if (indicators.volumeRatio < 0.5) volume -= 10;
    
    return {
      technical: Math.max(-100, Math.min(100, technical)),
      momentum: Math.max(-100, Math.min(100, momentum)),
      trend: Math.max(-100, Math.min(100, trend)),
      volume: Math.max(-100, Math.min(100, volume)),
      sentiment: 0
    };
  }

  generateTradingSignal(priceData: PriceData[], sentimentScore: number = 0): TradingSignal {
    const indicators = this.calculateAllIndicators(priceData);
    const currentPrice = priceData[priceData.length - 1].close;
    const factors = this.calculateSignalFactors(indicators, currentPrice);
    factors.sentiment = sentimentScore;
    
    const weightedScore = (
      factors.technical * 0.25 +
      factors.momentum * 0.25 +
      factors.trend * 0.25 +
      factors.volume * 0.15 +
      factors.sentiment * 0.10
    );
    
    let signalType: TradingSignal['signalType'];
    let direction: TradingSignal['direction'];
    
    if (weightedScore > 50) {
      signalType = 'strong_buy';
      direction = 'bullish';
    } else if (weightedScore > 20) {
      signalType = 'buy';
      direction = 'bullish';
    } else if (weightedScore < -50) {
      signalType = 'strong_sell';
      direction = 'bearish';
    } else if (weightedScore < -20) {
      signalType = 'sell';
      direction = 'bearish';
    } else {
      signalType = 'hold';
      direction = 'neutral';
    }
    
    const strength = Math.abs(weightedScore);
    const confidence = Math.min(90, 50 + strength * 0.4);
    
    const atr = indicators.atr14;
    let stopLoss: number;
    let targetPrice: number;
    
    if (direction === 'bullish') {
      stopLoss = currentPrice - (atr * 2);
      targetPrice = currentPrice + (atr * 3);
    } else if (direction === 'bearish') {
      stopLoss = currentPrice + (atr * 2);
      targetPrice = currentPrice - (atr * 3);
    } else {
      stopLoss = currentPrice - (atr * 1.5);
      targetPrice = currentPrice + (atr * 1.5);
    }
    
    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(targetPrice - currentPrice);
    const riskRewardRatio = reward / risk;
    
    const keyFactors: string[] = [];
    if (Math.abs(factors.momentum) > 30) {
      keyFactors.push(factors.momentum > 0 ? 'Strong bullish momentum' : 'Strong bearish momentum');
    }
    if (Math.abs(factors.trend) > 30) {
      keyFactors.push(factors.trend > 0 ? 'Strong uptrend' : 'Strong downtrend');
    }
    if (indicators.rsi14 < 30) keyFactors.push('RSI oversold');
    if (indicators.rsi14 > 70) keyFactors.push('RSI overbought');
    if (currentPrice <= indicators.bollingerLower) keyFactors.push('At lower Bollinger Band');
    if (currentPrice >= indicators.bollingerUpper) keyFactors.push('At upper Bollinger Band');
    if (indicators.volumeRatio > 1.5) keyFactors.push('High volume confirmation');
    
    const reasoning = `Signal: ${signalType.toUpperCase()} | Strength: ${strength.toFixed(0)}% | ` +
      `Technical: ${factors.technical.toFixed(0)} | Momentum: ${factors.momentum.toFixed(0)} | ` +
      `Trend: ${factors.trend.toFixed(0)} | Volume: ${factors.volume.toFixed(0)} | ` +
      `RSI: ${indicators.rsi14.toFixed(1)} | MACD: ${indicators.macdHistogram > 0 ? '+' : ''}${indicators.macdHistogram.toFixed(4)}`;
    
    return {
      signalType,
      direction,
      strength,
      confidence,
      entryPrice: currentPrice,
      targetPrice,
      stopLoss,
      riskRewardRatio,
      factors,
      reasoning,
      keyFactors
    };
  }

  // =====================================================
  // SENTIMENT ANALYSIS
  // =====================================================

  async fetchFearGreedIndex(): Promise<{ value: number; label: string }> {
    try {
      const response = await fetch('https://api.alternative.me/fng/');
      const data = await response.json();
      
      if (data.data && data.data[0]) {
        const fng = data.data[0];
        return {
          value: parseInt(fng.value),
          label: fng.value_classification
        };
      }
    } catch (error) {
      console.error('Fear & Greed fetch error:', error);
    }
    return { value: 50, label: 'Neutral' };
  }

  async generateAISentiment(symbol: string, priceData: PriceData[]): Promise<{ score: number; analysis: string }> {
    const recentPrices = priceData.slice(-10).map(d => ({
      date: d.date,
      close: d.close,
      change: 0
    }));
    
    for (let i = 1; i < recentPrices.length; i++) {
      recentPrices[i].change = ((recentPrices[i].close - recentPrices[i - 1].close) / recentPrices[i - 1].close) * 100;
    }
    
    const prompt = `Analyze the market sentiment for ${symbol} based on recent price action:

Recent prices: ${JSON.stringify(recentPrices, null, 2)}

Current Price: $${recentPrices[recentPrices.length - 1].close.toFixed(2)}

Provide:
1. A sentiment score from -1 (extremely bearish) to +1 (extremely bullish)
2. A brief 2-3 sentence analysis of current market sentiment

Format your response as JSON:
{"score": 0.X, "analysis": "Your analysis here"}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('AI sentiment error:', error);
    }
    
    return { score: 0, analysis: 'Unable to generate sentiment analysis' };
  }

  // =====================================================
  // DATA FETCHING (Yahoo Finance - Real-time)
  // =====================================================

  async fetchYahooFinanceData(symbol: string): Promise<PriceData[]> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=6mo`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result || !result.timestamp) {
        throw new Error(`No data from Yahoo Finance for ${symbol}`);
      }

      const timestamps = result.timestamp;
      const quote = result.indicators?.quote?.[0];
      
      if (!quote) {
        throw new Error('No quote data from Yahoo Finance');
      }

      const priceData: PriceData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] !== null && quote.close[i] !== null) {
          priceData.push({
            date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i] || 0
          });
        }
      }

      if (priceData.length < 20) {
        throw new Error(`Insufficient data for ${symbol}: only ${priceData.length} data points`);
      }

      console.log(`📊 Fetched ${priceData.length} real-time data points for ${symbol} from Yahoo Finance`);
      return priceData;
    } catch (error) {
      console.error('Yahoo Finance fetch error:', error);
      throw error;
    }
  }

  async fetchCoinGeckoData(symbol: string): Promise<PriceData[]> {
    const coinId = CRYPTO_MAP[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unknown crypto symbol: ${symbol}`);
    }

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=180`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`No data from CoinGecko for ${symbol}`);
      }

      const priceData: PriceData[] = data.map((candle: number[]) => ({
        date: new Date(candle[0]).toISOString().split('T')[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: 0
      }));

      // Get current price for latest data point
      const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
      const priceRes = await fetch(priceUrl);
      const priceJson = await priceRes.json();
      const currentPrice = priceJson[coinId]?.usd;
      
      if (currentPrice) {
        const today = new Date().toISOString().split('T')[0];
        const lastEntry = priceData[priceData.length - 1];
        if (lastEntry.date !== today) {
          priceData.push({
            date: today,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: 0
          });
        } else {
          lastEntry.close = currentPrice;
        }
      }

      console.log(`🪙 Fetched ${priceData.length} real-time crypto data points for ${symbol} from CoinGecko (current: $${currentPrice})`);
      return priceData;
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
      throw error;
    }
  }

  // =====================================================
  // DATABASE OPERATIONS
  // =====================================================

  async getOrCreateAsset(symbol: string, name: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<number> {
    const [existing] = await db
      .select()
      .from(quantAssets)
      .where(eq(quantAssets.symbol, symbol.toUpperCase()));
    
    if (existing) return existing.id;
    
    const [newAsset] = await db
      .insert(quantAssets)
      .values({
        symbol: symbol.toUpperCase(),
        name,
        assetType,
        isActive: true
      })
      .returning();
    
    return newAsset.id;
  }

  async saveIndicators(assetId: number, indicators: IndicatorResult, priceData: PriceData, timeframe: string = 'daily'): Promise<number> {
    const [saved] = await db
      .insert(quantIndicators)
      .values({
        assetId,
        timeframe,
        open: priceData.open.toString(),
        high: priceData.high.toString(),
        low: priceData.low.toString(),
        close: priceData.close.toString(),
        volume: priceData.volume.toString(),
        rsi14: indicators.rsi14.toString(),
        macdLine: indicators.macdLine.toString(),
        macdSignal: indicators.macdSignal.toString(),
        macdHistogram: indicators.macdHistogram.toString(),
        stochK: indicators.stochK.toString(),
        stochD: indicators.stochD.toString(),
        ema9: indicators.ema9.toString(),
        ema20: indicators.ema20.toString(),
        ema50: indicators.ema50.toString(),
        ema200: indicators.ema200.toString(),
        sma20: indicators.sma20.toString(),
        sma50: indicators.sma50.toString(),
        atr14: indicators.atr14.toString(),
        bollingerUpper: indicators.bollingerUpper.toString(),
        bollingerMiddle: indicators.bollingerMiddle.toString(),
        bollingerLower: indicators.bollingerLower.toString(),
        bollingerWidth: indicators.bollingerWidth.toString(),
        volatilityPercent: indicators.volatilityPercent.toString(),
        obv: indicators.obv.toString(),
        vpt: indicators.vpt.toString(),
        volumeSma20: indicators.volumeSma20.toString(),
        volumeRatio: indicators.volumeRatio.toString()
      })
      .returning();
    
    return saved.id;
  }

  async saveSentiment(assetId: number, fearGreed: { value: number; label: string }, aiSentiment: { score: number; analysis: string }): Promise<number> {
    const [saved] = await db
      .insert(quantSentiment)
      .values({
        assetId,
        fearGreedIndex: fearGreed.value,
        fearGreedLabel: fearGreed.label,
        newsSentiment: aiSentiment.score.toString(),
        overallSentiment: (((fearGreed.value - 50) / 50 + aiSentiment.score) / 2).toString(),
        aiAnalysis: aiSentiment.analysis
      })
      .returning();
    
    return saved.id;
  }

  async saveSignal(assetId: number, signal: TradingSignal): Promise<number> {
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 24);
    
    const [saved] = await db
      .insert(quantSignals)
      .values({
        assetId,
        signalType: signal.signalType,
        direction: signal.direction,
        strength: signal.strength.toString(),
        confidence: signal.confidence.toString(),
        entryPrice: signal.entryPrice.toString(),
        targetPrice: signal.targetPrice.toString(),
        stopLoss: signal.stopLoss.toString(),
        riskRewardRatio: signal.riskRewardRatio.toString(),
        technicalScore: signal.factors.technical.toString(),
        momentumScore: signal.factors.momentum.toString(),
        trendScore: signal.factors.trend.toString(),
        volumeScore: signal.factors.volume.toString(),
        sentimentScore: signal.factors.sentiment.toString(),
        timeframe: 'short',
        validUntil,
        reasoning: signal.reasoning,
        keyFactors: signal.keyFactors,
        status: 'active'
      })
      .returning();
    
    return saved.id;
  }

  // =====================================================
  // MAIN ANALYSIS FUNCTION
  // =====================================================

  async analyzeAsset(symbol: string): Promise<any> {
    console.log(`📊 Running quantitative analysis for ${symbol}...`);
    
    const isCrypto = this.isCrypto(symbol);
    const priceData = isCrypto 
      ? await this.fetchCoinGeckoData(symbol)
      : await this.fetchYahooFinanceData(symbol);
    const assetType = isCrypto ? 'crypto' : 'stock';
    const assetName = isCrypto ? `${symbol} Cryptocurrency` : `${symbol} Stock`;
    const assetId = await this.getOrCreateAsset(symbol, assetName, assetType);
    
    const indicators = this.calculateAllIndicators(priceData);
    const lastPrice = priceData[priceData.length - 1];
    await this.saveIndicators(assetId, indicators, lastPrice);
    
    const [fearGreed, aiSentiment] = await Promise.all([
      this.fetchFearGreedIndex(),
      this.generateAISentiment(symbol, priceData)
    ]);
    await this.saveSentiment(assetId, fearGreed, aiSentiment);
    
    const sentimentScore = ((fearGreed.value - 50) / 50 + aiSentiment.score) / 2 * 100;
    const signal = this.generateTradingSignal(priceData, sentimentScore);
    await this.saveSignal(assetId, signal);
    
    await db
      .update(quantAssets)
      .set({ 
        lastPrice: lastPrice.close.toString(),
        lastUpdated: new Date()
      })
      .where(eq(quantAssets.id, assetId));
    
    return {
      symbol,
      assetId,
      currentPrice: lastPrice.close,
      indicators,
      sentiment: {
        fearGreed,
        ai: aiSentiment,
        combined: sentimentScore
      },
      signal,
      historicalData: priceData.slice(-60)
    };
  }

  async getLatestSignals(limit: number = 10): Promise<any[]> {
    const signals = await db
      .select()
      .from(quantSignals)
      .orderBy(desc(quantSignals.generatedAt))
      .limit(limit);
    
    return signals;
  }

  async getAssetWithIndicators(symbol: string): Promise<any> {
    const [asset] = await db
      .select()
      .from(quantAssets)
      .where(eq(quantAssets.symbol, symbol.toUpperCase()));
    
    if (!asset) return null;
    
    const [latestIndicator] = await db
      .select()
      .from(quantIndicators)
      .where(eq(quantIndicators.assetId, asset.id))
      .orderBy(desc(quantIndicators.calculatedAt))
      .limit(1);
    
    const [latestSentiment] = await db
      .select()
      .from(quantSentiment)
      .where(eq(quantSentiment.assetId, asset.id))
      .orderBy(desc(quantSentiment.calculatedAt))
      .limit(1);
    
    const [latestSignal] = await db
      .select()
      .from(quantSignals)
      .where(eq(quantSignals.assetId, asset.id))
      .orderBy(desc(quantSignals.generatedAt))
      .limit(1);
    
    return {
      asset,
      indicators: latestIndicator,
      sentiment: latestSentiment,
      signal: latestSignal
    };
  }
}

export const quantTradingService = new QuantTradingService();
