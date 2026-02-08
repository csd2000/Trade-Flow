import { db } from './db';
import { 
  automatedTradingRules, 
  automatedTradeExecutions, 
  ruleExecutionLogs,
  tradingConnections,
  tradeOrders,
  type AutomatedTradingRule,
  type TradingCondition
} from '@shared/schema';
import { eq, and, isNotNull, lte, gte } from 'drizzle-orm';
import { tradingExecutionService } from './trading-execution-service';

interface MarketData {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
  rsi?: number;
  ema9?: number;
  ema21?: number;
  ema200?: number;
  macd?: { value: number; signal: number; histogram: number };
  atr?: number;
  bollingerBands?: { upper: number; middle: number; lower: number };
}

interface ActivePosition {
  ruleId: number;
  executionId: number;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  trailingStopPrice?: number;
}

class AutomationEngine {
  private isRunning = false;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private activePositions: Map<number, ActivePosition> = new Map();
  private priceCache: Map<string, MarketData> = new Map();

  async start() {
    if (this.isRunning) {
      console.log('⚠️ Automation engine already running');
      return;
    }

    this.isRunning = true;
    console.log('🤖 Automation Engine started');

    this.checkInterval = setInterval(() => this.runCheckCycle(), 5000);

    await this.runCheckCycle();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Automation Engine stopped');
  }

  async runCheckCycle() {
    try {
      const activeRules = await this.getActiveRules();
      
      for (const rule of activeRules) {
        await this.processRule(rule);
      }
    } catch (error) {
      console.error('Automation cycle error:', error);
    }
  }

  private async getActiveRules(): Promise<AutomatedTradingRule[]> {
    return await db.select()
      .from(automatedTradingRules)
      .where(eq(automatedTradingRules.isActive, true));
  }

  async processRule(rule: AutomatedTradingRule) {
    try {
      if (!this.isWithinTradingHours(rule)) {
        return;
      }

      if (rule.maxDailyTrades && (rule.todayTradeCount ?? 0) >= rule.maxDailyTrades) {
        await this.logExecution(rule.id, 'skip', 'Max daily trades reached');
        return;
      }

      if (rule.maxDailyLoss && Number(rule.todayPnl ?? 0) <= -Number(rule.maxDailyLoss)) {
        await this.logExecution(rule.id, 'skip', 'Max daily loss reached');
        return;
      }

      const marketData = await this.getMarketData(rule.symbol);
      if (!marketData) {
        await this.logExecution(rule.id, 'error', `Failed to get market data for ${rule.symbol}`);
        return;
      }

      console.log(`📊 ${rule.symbol}: Price=$${marketData.price.toFixed(2)}, RSI=${marketData.rsi?.toFixed(1) || 'N/A'}, EMA9=${marketData.ema9?.toFixed(2) || 'N/A'}, MACD=${marketData.macd?.value.toFixed(2) || 'N/A'}`);

      const activePosition = this.activePositions.get(rule.id);

      if (activePosition) {
        await this.checkExitConditions(rule, activePosition, marketData);
      } else {
        await this.checkEntryConditions(rule, marketData);
      }

    } catch (error: any) {
      await this.logExecution(rule.id, 'error', error.message);
    }
  }

