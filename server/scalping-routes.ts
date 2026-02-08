import { Router } from 'express';
import { scalpingService } from './scalping-service';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';
import { predictiveSignalEngine } from './predictive-signal-engine';

const router = Router();

// Asset Categories for HF Scalping Scanner
// Note: Forex pairs use base format (e.g., EURUSD) - the service adds =X suffix internally
const ASSET_CATEGORIES = {
  forex_major: {
    name: 'Major Forex Pairs',
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD']
  },
  forex_cross: {
    name: 'Cross Forex Pairs',
    symbols: ['EURGBP', 'EURJPY', 'GBPJPY', 'AUDJPY', 'EURAUD', 'EURCHF', 'GBPCHF']
  },
  forex_exotic: {
    name: 'Exotic Forex Pairs',
    symbols: ['USDTRY', 'USDMXN', 'USDZAR', 'USDSGD', 'EURTRY']
  },
  indices: {
    name: 'Index Futures',
    symbols: ['^GSPC', '^IXIC', '^DJI', 'ES=F', 'NQ=F', 'YM=F', 'RTY=F']
  },
  crypto: {
    name: 'Cryptocurrencies',
    symbols: ['BTC-USD', 'ETH-USD', 'LTC-USD', 'XRP-USD', 'SOL-USD', 'ADA-USD', 'DOGE-USD', 'DOT-USD', 'MATIC-USD', 'LINK-USD', 'SHIB-USD', 'AVAX-USD']
  },
  commodities: {
    name: 'Commodities',
    symbols: ['GC=F', 'SI=F', 'PL=F', 'PA=F', 'CL=F', 'BZ=F', 'NG=F']
  },
  stocks: {
    name: 'Stocks (CFDs)',
    symbols: ['^GSPC', 'AAPL', 'TSLA', 'AMZN', 'MSFT', 'NVDA', 'GOOGL', 'META', 'NFLX', 'AMD', 'SPY', 'QQQ']
  }
};

// Symbol display names for better UI
const SYMBOL_DISPLAY_NAMES: Record<string, string> = {
  // Forex Major (internal format uses base symbol, display shows pair format)
  'EURUSD': 'EUR/USD', 'GBPUSD': 'GBP/USD', 'USDJPY': 'USD/JPY',
  'AUDUSD': 'AUD/USD', 'USDCAD': 'USD/CAD', 'USDCHF': 'USD/CHF', 'NZDUSD': 'NZD/USD',
  // Forex Cross
  'EURGBP': 'EUR/GBP', 'EURJPY': 'EUR/JPY', 'GBPJPY': 'GBP/JPY',
  'AUDJPY': 'AUD/JPY', 'EURAUD': 'EUR/AUD', 'EURCHF': 'EUR/CHF', 'GBPCHF': 'GBP/CHF',
  // Forex Exotic
  'USDTRY': 'USD/TRY', 'USDMXN': 'USD/MXN', 'USDZAR': 'USD/ZAR',
  'USDSGD': 'USD/SGD', 'EURTRY': 'EUR/TRY',
  // Major Indices
  '^GSPC': 'SPX (S&P 500)', '^IXIC': 'NASDAQ Composite', '^DJI': 'Dow Jones',
  // Index Futures (major US indices with reliable Yahoo Finance data)
  'ES=F': 'SPX500 Fut (S&P)', 'NQ=F': 'NAS100 Fut (Nasdaq)', 'YM=F': 'US30 Fut (Dow)', 'RTY=F': 'US2000 (Russell)',
  // Crypto
  'BTC-USD': 'BTC/USD', 'ETH-USD': 'ETH/USD', 'LTC-USD': 'LTC/USD',
  'XRP-USD': 'XRP/USD', 'SOL-USD': 'SOL/USD', 'ADA-USD': 'ADA/USD',
  'DOGE-USD': 'DOGE/USD', 'DOT-USD': 'DOT/USD', 'MATIC-USD': 'MATIC/USD',
  'LINK-USD': 'LINK/USD', 'SHIB-USD': 'SHIB/USD', 'AVAX-USD': 'AVAX/USD',
  // Commodities
  'GC=F': 'XAU/USD (Gold)', 'SI=F': 'XAG/USD (Silver)', 'PL=F': 'XPT/USD (Platinum)',
  'PA=F': 'XPD/USD (Palladium)', 'CL=F': 'USOIL (WTI)', 'BZ=F': 'UKOIL (Brent)', 'NG=F': 'NGAS (Nat Gas)',
  // Stocks & ETFs
  'SPY': 'SPY (S&P ETF)', 'QQQ': 'QQQ (Nasdaq ETF)',
  'AAPL': 'AAPL (Apple)', 'TSLA': 'TSLA (Tesla)', 'AMZN': 'AMZN (Amazon)',
  'MSFT': 'MSFT (Microsoft)', 'NVDA': 'NVDA (NVIDIA)', 'GOOGL': 'GOOGL (Google)',
  'META': 'META (Meta)', 'NFLX': 'NFLX (Netflix)', 'AMD': 'AMD (AMD)'
};

