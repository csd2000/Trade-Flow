import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { 
  automatedTradingRules, 
  automatedTradeExecutions, 
  ruleExecutionLogs,
  tradingConnections,
  insertAutomatedTradingRuleSchema
} from '@shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { automationEngine } from './automation-engine';
import { z } from 'zod';

const router = Router();

const updateRuleSchema = z.object({
  name: z.string().optional(),
  description: z.string().nullable().optional(),
  symbol: z.string().optional(),
  assetType: z.string().optional(),
  connectionId: z.number().nullable().optional(),
  entryConditions: z.array(z.any()).optional(),
  exitConditions: z.array(z.any()).optional(),
  positionSizeType: z.string().optional(),
  positionSize: z.string().optional(),
  stopLossType: z.string().optional(),
  stopLossValue: z.string().optional(),
  takeProfitType: z.string().nullable().optional(),
  takeProfitValue: z.string().nullable().optional(),
  trailingStopActivation: z.string().nullable().optional(),
  trailingStopDistance: z.string().nullable().optional(),
  maxDailyLoss: z.string().nullable().optional(),
  maxDailyTrades: z.number().nullable().optional(),
  tradingHoursStart: z.string().nullable().optional(),
  tradingHoursEnd: z.string().nullable().optional(),
  tradingDays: z.array(z.string()).nullable().optional(),
  timezone: z.string().nullable().optional(),
  isPaperTrading: z.boolean().optional(),
  isActive: z.boolean().optional()
}).strict();

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
    return next();
  }
  if ((req as any).user) {
    return next();
  }
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Authentication required for automated trading operations' });
};

