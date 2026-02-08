import { Router } from 'express';

const router = Router();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High
  l: number;  // Low
  o: number;  // Open
  pc: number; // Previous close
  t: number;  // Timestamp
}

interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  v: number[];  // Volume
  t: number[];  // Timestamps
  s: string;    // Status
}

interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

async function fetchFinnhub<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!FINNHUB_API_KEY) {
    console.warn('Finnhub API key not configured');
    return null;
  }

  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
  url.searchParams.set('token', FINNHUB_API_KEY);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Finnhub fetch error:', error);
    return null;
  }
}

export async function getFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
  return fetchFinnhub<FinnhubQuote>('/quote', { symbol: symbol.toUpperCase() });
}

export async function getFinnhubCandles(
  symbol: string, 
  resolution: string = 'D', 
  from?: number, 
  to?: number
): Promise<FinnhubCandle | null> {
  const now = Math.floor(Date.now() / 1000);
  const defaultFrom = now - 30 * 24 * 60 * 60; // 30 days ago
  
  return fetchFinnhub<FinnhubCandle>('/stock/candle', {
    symbol: symbol.toUpperCase(),
    resolution,
    from: String(from || defaultFrom),
    to: String(to || now)
  });
}

export async function getFinnhubCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {
  return fetchFinnhub<FinnhubCompanyProfile>('/stock/profile2', { symbol: symbol.toUpperCase() });
}

export async function getFinnhubNews(symbol?: string): Promise<FinnhubNews[] | null> {
  if (symbol) {
    const now = new Date();
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return fetchFinnhub<FinnhubNews[]>('/company-news', {
      symbol: symbol.toUpperCase(),
      from: from.toISOString().split('T')[0],
      to: now.toISOString().split('T')[0]
    });
  }
  return fetchFinnhub<FinnhubNews[]>('/news', { category: 'general' });
}

export async function getFinnhubBasicFinancials(symbol: string): Promise<any | null> {
  return fetchFinnhub('/stock/metric', { 
    symbol: symbol.toUpperCase(), 
    metric: 'all' 
  });
}

export async function getFinnhubRecommendations(symbol: string): Promise<any[] | null> {
  return fetchFinnhub('/stock/recommendation', { symbol: symbol.toUpperCase() });
}

export async function getFinnhubEarnings(symbol: string): Promise<any[] | null> {
  return fetchFinnhub('/stock/earnings', { symbol: symbol.toUpperCase() });
}

export async function getFinnhubPeers(symbol: string): Promise<string[] | null> {
  return fetchFinnhub('/stock/peers', { symbol: symbol.toUpperCase() });
}

export async function getFinnhubMarketStatus(): Promise<any | null> {
  return fetchFinnhub('/stock/market-status', { exchange: 'US' });
}

// Unified fallback function that tries Finnhub when primary source fails
export async function getStockDataWithFallback(
  symbol: string,
  primaryFetcher: () => Promise<any>,
  dataType: 'quote' | 'candles' | 'profile' | 'news' = 'quote'
): Promise<any> {
  try {
    const primaryData = await primaryFetcher();
    if (primaryData && Object.keys(primaryData).length > 0) {
      return { data: primaryData, source: 'primary' };
    }
  } catch (error) {
    console.log(`Primary data source failed for ${symbol}, trying Finnhub fallback...`);
  }

  // Try Finnhub as fallback
  let finnhubData: any = null;
  switch (dataType) {
    case 'quote':
      finnhubData = await getFinnhubQuote(symbol);
      if (finnhubData) {
        return {
          data: {
            symbol,
            price: finnhubData.c,
            change: finnhubData.d,
            changePercent: finnhubData.dp,
            high: finnhubData.h,
            low: finnhubData.l,
            open: finnhubData.o,
            previousClose: finnhubData.pc,
            timestamp: finnhubData.t * 1000
          },
          source: 'finnhub'
        };
      }
      break;
    case 'candles':
      finnhubData = await getFinnhubCandles(symbol);
      if (finnhubData && finnhubData.s === 'ok') {
        const candles = finnhubData.t.map((t: number, i: number) => ({
          timestamp: t * 1000,
          open: finnhubData.o[i],
          high: finnhubData.h[i],
          low: finnhubData.l[i],
          close: finnhubData.c[i],
          volume: finnhubData.v[i]
        }));
        return { data: candles, source: 'finnhub' };
      }
      break;
    case 'profile':
      finnhubData = await getFinnhubCompanyProfile(symbol);
      if (finnhubData) {
        return { data: finnhubData, source: 'finnhub' };
      }
      break;
    case 'news':
      finnhubData = await getFinnhubNews(symbol);
      if (finnhubData && finnhubData.length > 0) {
        return { data: finnhubData, source: 'finnhub' };
      }
      break;
  }

  return { data: null, source: 'none', error: 'No data available from any source' };
}

