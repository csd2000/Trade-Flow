import { Router, Request, Response } from 'express';
import { reversalDetectionService } from './reversal-detection-service';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';

const router = Router();

const ASSET_UNIVERSE = {
  stocks: [
    'SPY', 'QQQ', 'IWM', 'DIA', 'VTI',
    'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AMD', 'NFLX', 'CRM',
    'ADBE', 'INTC', 'PYPL', 'SQ', 'SHOP', 'ROKU', 'COIN', 'PLTR', 'UBER', 'ABNB',
    'JPM', 'BAC', 'GS', 'MS', 'V', 'MA', 'AXP', 'WFC', 'C', 'BRK-B',
    'XOM', 'CVX', 'COP', 'SLB', 'OXY', 'MPC', 'VLO', 'PSX', 'EOG', 'PXD',
    'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'DHR', 'BMY', 'AMGN',
    'WMT', 'COST', 'HD', 'LOW', 'TGT'
  ],
  crypto: [
    'BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'AVAX-USD', 'DOGE-USD',
    'DOT-USD', 'MATIC-USD', 'LINK-USD', 'UNI-USD', 'ATOM-USD', 'LTC-USD', 'NEAR-USD',
    'APT-USD', 'ARB-USD', 'OP-USD', 'INJ-USD', 'SUI-USD', 'SEI-USD', 'TIA-USD',
    'FIL-USD', 'ICP-USD', 'HBAR-USD', 'VET-USD', 'ALGO-USD', 'AAVE-USD', 'MKR-USD', 'CRV-USD'
  ],
  forex: [
    'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X', 'AUDUSD=X', 'USDCAD=X', 'NZDUSD=X',
    'EURGBP=X', 'EURJPY=X', 'GBPJPY=X', 'AUDJPY=X', 'CADJPY=X', 'CHFJPY=X',
    'EURCHF=X', 'EURAUD=X', 'GBPAUD=X', 'AUDNZD=X', 'GBPCAD=X', 'EURCAD=X', 'AUDCAD=X'
  ],
  futures: [
    'ES=F', 'NQ=F', 'YM=F', 'RTY=F',
    'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F', 'PL=F',
    'ZC=F', 'ZS=F', 'ZW=F', 'KC=F', 'SB=F', 'CC=F',
    'ZB=F', 'ZN=F', 'ZF=F', 'ZT=F',
    '6E=F', '6B=F', '6J=F', '6A=F', '6C=F'
  ]
};

const DEFAULT_SYMBOLS = ASSET_UNIVERSE.stocks.slice(0, 20);

const ALL_SYMBOLS = [
  ...ASSET_UNIVERSE.stocks,
  ...ASSET_UNIVERSE.crypto,
  ...ASSET_UNIVERSE.forex,
  ...ASSET_UNIVERSE.futures
];

function getAssetClass(symbol: string): string {
  if (ASSET_UNIVERSE.crypto.includes(symbol)) return 'crypto';
  if (ASSET_UNIVERSE.forex.includes(symbol)) return 'forex';
  if (ASSET_UNIVERSE.futures.includes(symbol)) return 'futures';
  return 'stocks';
}

router.get('/universe', async (req: Request, res: Response) => {
  res.json({
    assetClasses: Object.keys(ASSET_UNIVERSE),
    counts: {
      stocks: ASSET_UNIVERSE.stocks.length,
      crypto: ASSET_UNIVERSE.crypto.length,
      forex: ASSET_UNIVERSE.forex.length,
      futures: ASSET_UNIVERSE.futures.length,
      total: ALL_SYMBOLS.length
    },
    symbols: ASSET_UNIVERSE
  });
});

