import Anthropic from '@anthropic-ai/sdk';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY || '',
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export interface ParsedRule {
  id: string;
  name: string;
  type: 'entry' | 'exit' | 'stop_loss' | 'take_profit';
  condition: string;
  indicator?: string;
  params?: Record<string, number | string>;
  description: string;
}

export interface ParsedStrategy {
  name: string;
  description: string;
  sourceType: 'text' | 'pine_script' | 'mt4' | 'youtube';
  entryRules: ParsedRule[];
  exitRules: ParsedRule[];
  stopLossRules: ParsedRule[];
  takeProfitRules: ParsedRule[];
  riskManagement?: {
    maxRiskPercent?: number;
    positionSizeMethod?: string;
  };
}

export interface TradeSignal {
  type: 'entry' | 'exit' | 'stop_loss' | 'take_profit';
  direction: 'LONG' | 'SHORT';
  price: number;
  timestamp: Date;
  barIndex: number;
  reason: string;
  confidence: number;
}

export interface ChartAnnotation {
  type: 'entry' | 'exit' | 'stop_loss' | 'take_profit' | 'indicator' | 'level';
  label: string;
  price: number;
  barIndex: number;
  color: string;
  shape: 'triangle' | 'circle' | 'line' | 'zone';
  direction?: 'up' | 'down';
}

export interface StrategyAnalysisResult {
  symbol: string;
  strategy: ParsedStrategy;
  ohlcv: {
    time: string[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    volume: number[];
  };
  signals: TradeSignal[];
  annotations: ChartAnnotation[];
  currentPrice: number;
  suggestedEntry?: { price: number; reason: string };
  suggestedExit?: { price: number; reason: string };
  suggestedStopLoss?: { price: number; reason: string };
  suggestedTakeProfit?: { price: number; reason: string };
  analysis: string;
}

export class StrategyAnalyzerService {
  async parseStrategyRules(input: string, sourceType: 'text' | 'pine_script' | 'mt4' | 'youtube'): Promise<ParsedStrategy> {
    const prompt = this.buildParsePrompt(input, sourceType);
    
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      const jsonMatch = content.text.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content.text;
      
      return JSON.parse(jsonStr) as ParsedStrategy;
    } catch (error) {
      console.error('AI parsing failed, using fallback:', error);
      return this.fallbackParse(input, sourceType);
    }
  }

  private buildParsePrompt(input: string, sourceType: string): string {
    return `You are a trading strategy analyzer. Parse the following ${sourceType} trading rules and extract a structured strategy.

INPUT:
${input}

Extract and return a JSON object with this structure:
{
  "name": "Strategy Name",
  "description": "Brief description of the strategy",
  "sourceType": "${sourceType}",
  "entryRules": [
    {
      "id": "entry_1",
      "name": "Rule name",
      "type": "entry",
      "condition": "Condition description (e.g., 'RSI crosses below 30')",
      "indicator": "Indicator name if applicable (e.g., 'RSI', 'MACD', 'EMA')",
      "params": { "period": 14, "threshold": 30 },
      "description": "Human readable explanation"
    }
  ],
  "exitRules": [...],
  "stopLossRules": [
    {
      "id": "sl_1",
      "name": "Stop Loss",
      "type": "stop_loss",
      "condition": "How to calculate stop loss (e.g., 'Below swing low', 'ATR-based', 'Percentage')",
      "params": { "atr_multiplier": 2, "percentage": 2 },
      "description": "Human readable explanation"
    }
  ],
  "takeProfitRules": [...],
  "riskManagement": {
    "maxRiskPercent": 2,
    "positionSizeMethod": "fixed_risk"
  }
}

For Pine Script, interpret the logic of study/strategy functions, entry/exit conditions, and plotshape markers.
For MT4/MQL4, interpret OrderSend, OrderClose, and signal generation logic.
For text/YouTube rules, extract the logical conditions described.

Return ONLY the JSON object wrapped in \`\`\`json code blocks.`;
  }

