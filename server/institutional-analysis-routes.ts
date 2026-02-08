import { Router } from 'express';
import { z } from 'zod';
import { runUnifiedAnalysis } from './institutional-analysis-service';

const router = Router();

const analyzeRequestSchema = z.object({
  symbol: z.string().min(1).max(10).regex(/^[A-Z0-9.]+$/i, 'Invalid symbol format'),
  timeframe: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '1D', '1W', '1M']).default('1D'),
  includeForecasts: z.boolean().optional().default(true),
  include7Gate: z.boolean().optional().default(true),
  includeQuantSignals: z.boolean().optional().default(true),
  includeIntermarket: z.boolean().optional().default(true),
});

router.post('/analyze', async (req, res) => {
  try {
    const parseResult = analyzeRequestSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: parseResult.error.issues 
      });
    }

    const { symbol, timeframe } = parseResult.data;
    const analysis = await runUnifiedAnalysis(symbol.toUpperCase(), timeframe);
    
    res.json({ data: analysis });
  } catch (error) {
    console.error('Institutional analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to run institutional analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/watchlist', async (req, res) => {
  try {
    const symbols = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'GOOGL', 'AMZN', 'MSFT'];
    
    const analyses = await Promise.all(
      symbols.slice(0, 5).map(symbol => runUnifiedAnalysis(symbol))
    );

    res.json({ data: analyses });
  } catch (error) {
    console.error('Watchlist analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze watchlist' });
  }
});

export default router;
