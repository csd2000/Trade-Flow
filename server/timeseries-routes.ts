import { Router } from 'express';
import { timeSeriesService } from './timeseries-service';
import { db } from './db';
import { timeseriesSources, timeseriesPredictions } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

export function registerTimeSeriesRoutes(app: any) {
  
  app.get('/api/timeseries/sources', async (req: any, res: any) => {
    try {
      const sources = await db
        .select()
        .from(timeseriesSources)
        .orderBy(desc(timeseriesSources.createdAt));
      
      res.json(sources);
    } catch (error: any) {
      console.error('Error fetching sources:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/timeseries/predict/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const horizon = parseInt(req.query.horizon as string) || 30;
      const useAI = req.query.ai !== 'false';
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      const timeframe = (req.query.timeframe as string) || '1D';
      
      console.log(`🔮 Prediction request for ${symbol}, type: ${assetType || 'auto'}, timeframe: ${timeframe}, horizon: ${horizon}, AI: ${useAI}`);
      
      const result = await timeSeriesService.runForecastWithTimeframe(symbol, timeframe, horizon, useAI, assetType);
      
      res.json({
        success: true,
        data: {
          ...result,
          assetType: assetType || timeSeriesService.detectAssetType(symbol),
          timeframe
        }
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // LIVE price endpoint - Real-time current price with change data
  app.get('/api/timeseries/live/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`⚡ LIVE price request for ${symbol}, type: ${assetType || 'auto'}`);
      
      const liveData = await timeSeriesService.fetchLivePrice(symbol, assetType);
      
      res.json({
        success: true,
        data: liveData
      });
    } catch (error: any) {
      console.error('Live price error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Real-time price data endpoint (historical with timeframe)
  app.get('/api/timeseries/realtime/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      const timeframe = (req.query.timeframe as string) || '1D';
      
      const priceData = await timeSeriesService.fetchAssetDataWithTimeframe(symbol, timeframe, assetType);
      const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].close : 0;
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          assetType: assetType || timeSeriesService.detectAssetType(symbol),
          timeframe,
          currentPrice,
          priceData,
          count: priceData.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Realtime data error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Multi-timeframe analysis endpoint - all timeframes in one call
  app.get('/api/timeseries/multi-timeframe/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`📊 Multi-timeframe analysis for ${symbol}, type: ${assetType || 'auto'}`);
      
      const result = await timeSeriesService.runMultiTimeframeAnalysis(symbol, assetType);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Multi-timeframe analysis error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  app.get('/api/timeseries/latest/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const prediction = await timeSeriesService.getLatestPrediction(symbol);
      
      if (!prediction) {
        return res.status(404).json({ error: 'No prediction found for this symbol' });
      }
      
      res.json(prediction);
    } catch (error: any) {
      console.error('Error fetching prediction:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/timeseries/history/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      const priceData = await timeSeriesService.fetchAssetData(symbol, assetType);
      
      res.json({
        symbol: symbol.toUpperCase(),
        assetType: assetType || timeSeriesService.detectAssetType(symbol),
        data: priceData,
        count: priceData.length
      });
    } catch (error: any) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/timeseries/predictions', async (req: any, res: any) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      
      const predictions = await db
        .select()
        .from(timeseriesPredictions)
        .orderBy(desc(timeseriesPredictions.createdAt))
        .limit(limit);
      
      res.json(predictions);
    } catch (error: any) {
      console.error('Error fetching predictions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/timeseries/industries', async (req: any, res: any) => {
    res.json([
      { code: 'finance', name: 'Finance', description: 'Stock prices, market trends, fraud detection' },
      { code: 'retail', name: 'Retail', description: 'Demand forecasting, inventory optimization' },
      { code: 'energy', name: 'Energy', description: 'Power demand, renewable output forecasting' },
      { code: 'healthcare', name: 'Healthcare', description: 'Patient vitals, disease prediction' },
      { code: 'supply_chain', name: 'Supply Chain', description: 'Shipping delays, predictive maintenance' }
    ]);
  });

  // ==========================================
  // AI TRADER ENDPOINTS
  // VQ, Health Indicator, SSI, Position Sizing
  // ==========================================

  // Get Volatility Quotient (VQ) for a symbol
  app.get('/api/ai-trader/vq/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      const type = assetType || timeSeriesService.detectAssetType(symbol);
      
      console.log(`📊 VQ calculation for ${symbol} (${type})`);
      
      const priceData = await timeSeriesService.fetchAssetData(symbol, type);
      const currentPrice = priceData[priceData.length - 1].close;
      const vqData = timeSeriesService.calculateVolatilityQuotient(priceData);
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          assetType: type,
          currentPrice,
          ...vqData,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('VQ calculation error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Get Health Indicator (Traffic Light) for a symbol
  app.get('/api/ai-trader/health/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      const type = assetType || timeSeriesService.detectAssetType(symbol);
      
      console.log(`🚦 Health indicator for ${symbol} (${type})`);
      
      const priceData = await timeSeriesService.fetchAssetData(symbol, type);
      const vqData = timeSeriesService.calculateVolatilityQuotient(priceData);
      const healthData = timeSeriesService.calculateHealthIndicator(priceData, vqData);
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          assetType: type,
          vq: vqData,
          health: healthData,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Health indicator error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Get Stock State Indicator (SSI) - Complete analysis
  app.get('/api/ai-trader/ssi/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`📈 SSI analysis for ${symbol}`);
      
      const ssiData = await timeSeriesService.getStockStateIndicator(symbol, assetType);
      
      res.json({
        success: true,
        data: ssiData
      });
    } catch (error: any) {
      console.error('SSI error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Position Size Calculator
  app.post('/api/ai-trader/position-size', async (req: any, res: any) => {
    try {
      const { accountSize, riskPercent, entryPrice, stopLossPrice, symbol } = req.body;
      
      if (!accountSize || !riskPercent || !entryPrice || !stopLossPrice) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: accountSize, riskPercent, entryPrice, stopLossPrice'
        });
      }
      
      console.log(`📐 Position size calculation for $${accountSize} account`);
      
      const positionData = timeSeriesService.calculatePositionSize(
        parseFloat(accountSize),
        parseFloat(riskPercent),
        parseFloat(entryPrice),
        parseFloat(stopLossPrice)
      );
      
      res.json({
        success: true,
        data: {
          symbol: symbol || 'N/A',
          ...positionData,
          calculatedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Position size error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Auto position size with VQ-based stop loss
  app.get('/api/ai-trader/auto-position/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const accountSize = parseFloat(req.query.accountSize as string) || 10000;
      const riskPercent = parseFloat(req.query.riskPercent as string) || 2;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      const type = assetType || timeSeriesService.detectAssetType(symbol);
      
      console.log(`🤖 Auto position for ${symbol}, account: $${accountSize}, risk: ${riskPercent}%`);
      
      const priceData = await timeSeriesService.fetchAssetData(symbol, type);
      const currentPrice = priceData[priceData.length - 1].close;
      const vqData = timeSeriesService.calculateVolatilityQuotient(priceData);
      const healthData = timeSeriesService.calculateHealthIndicator(priceData, vqData);
      
      const positionData = timeSeriesService.calculatePositionSize(
        accountSize,
        riskPercent,
        currentPrice,
        vqData.stopLossPrice
      );
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          assetType: type,
          currentPrice,
          vq: vqData,
          health: healthData,
          position: positionData,
          recommendation: healthData.recommendation,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Auto position error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  // Batch analyze multiple symbols
  app.post('/api/ai-trader/batch-analyze', async (req: any, res: any) => {
    try {
      const { symbols } = req.body;
      
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Please provide an array of symbols'
        });
      }
      
      console.log(`📊 Batch analysis for ${symbols.length} symbols`);
      
      const results = [];
      for (const symbol of symbols.slice(0, 10)) {
        try {
          const ssiData = await timeSeriesService.getStockStateIndicator(symbol);
          results.push({
            success: true,
            ...ssiData
          });
        } catch (error: any) {
          results.push({
            success: false,
            symbol: symbol.toUpperCase(),
            error: error.message
          });
        }
      }
      
      res.json({
        success: true,
        data: results,
        analyzedCount: results.filter(r => r.success).length,
        totalRequested: symbols.length
      });
    } catch (error: any) {
      console.error('Batch analysis error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  console.log('✅ Time Series AI routes registered');
  console.log('✅ AI Trader routes registered (VQ, Health, SSI, Position Sizing)');
}

export default router;
