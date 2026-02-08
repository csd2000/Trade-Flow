import { Router, Request, Response } from 'express';
import { quantTradingService } from './quant-service';
import { db } from './db';
import { quantAssets, quantSignals, quantIndicators, quantSentiment } from '@shared/schema';
import { desc, eq } from 'drizzle-orm';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';

const router = Router();

router.get('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const result = await quantTradingService.analyzeAsset(symbol.toUpperCase());
    
    let predictive: PredictiveSnapshot | null = null;
    try {
      const candles = await fetchYahooCandles(symbol.toUpperCase(), '15m', '5d');
      if (candles.length >= 10) {
        predictive = await predictiveSignalEngine.generatePredictiveSnapshot(symbol.toUpperCase(), candles);
      }
    } catch (e) {}
    
    res.json({
      ...result,
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
  } catch (error: any) {
    console.error('Quant analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze asset' });
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

router.get('/signals', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const signals = await quantTradingService.getLatestSignals(limit);
    res.json(signals);
  } catch (error: any) {
    console.error('Signals fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch signals' });
  }
});

router.get('/asset/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const data = await quantTradingService.getAssetWithIndicators(symbol.toUpperCase());
    if (!data) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(data);
  } catch (error: any) {
    console.error('Asset fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch asset' });
  }
});

router.get('/assets', async (req: Request, res: Response) => {
  try {
    const assets = await db
      .select()
      .from(quantAssets)
      .where(eq(quantAssets.isActive, true))
      .orderBy(desc(quantAssets.lastUpdated));
    res.json(assets);
  } catch (error: any) {
    console.error('Assets fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch assets' });
  }
});

router.get('/fear-greed', async (req: Request, res: Response) => {
  try {
    const fearGreed = await quantTradingService.fetchFearGreedIndex();
    res.json(fearGreed);
  } catch (error: any) {
    console.error('Fear & Greed fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch Fear & Greed index' });
  }
});

router.get('/indicators/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;
    
    const [asset] = await db
      .select()
      .from(quantAssets)
      .where(eq(quantAssets.symbol, symbol.toUpperCase()));
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const indicators = await db
      .select()
      .from(quantIndicators)
      .where(eq(quantIndicators.assetId, asset.id))
      .orderBy(desc(quantIndicators.calculatedAt))
      .limit(limit);
    
    res.json({ asset, indicators });
  } catch (error: any) {
    console.error('Indicators fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch indicators' });
  }
});

router.get('/sentiment/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    const [asset] = await db
      .select()
      .from(quantAssets)
      .where(eq(quantAssets.symbol, symbol.toUpperCase()));
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    const [sentiment] = await db
      .select()
      .from(quantSentiment)
      .where(eq(quantSentiment.assetId, asset.id))
      .orderBy(desc(quantSentiment.calculatedAt))
      .limit(1);
    
    res.json({ asset, sentiment });
  } catch (error: any) {
    console.error('Sentiment fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sentiment' });
  }
});

router.post('/watchlist/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { name, assetType = 'stock' } = req.body;
    
    const assetId = await quantTradingService.getOrCreateAsset(
      symbol.toUpperCase(),
      name || `${symbol.toUpperCase()} ${assetType === 'crypto' ? 'Cryptocurrency' : 'Stock'}`,
      assetType
    );
    
    res.json({ success: true, assetId });
  } catch (error: any) {
    console.error('Watchlist add error:', error);
    res.status(500).json({ error: error.message || 'Failed to add to watchlist' });
  }
});

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [assets, signals, fearGreed] = await Promise.all([
      db.select().from(quantAssets).where(eq(quantAssets.isActive, true)).orderBy(desc(quantAssets.lastUpdated)).limit(10),
      quantTradingService.getLatestSignals(10),
      quantTradingService.fetchFearGreedIndex()
    ]);
    
    const assetsWithData = await Promise.all(
      assets.map(async (asset) => {
        const [indicator] = await db
          .select()
          .from(quantIndicators)
          .where(eq(quantIndicators.assetId, asset.id))
          .orderBy(desc(quantIndicators.calculatedAt))
          .limit(1);
        
        const [signal] = await db
          .select()
          .from(quantSignals)
          .where(eq(quantSignals.assetId, asset.id))
          .orderBy(desc(quantSignals.generatedAt))
          .limit(1);
        
        return { ...asset, latestIndicator: indicator, latestSignal: signal };
      })
    );
    
    const signalStats = {
      total: signals.length,
      bullish: signals.filter((s: any) => s.direction === 'bullish').length,
      bearish: signals.filter((s: any) => s.direction === 'bearish').length,
      neutral: signals.filter((s: any) => s.direction === 'neutral').length
    };
    
    res.json({
      assets: assetsWithData,
      signals,
      signalStats,
      fearGreed,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard data' });
  }
});

export default router;
