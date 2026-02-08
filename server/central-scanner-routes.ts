/**
 * Central Scanner API Routes
 * Handles gate set management and multi-source rule scanning
 */

import { Router, Request, Response } from 'express';
import { centralScannerService, GateSetConfig } from './central-scanner-service';
import { strategyAnalyzerService } from './strategy-analyzer-service';

const router = Router();

/**
 * GET /api/central-scanner/rules
 * List all available trading rules
 */
router.get('/rules', (req: Request, res: Response) => {
  try {
    const rules = centralScannerService.listRules();
    res.json({
      success: true,
      data: rules,
      total: rules.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list rules'
    });
  }
});

/**
 * GET /api/central-scanner/gate-sets
 * List all gate sets (default + custom)
 */
router.get('/gate-sets', (req: Request, res: Response) => {
  try {
    const gateSets = centralScannerService.listGateSets();
    res.json({
      success: true,
      data: gateSets,
      total: gateSets.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to list gate sets'
    });
  }
});

/**
 * POST /api/central-scanner/gate-sets
 * Create a new custom gate set
 */
router.post('/gate-sets', (req: Request, res: Response) => {
  try {
    const { id, name, gates } = req.body;
    
    if (!id || !name || !gates || !Array.isArray(gates)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: id, name, gates (array)'
      });
    }

    const gateSet: GateSetConfig = {
      id,
      name,
      gates: gates.map((g: any, idx: number) => ({
        gate: g.gate || idx + 1,
        rule_id: g.rule_id,
        required: g.required ?? (idx === 0),
        weight: g.weight || 20,
        params: g.params
      }))
    };

    centralScannerService.addGateSet(gateSet);

    res.json({
      success: true,
      message: `Gate set '${name}' created`,
      data: gateSet
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create gate set'
    });
  }
});

/**
 * DELETE /api/central-scanner/gate-sets/:id
 * Delete a custom gate set
 */
router.delete('/gate-sets/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = centralScannerService.deleteGateSet(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: `Gate set '${id}' deleted`
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Gate set '${id}' not found`
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete gate set'
    });
  }
});

/**
 * POST /api/central-scanner/scan
 * Scan a single symbol against a gate set
 */
router.post('/scan', async (req: Request, res: Response) => {
  try {
    const { symbol, gateSetId } = req.body;
    
    if (!symbol || !gateSetId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: symbol, gateSetId'
      });
    }

    const result = await centralScannerService.scanSymbol(symbol, gateSetId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Scan failed'
    });
  }
});

/**
 * POST /api/central-scanner/scan-watchlist
 * Scan multiple symbols against a gate set
 */
router.post('/scan-watchlist', async (req: Request, res: Response) => {
  try {
    const { gateSetId, symbols } = req.body;
    
    if (!gateSetId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: gateSetId'
      });
    }

    const results = await centralScannerService.scanWatchlist(gateSetId, symbols);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Watchlist scan failed'
    });
  }
});

/**
 * GET /api/central-scanner/scan/:gateSetId
 * Run a full scan with the specified gate set
 */
router.get('/scan/:gateSetId', async (req: Request, res: Response) => {
  try {
    const { gateSetId } = req.params;
    const results = await centralScannerService.scanWatchlist(gateSetId);
    
    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Scan failed'
    });
  }
});

router.post('/strategy/parse', async (req: Request, res: Response) => {
  try {
    const { rules, sourceType } = req.body;
    
    if (!rules || !sourceType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: rules, sourceType'
      });
    }

    const strategy = await strategyAnalyzerService.parseStrategyRules(rules, sourceType);
    
    res.json({
      success: true,
      data: strategy
    });
  } catch (error: any) {
    console.error('Strategy parse error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to parse strategy rules'
    });
  }
});

router.post('/strategy/analyze', async (req: Request, res: Response) => {
  try {
    const { symbol, strategy, period } = req.body;
    
    if (!symbol || !strategy) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: symbol, strategy'
      });
    }

    const analysis = await strategyAnalyzerService.analyzeStrategy(symbol, strategy, period || '1M');
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Strategy analyze error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze strategy'
    });
  }
});

router.post('/strategy/quick-analyze', async (req: Request, res: Response) => {
  try {
    const { symbol, rules, sourceType, period } = req.body;
    
    if (!symbol || !rules) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: symbol, rules'
      });
    }

    const strategy = await strategyAnalyzerService.parseStrategyRules(rules, sourceType || 'text');
    const analysis = await strategyAnalyzerService.analyzeStrategy(symbol, strategy, period || '1M');
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    console.error('Quick analyze error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze'
    });
  }
});

export default router;