  private isWithinTradingHours(rule: AutomatedTradingRule): boolean {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: rule.timezone || 'America/New_York' }).toLowerCase();
    
    if (rule.tradingDays && !rule.tradingDays.includes(currentDay)) {
      return false;
    }

    if (rule.tradingHoursStart && rule.tradingHoursEnd) {
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: rule.timezone || 'America/New_York',
        hour: '2-digit',
        minute: '2-digit'
      });
      return timeStr >= rule.tradingHoursStart && timeStr <= rule.tradingHoursEnd;
    }

    return true;
  }

  private calculateRSI(closes: number[], period: number = 14): number | undefined {
    if (closes.length < period + 1) return undefined;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = closes.length - period; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(prices: number[], period: number): number | undefined {
    if (prices.length < period) return undefined;
    
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  private calculateMACD(closes: number[]): { value: number; signal: number; histogram: number } | undefined {
    if (closes.length < 35) return undefined;
    
    const macdValues: number[] = [];
    
    for (let i = 26; i <= closes.length; i++) {
      const slice = closes.slice(0, i);
      const ema12 = this.calculateEMA(slice, 12);
      const ema26 = this.calculateEMA(slice, 26);
      if (ema12 !== undefined && ema26 !== undefined) {
        macdValues.push(ema12 - ema26);
      }
    }
    
    if (macdValues.length < 9) return undefined;
    
    const signalLine = this.calculateEMA(macdValues, 9);
    const macdLine = macdValues[macdValues.length - 1];
    
    if (signalLine === undefined) return undefined;
    
    return {
      value: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine
    };
  }

  private async getMarketData(symbol: string): Promise<MarketData | null> {
    try {
      const cached = this.priceCache.get(symbol);
      if (cached) {
        return cached;
      }

      const yahooResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`);
      if (yahooResponse.ok) {
        const yahooData = await yahooResponse.json();
        const quote = yahooData.chart?.result?.[0]?.meta;
        const indicators = yahooData.chart?.result?.[0]?.indicators?.quote?.[0];
        
        if (quote && indicators) {
          const closes = (indicators.close || []).filter((c: number | null) => c !== null) as number[];
          const highs = (indicators.high || []).filter((h: number | null) => h !== null) as number[];
          const lows = (indicators.low || []).filter((l: number | null) => l !== null) as number[];
          const opens = (indicators.open || []).filter((o: number | null) => o !== null) as number[];
          const volumes = (indicators.volume || []).filter((v: number | null) => v !== null) as number[];
          
          const rsi = this.calculateRSI(closes, 14);
          const ema9 = this.calculateEMA(closes, 9);
          const ema21 = this.calculateEMA(closes, 21);
          const ema200 = this.calculateEMA(closes, 200);
          const macd = this.calculateMACD(closes);
          
          const marketData: MarketData = {
            symbol,
            price: quote.regularMarketPrice || closes[closes.length - 1] || 0,
            open: opens[opens.length - 1] || 0,
            high: highs[highs.length - 1] || 0,
            low: lows[lows.length - 1] || 0,
            close: closes[closes.length - 1] || 0,
            volume: volumes[volumes.length - 1] || 0,
            change: (quote.regularMarketPrice || 0) - (quote.previousClose || 0),
            changePercent: quote.regularMarketPrice && quote.previousClose 
              ? ((quote.regularMarketPrice - quote.previousClose) / quote.previousClose * 100) 
              : 0,
            rsi,
            ema9,
            ema21,
            ema200,
            macd
          };
          
          this.priceCache.set(symbol, marketData);
          setTimeout(() => this.priceCache.delete(symbol), 5000);
          return marketData;
        }
      }

      const response = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${process.env.POLYGON_API_KEY}`);
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const result = data.results?.[0];
      
      if (!result) return null;

      const marketData: MarketData = {
        symbol,
        price: result.c,
        open: result.o,
        high: result.h,
        low: result.l,
        close: result.c,
        volume: result.v,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100
      };

      this.priceCache.set(symbol, marketData);
      setTimeout(() => this.priceCache.delete(symbol), 5000);

      return marketData;
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      return null;
    }
  }

  private async checkEntryConditions(rule: AutomatedTradingRule, marketData: MarketData) {
    const conditions = rule.entryConditions as TradingCondition[];
    
    if (!conditions || conditions.length === 0) {
      return;
    }

    const allConditionsMet = conditions.every(condition => 
      this.evaluateCondition(condition, marketData)
    );

    if (allConditionsMet) {
      await this.executeEntry(rule, marketData, conditions);
    }
  }

  private async checkExitConditions(rule: AutomatedTradingRule, position: ActivePosition, marketData: MarketData) {
    const currentPrice = marketData.price;

    if (position.side === 'buy') {
      if (currentPrice <= position.stopLoss) {
        await this.executeExit(rule, position, marketData, 'stop_loss');
        return;
      }
      if (position.takeProfit && currentPrice >= position.takeProfit) {
        await this.executeExit(rule, position, marketData, 'take_profit');
        return;
      }
    } else {
      if (currentPrice >= position.stopLoss) {
        await this.executeExit(rule, position, marketData, 'stop_loss');
        return;
      }
      if (position.takeProfit && currentPrice <= position.takeProfit) {
        await this.executeExit(rule, position, marketData, 'take_profit');
        return;
      }
    }

    if (rule.trailingStopActivation && rule.trailingStopDistance) {
      const profitPercent = position.side === 'buy'
        ? ((currentPrice - position.entryPrice) / position.entryPrice) * 100
        : ((position.entryPrice - currentPrice) / position.entryPrice) * 100;

      if (profitPercent >= Number(rule.trailingStopActivation)) {
        const trailingDistance = Number(rule.trailingStopDistance) / 100;
        const newTrailingStop = position.side === 'buy'
          ? currentPrice * (1 - trailingDistance)
          : currentPrice * (1 + trailingDistance);

        if (!position.trailingStopPrice || 
            (position.side === 'buy' && newTrailingStop > position.trailingStopPrice) ||
            (position.side === 'sell' && newTrailingStop < position.trailingStopPrice)) {
          position.trailingStopPrice = newTrailingStop;
        }

        if ((position.side === 'buy' && currentPrice <= position.trailingStopPrice) ||
            (position.side === 'sell' && currentPrice >= position.trailingStopPrice)) {
          await this.executeExit(rule, position, marketData, 'trailing_stop');
          return;
        }
      }
    }

    const exitConditions = rule.exitConditions as TradingCondition[];
    if (exitConditions && exitConditions.length > 0) {
      const anyExitConditionMet = exitConditions.some(condition => 
        this.evaluateCondition(condition, marketData, position)
      );

      if (anyExitConditionMet) {
        await this.executeExit(rule, position, marketData, 'exit');
      }
    }
  }

  private evaluateCondition(condition: TradingCondition, marketData: MarketData, position?: ActivePosition): boolean {
    const { type, operator, value } = condition;

    switch (type) {
      case 'price':
        return this.compareValue(marketData.price, operator, value);
      
      case 'price_above':
        return marketData.price > value;
      
      case 'price_below':
        return marketData.price < value;
      
      case 'rsi':
      case 'rsi_above':
        return marketData.rsi !== undefined && marketData.rsi > value;
      
      case 'rsi_below':
        return marketData.rsi !== undefined && marketData.rsi < value;
      
      case 'ema_cross_above':
        if (!marketData.ema9 || !marketData.ema21) return false;
        return marketData.ema9 > marketData.ema21;
      
      case 'ema_cross_below':
        if (!marketData.ema9 || !marketData.ema21) return false;
        return marketData.ema9 < marketData.ema21;
      
      case 'macd_crossover':
        if (!marketData.macd) return false;
        return marketData.macd.value > marketData.macd.signal;
      
      case 'macd_crossunder':
        if (!marketData.macd) return false;
        return marketData.macd.value < marketData.macd.signal;
      
      case 'volume_spike':
        return false;
      
      case 'profit_percent':
        if (!position) return false;
        const profitPct = position.side === 'buy'
          ? ((marketData.price - position.entryPrice) / position.entryPrice) * 100
          : ((position.entryPrice - marketData.price) / position.entryPrice) * 100;
        return profitPct >= value;
      
      case 'loss_percent':
        if (!position) return false;
        const lossPct = position.side === 'buy'
          ? ((position.entryPrice - marketData.price) / position.entryPrice) * 100
          : ((marketData.price - position.entryPrice) / position.entryPrice) * 100;
        return lossPct >= value;
      
      default:
        return false;
    }
  }

  private compareValue(actual: number, operator: string, target: number): boolean {
    switch (operator) {
      case 'above':
        return actual > target;
      case 'below':
        return actual < target;
      case 'equals':
        return Math.abs(actual - target) < 0.0001;
      case 'crosses_above':
        return actual > target;
      case 'crosses_below':
        return actual < target;
      default:
        return false;
    }
  }

  private async executeEntry(rule: AutomatedTradingRule, marketData: MarketData, triggeredConditions: TradingCondition[]) {
    try {
      const quantity = this.calculatePositionSize(rule, marketData.price);
      const side = 'buy';
      
      const stopLossPrice = this.calculateStopLoss(rule, marketData.price, side);
      const takeProfitPrice = this.calculateTakeProfit(rule, marketData.price, side, stopLossPrice);

      const [execution] = await db.insert(automatedTradeExecutions).values({
        ruleId: rule.id,
        connectionId: rule.connectionId,
        symbol: rule.symbol,
        side,
        executionType: 'entry',
        triggeredConditions,
        quantity: quantity.toString(),
        entryPrice: marketData.price.toString(),
        stopLoss: stopLossPrice?.toString(),
        takeProfit: takeProfitPrice?.toString(),
        status: 'pending'
      }).returning();

      if (rule.connectionId) {
        const [connection] = await db.select()
          .from(tradingConnections)
          .where(eq(tradingConnections.id, rule.connectionId));

        if (connection && connection.isActive) {
          const result = await tradingExecutionService.executeOrder(
            connection.platform as 'binance' | 'alpaca' | 'oanda' | 'coinbase',
            {
              symbol: rule.symbol,
              side,
              quantity,
              orderType: 'market',
              stopPrice: stopLossPrice,
              takeProfitPrice
            },
            rule.isPaperTrading ?? true
          );

          await db.update(automatedTradeExecutions)
            .set({
              status: result.success ? 'filled' : 'rejected',
              errorMessage: result.success ? null : result.message
            })
            .where(eq(automatedTradeExecutions.id, execution.id));

          if (result.success) {
            this.activePositions.set(rule.id, {
              ruleId: rule.id,
              executionId: execution.id,
              symbol: rule.symbol,
              side,
              entryPrice: marketData.price,
              quantity,
              stopLoss: stopLossPrice || 0,
              takeProfit: takeProfitPrice || 0
            });

            await db.update(automatedTradingRules)
              .set({
                lastTriggeredAt: new Date(),
                todayTradeCount: (rule.todayTradeCount ?? 0) + 1,
                totalTrades: (rule.totalTrades ?? 0) + 1
              })
              .where(eq(automatedTradingRules.id, rule.id));
          }
        }
      }

      await this.logExecution(rule.id, 'execute', `Entry executed: ${side} ${quantity} ${rule.symbol} @ ${marketData.price}`, triggeredConditions, marketData);

    } catch (error: any) {
      await this.logExecution(rule.id, 'error', `Entry failed: ${error.message}`);
    }
  }

  private async executeExit(rule: AutomatedTradingRule, position: ActivePosition, marketData: MarketData, exitType: string) {
    try {
      const pnl = position.side === 'buy'
        ? (marketData.price - position.entryPrice) * position.quantity
        : (position.entryPrice - marketData.price) * position.quantity;

      const pnlPercent = position.side === 'buy'
        ? ((marketData.price - position.entryPrice) / position.entryPrice) * 100
        : ((position.entryPrice - marketData.price) / position.entryPrice) * 100;

      await db.update(automatedTradeExecutions)
        .set({
          exitPrice: marketData.price.toString(),
          pnl: pnl.toString(),
          pnlPercent: pnlPercent.toString(),
          status: 'filled',
          closedAt: new Date()
        })
        .where(eq(automatedTradeExecutions.id, position.executionId));

      if (rule.connectionId) {
        const [connection] = await db.select()
          .from(tradingConnections)
          .where(eq(tradingConnections.id, rule.connectionId));

        if (connection && connection.isActive) {
          await tradingExecutionService.executeOrder(
            connection.platform as 'binance' | 'alpaca' | 'oanda' | 'coinbase',
            {
              symbol: rule.symbol,
              side: position.side === 'buy' ? 'sell' : 'buy',
              quantity: position.quantity,
              orderType: 'market'
            },
            rule.isPaperTrading ?? true
          );
        }
      }

      this.activePositions.delete(rule.id);

      const newTodayPnl = Number(rule.todayPnl ?? 0) + pnl;
      const newWinningTrades = pnl > 0 ? (rule.winningTrades ?? 0) + 1 : (rule.winningTrades ?? 0);

      await db.update(automatedTradingRules)
        .set({
          todayPnl: newTodayPnl.toString(),
          winningTrades: newWinningTrades
        })
        .where(eq(automatedTradingRules.id, rule.id));

      await this.logExecution(rule.id, 'execute', `Exit (${exitType}): ${position.side === 'buy' ? 'sell' : 'buy'} ${position.quantity} ${rule.symbol} @ ${marketData.price}, P/L: $${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)`);

    } catch (error: any) {
      await this.logExecution(rule.id, 'error', `Exit failed: ${error.message}`);
    }
  }

  private calculatePositionSize(rule: AutomatedTradingRule, currentPrice: number): number {
    const size = Number(rule.positionSize);
    
    switch (rule.positionSizeType) {
      case 'fixed':
        return size;
      
      case 'percent_capital':
        return size;
      
      case 'risk_based':
        const stopLossPercent = Number(rule.stopLossValue);
        const riskAmount = size;
        const stopLossDistance = currentPrice * (stopLossPercent / 100);
        return riskAmount / stopLossDistance;
      
      default:
        return size;
    }
  }

  private calculateStopLoss(rule: AutomatedTradingRule, entryPrice: number, side: string): number | undefined {
    const value = Number(rule.stopLossValue);
    if (!value) return undefined;

    switch (rule.stopLossType) {
      case 'percentage':
        return side === 'buy' 
          ? entryPrice * (1 - value / 100)
          : entryPrice * (1 + value / 100);
      
      case 'fixed':
        return side === 'buy'
          ? entryPrice - value
          : entryPrice + value;
      
      default:
        return undefined;
    }
  }

  private calculateTakeProfit(rule: AutomatedTradingRule, entryPrice: number, side: string, stopLoss?: number): number | undefined {
    const value = Number(rule.takeProfitValue);
    if (!value) return undefined;

    switch (rule.takeProfitType) {
      case 'percentage':
        return side === 'buy'
          ? entryPrice * (1 + value / 100)
          : entryPrice * (1 - value / 100);
      
      case 'fixed':
        return side === 'buy'
          ? entryPrice + value
          : entryPrice - value;
      
      case 'risk_reward':
        if (!stopLoss) return undefined;
        const riskDistance = Math.abs(entryPrice - stopLoss);
        return side === 'buy'
          ? entryPrice + (riskDistance * value)
          : entryPrice - (riskDistance * value);
      
      default:
        return undefined;
    }
  }

  private async logExecution(ruleId: number, logType: string, message: string, conditions?: any, marketData?: any) {
    try {
      await db.insert(ruleExecutionLogs).values({
        ruleId,
        logType,
        message,
        conditionsChecked: conditions,
        marketData
      });
    } catch (error) {
      console.error('Failed to log execution:', error);
    }
  }

  async resetDailyCounters() {
    await db.update(automatedTradingRules)
      .set({
        todayTradeCount: 0,
        todayPnl: '0'
      });
    console.log('✅ Daily counters reset');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activePositions: Array.from(this.activePositions.values()),
      cacheSize: this.priceCache.size
    };
  }
}

export const automationEngine = new AutomationEngine();