// API Routes
router.get('/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const quote = await getFinnhubQuote(symbol);
  if (quote) {
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp,
        high: quote.h,
        low: quote.l,
        open: quote.o,
        previousClose: quote.pc,
        timestamp: quote.t * 1000
      },
      source: 'finnhub'
    });
  } else {
    res.status(404).json({ success: false, error: 'Quote not available' });
  }
});

router.get('/candles/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { resolution = 'D', from, to } = req.query;
  
  const candles = await getFinnhubCandles(
    symbol,
    resolution as string,
    from ? Number(from) : undefined,
    to ? Number(to) : undefined
  );
  
  if (candles && candles.s === 'ok') {
    const formatted = candles.t.map((t, i) => ({
      timestamp: t * 1000,
      open: candles.o[i],
      high: candles.h[i],
      low: candles.l[i],
      close: candles.c[i],
      volume: candles.v[i]
    }));
    res.json({ success: true, data: formatted, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Candles not available' });
  }
});

router.get('/profile/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const profile = await getFinnhubCompanyProfile(symbol);
  if (profile && profile.name) {
    res.json({ success: true, data: profile, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Profile not available' });
  }
});

router.get('/news', async (req, res) => {
  const { symbol } = req.query;
  const news = await getFinnhubNews(symbol as string | undefined);
  if (news && news.length > 0) {
    res.json({ success: true, data: news, source: 'finnhub' });
  } else {
    res.json({ success: true, data: [], source: 'finnhub' });
  }
});

router.get('/financials/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const financials = await getFinnhubBasicFinancials(symbol);
  if (financials) {
    res.json({ success: true, data: financials, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Financials not available' });
  }
});

router.get('/recommendations/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const recommendations = await getFinnhubRecommendations(symbol);
  if (recommendations) {
    res.json({ success: true, data: recommendations, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Recommendations not available' });
  }
});

router.get('/earnings/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const earnings = await getFinnhubEarnings(symbol);
  if (earnings) {
    res.json({ success: true, data: earnings, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Earnings not available' });
  }
});

router.get('/peers/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const peers = await getFinnhubPeers(symbol);
  if (peers) {
    res.json({ success: true, data: peers, source: 'finnhub' });
  } else {
    res.status(404).json({ success: false, error: 'Peers not available' });
  }
});

router.get('/market-status', async (req, res) => {
  const status = await getFinnhubMarketStatus();
  if (status) {
    res.json({ success: true, data: status, source: 'finnhub' });
  } else {
    res.status(500).json({ success: false, error: 'Market status not available' });
  }
});

router.get('/health', (req, res) => {
  res.json({
    service: 'Finnhub Fallback API',
    status: FINNHUB_API_KEY ? 'configured' : 'not_configured',
    endpoints: [
      '/quote/:symbol',
      '/candles/:symbol',
      '/profile/:symbol',
      '/news',
      '/financials/:symbol',
      '/recommendations/:symbol',
      '/earnings/:symbol',
      '/peers/:symbol',
      '/market-status'
    ]
  });
});

export default router;
