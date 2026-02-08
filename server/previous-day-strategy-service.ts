import Anthropic from '@anthropic-ai/sdk';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PreviousDaySignal {
  asset: string;
  signal: 'BUY' | 'SELL' | 'WAIT';
  signalType: 'PDH_BREAKOUT' | 'PDL_BREAKOUT' | 'NONE';
  confidence: number;          // 1-10
  entryPrice: number;
  stopLoss: number;
  exitTarget1: number;         // 1:1 risk/reward
  exitTarget2: number;         // 2:1 risk/reward
  reasoning: string[];
  previousDayHigh: number;
  previousDayLow: number;
  previousDayClose: number;
  previousDayVolume: number;
  currentPrice: number;
  volumeRatio: number;         // Current vs average
  breakoutStrength: number;    // % above/below PDH/PDL
  timestamp: string;
}

export class PreviousDayStrategyService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async analyzeAsset(symbol: string): Promise<PreviousDaySignal> {
    try {
      // Fetch daily data (last 30 days to get yesterday's data and calculate averages)
      const candles = await this.fetchDailyData(symbol);
      if (candles.length < 2) {
        return this.createWaitSignal(symbol, 'Insufficient historical data');
      }

      // Get yesterday's candle (index -2) and today's candle (index -1)
      const yesterday = candles[candles.length - 2];
      const today = candles[candles.length - 1];

      // Calculate 20-period average volume
      const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / Math.min(20, candles.length);
      const volumeRatio = today.volume / avgVolume;

      // Check for breakouts
      let signal: PreviousDaySignal['signalType'] = 'NONE';
      let entryPrice = 0;
      let stopLoss = 0;
      let exitTarget1 = 0;
      let exitTarget2 = 0;
      let confidence = 0;
      const reasoning: string[] = [];

      // Check if today's high is above yesterday's high (Bullish Breakout)
      if (today.high > yesterday.high && volumeRatio > 1.3) {
        signal = 'PDH_BREAKOUT';
        entryPrice = yesterday.high;
        stopLoss = yesterday.low;
        const riskRange = entryPrice - stopLoss;
        exitTarget1 = entryPrice + riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice + (riskRange * 2); // 2:1 R/R

        const breakoutStrength = ((today.high - yesterday.high) / yesterday.high) * 100;
        confidence = Math.min(10, Math.max(1, 5 + (volumeRatio - 1) * 2 + breakoutStrength * 5));

        reasoning.push(`✅ PDH Breakout: Today's high ${today.high.toFixed(2)} broke above yesterday's high ${yesterday.high.toFixed(2)}`);
        reasoning.push(`📊 Volume Confirmation: ${volumeRatio.toFixed(2)}x average (threshold: 1.3x) - STRONG`);
        reasoning.push(`📈 Breakout Strength: ${breakoutStrength.toFixed(2)}% above PDH`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⚡ Risk/Reward: ${riskRange.toFixed(2)} points at risk`);
      }
      // Check if today's low is below yesterday's low (Bearish Breakout)
      else if (today.low < yesterday.low && volumeRatio > 1.3) {
        signal = 'PDL_BREAKOUT';
        entryPrice = yesterday.low;
        stopLoss = yesterday.high;
        const riskRange = stopLoss - entryPrice;
        exitTarget1 = entryPrice - riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice - (riskRange * 2); // 2:1 R/R

        const breakoutStrength = ((yesterday.low - today.low) / yesterday.low) * 100;
        confidence = Math.min(10, Math.max(1, 5 + (volumeRatio - 1) * 2 + breakoutStrength * 5));

        reasoning.push(`✅ PDL Breakout: Today's low ${today.low.toFixed(2)} broke below yesterday's low ${yesterday.low.toFixed(2)}`);
        reasoning.push(`📊 Volume Confirmation: ${volumeRatio.toFixed(2)}x average (threshold: 1.3x) - STRONG`);
        reasoning.push(`📉 Breakout Strength: ${breakoutStrength.toFixed(2)}% below PDL`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⚡ Risk/Reward: ${riskRange.toFixed(2)} points at risk`);
      } else {
        // No breakout detected
        reasoning.push(`⏸️ No breakout detected - waiting for setup`);
        reasoning.push(`📊 Today's Range: High ${today.high.toFixed(2)} | Low ${today.low.toFixed(2)}`);
        reasoning.push(`📌 Yesterday's Range: PDH ${yesterday.high.toFixed(2)} | PDL ${yesterday.low.toFixed(2)}`);
        reasoning.push(`📈 Volume: ${volumeRatio.toFixed(2)}x average (need 1.3x for confirmation)`);

        if (today.high < yesterday.high && today.low > yesterday.low) {
          reasoning.push(`💡 Price consolidating within yesterday's range - watch for breakout`);
        } else if (volumeRatio < 1.3) {
          reasoning.push(`⚠️ Insufficient volume for high-probability setup`);
        }
      }

      return {
        asset: symbol,
        signal: signal === 'NONE' ? 'WAIT' : (signal === 'PDH_BREAKOUT' ? 'BUY' : 'SELL'),
        signalType: signal,
        confidence,
        entryPrice: entryPrice || today.close,
        stopLoss,
        exitTarget1,
        exitTarget2,
        reasoning,
        previousDayHigh: yesterday.high,
        previousDayLow: yesterday.low,
        previousDayClose: yesterday.close,
        previousDayVolume: yesterday.volume,
        currentPrice: today.close,
        volumeRatio,
        breakoutStrength: signal === 'PDH_BREAKOUT'
          ? ((today.high - yesterday.high) / yesterday.high) * 100
          : signal === 'PDL_BREAKOUT'
          ? ((yesterday.low - today.low) / yesterday.low) * 100
          : 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      return this.createWaitSignal(symbol, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchDailyData(symbol: string): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      const period1 = now - (86400 * 30); // Last 30 days
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=1d`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      if (!response.ok) {
        throw new Error(`Yahoo Finance API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      if (!result?.timestamp) {
        return [];
      }

      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      if (!quotes) {
        return [];
      }

      const candles: CandleData[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        if (quotes.open[i] && quotes.high[i] && quotes.low[i] && quotes.close[i]) {
          candles.push({
            timestamp: timestamps[i] * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i] || 0
          });
        }
      }

      return candles;
    } catch (error) {
      console.error(`Error fetching daily data for ${symbol}:`, error);
      return [];
    }
  }

  private formatSymbol(symbol: string): string {
    const upperSymbol = symbol.toUpperCase();

    // Forex pairs need =X suffix
    const forexPairs = ['EURUSD', 'USDJPY', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD'];
    if (forexPairs.includes(upperSymbol)) {
      return `${upperSymbol}=X`;
    }

    return upperSymbol;
  }

  private createWaitSignal(symbol: string, reason: string): PreviousDaySignal {
    return {
      asset: symbol,
      signal: 'WAIT',
      signalType: 'NONE',
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      exitTarget1: 0,
      exitTarget2: 0,
      reasoning: [reason],
      previousDayHigh: 0,
      previousDayLow: 0,
      previousDayClose: 0,
      previousDayVolume: 0,
      currentPrice: 0,
      volumeRatio: 0,
      breakoutStrength: 0,
      timestamp: new Date().toISOString()
    };
  }

  async scanMultipleAssets(symbols: string[]): Promise<PreviousDaySignal[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.analyzeAsset(symbol))
    );
    // Sort by confidence (highest first)
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

export const previousDayStrategyService = new PreviousDayStrategyService();
