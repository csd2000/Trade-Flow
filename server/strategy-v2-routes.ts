import { Router } from 'express';
import { StrategyEngineV2, EngineConfig, getSessionInfo, DEFAULT_CONFIG } from './strategy';

const router = Router();

const engines: Map<string, StrategyEngineV2> = new Map();

function getOrCreateEngine(symbol: string, config?: Partial<EngineConfig>): StrategyEngineV2 {
  const key = symbol.toUpperCase();
  if (!engines.has(key)) {
    engines.set(key, new StrategyEngineV2(config));
  }
  return engines.get(key)!;
}

async function fetchCandleData(symbol: string, timeframe: string, limit: number = 100): Promise<any[]> {
  try {
    const interval = timeframe === '1h' ? '60m' : 
                     timeframe === '15m' ? '15m' : 
                     timeframe === '5m' ? '5m' : 
                     timeframe === '3m' ? '5m' : '1m';
    
    const range = timeframe === '1h' ? '5d' : 
                  timeframe === '15m' ? '2d' : '1d';
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) {
      console.log(`Yahoo Finance error for ${symbol}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
      return [];
    }
    
    const { timestamp } = result;
    const quote = result.indicators.quote[0];
    
    const candles = [];
    for (let i = 0; i < timestamp.length; i++) {
      if (quote.open[i] !== null && quote.high[i] !== null && 
          quote.low[i] !== null && quote.close[i] !== null) {
        candles.push({
          time: timestamp[i] * 1000,
          open: quote.open[i],
          high: quote.high[i],
          low: quote.low[i],
          close: quote.close[i],
          volume: quote.volume?.[i] || 0
        });
      }
    }
    
    return candles.slice(-limit);
  } catch (error) {
    console.error(`Error fetching ${symbol} data:`, error);
    return [];
  }
}

router.get('/config', (_req, res) => {
  res.json({
    defaultConfig: DEFAULT_CONFIG,
    availableTimeframes: {
      htf: ['1h', '4h'],
      mtf: ['15m', '30m'],
      ltf: ['1m', '3m', '5m']
    },
    thresholds: {
      icc: { min: 4, max: 10, recommended: 6 },
      wick: { min: 3, max: 10, recommended: 5 },
      orb: { min: 3, max: 10, recommended: 5 }
    }
  });
});

router.post('/config/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const config = req.body as Partial<EngineConfig>;
    
    const engine = getOrCreateEngine(symbol);
    engine.updateConfig(config);
    
    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      config: engine.getConfig()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const htfTimeframe = (req.query.htf as string) || '1h';
    const mtfTimeframe = (req.query.mtf as string) || '15m';
    const ltfTimeframe = (req.query.ltf as string) || '1m';
    
    console.log(`Strategy V2 analyzing ${symbol} (HTF:${htfTimeframe} MTF:${mtfTimeframe} LTF:${ltfTimeframe})`);
    
    const [htfCandles, mtfCandles, ltfCandles] = await Promise.all([
      fetchCandleData(symbol, htfTimeframe, 100),
      fetchCandleData(symbol, mtfTimeframe, 100),
      fetchCandleData(symbol, ltfTimeframe, 100)
    ]);
    
    if (mtfCandles.length < 30) {
      return res.status(400).json({ 
        error: 'Insufficient data',
        details: `Only ${mtfCandles.length} MTF candles available`
      });
    }
    
    const engine = getOrCreateEngine(symbol, {
      htfTimeframe,
      mtfTimeframe,
      ltfTimeframe
    });
    
    const lastPrice = mtfCandles[mtfCandles.length - 1]?.close || 0;
    const sessionInfo = getSessionInfo(Date.now());
    
    const result = engine.process({
      symbol: symbol.toUpperCase(),
      time: Date.now(),
      candlesByTf: {
        [htfTimeframe]: htfCandles,
        [mtfTimeframe]: mtfCandles,
        [ltfTimeframe]: ltfCandles
      },
      lastPrice,
      sessionInfo
    });
    
    res.json({
      symbol: symbol.toUpperCase(),
      timestamp: new Date().toISOString(),
      timeframes: { htf: htfTimeframe, mtf: mtfTimeframe, ltf: ltfTimeframe },
      lastPrice,
      sessionInfo,
      signal: result.signal,
      exits: result.exits,
      debug: {
        marketState: result.stateDebug.marketState,
        structure: {
          trend: result.stateDebug.structure.currentTrend,
          swingHighCount: result.stateDebug.structure.swingHighs.length,
          swingLowCount: result.stateDebug.structure.swingLows.length,
          recentBreaks: result.stateDebug.structure.recentBreaks.slice(-3),
          pullback: result.stateDebug.structure.pullback
        },
        liquidity: {
          pdh: result.stateDebug.liquidity.pdh,
          pdl: result.stateDebug.liquidity.pdl,
          sessionHigh: result.stateDebug.liquidity.sessionHigh,
          sessionLow: result.stateDebug.liquidity.sessionLow,
          recentSweeps: result.stateDebug.liquidity.recentSweeps.slice(-3),
          levelCount: result.stateDebug.liquidity.levels.length
        },
        zones: {
          fvgCount: result.stateDebug.zones.fvgZones.length,
          wickCount: result.stateDebug.zones.wickZones.length,
          activeFVG: result.stateDebug.zones.activeFVG,
          activeWickZone: result.stateDebug.zones.activeWickZone,
          orbBox: result.stateDebug.zones.orbBox
        },
        gateScore: result.stateDebug.gateScore,
        displacement: result.stateDebug.displacement,
        mismatch: result.stateDebug.mismatch,
        logs: result.stateDebug.logs
      }
    });
  } catch (error: any) {
    console.error('Strategy V2 error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { symbols, htf, mtf, ltf } = req.body;
    const symbolList = symbols || ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'AMZN'];
    
    const htfTimeframe = htf || '1h';
    const mtfTimeframe = mtf || '15m';
    const ltfTimeframe = ltf || '1m';
    
    console.log(`Strategy V2 scanning ${symbolList.length} symbols...`);
    
    const results = await Promise.allSettled(
      symbolList.map(async (symbol: string) => {
        try {
          const [htfCandles, mtfCandles, ltfCandles] = await Promise.all([
            fetchCandleData(symbol, htfTimeframe, 100),
            fetchCandleData(symbol, mtfTimeframe, 100),
            fetchCandleData(symbol, ltfTimeframe, 100)
          ]);
          
          if (mtfCandles.length < 30) {
            return { symbol, error: 'Insufficient data' };
          }
          
          const engine = getOrCreateEngine(symbol, {
            htfTimeframe,
            mtfTimeframe,
            ltfTimeframe
          });
          
          const lastPrice = mtfCandles[mtfCandles.length - 1]?.close || 0;
          const sessionInfo = getSessionInfo(Date.now());
          
          const result = engine.process({
            symbol: symbol.toUpperCase(),
            time: Date.now(),
            candlesByTf: {
              [htfTimeframe]: htfCandles,
              [mtfTimeframe]: mtfCandles,
              [ltfTimeframe]: ltfCandles
            },
            lastPrice,
            sessionInfo
          });
          
          return {
            symbol: symbol.toUpperCase(),
            lastPrice,
            signal: result.signal,
            gateScore: result.stateDebug.gateScore?.normalized || 0,
            marketState: result.stateDebug.marketState,
            hasActiveSetup: result.signal !== null
          };
        } catch (err: any) {
          return { symbol, error: err.message };
        }
      })
    );
    
    const processed = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);
    
    const signals = processed.filter(p => p.signal);
    const errors = processed.filter(p => p.error);
    
    res.json({
      timestamp: new Date().toISOString(),
      timeframes: { htf: htfTimeframe, mtf: mtfTimeframe, ltf: ltfTimeframe },
      summary: {
        total: symbolList.length,
        analyzed: processed.length - errors.length,
        signalsFound: signals.length,
        errors: errors.length
      },
      signals: signals.sort((a, b) => (b.gateScore || 0) - (a.gateScore || 0)),
      allResults: processed
    });
  } catch (error: any) {
    console.error('Strategy V2 scan error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/active/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const engine = engines.get(symbol.toUpperCase());
    
    if (!engine) {
      return res.json({ symbol: symbol.toUpperCase(), activeSignal: null });
    }
    
    res.json({
      symbol: symbol.toUpperCase(),
      activeSignal: engine.getActiveSignal(),
      config: engine.getConfig()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const engine = engines.get(symbol.toUpperCase());
    
    if (engine) {
      engine.reset();
    }
    
    res.json({ success: true, symbol: symbol.toUpperCase() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
