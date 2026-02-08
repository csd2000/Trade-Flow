import { db } from './db';
import { tradingExecutionService } from './trading-execution-service';
import { riskManager } from './risk-manager';
import { signalTracker } from './signal-tracker';
import { eq, desc } from 'drizzle-orm';
import {
  automatedTradingRules,
  automatedTradeExecutions,
  ruleExecutionLogs,
  tradingConnections
} from '@shared/schema';

// Market regime detection
type MarketRegime = 'trending' | 'ranging' | 'volatile';

// ATR-based thresholds for adaptive trading
interface ATRContext {
  atr: number;
  atrPercent: number;
  minPenetration: number;
  maxPenetration: number;
  dynamicStopMultiplier: number;
  fvgThreshold: number;
}

interface LiquiditySweep {
  symbol: string;
  type: 'BULLISH_SWEEP' | 'BEARISH_SWEEP';
  direction: 'LONG' | 'SHORT';
  sweepLevel: number;
  sweepPrice: number;
  closePrice: number;
  penetration: number;
  volumeRatio: number;
  confidence: number;
  timestamp: string;
  levelType: string;
  wickExtreme: number;
  // ATR-based context for adaptive thresholds
  atrContext?: ATRContext;
  marketRegime?: MarketRegime;
}

interface GateResult {
  id: number;
  name: string;
  passed: boolean;
  score: number;
  details: string;
  data?: any;
}

interface BracketOrder {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  sweepData: LiquiditySweep;
  gateResults: GateResult[];
}

interface TradeExecution {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  status: 'open' | 'closed' | 'stopped' | 'profit_target';
  pnl?: number;
  openTime: Date;
  closeTime?: Date;
  // Signal tracking
  signalId?: number;
  gateScore?: number;
  gatesPassed?: number;
}

interface HeartbeatStatus {
  lastHeartbeat: Date;
  isAlive: boolean;
  activePositions: number;
  todayTrades: number;
  todayPnl: number;
  uptime: number;
}

type SupportedPlatform = 'binance' | 'alpaca' | 'oanda' | 'coinbase';

class SevenGateTradingBot {
  private isRunning = false;
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private activePositions: Map<string, TradeExecution> = new Map();
  private priceWebhooks: Map<string, number> = new Map();
  private lastHeartbeat: Date = new Date();
  private startTime: Date = new Date();
  private todayTrades = 0;
  private todayPnl = 0;
  private config = {
    scanIntervalMs: 30000,
    heartbeatIntervalMs: 86400000,
    minGateScore: 70,
    minGatesPassed: 5,
    defaultStopPips: 2,
    platform: 'alpaca' as SupportedPlatform,
    isPaperTrading: true,
    discordWebhook: process.env.DISCORD_WEBHOOK_URL || '',
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || ''
  };

  async start() {
    if (this.isRunning) {
      console.log('⚠️ 7-Gate Trading Bot already running');
      return { success: false, message: 'Bot already running' };
    }

    this.isRunning = true;
    this.startTime = new Date();
    console.log('🤖 7-Gate Trading Bot ACTIVATED');
    console.log('   Sweep-First Logic: Gate 1 (Liquidity Sweep) = PRIMARY TRIGGER');
    console.log('   Platform:', this.config.platform);
    console.log('   Paper Trading:', this.config.isPaperTrading);

    this.scanInterval = setInterval(() => this.runScanCycle(), this.config.scanIntervalMs);
    
    this.heartbeatInterval = setInterval(() => this.sendHeartbeat(), this.config.heartbeatIntervalMs);
    
    await this.sendNotification('🟢 7-Gate Trading Bot ACTIVATED', 
      `Bot started at ${new Date().toISOString()}\nPlatform: ${this.config.platform}\nPaper Trading: ${this.config.isPaperTrading}`);

    await this.runScanCycle();

    return { success: true, message: 'Bot started successfully' };
  }

  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 7-Gate Trading Bot STOPPED');
    
    this.sendNotification('🔴 7-Gate Trading Bot STOPPED', 
      `Bot stopped at ${new Date().toISOString()}\nActive positions: ${this.activePositions.size}`);

