/**
 * 7-Gate Trading Risk Manager
 *
 * Institutional-grade risk management system with:
 * - Position limits and correlation checks
 * - Daily loss limits and circuit breakers
 * - Drawdown protection and trading halts
 * - Asset correlation matrix for crypto/correlated assets
 */

import { db } from './db';
import {
  sevenGateRiskLimits,
  sevenGateDailyMetrics,
  assetCorrelations,
  sevenGateSignalHistory
} from '@shared/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';

// Pre-defined correlation matrix for common crypto assets
// Values based on historical 30-day rolling correlations
const CRYPTO_CORRELATION_MATRIX: Record<string, Record<string, number>> = {
  'BTC-USD': { 'BTC-USD': 1.0, 'ETH-USD': 0.92, 'SOL-USD': 0.88, 'XRP-USD': 0.75, 'ADA-USD': 0.80 },
  'ETH-USD': { 'BTC-USD': 0.92, 'ETH-USD': 1.0, 'SOL-USD': 0.90, 'XRP-USD': 0.72, 'ADA-USD': 0.78 },
  'SOL-USD': { 'BTC-USD': 0.88, 'ETH-USD': 0.90, 'SOL-USD': 1.0, 'XRP-USD': 0.70, 'ADA-USD': 0.82 },
  'XRP-USD': { 'BTC-USD': 0.75, 'ETH-USD': 0.72, 'SOL-USD': 0.70, 'XRP-USD': 1.0, 'ADA-USD': 0.68 },
  'ADA-USD': { 'BTC-USD': 0.80, 'ETH-USD': 0.78, 'SOL-USD': 0.82, 'XRP-USD': 0.68, 'ADA-USD': 1.0 },
};

// Commodities and indices - lower correlation
const CROSS_ASSET_CORRELATIONS: Record<string, Record<string, number>> = {
  'GC=F': { 'GC=F': 1.0, 'SI=F': 0.85, 'SPY': 0.15, 'QQQ': 0.10, 'BTC-USD': 0.25 },
  'SI=F': { 'GC=F': 0.85, 'SI=F': 1.0, 'SPY': 0.20, 'QQQ': 0.15, 'BTC-USD': 0.30 },
  'SPY':  { 'GC=F': 0.15, 'SI=F': 0.20, 'SPY': 1.0, 'QQQ': 0.95, 'BTC-USD': 0.45 },
  'QQQ':  { 'GC=F': 0.10, 'SI=F': 0.15, 'SPY': 0.95, 'QQQ': 1.0, 'BTC-USD': 0.50 },
};

interface Position {
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  quantity: number;
  currentValue: number;
  unrealizedPnl: number;
}

interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
  riskMetrics?: {
    currentDailyLoss: number;
    currentExposure: number;
    correlatedExposure: number;
    openPositions: number;
    remainingRisk: number;
  };
}

interface RiskLimits {
  maxDailyLossPercent: number;
  maxOpenPositions: number;
  maxCorrelatedExposurePercent: number;
  maxPositionSizePercent: number;
  maxDrawdownPercent: number;
  maxTradesPerSession: number;
  minTimeBetweenTradesMinutes: number;
  minGateScore: number;
  minGatesPassed: number;
  initialCapital: number;
  currentCapital: number;
}

interface DailyMetrics {
  date: string;
  dailyPnl: number;
  dailyPnlPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdownPercent: number;
  highWaterMark: number;
}

class RiskManager {
  private positions: Map<string, Position> = new Map();
  private dailyPnl: number = 0;
  private dailyTrades: number = 0;
  private lastTradeTime: Date | null = null;
  private tradingHalted: boolean = false;
  private haltReason: string = '';
  private highWaterMark: number = 0;
  private sessionStart: Date = new Date();

  private limits: RiskLimits = {
    maxDailyLossPercent: 3,
    maxOpenPositions: 5,
    maxCorrelatedExposurePercent: 50,
    maxPositionSizePercent: 2,
    maxDrawdownPercent: 10,
    maxTradesPerSession: 10,
    minTimeBetweenTradesMinutes: 5,
    minGateScore: 70,
    minGatesPassed: 5,
    initialCapital: 10000,
    currentCapital: 10000,
  };