  private fallbackParse(input: string, sourceType: string): ParsedStrategy {
    const lowerInput = input.toLowerCase();
    const entryRules: ParsedRule[] = [];
    const exitRules: ParsedRule[] = [];
    const stopLossRules: ParsedRule[] = [];
    const takeProfitRules: ParsedRule[] = [];

    if (lowerInput.includes('rsi') && lowerInput.includes('30')) {
      entryRules.push({
        id: 'entry_rsi_oversold',
        name: 'RSI Oversold Entry',
        type: 'entry',
        condition: 'RSI crosses below 30',
        indicator: 'RSI',
        params: { period: 14, threshold: 30 },
        description: 'Enter when RSI indicates oversold conditions'
      });
    }

    if (lowerInput.includes('macd') && (lowerInput.includes('cross') || lowerInput.includes('signal'))) {
      entryRules.push({
        id: 'entry_macd_cross',
        name: 'MACD Crossover Entry',
        type: 'entry',
        condition: 'MACD crosses above signal line',
        indicator: 'MACD',
        params: { fast: 12, slow: 26, signal: 9 },
        description: 'Enter on bullish MACD crossover'
      });
    }

    if (lowerInput.includes('ema') || lowerInput.includes('moving average')) {
      entryRules.push({
        id: 'entry_ema_cross',
        name: 'EMA Crossover Entry',
        type: 'entry',
        condition: 'Fast EMA crosses above slow EMA',
        indicator: 'EMA',
        params: { fast: 9, slow: 21 },
        description: 'Enter on bullish EMA crossover'
      });
    }

    if (lowerInput.includes('stop') && lowerInput.includes('loss')) {
      const atrMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?:x|times|atr)/i);
      const percentMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*%/);
      
      stopLossRules.push({
        id: 'sl_1',
        name: 'Stop Loss',
        type: 'stop_loss',
        condition: atrMatch ? 'ATR-based stop loss' : percentMatch ? 'Percentage-based stop loss' : 'Swing low stop loss',
        params: atrMatch ? { atr_multiplier: parseFloat(atrMatch[1]) } : percentMatch ? { percentage: parseFloat(percentMatch[1]) } : { swing_lookback: 10 },
        description: 'Calculated stop loss level'
      });
    }

    if (lowerInput.includes('take profit') || lowerInput.includes('target')) {
      const rrMatch = lowerInput.match(/(\d+(?:\.\d+)?)\s*(?::|to|r)/i);
      takeProfitRules.push({
        id: 'tp_1',
        name: 'Take Profit',
        type: 'take_profit',
        condition: 'Risk/Reward ratio target',
        params: { rr_ratio: rrMatch ? parseFloat(rrMatch[1]) : 2 },
        description: 'Take profit at specified risk/reward ratio'
      });
    }

    if (entryRules.length === 0) {
      entryRules.push({
        id: 'entry_default',
        name: 'Price Action Entry',
        type: 'entry',
        condition: 'Price breaks above resistance or below support',
        description: 'Default price action entry rule'
      });
    }

    if (stopLossRules.length === 0) {
      stopLossRules.push({
        id: 'sl_default',
        name: 'Default Stop Loss',
        type: 'stop_loss',
        condition: '2% below entry for long, 2% above entry for short',
        params: { percentage: 2 },
        description: 'Default percentage-based stop loss'
      });
    }

    return {
      name: 'Custom Strategy',
      description: 'Strategy parsed from user input',
      sourceType: sourceType as any,
      entryRules,
      exitRules,
      stopLossRules,
      takeProfitRules,
      riskManagement: { maxRiskPercent: 2, positionSizeMethod: 'fixed_risk' }
    };
  }

  async fetchMarketData(symbol: string, period: string = '1M'): Promise<{
    ohlcv: StrategyAnalysisResult['ohlcv'];
    currentPrice: number;
  }> {
    const yahooSymbol = symbol.includes('/') ? symbol.replace('/', '-') : symbol;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1W': startDate.setDate(startDate.getDate() - 7); break;
      case '1M': startDate.setMonth(startDate.getMonth() - 1); break;
      case '3M': startDate.setMonth(startDate.getMonth() - 3); break;
      case '6M': startDate.setMonth(startDate.getMonth() - 6); break;
      case '1Y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate.setMonth(startDate.getMonth() - 1);
    }

    const historical = await yahooFinance.chart(yahooSymbol, {
      period1: startDate,
      period2: endDate,
      interval: period === '1W' ? '15m' : period === '1M' ? '1h' : '1d'
    });

    if (!historical?.quotes || historical.quotes.length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    const ohlcv = {
      time: historical.quotes.map(q => new Date(q.date).toISOString()),
      open: historical.quotes.map(q => q.open || 0),
      high: historical.quotes.map(q => q.high || 0),
      low: historical.quotes.map(q => q.low || 0),
      close: historical.quotes.map(q => q.close || 0),
      volume: historical.quotes.map(q => q.volume || 0)
    };

    const currentPrice = ohlcv.close[ohlcv.close.length - 1];

    return { ohlcv, currentPrice };
  }

  calculateRSI(closes: number[], period: number = 14): number[] {
    const rsi: number[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < period) {
        rsi.push(50);
        continue;
      }
      
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const change = closes[j] - closes[j - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      
      const avgGain = gains / period;
      const avgLoss = losses / period;
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    return rsi;
  }

  calculateEMA(data: number[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ema.push(data[i]);
      } else if (i === period - 1) {
        const sum = data.slice(0, period).reduce((a, b) => a + b, 0);
        ema.push(sum / period);
      } else {
        ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
      }
    }
    return ema;
  }

  calculateMACD(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macd = ema12.map((val, i) => val - ema26[i]);
    const signal = this.calculateEMA(macd, 9);
    const histogram = macd.map((val, i) => val - signal[i]);
    return { macd, signal, histogram };
  }

  calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    const tr: number[] = [];
    const atr: number[] = [];
    
    for (let i = 0; i < highs.length; i++) {
      if (i === 0) {
        tr.push(highs[i] - lows[i]);
      } else {
        const highLow = highs[i] - lows[i];
        const highClose = Math.abs(highs[i] - closes[i - 1]);
        const lowClose = Math.abs(lows[i] - closes[i - 1]);
        tr.push(Math.max(highLow, highClose, lowClose));
      }
    }
    
    for (let i = 0; i < tr.length; i++) {
      if (i < period - 1) {
        atr.push(tr[i]);
      } else if (i === period - 1) {
        atr.push(tr.slice(0, period).reduce((a, b) => a + b, 0) / period);
      } else {
        atr.push((atr[i - 1] * (period - 1) + tr[i]) / period);
      }
    }
    return atr;
  }

  findSwingPoints(highs: number[], lows: number[], lookback: number = 5): { swingHighs: number[]; swingLows: number[] } {
    const swingHighs: number[] = new Array(highs.length).fill(NaN);
    const swingLows: number[] = new Array(lows.length).fill(NaN);
    
    for (let i = lookback; i < highs.length - lookback; i++) {
      let isSwingHigh = true;
      let isSwingLow = true;
      
      for (let j = 1; j <= lookback; j++) {
        if (highs[i] <= highs[i - j] || highs[i] <= highs[i + j]) isSwingHigh = false;
        if (lows[i] >= lows[i - j] || lows[i] >= lows[i + j]) isSwingLow = false;
      }
      
      if (isSwingHigh) swingHighs[i] = highs[i];
      if (isSwingLow) swingLows[i] = lows[i];
    }
    
    return { swingHighs, swingLows };
  }

  async analyzeStrategy(symbol: string, strategy: ParsedStrategy, period: string = '1M'): Promise<StrategyAnalysisResult> {
    const { ohlcv, currentPrice } = await this.fetchMarketData(symbol, period);
    
    const signals: TradeSignal[] = [];
    const annotations: ChartAnnotation[] = [];
    
    const closes = ohlcv.close;
    const highs = ohlcv.high;
    const lows = ohlcv.low;
    const len = closes.length;
    
    const rsi = this.calculateRSI(closes, 14);
    const macd = this.calculateMACD(closes);
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    const atr = this.calculateATR(highs, lows, closes, 14);
    const { swingHighs, swingLows } = this.findSwingPoints(highs, lows, 5);

    for (const rule of strategy.entryRules) {
      for (let i = 20; i < len; i++) {
        let triggered = false;
        let direction: 'LONG' | 'SHORT' = 'LONG';
        
        if (rule.indicator === 'RSI') {
          const threshold = (rule.params?.threshold as number) || 30;
          if (rsi[i] < threshold && rsi[i - 1] >= threshold) {
            triggered = true;
            direction = 'LONG';
          } else if (rsi[i] > (100 - threshold) && rsi[i - 1] <= (100 - threshold)) {
            triggered = true;
            direction = 'SHORT';
          }
        } else if (rule.indicator === 'MACD') {
          if (macd.macd[i] > macd.signal[i] && macd.macd[i - 1] <= macd.signal[i - 1]) {
            triggered = true;
            direction = 'LONG';
          } else if (macd.macd[i] < macd.signal[i] && macd.macd[i - 1] >= macd.signal[i - 1]) {
            triggered = true;
            direction = 'SHORT';
          }
        } else if (rule.indicator === 'EMA') {
          if (ema9[i] > ema21[i] && ema9[i - 1] <= ema21[i - 1]) {
            triggered = true;
            direction = 'LONG';
          } else if (ema9[i] < ema21[i] && ema9[i - 1] >= ema21[i - 1]) {
            triggered = true;
            direction = 'SHORT';
          }
        }
        
        if (triggered) {
          signals.push({
            type: 'entry',
            direction,
            price: closes[i],
            timestamp: new Date(ohlcv.time[i]),
            barIndex: i,
            reason: rule.description,
            confidence: 75
          });
          
          annotations.push({
            type: 'entry',
            label: `${direction} Entry`,
            price: closes[i],
            barIndex: i,
            color: direction === 'LONG' ? '#22c55e' : '#ef4444',
            shape: 'triangle',
            direction: direction === 'LONG' ? 'up' : 'down'
          });
        }
      }
    }

    let suggestedEntry: { price: number; reason: string } | undefined;
    let suggestedExit: { price: number; reason: string } | undefined;
    let suggestedStopLoss: { price: number; reason: string } | undefined;
    let suggestedTakeProfit: { price: number; reason: string } | undefined;

    const lastRsi = rsi[len - 1];
    const lastMacdHist = macd.histogram[len - 1];
    const ema9Last = ema9[len - 1];
    const ema21Last = ema21[len - 1];
    const atrLast = atr[len - 1];

    let lastSwingLow = currentPrice;
    let lastSwingHigh = currentPrice;
    for (let i = len - 1; i >= Math.max(0, len - 50); i--) {
      if (!isNaN(swingLows[i])) {
        lastSwingLow = swingLows[i];
        break;
      }
    }
    for (let i = len - 1; i >= Math.max(0, len - 50); i--) {
      if (!isNaN(swingHighs[i])) {
        lastSwingHigh = swingHighs[i];
        break;
      }
    }

    let direction: 'LONG' | 'SHORT' = 'LONG';
    let entryReason = '';

    if (lastRsi < 30) {
      direction = 'LONG';
      entryReason = 'RSI oversold, potential reversal';
    } else if (lastRsi > 70) {
      direction = 'SHORT';
      entryReason = 'RSI overbought, potential reversal';
    } else if (ema9Last > ema21Last && lastMacdHist > 0) {
      direction = 'LONG';
      entryReason = 'Bullish EMA alignment with positive MACD';
    } else if (ema9Last < ema21Last && lastMacdHist < 0) {
      direction = 'SHORT';
      entryReason = 'Bearish EMA alignment with negative MACD';
    } else {
      entryReason = 'Neutral conditions, wait for confirmation';
    }

    suggestedEntry = {
      price: currentPrice,
      reason: entryReason
    };

    for (const rule of strategy.stopLossRules) {
      if (rule.params?.atr_multiplier) {
        const multiplier = rule.params.atr_multiplier as number;
        suggestedStopLoss = {
          price: direction === 'LONG' 
            ? currentPrice - (atrLast * multiplier)
            : currentPrice + (atrLast * multiplier),
          reason: `${multiplier}x ATR stop (ATR: ${atrLast.toFixed(2)})`
        };
      } else if (rule.params?.percentage) {
        const pct = rule.params.percentage as number;
        suggestedStopLoss = {
          price: direction === 'LONG'
            ? currentPrice * (1 - pct / 100)
            : currentPrice * (1 + pct / 100),
          reason: `${pct}% stop loss`
        };
      } else if (rule.params?.swing_lookback || rule.condition.includes('swing')) {
        suggestedStopLoss = {
          price: direction === 'LONG' ? lastSwingLow * 0.99 : lastSwingHigh * 1.01,
          reason: `Below recent swing ${direction === 'LONG' ? 'low' : 'high'}`
        };
      }
    }

    if (!suggestedStopLoss) {
      suggestedStopLoss = {
        price: direction === 'LONG' ? lastSwingLow * 0.99 : lastSwingHigh * 1.01,
        reason: `Default: Below recent swing ${direction === 'LONG' ? 'low' : 'high'}`
      };
    }

    for (const rule of strategy.takeProfitRules) {
      if (rule.params?.rr_ratio) {
        const rr = rule.params.rr_ratio as number;
        const risk = Math.abs(currentPrice - suggestedStopLoss.price);
        suggestedTakeProfit = {
          price: direction === 'LONG'
            ? currentPrice + (risk * rr)
            : currentPrice - (risk * rr),
          reason: `${rr}:1 Risk/Reward ratio`
        };
      }
    }

    if (!suggestedTakeProfit) {
      const risk = Math.abs(currentPrice - suggestedStopLoss.price);
      suggestedTakeProfit = {
        price: direction === 'LONG'
          ? currentPrice + (risk * 2)
          : currentPrice - (risk * 2),
        reason: 'Default 2:1 Risk/Reward ratio'
      };
    }

    suggestedExit = {
      price: suggestedTakeProfit.price,
      reason: suggestedTakeProfit.reason
    };

    if (suggestedEntry) {
      annotations.push({
        type: 'entry',
        label: 'Suggested Entry',
        price: suggestedEntry.price,
        barIndex: len - 1,
        color: '#3b82f6',
        shape: 'circle'
      });
    }

    if (suggestedStopLoss) {
      annotations.push({
        type: 'stop_loss',
        label: 'Stop Loss',
        price: suggestedStopLoss.price,
        barIndex: len - 1,
        color: '#ef4444',
        shape: 'line'
      });
    }

    if (suggestedTakeProfit) {
      annotations.push({
        type: 'take_profit',
        label: 'Take Profit',
        price: suggestedTakeProfit.price,
        barIndex: len - 1,
        color: '#22c55e',
        shape: 'line'
      });
    }

    const analysis = this.generateAnalysisSummary(
      symbol, strategy, currentPrice, direction, 
      suggestedEntry, suggestedStopLoss, suggestedTakeProfit,
      lastRsi, lastMacdHist, signals.length
    );

    return {
      symbol,
      strategy,
      ohlcv,
      signals,
      annotations,
      currentPrice,
      suggestedEntry,
      suggestedExit,
      suggestedStopLoss,
      suggestedTakeProfit,
      analysis
    };
  }

  private generateAnalysisSummary(
    symbol: string,
    strategy: ParsedStrategy,
    currentPrice: number,
    direction: 'LONG' | 'SHORT',
    entry: { price: number; reason: string } | undefined,
    stopLoss: { price: number; reason: string } | undefined,
    takeProfit: { price: number; reason: string } | undefined,
    rsi: number,
    macdHist: number,
    signalCount: number
  ): string {
    const riskAmount = entry && stopLoss ? Math.abs(entry.price - stopLoss.price) : 0;
    const rewardAmount = entry && takeProfit ? Math.abs(takeProfit.price - entry.price) : 0;
    const rrRatio = riskAmount > 0 ? (rewardAmount / riskAmount).toFixed(2) : 'N/A';
    const riskPercent = entry ? ((riskAmount / entry.price) * 100).toFixed(2) : 'N/A';

    return `
## Strategy Analysis: ${strategy.name}

### Current Market Conditions
- **Symbol**: ${symbol}
- **Current Price**: $${currentPrice.toFixed(2)}
- **RSI(14)**: ${rsi.toFixed(1)} ${rsi < 30 ? '(Oversold)' : rsi > 70 ? '(Overbought)' : '(Neutral)'}
- **MACD Histogram**: ${macdHist.toFixed(4)} ${macdHist > 0 ? '(Bullish)' : '(Bearish)'}
- **Historical Signals**: ${signalCount} entry signals detected in the period

### Trade Setup (${direction})
| Level | Price | Reason |
|-------|-------|--------|
| **Entry** | $${entry?.price.toFixed(2) || 'N/A'} | ${entry?.reason || 'N/A'} |
| **Stop Loss** | $${stopLoss?.price.toFixed(2) || 'N/A'} | ${stopLoss?.reason || 'N/A'} |
| **Take Profit** | $${takeProfit?.price.toFixed(2) || 'N/A'} | ${takeProfit?.reason || 'N/A'} |

### Risk Analysis
- **Risk Amount**: $${riskAmount.toFixed(2)} (${riskPercent}%)
- **Reward Amount**: $${rewardAmount.toFixed(2)}
- **Risk/Reward Ratio**: ${rrRatio}

### Rules Applied
**Entry Rules**: ${strategy.entryRules.map(r => r.name).join(', ') || 'None'}
**Stop Loss Rules**: ${strategy.stopLossRules.map(r => r.name).join(', ') || 'None'}
**Take Profit Rules**: ${strategy.takeProfitRules.map(r => r.name).join(', ') || 'None'}
    `.trim();
  }
}

export const strategyAnalyzerService = new StrategyAnalyzerService();
