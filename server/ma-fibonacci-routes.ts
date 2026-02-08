import { Router } from 'express';
import { scanMAFibonacci, analyzeSymbolMAFib } from './ma-fibonacci-scanner';

const router = Router();

router.get('/scan', async (req, res) => {
  try {
    const result = await scanMAFibonacci();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('MA-Fibonacci scan error:', error);
    res.status(500).json({ success: false, error: 'Scan failed' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await analyzeSymbolMAFib(symbol.toUpperCase());
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'No valid setup found for this symbol' 
      });
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('MA-Fibonacci analysis error:', error);
    res.status(500).json({ success: false, error: 'Analysis failed' });
  }
});

export default router;
