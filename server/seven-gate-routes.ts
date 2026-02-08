import { Router, Request, Response } from 'express';
import { sevenGateORBEngine } from './seven-gate-orb-engine';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';
import { Candle } from './strategy/types';
import { getSECFlags } from './sec-edgar-service';

const router = Router();

async function fetchYahooCandles(symbol: string, interval: string, range: string): Promise<Candle[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`
    );
    
    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result?.timestamp) {
      return [];
    }

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
    })).filter((c: Candle) => c.open > 0 && c.close > 0);
  } catch (error) {
    console.error('Error fetching Yahoo candles:', error);
    return [];
  }
}

router.get('/gate0/status', async (req: Request, res: Response) => {
  try {
    const status = await sevenGateORBEngine.checkGate0NewsFilter();
    res.json({ success: true, data: status });
  } catch (error: any) {
    console.error('Gate 0 status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/gate0/release', async (req: Request, res: Response) => {
  try {
    const status = sevenGateORBEngine.releaseGate0();
    res.json({ success: true, data: status, message: 'Gate 0 manually released' });
  } catch (error: any) {
    console.error('Gate 0 release error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const yahooSymbol = symbol.toUpperCase();

    const [candles15m, candles5m, candles1m] = await Promise.all([
      fetchYahooCandles(yahooSymbol, '15m', '1d'),
      fetchYahooCandles(yahooSymbol, '5m', '1d'),
      fetchYahooCandles(yahooSymbol, '1m', '1d')
    ]);

    if (candles15m.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Could not fetch data for symbol: ${symbol}` 
      });
    }

    const analysis = await sevenGateORBEngine.runFullAnalysis(
      symbol,
      candles15m,
      candles5m,
      candles1m
    );

    let predictive: PredictiveSnapshot | null = null;
    try {
      if (candles15m.length >= 10) {
        predictive = await predictiveSignalEngine.generatePredictiveSnapshot(symbol, candles15m);
      }
    } catch (e) {}

    res.json({ 
      success: true, 
      data: {
        ...analysis,
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
      }
    });
  } catch (error: any) {
    console.error('7-Gate analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/active-signals', async (req: Request, res: Response) => {
  try {
    const signals = sevenGateORBEngine.getAllActiveSignals();
    res.json({ success: true, data: signals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/signal/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const signal = sevenGateORBEngine.getActiveSignal(symbol.toUpperCase());
    
    if (!signal) {
      return res.status(404).json({ 
        success: false, 
        error: `No active signal for ${symbol}` 
      });
    }

    res.json({ success: true, data: signal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/journal', async (req: Request, res: Response) => {
  try {
    const entries = sevenGateORBEngine.getJournalEntries();
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/journal', async (req: Request, res: Response) => {
  try {
    const entry = req.body;
    sevenGateORBEngine.addJournalEntry(entry);
    res.json({ success: true, message: 'Journal entry added' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sec-risk/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    console.log(`📋 Testing SEC risk check for ${symbol}...`);
    const secFlags = await getSECFlags(symbol);
    res.json({ success: true, data: secFlags });
  } catch (error: any) {
    console.error('SEC risk check error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
