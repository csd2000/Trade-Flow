import { Router } from 'express';
import { previousDayStrategyService } from './previous-day-strategy-service';

const router = Router();

const DEFAULT_SYMBOLS = [
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX',
  'AMD', 'PLTR', 'LCID', 'RIVN', 'GME', 'AMC', 'SPY', 'QQQ'
];

router.get('/scan', async (req, res) => {
  try {
    const symbols = req.query.symbols
      ? (req.query.symbols as string).split(',')
      : DEFAULT_SYMBOLS;

    console.log(`Previous Day Strategy: Scanning ${symbols.length} assets`);

    const signals = await previousDayStrategyService.scanMultipleAssets(symbols);

    const buySignals = signals.filter(s => s.signal === 'BUY');
    const sellSignals = signals.filter(s => s.signal === 'SELL');

    res.json({
      timestamp: new Date().toISOString(),
      strategy: 'Previous Day High/Low Breakout',
      description: 'Identifies breakouts above yesterday\'s high (PDH) or below yesterday\'s low (PDL) with volume confirmation',
      winRate: '57%',
      profitFactor: 2.53,
      summary: {
        totalScanned: signals.length,
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        waitSignals: signals.filter(s => s.signal === 'WAIT').length,
        highConfidenceSignals: signals.filter(s => s.confidence >= 7).length
      },
      topSignals: signals.filter(s => s.signal !== 'WAIT').slice(0, 5),
      allSignals: signals
    });
  } catch (error) {
    console.error('Previous Day Strategy scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`Previous Day Strategy: Analyzing ${symbol}`);

    const signal = await previousDayStrategyService.analyzeAsset(symbol);

    res.json({
      ...signal,
      strategy: 'Previous Day High/Low Breakout',
      description: 'Break and retest of previous day\'s high or low with strong price action',
      winRate: '57%',
      profitFactor: 2.53
    });
  } catch (error) {
    console.error('Previous Day Strategy analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/quick/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const signal = await previousDayStrategyService.analyzeAsset(symbol);

    res.json({
      asset: symbol,
      signal: signal.signal,
      confidence: signal.confidence,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      exitTarget1: signal.exitTarget1,
      exitTarget2: signal.exitTarget2,
      reasoning: signal.reasoning.slice(0, 3) // Top 3 reasons
    });
  } catch (error) {
    console.error('Previous Day Strategy quick analysis error:', error);
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

export default router;