router.get('/rules', async (req, res) => {
  try {
    const rules = await db.select()
      .from(automatedTradingRules)
      .orderBy(desc(automatedTradingRules.createdAt));
    res.json({ success: true, rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/rules/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [rule] = await db.select()
      .from(automatedTradingRules)
      .where(eq(automatedTradingRules.id, id));
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    
    res.json({ success: true, rule });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rules', requireAuth, async (req, res) => {
  try {
    const validatedData = insertAutomatedTradingRuleSchema.parse(req.body);
    
    const [rule] = await db.insert(automatedTradingRules)
      .values(validatedData)
      .returning();
    
    res.json({ success: true, rule });
  } catch (error: any) {
    console.error('Create rule error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

router.patch('/rules/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validated = updateRuleSchema.parse(req.body);
    
    const [updated] = await db.update(automatedTradingRules)
      .set({ ...validated, updatedAt: new Date() })
      .where(eq(automatedTradingRules.id, id))
      .returning();
    
    res.json({ success: true, rule: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid update data', details: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/rules/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await db.delete(ruleExecutionLogs).where(eq(ruleExecutionLogs.ruleId, id));
    await db.delete(automatedTradeExecutions).where(eq(automatedTradeExecutions.ruleId, id));
    await db.delete(automatedTradingRules).where(eq(automatedTradingRules.id, id));
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rules/:id/activate', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [rule] = await db.select()
      .from(automatedTradingRules)
      .where(eq(automatedTradingRules.id, id));
    
    if (!rule) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    
    if (rule.connectionId) {
      const [connection] = await db.select()
        .from(tradingConnections)
        .where(eq(tradingConnections.id, rule.connectionId));
      
      if (!connection || !connection.isActive) {
        return res.status(400).json({ 
          success: false, 
          error: 'Trading connection is not active. Please configure your broker connection first.' 
        });
      }
    }
    
    const [updated] = await db.update(automatedTradingRules)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(automatedTradingRules.id, id))
      .returning();
    
    res.json({ success: true, rule: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rules/:id/deactivate', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [updated] = await db.update(automatedTradingRules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(automatedTradingRules.id, id))
      .returning();
    
    res.json({ success: true, rule: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/rules/:id/executions', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 50;
    
    const executions = await db.select()
      .from(automatedTradeExecutions)
      .where(eq(automatedTradeExecutions.ruleId, id))
      .orderBy(desc(automatedTradeExecutions.executedAt))
      .limit(limit);
    
    res.json({ success: true, executions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/rules/:id/logs', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 100;
    
    const logs = await db.select()
      .from(ruleExecutionLogs)
      .where(eq(ruleExecutionLogs.ruleId, id))
      .orderBy(desc(ruleExecutionLogs.createdAt))
      .limit(limit);
    
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/executions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    const executions = await db.select()
      .from(automatedTradeExecutions)
      .orderBy(desc(automatedTradeExecutions.executedAt))
      .limit(limit);
    
    res.json({ success: true, executions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const allRules = await db.select().from(automatedTradingRules);
    const allExecutions = await db.select().from(automatedTradeExecutions);
    
    const activeRules = allRules.filter(r => r.isActive).length;
    const totalTrades = allExecutions.length;
    const filledTrades = allExecutions.filter(e => e.status === 'filled').length;
    const pendingTrades = allExecutions.filter(e => e.status === 'pending').length;
    
    const closedTrades = allExecutions.filter(e => e.closedAt && e.pnl);
    const winningTrades = closedTrades.filter(e => Number(e.pnl) > 0).length;
    const losingTrades = closedTrades.filter(e => Number(e.pnl) < 0).length;
    const totalPnl = closedTrades.reduce((sum, e) => sum + Number(e.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTrades = allExecutions.filter(e => new Date(e.executedAt!) >= todayStart);
    const todayPnl = todayTrades.filter(e => e.pnl).reduce((sum, e) => sum + Number(e.pnl || 0), 0);
    
    res.json({
      success: true,
      stats: {
        totalRules: allRules.length,
        activeRules,
        totalTrades,
        filledTrades,
        pendingTrades,
        closedTrades: closedTrades.length,
        winningTrades,
        losingTrades,
        winRate: winRate.toFixed(1),
        totalPnl: totalPnl.toFixed(2),
        todayTrades: todayTrades.length,
        todayPnl: todayPnl.toFixed(2),
        engineStatus: automationEngine.getStatus()
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/engine/start', requireAuth, async (req, res) => {
  try {
    await automationEngine.start();
    res.json({ success: true, message: 'Automation engine started', status: automationEngine.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/engine/stop', requireAuth, async (req, res) => {
  try {
    automationEngine.stop();
    res.json({ success: true, message: 'Automation engine stopped', status: automationEngine.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/engine/status', async (req, res) => {
  try {
    res.json({ success: true, status: automationEngine.getStatus() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/engine/reset-daily', requireAuth, async (req, res) => {
  try {
    await automationEngine.resetDailyCounters();
    res.json({ success: true, message: 'Daily counters reset' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/condition-templates', async (req, res) => {
  try {
    const templates = {
      entry: [
        { id: 'price_above', label: 'Price Above', category: 'price', params: ['value'] },
        { id: 'price_below', label: 'Price Below', category: 'price', params: ['value'] },
        { id: 'rsi_above', label: 'RSI Above', category: 'indicator', params: ['value', 'period'] },
        { id: 'rsi_below', label: 'RSI Below', category: 'indicator', params: ['value', 'period'] },
        { id: 'ema_cross_above', label: 'EMA Crosses Above', category: 'indicator', params: ['fastPeriod', 'slowPeriod'] },
        { id: 'ema_cross_below', label: 'EMA Crosses Below', category: 'indicator', params: ['fastPeriod', 'slowPeriod'] },
        { id: 'macd_crossover', label: 'MACD Bullish Crossover', category: 'indicator', params: ['fastPeriod', 'slowPeriod', 'signalPeriod'] },
        { id: 'macd_crossunder', label: 'MACD Bearish Crossunder', category: 'indicator', params: ['fastPeriod', 'slowPeriod', 'signalPeriod'] },
        { id: 'breakout_high', label: 'Breakout Above Previous High', category: 'pattern', params: ['lookback'] },
        { id: 'breakdown_low', label: 'Breakdown Below Previous Low', category: 'pattern', params: ['lookback'] },
        { id: 'volume_spike', label: 'Volume Spike', category: 'indicator', params: ['multiplier'] }
      ],
      exit: [
        { id: 'profit_percent', label: 'Profit Target %', category: 'position', params: ['value'] },
        { id: 'loss_percent', label: 'Max Loss %', category: 'position', params: ['value'] },
        { id: 'time_in_trade', label: 'Time in Trade (minutes)', category: 'time', params: ['minutes'] },
        { id: 'rsi_above', label: 'RSI Above (Exit)', category: 'indicator', params: ['value', 'period'] },
        { id: 'rsi_below', label: 'RSI Below (Exit)', category: 'indicator', params: ['value', 'period'] },
        { id: 'ema_cross_below', label: 'EMA Crosses Below (Exit)', category: 'indicator', params: ['fastPeriod', 'slowPeriod'] },
        { id: 'macd_crossunder', label: 'MACD Crossunder (Exit)', category: 'indicator', params: [] }
      ],
      riskManagement: {
        stopLossTypes: [
          { id: 'percentage', label: 'Percentage of Entry', description: 'Stop loss at X% below entry' },
          { id: 'fixed', label: 'Fixed Dollar Amount', description: 'Stop loss at entry minus $X' },
          { id: 'atr', label: 'ATR Multiple', description: 'Stop loss at X * ATR below entry' },
          { id: 'trailing', label: 'Trailing Stop', description: 'Trailing stop that follows price' }
        ],
        takeProfitTypes: [
          { id: 'percentage', label: 'Percentage of Entry', description: 'Take profit at X% above entry' },
          { id: 'fixed', label: 'Fixed Dollar Amount', description: 'Take profit at entry plus $X' },
          { id: 'risk_reward', label: 'Risk/Reward Ratio', description: 'Take profit at X:1 R/R from stop loss' }
        ],
        positionSizeTypes: [
          { id: 'fixed', label: 'Fixed Quantity', description: 'Trade a fixed number of shares/contracts' },
          { id: 'percent_capital', label: 'Percent of Capital', description: 'Risk X% of account on each trade' },
          { id: 'risk_based', label: 'Risk-Based Sizing', description: 'Size based on stop loss distance' }
        ]
      }
    };
    
    res.json({ success: true, templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
