import { Router } from 'express';
import { db } from './db';
import { portfolioPositions, tradingPlanAlerts, automatedTradingRules } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { automationEngine } from './automation-engine';

const router = Router();

interface MarketData {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  previousClose: number;
}

async function getMarketPrice(symbol: string, assetType: string): Promise<MarketData | null> {
  try {
    let querySymbol = symbol;
    if (assetType === 'crypto') {
      querySymbol = symbol.includes('-') ? symbol : `${symbol}-USD`;
    } else if (assetType === 'forex') {
      querySymbol = symbol.includes('=X') ? symbol : `${symbol}=X`;
    } else if (assetType === 'futures') {
      if (!symbol.includes('=F')) {
        const futuresMap: Record<string, string> = {
          'GC': 'GC=F', 'SI': 'SI=F', 'CL': 'CL=F', 'NG': 'NG=F',
          'ES': 'ES=F', 'NQ': 'NQ=F', 'YM': 'YM=F', 'RTY': 'RTY=F',
          'ZC': 'ZC=F', 'ZS': 'ZS=F', 'ZW': 'ZW=F',
          'GOLD': 'GC=F', 'SILVER': 'SI=F', 'OIL': 'CL=F', 'NATGAS': 'NG=F'
        };
        querySymbol = futuresMap[symbol.toUpperCase()] || `${symbol}=F`;
      }
    }
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    
    if (!meta || !meta.regularMarketPrice) {
      return null;
    }
    
    return {
      price: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: quote?.volume?.[quote.volume.length - 1] || meta.regularMarketVolume || 0,
      high: quote?.high?.[quote.high.length - 1] || meta.regularMarketDayHigh || meta.regularMarketPrice,
      low: quote?.low?.[quote.low.length - 1] || meta.regularMarketDayLow || meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.regularMarketPrice,
    };
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return null;
  }
}

function generateAIAdvice(position: any, marketData: MarketData | null): { advice: string; reasoning: string; confidence: number } {
  if (!marketData) {
    return {
      advice: 'HOLD',
      reasoning: 'Unable to fetch market data. Maintain current position and monitor.',
      confidence: 50
    };
  }

  const entryPrice = parseFloat(position.entryPrice);
  const currentPrice = marketData.price;
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  const stopLoss = position.stopLoss ? parseFloat(position.stopLoss) : null;
  const takeProfit = position.takeProfit ? parseFloat(position.takeProfit) : null;
  const isLong = position.side === 'long';
  
  const volatility = Math.abs(marketData.changePercent);
  const isVolatile = volatility > 3;
  
  if (stopLoss) {
    if (isLong && currentPrice <= stopLoss) {
      return {
        advice: 'EXIT',
        reasoning: `Price ($${currentPrice.toFixed(2)}) has hit your stop loss at $${stopLoss.toFixed(2)}. Exit to protect capital.`,
        confidence: 95
      };
    }
    if (!isLong && currentPrice >= stopLoss) {
      return {
        advice: 'EXIT',
        reasoning: `Price ($${currentPrice.toFixed(2)}) has hit your stop loss at $${stopLoss.toFixed(2)}. Exit short position.`,
        confidence: 95
      };
    }
  }
  
  if (takeProfit) {
    if (isLong && currentPrice >= takeProfit) {
      return {
        advice: 'TAKE_PROFIT',
        reasoning: `Price ($${currentPrice.toFixed(2)}) has reached your take profit target at $${takeProfit.toFixed(2)}. Consider securing profits.`,
        confidence: 90
      };
    }
    if (!isLong && currentPrice <= takeProfit) {
      return {
        advice: 'TAKE_PROFIT',
        reasoning: `Price ($${currentPrice.toFixed(2)}) has reached your take profit target at $${takeProfit.toFixed(2)}. Consider closing short.`,
        confidence: 90
      };
    }
  }
  
  if (isLong) {
    if (pnlPercent >= 20) {
      return {
        advice: 'TAKE_PROFIT',
        reasoning: `Position is up ${pnlPercent.toFixed(1)}%. Consider taking partial or full profits to lock in gains.`,
        confidence: 85
      };
    }
    if (pnlPercent <= -15) {
      return {
        advice: 'EXIT',
        reasoning: `Position is down ${Math.abs(pnlPercent).toFixed(1)}%. Consider exiting to prevent further losses.`,
        confidence: 80
      };
    }
    if (pnlPercent >= 5 && marketData.changePercent < -2) {
      return {
        advice: 'TAKE_PROFIT',
        reasoning: `Market showing weakness (${marketData.changePercent.toFixed(1)}% today). Consider taking some profits while still up ${pnlPercent.toFixed(1)}%.`,
        confidence: 70
      };
    }
    if (pnlPercent < 0 && marketData.changePercent > 2) {
      return {
        advice: 'SCALE_IN',
        reasoning: `Market momentum turning positive. Consider adding to position at lower average cost.`,
        confidence: 65
      };
    }
  } else {
    if (pnlPercent <= -20) {
      return {
        advice: 'TAKE_PROFIT',
        reasoning: `Short position gaining ${Math.abs(pnlPercent).toFixed(1)}%. Consider covering to secure profits.`,
        confidence: 85
      };
    }
    if (pnlPercent >= 15) {
      return {
        advice: 'EXIT',
        reasoning: `Short position losing ${pnlPercent.toFixed(1)}%. Consider covering to limit losses.`,
        confidence: 80
      };
    }
  }
  
  if (isVolatile) {
    return {
      advice: 'HOLD',
      reasoning: `High volatility detected (${volatility.toFixed(1)}% move). Wait for market to stabilize before taking action.`,
      confidence: 60
    };
  }
  
  return {
    advice: 'HOLD',
    reasoning: `Position performing as expected. Current P/L: ${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(1)}%. Continue monitoring.`,
    confidence: 70
  };
}

