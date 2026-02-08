import Anthropic from '@anthropic-ai/sdk';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OpeningRangeData {
  rangeHigh: number;
  rangeLow: number;
  rangeOpen: number;
  rangeClose: number;
  rangeVolume: number;
  rangeWidth: number;
  rangeWidthPercent: number;
  timeToEstablish: number; // minutes
}

interface FirstCandleSignal {
  asset: string;
  signal: 'BUY' | 'SELL' | 'WAIT';
  signalType: 'ORB_BULLISH' | 'ORB_BEARISH' | 'RANGE_FORMING' | 'MARKET_CLOSED' | 'NONE';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  exitTarget1: number;
  exitTarget2: number;
  reasoning: string[];
  openingRange: OpeningRangeData;
  currentPrice: number;
  timeIntoSession: number;  // minutes since market open (9:30 AM EST)
  volumeProfile: {
    openingRangeVolume: number;
    currentVolume: number;
    avgVolume: number;
    volumeRatio: number;
  };
  marketStatus: {
    isOpen: boolean;
    currentTimeEST: string;
    minutesUntilClose: number;
  };
  timestamp: string;
}

export class FirstCandleStrategyService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  // Get market open time in EST (9:30 AM)
  private getMarketOpenTime(): Date {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const marketOpen = new Date(estTime);
    marketOpen.setHours(9, 30, 0, 0);
    return marketOpen;
  }

  // Get market close time in EST (4:00 PM)
  private getMarketCloseTime(): Date {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const marketClose = new Date(estTime);
    marketClose.setHours(16, 0, 0, 0);
    return marketClose;
  }

  async analyzeAsset(symbol: string): Promise<FirstCandleSignal> {
    try {
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

      // Check if market is open (9:30 AM - 4:00 PM EST)
      const marketOpen = this.getMarketOpenTime();
      const marketClose = this.getMarketCloseTime();
      const timeIntoSession = (estTime.getTime() - marketOpen.getTime()) / (1000 * 60); // minutes
      const minutesUntilClose = (marketClose.getTime() - estTime.getTime()) / (1000 * 60);

      const currentTimeEST = estTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      // Market closed - return WAIT signal
      if (timeIntoSession < 0 || timeIntoSession > 390) { // 390 minutes = 6.5 hours (9:30 AM - 4:00 PM)
        return this.createMarketClosedSignal(symbol, currentTimeEST, timeIntoSession);
      }

      // Fetch 5-minute candles from today
      const candles = await this.fetch5MinuteData(symbol);
      if (candles.length < 6) { // Need at least 30 minutes of data (6 candles)
        return this.createWaitSignal(
          symbol,
          'Insufficient intraday data - need at least 30 minutes of market data',
          currentTimeEST,
          timeIntoSession,
          minutesUntilClose
        );
      }

      // Filter candles to get only today's market hours (starting from 9:30 AM EST)
      const todayCandles = this.filterMarketHoursCandles(candles, marketOpen);

      if (todayCandles.length < 6) {
        return this.createWaitSignal(
          symbol,
          `Only ${todayCandles.length} candles available since market open - need at least 6 (30 minutes)`,
          currentTimeEST,
          timeIntoSession,
          minutesUntilClose
        );
      }

      // Determine opening range size (first 15-30 minutes)
      // Use 6 candles (30 minutes) if available, minimum 3 candles (15 minutes)
      const rangeSize = Math.min(6, Math.max(3, Math.floor(timeIntoSession / 5)));
      const openingRangeCandles = todayCandles.slice(0, rangeSize);

      const rangeHigh = Math.max(...openingRangeCandles.map(c => c.high));
      const rangeLow = Math.min(...openingRangeCandles.map(c => c.low));
      const rangeOpen = openingRangeCandles[0].open;
      const rangeClose = openingRangeCandles[openingRangeCandles.length - 1].close;
      const rangeVolume = openingRangeCandles.reduce((sum, c) => sum + c.volume, 0);
      const rangeWidth = rangeHigh - rangeLow;
      const rangeWidthPercent = (rangeWidth / rangeLow) * 100;

      // Get current price (latest candle)
      const currentCandle = todayCandles[todayCandles.length - 1];
      const currentPrice = currentCandle.close;

      // Calculate volume metrics
      const avgVolume = todayCandles.reduce((sum, c) => sum + c.volume, 0) / todayCandles.length;
      const volumeRatio = currentCandle.volume / avgVolume;

      let signal: FirstCandleSignal['signalType'] = 'NONE';
      let entryPrice = 0;
      let stopLoss = 0;
      let exitTarget1 = 0;
      let exitTarget2 = 0;
      let confidence = 0;
      const reasoning: string[] = [];

      // Strategy Logic: Look for breakouts of the opening range
      if (timeIntoSession < 30) {
        // Still within the first 30 minutes - range is forming
        signal = 'RANGE_FORMING';
        confidence = 5;
        reasoning.push(`📊 Opening Range Forming (${Math.floor(timeIntoSession)} min into session)`);
        reasoning.push(`📌 Current Range: ${rangeLow.toFixed(2)} - ${rangeHigh.toFixed(2)} (${rangeWidthPercent.toFixed(2)}%)`);
        reasoning.push(`⏱️ Time Remaining: ${(30 - timeIntoSession).toFixed(0)} minutes until range established`);
        reasoning.push(`💡 Strategy: Wait for breakout above ${rangeHigh.toFixed(2)} or below ${rangeLow.toFixed(2)}`);
      } else if (currentPrice > rangeHigh && volumeRatio > 1.2) {
        // Bullish breakout above opening range
        signal = 'ORB_BULLISH';
        entryPrice = rangeHigh;
        stopLoss = rangeLow;
        const riskRange = entryPrice - stopLoss;
        exitTarget1 = entryPrice + riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice + (riskRange * 2); // 2:1 R/R

        const breakoutPercent = ((currentPrice - rangeHigh) / rangeHigh) * 100;
        confidence = Math.min(10, Math.max(1, 5 + (volumeRatio - 1) * 3 + breakoutPercent * 10));

        reasoning.push(`✅ ORB Bullish Breakout: Price ${currentPrice.toFixed(2)} > Range High ${rangeHigh.toFixed(2)}`);
        reasoning.push(`📊 Opening Range (30 min): ${rangeLow.toFixed(2)} - ${rangeHigh.toFixed(2)} | Width: ${rangeWidthPercent.toFixed(2)}%`);
        reasoning.push(`🔊 Volume Confirmation: ${volumeRatio.toFixed(2)}x average (threshold: 1.2x) - STRONG`);
        reasoning.push(`📈 Breakout Strength: ${breakoutPercent.toFixed(2)}% above range high`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⏰ Time into session: ${Math.floor(timeIntoSession)} min | Minutes until close: ${Math.floor(minutesUntilClose)} min`);
      } else if (currentPrice < rangeLow && volumeRatio > 1.2) {
        // Bearish breakout below opening range
        signal = 'ORB_BEARISH';
        entryPrice = rangeLow;
        stopLoss = rangeHigh;
        const riskRange = stopLoss - entryPrice;
        exitTarget1 = entryPrice - riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice - (riskRange * 2); // 2:1 R/R

        const breakoutPercent = ((rangeLow - currentPrice) / rangeLow) * 100;
        confidence = Math.min(10, Math.max(1, 5 + (volumeRatio - 1) * 3 + breakoutPercent * 10));

        reasoning.push(`✅ ORB Bearish Breakout: Price ${currentPrice.toFixed(2)} < Range Low ${rangeLow.toFixed(2)}`);
        reasoning.push(`📊 Opening Range (30 min): ${rangeLow.toFixed(2)} - ${rangeHigh.toFixed(2)} | Width: ${rangeWidthPercent.toFixed(2)}%`);
        reasoning.push(`🔊 Volume Confirmation: ${volumeRatio.toFixed(2)}x average (threshold: 1.2x) - STRONG`);
        reasoning.push(`📉 Breakout Strength: ${breakoutPercent.toFixed(2)}% below range low`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⏰ Time into session: ${Math.floor(timeIntoSession)} min | Minutes until close: ${Math.floor(minutesUntilClose)} min`);
      } else {
        // No breakout detected - price within range
        reasoning.push(`⏸️ No breakout - price within opening range`);
        reasoning.push(`📊 Opening Range: ${rangeLow.toFixed(2)} - ${rangeHigh.toFixed(2)} (${rangeWidthPercent.toFixed(2)}%)`);
        reasoning.push(`📍 Current Price: ${currentPrice.toFixed(2)}`);
        reasoning.push(`🔊 Volume: ${volumeRatio.toFixed(2)}x average`);

        if (volumeRatio < 1.2) {
          reasoning.push(`⚠️ Insufficient volume for high-probability setup (need 1.2x, have ${volumeRatio.toFixed(2)}x)`);
        } else {
          reasoning.push(`💡 Watch for break above ${rangeHigh.toFixed(2)} (bullish) or below ${rangeLow.toFixed(2)} (bearish)`);
        }

        reasoning.push(`⏰ ${Math.floor(timeIntoSession)} min into session | ${Math.floor(minutesUntilClose)} min until close`);
      }

      return {
        asset: symbol,
        signal: signal === 'ORB_BULLISH' ? 'BUY' : signal === 'ORB_BEARISH' ? 'SELL' : 'WAIT',
        signalType: signal,
        confidence,
        entryPrice: entryPrice || currentPrice,
        stopLoss,
        exitTarget1,
        exitTarget2,
        reasoning,
        openingRange: {
          rangeHigh,
          rangeLow,
          rangeOpen,
          rangeClose,
          rangeVolume,
          rangeWidth,
          rangeWidthPercent,
          timeToEstablish: rangeSize * 5 // 5 minutes per candle
        },
        currentPrice,
        timeIntoSession,
        volumeProfile: {
          openingRangeVolume: rangeVolume,
          currentVolume: currentCandle.volume,
          avgVolume,
          volumeRatio
        },
        marketStatus: {
          isOpen: true,
          currentTimeEST,
          minutesUntilClose
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      return this.createWaitSignal(
        symbol,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        '',
        0,
        0
      );
    }
  }

  private filterMarketHoursCandles(candles: CandleData[], marketOpen: Date): CandleData[] {
    // Filter candles to only include those from today's market hours
    const marketOpenTime = marketOpen.getTime();
    return candles.filter(candle => candle.timestamp >= marketOpenTime);
  }

  private async fetch5MinuteData(symbol: string): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      const period1 = now - (86400 * 2); // Last 2 days to ensure we have enough data
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=5m&includePrePost=false`;

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
      console.error(`Error fetching 5-minute data for ${symbol}:`, error);
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

  private createMarketClosedSignal(symbol: string, currentTimeEST: string, timeIntoSession: number): FirstCandleSignal {
    const reasoning: string[] = [];

    if (timeIntoSession < 0) {
      const minutesUntilOpen = Math.abs(timeIntoSession);
      reasoning.push(`🔒 Market Closed - Opens at 9:30 AM EST`);
      reasoning.push(`⏰ Current Time: ${currentTimeEST} EST`);
      reasoning.push(`⏳ Time until open: ${Math.floor(minutesUntilOpen / 60)}h ${Math.floor(minutesUntilOpen % 60)}m`);
      reasoning.push(`💡 Opening Range Breakout strategy activates after first 30 minutes of trading`);
    } else {
      reasoning.push(`🔒 Market Closed - Closed at 4:00 PM EST`);
      reasoning.push(`⏰ Current Time: ${currentTimeEST} EST`);
      reasoning.push(`💡 Strategy will resume when market opens tomorrow at 9:30 AM EST`);
    }

    return {
      asset: symbol,
      signal: 'WAIT',
      signalType: 'MARKET_CLOSED',
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      exitTarget1: 0,
      exitTarget2: 0,
      reasoning,
      openingRange: {
        rangeHigh: 0,
        rangeLow: 0,
        rangeOpen: 0,
        rangeClose: 0,
        rangeVolume: 0,
        rangeWidth: 0,
        rangeWidthPercent: 0,
        timeToEstablish: 0
      },
      currentPrice: 0,
      timeIntoSession,
      volumeProfile: {
        openingRangeVolume: 0,
        currentVolume: 0,
        avgVolume: 0,
        volumeRatio: 0
      },
      marketStatus: {
        isOpen: false,
        currentTimeEST,
        minutesUntilClose: 0
      },
      timestamp: new Date().toISOString()
    };
  }

  private createWaitSignal(
    symbol: string,
    reason: string,
    currentTimeEST: string,
    timeIntoSession: number,
    minutesUntilClose: number
  ): FirstCandleSignal {
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
      openingRange: {
        rangeHigh: 0,
        rangeLow: 0,
        rangeOpen: 0,
        rangeClose: 0,
        rangeVolume: 0,
        rangeWidth: 0,
        rangeWidthPercent: 0,
        timeToEstablish: 0
      },
      currentPrice: 0,
      timeIntoSession,
      volumeProfile: {
        openingRangeVolume: 0,
        currentVolume: 0,
        avgVolume: 0,
        volumeRatio: 0
      },
      marketStatus: {
        isOpen: timeIntoSession >= 0 && timeIntoSession <= 390,
        currentTimeEST,
        minutesUntilClose
      },
      timestamp: new Date().toISOString()
    };
  }

  async scanMultipleAssets(symbols: string[]): Promise<FirstCandleSignal[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.analyzeAsset(symbol))
    );
    // Sort by confidence (highest first)
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

export const firstCandleStrategyService = new FirstCandleStrategyService();
