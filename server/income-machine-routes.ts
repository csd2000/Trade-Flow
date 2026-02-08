import { Router } from 'express';
import { incomeMachine } from './income-machine-service';
import { polygonOptionsService } from './polygon-options-service';

const router = Router();

router.get('/status', async (req, res) => {
  try {
    const status = incomeMachine.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get scanner status' });
  }
});

router.post('/scan', async (req, res) => {
  try {
    const { scanType = 'both' } = req.body;
    
    if (!['calls', 'puts', 'both'].includes(scanType)) {
      return res.status(400).json({ error: 'Invalid scan type. Use: calls, puts, or both' });
    }

    const result = await incomeMachine.runFullScan(scanType);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Scan already in progress') {
      return res.status(409).json({ error: 'Scan already in progress' });
    }
    res.status(500).json({ error: 'Scan failed' });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const result = await incomeMachine.getLatestScan();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get latest scan' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const analysis = await incomeMachine.analyzeSymbol(symbol.toUpperCase());
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/top-picks', async (req, res) => {
  try {
    const { opportunities, topPicks } = await incomeMachine.getLatestScan();
    
    const topCalls = opportunities
      .filter(o => o.optionType === 'call')
      .slice(0, 5);
    
    const topPuts = opportunities
      .filter(o => o.optionType === 'put')
      .slice(0, 5);

    res.json({
      topCall: topPicks.call,
      topPut: topPicks.put,
      bestCalls: topCalls,
      bestPuts: topPuts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get top picks' });
  }
});

// =====================================================
// 70-DELTA HIGH PROBABILITY SCANNER (Polygon.io)
// =====================================================

router.get('/70-delta/status', async (req, res) => {
  try {
    const status = polygonOptionsService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get 70-delta scanner status' });
  }
});

router.get('/70-delta/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { expirationDate } = req.query;
    const setups = await polygonOptionsService.find70DeltaContracts(
      symbol.toUpperCase(), 
      expirationDate as string | undefined
    );
    
    const qualified = setups.filter(s => s.isQualified);
    const bestCall = setups.find(s => s.optionType === 'call' && s.isQualified);
    const bestPut = setups.find(s => s.optionType === 'put' && s.isQualified);

    res.json({
      symbol: symbol.toUpperCase(),
      totalSetups: setups.length,
      qualifiedSetups: qualified.length,
      bestCall,
      bestPut,
      allSetups: setups
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze symbol for 70-delta setups' });
  }
});

router.post('/70-delta/scan', async (req, res) => {
  try {
    const { tickers } = req.body;
    
    const defaultTickers = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'UNH',
      'SPY', 'QQQ', 'IWM', 'DIA', 'XLF', 'XLE', 'XLK', 'XLV', 'GLD', 'SLV'
    ];

    const tickersToScan = tickers || defaultTickers;
    const result = await polygonOptionsService.runHighProbabilityScan(tickersToScan);
    
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Scan already in progress') {
      return res.status(409).json({ error: 'Scan already in progress' });
    }
    res.status(500).json({ error: 'High probability scan failed' });
  }
});

router.get('/positions', async (req, res) => {
  try {
    const positions = await polygonOptionsService.getOpenPositions();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get positions' });
  }
});

router.post('/positions/open', async (req, res) => {
  try {
    const { setup, quantity = 1 } = req.body;
    
    if (!setup) {
      return res.status(400).json({ error: 'Setup data required' });
    }

    const position = await polygonOptionsService.openPosition(setup, quantity);
    res.json(position);
  } catch (error) {
    res.status(500).json({ error: 'Failed to open position' });
  }
});

router.post('/positions/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, closePrice } = req.body;
    
    if (!['profit_target', 'time_exit', 'stop_loss', 'manual'].includes(reason)) {
      return res.status(400).json({ error: 'Invalid close reason' });
    }

    const result = await polygonOptionsService.closePosition(parseInt(id), reason, closePrice);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to close position' });
  }
});

router.post('/positions/update', async (req, res) => {
  try {
    const results = await polygonOptionsService.updatePositions();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update positions' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const { unreadOnly = 'true' } = req.query;
    const alerts = await polygonOptionsService.getAlerts(unreadOnly === 'true');
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

router.post('/alerts/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    await polygonOptionsService.markAlertRead(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark alert as read' });
  }
});

// =====================================================
// UNDER $5 STOCKS HIGH-DELTA SCANNER
// =====================================================

router.get('/under5/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { expirationDate } = req.query;
    const setups = await polygonOptionsService.findUnder5Setups(
      symbol.toUpperCase(), 
      expirationDate as string | undefined
    );
    
    const qualified = setups.filter(s => s.isQualified);
    const best = qualified[0] || null;

    res.json({
      symbol: symbol.toUpperCase(),
      totalSetups: setups.length,
      qualifiedSetups: qualified.length,
      bestSetup: best,
      allSetups: setups
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze under-$5 stock' });
  }
});

router.post('/under5/scan', async (req, res) => {
  try {
    const result = await polygonOptionsService.scanUnder5Stocks();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan under-$5 stocks' });
  }
});

// =====================================================
// OPTIONS ALGORITHM - AUTO PULL TODAY'S TOP PICKS
// Uses real Polygon.io data with exact trade criteria
// =====================================================

router.get('/todays-picks', async (req, res) => {
  try {
    console.log('🎯 OPTIONS ALGORITHM: Fetching today\'s top opportunities...');
    const result = await polygonOptionsService.getTodaysTopPicks();
    res.json(result);
  } catch (error) {
    console.error('Error fetching today\'s picks:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s top picks' });
  }
});

router.get('/realtime/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log(`📊 Real-time analysis for ${symbol.toUpperCase()}`);
    const result = await polygonOptionsService.analyzeSymbolRealTime(symbol.toUpperCase());
    res.json(result);
  } catch (error) {
    console.error('Error in real-time analysis:', error);
    res.status(500).json({ error: 'Failed to analyze symbol' });
  }
});

export default router;
