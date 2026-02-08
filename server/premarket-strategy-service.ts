import Anthropic from '@anthropic-ai/sdk';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PreMarketRangeData {
  premarketHigh: number;
  premarketLow: number;
  premarketOpen: number;
  premarketClose: number;
  premarketVolume: number;
  premarketWidth: number;
  premarketWidthPercent: number;
  candleCount: number;
}

interface PreMarketSignal {
  asset: string;
  signal: 'BUY' | 'SELL' | 'WAIT';
  signalType: 'PMH_BREAKOUT' | 'PML_BREAKOUT' | 'PREMARKET_ACTIVE' | 'MARKET_CLOSED' | 'NONE';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  exitTarget1: number;
  exitTarget2: number;
  reasoning: string[];
  premarketRange: PreMarketRangeData;
  currentPrice: number;
  timeIntoSession: number;  // minutes since market open (9:30 AM EST)
  volumeProfile: {
    premarketVolume: number;
    marketHoursVolume: number;
    avgVolume: number;
    volumeRatio: number;
  };
  marketStatus: {
    isPremarket: boolean;
    isMarketHours: boolean;
    currentTimeEST: string;
    minutesUntilOpen: number;
    minutesUntilClose: number;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  institutionalLevel: boolean;
  timestamp: string;
}

export class PreMarketStrategyService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  // Pre-market hours: 4:00 AM - 9:30 AM EST
  private getPreMarketStartTime(): Date {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const premarketStart = new Date(estTime);
    premarketStart.setHours(4, 0, 0, 0);
    return premarketStart;
  }

  // Market open: 9:30 AM EST
  private getMarketOpenTime(): Date {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const marketOpen = new Date(estTime);
    marketOpen.setHours(9, 30, 0, 0);
    return marketOpen;
  }

  // Market close: 4:00 PM EST
  private getMarketCloseTime(): Date {
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

    const marketClose = new Date(estTime);
    marketClose.setHours(16, 0, 0, 0);
    return marketClose;
  }

