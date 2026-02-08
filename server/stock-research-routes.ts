import { Router, Request, Response } from 'express';
import { researchStock, getQuickQuote } from './stock-research-service';

const router = Router();

router.get('/research/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.length > 10) {
      return res.status(400).json({ 
        error: 'Invalid symbol',
        message: 'Please provide a valid stock symbol (1-10 characters)'
      });
    }

    const result = await researchStock(symbol);
    res.json(result);
  } catch (error: any) {
    console.error('Stock research error:', error);
    res.status(error.message?.includes('not found') ? 404 : 500).json({
      error: 'Research failed',
      message: error.message || 'Failed to research stock'
    });
  }
});

router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol || symbol.length > 10) {
      return res.status(400).json({ 
        error: 'Invalid symbol',
        message: 'Please provide a valid stock symbol'
      });
    }

    const quote = await getQuickQuote(symbol);
    res.json(quote);
  } catch (error: any) {
    console.error('Quote error:', error);
    res.status(500).json({
      error: 'Quote failed',
      message: error.message || 'Failed to fetch quote'
    });
  }
});

export default router;
