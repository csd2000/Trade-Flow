import { Request, Response, Router } from 'express';

const router = Router();

interface AssetSearchResult {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf' | 'futures';
  price?: number;
  changePercent?: number;
}

const knownAssets: AssetSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', type: 'stock' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' },
  { symbol: 'DIS', name: 'Walt Disney Co.', type: 'stock' },
  { symbol: 'BA', name: 'Boeing Co.', type: 'stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', type: 'stock' },
  { symbol: 'HD', name: 'Home Depot Inc.', type: 'stock' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', type: 'stock' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', type: 'stock' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', type: 'stock' },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc.', type: 'stock' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', type: 'stock' },
  { symbol: 'SQ', name: 'Block Inc.', type: 'stock' },
  { symbol: 'SHOP', name: 'Shopify Inc.', type: 'stock' },
  { symbol: 'SPOT', name: 'Spotify Technology S.A.', type: 'stock' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', type: 'etf' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF', type: 'etf' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', type: 'etf' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', type: 'etf' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', type: 'etf' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'etf' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf' },
  { symbol: 'UUP', name: 'Invesco DB US Dollar Index Bullish Fund', type: 'etf' },
  { symbol: 'VIX', name: 'CBOE Volatility Index', type: 'etf' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto' },
  { symbol: 'BNB', name: 'Binance Coin', type: 'crypto' },
  { symbol: 'XRP', name: 'Ripple', type: 'crypto' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto' },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'crypto' },
  { symbol: 'AVAX', name: 'Avalanche', type: 'crypto' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto' },
  { symbol: 'MATIC', name: 'Polygon', type: 'crypto' },
  { symbol: 'GC=F', name: 'Gold Futures', type: 'futures' },
  { symbol: 'SI=F', name: 'Silver Futures', type: 'futures' },
  { symbol: 'CL=F', name: 'Crude Oil Futures', type: 'futures' },
  { symbol: 'NG=F', name: 'Natural Gas Futures', type: 'futures' },
  { symbol: 'ES=F', name: 'E-mini S&P 500 Futures', type: 'futures' },
  { symbol: 'NQ=F', name: 'E-mini Nasdaq 100 Futures', type: 'futures' },
  { symbol: 'YM=F', name: 'E-mini Dow Futures', type: 'futures' },
  { symbol: 'RTY=F', name: 'E-mini Russell 2000 Futures', type: 'futures' },
  { symbol: 'ZB=F', name: 'U.S. Treasury Bond Futures', type: 'futures' },
  { symbol: 'ZN=F', name: '10-Year T-Note Futures', type: 'futures' },
];

async function fetchYahooQuote(symbol: string): Promise<{ price: number; changePercent: number } | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta?.regularMarketPrice || 0;
    const previousClose = meta?.previousClose || meta?.chartPreviousClose || price;
    const changePercent = previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;

    return { price, changePercent };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

router.get('/assets', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    
    if (!query) {
      return res.json(knownAssets.slice(0, 10));
    }

    const filtered = knownAssets.filter(asset => 
      asset.symbol.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query)
    );

    const results = filtered.slice(0, 10);

    const enrichedResults = await Promise.all(
      results.map(async (asset) => {
        let yahooSymbol = asset.symbol;
        if (asset.type === 'crypto') {
          yahooSymbol = `${asset.symbol}-USD`;
        }
        
        const quote = await fetchYahooQuote(yahooSymbol);
        return {
          ...asset,
          price: quote?.price,
          changePercent: quote?.changePercent
        };
      })
    );

    res.json(enrichedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.get('/assets/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    
    const asset = knownAssets.find(a => a.symbol === upperSymbol);
    
    let yahooSymbol = upperSymbol;
    if (asset?.type === 'crypto' || ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'MATIC'].includes(upperSymbol)) {
      yahooSymbol = `${upperSymbol}-USD`;
    }
    
    const quote = await fetchYahooQuote(yahooSymbol);
    
    if (!quote && !asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    res.json({
      symbol: upperSymbol,
      name: asset?.name || upperSymbol,
      type: asset?.type || 'stock',
      price: quote?.price,
      changePercent: quote?.changePercent
    });
  } catch (error) {
    console.error('Asset lookup error:', error);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

export default router;