  async analyzeAsset(symbol: string): Promise<PreMarketSignal> {
    try {
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

      const premarketStart = this.getPreMarketStartTime();
      const marketOpen = this.getMarketOpenTime();
      const marketClose = this.getMarketCloseTime();

      const minutesSincePremarketStart = (estTime.getTime() - premarketStart.getTime()) / (1000 * 60);
      const minutesUntilOpen = (marketOpen.getTime() - estTime.getTime()) / (1000 * 60);
      const timeIntoSession = (estTime.getTime() - marketOpen.getTime()) / (1000 * 60);
      const minutesUntilClose = (marketClose.getTime() - estTime.getTime()) / (1000 * 60);

      const currentTimeEST = estTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const isPremarket = minutesSincePremarketStart >= 0 && minutesUntilOpen > 0;
      const isMarketHours = timeIntoSession >= 0 && timeIntoSession <= 390;

      // If we're in pre-market hours, return a waiting signal
      if (isPremarket) {
        return this.createPreMarketActiveSignal(symbol, currentTimeEST, minutesUntilOpen);
      }

      // If market is closed, return closed signal
      if (!isMarketHours) {
        return this.createMarketClosedSignal(symbol, currentTimeEST, minutesUntilOpen, timeIntoSession);
      }

      // We're in market hours - fetch data and analyze
      const candles = await this.fetch5MinuteData(symbol);
      if (candles.length < 10) {
        return this.createWaitSignal(
          symbol,
          'Insufficient data for pre-market analysis',
          currentTimeEST,
          timeIntoSession,
          minutesUntilClose,
          isPremarket,
          isMarketHours
        );
      }

      // Filter candles into pre-market and market hours
      const premarketCandles = this.filterPreMarketCandles(candles, premarketStart, marketOpen);
      const marketHoursCandles = this.filterMarketHoursCandles(candles, marketOpen);

      if (premarketCandles.length === 0) {
        return this.createWaitSignal(
          symbol,
          'No pre-market data available - strategy requires pre-market reference levels',
          currentTimeEST,
          timeIntoSession,
          minutesUntilClose,
          isPremarket,
          isMarketHours
        );
      }

      // Calculate pre-market range
      const premarketHigh = Math.max(...premarketCandles.map(c => c.high));
      const premarketLow = Math.min(...premarketCandles.map(c => c.low));
      const premarketOpen = premarketCandles[0].open;
      const premarketClose = premarketCandles[premarketCandles.length - 1].close;
      const premarketVolume = premarketCandles.reduce((sum, c) => sum + c.volume, 0);
      const premarketWidth = premarketHigh - premarketLow;
      const premarketWidthPercent = (premarketWidth / premarketLow) * 100;

      // Get current price
      const currentCandle = marketHoursCandles.length > 0
        ? marketHoursCandles[marketHoursCandles.length - 1]
        : premarketCandles[premarketCandles.length - 1];
      const currentPrice = currentCandle.close;

      // Calculate volume metrics
      const marketHoursVolume = marketHoursCandles.reduce((sum, c) => sum + c.volume, 0);
      const avgVolume = marketHoursCandles.length > 0
        ? marketHoursVolume / marketHoursCandles.length
        : premarketVolume / premarketCandles.length;
      const volumeRatio = currentCandle.volume / avgVolume;

      let signal: PreMarketSignal['signalType'] = 'NONE';
      let entryPrice = 0;
      let stopLoss = 0;
      let exitTarget1 = 0;
      let exitTarget2 = 0;
      let confidence = 0;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
      const reasoning: string[] = [];

      // Strategy Logic: Look for breaks and retests of pre-market levels
      if (currentPrice > premarketHigh && volumeRatio > 1.5) {
        // Bullish breakout above pre-market high
        signal = 'PMH_BREAKOUT';
        entryPrice = premarketHigh;
        stopLoss = premarketLow;
        const riskRange = entryPrice - stopLoss;
        exitTarget1 = entryPrice + riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice + (riskRange * 2); // 2:1 R/R

        const breakoutPercent = ((currentPrice - premarketHigh) / premarketHigh) * 100;

        // Higher confidence for pre-market breakouts due to institutional levels
        confidence = Math.min(10, Math.max(1, 6 + (volumeRatio - 1.5) * 2 + breakoutPercent * 8));
        riskLevel = volumeRatio > 2.0 ? 'LOW' : 'MEDIUM';

        reasoning.push(`✅ Pre-Market High Breakout: Price ${currentPrice.toFixed(2)} > PMH ${premarketHigh.toFixed(2)}`);
        reasoning.push(`🏛️ INSTITUTIONAL LEVEL: Pre-market high represents key institutional interest`);
        reasoning.push(`📊 Pre-Market Range: ${premarketLow.toFixed(2)} - ${premarketHigh.toFixed(2)} | Width: ${premarketWidthPercent.toFixed(2)}%`);
        reasoning.push(`🔊 Volume Surge: ${volumeRatio.toFixed(2)}x average (threshold: 1.5x) - VERY STRONG`);
        reasoning.push(`📈 Breakout Strength: ${breakoutPercent.toFixed(2)}% above pre-market high`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⚡ Risk Level: ${riskLevel} (institutional support)`);
        reasoning.push(`⏰ ${Math.floor(timeIntoSession)} min into session | ${Math.floor(minutesUntilClose)} min until close`);
      } else if (currentPrice < premarketLow && volumeRatio > 1.5) {
        // Bearish breakout below pre-market low
        signal = 'PML_BREAKOUT';
        entryPrice = premarketLow;
        stopLoss = premarketHigh;
        const riskRange = stopLoss - entryPrice;
        exitTarget1 = entryPrice - riskRange;      // 1:1 R/R
        exitTarget2 = entryPrice - (riskRange * 2); // 2:1 R/R

        const breakoutPercent = ((premarketLow - currentPrice) / premarketLow) * 100;

        // Higher confidence for pre-market breakouts
        confidence = Math.min(10, Math.max(1, 6 + (volumeRatio - 1.5) * 2 + breakoutPercent * 8));
        riskLevel = volumeRatio > 2.0 ? 'LOW' : 'MEDIUM';

        reasoning.push(`✅ Pre-Market Low Breakout: Price ${currentPrice.toFixed(2)} < PML ${premarketLow.toFixed(2)}`);
        reasoning.push(`🏛️ INSTITUTIONAL LEVEL: Pre-market low represents key institutional interest`);
        reasoning.push(`📊 Pre-Market Range: ${premarketLow.toFixed(2)} - ${premarketHigh.toFixed(2)} | Width: ${premarketWidthPercent.toFixed(2)}%`);
        reasoning.push(`🔊 Volume Surge: ${volumeRatio.toFixed(2)}x average (threshold: 1.5x) - VERY STRONG`);
        reasoning.push(`📉 Breakout Strength: ${breakoutPercent.toFixed(2)}% below pre-market low`);
        reasoning.push(`🎯 Entry: ${entryPrice.toFixed(2)} | Stop: ${stopLoss.toFixed(2)}`);
        reasoning.push(`💰 Target 1 (1:1): ${exitTarget1.toFixed(2)} | Target 2 (2:1): ${exitTarget2.toFixed(2)}`);
        reasoning.push(`⚡ Risk Level: ${riskLevel} (institutional support)`);
        reasoning.push(`⏰ ${Math.floor(timeIntoSession)} min into session | ${Math.floor(minutesUntilClose)} min until close`);
      } else {
        // No breakout detected
        reasoning.push(`⏸️ No pre-market breakout detected - price within range`);
        reasoning.push(`📊 Pre-Market Range: ${premarketLow.toFixed(2)} - ${premarketHigh.toFixed(2)} (${premarketWidthPercent.toFixed(2)}%)`);
        reasoning.push(`📍 Current Price: ${currentPrice.toFixed(2)}`);
        reasoning.push(`🔊 Volume: ${volumeRatio.toFixed(2)}x average`);

        if (currentPrice >= premarketLow && currentPrice <= premarketHigh) {
          reasoning.push(`💡 Price consolidating within pre-market range - watch for institutional breakout`);
        }

        if (volumeRatio < 1.5) {
          reasoning.push(`⚠️ Insufficient volume for high-probability setup (need 1.5x, have ${volumeRatio.toFixed(2)}x)`);
        } else {
          reasoning.push(`💡 Watch for break above ${premarketHigh.toFixed(2)} (bullish) or below ${premarketLow.toFixed(2)} (bearish)`);
        }

        reasoning.push(`⏰ ${Math.floor(timeIntoSession)} min into session | ${Math.floor(minutesUntilClose)} min until close`);
      }

      return {
        asset: symbol,
        signal: signal === 'PMH_BREAKOUT' ? 'BUY' : signal === 'PML_BREAKOUT' ? 'SELL' : 'WAIT',
        signalType: signal,
        confidence,
        entryPrice: entryPrice || currentPrice,
        stopLoss,
        exitTarget1,
        exitTarget2,
        reasoning,
        premarketRange: {
          premarketHigh,
          premarketLow,
          premarketOpen,
          premarketClose,
          premarketVolume,
          premarketWidth,
          premarketWidthPercent,
          candleCount: premarketCandles.length
        },
        currentPrice,
        timeIntoSession,
        volumeProfile: {
          premarketVolume,
          marketHoursVolume,
          avgVolume,
          volumeRatio
        },
        marketStatus: {
          isPremarket,
          isMarketHours,
          currentTimeEST,
          minutesUntilOpen,
          minutesUntilClose
        },
        riskLevel,
        institutionalLevel: signal !== 'NONE',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error analyzing ${symbol}:`, error);
      return this.createWaitSignal(
        symbol,
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        '',
        0,
        0,
        false,
        false
      );
    }
  }

  private filterPreMarketCandles(candles: CandleData[], premarketStart: Date, marketOpen: Date): CandleData[] {
    const premarketStartTime = premarketStart.getTime();
    const marketOpenTime = marketOpen.getTime();

    return candles.filter(candle =>
      candle.timestamp >= premarketStartTime && candle.timestamp < marketOpenTime
    );
  }

  private filterMarketHoursCandles(candles: CandleData[], marketOpen: Date): CandleData[] {
    const marketOpenTime = marketOpen.getTime();
    return candles.filter(candle => candle.timestamp >= marketOpenTime);
  }

  private async fetch5MinuteData(symbol: string): Promise<CandleData[]> {
    try {
      const formattedSymbol = this.formatSymbol(symbol);
      const now = Math.floor(Date.now() / 1000);
      const period1 = now - (86400 * 2); // Last 2 days
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}?period1=${period1}&period2=${now}&interval=5m&includePrePost=true`;

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

  private createPreMarketActiveSignal(symbol: string, currentTimeEST: string, minutesUntilOpen: number): PreMarketSignal {
    const reasoning: string[] = [];
    reasoning.push(`🌅 Pre-Market Session Active (4:00 AM - 9:30 AM EST)`);
    reasoning.push(`⏰ Current Time: ${currentTimeEST} EST`);
    reasoning.push(`⏳ Time until market open: ${Math.floor(minutesUntilOpen / 60)}h ${Math.floor(minutesUntilOpen % 60)}m`);
    reasoning.push(`📊 Pre-market levels are being established - wait for market open to trade breakouts`);
    reasoning.push(`💡 Strategy activates at 9:30 AM EST when market opens`);

    return {
      asset: symbol,
      signal: 'WAIT',
      signalType: 'PREMARKET_ACTIVE',
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      exitTarget1: 0,
      exitTarget2: 0,
      reasoning,
      premarketRange: {
        premarketHigh: 0,
        premarketLow: 0,
        premarketOpen: 0,
        premarketClose: 0,
        premarketVolume: 0,
        premarketWidth: 0,
        premarketWidthPercent: 0,
        candleCount: 0
      },
      currentPrice: 0,
      timeIntoSession: 0,
      volumeProfile: {
        premarketVolume: 0,
        marketHoursVolume: 0,
        avgVolume: 0,
        volumeRatio: 0
      },
      marketStatus: {
        isPremarket: true,
        isMarketHours: false,
        currentTimeEST,
        minutesUntilOpen,
        minutesUntilClose: 0
      },
      riskLevel: 'MEDIUM',
      institutionalLevel: false,
      timestamp: new Date().toISOString()
    };
  }

  private createMarketClosedSignal(
    symbol: string,
    currentTimeEST: string,
    minutesUntilOpen: number,
    timeIntoSession: number
  ): PreMarketSignal {
    const reasoning: string[] = [];

    if (timeIntoSession < -330) { // More than 5.5 hours before pre-market
      reasoning.push(`🔒 Market Closed - Pre-market starts at 4:00 AM EST`);
      reasoning.push(`⏰ Current Time: ${currentTimeEST} EST`);
      const hoursUntilPremarket = Math.abs(timeIntoSession + 330) / 60;
      reasoning.push(`⏳ Time until pre-market: ${Math.floor(hoursUntilPremarket)}h ${Math.floor((hoursUntilPremarket % 1) * 60)}m`);
    } else {
      reasoning.push(`🔒 Market Closed - Market closed at 4:00 PM EST`);
      reasoning.push(`⏰ Current Time: ${currentTimeEST} EST`);
      reasoning.push(`💡 Pre-market session starts at 4:00 AM EST`);
      reasoning.push(`💡 Strategy activates when market opens at 9:30 AM EST`);
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
      premarketRange: {
        premarketHigh: 0,
        premarketLow: 0,
        premarketOpen: 0,
        premarketClose: 0,
        premarketVolume: 0,
        premarketWidth: 0,
        premarketWidthPercent: 0,
        candleCount: 0
      },
      currentPrice: 0,
      timeIntoSession,
      volumeProfile: {
        premarketVolume: 0,
        marketHoursVolume: 0,
        avgVolume: 0,
        volumeRatio: 0
      },
      marketStatus: {
        isPremarket: false,
        isMarketHours: false,
        currentTimeEST,
        minutesUntilOpen,
        minutesUntilClose: 0
      },
      riskLevel: 'MEDIUM',
      institutionalLevel: false,
      timestamp: new Date().toISOString()
    };
  }

  private createWaitSignal(
    symbol: string,
    reason: string,
    currentTimeEST: string,
    timeIntoSession: number,
    minutesUntilClose: number,
    isPremarket: boolean,
    isMarketHours: boolean
  ): PreMarketSignal {
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
      premarketRange: {
        premarketHigh: 0,
        premarketLow: 0,
        premarketOpen: 0,
        premarketClose: 0,
        premarketVolume: 0,
        premarketWidth: 0,
        premarketWidthPercent: 0,
        candleCount: 0
      },
      currentPrice: 0,
      timeIntoSession,
      volumeProfile: {
        premarketVolume: 0,
        marketHoursVolume: 0,
        avgVolume: 0,
        volumeRatio: 0
      },
      marketStatus: {
        isPremarket,
        isMarketHours,
        currentTimeEST,
        minutesUntilOpen: 0,
        minutesUntilClose
      },
      riskLevel: 'MEDIUM',
      institutionalLevel: false,
      timestamp: new Date().toISOString()
    };
  }

  async scanMultipleAssets(symbols: string[]): Promise<PreMarketSignal[]> {
    const results = await Promise.all(
      symbols.map(symbol => this.analyzeAsset(symbol))
    );
    // Sort by confidence (highest first)
    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

export const premarketStrategyService = new PreMarketStrategyService();