router.get('/positions', async (req, res) => {
  try {
    const positions = await db.select().from(portfolioPositions)
      .where(eq(portfolioPositions.status, 'active'))
      .orderBy(desc(portfolioPositions.createdAt));
    
    const positionsWithUpdates = await Promise.all(
      positions.map(async (position) => {
        const marketData = await getMarketPrice(position.symbol, position.assetType);
        const advice = generateAIAdvice(position, marketData);
        
        if (marketData) {
          const entryPrice = parseFloat(position.entryPrice);
          const quantity = parseFloat(position.quantity);
          const isLong = position.side === 'long';
          const multiplier = position.assetType === 'options' ? (position.contractSize || 100) : 1;
          
          let pnl: number;
          if (isLong) {
            pnl = (marketData.price - entryPrice) * quantity * multiplier;
          } else {
            pnl = (entryPrice - marketData.price) * quantity * multiplier;
          }
          const pnlPercent = ((marketData.price - entryPrice) / entryPrice) * 100 * (isLong ? 1 : -1);
          
          return {
            ...position,
            currentPrice: marketData.price.toString(),
            unrealizedPnl: pnl.toFixed(2),
            unrealizedPnlPercent: pnlPercent.toFixed(2),
            aiAdvice: advice.advice,
            aiReasoning: advice.reasoning,
            aiConfidence: advice.confidence.toString(),
            marketData: {
              change: marketData.change,
              changePercent: marketData.changePercent,
              volume: marketData.volume,
              high: marketData.high,
              low: marketData.low
            }
          };
        }
        
        return {
          ...position,
          aiAdvice: advice.advice,
          aiReasoning: advice.reasoning,
          aiConfidence: advice.confidence.toString()
        };
      })
    );
    
    res.json({ success: true, data: positionsWithUpdates });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch positions' });
  }
});