router.get('/scan', async (req: Request, res: Response) => {
  try {
    const symbolsParam = typeof req.query.symbols === 'string' ? req.query.symbols : undefined;
    const assetClass = typeof req.query.assetClass === 'string' ? req.query.assetClass : undefined;
    const fullScan = req.query.fullScan === 'true';
    
    let symbols: string[];
    
    if (symbolsParam) {
      symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    } else if (fullScan) {
      symbols = ALL_SYMBOLS;
    } else if (assetClass && ASSET_UNIVERSE[assetClass as keyof typeof ASSET_UNIVERSE]) {
      symbols = ASSET_UNIVERSE[assetClass as keyof typeof ASSET_UNIVERSE];
    } else {
      symbols = DEFAULT_SYMBOLS.slice(0, 10);
    }
    
    console.log(`📡 /scan request: ${symbols.length} symbols, assetClass=${assetClass || 'all'}, fullScan=${fullScan}`);
    
    const report = await reversalDetectionService.scanMultipleStocks(symbols);
    
    const signalsWithAssetClass = report.signals.map(s => ({
      ...s,
      assetClass: getAssetClass(s.symbol)
    }));
    
    const reversals = signalsWithAssetClass.filter(r => r.reversalType.includes('reversal'));
    const bullish = reversals.filter(r => r.reversalType === 'bullish_reversal');
    const bearish = reversals.filter(r => r.reversalType === 'bearish_reversal');
    
    const byAssetClass = {
      stocks: signalsWithAssetClass.filter(s => s.assetClass === 'stocks'),
      crypto: signalsWithAssetClass.filter(s => s.assetClass === 'crypto'),
      forex: signalsWithAssetClass.filter(s => s.assetClass === 'forex'),
      futures: signalsWithAssetClass.filter(s => s.assetClass === 'futures')
    };
    
    return res.json({
      timestamp: new Date().toISOString(),
      dataSource: 'Yahoo Finance + Alpha Vantage + AI Analysis',
      assetClassScanned: assetClass || (fullScan ? 'all' : 'stocks'),
      summary: {
        totalScanned: report.totals.attempted,
        analyzed: report.totals.analyzed,
        signaled: report.totals.signaled,
        reversalsDetected: report.totals.emitted,
        bullishReversals: bullish.length,
        bearishReversals: bearish.length,
        throttled: report.totals.throttled,
        errors: report.totals.errors,
        byAssetClass: {
          stocks: byAssetClass.stocks.length,
          crypto: byAssetClass.crypto.length,
          forex: byAssetClass.forex.length,
          futures: byAssetClass.futures.length
        }
      },
      topBullishReversals: bullish.slice(0, 5),
      topBearishReversals: bearish.slice(0, 5),
      allResults: signalsWithAssetClass,
      results: signalsWithAssetClass,
      byAssetClass,
      errorDetails: report.errors,
      scanCriteria: {
        gatesValidation: '10-Gate Hedge Fund Validation',
        divergenceTypes: ['Regular Bullish', 'Regular Bearish', 'Hidden Bullish', 'Hidden Bearish'],
        indicators: ['RSI(14)', 'MACD(12,26,9)', 'Stochastic(14,3)', 'Bollinger Bands'],
        sentimentSources: ['Fear & Greed Index', 'AI Market Analysis'],
        assetClasses: ['stocks', 'crypto', 'forex', 'futures']
      }
    });
  } catch (err: any) {
    console.error('❌ /scan failed:', err);
    return res.status(500).json({
      summary: { totalScanned: 0, analyzed: 0, signaled: 0, reversalsDetected: 0, bullishReversals: 0, bearishReversals: 0, throttled: 0, errors: 1, byAssetClass: { stocks: 0, crypto: 0, forex: 0, futures: 0 } },
      results: [],
      allResults: [],
      byAssetClass: { stocks: [], crypto: [], forex: [], futures: [] },
      errorDetails: [{ symbol: 'SERVER', message: err?.message ?? String(err) }]
    });
  }
});

