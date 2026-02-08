import { Router } from 'express';
import { marketDataHub } from './websocket-market-hub';
import { macroPolicyService } from './macro-policy-service';

const router = Router();

const quoteCache = new Map<string, { data: any; timestamp: number }>();
const candleCache = new Map<string, { data: any; timestamp: number }>();
const QUOTE_TTL = 1000;
const CANDLE_TTL = 3000;

function getCached(cache: Map<string, any>, key: string, ttl: number): any | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < ttl) {
    return entry.data;
  }
  return null;
}

router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = symbol.toUpperCase();
    
    const cached = getCached(quoteCache, cacheKey, QUOTE_TTL);
    if (cached) {
      return res.json({
        success: true,
        data: { ...cached, fromCache: true, age: `${Math.round((Date.now() - cached.fetchedAt) / 1000)}s ago` }
      });
    }

    const quote = await marketDataHub.getLiveQuote(symbol);
    
    if (!quote) {
      return res.status(404).json({ success: false, error: `No data for ${symbol}` });
    }

    const result = {
      symbol: quote.symbol,
      price: quote.price,
      timestamp: quote.timestamp,
      timestampISO: new Date(quote.timestamp).toISOString(),
      source: quote.source,
      isLive: true,
      fetchedAt: Date.now(),
      age: '0s ago'
    };

    quoteCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '5m';
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);
    
    const assetType = marketDataHub.detectAssetType(symbol);
    const cacheKey = `${symbol.toUpperCase()}_${interval}_${assetType}`;
    
    const cached = getCached(candleCache, cacheKey, CANDLE_TTL);
    if (cached) {
      return res.json({
        success: true,
        data: { ...cached, fromCache: true }
      });
    }

    const candles = await marketDataHub.getCandles(symbol, interval, assetType);
    
    if (!candles || candles.length === 0) {
      return res.status(404).json({ success: false, error: `No candles for ${symbol}` });
    }

    const latestCandle = candles[candles.length - 1];
    
    const result = {
      symbol: symbol.toUpperCase(),
      interval,
      assetType,
      candles: candles.slice(-limit),
      count: Math.min(candles.length, limit),
      latestTime: new Date(latestCandle.time).toISOString(),
      latestClose: latestCandle.close,
      isLive: assetType === 'crypto',
      supportedIntervals: assetType === 'crypto' 
        ? ['1m', '5m', '15m', '1h', '4h', '1d'] 
        : ['5m', '15m', '1h', '1d']
    };

    candleCache.set(cacheKey, { data: result, timestamp: Date.now() });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/forecast/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '5m';
    
    const assetType = marketDataHub.detectAssetType(symbol);
    const quoteCacheKey = symbol.toUpperCase();
    const candleCacheKey = `${symbol.toUpperCase()}_${interval}_${assetType}`;

    let quote = getCached(quoteCache, quoteCacheKey, QUOTE_TTL);
    let candlesData = getCached(candleCache, candleCacheKey, CANDLE_TTL);

    const promises: Promise<any>[] = [];
    
    if (!quote) {
      promises.push(marketDataHub.getLiveQuote(symbol).then(q => {
        if (q) {
          quote = {
            symbol: q.symbol,
            price: q.price,
            timestamp: q.timestamp,
            source: q.source,
            fetchedAt: Date.now()
          };
          quoteCache.set(quoteCacheKey, { data: quote, timestamp: Date.now() });
        }
        return q;
      }));
    }
    
    if (!candlesData) {
      promises.push(marketDataHub.getCandles(symbol, interval, assetType).then(c => {
        if (c && c.length > 0) {
          candlesData = { candles: c };
          candleCache.set(candleCacheKey, { data: candlesData, timestamp: Date.now() });
        }
        return c;
      }));
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    if (!quote || !candlesData?.candles || candlesData.candles.length === 0) {
      return res.status(404).json({ success: false, error: `Insufficient data for ${symbol}` });
    }

    const forecast = await marketDataHub.generateAIForecast(symbol, candlesData.candles, quote.price);

    res.json({ success: true, data: forecast });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/supported-intervals/:symbol', (req, res) => {
  const { symbol } = req.params;
  const assetType = marketDataHub.detectAssetType(symbol);
  
  const intervals = assetType === 'crypto' 
    ? ['1m', '5m', '15m', '1h', '4h', '1d']
    : ['5m', '15m', '1h', '1d'];
  
  res.json({ success: true, data: { symbol, assetType, intervals } });
});

router.get('/macro', async (req, res) => {
  try {
    const snapshot = await macroPolicyService.getMacroSnapshot();
    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
