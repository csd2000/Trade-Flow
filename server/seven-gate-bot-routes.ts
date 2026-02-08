import { Router, Request, Response, NextFunction } from 'express';
import { sevenGateTradingBot } from './seven-gate-trading-bot';
import { z } from 'zod';

const router = Router();

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
  return res.status(401).json({ success: false, error: 'Authentication required' });
};

const configSchema = z.object({
  platform: z.enum(['binance', 'alpaca', 'oanda', 'coinbase']).optional(),
  isPaperTrading: z.boolean().optional(),
  scanIntervalMs: z.number().min(10000).max(300000).optional(),
  minGateScore: z.number().min(50).max(100).optional(),
  minGatesPassed: z.number().min(3).max(7).optional(),
  defaultStopPips: z.number().min(1).max(20).optional(),
  discordWebhook: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional()
});

const webhookSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  timestamp: z.string().optional()
});

router.get('/status', async (req, res) => {
  try {
    const status = sevenGateTradingBot.getStatus();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/start', requireAuth, async (req, res) => {
  try {
    const result = await sevenGateTradingBot.start();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/stop', requireAuth, async (req, res) => {
  try {
    const result = sevenGateTradingBot.stop();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/configure', requireAuth, async (req, res) => {
  try {
    const validated = configSchema.parse(req.body);
    const result = await sevenGateTradingBot.configure(validated);
    res.json(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid configuration', details: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/webhook/price', async (req, res) => {
  try {
    const validated = webhookSchema.parse(req.body);
    const result = await sevenGateTradingBot.handlePriceWebhook(
      validated.symbol,
      validated.price,
      validated.timestamp || new Date().toISOString()
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid webhook data', details: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/heartbeat', requireAuth, async (req, res) => {
  try {
    const status = await sevenGateTradingBot.forceHeartbeat();
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/positions', async (req, res) => {
  try {
    const status = sevenGateTradingBot.getStatus();
    res.json({ success: true, data: status.positions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/documentation', async (req, res) => {
  res.json({
    success: true,
    documentation: {
      name: '7-Gate Automated Trading Bot',
      version: '1.0.0',
      description: 'Autonomous trading bot that triggers on liquidity sweeps and validates through the 7-Gate System',
      endpoints: {
        'GET /status': 'Get bot status, active positions, and configuration',
        'POST /start': 'Start the trading bot (requires auth)',
        'POST /stop': 'Stop the trading bot (requires auth)',
        'POST /configure': 'Update bot configuration (requires auth)',
        'POST /webhook/price': 'Receive real-time price updates via webhook',
        'POST /heartbeat': 'Force send heartbeat notification',
        'GET /positions': 'Get active trading positions'
      },
      gates: {
        'Gate 1': 'Liquidity Sweep (PRIMARY TRIGGER) - Detects 24h high/low sweeps with volume confirmation',
        'Gate 2': 'Fair Value Gap - Checks for nearby FVG zones',
        'Gate 3': 'Order Block - Validates institutional order blocks',
        'Gate 4': 'Market Structure - Confirms structure shift alignment',
        'Gate 5': 'Momentum Confirmation - Volume and momentum validation',
        'Gate 6': 'Session Timing - London/NY session optimization',
        'Gate 7': 'Confluence Score - Overall gate validation'
      },
      bracketOrder: {
        entry: 'Market execution on Gate 7 confirmation',
        stopLoss: '2 pips/ticks beyond liquidity sweep candle wick (HARD STOP)',
        takeProfit: 'Set at nearest opposing liquidity pool'
      },
      safeguards: {
        webhooks: 'Real-time price data via POST /webhook/price to prevent slippage',
        hardStops: 'All stop losses are hard-coded into order tickets',
        heartbeat: 'Daily notification to confirm bot is alive'
      },
      configuration: {
        platform: 'Trading platform (binance, alpaca, oanda, coinbase)',
        isPaperTrading: 'Whether to use paper trading mode',
        scanIntervalMs: 'Scan interval in milliseconds (10000-300000)',
        minGateScore: 'Minimum gate score to execute trade (50-100)',
        minGatesPassed: 'Minimum gates that must pass (3-7)',
        defaultStopPips: 'Default stop loss in pips/ticks (1-20)',
        discordWebhook: 'Discord webhook URL for notifications',
        telegramBotToken: 'Telegram bot token for notifications',
        telegramChatId: 'Telegram chat ID for notifications'
      }
    }
  });
});

export default router;
