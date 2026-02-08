import { Router } from 'express';
import { universalForecaster } from './universal-forecaster';
import { marketDataHub } from './websocket-market-hub';

const router = Router();

router.get('/forecast/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '1h';
    
    const assetType = marketDataHub.detectAssetType(symbol);
    const candles = await marketDataHub.getCandles(symbol, interval, assetType);
    
    if (!candles || candles.length < 20) {
      return res.status(404).json({ 
        success: false, 
        error: `Insufficient data for ${symbol}. Need at least 20 candles.` 
      });
    }
    
    const quote = await marketDataHub.getLiveQuote(symbol);
    const currentPrice = quote?.price;
    
    const forecast = await universalForecaster.generateForecast(symbol, candles, currentPrice);
    
    res.json({ success: true, data: forecast });
  } catch (error: any) {
    console.error('Forecast error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/accuracy', async (req, res) => {
  try {
    const metrics = await universalForecaster.getAccuracyMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const alerts = await universalForecaster.getRecentAlerts(limit);
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide an array of symbols to scan' 
      });
    }
    
    if (symbols.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 50 symbols per scan' 
      });
    }
    
    const candlesFetcher = async (symbol: string) => {
      const assetType = marketDataHub.detectAssetType(symbol);
      return await marketDataHub.getCandles(symbol, '1h', assetType);
    };
    
    const forecasts = await universalForecaster.scanMultipleAssets(symbols, candlesFetcher);
    
    const executeSignals = forecasts.filter(f => f.setupStatus === 'EXECUTE');
    const waitSignals = forecasts.filter(f => f.setupStatus === 'WAIT');
    
    res.json({ 
      success: true, 
      data: {
        total: forecasts.length,
        executeCount: executeSignals.length,
        waitCount: waitSignals.length,
        forecasts,
        executeSignals,
        waitSignals
      }
    });
  } catch (error: any) {
    console.error('Scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scan/market', async (req, res) => {
  try {
    const { assetClass } = req.body;
    
    const symbolsByClass: Record<string, string[]> = {
      stock: ['SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'JPM', 'V', 'UNH', 'HD', 'PG'],
      crypto: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'LINK', 'DOT', 'MATIC', 'UNI', 'ATOM', 'LTC', 'ARB', 'OP'],
      forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'],
      futures: ['ES=F', 'NQ=F', 'GC=F', 'SI=F', 'CL=F', 'NG=F']
    };
    
    const symbols = assetClass && symbolsByClass[assetClass] 
      ? symbolsByClass[assetClass]
      : [...symbolsByClass.stock.slice(0, 10), ...symbolsByClass.crypto.slice(0, 8)];
    
    const candlesFetcher = async (symbol: string) => {
      const type = marketDataHub.detectAssetType(symbol);
      return await marketDataHub.getCandles(symbol, '1h', type);
    };
    
    const forecasts = await universalForecaster.scanMultipleAssets(symbols, candlesFetcher);
    
    const topSignals = forecasts
      .filter(f => f.setupStatus === 'EXECUTE' && f.confidence >= 70 && f.riskRewardRatio >= 1.5)
      .slice(0, 10);
    
    res.json({ 
      success: true, 
      data: {
        scannedCount: symbols.length,
        totalForecasts: forecasts.length,
        topSignals,
        allForecasts: forecasts,
        assetClass: assetClass || 'mixed'
      }
    });
  } catch (error: any) {
    console.error('Market scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/multi-asset', async (req, res) => {
  try {
    const topAssets = [
      'AAPL', 'NVDA', 'TSLA', 'META', 'SPY', 'QQQ',
      'BTC', 'ETH', 'SOL'
    ];
    
    const candlesFetcher = async (symbol: string) => {
      const type = marketDataHub.detectAssetType(symbol);
      return await marketDataHub.getCandles(symbol, '1d', type);
    };
    
    const forecasts = await universalForecaster.scanMultipleAssets(topAssets, candlesFetcher);
    
    if (!forecasts || forecasts.length === 0) {
      return res.status(503).json({ 
        error: 'Market data temporarily unavailable',
        forecasts: [] 
      });
    }
    
    const formattedForecasts = forecasts.map(f => ({
      symbol: f.symbol,
      currentPrice: f.currentPrice,
      direction: f.direction,
      confidence: f.confidence,
      targets: f.targets?.map((t: any, i: number) => ({
        price: t,
        probability: Math.max(80 - (i * 15), 35)
      })) || [],
      stopLoss: f.stopLoss,
      timeframe: f.timeframe || '1-4 weeks',
      reasoning: f.reasoning || 'AI-powered analysis based on technical indicators and market conditions.'
    }));
    
    res.json({ forecasts: formattedForecasts });
  } catch (error: any) {
    console.error('Multi-asset forecast error:', error);
    res.status(503).json({ 
      error: 'Real-time data unavailable. Please try again.',
      forecasts: [] 
    });
  }
});

export default router;