router.get('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`🔍 Analyzing ${symbol} for reversal signals...`);
    
    const result = await reversalDetectionService.analyzeStock(symbol);
    
    if (!result) {
      return res.status(404).json({ error: `Could not analyze ${symbol}. Insufficient data or symbol not found.` });
    }
    
    let predictive: PredictiveSnapshot | null = null;
    try {
      const candles = await fetchYahooCandles(symbol, '15m', '5d');
      if (candles.length >= 10) {
        predictive = await predictiveSignalEngine.generatePredictiveSnapshot(symbol, candles);
      }
    } catch (e) {}
    
    res.json({
      timestamp: new Date().toISOString(),
      dataSource: 'Yahoo Finance + Alpha Vantage + AI Analysis',
      signal: result,
      predictive: predictive ? {
        neuralIndex: predictive.neuralIndex.direction,
        neuralConfidence: predictive.neuralIndex.confidence,
        completeAgreement: predictive.neuralIndex.completeAgreement,
        doubleConfirmed: predictive.doubleConfirmation.confirmed,
        doubleConfirmationScore: predictive.doubleConfirmation.score,
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
        },
        zeroLag: predictive.zeroLag,
        orderFlow: predictive.orderFlow,
        regime: predictive.regime,
        advanced: predictive.advanced
      } : null
    });
  } catch (error) {
    console.error(`Analysis error for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to analyze stock' });
  }
});

async function fetchYahooCandles(symbol: string, interval: string, range: string): Promise<{ time: number; open: number; high: number; low: number; close: number; volume: number }[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result?.timestamp) return [];
    const { timestamp, indicators } = result;
    const quote = indicators?.quote?.[0];
    if (!quote) return [];
    return timestamp.map((time: number, i: number) => ({
      time: time * 1000,
      open: quote.open?.[i] || 0,
      high: quote.high?.[i] || 0,
      low: quote.low?.[i] || 0,
      close: quote.close?.[i] || 0,
      volume: quote.volume?.[i] || 0
    })).filter((c: any) => c.open > 0 && c.close > 0);
  } catch (e) {
    return [];
  }
}

router.get('/divergences/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await reversalDetectionService.analyzeStock(symbol);
    
    if (!result) {
      return res.status(404).json({ error: `Could not analyze ${symbol}` });
    }
    
    res.json({
      symbol,
      timestamp: new Date().toISOString(),
      currentPrice: result.currentPrice,
      divergences: result.divergences,
      indicators: {
        rsi14: result.indicators.rsi14,
        rsiPrev: result.indicators.rsiPrev,
        macd: result.indicators.macd,
        macdSignal: result.indicators.macdSignal,
        stochK: result.indicators.stochK,
        stochD: result.indicators.stochD
      }
    });
  } catch (error) {
    console.error(`Divergence error for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to get divergence data' });
  }
});

router.get('/sentiment/:symbol', async (req: Request, res: Response) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const result = await reversalDetectionService.analyzeStock(symbol);
    
    if (!result) {
      return res.status(404).json({ error: `Could not analyze ${symbol}` });
    }
    
    res.json({
      symbol,
      timestamp: new Date().toISOString(),
      sentiment: result.sentiment,
      aiAnalysis: result.aiAnalysis,
      aiScore: result.aiScore
    });
  } catch (error) {
    console.error(`Sentiment error for ${req.params.symbol}:`, error);
    res.status(500).json({ error: 'Failed to get sentiment data' });
  }
});

router.get('/watchlist', async (req: Request, res: Response) => {
  try {
    const highPrioritySymbols = ['SPY', 'QQQ', 'AAPL', 'NVDA', 'TSLA', 'AMD', 'META', 'GOOGL'];
    
    const report = await reversalDetectionService.scanMultipleStocks(highPrioritySymbols);
    
    const watchlist = report.signals
      .filter(r => r.reversalProbability >= 60 || r.divergences.length > 0)
      .map(r => ({
        symbol: r.symbol,
        currentPrice: r.currentPrice,
        priceChangePercent: r.priceChangePercent,
        reversalType: r.reversalType,
        reversalProbability: r.reversalProbability,
        aiScore: r.aiScore,
        divergences: r.divergences.map(d => d.type),
        direction: r.tradeSetup.direction,
        riskReward: r.tradeSetup.riskRewardRatio
      }));
    
    res.json({
      timestamp: new Date().toISOString(),
      watchlist,
      totalCount: watchlist.length
    });
  } catch (error) {
    console.error('Watchlist error:', error);
    res.status(500).json({ error: 'Failed to generate watchlist' });
  }
});

export default router;
