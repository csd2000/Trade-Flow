/**
 * Enhanced AI Trading Strategy Routes
 *
 * Exposes the multi-factor confluence trading system via API endpoints
 */

import { Router } from 'express';
import { enhancedTradingStrategy } from './enhanced-trading-strategy-service';

const router = Router();

interface HistoricalCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Fetch historical candle data from Yahoo Finance
 */
async function fetchHistoricalData(
  symbol: string,
  assetType: string = 'stock',
  days: number = 100
): Promise<HistoricalCandle[]> {
  try {
    let querySymbol = symbol;
    if (assetType === 'crypto') {
      querySymbol = symbol.includes('-') ? symbol : `${symbol}-USD`;
    } else if (assetType === 'forex') {
      querySymbol = symbol.includes('=X') ? symbol : `${symbol}=X`;
    } else if (assetType === 'futures') {
      const futuresMap: Record<string, string> = {
        'GC': 'GC=F', 'SI': 'SI=F', 'CL': 'CL=F', 'NG': 'NG=F',
        'ES': 'ES=F', 'NQ': 'NQ=F', 'YM': 'YM=F', 'RTY': 'RTY=F',
        'GOLD': 'GC=F', 'SILVER': 'SI=F', 'OIL': 'CL=F'
      };
      querySymbol = futuresMap[symbol.toUpperCase()] || `${symbol}=F`;
    }

    const endTime = Math.floor(Date.now() / 1000);
    const startTime = endTime - (days * 24 * 60 * 60);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySymbol)}?period1=${startTime}&period2=${endTime}&interval=1d`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp) {
      throw new Error('No data available');
    }

    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];

    const candles: HistoricalCandle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] !== null) {
        candles.push({
          timestamp: timestamps[i] * 1000,
          open: quote.open[i] || quote.close[i],
          high: quote.high[i] || quote.close[i],
          low: quote.low[i] || quote.close[i],
          close: quote.close[i],
          volume: quote.volume[i] || 0
        });
      }
    }

    return candles;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}

/**
 * Fetch Fear & Greed Index
 */
async function fetchFearGreedIndex(): Promise<number> {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    return parseInt(data?.data?.[0]?.value || '50');
  } catch {
    return 50; // Default to neutral
  }
}

/**
 * GET /api/enhanced-strategy/analyze/:symbol
 * Get complete trading analysis with confluence signals
 */
router.get('/analyze/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { assetType = 'stock', accountBalance = '10000' } = req.query;

    const [candles, fearGreed] = await Promise.all([
      fetchHistoricalData(symbol, assetType as string, 100),
      fetchFearGreedIndex()
    ]);

    if (candles.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient historical data for analysis (need 50+ days)'
      });
    }

    const tradingPlan = await enhancedTradingStrategy.getCompleteTradingPlan(
      symbol.toUpperCase(),
      candles,
      fearGreed,
      parseFloat(accountBalance as string)
    );

    res.json({
      success: true,
      data: tradingPlan
    });
  } catch (error) {
    console.error('Error analyzing symbol:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze symbol'
    });
  }
});

/**
 * GET /api/enhanced-strategy/quick-scan
 * Quick scan multiple symbols for best setups
 */
router.get('/quick-scan', async (req, res) => {
  try {
    const { symbols = 'SPY,QQQ,AAPL,MSFT,NVDA,TSLA,BTC,ETH' } = req.query;
    const symbolList = (symbols as string).split(',').map(s => s.trim().toUpperCase());

    const fearGreed = await fetchFearGreedIndex();
    const results: any[] = [];

    for (const symbol of symbolList.slice(0, 10)) { // Max 10 symbols
      try {
        const assetType = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT'].includes(symbol)
          ? 'crypto'
          : 'stock';

        const candles = await fetchHistoricalData(symbol, assetType, 100);

        if (candles.length >= 50) {
          const signal = enhancedTradingStrategy.generateConfluenceSignal(
            candles,
            fearGreed
          );

          results.push({
            symbol,
            assetType,
            price: candles[candles.length - 1].close,
            score: signal.score,
            direction: signal.direction,
            confidence: signal.confidence,
            recommendation: signal.recommendation,
            riskRewardRatio: signal.riskRewardRatio,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit2,
            bullishFactors: signal.factors.filter(f => f.signal === 'bullish').length,
            bearishFactors: signal.factors.filter(f => f.signal === 'bearish').length,
            reasoning: signal.reasoning
          });
        }
      } catch (err) {
        console.error(`Error scanning ${symbol}:`, err);
      }
    }

    // Sort by absolute score (best setups first)
    results.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        fearGreedIndex: fearGreed,
        scannedSymbols: results.length,
        topSetups: results.filter(r => r.recommendation !== 'no_trade' && r.recommendation !== 'hold'),
        allResults: results
      }
    });
  } catch (error) {
    console.error('Error in quick scan:', error);
    res.status(500).json({ success: false, error: 'Failed to perform quick scan' });
  }
});

/**
 * GET /api/enhanced-strategy/rules
 * Get the complete trading rules and strategy guidelines
 */
router.get('/rules', async (_req, res) => {
  res.json({
    success: true,
    data: {
      strategyName: 'Multi-Factor Confluence Trading System',
      version: '2.0',

      corePrinciples: [
        {
          rule: 'Confluence Requirement',
          description: 'Only trade when 4 or more factors align in the same direction',
          importance: 'Critical'
        },
        {
          rule: 'Risk/Reward Minimum',
          description: 'Minimum 1.5:1 risk/reward ratio required for any trade',
          importance: 'Critical'
        },
        {
          rule: 'Position Sizing',
          description: 'Never risk more than 1% of account per trade',
          importance: 'Critical'
        },
        {
          rule: 'Market Regime Filter',
          description: 'Avoid trading in volatile, directionless markets',
          importance: 'High'
        }
      ],

      entryRules: [
        'Wait for confluence score > 30 (long) or < -30 (short)',
        'Minimum 4 factors must align with trade direction',
        'Confidence must be >= 60%',
        'Risk/reward ratio must be >= 1.5:1',
        'Volume should confirm the move (>1x average)',
        'Prefer entries on pullbacks to key EMAs'
      ],

      exitRules: [
        'Initial stop loss: 1.5x ATR from entry',
        'Take Profit 1 (TP1): 1.5x ATR - take 50% off',
        'Take Profit 2 (TP2): 3x ATR - take 30% off',
        'Take Profit 3 (TP3): 4.5x ATR - take remaining 20%',
        'Move stop to breakeven after TP1 is hit',
        'Exit if major support/resistance is broken',
        'Exit if market regime changes dramatically'
      ],

      riskManagement: [
        'Maximum 1% account risk per trade',
        'Maximum 3 correlated positions at once',
        'Reduce position size by 50% in high volatility',
        'No trading after 2 consecutive losses (cool down)',
        'Weekly loss limit: 5% of account',
        'Monthly loss limit: 10% of account'
      ],

      confluenceFactors: [
        { name: 'RSI', weight: 15, description: 'Oversold <30 = bullish, Overbought >70 = bearish' },
        { name: 'MACD', weight: 20, description: 'Crossovers and histogram momentum' },
        { name: 'Bollinger Bands', weight: 10, description: 'Mean reversion at bands' },
        { name: 'EMA Alignment', weight: 25, description: 'EMA 9/21/50/200 stack and price position' },
        { name: 'Volume', weight: 10, description: 'Volume confirmation of moves' },
        { name: 'Market Regime', weight: 15, description: 'ADX-based trend strength' },
        { name: 'Fear & Greed', weight: 5, description: 'Contrarian sentiment indicator' }
      ],

      realisticExpectations: {
        targetWinRate: '60-70%',
        targetRiskReward: '2:1 average',
        expectedDrawdown: '10-15% max',
        monthlyReturnTarget: '3-8% (variable)',
        disclaimer: 'A 95% win rate is mathematically impossible in real markets. Professional traders achieve 55-65% with proper risk management. Focus on risk/reward ratio, not win rate.'
      },

      whatThisSystemDoesNOTDo: [
        'Guarantee profits',
        'Achieve 95% win rate (impossible)',
        'Predict the future',
        'Work in all market conditions',
        'Replace proper risk management'
      ]
    }
  });
});

/**
 * POST /api/enhanced-strategy/backtest
 * Simple backtest of the strategy on historical data
 */
router.post('/backtest', async (req, res) => {
  try {
    const { symbol, assetType = 'stock', days = 365 } = req.body;

    if (!symbol) {
      return res.status(400).json({ success: false, error: 'Symbol is required' });
    }

    const candles = await fetchHistoricalData(symbol, assetType, Math.min(365, days));

    if (candles.length < 100) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient data for backtest (need 100+ days)'
      });
    }

    // Simple backtest simulation
    let wins = 0;
    let losses = 0;
    let totalProfit = 0;
    let maxDrawdown = 0;
    let equity = 10000;
    let peakEquity = 10000;
    const trades: any[] = [];

    // Slide through data, analyzing each day
    for (let i = 100; i < candles.length - 5; i++) {
      const historicalSlice = candles.slice(0, i);
      const signal = enhancedTradingStrategy.generateConfluenceSignal(historicalSlice, 50);

      // Only take trades with clear signals
      if (signal.recommendation === 'strong_buy' || signal.recommendation === 'buy') {
        const entryPrice = candles[i].close;
        const stopLoss = signal.stopLoss;
        const takeProfit = signal.takeProfit2;

        // Check next 5 days for outcome
        let outcome: 'win' | 'loss' | 'open' = 'open';
        let exitPrice = entryPrice;
        let exitDay = i + 5;

        for (let j = i + 1; j <= Math.min(i + 5, candles.length - 1); j++) {
          const dayCandle = candles[j];

          if (dayCandle.low <= stopLoss) {
            outcome = 'loss';
            exitPrice = stopLoss;
            exitDay = j;
            break;
          }
          if (dayCandle.high >= takeProfit) {
            outcome = 'win';
            exitPrice = takeProfit;
            exitDay = j;
            break;
          }
        }

        if (outcome === 'open') {
          exitPrice = candles[Math.min(i + 5, candles.length - 1)].close;
          outcome = exitPrice > entryPrice ? 'win' : 'loss';
        }

        const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
        const riskAmount = equity * 0.01; // 1% risk
        const pnl = outcome === 'win' ? riskAmount * 2 : -riskAmount;

        equity += pnl;
        totalProfit += pnl;

        if (outcome === 'win') wins++;
        else losses++;

        // Track drawdown
        if (equity > peakEquity) peakEquity = equity;
        const currentDrawdown = ((peakEquity - equity) / peakEquity) * 100;
        if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;

        trades.push({
          date: new Date(candles[i].timestamp).toISOString().split('T')[0],
          direction: 'long',
          entry: entryPrice.toFixed(2),
          exit: exitPrice.toFixed(2),
          outcome,
          pnlPercent: pnlPercent.toFixed(2)
        });
      }
    }

    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    res.json({
      success: true,
      data: {
        symbol,
        period: `${candles.length} days`,
        totalTrades,
        wins,
        losses,
        winRate: winRate.toFixed(1) + '%',
        totalProfit: totalProfit.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(1) + '%',
        finalEquity: equity.toFixed(2),
        profitFactor: losses > 0 ? ((wins * 2) / losses).toFixed(2) : 'N/A',
        recentTrades: trades.slice(-10),
        note: 'This is a simplified backtest. Real results will vary due to slippage, fees, and market conditions.'
      }
    });
  } catch (error) {
    console.error('Backtest error:', error);
    res.status(500).json({ success: false, error: 'Failed to run backtest' });
  }
});

export default router;