  constructor() {
    this.resetDailyMetrics();
  }

  /**
   * Check if a new position can be opened
   */
  async canOpenPosition(
    symbol: string,
    side: 'buy' | 'sell',
    positionSize: number,
    entryPrice: number,
    gateScore: number,
    gatesPassed: number
  ): Promise<RiskCheckResult> {
    const warnings: string[] = [];

    // Check if trading is halted
    if (this.tradingHalted) {
      return {
        allowed: false,
        reason: `Trading halted: ${this.haltReason}`,
      };
    }

    // 1. Check gate score thresholds
    if (gateScore < this.limits.minGateScore) {
      return {
        allowed: false,
        reason: `Gate score ${gateScore} below minimum ${this.limits.minGateScore}`,
      };
    }

    if (gatesPassed < this.limits.minGatesPassed) {
      return {
        allowed: false,
        reason: `Gates passed ${gatesPassed} below minimum ${this.limits.minGatesPassed}`,
      };
    }

    // 2. Check daily loss limit
    const dailyLossLimit = this.limits.initialCapital * (this.limits.maxDailyLossPercent / 100);
    if (this.dailyPnl <= -dailyLossLimit) {
      this.haltTrading('Daily loss limit reached');
      return {
        allowed: false,
        reason: `Daily loss limit of ${this.limits.maxDailyLossPercent}% reached`,
      };
    }

    // 3. Check position count
    if (this.positions.size >= this.limits.maxOpenPositions) {
      return {
        allowed: false,
        reason: `Max open positions (${this.limits.maxOpenPositions}) reached`,
      };
    }

    // 4. Check position size
    const positionValue = positionSize * entryPrice;
    const maxPositionValue = this.limits.currentCapital * (this.limits.maxPositionSizePercent / 100);
    if (positionValue > maxPositionValue) {
      return {
        allowed: false,
        reason: `Position size $${positionValue.toFixed(2)} exceeds max $${maxPositionValue.toFixed(2)} (${this.limits.maxPositionSizePercent}% of capital)`,
      };
    }

    // 5. Check correlated exposure
    const correlatedExposure = this.calculateCorrelatedExposure(symbol, positionValue);
    const maxCorrelatedExposure = this.limits.currentCapital * (this.limits.maxCorrelatedExposurePercent / 100);
    if (correlatedExposure > maxCorrelatedExposure) {
      return {
        allowed: false,
        reason: `Correlated exposure $${correlatedExposure.toFixed(2)} exceeds max $${maxCorrelatedExposure.toFixed(2)} (${this.limits.maxCorrelatedExposurePercent}% of capital)`,
      };
    }

    // 6. Check trades per session
    if (this.dailyTrades >= this.limits.maxTradesPerSession) {
      return {
        allowed: false,
        reason: `Max trades per session (${this.limits.maxTradesPerSession}) reached`,
      };
    }

    // 7. Check minimum time between trades
    if (this.lastTradeTime) {
      const minutesSinceLastTrade = (Date.now() - this.lastTradeTime.getTime()) / (1000 * 60);
      if (minutesSinceLastTrade < this.limits.minTimeBetweenTradesMinutes) {
        return {
          allowed: false,
          reason: `Must wait ${(this.limits.minTimeBetweenTradesMinutes - minutesSinceLastTrade).toFixed(1)} more minutes before next trade`,
        };
      }
    }

    // 8. Check max drawdown
    const currentDrawdown = ((this.highWaterMark - this.limits.currentCapital) / this.highWaterMark) * 100;
    if (currentDrawdown >= this.limits.maxDrawdownPercent) {
      this.haltTrading(`Max drawdown of ${this.limits.maxDrawdownPercent}% reached`);
      return {
        allowed: false,
        reason: `Max drawdown of ${this.limits.maxDrawdownPercent}% reached (current: ${currentDrawdown.toFixed(2)}%)`,
      };
    }

    // Add warnings for elevated risk
    const remainingDailyRisk = dailyLossLimit + this.dailyPnl;
    if (remainingDailyRisk < dailyLossLimit * 0.3) {
      warnings.push(`Warning: Only ${((remainingDailyRisk / dailyLossLimit) * 100).toFixed(1)}% of daily risk budget remaining`);
    }

    if (this.positions.size >= this.limits.maxOpenPositions - 1) {
      warnings.push(`Warning: Near position limit (${this.positions.size}/${this.limits.maxOpenPositions})`);
    }

    return {
      allowed: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      riskMetrics: {
        currentDailyLoss: this.dailyPnl,
        currentExposure: this.getTotalExposure(),
        correlatedExposure,
        openPositions: this.positions.size,
        remainingRisk: remainingDailyRisk,
      },
    };
  }

