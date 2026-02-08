import { Router, Request, Response } from 'express';
import { whaleShieldService } from './whale-shield-service';

const router = Router();

router.get('/snapshot/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const snapshot = await whaleShieldService.getSnapshot(symbol.toUpperCase());
    
    if (!snapshot) {
      return res.status(404).json({ 
        success: false, 
        error: 'Could not fetch Whale Shield data for this symbol' 
      });
    }
    
    res.json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Whale Shield snapshot error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/max-pain/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const snapshot = await whaleShieldService.getSnapshot(symbol.toUpperCase());
    
    if (!snapshot) {
      return res.status(404).json({ 
        success: false, 
        error: 'Could not calculate Max Pain for this symbol' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        symbol: snapshot.symbol,
        maxPain: snapshot.maxPain,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('Max Pain calculation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/pcr/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const snapshot = await whaleShieldService.getSnapshot(symbol.toUpperCase());
    
    if (!snapshot) {
      return res.status(404).json({ 
        success: false, 
        error: 'Could not calculate PCR for this symbol' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        symbol: snapshot.symbol,
        pcr: snapshot.pcr,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('PCR calculation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/magnet-zone/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const result = await whaleShieldService.checkMagnetZone(symbol.toUpperCase());
    
    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Could not check Magnet Zone for this symbol' 
      });
    }
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Magnet Zone check error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/sweep-verify/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const snapshot = await whaleShieldService.getSnapshot(symbol.toUpperCase());
    
    if (!snapshot) {
      return res.status(404).json({ 
        success: false, 
        error: 'Could not verify sweep for this symbol' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        symbol: snapshot.symbol,
        sweepVerification: snapshot.sweepVerification,
        timestamp: snapshot.timestamp
      }
    });
  } catch (error) {
    console.error('Sweep verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { symbols } = req.body;
    const symbolList = symbols || ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'META', 'GOOGL', 'AMZN', 'MSFT'];
    
    const results = await Promise.all(
      symbolList.map(async (symbol: string) => {
        const snapshot = await whaleShieldService.getSnapshot(symbol);
        return snapshot;
      })
    );
    
    const validResults = results.filter(r => r !== null);
    
    const alerts = validResults.filter(r => r.overallAlert !== null);
    const magnetZoneSymbols = validResults.filter(r => r.maxPain.magnetZone);
    const highRisk = validResults.filter(r => r.riskLevel === 'high' || r.riskLevel === 'extreme');
    
    res.json({ 
      success: true, 
      data: {
        timestamp: Date.now(),
        scanned: validResults.length,
        alerts: alerts.length,
        magnetZoneCount: magnetZoneSymbols.length,
        highRiskCount: highRisk.length,
        results: validResults,
        summary: {
          magnetZone: magnetZoneSymbols.map(s => s.symbol),
          bullishOvercrowding: validResults.filter(s => s.pcr.sentiment === 'bullish_overcrowding').map(s => s.symbol),
          bearishOvercrowding: validResults.filter(s => s.pcr.sentiment === 'bearish_overcrowding').map(s => s.symbol)
        }
      }
    });
  } catch (error) {
    console.error('Whale Shield scan error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
