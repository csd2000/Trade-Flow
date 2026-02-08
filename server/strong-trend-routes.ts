import { Router, Request, Response } from 'express';
import { analyzeStrongTrend, scanForStrongTrends, getStrongestTrends, type StrongTrendSignal } from './strong-trend-engine';

const router = Router();

const STOCK_WATCHLIST = [
  'SPY', 'QQQ', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD',
  'NFLX', 'CRM', 'ADBE', 'INTC', 'PYPL', 'SQ', 'COIN', 'SHOP', 'ROKU', 'UBER',
  'JPM', 'BAC', 'GS', 'MS', 'V', 'MA', 'AXP', 'WFC', 'C', 'USB',
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'VLO', 'PSX', 'OXY', 'HAL'
];

const CRYPTO_WATCHLIST = [
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'SOL-USD', 'ADA-USD', 'DOGE-USD',
  'DOT-USD', 'AVAX-USD', 'MATIC-USD', 'LINK-USD', 'SHIB-USD', 'LTC-USD', 'UNI-USD'
];

const FOREX_WATCHLIST = [
  'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'AUDUSD=X', 'USDCAD=X', 'NZDUSD=X', 'USDCHF=X'
];

const COMMODITY_WATCHLIST = [
  'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F'
];

router.get('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const signal = await analyzeStrongTrend(symbol);
    
    if (!signal) {
      return res.status(404).json({ error: 'Unable to analyze symbol', symbol });
    }
    
    res.json(signal);
  } catch (error) {
    console.error('Strong trend analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze strong trend' });
  }
});

router.get('/scan', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string) || 'stocks';
    const minStrength = parseInt(req.query.minStrength as string) || 50;
    
    let symbols: string[] = [];
    switch (category.toLowerCase()) {
      case 'crypto':
        symbols = CRYPTO_WATCHLIST;
        break;
      case 'forex':
        symbols = FOREX_WATCHLIST;
        break;
      case 'commodities':
        symbols = COMMODITY_WATCHLIST;
        break;
      case 'all':
        symbols = [...STOCK_WATCHLIST, ...CRYPTO_WATCHLIST, ...FOREX_WATCHLIST, ...COMMODITY_WATCHLIST];
        break;
      default:
        symbols = STOCK_WATCHLIST;
    }
    
    const signals = await scanForStrongTrends(symbols, minStrength);
    
    res.json({
      timestamp: new Date().toISOString(),
      category,
      totalScanned: symbols.length,
      strongTrendsFound: signals.length,
      signals,
      summary: {
        strongBullish: signals.filter(s => s.trend === 'STRONG_BULLISH').length,
        bullish: signals.filter(s => s.trend === 'BULLISH').length,
        bearish: signals.filter(s => s.trend === 'BEARISH').length,
        strongBearish: signals.filter(s => s.trend === 'STRONG_BEARISH').length,
        criticalAlerts: signals.filter(s => s.alertLevel === 'CRITICAL').length,
        highAlerts: signals.filter(s => s.alertLevel === 'HIGH').length
      }
    });
  } catch (error) {
    console.error('Strong trend scan error:', error);
    res.status(500).json({ error: 'Failed to scan for strong trends' });
  }
});

router.get('/strongest', async (req: Request, res: Response) => {
  try {
    const topN = parseInt(req.query.topN as string) || 10;
    const includeAll = req.query.includeAll === 'true';
    
    let symbols = STOCK_WATCHLIST;
    if (includeAll) {
      symbols = [...STOCK_WATCHLIST, ...CRYPTO_WATCHLIST, ...FOREX_WATCHLIST, ...COMMODITY_WATCHLIST];
    }
    
    const { bullish, bearish } = await getStrongestTrends(symbols, topN);
    
    res.json({
      timestamp: new Date().toISOString(),
      strongestBullish: bullish,
      strongestBearish: bearish,
      alerts: {
        criticalBullish: bullish.filter(s => s.alertLevel === 'CRITICAL'),
        criticalBearish: bearish.filter(s => s.alertLevel === 'CRITICAL')
      }
    });
  } catch (error) {
    console.error('Strongest trends error:', error);
    res.status(500).json({ error: 'Failed to get strongest trends' });
  }
});

router.get('/global-scan', async (req: Request, res: Response) => {
  try {
    const allSymbols = [...STOCK_WATCHLIST, ...CRYPTO_WATCHLIST, ...FOREX_WATCHLIST, ...COMMODITY_WATCHLIST];
    
    const signals = await scanForStrongTrends(allSymbols, 40);
    
    const stockSignals = signals.filter(s => STOCK_WATCHLIST.includes(s.symbol));
    const cryptoSignals = signals.filter(s => CRYPTO_WATCHLIST.includes(s.symbol));
    const forexSignals = signals.filter(s => FOREX_WATCHLIST.includes(s.symbol));
    const commoditySignals = signals.filter(s => COMMODITY_WATCHLIST.includes(s.symbol));
    
    const criticalAlerts = signals.filter(s => s.alertLevel === 'CRITICAL');
    const highAlerts = signals.filter(s => s.alertLevel === 'HIGH');
    
    res.json({
      timestamp: new Date().toISOString(),
      globalSummary: {
        totalScanned: allSymbols.length,
        strongTrendsFound: signals.length,
        criticalAlerts: criticalAlerts.length,
        highAlerts: highAlerts.length,
        bullishTrends: signals.filter(s => s.direction === 'UP').length,
        bearishTrends: signals.filter(s => s.direction === 'DOWN').length
      },
      criticalAlerts,
      highAlerts,
      byCategory: {
        stocks: {
          count: stockSignals.length,
          bullish: stockSignals.filter(s => s.direction === 'UP').length,
          bearish: stockSignals.filter(s => s.direction === 'DOWN').length,
          topSignals: stockSignals.slice(0, 5)
        },
        crypto: {
          count: cryptoSignals.length,
          bullish: cryptoSignals.filter(s => s.direction === 'UP').length,
          bearish: cryptoSignals.filter(s => s.direction === 'DOWN').length,
          topSignals: cryptoSignals.slice(0, 5)
        },
        forex: {
          count: forexSignals.length,
          bullish: forexSignals.filter(s => s.direction === 'UP').length,
          bearish: forexSignals.filter(s => s.direction === 'DOWN').length,
          topSignals: forexSignals.slice(0, 5)
        },
        commodities: {
          count: commoditySignals.length,
          bullish: commoditySignals.filter(s => s.direction === 'UP').length,
          bearish: commoditySignals.filter(s => s.direction === 'DOWN').length,
          topSignals: commoditySignals.slice(0, 5)
        }
      },
      allSignals: signals
    });
  } catch (error) {
    console.error('Global scan error:', error);
    res.status(500).json({ error: 'Failed to perform global scan' });
  }
});

export default router;
