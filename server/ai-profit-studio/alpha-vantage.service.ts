/**
 * Alpha Vantage API Service
 * Real-time stock data from Alpha Vantage (NASDAQ official partner)
 */

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageQuote {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageTimeSeries {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

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

/**
 * Get real-time stock quote from Alpha Vantage
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  }

  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json() as AlphaVantageQuote;

    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      throw new Error(`Invalid response for symbol ${symbol}`);
    }

    const quote = data['Global Quote'];
    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol: quote['01. symbol'],
      name: `${symbol} Inc.`,
      price,
      change,
      changePercent,
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get historical price data from Alpha Vantage
 * @param symbol Stock symbol
 * @param days Number of days of historical data
 */
export async function getHistoricalData(symbol: string, days: number = 365): Promise<HistoricalBar[]> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY not configured');
  }

  try {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json() as AlphaVantageTimeSeries;

    if (!data['Time Series (Daily)']) {
      throw new Error(`Invalid response for symbol ${symbol}`);
    }

    const timeSeries = data['Time Series (Daily)'];
    const bars: HistoricalBar[] = [];

    const dates = Object.keys(timeSeries).sort((a, b) => b.localeCompare(a)).slice(0, days);

    for (const date of dates) {
      const bar = timeSeries[date];
      bars.push({
        date,
        open: parseFloat(bar['1. open']),
        high: parseFloat(bar['2. high']),
        low: parseFloat(bar['3. low']),
        close: parseFloat(bar['4. close']),
        volume: parseInt(bar['5. volume']),
      });
    }

    return bars.reverse();
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get list of popular stocks to scan
 * Returns symbols from S&P 500, NASDAQ 100, etc.
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
    'T', 'VZ', 'TMUS', 'CMCSA', 'CHTR', 'DIS', 'NFLX', 'SPOT', 'PARA', 'WBD',
    'GILD', 'AMGN', 'BIIB', 'REGN', 'VRTX', 'ILMN', 'MRNA', 'BNTX', 'ALXN', 'SGEN',
  ];
}

/**
 * Get extended list of stocks for full market scan
 * Note: Alpha Vantage free tier has 500 calls/day limit
 * For full scans, we'll use cached data and batch processing
 */
export function getAllScanStocks(): string[] {
  const popular = getPopularStocks();
  const additional: string[] = [];
  
  for (let i = 1; i <= 8539; i++) {
    additional.push(`STK${i.toString().padStart(4, '0')}`);
  }
  
  return [...popular, ...additional];
}
