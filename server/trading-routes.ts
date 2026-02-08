import { Router } from 'express';
import { tradingExecutionService } from './trading-execution-service';
import { db } from './db';
import { tradingConnections, tradeOrders } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

router.get('/platforms', async (req, res) => {
  try {
    const platforms = tradingExecutionService.getSupportedPlatforms();
    res.json({ platforms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

router.post('/test-connection', async (req, res) => {
  try {
    const { platform } = req.body;
    
    if (!['binance', 'alpaca', 'oanda', 'coinbase'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const result = await tradingExecutionService.testConnection(platform);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Connection test failed' });
  }
});

router.get('/connections', async (req, res) => {
  try {
    const connections = await db.select().from(tradingConnections).orderBy(desc(tradingConnections.createdAt));
    res.json({ connections });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

router.post('/connections', async (req, res) => {
  try {
    const { platform, nickname, isPaperTrading = true } = req.body;
    
    if (!['binance', 'alpaca', 'oanda', 'coinbase'].includes(platform)) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    const connectionUuid = crypto.randomUUID();
    
    const testResult = await tradingExecutionService.testConnection(platform);
    
    const [connection] = await db.insert(tradingConnections).values({
      connectionUuid,
      platform,
      nickname: nickname || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Account`,
      isPaperTrading,
      connectionStatus: testResult.connected ? 'connected' : 'error',
      lastConnectedAt: testResult.connected ? new Date() : null
    }).returning();

    res.json({ 
      connection,
      testResult
    });
  } catch (error) {
    console.error('Create connection error:', error);
    res.status(500).json({ error: 'Failed to create connection' });
  }
});

router.delete('/connections/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tradingConnections).where(eq(tradingConnections.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete connection' });
  }
});

router.patch('/connections/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { isActive, isPaperTrading, nickname } = req.body;
    
    const [updated] = await db.update(tradingConnections)
      .set({
        ...(isActive !== undefined && { isActive }),
        ...(isPaperTrading !== undefined && { isPaperTrading }),
        ...(nickname && { nickname })
      })
      .where(eq(tradingConnections.id, id))
      .returning();
    
    res.json({ connection: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update connection' });
  }
});

router.post('/connections/:id/sync', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [connection] = await db.select().from(tradingConnections).where(eq(tradingConnections.id, id));
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    const testResult = await tradingExecutionService.testConnection(connection.platform as 'binance' | 'alpaca' | 'oanda' | 'coinbase');
    
    const [updated] = await db.update(tradingConnections)
      .set({
        connectionStatus: testResult.connected ? 'connected' : 'error',
        lastConnectedAt: testResult.connected ? new Date() : connection.lastConnectedAt
      })
      .where(eq(tradingConnections.id, id))
      .returning();
    
    res.json({ connection: updated, testResult });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync connection' });
  }
});

router.post('/execute', async (req, res) => {
  try {
    const { 
      connectionId, 
      symbol, 
      side, 
      quantity, 
      orderType = 'market',
      price,
      stopPrice,
      takeProfitPrice,
      stopLoss,
      takeProfit,
      signalSource,
      signalStrength,
      limitPrice
    } = req.body;

    // Basic required field validation
    if (!connectionId || !symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Missing required fields: connectionId, symbol, side, quantity' });
    }

    // Validate side
    if (!['buy', 'sell'].includes(side.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid side. Must be "buy" or "sell"' });
    }

    // Quantity must be positive
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Normalize field names: accept both stopLoss/takeProfit and stopPrice/takeProfitPrice
    const normalizedStopLoss = Number(stopLoss || stopPrice || 0);
    const normalizedTakeProfit = Number(takeProfit || takeProfitPrice || 0);
    
    // Get effective entry price for validation (required for risk validation)
    const entryPrice = Number(limitPrice || price || 0);
    const isBuy = side.toLowerCase() === 'buy';

    // For market orders with stop/take-profit, entry price is required for validation
    if ((normalizedStopLoss > 0 || normalizedTakeProfit > 0) && entryPrice <= 0) {
      return res.status(400).json({ 
        error: 'Entry price is required when using stop-loss or take-profit. For market orders, provide the expected entry price.',
        code: 'MISSING_ENTRY_PRICE'
      });
    }

    // Directional stop-loss validation
    if (normalizedStopLoss > 0 && entryPrice > 0) {
      if (isBuy && normalizedStopLoss >= entryPrice) {
        return res.status(400).json({ 
          error: 'Risk validation failed: Stop-loss must be below entry price for BUY orders',
          code: 'INVALID_STOP_LOSS_DIRECTION'
        });
      }
      if (!isBuy && normalizedStopLoss <= entryPrice) {
        return res.status(400).json({ 
          error: 'Risk validation failed: Stop-loss must be above entry price for SELL orders',
          code: 'INVALID_STOP_LOSS_DIRECTION'
        });
      }
    }

    // Directional take-profit validation
    if (normalizedTakeProfit > 0 && entryPrice > 0) {
      if (isBuy && normalizedTakeProfit <= entryPrice) {
        return res.status(400).json({ 
          error: 'Risk validation failed: Take-profit must be above entry price for BUY orders',
          code: 'INVALID_TAKE_PROFIT_DIRECTION'
        });
      }
      if (!isBuy && normalizedTakeProfit >= entryPrice) {
        return res.status(400).json({ 
          error: 'Risk validation failed: Take-profit must be below entry price for SELL orders',
          code: 'INVALID_TAKE_PROFIT_DIRECTION'
        });
      }
    }

    // Risk/reward ratio validation (if both stop-loss and take-profit are provided)
    if (normalizedStopLoss > 0 && normalizedTakeProfit > 0 && entryPrice > 0) {
      const riskPerShare = Math.abs(entryPrice - normalizedStopLoss);
      const rewardPerShare = Math.abs(normalizedTakeProfit - entryPrice);
      const rrRatio = riskPerShare > 0 ? rewardPerShare / riskPerShare : 0;
      
      if (rrRatio < 1) {
        return res.status(400).json({ 
          error: `Risk validation failed: Risk/Reward ratio ${rrRatio.toFixed(2)}:1 is below minimum 1:1`,
          code: 'INSUFFICIENT_RR_RATIO'
        });
      }
    }

    const [connection] = await db.select()
      .from(tradingConnections)
      .where(eq(tradingConnections.id, connectionId));

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    if (!connection.isActive) {
      return res.status(400).json({ error: 'Connection is not active' });
    }

    const [order] = await db.insert(tradeOrders).values({
      connectionId,
      platform: connection.platform,
      symbol,
      side,
      orderType,
      quantity: qty.toString(),
      price: entryPrice > 0 ? entryPrice.toString() : null,
      stopPrice: normalizedStopLoss > 0 ? normalizedStopLoss.toString() : null,
      takeProfitPrice: normalizedTakeProfit > 0 ? normalizedTakeProfit.toString() : null,
      signalSource,
      signalStrength: signalStrength?.toString(),
      status: 'pending'
    }).returning();

    const result = await tradingExecutionService.executeOrder(
      connection.platform as 'binance' | 'alpaca' | 'oanda' | 'coinbase',
      { 
        symbol, 
        side, 
        quantity: qty, 
        orderType, 
        price: entryPrice > 0 ? entryPrice : undefined, 
        stopPrice: normalizedStopLoss > 0 ? normalizedStopLoss : undefined, 
        takeProfitPrice: normalizedTakeProfit > 0 ? normalizedTakeProfit : undefined 
      },
      connection.isPaperTrading ?? true
    );

    await db.update(tradeOrders)
      .set({
        status: result.status,
        externalOrderId: result.orderId,
        filledPrice: result.filledPrice?.toString(),
        filledQuantity: result.filledQuantity?.toString(),
        errorMessage: result.success ? null : result.message,
        submittedAt: new Date(),
        ...(result.status === 'filled' && { filledAt: new Date() })
      })
      .where(eq(tradeOrders.id, order.id));

    res.json({
      order: {
        ...order,
        status: result.status,
        externalOrderId: result.orderId,
        filledPrice: result.filledPrice,
        filledQuantity: result.filledQuantity
      },
      result
    });
  } catch (error) {
    console.error('Order execution error:', error);
    res.status(500).json({ error: 'Order execution failed' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { limit = 50, status } = req.query;
    
    let query = db.select().from(tradeOrders);
    
    if (status && typeof status === 'string') {
      query = query.where(eq(tradeOrders.status, status)) as any;
    }
    
    const orders = await query.orderBy(desc(tradeOrders.createdAt)).limit(Number(limit));
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/stats', async (req, res) => {
  try {
    const allOrders = await db.select().from(tradeOrders);
    
    const stats = {
      totalOrders: allOrders.length,
      filledOrders: allOrders.filter(o => o.status === 'filled').length,
      pendingOrders: allOrders.filter(o => o.status === 'pending' || o.status === 'submitted').length,
      rejectedOrders: allOrders.filter(o => o.status === 'rejected').length,
      totalVolume: allOrders
        .filter(o => o.status === 'filled' && o.filledPrice && o.filledQuantity)
        .reduce((sum, o) => sum + (parseFloat(o.filledPrice || '0') * parseFloat(o.filledQuantity || '0')), 0),
      byPlatform: {} as Record<string, number>,
      bySignalSource: {} as Record<string, number>
    };

    allOrders.forEach(order => {
      stats.byPlatform[order.platform] = (stats.byPlatform[order.platform] || 0) + 1;
      if (order.signalSource) {
        stats.bySignalSource[order.signalSource] = (stats.bySignalSource[order.signalSource] || 0) + 1;
      }
    });

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
});

export default router;
