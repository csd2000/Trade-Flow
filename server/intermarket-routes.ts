import { Router } from 'express';
import { getIntermarketAnalysis, getCorrelationMatrix } from './intermarket-service';

const router = Router();

router.get('/analysis', async (req, res) => {
  try {
    const analysis = await getIntermarketAnalysis();
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error fetching intermarket analysis:', error);
    const errorMessage = error?.message || 'Failed to fetch intermarket analysis';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    let statusCode = 500;
    if (errorCode === 'INSUFFICIENT_DATA') statusCode = 503;
    else if (errorCode === 'YAHOO_API_ERROR') statusCode = 502;
    
    res.status(statusCode).json({ success: false, error: errorMessage, code: errorCode });
  }
});

router.get('/correlations', async (req, res) => {
  try {
    const { matrix, labels } = await getCorrelationMatrix();
    res.json({ success: true, data: { matrix, labels } });
  } catch (error: any) {
    console.error('Error fetching correlation matrix:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch correlations' });
  }
});

export default router;