    return { success: true, message: 'Bot stopped' };
  }

  async handlePriceWebhook(symbol: string, price: number, timestamp: string) {
    this.priceWebhooks.set(symbol, price);
    
    const positions = Array.from(this.activePositions.entries());
    for (const [positionKey, position] of positions) {
      if (position.symbol === symbol) {
        await this.checkPositionExits(position, price);
      }
    }

    return { received: true, symbol, price, timestamp };
  }

  private async runScanCycle() {
    try {
      console.log('\n📊 7-Gate Bot: Running scan cycle...');

      const sweeps = await this.detectLiquiditySweeps();

      for (const sweep of sweeps) {
        console.log(`\n⚠️ SWEEP DETECTED: ${sweep.symbol} - ${sweep.type}`);

        const gateResults = await this.validateAllGates(sweep);

        const totalScore = gateResults.reduce((sum, g) => sum + g.score, 0);
        const gatesPassed = gateResults.filter(g => g.passed).length;

        console.log(`   Gates Passed: ${gatesPassed}/7, Total Score: ${totalScore}/100`);

        if (gatesPassed >= this.config.minGatesPassed && totalScore >= this.config.minGateScore) {
          // Calculate position size based on ATR for risk check
          const entryPrice = sweep.closePrice;
          const atr = sweep.atrContext?.atr || entryPrice * 0.02;
          const stopDistance = atr * 2;
          const positionSize = this.calculatePositionSize(entryPrice, entryPrice - stopDistance);

          // Check risk limits before executing
          const riskCheck = await riskManager.canOpenPosition(
            sweep.symbol,
            sweep.direction === 'LONG' ? 'buy' : 'sell',
            positionSize,
            entryPrice,
            totalScore,
            gatesPassed
          );

          if (riskCheck.allowed) {
            console.log('✅ ALL CRITERIA MET + RISK CHECK PASSED - Executing trade...');
            if (riskCheck.warnings) {
              riskCheck.warnings.forEach(w => console.log(`⚠️ ${w}`));
            }
            await this.executeBracketOrder(sweep, gateResults);
          } else {
            console.log(`🛑 RISK CHECK FAILED: ${riskCheck.reason}`);
            // Still record the signal for tracking (but mark as not executed)
            await signalTracker.recordSignal({
              symbol: sweep.symbol,
              direction: sweep.direction.toLowerCase() as 'long' | 'short',
              entryPrice,
              stopLoss: sweep.direction === 'LONG'
                ? sweep.wickExtreme - stopDistance
                : sweep.wickExtreme + stopDistance,
              takeProfit: sweep.direction === 'LONG'
                ? entryPrice * 1.02
                : entryPrice * 0.98,
              quantity: positionSize,
              gateScores: {
                gate1: gateResults[0]?.score || 0,
                gate2: gateResults[1]?.score || 0,
                gate3: gateResults[2]?.score || 0,
                gate4: gateResults[3]?.score || 0,
                gate5: gateResults[4]?.score || 0,
                gate6: gateResults[5]?.score || 0,
                gate7: gateResults[6]?.score || 0,
              },
              totalScore,
              gatesPassed,
              atr: sweep.atrContext?.atr,
              atrPercent: sweep.atrContext?.atrPercent,
              volumeRatio: sweep.volumeRatio,
              sweepType: sweep.type,
              sweepLevel: sweep.levelType,
              penetrationPercent: sweep.penetration,
              marketRegime: sweep.marketRegime,
            });
          }
        } else {
          console.log(`❌ Criteria not met (need ${this.config.minGatesPassed} gates, ${this.config.minGateScore} score)`);
        }
      }

      await this.monitorActivePositions();

    } catch (error) {
      console.error('Scan cycle error:', error);
    }
  }

  /**
   * Calculate ATR (Average True Range) for adaptive thresholds
   */
  private calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
    if (closes.length < period + 1) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }

    // Calculate smoothed ATR
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
    }

    return atr;
  }

  /**
   * Detect market regime based on price action
   */
  private detectMarketRegime(closes: number[], atr: number): MarketRegime {
    if (closes.length < 20) return 'ranging';

    const recent = closes.slice(-20);
    const sma = recent.reduce((a, b) => a + b, 0) / recent.length;
    const currentPrice = closes[closes.length - 1];

    // Calculate directional movement
    let upMoves = 0;
    let downMoves = 0;
    for (let i = 1; i < recent.length; i++) {
      if (recent[i] > recent[i - 1]) upMoves++;
      else if (recent[i] < recent[i - 1]) downMoves++;
    }

    const directionality = Math.abs(upMoves - downMoves) / recent.length;
    const volatilityRatio = (atr / currentPrice) * 100;

    // High volatility = volatile regime
    if (volatilityRatio > 3) return 'volatile';

    // Strong directionality = trending
    if (directionality > 0.3) return 'trending';

    // Default to ranging
    return 'ranging';
  }

  /**
   * Get ATR-based adaptive thresholds
   */
  private getAdaptiveThresholds(atr: number, currentPrice: number): ATRContext {
    const atrPercent = (atr / currentPrice) * 100;

    return {
      atr,
      atrPercent,
      // Penetration thresholds scale with ATR
      minPenetration: atrPercent * 0.1, // 10% of ATR
      maxPenetration: atrPercent * 2.0, // 200% of ATR
      // Stop loss multiplier (2x ATR)
      dynamicStopMultiplier: 2.0,
      // FVG threshold scales with ATR
      fvgThreshold: atrPercent * 0.5, // 50% of ATR
    };
  }

  private async detectLiquiditySweeps(): Promise<LiquiditySweep[]> {
    const sweeps: LiquiditySweep[] = [];

    const symbols = ['BTC-USD', 'ETH-USD', 'GC=F', 'SI=F', 'SPY', 'QQQ'];

    for (const symbol of symbols) {
      try {
        const yahooSymbol = symbol;
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=5m&range=2d`
        );

        if (!response.ok) continue;

        const data = await response.json();
        const result = data.chart?.result?.[0];
        if (!result) continue;

        const quotes = result.indicators?.quote?.[0];
        if (!quotes || !quotes.high || !quotes.low || !quotes.close) continue;

        const highs = quotes.high.filter((h: number | null) => h !== null);
        const lows = quotes.low.filter((l: number | null) => l !== null);
        const closes = quotes.close.filter((c: number | null) => c !== null);
        const volumes = quotes.volume?.filter((v: number | null) => v !== null) || [];

        if (highs.length < 20) continue;

        // Calculate ATR for adaptive thresholds
        const atr = this.calculateATR(highs, lows, closes);
        const currentPrice = closes[closes.length - 1];
        const atrContext = this.getAdaptiveThresholds(atr, currentPrice);
        const marketRegime = this.detectMarketRegime(closes, atr);

        const last = {
          high: highs[highs.length - 1],
          low: lows[lows.length - 1],
          close: closes[closes.length - 1],
          volume: volumes[volumes.length - 1] || 0
        };

        const dayHigh = Math.max(...highs.slice(-48, -1)); // ~4 hours of 5m candles
        const dayLow = Math.min(...lows.slice(-48, -1));

        // Calculate volume ratio with 20-period average (adaptive)
        const volumeLookback = Math.min(volumes.length - 1, 20);
        const avgVolume = volumeLookback > 0
          ? volumes.slice(-volumeLookback - 1, -1).reduce((a: number, b: number) => a + b, 0) / volumeLookback
          : 1;
        const volumeRatio = avgVolume > 0 ? last.volume / avgVolume : 1;

        // Adaptive volume threshold based on market regime
        const minVolumeRatio = marketRegime === 'volatile' ? 1.2 : 1.5;

        // Bearish sweep detection with ATR-adaptive thresholds
        if (last.high > dayHigh && last.close < dayHigh) {
          const penetration = ((last.high - dayHigh) / dayHigh) * 100;

          // Use ATR-normalized thresholds instead of fixed values
          const isValidPenetration = penetration >= atrContext.minPenetration &&
                                     penetration <= atrContext.maxPenetration;
          const isValidVolume = volumeRatio >= minVolumeRatio;

          if (isValidPenetration && isValidVolume) {
            sweeps.push({
              symbol,
              type: 'BEARISH_SWEEP',
              direction: 'SHORT',
              sweepLevel: dayHigh,
              sweepPrice: last.high,
              closePrice: last.close,
              penetration,
              volumeRatio,
              confidence: Math.min(95, 60 + (volumeRatio * 10) + (penetration / atrContext.atrPercent * 10)),
              timestamp: new Date().toISOString(),
              levelType: '24h_high',
              wickExtreme: last.high,
              atrContext,
              marketRegime,
            });
          }
        }

        // Bullish sweep detection with ATR-adaptive thresholds
        if (last.low < dayLow && last.close > dayLow) {
          const penetration = ((dayLow - last.low) / dayLow) * 100;

          // Use ATR-normalized thresholds instead of fixed values
          const isValidPenetration = penetration >= atrContext.minPenetration &&
                                     penetration <= atrContext.maxPenetration;
          const isValidVolume = volumeRatio >= minVolumeRatio;

          if (isValidPenetration && isValidVolume) {
            sweeps.push({
              symbol,
              type: 'BULLISH_SWEEP',
              direction: 'LONG',
              sweepLevel: dayLow,
              sweepPrice: last.low,
              closePrice: last.close,
              penetration,
              volumeRatio,
              confidence: Math.min(95, 60 + (volumeRatio * 10) + (penetration / atrContext.atrPercent * 10)),
              timestamp: new Date().toISOString(),
              levelType: '24h_low',
              wickExtreme: last.low,
              atrContext,
              marketRegime,
            });
          }
        }

      } catch (error) {
        console.error(`Error scanning ${symbol}:`, error);
      }
    }

    return sweeps;
  }

  private async validateAllGates(sweep: LiquiditySweep): Promise<GateResult[]> {
    const gates: GateResult[] = [];

    gates.push({
      id: 1,
      name: 'Liquidity Sweep',
      passed: sweep.confidence >= 60,
      score: sweep.confidence >= 60 ? Math.min(15, sweep.confidence / 6) : 0,
      details: `${sweep.type} at ${sweep.levelType}, penetration: ${sweep.penetration.toFixed(2)}%, volume: ${sweep.volumeRatio.toFixed(1)}x`,
      data: sweep
    });

    gates.push(await this.validateGate2_FVG(sweep));
    gates.push(await this.validateGate3_OrderBlock(sweep));
    gates.push(await this.validateGate4_MarketStructure(sweep));
    gates.push(await this.validateGate5_Momentum(sweep));
    gates.push(await this.validateGate6_SessionTiming(sweep));
    gates.push(await this.validateGate7_Confluence(sweep, gates));

    return gates;
  }

  private async validateGate2_FVG(sweep: LiquiditySweep): Promise<GateResult> {
    try {
      const yahooSymbol = sweep.symbol;
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=5m&range=1d`
      );
      
      if (!response.ok) {
        return { id: 2, name: 'Fair Value Gap', passed: false, score: 0, details: 'Failed to fetch FVG data' };
      }
      
      const data = await response.json();
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
      if (!quotes) {
        return { id: 2, name: 'Fair Value Gap', passed: false, score: 0, details: 'No market data for FVG' };
      }

      const highs = quotes.high.filter((h: number | null) => h !== null);
      const lows = quotes.low.filter((l: number | null) => l !== null);
      
      if (highs.length < 5) {
        return { id: 2, name: 'Fair Value Gap', passed: false, score: 0, details: 'Insufficient data for FVG' };
      }

      let fvgFound = false;
      let fvgDetails = 'No nearby FVG found';
      const sweepPrice = sweep.sweepLevel;

      // Use ATR-based threshold instead of fixed 1%
      // If ATR context available, use it; otherwise fall back to 1%
      const atrThreshold = sweep.atrContext
        ? sweep.atrContext.atr * sweep.atrContext.fvgThreshold / 100
        : sweepPrice * 0.01;
      const priceThreshold = Math.max(atrThreshold, sweepPrice * 0.005); // Minimum 0.5%

      for (let i = 2; i < highs.length; i++) {
        const candle1High = highs[i - 2];
        const candle3Low = lows[i];
        if (candle1High < candle3Low) {
          const gapSize = candle3Low - candle1High;
          if (Math.abs(candle1High - sweepPrice) < priceThreshold || Math.abs(candle3Low - sweepPrice) < priceThreshold) {
            fvgFound = true;
            fvgDetails = `Bullish FVG detected: gap ${gapSize.toFixed(4)} near sweep level (ATR-adjusted threshold)`;
            break;
          }
        }

        const candle1Low = lows[i - 2];
        const candle3High = highs[i];
        if (candle1Low > candle3High) {
          const gapSize = candle1Low - candle3High;
          if (Math.abs(candle1Low - sweepPrice) < priceThreshold || Math.abs(candle3High - sweepPrice) < priceThreshold) {
            fvgFound = true;
            fvgDetails = `Bearish FVG detected: gap ${gapSize.toFixed(4)} near sweep level (ATR-adjusted threshold)`;
            break;
          }
        }
      }
      
      return {
        id: 2,
        name: 'Fair Value Gap',
        passed: fvgFound,
        score: fvgFound ? 14 : 0,
        details: fvgDetails
      };
    } catch (error) {
      return { id: 2, name: 'Fair Value Gap', passed: false, score: 0, details: 'FVG validation error' };
    }
  }

  private async validateGate3_OrderBlock(sweep: LiquiditySweep): Promise<GateResult> {
    try {
      const yahooSymbol = sweep.symbol;
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=15m&range=2d`
      );
      
      if (!response.ok) {
        return { id: 3, name: 'Order Block', passed: false, score: 0, details: 'Failed to fetch OB data' };
      }
      
      const data = await response.json();
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
      if (!quotes) {
        return { id: 3, name: 'Order Block', passed: false, score: 0, details: 'No market data for OB' };
      }

      const opens = quotes.open.filter((o: number | null) => o !== null);
      const closes = quotes.close.filter((c: number | null) => c !== null);
      const highs = quotes.high.filter((h: number | null) => h !== null);
      const lows = quotes.low.filter((l: number | null) => l !== null);
      const volumes = quotes.volume?.filter((v: number | null) => v !== null) || [];
      
      if (opens.length < 10) {
        return { id: 3, name: 'Order Block', passed: false, score: 0, details: 'Insufficient data for OB' };
      }

      const avgVolume = volumes.length > 0 ? volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length : 1;
      const sweepPrice = sweep.sweepLevel;

      // Use ATR-based threshold instead of fixed 1.5%
      const atrThreshold = sweep.atrContext
        ? sweep.atrContext.atr * 1.5 // 1.5x ATR for order block proximity
        : sweepPrice * 0.015;
      const priceThreshold = Math.max(atrThreshold, sweepPrice * 0.01); // Minimum 1%
      
      let obFound = false;
      let obDetails = 'No significant OB found';
      
      for (let i = 1; i < opens.length - 1; i++) {
        const isBullishOB = closes[i] > opens[i] && 
                           closes[i-1] < opens[i-1] &&
                           (volumes[i] || 0) > avgVolume * 1.2;
        
        const isBearishOB = closes[i] < opens[i] && 
                           closes[i-1] > opens[i-1] &&
                           (volumes[i] || 0) > avgVolume * 1.2;
        
        if (sweep.direction === 'LONG' && isBullishOB) {
          if (Math.abs(lows[i] - sweepPrice) < priceThreshold) {
            obFound = true;
            obDetails = `Bullish OB at ${lows[i].toFixed(4)} (high volume confirmation)`;
            break;
          }
        }
        
        if (sweep.direction === 'SHORT' && isBearishOB) {
          if (Math.abs(highs[i] - sweepPrice) < priceThreshold) {
            obFound = true;
            obDetails = `Bearish OB at ${highs[i].toFixed(4)} (high volume confirmation)`;
            break;
          }
        }
      }
      
      return {
        id: 3,
        name: 'Order Block',
        passed: obFound,
        score: obFound ? 14 : 0,
        details: obDetails
      };
    } catch (error) {
      return { id: 3, name: 'Order Block', passed: false, score: 0, details: 'OB validation error' };
    }
  }

  private async validateGate4_MarketStructure(sweep: LiquiditySweep): Promise<GateResult> {
    try {
      const yahooSymbol = sweep.symbol;
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=15m&range=2d`
      );
      
      if (!response.ok) {
        return { id: 4, name: 'Market Structure', passed: false, score: 0, details: 'Failed to fetch structure data' };
      }
      
      const data = await response.json();
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
      if (!quotes) {
        return { id: 4, name: 'Market Structure', passed: false, score: 0, details: 'No market data for structure' };
      }

      const highs = quotes.high.filter((h: number | null) => h !== null);
      const lows = quotes.low.filter((l: number | null) => l !== null);
      const closes = quotes.close.filter((c: number | null) => c !== null);
      
      if (highs.length < 10) {
        return { id: 4, name: 'Market Structure', passed: false, score: 0, details: 'Insufficient data' };
      }

      const swingHighs: number[] = [];
      const swingLows: number[] = [];
      
      for (let i = 2; i < highs.length - 2; i++) {
        if (highs[i] > highs[i-1] && highs[i] > highs[i-2] && 
            highs[i] > highs[i+1] && highs[i] > highs[i+2]) {
          swingHighs.push(highs[i]);
        }
        if (lows[i] < lows[i-1] && lows[i] < lows[i-2] && 
            lows[i] < lows[i+1] && lows[i] < lows[i+2]) {
          swingLows.push(lows[i]);
        }
      }
      
      let structureAligned = false;
      let structureDetails = 'No clear structure shift';
      
      if (sweep.direction === 'LONG') {
        const recentLows = swingLows.slice(-3);
        const lastClose = closes[closes.length - 1];
        if (recentLows.length >= 2 && recentLows[recentLows.length - 1] > recentLows[0]) {
          structureAligned = true;
          structureDetails = 'Higher lows forming - bullish structure shift';
        } else if (lastClose > sweep.sweepLevel) {
          structureAligned = true;
          structureDetails = 'Price reclaimed above sweep level - bullish';
        }
      } else {
        const recentHighs = swingHighs.slice(-3);
        const lastClose = closes[closes.length - 1];
        if (recentHighs.length >= 2 && recentHighs[recentHighs.length - 1] < recentHighs[0]) {
          structureAligned = true;
          structureDetails = 'Lower highs forming - bearish structure shift';
        } else if (lastClose < sweep.sweepLevel) {
          structureAligned = true;
          structureDetails = 'Price rejected below sweep level - bearish';
        }
      }
      
      return {
        id: 4,
        name: 'Market Structure',
        passed: structureAligned,
        score: structureAligned ? 14 : 0,
        details: structureDetails
      };
    } catch (error) {
      return { id: 4, name: 'Market Structure', passed: false, score: 0, details: 'Structure validation error' };
    }
  }

  private async validateGate5_Momentum(sweep: LiquiditySweep): Promise<GateResult> {
    // Use ATR-based thresholds for penetration validation
    const atrContext = sweep.atrContext;
    const minPenetration = atrContext ? atrContext.minPenetration : 0.15;
    const maxPenetration = atrContext ? atrContext.maxPenetration : 3.0;

    // Adaptive volume thresholds based on market regime
    const baseVolumeThreshold = sweep.marketRegime === 'volatile' ? 1.2 : 1.5;
    const strongVolumeThreshold = sweep.marketRegime === 'volatile' ? 1.8 : 2.0;

    const volumeConfirmed = sweep.volumeRatio >= baseVolumeThreshold;
    const strongMomentum = sweep.volumeRatio >= strongVolumeThreshold;
    const penetrationValid = sweep.penetration >= minPenetration && sweep.penetration <= maxPenetration;

    let score = 0;
    const reasons: string[] = [];

    if (volumeConfirmed) {
      score += 7;
      reasons.push(`Volume ${sweep.volumeRatio.toFixed(1)}x avg (threshold: ${baseVolumeThreshold}x)`);
    }
    if (strongMomentum) {
      score += 4;
      reasons.push('Strong volume spike');
    }
    if (penetrationValid) {
      score += 3;
      reasons.push(`ATR-valid penetration ${sweep.penetration.toFixed(2)}% (range: ${minPenetration.toFixed(2)}-${maxPenetration.toFixed(2)}%)`);
    }

    const passed = score >= 10;

    return {
      id: 5,
      name: 'Momentum Confirmation',
      passed,
      score: passed ? 14 : score,
      details: reasons.length > 0 ? reasons.join(', ') : 'Weak momentum'
    };
  }

  private async validateGate6_SessionTiming(sweep: LiquiditySweep): Promise<GateResult> {
    const now = new Date();
    const hour = now.getUTCHours();
    
    const isLondonSession = hour >= 8 && hour < 16;
    const isNYSession = hour >= 13 && hour < 21;
    const isAsianSession = hour >= 0 && hour < 8;
    
    const optimalSession = isLondonSession || isNYSession;
    
    return {
      id: 6,
      name: 'Session Timing',
      passed: optimalSession,
      score: optimalSession ? 14 : 5,
      details: optimalSession 
        ? `Optimal session: ${isLondonSession ? 'London' : 'NY'}`
        : 'Outside optimal sessions'
    };
  }

  private async validateGate7_Confluence(sweep: LiquiditySweep, previousGates: GateResult[]): Promise<GateResult> {
    const gatesPassed = previousGates.filter(g => g.passed).length;
    const totalScore = previousGates.reduce((sum, g) => sum + g.score, 0);
    
    const confluenceStrong = gatesPassed >= 4 && totalScore >= 50;
    
    return {
      id: 7,
      name: 'Confluence Score',
      passed: confluenceStrong,
      score: confluenceStrong ? 15 : Math.floor(totalScore / 5),
      details: `${gatesPassed}/6 gates passed, ${totalScore} points`
    };
  }

  private async executeBracketOrder(sweep: LiquiditySweep, gateResults: GateResult[]) {
    try {
      const entryPrice = sweep.closePrice;
      const totalScore = gateResults.reduce((sum, g) => sum + g.score, 0);
      const gatesPassed = gateResults.filter(g => g.passed).length;

      // Use ATR-based stop loss instead of fixed tick-based stop
      // This adapts to the asset's volatility
      const atrContext = sweep.atrContext;
      const stopMultiplier = atrContext?.dynamicStopMultiplier || 2.0;
      const atr = atrContext?.atr || entryPrice * 0.02; // Fallback to 2%

      let stopLoss: number;
      let takeProfit: number;

      if (sweep.direction === 'LONG') {
        // ATR-based stop: place stop 2x ATR below wick extreme
        stopLoss = sweep.wickExtreme - (stopMultiplier * atr);

        const nearestResistance = await this.findNearestLiquidityPool(sweep.symbol, 'high', entryPrice);
        // Target should give at least 2:1 R:R
        const minTarget = entryPrice + (entryPrice - stopLoss) * 2;
        takeProfit = nearestResistance && nearestResistance > minTarget
          ? nearestResistance
          : minTarget;
      } else {
        // ATR-based stop: place stop 2x ATR above wick extreme
        stopLoss = sweep.wickExtreme + (stopMultiplier * atr);

        const nearestSupport = await this.findNearestLiquidityPool(sweep.symbol, 'low', entryPrice);
        // Target should give at least 2:1 R:R
        const minTarget = entryPrice - (stopLoss - entryPrice) * 2;
        takeProfit = nearestSupport && nearestSupport < minTarget
          ? nearestSupport
          : minTarget;
      }

      const quantity = this.calculatePositionSize(entryPrice, stopLoss);

      const bracketOrder: BracketOrder = {
        symbol: sweep.symbol,
        side: sweep.direction === 'LONG' ? 'buy' : 'sell',
        quantity,
        entryPrice,
        stopLoss,
        takeProfit,
        sweepData: sweep,
        gateResults
      };

      console.log(`\n🎯 EXECUTING BRACKET ORDER (ATR-Adaptive):`);
      console.log(`   Symbol: ${bracketOrder.symbol}`);
      console.log(`   Side: ${bracketOrder.side.toUpperCase()}`);
      console.log(`   Entry: $${entryPrice.toFixed(4)}`);
      console.log(`   Stop Loss: $${stopLoss.toFixed(4)} (${stopMultiplier}x ATR = ${atr.toFixed(4)})`);
      console.log(`   Take Profit: $${takeProfit.toFixed(4)}`);
      console.log(`   Quantity: ${quantity}`);
      console.log(`   Market Regime: ${sweep.marketRegime || 'unknown'}`);

      // Record signal before execution
      const signalId = await signalTracker.recordSignal({
        symbol: sweep.symbol,
        direction: sweep.direction.toLowerCase() as 'long' | 'short',
        entryPrice,
        stopLoss,
        takeProfit,
        quantity,
        gateScores: {
          gate1: gateResults[0]?.score || 0,
          gate2: gateResults[1]?.score || 0,
          gate3: gateResults[2]?.score || 0,
          gate4: gateResults[3]?.score || 0,
          gate5: gateResults[4]?.score || 0,
          gate6: gateResults[5]?.score || 0,
          gate7: gateResults[6]?.score || 0,
        },
        totalScore,
        gatesPassed,
        atr: atrContext?.atr,
        atrPercent: atrContext?.atrPercent,
        volumeRatio: sweep.volumeRatio,
        sweepType: sweep.type,
        sweepLevel: sweep.levelType,
        penetrationPercent: sweep.penetration,
        marketRegime: sweep.marketRegime,
      });

      const result = await tradingExecutionService.executeOrder(
        this.config.platform,
        {
          symbol: sweep.symbol,
          side: bracketOrder.side,
          quantity,
          orderType: 'market',
          stopPrice: stopLoss,
          takeProfitPrice: takeProfit
        },
        this.config.isPaperTrading
      );

      if (result.success) {
        const execution: TradeExecution = {
          orderId: result.orderId || `7G_${Date.now()}`,
          symbol: sweep.symbol,
          side: bracketOrder.side,
          entryPrice: result.filledPrice || entryPrice,
          quantity,
          stopLoss,
          takeProfit,
          status: 'open',
          openTime: new Date(),
          signalId,
          gateScore: totalScore,
          gatesPassed,
        };

        this.activePositions.set(execution.orderId, execution);
        this.todayTrades++;

        // Register position with risk manager
        riskManager.registerPosition(execution.orderId, {
          symbol: sweep.symbol,
          side: bracketOrder.side,
          entryPrice: execution.entryPrice,
          quantity,
          currentValue: execution.entryPrice * quantity,
          unrealizedPnl: 0,
        });

        await this.logTrade(bracketOrder, result, gateResults);

        await this.sendNotification(
          `🎯 TRADE EXECUTED: ${sweep.symbol}`,
          `Direction: ${sweep.direction}\nEntry: $${entryPrice.toFixed(4)}\nStop: $${stopLoss.toFixed(4)} (${stopMultiplier}x ATR)\nTarget: $${takeProfit.toFixed(4)}\nGate Score: ${totalScore}/100\nRegime: ${sweep.marketRegime || 'unknown'}`
        );

        console.log('✅ Trade executed successfully');
      } else {
        console.error('❌ Trade execution failed:', result.message);
        await this.sendNotification(
          `❌ TRADE FAILED: ${sweep.symbol}`,
          `Error: ${result.message}`
        );
      }

    } catch (error) {
      console.error('Bracket order error:', error);
    }
  }

  private async checkPositionExits(position: TradeExecution, currentPrice: number) {
    const { side, stopLoss, takeProfit, entryPrice } = position;

    if (side === 'buy') {
      if (currentPrice <= stopLoss) {
        await this.closePosition(position, currentPrice, 'stopped');
      } else if (currentPrice >= takeProfit) {
        await this.closePosition(position, currentPrice, 'profit_target');
      }
    } else {
      if (currentPrice >= stopLoss) {
        await this.closePosition(position, currentPrice, 'stopped');
      } else if (currentPrice <= takeProfit) {
        await this.closePosition(position, currentPrice, 'profit_target');
      }
    }
  }

  private async closePosition(position: TradeExecution, exitPrice: number, reason: 'stopped' | 'profit_target') {
    const pnl = position.side === 'buy'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    position.status = reason;
    position.pnl = pnl;
    position.closeTime = new Date();

    this.todayPnl += pnl;

    // Close position in risk manager
    riskManager.closePosition(position.orderId, exitPrice);

    // Update signal outcome for tracking
    if (position.signalId) {
      const outcome = reason === 'profit_target' ? 'win' : 'loss';
      await signalTracker.updateOutcome(position.signalId, exitPrice, outcome);
    }

    await tradingExecutionService.executeOrder(
      this.config.platform,
      {
        symbol: position.symbol,
        side: position.side === 'buy' ? 'sell' : 'buy',
        quantity: position.quantity,
        orderType: 'market'
      },
      this.config.isPaperTrading
    );

    this.activePositions.delete(position.orderId);

    const emoji = reason === 'profit_target' ? '💰' : '🛑';
    await this.sendNotification(
      `${emoji} POSITION CLOSED: ${position.symbol}`,
      `Exit: ${reason.toUpperCase()}\nEntry: $${position.entryPrice.toFixed(4)}\nExit: $${exitPrice.toFixed(4)}\nP/L: $${pnl.toFixed(2)}`
    );

    console.log(`${emoji} Position closed: ${position.symbol} - ${reason} - P/L: $${pnl.toFixed(2)}`);
  }

  private async monitorActivePositions() {
    const positions = Array.from(this.activePositions.entries());
    for (const [orderId, position] of positions) {
      try {
        let currentPrice = this.priceWebhooks.get(position.symbol);
        
        if (!currentPrice) {
          const yahooSymbol = position.symbol;
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
          );
          if (response.ok) {
            const data = await response.json();
            currentPrice = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          }
        }
        
        if (currentPrice) {
          this.priceWebhooks.set(position.symbol, currentPrice);
          await this.checkPositionExits(position, currentPrice);
        }
      } catch (error) {
        console.error(`Error monitoring position ${orderId}:`, error);
      }
    }
  }

  private getLatestPrice(symbol: string): number | undefined {
    return this.priceWebhooks.get(symbol);
  }

  private async findNearestLiquidityPool(symbol: string, direction: 'high' | 'low', currentPrice: number): Promise<number | null> {
    try {
      const yahooSymbol = symbol;
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=15m&range=5d`
      );
      
      if (!response.ok) return null;
      
      const data = await response.json();
      const quotes = data.chart?.result?.[0]?.indicators?.quote?.[0];
      if (!quotes) return null;

      const prices = direction === 'high' 
        ? quotes.high.filter((h: number | null) => h !== null && h > currentPrice)
        : quotes.low.filter((l: number | null) => l !== null && l < currentPrice);

      if (prices.length === 0) return null;

      const swingPoints: number[] = [];
      for (let i = 2; i < prices.length - 2; i++) {
        if (direction === 'high') {
          if (prices[i] > prices[i-1] && prices[i] > prices[i-2] && 
              prices[i] > prices[i+1] && prices[i] > prices[i+2]) {
            swingPoints.push(prices[i]);
          }
        } else {
          if (prices[i] < prices[i-1] && prices[i] < prices[i-2] && 
              prices[i] < prices[i+1] && prices[i] < prices[i+2]) {
            swingPoints.push(prices[i]);
          }
        }
      }

      if (swingPoints.length === 0) return null;

      swingPoints.sort((a, b) => direction === 'high' 
        ? a - b
        : b - a  
      );

      return swingPoints[0];

    } catch (error) {
      return null;
    }
  }

  private getTickSize(symbol: string): number {
    const tickSizes: Record<string, number> = {
      'GC=F': 0.10,
      'SI=F': 0.005,
      'BTC-USD': 0.50,
      'ETH-USD': 0.10,
      'SPY': 0.01,
      'QQQ': 0.01
    };
    return tickSizes[symbol] || 0.01;
  }

  private calculatePositionSize(entryPrice: number, stopLoss: number): number {
    const riskPerTrade = 100;
    const stopDistance = Math.abs(entryPrice - stopLoss);
    if (stopDistance === 0) return 1;
    return Math.max(1, Math.floor(riskPerTrade / stopDistance));
  }

  private async sendHeartbeat() {
    this.lastHeartbeat = new Date();
    const uptimeHours = (Date.now() - this.startTime.getTime()) / (1000 * 60 * 60);

    const status: HeartbeatStatus = {
      lastHeartbeat: this.lastHeartbeat,
      isAlive: this.isRunning,
      activePositions: this.activePositions.size,
      todayTrades: this.todayTrades,
      todayPnl: this.todayPnl,
      uptime: uptimeHours
    };

    await this.sendNotification(
      '💓 7-Gate Bot Heartbeat',
      `Status: ${status.isAlive ? 'ALIVE' : 'STOPPED'}\nUptime: ${uptimeHours.toFixed(1)} hours\nActive Positions: ${status.activePositions}\nToday Trades: ${status.todayTrades}\nToday P/L: $${status.todayPnl.toFixed(2)}`
    );

    console.log('💓 Heartbeat sent');
    return status;
  }

  private async sendNotification(title: string, message: string) {
    if (this.config.discordWebhook) {
      try {
        await fetch(this.config.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title,
              description: message,
              color: title.includes('✅') || title.includes('💰') ? 0x00ff00 : 
                     title.includes('❌') || title.includes('🛑') ? 0xff0000 : 0x0099ff,
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (error) {
        console.error('Discord notification error:', error);
      }
    }

    if (this.config.telegramBotToken && this.config.telegramChatId) {
      try {
        await fetch(`https://api.telegram.org/bot${this.config.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.config.telegramChatId,
            text: `*${title}*\n\n${message}`,
            parse_mode: 'Markdown'
          })
        });
      } catch (error) {
        console.error('Telegram notification error:', error);
      }
    }
  }

  private async logTrade(order: BracketOrder, result: any, gates: GateResult[]) {
    try {
      const gateScore = gates.reduce((sum, g) => sum + g.score, 0);
      const gatesPassed = gates.filter(g => g.passed).length;

      await db.insert(ruleExecutionLogs).values({
        ruleId: 0,
        logType: '7gate_trade',
        message: `${order.side.toUpperCase()} ${order.symbol} @ ${order.entryPrice} | SL: ${order.stopLoss} | TP: ${order.takeProfit} | Gates: ${gatesPassed}/7 | Score: ${gateScore}`,
        marketData: {
          sweep: order.sweepData,
          gates: order.gateResults,
          order: {
            side: order.side,
            quantity: order.quantity,
            entry: order.entryPrice,
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit
          }
        }
      });
    } catch (error) {
      console.error('Trade logging error:', error);
    }
  }

  getStatus() {
    // Get risk status from risk manager
    const riskStatus = riskManager.getStatus();

    return {
      isRunning: this.isRunning,
      startTime: this.startTime.toISOString(),
      uptimeHours: (Date.now() - this.startTime.getTime()) / (1000 * 60 * 60),
      lastHeartbeat: this.lastHeartbeat.toISOString(),
      activePositions: this.activePositions.size,
      positions: Array.from(this.activePositions.values()),
      todayTrades: this.todayTrades,
      todayPnl: this.todayPnl,
      config: {
        platform: this.config.platform,
        isPaperTrading: this.config.isPaperTrading,
        scanIntervalMs: this.config.scanIntervalMs,
        minGateScore: this.config.minGateScore,
        minGatesPassed: this.config.minGatesPassed
      },
      // Institutional-grade risk metrics
      riskManagement: {
        tradingHalted: riskStatus.tradingHalted,
        haltReason: riskStatus.haltReason,
        dailyPnl: riskStatus.dailyPnl,
        dailyPnlPercent: riskStatus.dailyPnlPercent,
        totalExposure: riskStatus.totalExposure,
        currentDrawdown: riskStatus.currentDrawdown,
        remainingRisk: riskStatus.remainingRisk,
        limits: {
          maxDailyLoss: riskStatus.limits.maxDailyLossPercent,
          maxOpenPositions: riskStatus.limits.maxOpenPositions,
          maxCorrelatedExposure: riskStatus.limits.maxCorrelatedExposurePercent,
          maxDrawdown: riskStatus.limits.maxDrawdownPercent,
        }
      }
    };
  }

  /**
   * Get signal performance analytics
   */
  async getSignalAnalytics() {
    const performance = await signalTracker.getPerformanceReport(30);
    const thresholds = await signalTracker.getOptimalThresholds();
    const recentSignals = await signalTracker.getRecentSignals(10);

    return {
      performance,
      optimalThresholds: thresholds,
      recentSignals,
    };
  }

  /**
   * Get gate effectiveness report
   */
  async getGateEffectiveness() {
    return await signalTracker.getGateEffectiveness();
  }

  async configure(config: Partial<typeof this.config>) {
    this.config = { ...this.config, ...config };
    return { success: true, config: this.config };
  }

  async forceHeartbeat() {
    return await this.sendHeartbeat();
  }
}

export const sevenGateTradingBot = new SevenGateTradingBot();
