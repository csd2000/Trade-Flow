import { Router } from 'express';
import { darkPoolAIService } from './dark-pool-ai-service';
import { orderFlowIntelligence, OrderFlowData, PressureMeterState } from './strategy/orderflow';

const router = Router();

const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B',
  'JPM', 'V', 'MA', 'UNH', 'HD', 'PG', 'JNJ', 'XOM', 'BAC', 'WMT',
  'COST', 'DIS', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'CSCO'
];

router.get('/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const limit = parseInt(req.query.limit as string) || 500;
    const trades = await darkPoolAIService.getDarkPoolTrades(symbol.toUpperCase(), limit);
    res.json({
      symbol: symbol.toUpperCase(),
      totalTrades: trades.length,
      trades,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Dark pool trades error:', error);
    const message = error?.message || 'Failed to fetch dark pool trades';
    const isApiKeyError = message.includes('POLYGON_API_KEY');
    res.status(isApiKeyError ? 503 : 500).json({ error: message, requiresApiKey: isApiKeyError });
  }
});

router.get('/summary/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const summary = await darkPoolAIService.getDarkPoolSummary(symbol.toUpperCase());
    res.json(summary);
  } catch (error: any) {
    console.error('Dark pool summary error:', error);
    const message = error?.message || 'Failed to fetch dark pool summary';
    const isApiKeyError = message.includes('POLYGON_API_KEY');
    res.status(isApiKeyError ? 503 : 500).json({ error: message, requiresApiKey: isApiKeyError });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`🧠 AI analyzing institutional activity for ${symbol}...`);
    const analysis = await darkPoolAIService.analyzeInstitutionalActivity(symbol.toUpperCase());
    res.json(analysis);
  } catch (error: any) {
    console.error('Dark pool analysis error:', error);
    const message = error?.message || 'Failed to analyze institutional activity';
    const isApiKeyError = message.includes('POLYGON_API_KEY');
    res.status(isApiKeyError ? 503 : 500).json({ error: message, requiresApiKey: isApiKeyError });
  }
});

router.get('/scan', async (req, res) => {
  try {
    const symbolsParam = req.query.symbols as string;
    const symbols = symbolsParam 
      ? symbolsParam.split(',').map(s => s.trim().toUpperCase())
      : TOP_STOCKS;
    
    console.log(`🔍 Starting dark pool scan for ${symbols.length} symbols...`);
    const scan = await darkPoolAIService.scanMarket(symbols);
    res.json(scan);
  } catch (error: any) {
    console.error('Dark pool scan error:', error);
    const message = error?.message || 'Failed to scan market';
    const isApiKeyError = message.includes('POLYGON_API_KEY');
    res.status(isApiKeyError ? 503 : 500).json({ error: message, requiresApiKey: isApiKeyError });
  }
});

router.get('/watchlist', async (_req, res) => {
  try {
    const scan = await darkPoolAIService.scanMarket(TOP_STOCKS.slice(0, 10));
    res.json({
      symbols: TOP_STOCKS.slice(0, 10),
      signals: scan.activeSignals,
      sentiment: scan.marketSentiment,
      timestamp: scan.timestamp
    });
  } catch (error: any) {
    console.error('Dark pool watchlist error:', error);
    const message = error?.message || 'Failed to get watchlist';
    const isApiKeyError = message.includes('POLYGON_API_KEY');
    res.status(isApiKeyError ? 503 : 500).json({ error: message, requiresApiKey: isApiKeyError });
  }
});

export default router;