router.post('/positions', async (req, res) => {
  try {
    const {
      symbol,
      assetType,
      side,
      quantity,
      entryPrice,
      strikePrice,
      expirationDate,
      optionType,
      contractSize,
      stopLoss,
      takeProfit,
      notes
    } = req.body;
    
    if (!symbol || !assetType || !side || !quantity || !entryPrice) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields',
        details: {
          symbol: !symbol ? 'Symbol is required' : null,
          assetType: !assetType ? 'Asset type is required' : null,
          side: !side ? 'Side (long/short) is required' : null,
          quantity: !quantity ? 'Quantity is required' : null,
          entryPrice: !entryPrice ? 'Entry price is required' : null
        }
      });
    }
    
    const validAssetTypes = ['stock', 'options', 'crypto', 'forex', 'futures'];
    const validSides = ['long', 'short'];
    
    if (!validAssetTypes.includes(assetType)) {
      return res.status(400).json({ success: false, error: `Invalid asset type. Must be one of: ${validAssetTypes.join(', ')}` });
    }
    
    if (!validSides.includes(side)) {
      return res.status(400).json({ success: false, error: 'Invalid side. Must be long or short' });
    }
    
    if (assetType === 'options' && !optionType) {
      return res.status(400).json({ success: false, error: 'Option type (call/put) is required for options' });
    }
    
    const [newPosition] = await db.insert(portfolioPositions).values({
      symbol: symbol.toUpperCase(),
      assetType,
      side,
      quantity: quantity.toString(),
      entryPrice: entryPrice.toString(),
      strikePrice: strikePrice?.toString() || null,
      expirationDate: expirationDate || null,
      optionType: optionType || null,
      contractSize: contractSize || 100,
      stopLoss: stopLoss?.toString() || null,
      takeProfit: takeProfit?.toString() || null,
      notes: notes || null,
      status: 'active'
    }).returning();
    
    res.json({ success: true, data: newPosition });
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ success: false, error: 'Failed to create position' });
  }
});

router.patch('/positions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updated] = await db.update(portfolioPositions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(portfolioPositions.id, parseInt(id)))
      .returning();
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ success: false, error: 'Failed to update position' });
  }
});

router.delete('/positions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.update(portfolioPositions)
      .set({ status: 'closed', updatedAt: new Date() })
      .where(eq(portfolioPositions.id, parseInt(id)));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error closing position:', error);
    res.status(500).json({ success: false, error: 'Failed to close position' });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const alerts = await db.select().from(tradingPlanAlerts)
      .where(eq(tradingPlanAlerts.isRead, false))
      .orderBy(desc(tradingPlanAlerts.triggeredAt))
      .limit(20);
    
    res.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

router.get('/portfolio-summary', async (req, res) => {
  try {
    const positions = await db.select().from(portfolioPositions)
      .where(eq(portfolioPositions.status, 'active'));
    
    let totalValue = 0;
    let totalPnl = 0;
    const byAssetType: Record<string, { count: number; value: number; pnl: number }> = {};
    
    for (const position of positions) {
      const marketData = await getMarketPrice(position.symbol, position.assetType);
      if (marketData) {
        const entryPrice = parseFloat(position.entryPrice);
        const quantity = parseFloat(position.quantity);
        const multiplier = position.assetType === 'options' ? (position.contractSize || 100) : 1;
        const positionValue = marketData.price * quantity * multiplier;
        const pnl = position.side === 'long' 
          ? (marketData.price - entryPrice) * quantity * multiplier
          : (entryPrice - marketData.price) * quantity * multiplier;
        
        totalValue += positionValue;
        totalPnl += pnl;
        
        if (!byAssetType[position.assetType]) {
          byAssetType[position.assetType] = { count: 0, value: 0, pnl: 0 };
        }
        byAssetType[position.assetType].count++;
        byAssetType[position.assetType].value += positionValue;
        byAssetType[position.assetType].pnl += pnl;
      }
    }
    
    res.json({
      success: true,
      data: {
        totalPositions: positions.length,
        totalValue,
        totalPnl,
        pnlPercent: totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0,
        byAssetType
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio summary' });
  }
});

router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { assetType = 'stock' } = req.query;
    
    const marketData = await getMarketPrice(symbol, assetType as string);
    
    if (!marketData) {
      return res.status(404).json({ success: false, error: 'Unable to fetch market data for symbol' });
    }
    
    const volatility = Math.abs(marketData.changePercent);
    const trend = marketData.changePercent > 0 ? 'bullish' : marketData.changePercent < 0 ? 'bearish' : 'neutral';
    const volumeStrength = marketData.volume > 1000000 ? 'high' : marketData.volume > 100000 ? 'moderate' : 'low';
    
    let recommendation = 'WAIT';
    let reasoning = '';
    
    if (trend === 'bullish' && volumeStrength === 'high') {
      recommendation = 'BUY';
      reasoning = `Strong bullish momentum (+${marketData.changePercent.toFixed(1)}%) with high volume. Consider entering long position.`;
    } else if (trend === 'bearish' && volatility > 3) {
      recommendation = 'WAIT';
      reasoning = `High volatility selling (${marketData.changePercent.toFixed(1)}%). Wait for stabilization before entering.`;
    } else if (trend === 'bearish' && volumeStrength === 'high') {
      recommendation = 'SHORT';
      reasoning = `Bearish momentum with high volume. Consider short position if permitted.`;
    } else {
      recommendation = 'WATCH';
      reasoning = `Mixed signals. Monitor for clearer entry opportunity.`;
    }
    
    res.json({
      success: true,
      data: {
        symbol,
        price: marketData.price,
        change: marketData.change,
        changePercent: marketData.changePercent,
        volume: marketData.volume,
        high: marketData.high,
        low: marketData.low,
        trend,
        volatility,
        volumeStrength,
        recommendation,
        reasoning
      }
    });
  } catch (error) {
    console.error('Error analyzing symbol:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze symbol' });
  }
});

