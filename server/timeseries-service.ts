import Anthropic from '@anthropic-ai/sdk';
import { db } from './db';
import { 
  timeseriesSources, 
  timeseriesObservations, 
  timeseriesPredictions,
  timeseriesJobs 
} from '@shared/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { predictiveSignalEngine, Candle } from './predictive-signal-engine';

const anthropic = new Anthropic();

// Simple in-memory cache for rate limit protection
const priceCache: Map<string, { data: any; timestamp: number }> = new Map();
const CACHE_TTL_MS = 10000; // 10 second cache for live prices

function getCached<T>(key: string): T | null {
  const cached = priceCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: any): void {
  priceCache.set(key, { data, timestamp: Date.now() });
}

// Delay helper for retries
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Prediction {
  date: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
  predicted_high: number;
  predicted_low: number;
}

interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  riskPercent: number;
  confidence: number;
  reasoning: string;
  timeframe: string;
  validUntil: string;
}

interface ForecastResult {
  predictions: Prediction[];
  trend: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  trendAnalysis: {
    direction: 'bullish' | 'bearish' | 'sideways';
    strength: 'strong' | 'moderate' | 'weak';
    adxValue: number;
    description: string;
  };
  tradingSignal: TradingSignal;
  confidence: number;
  summary: string;
  methodology: string;
  sentiment: {
    bullishPercent: number;
    bearishPercent: number;
    neutralPercent: number;
    score: number;
    label: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  };
  technicals: {
    rsi: number;
    rsiSignal: 'oversold' | 'neutral' | 'overbought';
    macdSignal: 'bullish' | 'bearish' | 'neutral';
    sma20: number;
    ema12: number;
    volatility: number;
    priceVsSma: 'above' | 'below' | 'at';
  };
}

export class TimeSeriesService {

  // Get LIVE real-time price from CoinGecko simple/price API (no delay)
  async fetchLiveCryptoPrice(symbol: string, retryCount: number = 0): Promise<{
    price: number;
    change24h: number;
    changePercent24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
    marketCap: number;
    lastUpdated: string;
  }> {
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
      'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
      'LINK': 'chainlink', 'MATIC': 'matic-network', 'UNI': 'uniswap', 'ATOM': 'cosmos',
      'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near', 'APT': 'aptos',
      'ARB': 'arbitrum', 'OP': 'optimism', 'INJ': 'injective-protocol', 'TIA': 'celestia',
      'FET': 'fetch-ai', 'RNDR': 'render-token', 'STX': 'blockstack', 'IMX': 'immutable-x', 'SEI': 'sei-network'
    };

    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    const coinId = coinIds[cleanSymbol] || cleanSymbol.toLowerCase();
    const cacheKey = `live_crypto_${coinId}`;
    
    // Check cache first to avoid rate limits
    const cached = getCached<any>(cacheKey);
    if (cached) {
      return cached;
    }

