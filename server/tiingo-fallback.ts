import { Router } from 'express';

const router = Router();

const TIINGO_API_KEY = process.env.TIINGO_API_KEY;
const TIINGO_BASE_URL = 'https://api.tiingo.com';

interface TiingoQuote {
  ticker: string;
  timestamp: string;
  quoteTimestamp: string;
  lastSaleTimestamp: string;
  last: number;
  lastSize: number;
  tngoLast: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  mid: number;
  volume: number;
  bidSize: number;
  bidPrice: number;
  askSize: number;
  askPrice: number;
}

interface TiingoEOD {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjOpen: number;
  adjHigh: number;
  adjLow: number;
  adjClose: number;
  adjVolume: number;
  divCash: number;
  splitFactor: number;
}

interface TiingoMeta {
  ticker: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  exchangeCode: string;
}

interface TiingoCryptoQuote {
  ticker: string;
  baseCurrency: string;
  quoteCurrency: string;
  priceData: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    volumeNotional: number;
    tradesDone: number;
  }>;
}

async function fetchTiingo<T>(endpoint: string, headers: Record<string, string> = {}): Promise<T | null> {
  if (!TIINGO_API_KEY) {
    console.warn('Tiingo API key not configured');
    return null;
  }

  try {
    const response = await fetch(`${TIINGO_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${TIINGO_API_KEY}`,
        ...headers
      }
    });
    
    if (!response.ok) {
      console.error(`Tiingo API error: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Tiingo fetch error:', error);
    return null;
  }
}

export async function getTiingoIEXQuote(symbol: string): Promise<TiingoQuote[] | null> {
  return fetchTiingo<TiingoQuote[]>(`/iex/?tickers=${symbol.toLowerCase()}`);
}

export async function getTiingoEOD(symbol: string, startDate?: string, endDate?: string): Promise<TiingoEOD[] | null> {
  let endpoint = `/tiingo/daily/${symbol.toLowerCase()}/prices`;
  const params: string[] = [];
  
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  if (params.length > 0) endpoint += `?${params.join('&')}`;
  
  return fetchTiingo<TiingoEOD[]>(endpoint);
}

export async function getTiingoMeta(symbol: string): Promise<TiingoMeta | null> {
  return fetchTiingo<TiingoMeta>(`/tiingo/daily/${symbol.toLowerCase()}`);
}

export async function getTiingoCryptoQuote(symbol: string): Promise<TiingoCryptoQuote[] | null> {
  const ticker = symbol.toLowerCase().replace('/', '').replace('usdt', 'usd');
  return fetchTiingo<TiingoCryptoQuote[]>(`/tiingo/crypto/prices?tickers=${ticker}usd&resampleFreq=1day`);
}

export async function getTiingoNews(symbols?: string[], limit: number = 20): Promise<any[] | null> {
  // Add date filter for recent news only (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  
  let endpoint = `/tiingo/news?limit=${limit}&startDate=${startDate}`;
  if (symbols && symbols.length > 0) {
    endpoint += `&tickers=${symbols.join(',')}`;
  }
  
  const news = await fetchTiingo<any[]>(endpoint);
  
  // Additional filter to ensure no old news gets through
  if (news && Array.isArray(news)) {
    const sevenDaysAgoMs = sevenDaysAgo.getTime();
    return news.filter(item => {
      const publishedDate = item.publishedDate ? new Date(item.publishedDate).getTime() : Date.now();
      return publishedDate >= sevenDaysAgoMs;
    });
  }
  
  return news;
}

// Standardized quote format for fallback integration
export async function getStandardizedTiingoQuote(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  timestamp: string;
  source: string;
} | null> {
  // Try IEX real-time first
  const iexData = await getTiingoIEXQuote(symbol);
  if (iexData && iexData.length > 0) {
    const quote = iexData[0];
    const price = quote.last || quote.tngoLast;
    const change = price - quote.prevClose;
    const changePercent = quote.prevClose ? (change / quote.prevClose) * 100 : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      price,
      change,
      changePercent,
      high: quote.high || price,
      low: quote.low || price,
      open: quote.open || price,
      previousClose: quote.prevClose || price,
      volume: quote.volume || 0,
      timestamp: quote.timestamp || new Date().toISOString(),
      source: 'Tiingo-IEX'
    };
  }
  
  // Fallback to EOD data
  const eodData = await getTiingoEOD(symbol);
  if (eodData && eodData.length > 0) {
    const latest = eodData[eodData.length - 1];
    const prev = eodData.length > 1 ? eodData[eodData.length - 2] : latest;
    const change = latest.adjClose - prev.adjClose;
    const changePercent = prev.adjClose ? (change / prev.adjClose) * 100 : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      price: latest.adjClose,
      change,
      changePercent,
      high: latest.high,
      low: latest.low,
      open: latest.open,
      previousClose: prev.adjClose,
      volume: latest.volume,
      timestamp: latest.date,
      source: 'Tiingo-EOD'
    };
  }
  
  return null;
}

// API Routes
router.get('/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const quote = await getStandardizedTiingoQuote(symbol);
  
  if (quote) {
    res.json({ success: true, data: quote, source: 'tiingo' });
  } else {
    res.status(404).json({ success: false, error: 'Quote not available' });
  }
});

router.get('/iex/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const data = await getTiingoIEXQuote(symbol);
  
  if (data && data.length > 0) {
    res.json({ success: true, data: data[0], source: 'tiingo-iex' });
  } else {
    res.status(404).json({ success: false, error: 'IEX quote not available' });
  }
});

router.get('/eod/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { startDate, endDate } = req.query;
  
  const data = await getTiingoEOD(
    symbol,
    startDate as string | undefined,
    endDate as string | undefined
  );
  
  if (data && data.length > 0) {
    res.json({ success: true, data, source: 'tiingo-eod' });
  } else {
    res.status(404).json({ success: false, error: 'EOD data not available' });
  }
});

router.get('/meta/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const meta = await getTiingoMeta(symbol);
  
  if (meta) {
    res.json({ success: true, data: meta, source: 'tiingo' });
  } else {
    res.status(404).json({ success: false, error: 'Metadata not available' });
  }
});

router.get('/crypto/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const data = await getTiingoCryptoQuote(symbol);
  
  if (data && data.length > 0) {
    res.json({ success: true, data: data[0], source: 'tiingo-crypto' });
  } else {
    res.status(404).json({ success: false, error: 'Crypto data not available' });
  }
});

router.get('/news', async (req, res) => {
  const { symbols, limit } = req.query;
  const symbolList = symbols ? (symbols as string).split(',') : undefined;
  
  const news = await getTiingoNews(symbolList, Number(limit) || 20);
  
  if (news) {
    res.json({ success: true, data: news, source: 'tiingo' });
  } else {
    res.json({ success: true, data: [], source: 'tiingo' });
  }
});

router.get('/health', (req, res) => {
  res.json({
    service: 'Tiingo Fallback API',
    status: TIINGO_API_KEY ? 'configured' : 'not_configured',
    endpoints: [
      '/quote/:symbol (standardized)',
      '/iex/:symbol (real-time)',
      '/eod/:symbol (daily)',
      '/meta/:symbol',
      '/crypto/:symbol',
      '/news'
    ]
  });
});

export default router;