// Convert AI Trading Plan position to automation rule
router.post('/positions/:id/automate', async (req, res) => {
  try {
    const { id } = req.params;
    const { autoExecuteAI = false, exitOnlyMode = true } = req.body;
    
    const positions = await db.select().from(portfolioPositions)
      .where(eq(portfolioPositions.id, parseInt(id)));
    
    if (positions.length === 0) {
      return res.status(404).json({ success: false, error: 'Position not found' });
    }
    
    const position = positions[0];
    const entryPrice = parseFloat(position.entryPrice);
    const stopLoss = position.stopLoss ? parseFloat(position.stopLoss) : null;
    const takeProfit = position.takeProfit ? parseFloat(position.takeProfit) : null;
    
    // Create exit conditions based on stop loss and take profit
    const exitConditions: any[] = [];
    
    if (stopLoss) {
      const stopLossPercent = Math.abs((stopLoss - entryPrice) / entryPrice * 100);
      exitConditions.push({ type: 'price_below', value: stopLoss });
    }
    
    if (takeProfit) {
      exitConditions.push({ type: 'price_above', value: takeProfit });
    }
    
    // Add RSI-based exit conditions for AI-driven exits
    if (autoExecuteAI) {
      if (position.side === 'long') {
        exitConditions.push({ type: 'rsi_above', value: 70 }); // Overbought exit
      } else {
        exitConditions.push({ type: 'rsi_below', value: 30 }); // Oversold exit for shorts
      }
    }
    
    // Create the automation rule
    const [rule] = await db.insert(automatedTradingRules).values({
      name: `Auto-Manage ${position.symbol} (from AI Plan)`,
      description: `Automated management for ${position.side} position in ${position.symbol}. Entry: $${entryPrice}`,
      symbol: position.symbol,
      assetType: position.assetType,
      entryConditions: exitOnlyMode ? [] : [{ type: 'manual', value: 0 }], // Exit-only mode
      exitConditions: exitConditions,
      positionSizeType: 'fixed',
      positionSize: position.quantity,
      stopLossType: stopLoss ? 'fixed' : 'percentage',
      stopLossValue: stopLoss ? stopLoss.toString() : '5',
      takeProfitType: takeProfit ? 'fixed' : 'percentage',
      takeProfitValue: takeProfit ? takeProfit.toString() : '10',
      maxDailyLoss: '1000',
      maxDailyTrades: 5,
      isPaperTrading: false, // Real position management
      isActive: true,
      tradingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }).returning();
    
    // Update position to link to automation rule
    await db.update(portfolioPositions)
      .set({ notes: `Linked to automation rule #${rule.id}` })
      .where(eq(portfolioPositions.id, parseInt(id)));
    
    res.json({ 
      success: true, 
      data: { 
        rule,
        message: `Position now managed by automation rule #${rule.id}`
      }
    });
  } catch (error) {
    console.error('Error creating automation rule:', error);
    res.status(500).json({ success: false, error: 'Failed to create automation rule' });
  }
});

