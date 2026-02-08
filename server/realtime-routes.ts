import { Router } from 'express';
import { realTimeMarketService } from './realtime-market-service';

export function registerRealTimeRoutes(app: any) {
  
  app.get('/api/realtime/quote/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`⚡ Real-time quote request for ${symbol}`);
      
      const quote = await realTimeMarketService.getRealTimeQuote(symbol, assetType);
      
      res.json({
        success: true,
        data: quote
      });
    } catch (error: any) {
      console.error('Quote error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  app.get('/api/realtime/history/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const days = parseInt(req.query.days as string) || 90;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`📊 Historical data request for ${symbol}, ${days} days`);
      
      const history = await realTimeMarketService.getHistoricalData(symbol, days, assetType);
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          history,
          count: history.length
        }
      });
    } catch (error: any) {
      console.error('History error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  app.get('/api/realtime/technicals/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`📈 Technicals request for ${symbol}`);
      
      const history = await realTimeMarketService.getHistoricalData(symbol, 90, assetType);
      const technicals = realTimeMarketService.calculateTechnicals(history);
      const quote = await realTimeMarketService.getRealTimeQuote(symbol, assetType);
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          currentPrice: quote.price,
          technicals,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Technicals error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  app.get('/api/realtime/forecast/:symbol', async (req: any, res: any) => {
    try {
      const { symbol } = req.params;
      const assetType = req.query.type as 'stock' | 'crypto' | 'forex' | undefined;
      
      console.log(`🔮 AI Forecast request for ${symbol}`);
      
      const forecast = await realTimeMarketService.generateAIForecast(symbol, assetType);
      
      res.json({
        success: true,
        data: forecast
      });
    } catch (error: any) {
      console.error('Forecast error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  app.get('/api/realtime/market-overview', async (req: any, res: any) => {
    try {
      const overview = await realTimeMarketService.getMarketOverview();
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error: any) {
      console.error('Market overview error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  console.log('✅ Real-Time Market Data routes registered');
}
