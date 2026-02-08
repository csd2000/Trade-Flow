/**
 * Signal Fusion AI API Routes
 */

import { Router, Request, Response } from 'express';
import { signalFusionService, SignalFusionAnalysis } from './signal-fusion-service';

const router = Router();

router.get('/analyze/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { assetType = 'stock' } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    const validTypes = ['stock', 'crypto', 'forex', 'commodity'];
    const type = validTypes.includes(assetType as string) 
      ? assetType as 'stock' | 'crypto' | 'forex' | 'commodity'
      : 'stock';

    const analysis = await signalFusionService.analyzeAsset(symbol.toUpperCase(), type);

    res.json(analysis);
  } catch (error) {
    console.error('Signal Fusion analysis error:', error);
    res.status(500).json({ error: 'Failed to perform Signal Fusion analysis' });
  }
});

router.post('/batch-analyze', async (req: Request, res: Response) => {
  try {
    const { symbols, assetType = 'stock' } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({ error: 'Symbols array is required' });
    }

    if (symbols.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 symbols per batch' });
    }

    const validTypes = ['stock', 'crypto', 'forex', 'commodity'];
    const type = validTypes.includes(assetType) 
      ? assetType as 'stock' | 'crypto' | 'forex' | 'commodity'
      : 'stock';

    const analyses = await Promise.all(
      symbols.map((symbol: string) => 
        signalFusionService.analyzeAsset(symbol.toUpperCase(), type)
          .catch(err => ({
            symbol: symbol.toUpperCase(),
            error: 'Analysis failed',
            masterSignal: 'NEUTRAL' as const,
            overallConfidence: 0
          }))
      )
    );

    const sorted = analyses
      .filter((a): a is SignalFusionAnalysis => 'compositeScore' in a)
      .sort((a, b) => b.compositeScore - a.compositeScore);

    res.json({
      analyses: sorted,
      summary: {
        total: analyses.length,
        strongBuy: sorted.filter(a => a.masterSignal === 'STRONG_BUY').length,
        buy: sorted.filter(a => a.masterSignal === 'BUY').length,
        neutral: sorted.filter(a => a.masterSignal === 'NEUTRAL').length,
        sell: sorted.filter(a => a.masterSignal === 'SELL').length,
        strongSell: sorted.filter(a => a.masterSignal === 'STRONG_SELL').length,
        avgConfidence: sorted.length > 0 
          ? sorted.reduce((sum, a) => sum + a.overallConfidence, 0) / sorted.length 
          : 0
      }
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ error: 'Failed to perform batch analysis' });
  }
});

router.get('/top-opportunities', async (req: Request, res: Response) => {
  try {
    const { assetType = 'stock', limit = 10 } = req.query;

    const defaultStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AMD', 'JPM', 'V'];
    const defaultCrypto = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'dogecoin', 'polkadot', 'avalanche-2', 'chainlink', 'polygon'];

    const symbols = assetType === 'crypto' ? defaultCrypto : defaultStocks;
    const type = assetType as 'stock' | 'crypto';

    const analyses = await Promise.all(
      symbols.map(symbol => 
        signalFusionService.analyzeAsset(symbol, type)
          .catch(() => null)
      )
    );

    const validAnalyses = analyses
      .filter((a): a is SignalFusionAnalysis => a !== null)
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, parseInt(limit as string) || 10);

    res.json({
      opportunities: validAnalyses,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Top opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch top opportunities' });
  }
});

export default router;