  /**
   * Calculate exposure to correlated assets
   */
  calculateCorrelatedExposure(newSymbol: string, newPositionValue: number): number {
    let correlatedExposure = newPositionValue;

    const positionEntries = Array.from(this.positions.entries());
    for (const [symbol, position] of positionEntries) {
      const correlation = this.getCorrelation(newSymbol, symbol);
      // Only count highly correlated positions (>0.7)
      if (Math.abs(correlation) > 0.7) {
        correlatedExposure += Math.abs(position.currentValue * correlation);
      }
    }

    return correlatedExposure;
  }

  /**
   * Get correlation between two assets
   */
  getCorrelation(symbolA: string, symbolB: string): number {
    if (symbolA === symbolB) return 1.0;

    // Check crypto correlation matrix
    if (CRYPTO_CORRELATION_MATRIX[symbolA]?.[symbolB] !== undefined) {
      return CRYPTO_CORRELATION_MATRIX[symbolA][symbolB];
    }

    // Check cross-asset correlations
    if (CROSS_ASSET_CORRELATIONS[symbolA]?.[symbolB] !== undefined) {
      return CROSS_ASSET_CORRELATIONS[symbolA][symbolB];
    }

    // Default to low correlation for unknown pairs
    return 0.2;
  }

  /**
   * Get total exposure across all positions
   */
  getTotalExposure(): number {
    let total = 0;
    for (const position of this.positions.values()) {
      total += Math.abs(position.currentValue);
    }
    return total;
  }

  /**
   * Register a new position
   */
  registerPosition(positionId: string, position: Position): void {
    this.positions.set(positionId, position);
    this.dailyTrades++;
    this.lastTradeTime = new Date();
  }

  /**
   * Update position value
   */
  updatePosition(positionId: string, currentPrice: number): void {
    const position = this.positions.get(positionId);
    if (position) {
      position.currentValue = position.quantity * currentPrice;
      position.unrealizedPnl = position.side === 'buy'
        ? (currentPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - currentPrice) * position.quantity;
    }
  }

  /**
   * Close a position and update P&L
   */
  closePosition(positionId: string, exitPrice: number): number {
    const position = this.positions.get(positionId);
    if (!position) return 0;

    const realizedPnl = position.side === 'buy'
      ? (exitPrice - position.entryPrice) * position.quantity
      : (position.entryPrice - exitPrice) * position.quantity;

    this.dailyPnl += realizedPnl;
    this.limits.currentCapital += realizedPnl;

    // Update high water mark
    if (this.limits.currentCapital > this.highWaterMark) {
      this.highWaterMark = this.limits.currentCapital;
    }

    this.positions.delete(positionId);
    return realizedPnl;
  }

  /**
   * Halt trading with reason
   */
  haltTrading(reason: string): void {
    this.tradingHalted = true;
    this.haltReason = reason;
    console.log(`🛑 TRADING HALTED: ${reason}`);
  }

  /**
   * Resume trading
   */
  resumeTrading(): void {
    this.tradingHalted = false;
    this.haltReason = '';
    console.log('✅ Trading resumed');
  }

  /**
   * Reset daily metrics (called at session start)
   */
  resetDailyMetrics(): void {
    this.dailyPnl = 0;
    this.dailyTrades = 0;
    this.lastTradeTime = null;
    this.sessionStart = new Date();

    // Check if we should resume trading
    if (this.tradingHalted && this.haltReason.includes('Daily loss limit')) {
      this.resumeTrading();
    }
  }