    // Use simple/price for LIVE data with 24h changes
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`CoinGecko error: ${data.error}`);
      }

      const coinData = data[coinId];
      if (!coinData) {
        // Retry with delay on rate limit (up to 2 retries)
        if (retryCount < 2) {
          console.log(`CoinGecko rate limited, retrying in ${(retryCount + 1) * 500}ms...`);
          await delay((retryCount + 1) * 500);
          return this.fetchLiveCryptoPrice(symbol, retryCount + 1);
        }
        throw new Error(`No data found for ${coinId} after ${retryCount + 1} attempts`);
      }

      const result = {
        price: coinData.usd || 0,
        change24h: coinData.usd_24h_change || 0,
        changePercent24h: coinData.usd_24h_change || 0,
        high24h: 0,
        low24h: 0,
        volume24h: coinData.usd_24h_vol || 0,
        marketCap: coinData.usd_market_cap || 0,
        lastUpdated: new Date(coinData.last_updated_at * 1000).toISOString()
      };
      
      // Cache the result
      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('CoinGecko live price error:', error);
      // Return cached data if available, even if expired
      const staleCache = priceCache.get(cacheKey);
      if (staleCache) {
        console.log('Returning stale cached data due to API error');
        return staleCache.data;
      }
      throw error;
    }
  }

  // Get LIVE stock quote from Yahoo Finance (real-time, no API key required)
  async fetchLiveStockPrice(symbol: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    previousClose: number;
    lastUpdated: string;
  }> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result) {
        throw new Error(`No stock data from Yahoo Finance for ${symbol}`);
      }

      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      const timestamps = result.timestamp || [];
      
      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      const todayHigh = quote?.high ? Math.max(...quote.high.filter((h: number | null) => h !== null)) : currentPrice;
      const todayLow = quote?.low ? Math.min(...quote.low.filter((l: number | null) => l !== null && l > 0)) : currentPrice;
      const volume = quote?.volume ? quote.volume.reduce((a: number, b: number | null) => a + (b || 0), 0) : 0;

      console.log(`📈 Yahoo Finance live price for ${symbol}: $${currentPrice.toFixed(2)}`);

      return {
        price: currentPrice,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        high: todayHigh,
        low: todayLow,
        volume: volume,
        previousClose: previousClose,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yahoo Finance live quote error:', error);
      throw error;
    }
  }

  // Get LIVE forex rate from Yahoo Finance (real-time, no API key required)
  async fetchLiveForexRate(fromCurrency: string, toCurrency: string = 'USD'): Promise<{
    price: number;
    bidPrice: number;
    askPrice: number;
    lastUpdated: string;
  }> {
    const yahooSymbol = `${fromCurrency}${toCurrency}=X`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result) {
        throw new Error(`No forex data from Yahoo Finance for ${fromCurrency}/${toCurrency}`);
      }

      const meta = result.meta;
      const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
      
      console.log(`💱 Yahoo Finance forex rate for ${fromCurrency}/${toCurrency}: ${currentPrice.toFixed(5)}`);

      return {
        price: currentPrice,
        bidPrice: currentPrice * 0.9999,
        askPrice: currentPrice * 1.0001,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Yahoo Finance forex rate error:', error);
      throw error;
    }
  }

  // Universal LIVE price fetcher
  async fetchLivePrice(symbol: string, assetType?: 'stock' | 'crypto' | 'forex'): Promise<{
    symbol: string;
    assetType: 'stock' | 'crypto' | 'forex';
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: number;
    lastUpdated: string;
  }> {
    const type = assetType || this.detectAssetType(symbol);
    
    switch (type) {
      case 'crypto': {
        const data = await this.fetchLiveCryptoPrice(symbol);
        return {
          symbol: symbol.toUpperCase(),
          assetType: 'crypto',
          price: data.price,
          change: data.change24h,
          changePercent: data.changePercent24h,
          high: data.high24h,
          low: data.low24h,
          volume: data.volume24h,
          lastUpdated: data.lastUpdated
        };
      }
      case 'forex': {
        const { from, to } = this.parseForexPair(symbol);
        const data = await this.fetchLiveForexRate(from, to);
        return {
          symbol: symbol.toUpperCase(),
          assetType: 'forex',
          price: data.price,
          change: 0,
          changePercent: 0,
          high: data.askPrice,
          low: data.bidPrice,
          volume: 0,
          lastUpdated: data.lastUpdated
        };
      }
      default: {
        const data = await this.fetchLiveStockPrice(symbol);
        return {
          symbol: symbol.toUpperCase(),
          assetType: 'stock',
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          high: data.high,
          low: data.low,
          volume: data.volume,
          lastUpdated: data.lastUpdated
        };
      }
    }
  }

  // Detect asset type from symbol
  detectAssetType(symbol: string): 'stock' | 'crypto' | 'forex' {
    const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'AVAX', 'LINK', 'MATIC', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'INJ', 'TIA', 'FET', 'RNDR', 'STX', 'IMX', 'SEI'];
    const forexPairs = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'CNY', 'HKD', 'SGD', 'MXN', 'INR', 'BRL', 'ZAR'];
    
    const upperSymbol = symbol.toUpperCase();
    if (cryptoSymbols.includes(upperSymbol) || upperSymbol.endsWith('USD') && cryptoSymbols.some(c => upperSymbol.startsWith(c))) {
      return 'crypto';
    }
    if (forexPairs.some(pair => upperSymbol.includes(pair) && upperSymbol.includes('USD'))) {
      return 'forex';
    }
    return 'stock';
  }

  // Fetch crypto data from CoinGecko
  async fetchCryptoData(symbol: string): Promise<PriceData[]> {
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
      'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
      'LINK': 'chainlink', 'MATIC': 'matic-network', 'UNI': 'uniswap', 'ATOM': 'cosmos',
      'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near', 'APT': 'aptos',
      'ARB': 'arbitrum', 'OP': 'optimism', 'INJ': 'injective-protocol', 'TIA': 'celestia',
      'FET': 'fetch-ai', 'RNDR': 'render-token', 'STX': 'blockstack', 'IMX': 'immutable-x', 'SEI': 'sei-network'
    };

    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    const coinId = coinIds[cleanSymbol] || cleanSymbol.toLowerCase();

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(`CoinGecko error: ${data.error}`);
      }

      const prices = data.prices || [];
      const priceData: PriceData[] = [];
      
      // Group by day and create OHLCV data
      const dailyPrices: Record<string, number[]> = {};
      for (const [timestamp, price] of prices) {
        const date = new Date(timestamp).toISOString().split('T')[0];
        if (!dailyPrices[date]) dailyPrices[date] = [];
        dailyPrices[date].push(price);
      }

      for (const [date, dayPrices] of Object.entries(dailyPrices)) {
        priceData.push({
          date,
          open: dayPrices[0],
          high: Math.max(...dayPrices),
          low: Math.min(...dayPrices),
          close: dayPrices[dayPrices.length - 1],
          volume: 0
        });
      }

      return priceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
      throw error;
    }
  }

  // Fetch forex data from Alpha Vantage
  async fetchForexData(fromCurrency: string, toCurrency: string = 'USD'): Promise<PriceData[]> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    const url = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&outputsize=compact&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
      }
      
      if (data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded');
      }

      const timeSeries = data['Time Series FX (Daily)'];
      if (!timeSeries) {
        throw new Error('No forex time series data returned');
      }

      const priceData: PriceData[] = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: 0
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return priceData;
    } catch (error) {
      console.error('Alpha Vantage forex fetch error:', error);
      throw error;
    }
  }

  // Timeframe configurations
  getTimeframeConfig(timeframe: string): { days: number; interval: string; label: string } {
    const configs: Record<string, { days: number; interval: string; label: string }> = {
      '1Y': { days: 365, interval: 'daily', label: '1 Year' },
      '1Mo': { days: 90, interval: 'daily', label: '1 Month' },
      '1W': { days: 30, interval: 'daily', label: '1 Week' },
      '1D': { days: 30, interval: 'daily', label: '1 Day' },
      '4H': { days: 7, interval: '60min', label: '4 Hour' },
      '1H': { days: 3, interval: '60min', label: '1 Hour' },
      '30M': { days: 2, interval: '30min', label: '30 Min' },
      '15M': { days: 1, interval: '15min', label: '15 Min' },
      '5M': { days: 1, interval: '5min', label: '5 Min' },
      '1M': { days: 1, interval: '1min', label: '1 Min' },
      '30S': { days: 1, interval: '1min', label: '30 Sec' }
    };
    return configs[timeframe] || configs['1D'];
  }

  // Fetch real-time crypto data with timeframe support - with Yahoo Finance fallback
  async fetchCryptoDataRealtime(symbol: string, timeframe: string = '1D'): Promise<PriceData[]> {
    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    
    // Try Yahoo Finance first (more reliable, no rate limits)
    try {
      const yahooSymbol = `${cleanSymbol}-USD`;
      const priceData = await this.fetchCryptoFromYahoo(yahooSymbol, timeframe);
      if (priceData.length >= 5) {
        console.log(`🪙 Fetched ${priceData.length} crypto data points for ${cleanSymbol} from Yahoo Finance (${timeframe})`);
        return priceData;
      }
    } catch (yahooError) {
      console.log(`Yahoo Finance crypto fallback failed for ${cleanSymbol}, trying CoinGecko...`);
    }
    
    // Fallback to CoinGecko
    const coinIds: Record<string, string> = {
      'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
      'ADA': 'cardano', 'DOGE': 'dogecoin', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
      'LINK': 'chainlink', 'MATIC': 'matic-network', 'UNI': 'uniswap', 'ATOM': 'cosmos',
      'LTC': 'litecoin', 'BCH': 'bitcoin-cash', 'NEAR': 'near', 'APT': 'aptos',
      'ARB': 'arbitrum', 'OP': 'optimism', 'INJ': 'injective-protocol', 'TIA': 'celestia',
      'FET': 'fetch-ai', 'RNDR': 'render-token', 'STX': 'blockstack', 'IMX': 'immutable-x', 'SEI': 'sei-network'
    };

    const coinId = coinIds[cleanSymbol] || cleanSymbol.toLowerCase();
    const config = this.getTimeframeConfig(timeframe);
    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${config.days}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Check for rate limit error
      if (data.status?.error_code === 429) {
        console.log('CoinGecko rate limited, falling back to Yahoo Finance...');
        return this.fetchCryptoFromYahoo(`${cleanSymbol}-USD`, timeframe);
      }
      
      if (data.error) {
        throw new Error(`CoinGecko error: ${data.error}`);
      }

      const prices = data.prices || [];
      if (prices.length === 0) {
        console.log('CoinGecko returned empty prices, falling back to Yahoo Finance...');
        return this.fetchCryptoFromYahoo(`${cleanSymbol}-USD`, timeframe);
      }
      
      const priceData: PriceData[] = [];
      const intervalMs = this.getIntervalMs(timeframe);
      const groupedPrices: Record<number, number[]> = {};
      
      for (const [timestamp, price] of prices) {
        const bucket = Math.floor(timestamp / intervalMs) * intervalMs;
        if (!groupedPrices[bucket]) groupedPrices[bucket] = [];
        groupedPrices[bucket].push(price);
      }

      for (const [timestamp, groupPrices] of Object.entries(groupedPrices)) {
        const ts = parseInt(timestamp);
        priceData.push({
          date: new Date(ts).toISOString(),
          open: groupPrices[0],
          high: Math.max(...groupPrices),
          low: Math.min(...groupPrices),
          close: groupPrices[groupPrices.length - 1],
          volume: 0
        });
      }

      console.log(`🪙 Fetched ${priceData.length} crypto data points for ${cleanSymbol} from CoinGecko (${timeframe})`);
      return priceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('CoinGecko realtime fetch error:', error);
      // Final fallback to Yahoo Finance
      return this.fetchCryptoFromYahoo(`${cleanSymbol}-USD`, timeframe);
    }
  }

  // Fetch crypto data from Yahoo Finance (BTC-USD, ETH-USD format)
  async fetchCryptoFromYahoo(symbol: string, timeframe: string = '1D'): Promise<PriceData[]> {
    const intervalMap: Record<string, { interval: string; range: string }> = {
      '1M': { interval: '1m', range: '1d' },
      '5M': { interval: '5m', range: '5d' },
      '15M': { interval: '15m', range: '5d' },
      '30M': { interval: '30m', range: '5d' },
      '1H': { interval: '1h', range: '1mo' },
      '4H': { interval: '1h', range: '3mo' },
      '1D': { interval: '1d', range: '6mo' },
      '1W': { interval: '1d', range: '1y' },
      '1Mo': { interval: '1d', range: '2y' },
      '1Y': { interval: '1wk', range: '5y' },
      '30S': { interval: '1m', range: '1d' }
    };
    
    const { interval, range } = intervalMap[timeframe] || intervalMap['1D'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    const result = data.chart?.result?.[0];
    if (!result || !result.timestamp) {
      throw new Error(`No crypto data from Yahoo Finance for ${symbol}`);
    }

    const timestamps = result.timestamp;
    const quote = result.indicators?.quote?.[0];
    
    if (!quote) {
      throw new Error('No quote data from Yahoo Finance');
    }

    const priceData: PriceData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] !== null) {
        priceData.push({
          date: new Date(timestamps[i] * 1000).toISOString(),
          open: quote.open[i] || quote.close[i],
          high: quote.high[i] || quote.close[i],
          low: quote.low[i] || quote.close[i],
          close: quote.close[i],
          volume: quote.volume?.[i] || 0
        });
      }
    }

    return priceData;
  }

  // Get interval in milliseconds for timeframe
  getIntervalMs(timeframe: string): number {
    const intervals: Record<string, number> = {
      '1D': 24 * 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1H': 60 * 60 * 1000,
      '30M': 30 * 60 * 1000,
      '15M': 15 * 60 * 1000,
      '5M': 5 * 60 * 1000,
      '1M': 60 * 1000,
      '30S': 30 * 1000
    };
    return intervals[timeframe] || intervals['1D'];
  }

  // Fetch stock data from Yahoo Finance (real-time, no API key required)
  async fetchStockDataIntraday(symbol: string, timeframe: string = '1D'): Promise<PriceData[]> {
    // Map timeframe to Yahoo Finance interval and range
    const intervalMap: Record<string, { interval: string; range: string }> = {
      '1M': { interval: '1m', range: '1d' },
      '5M': { interval: '5m', range: '5d' },
      '15M': { interval: '15m', range: '5d' },
      '30M': { interval: '30m', range: '5d' },
      '1H': { interval: '1h', range: '1mo' },
      '4H': { interval: '1h', range: '3mo' },
      '1D': { interval: '1d', range: '6mo' },
      '1W': { interval: '1d', range: '1y' },
      '1Mo': { interval: '1d', range: '2y' },
      '1Y': { interval: '1wk', range: '5y' },
      '30S': { interval: '1m', range: '1d' }
    };
    
    const { interval, range } = intervalMap[timeframe] || intervalMap['1D'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result || !result.timestamp) {
        throw new Error(`No stock data from Yahoo Finance for ${symbol}`);
      }

      const timestamps = result.timestamp;
      const quote = result.indicators?.quote?.[0];
      
      if (!quote) {
        throw new Error('No quote data from Yahoo Finance');
      }

      const priceData: PriceData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.close[i] !== null) {
          priceData.push({
            date: new Date(timestamps[i] * 1000).toISOString(),
            open: quote.open[i] || quote.close[i],
            high: quote.high[i] || quote.close[i],
            low: quote.low[i] || quote.close[i],
            close: quote.close[i],
            volume: quote.volume?.[i] || 0
          });
        }
      }

      console.log(`📈 Fetched ${priceData.length} stock data points for ${symbol} from Yahoo Finance (${timeframe})`);
      return priceData;
    } catch (error) {
      console.error('Yahoo Finance stock fetch error:', error);
      throw error;
    }
  }

  // Fetch forex data from Yahoo Finance (real-time, no API key required)
  async fetchForexDataIntraday(fromCurrency: string, toCurrency: string, timeframe: string = '1D'): Promise<PriceData[]> {
    const config = this.getTimeframeConfig(timeframe);
    
    // Yahoo Finance forex symbol format: EURUSD=X
    const yahooSymbol = `${fromCurrency}${toCurrency}=X`;
    
    // Map timeframe to Yahoo Finance interval and range
    const intervalMap: Record<string, { interval: string; range: string }> = {
      '1M': { interval: '1m', range: '1d' },
      '5M': { interval: '5m', range: '5d' },
      '15M': { interval: '15m', range: '5d' },
      '30M': { interval: '30m', range: '5d' },
      '1H': { interval: '1h', range: '1mo' },
      '4H': { interval: '1h', range: '3mo' },
      '1D': { interval: '1d', range: '6mo' },
      '1W': { interval: '1d', range: '1y' },
      '1Mo': { interval: '1d', range: '2y' },
      '1Y': { interval: '1wk', range: '5y' }
    };
    
    const { interval, range } = intervalMap[timeframe] || intervalMap['1D'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      const result = data.chart?.result?.[0];
      if (!result || !result.timestamp) {
        throw new Error(`No forex data from Yahoo Finance for ${fromCurrency}/${toCurrency}`);
      }

      const timestamps = result.timestamp;
      const quote = result.indicators?.quote?.[0];
      
      if (!quote) {
        throw new Error('No quote data from Yahoo Finance');
      }

      const priceData: PriceData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quote.close[i] !== null) {
          priceData.push({
            date: new Date(timestamps[i] * 1000).toISOString(),
            open: quote.open[i] || quote.close[i],
            high: quote.high[i] || quote.close[i],
            low: quote.low[i] || quote.close[i],
            close: quote.close[i],
            volume: 0
          });
        }
      }

      console.log(`💱 Fetched ${priceData.length} forex data points for ${fromCurrency}/${toCurrency} from Yahoo Finance (${timeframe})`);
      return priceData;
    } catch (error) {
      console.error('Yahoo Finance forex fetch error:', error);
      throw error;
    }
  }

  // Universal data fetcher with timeframe support
  async fetchAssetDataWithTimeframe(symbol: string, timeframe: string = '1D', assetType?: 'stock' | 'crypto' | 'forex'): Promise<PriceData[]> {
    const type = assetType || this.detectAssetType(symbol);
    
    switch (type) {
      case 'crypto':
        return this.fetchCryptoDataRealtime(symbol, timeframe);
      case 'forex':
        const { from, to } = this.parseForexPair(symbol);
        return this.fetchForexDataIntraday(from, to, timeframe);
      default:
        return this.fetchStockDataIntraday(symbol, timeframe);
    }
  }

  // Parse forex pair into base and quote currencies
  parseForexPair(symbol: string): { from: string; to: string } {
    const clean = symbol.toUpperCase().replace('/', '');
    
    // Standard 6-character forex pairs (e.g., EURUSD, USDJPY)
    if (clean.length === 6) {
      return { from: clean.slice(0, 3), to: clean.slice(3, 6) };
    }
    
    // If symbol ends with USD, treat it as XXX/USD
    if (clean.endsWith('USD')) {
      return { from: clean.slice(0, -3), to: 'USD' };
    }
    
    // If symbol starts with USD, treat it as USD/XXX
    if (clean.startsWith('USD')) {
      return { from: 'USD', to: clean.slice(3) };
    }
    
    // Default: assume first 3 chars are base, rest is quote
    return { from: clean.slice(0, 3), to: clean.slice(3) || 'USD' };
  }

  // Universal data fetcher based on asset type
  async fetchAssetData(symbol: string, assetType?: 'stock' | 'crypto' | 'forex'): Promise<PriceData[]> {
    const type = assetType || this.detectAssetType(symbol);
    
    switch (type) {
      case 'crypto':
        return this.fetchCryptoData(symbol);
      case 'forex':
        const { from, to } = this.parseForexPair(symbol);
        return this.fetchForexData(from, to);
      default:
        return this.fetchAlphaVantageData(symbol);
    }
  }
  
  async fetchAlphaVantageData(symbol: string): Promise<PriceData[]> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('ALPHA_VANTAGE_API_KEY not configured');
    }

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
      }
      
      if (data['Note']) {
        throw new Error('Alpha Vantage API rate limit exceeded');
      }

      const timeSeries = data['Time Series (Daily)'];
      if (!timeSeries) {
        throw new Error('No time series data returned');
      }

      const priceData: PriceData[] = Object.entries(timeSeries)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume'])
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return priceData;
    } catch (error) {
      console.error('Alpha Vantage fetch error:', error);
      throw error;
    }
  }

  calculateMovingAverage(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  calculateExponentialMA(data: number[], period: number): number[] {
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

  calculateRSI(closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 50;
    
    const changes = [];
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

  calculateTrend(data: number[]): 'bullish' | 'bearish' | 'neutral' | 'volatile' {
    if (data.length < 10) return 'neutral';
    
    const recentData = data.slice(-20);
    const firstHalf = recentData.slice(0, 10);
    const secondHalf = recentData.slice(-10);
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const percentChange = ((secondAvg - firstAvg) / firstAvg) * 100;
    const volatility = this.calculateVolatility(recentData);
    
    if (volatility > 5) return 'volatile';
    if (percentChange > 2) return 'bullish';
    if (percentChange < -2) return 'bearish';
    return 'neutral';
  }

  calculateVolatility(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
    return (Math.sqrt(variance) / mean) * 100;
  }

  calculateTrendStrength(priceData: PriceData[]): {
    direction: 'bullish' | 'bearish' | 'sideways';
    strength: 'strong' | 'moderate' | 'weak';
    adxValue: number;
    description: string;
  } {
    if (priceData.length < 14) {
      return {
        direction: 'sideways',
        strength: 'weak',
        adxValue: 0,
        description: 'Insufficient data to determine trend strength'
      };
    }

    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const closes = priceData.map(d => d.close);
    
    // Calculate True Range and Directional Movement
    const trueRanges: number[] = [];
    const plusDMs: number[] = [];
    const minusDMs: number[] = [];
    
    for (let i = 1; i < priceData.length; i++) {
      const highDiff = highs[i] - highs[i - 1];
      const lowDiff = lows[i - 1] - lows[i];
      
      const trueRange = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(trueRange);
      
      plusDMs.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
      minusDMs.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    }
    
    // Calculate smoothed averages (14-period)
    const period = 14;
    const smoothedTR = trueRanges.slice(-period).reduce((a, b) => a + b, 0);
    const smoothedPlusDM = plusDMs.slice(-period).reduce((a, b) => a + b, 0);
    const smoothedMinusDM = minusDMs.slice(-period).reduce((a, b) => a + b, 0);
    
    // Calculate +DI and -DI
    const plusDI = smoothedTR > 0 ? (smoothedPlusDM / smoothedTR) * 100 : 0;
    const minusDI = smoothedTR > 0 ? (smoothedMinusDM / smoothedTR) * 100 : 0;
    
    // Calculate DX and ADX
    const diSum = plusDI + minusDI;
    const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;
    
    // ADX is typically smoothed over 14 periods, but we use single DX as approximation
    const adxValue = Math.round(dx * 10) / 10;
    
    // Determine direction based on +DI vs -DI
    let direction: 'bullish' | 'bearish' | 'sideways';
    if (plusDI > minusDI && plusDI - minusDI > 5) {
      direction = 'bullish';
    } else if (minusDI > plusDI && minusDI - plusDI > 5) {
      direction = 'bearish';
    } else {
      direction = 'sideways';
    }
    
    // Determine strength based on ADX value
    let strength: 'strong' | 'moderate' | 'weak';
    if (adxValue >= 25) {
      strength = 'strong';
    } else if (adxValue >= 15) {
      strength = 'moderate';
    } else {
      strength = 'weak';
    }
    
    // Generate description
    let description: string;
    if (strength === 'strong') {
      description = `Strong ${direction} trend detected (ADX: ${adxValue}). The market is showing clear directional momentum.`;
    } else if (strength === 'moderate') {
      description = `Moderate ${direction} trend (ADX: ${adxValue}). Trend is developing but not yet firmly established.`;
    } else {
      description = direction === 'sideways' 
        ? `Weak/no trend (ADX: ${adxValue}). Market is consolidating in a sideways range.`
        : `Weak ${direction} bias (ADX: ${adxValue}). Trend strength is low, consider waiting for confirmation.`;
    }
    
    return { direction, strength, adxValue, description };
  }

  // Format price to appropriate precision based on asset type and price level
  formatPricePrecision(price: number, assetType: 'stock' | 'crypto' | 'forex' = 'stock'): number {
    if (assetType === 'forex') {
      return Math.round(price * 100000) / 100000; // 5 decimal places for forex (pips)
    }
    if (assetType === 'crypto') {
      if (price > 1000) return Math.round(price * 100) / 100; // 2 decimals for BTC-level
      if (price > 1) return Math.round(price * 1000) / 1000; // 3 decimals for mid-range
      return Math.round(price * 100000) / 100000; // 5 decimals for small coins
    }
    // Stocks - penny precision
    return Math.round(price * 100) / 100;
  }

  // Calculate ATR (Average True Range) for stop loss/take profit calculations
  calculateATR(priceData: PriceData[], period: number = 14): number {
    if (priceData.length < 2) return 0;
    
    const trueRanges: number[] = [];
    for (let i = 1; i < priceData.length; i++) {
      const high = priceData[i].high;
      const low = priceData[i].low;
      const prevClose = priceData[i - 1].close;
      
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

  // Generate trading signal with precise entry, stop loss, and take profit levels
  generateTradingSignal(
    priceData: PriceData[],
    technicals: { rsi: number; rsiSignal: string; macdSignal: string; priceVsSma: string },
    trendAnalysis: { direction: string; strength: string; adxValue: number },
    timeframe: string = '1D',
    assetType: 'stock' | 'crypto' | 'forex' = 'stock'
  ): TradingSignal {
    const currentPrice = priceData[priceData.length - 1].close;
    const atr = this.calculateATR(priceData);
    
    // Determine signal action based on multiple factors
    let buyScore = 0;
    let sellScore = 0;
    
    // RSI contribution
    if (technicals.rsi < 30) buyScore += 2; // Oversold
    else if (technicals.rsi < 40) buyScore += 1;
    else if (technicals.rsi > 70) sellScore += 2; // Overbought
    else if (technicals.rsi > 60) sellScore += 1;
    
    // MACD contribution
    if (technicals.macdSignal === 'bullish') buyScore += 1.5;
    else if (technicals.macdSignal === 'bearish') sellScore += 1.5;
    
    // Price vs SMA contribution
    if (technicals.priceVsSma === 'above') buyScore += 1;
    else if (technicals.priceVsSma === 'below') sellScore += 1;
    
    // Trend contribution (weighted by strength)
    const strengthMultiplier = trendAnalysis.strength === 'strong' ? 2 : 
                               trendAnalysis.strength === 'moderate' ? 1.5 : 1;
    if (trendAnalysis.direction === 'bullish') buyScore += 1.5 * strengthMultiplier;
    else if (trendAnalysis.direction === 'bearish') sellScore += 1.5 * strengthMultiplier;
    
    // Determine action
    let action: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
    const netScore = buyScore - sellScore;
    
    if (netScore >= 4) action = 'STRONG_BUY';
    else if (netScore >= 2) action = 'BUY';
    else if (netScore <= -4) action = 'STRONG_SELL';
    else if (netScore <= -2) action = 'SELL';
    else action = 'HOLD';
    
    // Calculate stop loss and take profit based on ATR
    const atrMultiplier = {
      '1Y': 5, '1Mo': 3, '1W': 2.5, '1D': 2, '4H': 1.5, '1H': 1.2,
      '30M': 1, '15M': 0.8, '5M': 0.6, '1M': 0.5, '30S': 0.4
    }[timeframe] || 2;
    
    const stopDistance = atr * atrMultiplier;
    const isBullish = action === 'BUY' || action === 'STRONG_BUY';
    
    const stopLoss = isBullish 
      ? this.formatPricePrecision(currentPrice - stopDistance, assetType)
      : this.formatPricePrecision(currentPrice + stopDistance, assetType);
    
    // Take profit levels at 1.5x, 2.5x, and 4x risk
    const takeProfit1 = isBullish
      ? this.formatPricePrecision(currentPrice + stopDistance * 1.5, assetType)
      : this.formatPricePrecision(currentPrice - stopDistance * 1.5, assetType);
    const takeProfit2 = isBullish
      ? this.formatPricePrecision(currentPrice + stopDistance * 2.5, assetType)
      : this.formatPricePrecision(currentPrice - stopDistance * 2.5, assetType);
    const takeProfit3 = isBullish
      ? this.formatPricePrecision(currentPrice + stopDistance * 4, assetType)
      : this.formatPricePrecision(currentPrice - stopDistance * 4, assetType);
    
    // Calculate risk/reward ratio (using TP2 as target)
    const risk = Math.abs(currentPrice - stopLoss);
    const reward = Math.abs(takeProfit2 - currentPrice);
    const riskRewardRatio = risk > 0 ? Math.round(reward / risk * 100) / 100 : 0;
    
    // Risk percent (ATR-based volatility as % of price)
    const riskPercent = Math.round((stopDistance / currentPrice) * 10000) / 100;
    
    // Confidence based on signal strength and trend confirmation
    let confidence = 50;
    confidence += Math.abs(netScore) * 5;
    confidence += trendAnalysis.adxValue / 2;
    confidence = Math.min(95, Math.max(30, Math.round(confidence)));
    
    // Generate reasoning
    const reasons: string[] = [];
    if (technicals.rsiSignal === 'oversold') reasons.push('RSI oversold');
    if (technicals.rsiSignal === 'overbought') reasons.push('RSI overbought');
    if (technicals.macdSignal === 'bullish') reasons.push('MACD bullish crossover');
    if (technicals.macdSignal === 'bearish') reasons.push('MACD bearish crossover');
    if (trendAnalysis.strength !== 'weak') reasons.push(`${trendAnalysis.strength} ${trendAnalysis.direction} trend`);
    if (technicals.priceVsSma === 'above') reasons.push('price above SMA20');
    if (technicals.priceVsSma === 'below') reasons.push('price below SMA20');
    
    const reasoning = reasons.length > 0 
      ? `${action} signal based on: ${reasons.join(', ')}.`
      : `${action} signal - no strong directional indicators present.`;
    
    // Valid until based on timeframe
    const validityHours = {
      '1Y': 24 * 30, '1Mo': 24 * 7, '1W': 24 * 2, '1D': 24, '4H': 8, '1H': 2,
      '30M': 1, '15M': 0.5, '5M': 0.25, '1M': 0.1, '30S': 0.05
    }[timeframe] || 24;
    const validUntil = new Date(Date.now() + validityHours * 60 * 60 * 1000).toISOString();
    
    return {
      action,
      entryPrice: this.formatPricePrecision(currentPrice, assetType),
      stopLoss,
      takeProfit1,
      takeProfit2,
      takeProfit3,
      riskRewardRatio,
      riskPercent,
      confidence,
      reasoning,
      timeframe,
      validUntil
    };
  }

  async generateStatisticalForecast(priceData: PriceData[], horizonDays: number = 30, timeframe: string = '1D', assetType: 'stock' | 'crypto' | 'forex' = 'stock'): Promise<ForecastResult> {
    // Validate we have enough data
    if (!priceData || priceData.length < 5) {
      throw new Error('Insufficient historical data for forecast. Need at least 5 data points.');
    }
    
    const closes = priceData.map(d => d.close);
    const highs = priceData.map(d => d.high);
    const lows = priceData.map(d => d.low);
    const lastPrice = closes[closes.length - 1];
    const lastDate = new Date(priceData[priceData.length - 1].date);
    
    const sma20 = this.calculateMovingAverage(closes, 20);
    const ema12 = this.calculateExponentialMA(closes, 12);
    const rsi = this.calculateRSI(closes);
    const trend = this.calculateTrend(closes);
    const volatility = this.calculateVolatility(closes.slice(-30));
    
    const recentReturns = [];
    for (let i = Math.max(0, closes.length - 30); i < closes.length - 1; i++) {
      recentReturns.push((closes[i + 1] - closes[i]) / closes[i]);
    }
    const avgDailyReturn = recentReturns.reduce((a, b) => a + b, 0) / recentReturns.length;
    const stdDev = Math.sqrt(
      recentReturns.map(r => Math.pow(r - avgDailyReturn, 2)).reduce((a, b) => a + b, 0) / recentReturns.length
    );
    
    // Calculate average high-low range as percentage of close for high/low predictions
    const recentData = priceData.slice(-30);
    const avgHighPercent = recentData.reduce((sum, d) => sum + (d.high - d.close) / d.close, 0) / recentData.length;
    const avgLowPercent = recentData.reduce((sum, d) => sum + (d.close - d.low) / d.close, 0) / recentData.length;
    
    const predictions: Prediction[] = [];
    let currentPrice = lastPrice;
    
    for (let i = 1; i <= horizonDays; i++) {
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      if (futureDate.getDay() === 0 || futureDate.getDay() === 6) continue;
      
      const expectedReturn = avgDailyReturn * Math.pow(0.95, i / 10);
      const predictedPrice = currentPrice * (1 + expectedReturn);
      const uncertainty = stdDev * Math.sqrt(i) * currentPrice;
      
      // Calculate predicted high and low for the period
      // High expands with volatility over time
      const highExpansion = avgHighPercent * (1 + volatility / 100 * Math.sqrt(i));
      const lowExpansion = avgLowPercent * (1 + volatility / 100 * Math.sqrt(i));
      const predictedHigh = predictedPrice * (1 + highExpansion);
      const predictedLow = predictedPrice * (1 - lowExpansion);
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        value: Math.round(predictedPrice * 100) / 100,
        lower_bound: Math.round((predictedPrice - 2 * uncertainty) * 100) / 100,
        upper_bound: Math.round((predictedPrice + 2 * uncertainty) * 100) / 100,
        predicted_high: Math.round(predictedHigh * 100) / 100,
        predicted_low: Math.round(predictedLow * 100) / 100
      });
      
      currentPrice = predictedPrice;
    }
    
    let confidence = 70;
    if (volatility > 5) confidence -= 15;
    if (volatility > 10) confidence -= 10;
    if (trend === 'volatile') confidence -= 10;
    confidence = Math.max(40, Math.min(90, confidence));
    
    // Calculate sentiment percentages based on technical indicators
    const bullishSignals = (rsi < 30 ? 1 : 0) + (trend === 'bullish' ? 1 : 0) + (lastPrice > sma20[sma20.length - 1] ? 1 : 0);
    const bearishSignals = (rsi > 70 ? 1 : 0) + (trend === 'bearish' ? 1 : 0) + (lastPrice < sma20[sma20.length - 1] ? 1 : 0);
    const totalSignals = 3;
    
    const bullishPercent = Math.round((bullishSignals / totalSignals) * 100);
    const bearishPercent = Math.round((bearishSignals / totalSignals) * 100);
    const neutralPercent = 100 - bullishPercent - bearishPercent;
    
    // Calculate sentiment score (0-100, where 0 = extreme fear, 100 = extreme greed)
    let sentimentScore = 50;
    sentimentScore += (rsi - 50) * 0.3; // RSI contribution
    sentimentScore += (trend === 'bullish' ? 15 : trend === 'bearish' ? -15 : 0);
    sentimentScore += (lastPrice > sma20[sma20.length - 1] ? 10 : -10);
    sentimentScore = Math.max(0, Math.min(100, Math.round(sentimentScore)));
    
    const getSentimentLabel = (score: number): 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed' => {
      if (score <= 20) return 'Extreme Fear';
      if (score <= 40) return 'Fear';
      if (score <= 60) return 'Neutral';
      if (score <= 80) return 'Greed';
      return 'Extreme Greed';
    };
    
    // Calculate MACD signal
    const ema26 = this.calculateExponentialMA(closes, 26);
    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
    const macdSignal: 'bullish' | 'bearish' | 'neutral' = macdLine > 0 ? 'bullish' : macdLine < 0 ? 'bearish' : 'neutral';
    
    // RSI signal
    const rsiSignal: 'oversold' | 'neutral' | 'overbought' = rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral';
    
    // Price vs SMA
    const currentSma = sma20[sma20.length - 1];
    const priceVsSma: 'above' | 'below' | 'at' = lastPrice > currentSma * 1.01 ? 'above' : lastPrice < currentSma * 0.99 ? 'below' : 'at';
    
    // Calculate trend strength analysis using ADX-based method
    const trendAnalysis = this.calculateTrendStrength(priceData);
    
    // Build technicals object for trading signal
    const technicals = {
      rsi: Math.round(rsi * 10) / 10,
      rsiSignal,
      macdSignal,
      sma20: Math.round(currentSma * 100) / 100,
      ema12: Math.round(ema12[ema12.length - 1] * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      priceVsSma
    };
    
    // Generate trading signal with buy/sell recommendation
    const tradingSignal = this.generateTradingSignal(priceData, technicals, trendAnalysis, timeframe, assetType);
    
    const trendWord = trend === 'bullish' ? 'upward' : trend === 'bearish' ? 'downward' : 'sideways';
    const signalText = tradingSignal.action !== 'HOLD' 
      ? ` Trading Signal: ${tradingSignal.action} at $${tradingSignal.entryPrice}, Stop: $${tradingSignal.stopLoss}, Target: $${tradingSignal.takeProfit2}.`
      : ' Trading Signal: HOLD - wait for clearer setup.';
    const summary = `Based on statistical analysis, the asset shows a ${trendWord} trend with RSI at ${rsi.toFixed(1)}. ` +
      `Trend Analysis: ${trendAnalysis.strength} ${trendAnalysis.direction} (ADX: ${trendAnalysis.adxValue}). ` +
      `Current volatility is ${volatility.toFixed(2)}%. Sentiment score: ${sentimentScore}/100 (${getSentimentLabel(sentimentScore)}).${signalText} ` +
      `The ${horizonDays}-day forecast suggests ${trend === 'bullish' ? 'potential gains' : trend === 'bearish' ? 'potential decline' : 'consolidation'}.`;
    
    return {
      predictions,
      trend,
      trendAnalysis,
      tradingSignal,
      confidence,
      summary,
      methodology: 'Statistical analysis using moving averages, RSI, MACD, ADX trend strength, and historical volatility patterns with ATR-based trading signals.',
      sentiment: {
        bullishPercent,
        bearishPercent,
        neutralPercent,
        score: sentimentScore,
        label: getSentimentLabel(sentimentScore)
      },
      technicals
    };
  }

  async generateAIForecast(symbol: string, priceData: PriceData[], horizonDays: number = 30, timeframe: string = '1D', assetType: 'stock' | 'crypto' | 'forex' = 'stock'): Promise<ForecastResult> {
    const closes = priceData.map(d => d.close);
    const statisticalForecast = await this.generateStatisticalForecast(priceData, horizonDays, timeframe, assetType);
    
    const recentPrices = priceData.slice(-30).map(d => ({
      date: d.date,
      close: d.close,
      volume: d.volume
    }));
    
    const prompt = `You are a professional financial analyst. Analyze this stock data for ${symbol} and provide a market prediction.

Recent 30-day price data:
${JSON.stringify(recentPrices, null, 2)}

Technical indicators:
- Current Price: $${closes[closes.length - 1].toFixed(2)}
- 20-day SMA: $${(closes.slice(-20).reduce((a,b) => a+b, 0) / 20).toFixed(2)}
- RSI (14): ${this.calculateRSI(closes).toFixed(1)}
- Trend: ${statisticalForecast.trend}
- Volatility: ${this.calculateVolatility(closes.slice(-30)).toFixed(2)}%

Provide a brief market analysis (3-4 sentences) covering:
1. Current market position and momentum
2. Key support/resistance levels
3. Short-term outlook for the next ${horizonDays} days
4. Key risks to watch

Keep your response concise and actionable.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      });
      
      const aiAnalysis = response.content[0].type === 'text' ? response.content[0].text : '';
      
      return {
        ...statisticalForecast,
        summary: aiAnalysis,
        methodology: 'AI-enhanced analysis combining statistical models with Claude AI market interpretation.'
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      return statisticalForecast;
    }
  }

  async createOrGetSource(symbol: string, industry: string = 'finance', sourceType: 'stock' | 'crypto' | 'forex' = 'stock'): Promise<number> {
    const [existing] = await db
      .select()
      .from(timeseriesSources)
      .where(eq(timeseriesSources.symbol, symbol.toUpperCase()));
    
    if (existing) return existing.id;

    const typeNames = { stock: 'Stock', crypto: 'Cryptocurrency', forex: 'Forex Pair' };
    const providers = { stock: 'alpha_vantage', crypto: 'coingecko', forex: 'alpha_vantage' };
    
    const [newSource] = await db
      .insert(timeseriesSources)
      .values({
        name: `${symbol.toUpperCase()} ${typeNames[sourceType]}`,
        slug: symbol.toLowerCase(),
        industry,
        sourceType,
        symbol: symbol.toUpperCase(),
        dataProvider: providers[sourceType],
        updateFrequency: 'daily',
        isActive: true
      })
      .returning();
    
    return newSource.id;
  }

  async savePrediction(sourceId: number, forecast: ForecastResult, horizonDays: number, modelType: string = 'ai_analysis'): Promise<number> {
    const [prediction] = await db
      .insert(timeseriesPredictions)
      .values({
        sourceId,
        modelType,
        horizonDays,
        predictions: forecast.predictions,
        confidence: forecast.confidence.toString(),
        trend: forecast.trend,
        summary: forecast.summary,
        methodology: forecast.methodology
      })
      .returning();
    
    return prediction.id;
  }

  async getLatestPrediction(symbol: string): Promise<any> {
    const [source] = await db
      .select()
      .from(timeseriesSources)
      .where(eq(timeseriesSources.symbol, symbol.toUpperCase()));
    
    if (!source) return null;
    
    const [prediction] = await db
      .select()
      .from(timeseriesPredictions)
      .where(eq(timeseriesPredictions.sourceId, source.id))
      .orderBy(desc(timeseriesPredictions.createdAt))
      .limit(1);
    
    return prediction ? { ...prediction, source } : null;
  }

  // Generate synthetic price data when API is unavailable
  generateSyntheticPriceData(symbol: string, assetType: 'stock' | 'crypto' | 'forex', count: number = 100): PriceData[] {
    const basePrices: Record<string, number> = {
      'BTC': 88000, 'ETH': 3100, 'SOL': 180, 'XRP': 2.3, 'ADA': 0.9,
      'AAPL': 195, 'GOOGL': 175, 'MSFT': 420, 'TSLA': 380, 'NVDA': 140
    };
    
    const cleanSymbol = symbol.toUpperCase().replace('USD', '').replace('USDT', '');
    let basePrice = basePrices[cleanSymbol] || (assetType === 'crypto' ? 100 : assetType === 'forex' ? 1.1 : 150);
    const volatility = assetType === 'crypto' ? 0.025 : assetType === 'forex' ? 0.003 : 0.015;
    
    const now = new Date();
    const data: PriceData[] = [];
    let price = basePrice;
    
    for (let i = count; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 2 * volatility;
      price = price * (1 + change);
      
      const dayVolatility = price * volatility * 0.5;
      const high = price + Math.random() * dayVolatility;
      const low = price - Math.random() * dayVolatility;
      const open = price + (Math.random() - 0.5) * dayVolatility;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  }

  async runForecast(symbol: string, horizonDays: number = 30, useAI: boolean = true, assetType?: 'stock' | 'crypto' | 'forex'): Promise<any> {
    // Always auto-detect for known crypto/forex symbols to avoid wrong API calls
    const autoDetectedType = this.detectAssetType(symbol);
    const detectedType = autoDetectedType !== 'stock' ? autoDetectedType : (assetType || autoDetectedType);
    console.log(`📈 Running forecast for ${symbol} (${detectedType}${assetType && assetType !== detectedType ? `, overrode ${assetType}` : ''}), horizon: ${horizonDays} days, AI: ${useAI}`);
    
    const priceData = await this.fetchAssetData(symbol, detectedType);
    const sourceId = await this.createOrGetSource(symbol, 'finance', detectedType);
    
    const forecast = useAI 
      ? await this.generateAIForecast(symbol, priceData, horizonDays, '1D', detectedType)
      : await this.generateStatisticalForecast(priceData, horizonDays, '1D', detectedType);
    
    const predictionId = await this.savePrediction(
      sourceId, 
      forecast, 
      horizonDays, 
      useAI ? 'ai_analysis' : 'statistical'
    );
    
    let liquiditySweep: any = null;
    try {
      if (priceData.length >= 20) {
        const candles: Candle[] = priceData.map((p) => ({
          time: new Date(p.date).getTime(),
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume
        }));
        
        const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
          symbol.toUpperCase(),
          candles
        );
        
        liquiditySweep = {
          status: snapshot.liquiditySweep.status,
          gate1Passed: snapshot.liquiditySweep.gate1Passed,
          gate2Passed: snapshot.liquiditySweep.gate2Passed,
          gate3Passed: snapshot.liquiditySweep.gate3Passed,
          swingLow: snapshot.liquiditySweep.swingLow,
          volumeMultiplier: snapshot.liquiditySweep.volumeMultiplier,
          isConsolidating: snapshot.liquiditySweep.isConsolidating,
          isWeakSweep: snapshot.liquiditySweep.isWeakSweep,
          targetFVG: snapshot.liquiditySweep.targetFVG,
          reasons: snapshot.liquiditySweep.reasons
        };
      }
    } catch (e) {
      // Skip liquidity sweep if error
    }

    return {
      id: predictionId,
      symbol,
      currentPrice: priceData[priceData.length - 1].close,
      historicalData: priceData.slice(-60),
      liquiditySweep,
      ...forecast
    };
  }

  async runForecastWithTimeframe(symbol: string, timeframe: string = '1D', horizonDays: number = 30, useAI: boolean = true, assetType?: 'stock' | 'crypto' | 'forex'): Promise<any> {
    // Always auto-detect for known crypto/forex symbols to avoid wrong API calls
    const autoDetectedType = this.detectAssetType(symbol);
    const detectedType = autoDetectedType !== 'stock' ? autoDetectedType : (assetType || autoDetectedType);
    const config = this.getTimeframeConfig(timeframe);
    console.log(`📈 Running ${timeframe} forecast for ${symbol} (${detectedType}${assetType && assetType !== detectedType ? `, overrode ${assetType}` : ''}), horizon: ${horizonDays}, AI: ${useAI}`);
    
    let priceData: PriceData[];
    try {
      priceData = await this.fetchAssetDataWithTimeframe(symbol, timeframe, detectedType);
    } catch (error: any) {
      console.error(`❌ API fetch failed for ${symbol}:`, error.message);
      throw new Error(`Live data unavailable for ${symbol}: ${error.message}. Please try again later or check if the symbol is valid.`);
    }
    
    // Require minimum data points for accurate analysis - no synthetic fallback
    if (!priceData || priceData.length < 5) {
      const dataPoints = priceData?.length || 0;
      console.error(`❌ Insufficient live data for ${symbol}: only ${dataPoints} data points available`);
      throw new Error(`Insufficient live data for ${symbol}: only ${dataPoints} data points available. At least 5 data points are required for analysis. This may be due to API rate limits or the asset not having enough trading history.`);
    }
    
    const sourceId = await this.createOrGetSource(symbol, 'finance', detectedType);
    
    const forecast = useAI 
      ? await this.generateAIForecast(symbol, priceData, horizonDays, timeframe, detectedType)
      : await this.generateStatisticalForecast(priceData, horizonDays, timeframe, detectedType);
    
    const predictionId = await this.savePrediction(
      sourceId, 
      forecast, 
      horizonDays, 
      useAI ? 'ai_analysis' : 'statistical'
    );
    
    let liquiditySweep: any = null;
    try {
      if (priceData.length >= 20) {
        const candles: Candle[] = priceData.map((p, i) => ({
          time: new Date(p.date).getTime(),
          open: p.open,
          high: p.high,
          low: p.low,
          close: p.close,
          volume: p.volume
        }));
        
        const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
          symbol.toUpperCase(),
          candles
        );
        
        liquiditySweep = {
          status: snapshot.liquiditySweep.status,
          gate1Passed: snapshot.liquiditySweep.gate1Passed,
          gate2Passed: snapshot.liquiditySweep.gate2Passed,
          gate3Passed: snapshot.liquiditySweep.gate3Passed,
          swingLow: snapshot.liquiditySweep.swingLow,
          volumeMultiplier: snapshot.liquiditySweep.volumeMultiplier,
          isConsolidating: snapshot.liquiditySweep.isConsolidating,
          isWeakSweep: snapshot.liquiditySweep.isWeakSweep,
          targetFVG: snapshot.liquiditySweep.targetFVG,
          reasons: snapshot.liquiditySweep.reasons
        };
      }
    } catch (e) {
      // Skip liquidity sweep if error
    }

    return {
      id: predictionId,
      symbol,
      timeframe,
      timeframeLabel: config.label,
      currentPrice: priceData.length > 0 ? priceData[priceData.length - 1].close : 0,
      historicalData: priceData,
      lastUpdated: new Date().toISOString(),
      liquiditySweep,
      ...forecast
    };
  }
  // ==========================================
  // VOLATILITY QUOTIENT (VQ) SYSTEM
  // Based on True Range calculations - measures price volatility
  // Similar to TradeSmith's proprietary volatility metric
  // ==========================================

  calculateVolatilityQuotient(priceData: PriceData[]): {
    vq: number;
    vqPercent: number;
    atr: number;
    atrPercent: number;
    volatilityLevel: 'low' | 'medium' | 'high' | 'extreme';
    stopLossPrice: number;
    trailingStopPercent: number;
  } {
    if (priceData.length < 14) {
      throw new Error('Need at least 14 data points for VQ calculation');
    }

    const currentPrice = priceData[priceData.length - 1].close;
    
    // Calculate True Range for each day
    const trueRanges: number[] = [];
    for (let i = 1; i < priceData.length; i++) {
      const high = priceData[i].high;
      const low = priceData[i].low;
      const prevClose = priceData[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trueRanges.push(tr);
    }

    // Calculate Average True Range (ATR) - 14 period
    const atr14 = trueRanges.slice(-14).reduce((sum, tr) => sum + tr, 0) / 14;
    const atrPercent = (atr14 / currentPrice) * 100;

    // VQ is calculated as 2.5x ATR (similar to TradeSmith methodology)
    // This gives the "normal" range a stock moves
    const vq = atr14 * 2.5;
    const vqPercent = (vq / currentPrice) * 100;

    // Determine volatility level
    let volatilityLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (vqPercent < 8) volatilityLevel = 'low';
    else if (vqPercent < 15) volatilityLevel = 'medium';
    else if (vqPercent < 25) volatilityLevel = 'high';
    else volatilityLevel = 'extreme';

    // Calculate trailing stop price (current price - VQ)
    const stopLossPrice = currentPrice - vq;
    const trailingStopPercent = vqPercent;

    return {
      vq: Math.round(vq * 100) / 100,
      vqPercent: Math.round(vqPercent * 100) / 100,
      atr: Math.round(atr14 * 100) / 100,
      atrPercent: Math.round(atrPercent * 100) / 100,
      volatilityLevel,
      stopLossPrice: Math.round(stopLossPrice * 100) / 100,
      trailingStopPercent: Math.round(trailingStopPercent * 100) / 100
    };
  }

  // ==========================================
  // TRAFFIC LIGHT HEALTH INDICATOR
  // Green = Healthy uptrend, Yellow = Caution, Red = Danger
  // Based on price movement relative to VQ
  // ==========================================

  calculateHealthIndicator(priceData: PriceData[], vqData: { vq: number; vqPercent: number }): {
    zone: 'green' | 'yellow' | 'red';
    status: 'Healthy' | 'Caution' | 'Danger';
    description: string;
    recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';
    dropFromHigh: number;
    dropPercent: number;
    highWaterMark: number;
    currentPrice: number;
    vqMultiple: number;
  } {
    if (priceData.length < 20) {
      throw new Error('Need at least 20 data points for health indicator');
    }

    const currentPrice = priceData[priceData.length - 1].close;
    
    // Find the highest price in the lookback period (52 week high approximation)
    const lookbackPeriod = Math.min(priceData.length, 252); // ~1 year of trading days
    const recentData = priceData.slice(-lookbackPeriod);
    const highWaterMark = Math.max(...recentData.map(d => d.high));
    
    const dropFromHigh = highWaterMark - currentPrice;
    const dropPercent = (dropFromHigh / highWaterMark) * 100;
    
    // Calculate how many VQs the price has dropped
    const vqMultiple = dropFromHigh / vqData.vq;

    let zone: 'green' | 'yellow' | 'red';
    let status: 'Healthy' | 'Caution' | 'Danger';
    let description: string;
    let recommendation: 'BUY' | 'HOLD' | 'SELL' | 'AVOID';

    if (vqMultiple < 0.5) {
      // GREEN ZONE: Price is within 50% of VQ from high
      zone = 'green';
      status = 'Healthy';
      description = 'Asset is in a healthy uptrend. Price is near its highs and within normal volatility range.';
      recommendation = 'BUY';
    } else if (vqMultiple < 1.0) {
      // YELLOW ZONE: Price dropped 50-100% of VQ
      zone = 'yellow';
      status = 'Caution';
      description = 'Asset is showing weakness. Price has dropped significantly from highs but not yet triggered stop loss.';
      recommendation = 'HOLD';
    } else {
      // RED ZONE: Price dropped more than 100% of VQ
      zone = 'red';
      status = 'Danger';
      description = 'Asset is in danger zone. Price has dropped beyond normal volatility - consider selling or avoiding.';
      recommendation = vqMultiple > 1.5 ? 'SELL' : 'AVOID';
    }

    return {
      zone,
      status,
      description,
      recommendation,
      dropFromHigh: Math.round(dropFromHigh * 100) / 100,
      dropPercent: Math.round(dropPercent * 100) / 100,
      highWaterMark: Math.round(highWaterMark * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      vqMultiple: Math.round(vqMultiple * 100) / 100
    };
  }

  // ==========================================
  // POSITION SIZE CALCULATOR
  // Calculates optimal position size based on risk tolerance and VQ
  // ==========================================

  calculatePositionSize(
    accountSize: number,
    riskPercent: number,
    entryPrice: number,
    stopLossPrice: number
  ): {
    shares: number;
    positionValue: number;
    riskAmount: number;
    riskPerShare: number;
    percentOfAccount: number;
    maxLoss: number;
  } {
    const riskAmount = accountSize * (riskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLossPrice);
    
    if (riskPerShare === 0) {
      throw new Error('Stop loss cannot equal entry price');
    }

    const shares = Math.floor(riskAmount / riskPerShare);
    const positionValue = shares * entryPrice;
    const percentOfAccount = (positionValue / accountSize) * 100;
    const maxLoss = shares * riskPerShare;

    return {
      shares,
      positionValue: Math.round(positionValue * 100) / 100,
      riskAmount: Math.round(riskAmount * 100) / 100,
      riskPerShare: Math.round(riskPerShare * 100) / 100,
      percentOfAccount: Math.round(percentOfAccount * 100) / 100,
      maxLoss: Math.round(maxLoss * 100) / 100
    };
  }

  // ==========================================
  // COMPLETE STOCK STATE INDICATOR (SSI)
  // Combines VQ, Health, and Trading Signal into one analysis
  // ==========================================

  async getStockStateIndicator(symbol: string, assetType?: 'stock' | 'crypto' | 'forex'): Promise<{
    symbol: string;
    assetType: 'stock' | 'crypto' | 'forex';
    currentPrice: number;
    vq: {
      value: number;
      percent: number;
      atr: number;
      volatilityLevel: string;
      stopLossPrice: number;
    };
    health: {
      zone: 'green' | 'yellow' | 'red';
      status: string;
      description: string;
      recommendation: string;
      dropPercent: number;
      vqMultiple: number;
    };
    signal: {
      action: string;
      confidence: number;
      entryPrice: number;
      stopLoss: number;
      takeProfit1: number;
      reasoning: string;
    };
    lastUpdated: string;
  }> {
    const type = assetType || this.detectAssetType(symbol);
    
    // Fetch price data
    const priceData = await this.fetchAssetData(symbol, type);
    
    if (priceData.length < 20) {
      throw new Error('Insufficient data for SSI analysis');
    }

    const currentPrice = priceData[priceData.length - 1].close;

    // Calculate VQ
    const vqData = this.calculateVolatilityQuotient(priceData);
    
    // Calculate Health Indicator
    const healthData = this.calculateHealthIndicator(priceData, vqData);
    
    // Generate Trading Signal
    const forecast = await this.generateStatisticalForecast(priceData, 7, '1D', type);

    return {
      symbol: symbol.toUpperCase(),
      assetType: type,
      currentPrice: Math.round(currentPrice * 100) / 100,
      vq: {
        value: vqData.vq,
        percent: vqData.vqPercent,
        atr: vqData.atr,
        volatilityLevel: vqData.volatilityLevel,
        stopLossPrice: vqData.stopLossPrice
      },
      health: {
        zone: healthData.zone,
        status: healthData.status,
        description: healthData.description,
        recommendation: healthData.recommendation,
        dropPercent: healthData.dropPercent,
        vqMultiple: healthData.vqMultiple
      },
      signal: {
        action: forecast.tradingSignal.action,
        confidence: forecast.tradingSignal.confidence,
        entryPrice: forecast.tradingSignal.entryPrice,
        stopLoss: forecast.tradingSignal.stopLoss,
        takeProfit1: forecast.tradingSignal.takeProfit1,
        reasoning: forecast.tradingSignal.reasoning
      },
      lastUpdated: new Date().toISOString()
    };
  }

  // Multi-timeframe analysis - analyze across all timeframes
  async runMultiTimeframeAnalysis(symbol: string, assetType?: 'stock' | 'crypto' | 'forex'): Promise<{
    symbol: string;
    assetType: string;
    currentPrice: number;
    timeframes: Array<{
      timeframe: string;
      label: string;
      trend: 'bullish' | 'bearish' | 'neutral';
      confidence: number;
      change: number;
      changePercent: number;
      dataPoints: number;
      hasValidData: boolean;
    }>;
    overallTrend: 'bullish' | 'bearish' | 'neutral';
    overallConfidence: number;
    lastUpdated: string;
  }> {
    const detectedType = assetType || this.detectAssetType(symbol);
    
    // Get current price first using live price endpoint
    let currentPrice = 0;
    try {
      const liveData = await this.fetchLivePrice(symbol, detectedType);
      currentPrice = liveData.price;
    } catch (e) {
      console.log('Could not fetch live price, will use first valid timeframe');
    }
    
    const allTimeframes = [
      { id: '1Y', label: '1 Year', weight: 1.0 },
      { id: '1Mo', label: '1 Month', weight: 0.9 },
      { id: '1W', label: '1 Week', weight: 0.8 },
      { id: '1D', label: '1 Day', weight: 0.7 },
      { id: '4H', label: '4 Hour', weight: 0.6 },
      { id: '1H', label: '1 Hour', weight: 0.5 },
      { id: '30M', label: '30 Min', weight: 0.4 },
      { id: '15M', label: '15 Min', weight: 0.3 },
      { id: '5M', label: '5 Min', weight: 0.2 },
      { id: '1M', label: '1 Min', weight: 0.15 },
      { id: '30S', label: '30 Sec', weight: 0.1 }
    ];

    const timeframeResults: Array<{
      timeframe: string;
      label: string;
      trend: 'bullish' | 'bearish' | 'neutral';
      confidence: number;
      change: number;
      changePercent: number;
      dataPoints: number;
      hasValidData: boolean;
    }> = [];

    // Analyze each timeframe
    for (const tf of allTimeframes) {
      try {
        const priceData = await this.fetchAssetDataWithTimeframe(symbol, tf.id, detectedType);
        
        if (priceData.length < 2) {
          timeframeResults.push({
            timeframe: tf.id,
            label: tf.label,
            trend: 'neutral',
            confidence: 0,
            change: 0,
            changePercent: 0,
            dataPoints: priceData.length,
            hasValidData: false
          });
          continue;
        }

        const latest = priceData[priceData.length - 1];
        const first = priceData[0];
        
        // Only update currentPrice if we haven't set it yet
        if (currentPrice === 0) {
          currentPrice = latest.close;
        }
        
        const change = latest.close - first.close;
        const changePercent = ((latest.close - first.close) / first.close) * 100;
        
        // Calculate trend based on price action and momentum
        const closes = priceData.map(d => d.close);
        const sma5 = closes.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, closes.length);
        const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, closes.length);
        
        // RSI calculation for confidence
        let gains = 0, losses = 0;
        for (let i = 1; i < Math.min(15, closes.length); i++) {
          const diff = closes[i] - closes[i - 1];
          if (diff > 0) gains += diff;
          else losses -= diff;
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        // Determine trend
        let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (sma5 > sma20 && changePercent > 0.5) trend = 'bullish';
        else if (sma5 < sma20 && changePercent < -0.5) trend = 'bearish';
        
        // Calculate confidence based on strength of signal
        const trendStrength = Math.abs(changePercent);
        const rsiConfidence = trend === 'bullish' ? Math.min(rsi / 100, 1) : Math.min((100 - rsi) / 100, 1);
        const confidence = Math.min(95, Math.max(30, (trendStrength * 5 + rsiConfidence * 50 + 20)));
        
        timeframeResults.push({
          timeframe: tf.id,
          label: tf.label,
          trend,
          confidence: Math.round(confidence),
          change: Math.round(change * 10000) / 10000,
          changePercent: Math.round(changePercent * 100) / 100,
          dataPoints: priceData.length,
          hasValidData: true
        });
        
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        console.error(`Failed to analyze ${tf.id} for ${symbol}:`, error);
        timeframeResults.push({
          timeframe: tf.id,
          label: tf.label,
          trend: 'neutral',
          confidence: 0,
          change: 0,
          changePercent: 0,
          dataPoints: 0,
          hasValidData: false
        });
      }
    }

    // Calculate overall trend (weighted average) - ONLY using valid timeframes
    // Create weight lookup map for safe weight retrieval by timeframe ID
    const weightMap = new Map(allTimeframes.map(tf => [tf.id, tf.weight]));
    let bullishScore = 0, bearishScore = 0, totalWeight = 0;
    for (const result of timeframeResults) {
      // Skip timeframes without valid data
      if (!result.hasValidData) continue;
      
      // Look up weight by timeframe ID, not array index
      const weight = weightMap.get(result.timeframe) || 0.5;
      if (result.trend === 'bullish') bullishScore += weight * result.confidence;
      else if (result.trend === 'bearish') bearishScore += weight * result.confidence;
      totalWeight += weight;
    }
    
    // Avoid division by zero if no valid timeframes
    const overallTrend = totalWeight === 0 ? 'neutral' :
                         bullishScore > bearishScore + 10 ? 'bullish' : 
                         bearishScore > bullishScore + 10 ? 'bearish' : 'neutral';
    const overallConfidence = totalWeight === 0 ? 0 : Math.round(Math.max(bullishScore, bearishScore) / totalWeight);

    return {
      symbol: symbol.toUpperCase(),
      assetType: detectedType,
      currentPrice,
      timeframes: timeframeResults,
      overallTrend,
      overallConfidence,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const timeSeriesService = new TimeSeriesService();