// Auto-execute AI advice for a position
router.post('/positions/:id/execute-ai', async (req, res) => {
  try {
    const { id } = req.params;
    
    const positions = await db.select().from(portfolioPositions)
      .where(eq(portfolioPositions.id, parseInt(id)));
    
    if (positions.length === 0) {
      return res.status(404).json({ success: false, error: 'Position not found' });
    }
    
    const position = positions[0];
    const marketData = await getMarketPrice(position.symbol, position.assetType);
    
    if (!marketData) {
      return res.status(500).json({ success: false, error: 'Unable to fetch market data' });
    }
    
    const advice = generateAIAdvice(position, marketData);
    
    let action: string | null = null;
    let result: any = null;
    
    switch (advice.advice) {
      case 'EXIT':
      case 'TAKE_PROFIT':
        // Close the position
        await db.update(portfolioPositions)
          .set({ 
            status: 'closed',
            notes: `${position.notes || ''}\nAI auto-closed: ${advice.reasoning}`,
            updatedAt: new Date()
          })
          .where(eq(portfolioPositions.id, parseInt(id)));
        action = 'closed';
        result = { price: marketData.price, reason: advice.reasoning };
        break;
        
      case 'SCALE_IN':
        // Create alert for manual scale-in (auto-execution would require exchange connection)
        await db.insert(tradingPlanAlerts).values({
          positionId: parseInt(id),
          alertType: 'ai_recommendation',
          severity: 'info',
          message: `AI recommends scaling into ${position.symbol} at $${marketData.price.toFixed(2)}: ${advice.reasoning}`,
          isRead: false
        });
        action = 'alert_created';
        result = { recommendation: 'SCALE_IN', reason: advice.reasoning };
        break;
        
      default:
        action = 'no_action';
        result = { advice: advice.advice, reason: advice.reasoning };
    }
    
    res.json({
      success: true,
      data: {
        position: position.symbol,
        aiAdvice: advice.advice,
        confidence: advice.confidence,
        action,
        result
      }
    });
  } catch (error) {
    console.error('Error executing AI advice:', error);
    res.status(500).json({ success: false, error: 'Failed to execute AI advice' });
  }
});

// Get linked automation rules for positions
router.get('/automation-status', async (req, res) => {
  try {
    const rules = await db.select().from(automatedTradingRules)
      .where(eq(automatedTradingRules.isActive, true));
    
    const aiPlanRules = rules.filter(r => r.name?.includes('from AI Plan'));
    
    res.json({
      success: true,
      data: {
        totalActiveRules: aiPlanRules.length,
        rules: aiPlanRules.map(r => ({
          id: r.id,
          name: r.name,
          symbol: r.symbol,
          isActive: r.isActive,
          lastTriggeredAt: r.lastTriggeredAt,
          todayTradeCount: r.todayTradeCount
        })),
        engineStatus: automationEngine.getStatus()
      }
    });
  } catch (error) {
    console.error('Error fetching automation status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch automation status' });
  }
});

export default router;