  /**
   * Get current risk status
   */
  getStatus(): {
    tradingHalted: boolean;
    haltReason: string;
    dailyPnl: number;
    dailyPnlPercent: number;
    dailyTrades: number;
    openPositions: number;
    totalExposure: number;
    currentDrawdown: number;
    remainingRisk: number;
    limits: RiskLimits;
  } {
    const dailyLossLimit = this.limits.initialCapital * (this.limits.maxDailyLossPercent / 100);
    const currentDrawdown = this.highWaterMark > 0
      ? ((this.highWaterMark - this.limits.currentCapital) / this.highWaterMark) * 100
      : 0;

    return {
      tradingHalted: this.tradingHalted,
      haltReason: this.haltReason,
      dailyPnl: this.dailyPnl,
      dailyPnlPercent: (this.dailyPnl / this.limits.initialCapital) * 100,
      dailyTrades: this.dailyTrades,
      openPositions: this.positions.size,
      totalExposure: this.getTotalExposure(),
      currentDrawdown,
      remainingRisk: dailyLossLimit + this.dailyPnl,
      limits: this.limits,
    };
  }

  /**
   * Update risk limits
   */
  updateLimits(newLimits: Partial<RiskLimits>): void {
    this.limits = { ...this.limits, ...newLimits };

    // Update high water mark if capital increased
    if (this.limits.currentCapital > this.highWaterMark) {
      this.highWaterMark = this.limits.currentCapital;
    }
  }

  /**
   * Load limits from database
   */
  async loadLimitsFromDb(userId?: number): Promise<void> {
    try {
      const query = userId
        ? eq(sevenGateRiskLimits.userId, userId)
        : eq(sevenGateRiskLimits.isActive, true);

      const [limits] = await db.select().from(sevenGateRiskLimits).where(query).limit(1);

      if (limits) {
        this.updateLimits({
          maxDailyLossPercent: Number(limits.maxDailyLossPercent),
          maxOpenPositions: limits.maxOpenPositions,
          maxCorrelatedExposurePercent: Number(limits.maxCorrelatedExposurePercent),
          maxPositionSizePercent: Number(limits.maxPositionSizePercent),
          maxDrawdownPercent: Number(limits.maxDrawdownPercent),
          maxTradesPerSession: limits.maxTradesPerSession || 10,
          minTimeBetweenTradesMinutes: limits.minTimeBetweenTradesMinutes || 5,
          minGateScore: limits.minGateScore,
          minGatesPassed: limits.minGatesPassed,
          initialCapital: limits.initialCapital ? Number(limits.initialCapital) : 10000,
          currentCapital: limits.currentCapital ? Number(limits.currentCapital) : 10000,
        });
      }
    } catch (error) {
      console.error('Error loading risk limits:', error);
    }
  }

  /**
   * Save current metrics to database
   */
  async saveDailyMetrics(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentDrawdown = this.highWaterMark > 0
        ? ((this.highWaterMark - this.limits.currentCapital) / this.highWaterMark) * 100
        : 0;

      await db.insert(sevenGateDailyMetrics).values({
        date: today,
        startingCapital: String(this.limits.initialCapital),
        endingCapital: String(this.limits.currentCapital),
        dailyPnl: String(this.dailyPnl),
        dailyPnlPercent: String((this.dailyPnl / this.limits.initialCapital) * 100),
        totalTrades: this.dailyTrades,
        maxDrawdownPercent: String(currentDrawdown),
        highWaterMark: String(this.highWaterMark),
        dailyLossLimitHit: this.tradingHalted && this.haltReason.includes('Daily loss'),
        tradingHaltTriggered: this.tradingHalted,
        haltReason: this.haltReason || null,
      }).onConflictDoNothing();
    } catch (error) {
      console.error('Error saving daily metrics:', error);
    }
  }

  /**
   * Get open positions
   */
  getOpenPositions(): Position[] {
    const positions: Position[] = [];
    this.positions.forEach((position) => positions.push(position));
    return positions;
  }

  /**
   * Check if we're in a drawdown
   */
  isInDrawdown(): boolean {
    const currentDrawdown = this.highWaterMark > 0
      ? ((this.highWaterMark - this.limits.currentCapital) / this.highWaterMark) * 100
      : 0;
    return currentDrawdown > 5; // More than 5% drawdown
  }
}

// Export singleton instance
export const riskManager = new RiskManager();

// Export class for testing
export { RiskManager };
