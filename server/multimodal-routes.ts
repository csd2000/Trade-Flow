import { Router } from 'express';
import { multiModalPipelineService } from './multimodal-pipeline-service';

const router = Router();

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const assetType = (req.query.type as 'stock' | 'crypto' | 'forex') || 'stock';
    
    console.log(`📊 Multi-modal analysis request for ${symbol} (${assetType})`);
    
    const result = await multiModalPipelineService.runPipeline(symbol.toUpperCase(), assetType);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Multi-modal analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/features/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const features = await multiModalPipelineService.getLatestFeatures(symbol.toUpperCase());
    
    if (!features) {
      return res.status(404).json({
        success: false,
        error: 'No features found for this symbol. Run an analysis first.'
      });
    }
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const history = await multiModalPipelineService.getFeatureHistory(symbol.toUpperCase(), limit);
    
    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const assetType = (req.query.type as 'stock' | 'crypto' | 'forex') || 'stock';
    
    const priceData = await multiModalPipelineService.fetchPriceData(symbol.toUpperCase(), assetType);
    const technicals = multiModalPipelineService.calculateTechnicalIndicators(priceData);
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        assetType,
        latest: priceData[priceData.length - 1],
        technicals,
        dataPoints: priceData.length
      }
    });
  } catch (error) {
    console.error('Price data error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/sentiment/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const assetType = (req.query.type as 'stock' | 'crypto' | 'forex') || 'stock';
    
    const sentiment = await multiModalPipelineService.fetchSentimentData(symbol.toUpperCase(), assetType);
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        assetType,
        ...sentiment
      }
    });
  } catch (error) {
    console.error('Sentiment data error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/institutional/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const assetType = (req.query.type as 'stock' | 'crypto' | 'forex') || 'stock';
    
    const flow = await multiModalPipelineService.fetchInstitutionalFlow(symbol.toUpperCase(), assetType);
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        assetType,
        ...flow
      }
    });
  } catch (error) {
    console.error('Institutional flow error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/batch-analyze', async (req, res) => {
  try {
    const { symbols, assetType = 'stock' } = req.body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({
        success: false,
        error: 'symbols must be an array'
      });
    }
    
    const results = await Promise.all(
      symbols.slice(0, 10).map(async (symbol: string) => {
        try {
          return {
            symbol,
            ...await multiModalPipelineService.runPipeline(symbol.toUpperCase(), assetType)
          };
        } catch (error) {
          return {
            symbol,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: results,
      analyzed: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
