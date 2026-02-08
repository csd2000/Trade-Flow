import { Router } from 'express';
import { firstCandleStrategyService } from './first-candle-strategy-service';

const router = Router();

const DEFAULT_SYMBOLS = [
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX',
  'AMD', 'PLTR', 'LCID', 'RIVN', 'SPY', 'QQQ', 'IWM', 'DIA'
];

router.get('/scan', async (req, res) => {
  try {
    const symbols = req.query.symbols
      ? (req.query.symbols as string).split(',')
      : DEFAULT_SYMBOLS;

    console.log(`First Candle Strategy (ORB): Scanning ${symbols.length} assets`);

    const signals = await firstCandleStrategyService.scanMultipleAssets(symbols);

    const buySignals = signals.filter(s => s.signal === 'BUY');
    const sellSignals = signals.filter(s => s.signal === 'SELL');
    const marketStatus = signals[0]?.marketStatus;

    res.json({
      timestamp: new Date().toISOString(),
      strategy: 'First Candle (Opening Range Breakout)',
      description: 'Identifies breakouts from the first 30 minutes of trading (Opening Range) with volume confirmation',
      winRate: '58%',
      riskLevel: 'High',
      bestTimeframe: 'First 2 hours after market open',
      marketStatus: {
        isOpen: marketStatus?.isOpen || false,
        currentTimeEST: marketStatus?.currentTimeEST || 'N/A',
        minutesUntilClose: marketStatus?.minutesUntilClose || 0
      },
      summary: {
        totalScanned: signals.length,
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        waitSignals: signals.filter(s => s.signal === 'WAIT').length,
        rangeFormingSignals: signals.filter(s => s.signalType === 'RANGE_FORMING').length,
        highConfidenceSignals: signals.filter(s => s.confidence >= 7).length
      },
      topSignals: signals.filter(s => s.signal !== 'WAIT').slice(0, 5),
      allSignals: signals
    });
  } catch (error) {
    console.error('First Candle Strategy scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`First Candle Strategy: Analyzing ${symbol}`);

    const signal = await firstCandleStrategyService.analyzeAsset(symbol);

    res.json({
      ...signal,
      strategy: 'First Candle (Opening Range Breakout)',
      description: 'Break and retest of opening range (first 30 min) with continuation toward day\'s high/low',
      winRate: '58%',
      riskLevel: 'High'
    });
  } catch (error) {
    console.error('First Candle Strategy analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/quick/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const signal = await firstCandleStrategyService.analyzeAsset(symbol);

    res.json({
      asset: symbol,
      signal: signal.signal,
      signalType: signal.signalType,
      confidence: signal.confidence,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      exitTarget1: signal.exitTarget1,
      exitTarget2: signal.exitTarget2,
      openingRange: {
        high: signal.openingRange.rangeHigh,
        low: signal.openingRange.rangeLow,
        width: signal.openingRange.rangeWidthPercent
      },
      marketStatus: signal.marketStatus,
      timeIntoSession: signal.timeIntoSession,
      reasoning: signal.reasoning.slice(0, 4) // Top 4 reasons
    });
  } catch (error) {
    console.error('First Candle Strategy quick analysis error:', error);
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

export default router;
