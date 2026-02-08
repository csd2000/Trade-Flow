/**
 * Stock Data Service
 * Fetches real-time stock data from Yahoo Finance (primary) and Alpha Vantage (fallback)
 * Uses intelligent caching for performance
 */

import * as AlphaVantage from './alpha-vantage.service.js';

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface HistoricalBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CachedQuote {
  data: StockQuote;
  timestamp: number;
}

interface CachedHistory {
  data: HistoricalBar[];
  timestamp: number;
}

const quoteCache = new Map<string, CachedQuote>();
const historyCache = new Map<string, CachedHistory>();
const QUOTE_CACHE_TTL = 10 * 1000; // 10 seconds for real-time feel
const HISTORY_CACHE_TTL = 60 * 1000; // 1 minute for historical data

/**
 * Fetch quote from Yahoo Finance (primary source)
 */
async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    const timestamps = result?.timestamp;
    
    if (!meta || !quote || !timestamps || timestamps.length === 0) {
      return null;
    }
    
    const lastIdx = timestamps.length - 1;
    const price = quote.close[lastIdx] || meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose || price;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol} Inc.`,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(4)),
      volume: quote.volume[lastIdx] || meta.regularMarketVolume || 0,
      high: Math.max(...quote.high.filter((h: any) => h !== null)) || meta.regularMarketDayHigh,
      low: Math.min(...quote.low.filter((l: any) => l !== null && l > 0)) || meta.regularMarketDayLow,
      open: quote.open[0] || meta.regularMarketOpen,
      previousClose: Number(previousClose.toFixed(2)),
    };
  } catch (error) {
    console.error(`Yahoo quote error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch historical data from Yahoo Finance
 */
async function fetchYahooHistory(symbol: string, days: number = 100): Promise<HistoricalBar[] | null> {
  try {
    const range = days <= 30 ? '1mo' : days <= 90 ? '3mo' : days <= 180 ? '6mo' : '1y';
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    const timestamps = result?.timestamp;
    const quote = result?.indicators?.quote?.[0];
    
    if (!timestamps || !quote) return null;
    
    const bars: HistoricalBar[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open[i] !== null && quote.close[i] !== null) {
        bars.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: Number(quote.open[i].toFixed(2)),
          high: Number(quote.high[i].toFixed(2)),
          low: Number(quote.low[i].toFixed(2)),
          close: Number(quote.close[i].toFixed(2)),
          volume: quote.volume[i] || 0
        });
      }
    }
    
    return bars;
  } catch (error) {
    console.error(`Yahoo history error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get real-time stock quote - Yahoo Finance primary, Alpha Vantage fallback
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < QUOTE_CACHE_TTL) {
    return cached.data;
  }

  // Try Yahoo Finance first (no rate limits)
  let quote = await fetchYahooQuote(symbol);
  
  if (quote) {
    quoteCache.set(symbol, { data: quote, timestamp: Date.now() });
    return quote;
  }
  
  // Fallback to Alpha Vantage
  try {
    const avQuote = await AlphaVantage.getStockQuote(symbol);
    quoteCache.set(symbol, { data: avQuote, timestamp: Date.now() });
    return avQuote;
  } catch (error) {
    console.error(`All APIs failed for ${symbol} - no real-time data available`);
    throw new Error(`Real-time data unavailable for ${symbol}`);
  }
}

/**
 * Get historical price data - Yahoo Finance primary, Alpha Vantage fallback
 */
export async function getHistoricalData(symbol: string, days: number = 100): Promise<HistoricalBar[]> {
  const cacheKey = `${symbol}_${days}`;
  const cached = historyCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < HISTORY_CACHE_TTL) {
    return cached.data;
  }

  // Try Yahoo Finance first
  let history = await fetchYahooHistory(symbol, days);
  
  if (history && history.length > 10) {
    historyCache.set(cacheKey, { data: history, timestamp: Date.now() });
    return history;
  }
  
  // Fallback to Alpha Vantage
  try {
    history = await AlphaVantage.getHistoricalData(symbol, days);
    if (history && history.length > 0) {
      historyCache.set(cacheKey, { data: history, timestamp: Date.now() });
      return history;
    }
  } catch (error) {
    console.error(`Alpha Vantage failed for ${symbol} historical - no data available`);
  }
  
  // No mock data - throw error to surface data unavailability
  throw new Error(`Historical data unavailable for ${symbol}`);
}


/**
 * Get list of popular stocks to scan
 */
export function getPopularStocks(): string[] {
  return [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AMD', 'INTC', 'NFLX',
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW', 'AXP', 'V',
    'JNJ', 'UNH', 'PFE', 'ABBV', 'TMO', 'MRK', 'ABT', 'LLY', 'DHR', 'BMY',
    'WMT', 'HD', 'PG', 'KO', 'PEP', 'COST', 'NKE', 'MCD', 'SBUX', 'DIS',
    'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'VLO', 'PSX', 'OXY',
    'BA', 'CAT', 'HON', 'UNP', 'UPS', 'RTX', 'LMT', 'GE', 'MMM', 'DE',
    'TGT', 'LOW', 'TJX', 'EBAY', 'BABA', 'JD', 'SHOP', 'ETSY', 'W', 'CHWY',
    'AVGO', 'QCOM', 'TXN', 'AMAT', 'LRCX', 'ADI', 'MCHP', 'KLAC', 'NXPI', 'MU',
    'T', 'VZ', 'TMUS', 'CMCSA', 'CHTR', 'SPOT', 'PARA', 'WBD',
    'GILD', 'AMGN', 'BIIB', 'REGN', 'VRTX', 'ILMN', 'MRNA', 'BNTX',
  ];
}

/**
 * Get extended list of ETFs and additional stocks
 */
export function getAllScanStocks(): string[] {
  const popular = getPopularStocks();
  const etfs = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'ARKK', 'XLF', 'XLE', 'XLK'];
  return [...popular, ...etfs];
}
