import { Router, Request, Response } from 'express';
import { predictiveSignalEngine, PredictiveSnapshot, IntermarketData, Candle } from './predictive-signal-engine';

const router = Router();

interface YahooQuote {
  timestamp?: number[];
  open?: number[];
  high?: number[];
  low?: number[];
  close?: number[];
  volume?: number[];
}

async function fetchYahooCandles(symbol: string, interval: string = '5m', range: string = '5d'): Promise<Candle[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const quote: YahooQuote = data?.chart?.result?.[0]?.indicators?.quote?.[0] || {};
    const timestamp: number[] = data?.chart?.result?.[0]?.timestamp || [];
    
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

async function fetchIntermarketData(): Promise<IntermarketData> {
  try {
    const symbols = ['SPY', 'DX-Y.NYB', '^VIX', 'GC=F'];
    const responses = await Promise.all(
      symbols.map(s => fetchYahooCandles(s, '1d', '5d'))
    );
    
    const [spyCandles, dxyCandles, vixCandles, goldCandles] = responses;
    
    const getTrend = (candles: Candle[]): 'bullish' | 'bearish' | 'neutral' => {
      if (candles.length < 2) return 'neutral';
      const change = (candles[candles.length - 1].close - candles[0].close) / candles[0].close;
      return change > 0.005 ? 'bullish' : change < -0.005 ? 'bearish' : 'neutral';
    };
    
    const vixLevel = vixCandles.length > 0 ? vixCandles[vixCandles.length - 1].close : 20;
    
    return {
      spyTrend: getTrend(spyCandles),
      dxyTrend: getTrend(dxyCandles),
      vixLevel: vixLevel > 25 ? 'elevated' : vixLevel < 15 ? 'low' : 'normal',
      yieldTrend: 'stable',
      goldTrend: getTrend(goldCandles),
      correlationStrength: 0.7
    };
  } catch (error) {
    console.error('Error fetching intermarket data:', error);
    return {
      spyTrend: 'neutral',
      dxyTrend: 'neutral',
      vixLevel: 'normal',
      yieldTrend: 'stable',
      goldTrend: 'neutral',
      correlationStrength: 0.5
    };
  }
}

router.get('/snapshot/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as string) || '5m';
    const range = (req.query.range as string) || '5d';
    
    const [candles, intermarket] = await Promise.all([
      fetchYahooCandles(symbol.toUpperCase(), interval, range),
      fetchIntermarketData()
    ]);
    
    if (candles.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient data for ${symbol}` 
      });
    }
    
    const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
      symbol.toUpperCase(),
      candles,
      intermarket
    );
    
    res.json({ success: true, data: snapshot });
  } catch (error: any) {
    console.error('Predictive snapshot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body as { symbols: string[] };
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'symbols array required' 
      });
    }
    
    const [intermarket, ...candlesArray] = await Promise.all([
      fetchIntermarketData(),
      ...symbols.map(s => fetchYahooCandles(s.toUpperCase(), '5m', '5d'))
    ]);
    
    const assets = symbols.map((symbol, i) => ({
      symbol: symbol.toUpperCase(),
      candles: candlesArray[i]
    })).filter(a => a.candles.length >= 10);
    
    const snapshots = await predictiveSignalEngine.batchGenerateSnapshots(assets, intermarket);
    
    const results: Record<string, PredictiveSnapshot> = {};
    snapshots.forEach((snapshot, symbol) => {
      results[symbol] = snapshot;
    });
    
    res.json({ 
      success: true, 
      data: results,
      intermarket,
      processedCount: Object.keys(results).length
    });
  } catch (error: any) {
    console.error('Batch predictive error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/double-confirmation/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    const [candles, intermarket] = await Promise.all([
      fetchYahooCandles(symbol.toUpperCase(), '5m', '5d'),
      fetchIntermarketData()
    ]);
    
    if (candles.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: `Insufficient data for ${symbol}` 
      });
    }
    
    const snapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
      symbol.toUpperCase(),
      candles,
      intermarket
    );
    
    res.json({ 
      success: true, 
      data: {
        symbol: symbol.toUpperCase(),
        doubleConfirmation: snapshot.doubleConfirmation,
        neuralIndex: snapshot.neuralIndex,
        overallSignal: snapshot.overallSignal,
        signalConfidence: snapshot.signalConfidence
      }
    });
  } catch (error: any) {
    console.error('Double confirmation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/intermarket', async (req: Request, res: Response) => {
  try {
    const intermarket = await fetchIntermarketData();
    res.json({ success: true, data: intermarket });
  } catch (error: any) {
    console.error('Intermarket data error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/scan', async (req: Request, res: Response) => {
  try {
    const defaultSymbols = [
      'SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA',
      'AMD', 'NFLX', 'GC=F', 'SI=F', 'CL=F', 'ES=F', 'NQ=F'
    ];
    
    const symbols = (req.query.symbols as string)?.split(',') || defaultSymbols;
    
    const [intermarket, ...candlesArray] = await Promise.all([
      fetchIntermarketData(),
      ...symbols.map(s => fetchYahooCandles(s.toUpperCase(), '5m', '5d'))
    ]);
    
    const assets = symbols.map((symbol, i) => ({
      symbol: symbol.toUpperCase(),
      candles: candlesArray[i]
    })).filter(a => a.candles.length >= 10);
    
    const snapshots = await predictiveSignalEngine.batchGenerateSnapshots(assets, intermarket);
    
    const signals: any[] = [];
    const doubleConfirmed: any[] = [];
    
    snapshots.forEach((snapshot, symbol) => {
      const entry = {
        symbol,
        signal: snapshot.overallSignal,
        confidence: snapshot.signalConfidence,
        neuralIndex: snapshot.neuralIndex.direction,
        neuralConfidence: snapshot.neuralIndex.confidence,
        completeAgreement: snapshot.neuralIndex.completeAgreement,
        doubleConfirmed: snapshot.doubleConfirmation.confirmed,
        trendStrength: snapshot.trendStrength.overallStrength,
        predictedHigh: snapshot.predictedRange.predictedHigh,
        predictedLow: snapshot.predictedRange.predictedLow,
        upPotential: snapshot.predictedRange.upPotential,
        maCrossover: snapshot.predictedMAs.crossovers.shortMediumCross
      };
      
      signals.push(entry);
      
      if (snapshot.doubleConfirmation.confirmed) {
        doubleConfirmed.push({
          ...entry,
          confirmationSignals: snapshot.doubleConfirmation.signals,
          confirmationScore: snapshot.doubleConfirmation.score
        });
      }
    });
    
    signals.sort((a, b) => b.confidence - a.confidence);
    doubleConfirmed.sort((a, b) => b.confirmationScore - a.confirmationScore);
    
    res.json({
      success: true,
      data: {
        timestamp: Date.now(),
        intermarket,
        totalScanned: signals.length,
        doubleConfirmedCount: doubleConfirmed.length,
        signals: signals.slice(0, 20),
        doubleConfirmedSignals: doubleConfirmed
      }
    });
  } catch (error: any) {
    console.error('Predictive scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