const getAllSymbols = (): string[] => {
  return Object.values(ASSET_CATEGORIES).flatMap(cat => cat.symbols);
};

const getSymbolsByCategory = (category: string): string[] => {
  const cat = ASSET_CATEGORIES[category as keyof typeof ASSET_CATEGORIES];
  return cat ? cat.symbols : getAllSymbols();
};

const DEFAULT_SCALPING_SYMBOLS = getAllSymbols();

// Get available asset categories
router.get('/categories', (_req, res) => {
  const categories = Object.entries(ASSET_CATEGORIES).map(([key, value]) => ({
    id: key,
    name: value.name,
    symbolCount: value.symbols.length,
    symbols: value.symbols.map(s => ({
      symbol: s,
      displayName: SYMBOL_DISPLAY_NAMES[s] || s
    }))
  }));
  
  res.json({
    categories,
    totalAssets: getAllSymbols().length,
    displayNames: SYMBOL_DISPLAY_NAMES
  });
});

router.get('/scan', async (req, res) => {
  try {
    const timeframe = (req.query.timeframe as '1m' | '5m' | '15m' | '30m') || '5m';
    const category = req.query.category as string;
    
    let symbols: string[];
    if (req.query.symbols) {
      symbols = (req.query.symbols as string).split(',');
    } else if (category && category !== 'all') {
      symbols = getSymbolsByCategory(category);
    } else {
      symbols = DEFAULT_SCALPING_SYMBOLS;
    }
    
    console.log(`⚡ Scalping scan: ${symbols.length} assets on ${timeframe} timeframe (category: ${category || 'all'})`);
    
    const signals = await scalpingService.scanMultipleAssets(symbols, timeframe);
    
    // Add display names to signals
    const signalsWithPredictive = await Promise.all(
      signals.map(async (s) => {
        try {
          const candles = await scalpingService.getCachedCandles(s.asset);
          if (candles && candles.length >= 10) {
            const predictive = await predictiveSignalEngine.generatePredictiveSnapshot(s.asset, candles);
            return {
              ...s,
              displayName: SYMBOL_DISPLAY_NAMES[s.asset] || s.asset,
              predictive: {
                neuralIndex: predictive.neuralIndex.direction,
                neuralConfidence: predictive.neuralIndex.confidence,
                completeAgreement: predictive.neuralIndex.completeAgreement,
                doubleConfirmed: predictive.doubleConfirmation.confirmed,
                predictedHigh: predictive.predictedRange.predictedHigh,
                predictedLow: predictive.predictedRange.predictedLow,
                maCrossover: predictive.predictedMAs.crossovers.shortMediumCross,
                trendStrength: predictive.trendStrength.overallStrength,
                overallSignal: predictive.overallSignal,
                liquiditySweep: {
                  status: predictive.liquiditySweep.status,
                  gate1Passed: predictive.liquiditySweep.gate1Passed,
                  gate2Passed: predictive.liquiditySweep.gate2Passed,
                  gate3Passed: predictive.liquiditySweep.gate3Passed,
                  swingLow: predictive.liquiditySweep.swingLow,
                  volumeMultiplier: predictive.liquiditySweep.volumeMultiplier,
                  isConsolidating: predictive.liquiditySweep.isConsolidating,
                  isWeakSweep: predictive.liquiditySweep.isWeakSweep,
                  targetFVG: predictive.liquiditySweep.targetFVG,
                  reasons: predictive.liquiditySweep.reasons
                }
              }
            };
          }
        } catch (e) {}
        return {
          ...s,
          displayName: SYMBOL_DISPLAY_NAMES[s.asset] || s.asset
        };
      })
    );
    
    const signalsWithDisplayNames = signalsWithPredictive;
    
    const activeSignals = signalsWithDisplayNames.filter(s => s.signal !== 'WAIT');
    const buySignals = signalsWithDisplayNames.filter(s => s.signal === 'BUY' || s.signal === 'STRONG BUY');
    const sellSignals = signalsWithDisplayNames.filter(s => s.signal === 'SELL' || s.signal === 'STRONG SELL');
    
    res.json({
      timestamp: new Date().toISOString(),
      timeframe,
      category: category || 'all',
      dataSource: 'Yahoo Finance Real-Time + Fear & Greed Index',
      summary: {
        totalScanned: signalsWithDisplayNames.length,
        activeSignals: activeSignals.length,
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        waitSignals: signalsWithDisplayNames.length - activeSignals.length
      },
      topSignals: activeSignals.slice(0, 5),
      allSignals: signalsWithDisplayNames
    });
  } catch (error) {
    console.error('Scalping scan error:', error);
    res.status(500).json({ error: 'Scalping scan failed' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as '1m' | '5m' | '15m' | '30m') || '5m';
    
    console.log(`⚡ Analyzing ${symbol} for scalping (${timeframe})`);
    
    const signal = await scalpingService.analyzeAsset(symbol.toUpperCase(), timeframe);
    
    if (!signal) {
      return res.status(404).json({ error: `No data available for ${symbol}` });
    }
    
    const formattedOutput = {
      asset: signal.asset,
      signal: signal.signal,
      confidence: `${signal.confidence}/10`,
      timing: signal.timing,
      exitTarget: `$${signal.exitTarget.toFixed(2)}`,
      stopLoss: `$${signal.stopLoss.toFixed(2)}`,
      reasoning: signal.reasoning,
      fullData: signal
    };
    
    res.json(formattedOutput);
  } catch (error) {
    console.error('Scalping analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/quick/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as '1m' | '5m' | '15m' | '30m') || '1m';
    
    const signal = await scalpingService.analyzeAsset(symbol.toUpperCase(), timeframe);
    
    if (!signal) {
      return res.status(404).json({ error: `No data for ${symbol}` });
    }
    
    const quickOutput = `
[${signal.asset}]: ${signal.signal}
CONFIDENCE: ${signal.confidence}/10
TIMING: ${signal.timing}
EXIT TARGET: $${signal.exitTarget.toFixed(2)}
STOP LOSS: $${signal.stopLoss.toFixed(2)}
REASONING:
${signal.reasoning.map(r => `• ${r}`).join('\n')}
    `.trim();
    
    res.json({
      formatted: quickOutput,
      data: signal
    });
  } catch (error) {
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

router.get('/gsr', async (req, res) => {
  try {
    console.log('🥇 Fetching Gold-Silver Ratio data...');
    const gsrData = await scalpingService.fetchGSRData();
    
    res.json({
      timestamp: new Date().toISOString(),
      ...gsrData,
      goldPrice: (scalpingService as any).lastGoldPrice || 0,
      silverPrice: (scalpingService as any).lastSilverPrice || 0,
      description: 'Gold-Silver Ratio (GSR) measures how many ounces of silver to buy one ounce of gold. Deviation >2% from 5-day mean triggers mean-reversion signals.',
      strategies: {
        buyGold: 'When GSR is 2%+ BELOW mean (Gold lagging)',
        buySilver: 'When GSR is 2%+ ABOVE mean (Silver lagging, high probability catch-up)',
        silverExhaustion: 'When Silver StochRSI hits 95+ (parabolic exhaustion SELL)'
      }
    });
  } catch (error) {
    console.error('GSR endpoint error:', error);
    res.status(500).json({ error: 'GSR data fetch failed' });
  }
});

// Live price endpoint - fetches real-time data from Finnhub with no caching
router.get('/live-prices', async (req, res) => {
  try {
    const symbolsParam = req.query.symbols as string;
    const symbols = symbolsParam ? symbolsParam.split(',') : Object.values(ASSET_CATEGORIES).flatMap(c => c.symbols.slice(0, 3));
    
    const finnhubKey = process.env.FINNHUB_API_KEY;
    if (!finnhubKey) {
      return res.status(503).json({ error: 'Real-time data service not configured' });
    }
    
    const prices: Record<string, { price: number; change: number; changePercent: number; timestamp: number }> = {};
    
    // Fetch in parallel batches
    const batchSize = 10;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(async (symbol) => {
        try {
          // Format symbol for Finnhub (remove special chars)
          let finnhubSymbol = symbol;
          if (symbol.includes('-USD')) {
            finnhubSymbol = `BINANCE:${symbol.replace('-USD', 'USDT')}`;
          } else if (symbol.includes('=F')) {
            finnhubSymbol = symbol.replace('=F', '');
          } else if (symbol.startsWith('^')) {
            // Index symbols - use futures
            const indexMap: Record<string, string> = { '^GSPC': 'ES', '^IXIC': 'NQ', '^DJI': 'YM' };
            finnhubSymbol = indexMap[symbol] || symbol.replace('^', '');
          }
          
          const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubKey}`);
          if (response.ok) {
            const data = await response.json();
            if (data.c > 0) {
              return { symbol, price: data.c, change: data.d || 0, changePercent: data.dp || 0 };
            }
          }
          return null;
        } catch (e) {
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      results.forEach(r => {
        if (r) {
          prices[r.symbol] = {
            price: r.price,
            change: r.change,
            changePercent: r.changePercent,
            timestamp: Date.now()
          };
        }
      });
    }
    
    res.json({
      success: true,
      prices,
      count: Object.keys(prices).length,
      timestamp: Date.now(),
      source: 'Finnhub Real-Time'
    });
  } catch (error) {
    console.error('Live prices error:', error);
    res.status(500).json({ error: 'Failed to fetch live prices' });
  }
});

// Single live quote endpoint
router.get('/live-quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const finnhubKey = process.env.FINNHUB_API_KEY;
    
    if (!finnhubKey) {
      return res.status(503).json({ error: 'Real-time data not configured' });
    }
    
    let finnhubSymbol = symbol;
    if (symbol.includes('-USD')) {
      finnhubSymbol = `BINANCE:${symbol.replace('-USD', 'USDT')}`;
    } else if (symbol.includes('=F')) {
      finnhubSymbol = symbol.replace('=F', '');
    }
    
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${finnhubSymbol}&token=${finnhubKey}`);
    
    if (!response.ok) {
      throw new Error(`Finnhub error: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.json({
      success: true,
      symbol,
      displayName: SYMBOL_DISPLAY_NAMES[symbol] || symbol,
      price: data.c,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: data.pc,
      change: data.d,
      changePercent: data.dp,
      timestamp: Date.now(),
      source: 'Finnhub Real-Time'
    });
  } catch (error: any) {
    console.error('Live quote error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch quote' });
  }
});

export default router;
