import { Router } from 'express';
import { hfcApexEngine, SevenGateAnalysis } from './hfc-apex-engine';
import { Candle } from './strategy/types';
import { predictiveSignalEngine, PredictiveSnapshot } from './predictive-signal-engine';

interface EnhancedAnalysis extends SevenGateAnalysis {
  predictive?: PredictiveSnapshot;
}

const router = Router();

async function fetchNewsHeadlines(symbol: string): Promise<string[]> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=5`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const news = data.news || [];
    return news.slice(0, 5).map((n: any) => n.title || '').filter((t: string) => t.length > 0);
  } catch {
    return [];
  }
}

const WATCHLIST_SYMBOLS = [
  // Major Tech
  'AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN', 'INTC', 'CRM',
  'ORCL', 'ADBE', 'NFLX', 'PYPL', 'SQ', 'SHOP', 'SNOW', 'NET', 'CRWD', 'DDOG',
  // High-Volume Momentum
  'BITF', 'NIO', 'PLTR', 'SOFI', 'RIVN', 'LCID', 'COIN', 'MARA', 'RIOT', 'HOOD',
  'GME', 'AMC', 'BBBY', 'BB', 'NOK', 'WISH', 'CLOV', 'SPCE', 'TLRY', 'SNDL',
  // Financials
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'V', 'MA', 'AXP', 'BLK',
  // Healthcare & Biotech
  'JNJ', 'PFE', 'MRNA', 'BNTX', 'UNH', 'CVS', 'ABBV', 'LLY', 'MRK', 'BMY',
  // Energy & Materials
  'XOM', 'CVX', 'OXY', 'SLB', 'COP', 'EOG', 'HAL', 'DVN', 'FCX', 'NEM',
  // Consumer & Retail
  'WMT', 'TGT', 'COST', 'HD', 'LOW', 'MCD', 'SBUX', 'NKE', 'DIS', 'ABNB',
  // Industrials & Transport
  'BA', 'CAT', 'DE', 'UPS', 'FDX', 'GE', 'RTX', 'LMT', 'HON', 'MMM',
  // ETFs & Index Trackers
  'SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'ARKK', 'XLF', 'XLE', 'XLK', 'XBI',
  // Crypto Exposed
  'MSTR', 'GBTC', 'BITO', 'CLSK', 'HUT', 'BTBT', 'SOS', 'CAN', 'EBON', 'ARBK'
];

const yahooSymbolMap: Record<string, string> = {
  'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SOL': 'SOL-USD',
  'EURUSD': 'EURUSD=X', 'GBPUSD': 'GBPUSD=X', 'USDJPY': 'USDJPY=X',
  'GOLD': 'GC=F', 'OIL': 'CL=F', 'ES': 'ES=F', 'NQ': 'NQ=F'
};

async function fetchCandleData(symbol: string, interval: string, range: string): Promise<Candle[]> {
  const yahooSymbol = yahooSymbolMap[symbol] || symbol;
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result?.timestamp || !result?.indicators?.quote?.[0]) return [];
    
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    const candles: Candle[] = [];
    
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open[i] != null && quote.close[i] != null) {
        candles.push({
          time: timestamps[i] * 1000,
          open: quote.open[i],
          high: quote.high[i] || quote.open[i],
          low: quote.low[i] || quote.open[i],
          close: quote.close[i],
          volume: quote.volume[i] || 0
        });
      }
    }
    
    return candles;
  } catch (error) {
    console.error(`Failed to fetch ${symbol} ${interval} candles:`, error);
    return [];
  }
}

router.get('/scan', async (req, res) => {
  try {
    const symbols = (req.query.symbols as string)?.split(',') || WATCHLIST_SYMBOLS;
    const userId = req.query.userId as string | undefined;
    const results: SevenGateAnalysis[] = [];

    for (const symbol of symbols.slice(0, 50)) {
      try {
        const [candles1m, candles5m, candles15m, candles1h, candlesDaily] = await Promise.all([
          fetchCandleData(symbol, '1m', '1d'),
          fetchCandleData(symbol, '5m', '5d'),
          fetchCandleData(symbol, '15m', '5d'),
          fetchCandleData(symbol, '1h', '1mo'),
          fetchCandleData(symbol, '1d', '6mo')
        ]);

        if (candles1m.length > 0) {
          let analysis: EnhancedAnalysis = await hfcApexEngine.analyze7Gates(
            symbol, candles1m, candles5m, candles15m, candles1h, candlesDaily, userId
          );
          
          if (analysis.signalType !== 'GATE_LOCKED' && analysis.signalType !== 'WAIT') {
            const headlines = await fetchNewsHeadlines(symbol);
            if (headlines.length > 0) {
              analysis = await hfcApexEngine.applySentimentGateLock(analysis, headlines);
            }
          }
          
          if (candles5m.length >= 10) {
            const predictiveSnapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
              symbol, 
              candles5m.map(c => ({ ...c }))
            );
            (analysis as any).predictive = {
              neuralIndex: predictiveSnapshot.neuralIndex.direction,
              neuralConfidence: predictiveSnapshot.neuralIndex.confidence,
              completeAgreement: predictiveSnapshot.neuralIndex.completeAgreement,
              doubleConfirmed: predictiveSnapshot.doubleConfirmation.confirmed,
              doubleConfirmationScore: predictiveSnapshot.doubleConfirmation.score,
              predictedHigh: predictiveSnapshot.predictedRange.predictedHigh,
              predictedLow: predictiveSnapshot.predictedRange.predictedLow,
              maCrossover: predictiveSnapshot.predictedMAs.crossovers.shortMediumCross,
              trendStrength: predictiveSnapshot.trendStrength.overallStrength,
              overallSignal: predictiveSnapshot.overallSignal,
              liquiditySweep: {
                status: predictiveSnapshot.liquiditySweep.status,
                gate1Passed: predictiveSnapshot.liquiditySweep.gate1Passed,
                gate2Passed: predictiveSnapshot.liquiditySweep.gate2Passed,
                gate3Passed: predictiveSnapshot.liquiditySweep.gate3Passed,
                swingLow: predictiveSnapshot.liquiditySweep.swingLow,
                volumeMultiplier: predictiveSnapshot.liquiditySweep.volumeMultiplier,
                isConsolidating: predictiveSnapshot.liquiditySweep.isConsolidating,
                isWeakSweep: predictiveSnapshot.liquiditySweep.isWeakSweep,
                targetFVG: predictiveSnapshot.liquiditySweep.targetFVG,
                reasons: predictiveSnapshot.liquiditySweep.reasons
              }
            };
          }
          
          results.push(analysis);
        }
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
      }
    }

    results.sort((a, b) => b.totalScore - a.totalScore);

    const aplusSignals = results.filter(r => r.signalType === 'A+_ENTRY');
    const entrySignals = results.filter(r => r.signalType === 'ENTRY');
    const waitSignals = results.filter(r => r.signalType === 'WAIT');
    const lockedSignals = results.filter(r => r.signalType === 'GATE_LOCKED');

    res.json({
      success: true,
      data: {
        timestamp: Date.now(),
        total: results.length,
        summary: {
          aplus: aplusSignals.length,
          entry: entrySignals.length,
          wait: waitSignals.length,
          locked: lockedSignals.length
        },
        signals: results
      }
    });
  } catch (error) {
    console.error('HFC Apex scan error:', error);
    res.status(500).json({ success: false, error: 'Failed to run scan' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.query.userId as string | undefined;

    const [candles1m, candles5m, candles15m, candles1h, candlesDaily] = await Promise.all([
      fetchCandleData(symbol, '1m', '1d'),
      fetchCandleData(symbol, '5m', '5d'),
      fetchCandleData(symbol, '15m', '5d'),
      fetchCandleData(symbol, '1h', '1mo'),
      fetchCandleData(symbol, '1d', '6mo')
    ]);

    if (candles1m.length === 0) {
      return res.status(404).json({ success: false, error: 'No market data available' });
    }

    let analysis: EnhancedAnalysis = await hfcApexEngine.analyze7Gates(
      symbol, candles1m, candles5m, candles15m, candles1h, candlesDaily, userId
    );

    const headlines = await fetchNewsHeadlines(symbol);
    if (headlines.length > 0) {
      analysis = await hfcApexEngine.applySentimentGateLock(analysis, headlines);
    }

    if (candles5m.length >= 10) {
      const predictiveSnapshot = await predictiveSignalEngine.generatePredictiveSnapshot(
        symbol, 
        candles5m.map(c => ({ ...c }))
      );
      (analysis as any).predictive = {
        neuralIndex: predictiveSnapshot.neuralIndex.direction,
        neuralConfidence: predictiveSnapshot.neuralIndex.confidence,
        completeAgreement: predictiveSnapshot.neuralIndex.completeAgreement,
        doubleConfirmed: predictiveSnapshot.doubleConfirmation.confirmed,
        doubleConfirmationScore: predictiveSnapshot.doubleConfirmation.score,
        predictedHigh: predictiveSnapshot.predictedRange.predictedHigh,
        predictedLow: predictiveSnapshot.predictedRange.predictedLow,
        maCrossover: predictiveSnapshot.predictedMAs.crossovers.shortMediumCross,
        trendStrength: predictiveSnapshot.trendStrength.overallStrength,
        overallSignal: predictiveSnapshot.overallSignal,
        liquiditySweep: {
          status: predictiveSnapshot.liquiditySweep.status,
          gate1Passed: predictiveSnapshot.liquiditySweep.gate1Passed,
          gate2Passed: predictiveSnapshot.liquiditySweep.gate2Passed,
          gate3Passed: predictiveSnapshot.liquiditySweep.gate3Passed,
          swingLow: predictiveSnapshot.liquiditySweep.swingLow,
          volumeMultiplier: predictiveSnapshot.liquiditySweep.volumeMultiplier,
          isConsolidating: predictiveSnapshot.liquiditySweep.isConsolidating,
          isWeakSweep: predictiveSnapshot.liquiditySweep.isWeakSweep,
          targetFVG: predictiveSnapshot.liquiditySweep.targetFVG,
          reasons: predictiveSnapshot.liquiditySweep.reasons
        }
      };
    }

    const auditReport = hfcApexEngine.generateAuditReport(analysis);

    res.json({
      success: true,
      data: {
        analysis,
        auditReport
      }
    });
  } catch (error) {
    console.error('HFC Apex analyze error:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze symbol' });
  }
});

router.post('/sentiment-check', async (req, res) => {
  try {
    const { symbol, headlines, analysis } = req.body;

    if (!symbol || !headlines || !analysis) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const updatedAnalysis = await hfcApexEngine.applySentimentGateLock(analysis, headlines);

    res.json({
      success: true,
      data: updatedAnalysis
    });
  } catch (error) {
    console.error('Sentiment check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check sentiment' });
  }
});

router.get('/circuit-breaker/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const status = hfcApexEngine.getCircuitBreakerStatus(userId);

    res.json({
      success: true,
      data: {
        userId,
        status: status || { isPaused: false, dailyDrawdown: 0, trades: [] }
      }
    });
  } catch (error) {
    console.error('Circuit breaker status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get circuit breaker status' });
  }
});

router.post('/circuit-breaker/update', async (req, res) => {
  try {
    const { userId, tradePnL, accountBalance } = req.body;

    if (!userId || tradePnL === undefined || !accountBalance) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    hfcApexEngine.updateCircuitBreaker(userId, tradePnL, accountBalance);
    const status = hfcApexEngine.getCircuitBreakerStatus(userId);

    res.json({
      success: true,
      data: {
        userId,
        status
      }
    });
  } catch (error) {
    console.error('Circuit breaker update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update circuit breaker' });
  }
});

router.get('/system-health', async (req, res) => {
  try {
    const testSymbol = 'SPY';
    const candles = await fetchCandleData(testSymbol, '1m', '1d');
    const dataFeedHealthy = candles.length > 0;
    const latestPrice = candles[candles.length - 1]?.close || 0;
    const dataAge = candles.length > 0 ? Date.now() - candles[candles.length - 1].time : Infinity;

    res.json({
      success: true,
      data: {
        timestamp: Date.now(),
        dataFeed: {
          status: dataFeedHealthy ? 'healthy' : 'degraded',
          latency: dataAge < 120000 ? 'low' : dataAge < 300000 ? 'medium' : 'high',
          testSymbol,
          latestPrice,
          dataAge: Math.round(dataAge / 1000)
        },
        engine: {
          status: 'operational',
          version: 'v11.0 Apex',
          features: ['7-Gate Validation', 'Liquidity Sweep Detection', 'AI Sentiment Filter', 'Circuit Breakers', 'Audit Trail']
        }
      }
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      data: {
        dataFeed: { status: 'error' },
        engine: { status: 'error' }
      }
    });
  }
});

export default router;
