/**
 * AI Profit Studio API Routes
 * Provides endpoints for stock scanning, prediction, and analysis
 */

import { Router, type Request, type Response } from 'express';
import { db } from './db';
import { aiStocks, aiPredictions, aiSignals, aiScans, aiWatchlists, aiWatchlistItems,
         insertAiWatchlistSchema, insertAiWatchlistItemSchema } from '../shared/schema';
import { getStockQuote, getHistoricalData, getPopularStocks, getAllScanStocks } from './ai-profit-studio/stock-data.service';
import { generatePrediction, scanStocks } from './ai-profit-studio/ai-prediction.service';
import { eq, desc } from 'drizzle-orm';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';

const router = Router();

/**
 * GET /api/ai-profit/quote/:symbol
 * Get real-time quote for a stock
 */
router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const quote = await getStockQuote(symbol.toUpperCase());
    res.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch stock quote' });
  }
});

/**
 * POST /api/ai-profit/predict
 * Generate AI prediction for stock, crypto, or forex
 */
router.post('/predict', async (req: Request, res: Response) => {
  try {
    const { symbol, assetType = 'stock' } = req.body;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let currentPrice: number;
    let bars: any[];
    
    if (assetType === 'crypto') {
      // Fetch crypto data from CoinGecko (no geographic restrictions)
      const coinIdMap: Record<string, string> = {
        'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
        'DOGE': 'dogecoin', 'ADA': 'cardano', 'DOT': 'polkadot', 'AVAX': 'avalanche-2',
        'LINK': 'chainlink', 'MATIC': 'matic-network', 'UNI': 'uniswap', 'SHIB': 'shiba-inu',
        'LTC': 'litecoin', 'ATOM': 'cosmos', 'XLM': 'stellar', 'NEAR': 'near',
        'APT': 'aptos', 'ARB': 'arbitrum', 'OP': 'optimism', 'FIL': 'filecoin'
      };
      const coinId = coinIdMap[cleanSymbol] || cleanSymbol.toLowerCase();
      
      try {
        // Get current price and market data from CoinGecko
        const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`);
        const priceData = await priceRes.json();
        if (!priceData[coinId]) {
          throw new Error(`Unknown crypto symbol: ${cleanSymbol}`);
        }
        currentPrice = priceData[coinId].usd;
        
        // Get historical OHLC data from CoinGecko
        const histRes = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=90`);
        const ohlcData = await histRes.json();
        if (!Array.isArray(ohlcData) || ohlcData.length < 20) {
          throw new Error('Insufficient historical data');
        }
        
        bars = ohlcData.map((k: any) => ({
          date: new Date(k[0]).toISOString().split('T')[0],
          open: k[1],
          high: k[2],
          low: k[3],
          close: k[4],
          volume: 0  // CoinGecko OHLC doesn't include volume
        }));
      } catch (err: any) {
        console.error('CoinGecko API error:', err);
        return res.status(400).json({ error: `Crypto data error: ${err.message || 'Failed to fetch'}. Try symbols like BTC, ETH, SOL.` });
      }
    } else if (assetType === 'forex') {
      // Fetch forex data from Yahoo Finance
      const forexSymbol = cleanSymbol.includes('=X') ? cleanSymbol : `${cleanSymbol}=X`;
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${forexSymbol}?interval=1d&range=6mo`);
        const data = await response.json();
        const result = data.chart?.result?.[0];
        if (!result) throw new Error('No forex data');
        
        currentPrice = result.meta.regularMarketPrice;
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};
        
        bars = timestamps.map((ts: number, i: number) => ({
          date: new Date(ts * 1000).toISOString().split('T')[0],
          open: quote.open?.[i] || currentPrice,
          high: quote.high?.[i] || currentPrice,
          low: quote.low?.[i] || currentPrice,
          close: quote.close?.[i] || currentPrice,
          volume: quote.volume?.[i] || 0
        })).filter((b: any) => b.close);
      } catch (err) {
        console.error('Forex API error:', err);
        return res.status(500).json({ error: 'Failed to fetch forex data' });
      }
    } else {
      // Stock data - use Yahoo Finance (primary) with fallback
      const quote = await getStockQuote(cleanSymbol);
      currentPrice = quote.price;
      bars = await getHistoricalData(cleanSymbol, 100);
    }
    
    if (!bars || bars.length < 20) {
      return res.status(400).json({ error: 'Insufficient historical data for analysis' });
    }
    
    // Generate prediction
    const prediction = generatePrediction(cleanSymbol, currentPrice, bars);
    
    // Save prediction to database
    await db.insert(aiPredictions).values({
      symbol: prediction.symbol,
      targetDate: new Date(Date.now() + prediction.timeframeDays * 24 * 60 * 60 * 1000),
      predictedReturn: prediction.predictedReturn.toString(),
      direction: prediction.direction,
      confidence: prediction.confidence.toString(),
      profitPotential: prediction.profitPotential.toString(),
      riskLevel: prediction.riskLevel.toString(),
      profitRiskRatio: prediction.profitRiskRatio.toString(),
      timeframeDays: prediction.timeframeDays,
      meetsCriteria: prediction.meetsCriteria,
      technicalScore: prediction.technicalScore.toString(),
      fundamentalScore: prediction.fundamentalScore.toString(),
      sentimentScore: prediction.sentimentScore.toString(),
      features: prediction.indicators as any,
    });
    
    res.json(prediction);
  } catch (error) {
    console.error('Error generating prediction:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
});

/**
 * POST /api/ai-profit/scan
 * Scan stocks and return top signals meeting 3 strict criteria
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { symbolList, useFullMarket } = req.body;
    const startTime = Date.now();
    
    // Determine which stocks to scan
    const symbols = symbolList || (useFullMarket ? getAllScanStocks() : getPopularStocks());
    
    console.log(`🔍 Starting scan of ${symbols.length} stocks...`);
    
    // Scan ALL stocks in batches for performance
    const batchSize = 50;
    const allPredictions = [];
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const predictions = await scanStocks(
        batch,
        (sym) => getHistoricalData(sym, 365),
        (sym) => getStockQuote(sym).then(q => q.price)
      );
      allPredictions.push(...predictions);
      
      // Log progress
      if ((i + batchSize) % 500 === 0 || i + batchSize >= symbols.length) {
        console.log(`📊 Progress: ${Math.min(i + batchSize, symbols.length)}/${symbols.length} stocks scanned`);
      }
    }
    
    // Save top signals to database
    for (const pred of allPredictions.slice(0, 10)) {
      await db.insert(aiSignals).values({
        symbol: pred.symbol,
        signalType: pred.direction === 'up' ? 'buy' : 'sell',
        entryPrice: pred.entryPrice.toString(),
        targetPrice: pred.targetPrice.toString(),
        stopLoss: pred.stopLoss.toString(),
        confidence: pred.confidence.toString(),
        compositeScore: (pred.confidence * pred.profitRiskRatio).toString(),
        rsi: pred.indicators.rsi.toString(),
        macd: pred.indicators.macd.toString(),
        macdSignal: pred.indicators.macdSignal.toString(),
        macdHist: pred.indicators.macdHist.toString(),
        ma20: pred.indicators.ma20.toString(),
        ma50: pred.indicators.ma50.toString(),
        bollingerUpper: pred.indicators.bollingerUpper.toString(),
        bollingerLower: pred.indicators.bollingerLower.toString(),
        atr: pred.indicators.atr.toString(),
        reasoning: pred.reasoning,
        isActive: true,
        expiresAt: new Date(Date.now() + pred.timeframeDays * 24 * 60 * 60 * 1000),
      });
    }
    
    const scanDuration = Date.now() - startTime;
    
    // Save scan results
    await db.insert(aiScans).values({
      totalStocksScanned: symbols.length,
      totalDatapoints: symbols.length * 365 * 7, // Approximate datapoints analyzed
      filteredCount: allPredictions.length,
      topSignalsCount: Math.min(10, allPredictions.length),
      scanDurationMs: scanDuration,
      criteria: {
        highProbability: 70,
        maxTimeframeDays: 60,
        minProfitRiskRatio: 1.5,
      } as any,
      results: allPredictions.slice(0, 10) as any,
    });
    
    console.log(`✅ Scan complete! Found ${allPredictions.length} signals meeting criteria in ${scanDuration}ms`);
    
    const topSignalsWithPredictive = await Promise.all(
      allPredictions.slice(0, 10).map(async (pred) => {
        try {
          const candles = await fetchYahooCandles(pred.symbol, '15m', '5d');
          if (candles.length >= 10) {
            const predictive = await predictiveSignalEngine.generatePredictiveSnapshot(pred.symbol, candles);
            return {
              ...pred,
              predictive: {
                neuralIndex: predictive.neuralIndex.direction,
                neuralConfidence: predictive.neuralIndex.confidence,
                completeAgreement: predictive.neuralIndex.completeAgreement,
                doubleConfirmed: predictive.doubleConfirmation.confirmed,
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
              }
            };
          }
        } catch (e) {}
        return pred;
      })
    );

    res.json({
      totalScanned: symbols.length,
      meetingCriteria: allPredictions.length,
      topSignals: topSignalsWithPredictive,
      scanDurationMs: scanDuration,
      criteria: {
        highProbability: '>=70%',
        maxTimeframe: '<60 days',
        minProfitRiskRatio: '>=1.5:1',
      },
    });
  } catch (error) {
    console.error('Error scanning stocks:', error);
    res.status(500).json({ error: 'Failed to scan stocks' });
  }
});

/**
 * GET /api/ai-profit/signals
 * Get active trading signals
 */
router.get('/signals', async (req: Request, res: Response) => {
  try {
    const signals = await db.select()
      .from(aiSignals)
      .where(eq(aiSignals.isActive, true))
      .limit(20);
    
    res.json(signals);
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

/**
 * GET /api/ai-profit/scans
 * Get recent scan results
 */
router.get('/scans', async (req: Request, res: Response) => {
  try {
    const scans = await db.select()
      .from(aiScans)
      .limit(10);
    
    res.json(scans);
  } catch (error) {
    console.error('Error fetching scans:', error);
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

/**
 * GET /api/ai-profit/watchlists
 * Get user's watchlists
 */
router.get('/watchlists', async (req: Request, res: Response) => {
  try {
    // For now, return all watchlists (would filter by userId in production)
    const watchlists = await db.select()
      .from(aiWatchlists)
      .limit(50);
    
    res.json(watchlists);
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    res.status(500).json({ error: 'Failed to fetch watchlists' });
  }
});

/**
 * POST /api/ai-profit/watchlists
 * Create a new watchlist
 */
router.post('/watchlists', async (req: Request, res: Response) => {
  try {
    const validatedData = insertAiWatchlistSchema.parse(req.body);
    
    const [watchlist] = await db.insert(aiWatchlists)
      .values(validatedData)
      .returning();
    
    res.json(watchlist);
  } catch (error) {
    console.error('Error creating watchlist:', error);
    res.status(400).json({ error: 'Failed to create watchlist' });
  }
});

/**
 * GET /api/ai-profit/watchlists/:id/items
 * Get items in a watchlist
 */
router.get('/watchlists/:id/items', async (req: Request, res: Response) => {
  try {
    const watchlistId = parseInt(req.params.id);
    
    const items = await db.select()
      .from(aiWatchlistItems)
      .where(eq(aiWatchlistItems.watchlistId, watchlistId));
    
    res.json(items);
  } catch (error) {
    console.error('Error fetching watchlist items:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist items' });
  }
});

/**
 * POST /api/ai-profit/watchlists/:id/items
 * Add stock to watchlist
 */
router.post('/watchlists/:id/items', async (req: Request, res: Response) => {
  try {
    const watchlistId = parseInt(req.params.id);
    const validatedData = insertAiWatchlistItemSchema.parse({
      ...req.body,
      watchlistId,
    });
    
    const [item] = await db.insert(aiWatchlistItems)
      .values(validatedData)
      .returning();
    
    res.json(item);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(400).json({ error: 'Failed to add to watchlist' });
  }
});

/**
 * DELETE /api/ai-profit/watchlists/:watchlistId/items/:itemId
 * Remove stock from watchlist
 */
router.delete('/watchlists/:watchlistId/items/:itemId', async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(req.params.itemId);
    
    await db.delete(aiWatchlistItems)
      .where(eq(aiWatchlistItems.id, itemId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

/**
 * GET /api/ai-profit/stats
 * Get AI Profit Studio statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get most recent scan ordered by date
    const [latestScan] = await db.select()
      .from(aiScans)
      .orderBy(desc(aiScans.scanDate))
      .limit(1);
    
    const activeSignalsCount = await db.select()
      .from(aiSignals)
      .where(eq(aiSignals.isActive, true));
    
    res.json({
      lastScanDate: latestScan?.scanDate || null,
      totalStocksScanned: latestScan?.totalStocksScanned || 0,
      activeSignals: activeSignalsCount.length,
      topSignalsToday: latestScan?.topSignalsCount || 0,
      scanDuration: latestScan?.scanDurationMs || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
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

export default router;
