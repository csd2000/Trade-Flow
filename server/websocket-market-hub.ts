import Anthropic from '@anthropic-ai/sdk';
import { macroPolicyService, type MacroSnapshot } from './macro-policy-service';

const anthropic = new Anthropic();

interface LiveTick {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  bid?: number;
  ask?: number;
  source: string;
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class MarketDataHub {
  private latestPrices: Map<string, LiveTick> = new Map();
  private candleCache: Map<string, CandleData[]> = new Map();

  constructor() {
    console.log('🔴 Market Data Hub initialized - Binance REST + Yahoo Finance for real-time data');
  }

  getLatestPrice(symbol: string): LiveTick | null {
    return this.latestPrices.get(symbol.toUpperCase()) || null;
  }

  async fetchBinanceKlines(symbol: string, interval: string, limit: number = 100): Promise<CandleData[]> {
    const pair = `${symbol.toUpperCase()}USDT`;
    const cacheKey = `${pair}_${interval}`;
    
    try {
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${limit}`
      );
      
      if (!response.ok) throw new Error('Binance klines API error');
      
      const data = await response.json();
      
      const candles: CandleData[] = data.map((k: any[]) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
      }));

      this.candleCache.set(cacheKey, candles);
      return candles;
    } catch (error) {
      console.error('Binance klines error:', error);
      return this.candleCache.get(cacheKey) || [];
    }
  }

  async fetchYahooIntraday(symbol: string, interval: string = '5m', range: string = '1d'): Promise<CandleData[]> {
    try {
      const intervalMap: Record<string, string> = {
        '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
        '1h': '60m', '4h': '60m', '1d': '1d'
      };
      const rangeMap: Record<string, string> = {
        '1m': '1d', '5m': '5d', '15m': '5d', '30m': '1mo',
        '1h': '1mo', '4h': '3mo', '1d': '1y'
      };

      const yahooInterval = intervalMap[interval] || '5m';
      const yahooRange = rangeMap[interval] || '5d';

      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${yahooInterval}&range=${yahooRange}`
      );

      if (!response.ok) throw new Error('Yahoo Finance API error');

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result || !result.timestamp) {
        throw new Error('No data from Yahoo');
      }

      const timestamps = result.timestamp;
      const quote = result.indicators?.quote?.[0];

      if (!quote) throw new Error('No quote data');

      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.open[i] !== null && quote.close[i] !== null) {
          candles.push({
            time: timestamps[i] * 1000,
            open: quote.open[i],
            high: quote.high[i],
            low: quote.low[i],
            close: quote.close[i],
            volume: quote.volume[i] || 0
          });
        }
      }

      return candles;
    } catch (error) {
      console.error('Yahoo intraday error:', error);
      return [];
    }
  }

  async fetchYahooQuote(symbol: string): Promise<LiveTick | null> {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
      );

      if (!response.ok) throw new Error('Yahoo quote error');

      const data = await response.json();
      const result = data.chart?.result?.[0];
      const meta = result?.meta;
      const quote = result?.indicators?.quote?.[0];
      const timestamps = result?.timestamp;

      if (!meta || !quote || !timestamps || timestamps.length === 0) {
        throw new Error('Incomplete Yahoo data');
      }

      const lastIdx = timestamps.length - 1;
      const price = quote.close[lastIdx] || meta.regularMarketPrice;

      return {
        symbol: symbol.toUpperCase(),
        price,
        timestamp: timestamps[lastIdx] * 1000,
        volume: quote.volume[lastIdx] || 0,
        source: 'Yahoo Finance'
      };
    } catch (error) {
      console.error('Yahoo quote error:', error);
      return null;
    }
  }

  async getCandles(symbol: string, interval: string, assetType: 'stock' | 'crypto' | 'forex'): Promise<CandleData[]> {
    if (assetType === 'crypto') {
      const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
      const yahooSymbol = `${cleanSymbol}-USD`;
      const candles = await this.fetchYahooIntraday(yahooSymbol, interval);
      if (candles.length > 0) return candles;
      return this.fetchBinanceKlines(symbol, interval);
    } else {
      return this.fetchYahooIntraday(symbol, interval);
    }
  }

  detectAssetType(symbol: string): 'stock' | 'crypto' | 'forex' {
    const cryptoSymbols = [
      'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 'MATIC',
      'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'INJ', 'TIA',
      'FET', 'RNDR', 'BNB', 'PEPE', 'SHIB', 'WIF', 'BONK', 'JUP', 'PYTH', 'SEI'
    ];
    const upper = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    if (cryptoSymbols.includes(upper)) return 'crypto';
    if (symbol.includes('/') || ['EURUSD', 'GBPUSD', 'USDJPY'].includes(upper)) return 'forex';
    return 'stock';
  }

  async getLiveQuote(symbol: string): Promise<LiveTick | null> {
    const assetType = this.detectAssetType(symbol);
    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');

    if (assetType === 'crypto') {
      const cached = this.getLatestPrice(cleanSymbol);
      if (cached && Date.now() - cached.timestamp < 5000) {
        return cached;
      }

      const yahooSymbol = `${cleanSymbol}-USD`;
      const yahooQuote = await this.fetchYahooQuote(yahooSymbol);
      if (yahooQuote) {
        const tick: LiveTick = {
          symbol: cleanSymbol,
          price: yahooQuote.price,
          timestamp: yahooQuote.timestamp,
          source: 'Yahoo Finance'
        };
        this.latestPrices.set(cleanSymbol, tick);
        return tick;
      }
      return this.getLatestPrice(cleanSymbol);
    } else {
      return this.fetchYahooQuote(symbol);
    }
  }

  async generateAIForecast(symbol: string, candles: CandleData[], currentPrice: number) {
    const recentCandles = candles.slice(-50);
    const closes = recentCandles.map(c => c.close);
    const assetType = this.detectAssetType(symbol);
    
    const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma50 = closes.length >= 50 ? closes.reduce((a, b) => a + b, 0) / 50 : sma20;
    
    let gains = 0, losses = 0;
    for (let i = 1; i < Math.min(14, closes.length); i++) {
      const change = closes[closes.length - i] - closes[closes.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    const rsi = losses === 0 ? 100 : 100 - (100 / (1 + gains / losses));

    // Get macro policy data for context
    const macro = await macroPolicyService.getMacroSnapshot();
    const macroSection = macroPolicyService.generateMacroPromptSection(macro, assetType);
    const macroAdj = macroPolicyService.calculateMacroAdjustment(assetType, macro);

    const prompt = `You are a professional quantitative trading analyst. Analyze this asset and provide precise price predictions. CRITICALLY IMPORTANT: Factor in the Federal Reserve policy and macro environment data provided below.

SYMBOL: ${symbol}
ASSET TYPE: ${assetType.toUpperCase()}
CURRENT PRICE: $${currentPrice.toFixed(4)}
SMA 20: $${sma20.toFixed(4)}
SMA 50: $${sma50.toFixed(4)}
RSI (14): ${rsi.toFixed(1)}
PRICE vs SMA20: ${currentPrice > sma20 ? 'ABOVE' : 'BELOW'}

RECENT CANDLES (last 10):
${recentCandles.slice(-10).map(c => 
  `Time: ${new Date(c.time).toISOString()}, O: ${c.open.toFixed(4)}, H: ${c.high.toFixed(4)}, L: ${c.low.toFixed(4)}, C: ${c.close.toFixed(4)}`
).join('\n')}

${macroSection}

Provide a JSON response with these exact fields:
{
  "direction": "bullish" | "bearish" | "neutral",
  "strength": 1-100,
  "target1h": exact_price,
  "target4h": exact_price,
  "target24h": exact_price,
  "target7d": exact_price,
  "confidence1h": 1-100,
  "confidence4h": 1-100,
  "confidence24h": 1-100,
  "confidence7d": 1-100,
  "entryPrice": exact_price,
  "stopLoss": exact_price,
  "takeProfit": exact_price,
  "support1": exact_price,
  "support2": exact_price,
  "resistance1": exact_price,
  "resistance2": exact_price,
  "riskLevel": "low" | "medium" | "high",
  "reasoning": "brief 2 sentence analysis"
}`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('No text response');

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');

      const ai = JSON.parse(jsonMatch[0]);

      // Apply macro adjustments to confidence
      const adjustedConfidence = (conf: number) => Math.round(Math.max(10, Math.min(95, conf * macroAdj.confidenceMultiplier)));
      
      return {
        symbol,
        currentPrice,
        direction: ai.direction,
        strength: Math.round(Math.max(10, Math.min(100, ai.strength + macroAdj.biasAdjustment))),
        targets: {
          '1h': { price: ai.target1h, confidence: adjustedConfidence(ai.confidence1h) },
          '4h': { price: ai.target4h, confidence: adjustedConfidence(ai.confidence4h) },
          '24h': { price: ai.target24h, confidence: adjustedConfidence(ai.confidence24h) },
          '7d': { price: ai.target7d, confidence: adjustedConfidence(ai.confidence7d) }
        },
        entryPrice: ai.entryPrice,
        stopLoss: ai.stopLoss * (ai.direction === 'bullish' ? (2 - macroAdj.riskMultiplier) : macroAdj.riskMultiplier),
        takeProfit: ai.takeProfit,
        keyLevels: {
          support: [ai.support1, ai.support2],
          resistance: [ai.resistance1, ai.resistance2]
        },
        riskLevel: macroAdj.riskMultiplier > 1.2 ? 'high' : macroAdj.riskMultiplier > 1.0 ? 'medium' : ai.riskLevel,
        reasoning: ai.reasoning,
        macroContext: {
          fedRate: `${macro.fedPolicy.currentRate.low}%-${macro.fedPolicy.currentRate.high}%`,
          fedStance: macro.fedPolicy.policyStance,
          inflation: macro.inflation.cpi.value,
          fearGreed: macro.fearGreedIndex,
          overallBias: macro.overallBias,
          adjustment: macroAdj.reasoning
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('AI forecast error:', error);
      const direction = rsi < 40 ? 'bullish' : rsi > 60 ? 'bearish' : 'neutral';
      const mult = direction === 'bullish' ? 1.02 : direction === 'bearish' ? 0.98 : 1;

      return {
        symbol,
        currentPrice,
        direction,
        strength: 50 + macroAdj.biasAdjustment,
        targets: {
          '1h': { price: currentPrice * (1 + (mult - 1) * 0.1), confidence: Math.round(60 * macroAdj.confidenceMultiplier) },
          '4h': { price: currentPrice * (1 + (mult - 1) * 0.3), confidence: Math.round(55 * macroAdj.confidenceMultiplier) },
          '24h': { price: currentPrice * mult, confidence: Math.round(50 * macroAdj.confidenceMultiplier) },
          '7d': { price: currentPrice * Math.pow(mult, 2), confidence: Math.round(40 * macroAdj.confidenceMultiplier) }
        },
        entryPrice: currentPrice,
        stopLoss: currentPrice * (direction === 'bullish' ? 0.97 : 1.03) * macroAdj.riskMultiplier,
        takeProfit: currentPrice * mult,
        keyLevels: {
          support: [sma20 * 0.98, sma50 * 0.97],
          resistance: [sma20 * 1.02, sma50 * 1.03]
        },
        riskLevel: macroAdj.riskMultiplier > 1.2 ? 'high' : 'medium',
        reasoning: 'Technical analysis based on RSI and moving averages.',
        macroContext: {
          fedRate: `${macro.fedPolicy.currentRate.low}%-${macro.fedPolicy.currentRate.high}%`,
          fedStance: macro.fedPolicy.policyStance,
          inflation: macro.inflation.cpi.value,
          fearGreed: macro.fearGreedIndex,
          overallBias: macro.overallBias,
          adjustment: macroAdj.reasoning
        },
        generatedAt: new Date().toISOString()
      };
    }
  }
}

export const marketDataHub = new MarketDataHub();
