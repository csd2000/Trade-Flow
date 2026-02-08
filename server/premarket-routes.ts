import { Router } from 'express';
import { premarketStrategyService } from './premarket-strategy-service';

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

    console.log(`Pre-Market Strategy: Scanning ${symbols.length} assets`);

    const signals = await premarketStrategyService.scanMultipleAssets(symbols);

    const buySignals = signals.filter(s => s.signal === 'BUY');
    const sellSignals = signals.filter(s => s.signal === 'SELL');
    const marketStatus = signals[0]?.marketStatus;

    res.json({
      timestamp: new Date().toISOString(),
      strategy: 'Pre-Market Breakout Strategy',
      description: 'Identifies breakouts from pre-market levels (4:00 AM - 9:30 AM EST) - Low-risk, high-probability institutional setups',
      riskLevel: 'Low to Medium',
      bestTimeframe: 'First hour after market open',
      marketStatus: {
        isPremarket: marketStatus?.isPremarket || false,
        isMarketHours: marketStatus?.isMarketHours || false,
        currentTimeEST: marketStatus?.currentTimeEST || 'N/A',
        minutesUntilOpen: marketStatus?.minutesUntilOpen || 0,
        minutesUntilClose: marketStatus?.minutesUntilClose || 0
      },
      summary: {
        totalScanned: signals.length,
        buySignals: buySignals.length,
        sellSignals: sellSignals.length,
        waitSignals: signals.filter(s => s.signal === 'WAIT').length,
        institutionalLevelSignals: signals.filter(s => s.institutionalLevel).length,
        lowRiskSignals: signals.filter(s => s.riskLevel === 'LOW').length,
        highConfidenceSignals: signals.filter(s => s.confidence >= 7).length
      },
      topSignals: signals.filter(s => s.signal !== 'WAIT').slice(0, 5),
      allSignals: signals
    });
  } catch (error) {
    console.error('Pre-Market Strategy scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    console.log(`Pre-Market Strategy: Analyzing ${symbol}`);

    const signal = await premarketStrategyService.analyzeAsset(symbol);

    res.json({
      ...signal,
      strategy: 'Pre-Market Breakout Strategy',
      description: 'Break and retest of pre-market levels using institutional points of interest',
      riskLevel: 'Low to Medium',
      note: 'Pre-market levels represent key institutional interest - high-probability setups'
    });
  } catch (error) {
    console.error('Pre-Market Strategy analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/quick/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const signal = await premarketStrategyService.analyzeAsset(symbol);

    res.json({
      asset: symbol,
      signal: signal.signal,
      signalType: signal.signalType,
      confidence: signal.confidence,
      riskLevel: signal.riskLevel,
      institutionalLevel: signal.institutionalLevel,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      exitTarget1: signal.exitTarget1,
      exitTarget2: signal.exitTarget2,
      premarketRange: {
        high: signal.premarketRange.premarketHigh,
        low: signal.premarketRange.premarketLow,
        width: signal.premarketRange.premarketWidthPercent
      },
      marketStatus: signal.marketStatus,
      timeIntoSession: signal.timeIntoSession,
      reasoning: signal.reasoning.slice(0, 4) // Top 4 reasons
    });
  } catch (error) {
    console.error('Pre-Market Strategy quick analysis error:', error);
    res.status(500).json({ error: 'Quick analysis failed' });
  }
});

export default router;
