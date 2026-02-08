/**
 * 7-Gate Signal Tracker
 *
 * Institutional-grade signal tracking and performance analytics:
 * - Records all signals with gate scores
 * - Tracks outcomes (win/loss/breakeven)
 * - Calculates gate effectiveness
 * - Provides data-driven threshold recommendations
 */

import { db } from './db';
import {
  sevenGateSignalHistory,
  sevenGatePerformance,
  InsertSevenGateSignalHistory,
} from '@shared/schema';
import { eq, and, gte, sql, desc, asc, avg, count, sum } from 'drizzle-orm';

interface GateScores {
  gate1: number; // Liquidity Sweep
  gate2: number; // Fair Value Gap
  gate3: number; // Order Block
  gate4: number; // Market Structure
  gate5: number; // Momentum
  gate6: number; // Session Timing
  gate7: number; // Confluence
}

interface SignalInput {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  gateScores: GateScores;
  totalScore: number;
  gatesPassed: number;
  atr?: number;
  atrPercent?: number;
  volumeRatio?: number;
  sweepType?: string;
  sweepLevel?: string;
  penetrationPercent?: number;
  marketRegime?: 'trending' | 'ranging' | 'volatile';
}

interface GateStats {
  gateNumber: number;
  gateName: string;
  totalSignals: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgPnlPercent: number;
  profitFactor: number;
  expectedValue: number;
  importanceScore: number;
}

interface ThresholdRecommendation {
  currentThreshold: number;
  recommendedThreshold: number;
  reason: string;
  expectedImprovement: string;
}

interface PerformanceReport {
  totalSignals: number;
  winRate: number;
  avgPnlPercent: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  gateStats: GateStats[];
  sessionBreakdown: {
    london: { winRate: number; count: number };
    ny: { winRate: number; count: number };
    asia: { winRate: number; count: number };
  };
  regimeBreakdown: {
    trending: { winRate: number; count: number };
    ranging: { winRate: number; count: number };
    volatile: { winRate: number; count: number };
  };
}

class SignalTracker {
  private pendingSignals: Map<number, SignalInput> = new Map();

  /**
   * Record a new signal with all gate scores
   */
  async recordSignal(signal: SignalInput): Promise<number> {
    try {
      const [result] = await db.insert(sevenGateSignalHistory).values({
        symbol: signal.symbol,
        direction: signal.direction,
        entryPrice: String(signal.entryPrice),
        stopLoss: String(signal.stopLoss),
        takeProfit: String(signal.takeProfit),
        quantity: String(signal.quantity),
        gateScores: signal.gateScores,
        totalScore: signal.totalScore,
        gatesPassed: signal.gatesPassed,
        outcome: 'pending',
        atr: signal.atr ? String(signal.atr) : null,
        atrPercent: signal.atrPercent ? String(signal.atrPercent) : null,
        volumeRatio: signal.volumeRatio ? String(signal.volumeRatio) : null,
        sweepType: signal.sweepType,
        sweepLevel: signal.sweepLevel,
        penetrationPercent: signal.penetrationPercent ? String(signal.penetrationPercent) : null,
        marketRegime: signal.marketRegime,
        openedAt: new Date(),
      }).returning({ id: sevenGateSignalHistory.id });

      console.log(`📊 Signal #${result.id} recorded: ${signal.symbol} ${signal.direction} @ ${signal.entryPrice}`);
      this.pendingSignals.set(result.id, signal);
      return result.id;
    } catch (error) {
      console.error('Error recording signal:', error);
      throw error;
    }
  }

  /**
   * Update signal outcome when position closes
   */
  async updateOutcome(
    signalId: number,
    exitPrice: number,
    outcome: 'win' | 'loss' | 'breakeven' | 'stopped'
  ): Promise<void> {
    try {
      const [signal] = await db
        .select()
        .from(sevenGateSignalHistory)
        .where(eq(sevenGateSignalHistory.id, signalId))
        .limit(1);

      if (!signal) {
        console.error(`Signal #${signalId} not found`);
        return;
      }

      const entryPrice = Number(signal.entryPrice);
      const pnlAmount = signal.direction === 'long'
        ? (exitPrice - entryPrice) * Number(signal.quantity)
        : (entryPrice - exitPrice) * Number(signal.quantity);

      const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 *
        (signal.direction === 'long' ? 1 : -1);

      const holdingPeriodMinutes = signal.openedAt
        ? Math.round((Date.now() - new Date(signal.openedAt).getTime()) / (1000 * 60))
        : 0;

      await db.update(sevenGateSignalHistory)
        .set({
          exitPrice: String(exitPrice),
          outcome,
          pnlAmount: String(pnlAmount),
          pnlPercent: String(pnlPercent),
          holdingPeriodMinutes,
          closedAt: new Date(),
        })
        .where(eq(sevenGateSignalHistory.id, signalId));

      console.log(`📊 Signal #${signalId} closed: ${outcome} | P/L: ${pnlPercent.toFixed(2)}%`);

      // Update gate performance statistics
      await this.updateGatePerformance(signal, outcome, pnlPercent);

      this.pendingSignals.delete(signalId);
    } catch (error) {
      console.error('Error updating signal outcome:', error);
    }
  }

  /**
   * Update gate performance statistics
   */
  private async updateGatePerformance(
    signal: typeof sevenGateSignalHistory.$inferSelect,
    outcome: string,
    pnlPercent: number
  ): Promise<void> {
    try {
      const gateScores = signal.gateScores as GateScores | null;
      if (!gateScores) return;

      const gateNames = [
        'Liquidity Sweep',
        'Fair Value Gap',
        'Order Block',
        'Market Structure',
        'Momentum',
        'Session Timing',
        'Confluence',
      ];

      // Update each gate's performance
      for (let i = 1; i <= 7; i++) {
        const gateKey = `gate${i}` as keyof GateScores;
        const score = gateScores[gateKey];

        // Only update if gate passed (score > 0)
        if (score > 0) {
          const [existing] = await db
            .select()
            .from(sevenGatePerformance)
            .where(eq(sevenGatePerformance.gateNumber, i))
            .limit(1);

          const isWin = outcome === 'win';
          const isLoss = outcome === 'loss';
          const isBreakEven = outcome === 'breakeven';

          if (existing) {
            const totalSignals = existing.totalSignals! + 1;
            const winCount = existing.winCount! + (isWin ? 1 : 0);
            const lossCount = existing.lossCount! + (isLoss ? 1 : 0);
            const breakEvenCount = existing.breakEvenCount! + (isBreakEven ? 1 : 0);
            const winRate = (winCount / totalSignals) * 100;

            // Calculate running average P&L
            const currentAvgPnl = Number(existing.avgPnlPercent) || 0;
            const newAvgPnl = currentAvgPnl + (pnlPercent - currentAvgPnl) / totalSignals;

            await db.update(sevenGatePerformance)
              .set({
                totalSignals,
                winCount,
                lossCount,
                breakEvenCount,
                winRate: String(winRate),
                avgPnlPercent: String(newAvgPnl),
                lastCalculatedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(sevenGatePerformance.id, existing.id));
          } else {
            // Create new gate performance record
            await db.insert(sevenGatePerformance).values({
              gateNumber: i,
              gateName: gateNames[i - 1],
              totalSignals: 1,
              winCount: isWin ? 1 : 0,
              lossCount: isLoss ? 1 : 0,
              breakEvenCount: isBreakEven ? 1 : 0,
              winRate: isWin ? '100' : '0',
              avgPnlPercent: String(pnlPercent),
              lastCalculatedAt: new Date(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating gate performance:', error);
    }
  }

  /**
   * Get effectiveness statistics for each gate
   */
  async getGateEffectiveness(): Promise<GateStats[]> {
    try {
      const performance = await db
        .select()
        .from(sevenGatePerformance)
        .orderBy(asc(sevenGatePerformance.gateNumber));

      return performance.map((gate) => ({
        gateNumber: gate.gateNumber,
        gateName: gate.gateName,
        totalSignals: gate.totalSignals || 0,
        winCount: gate.winCount || 0,
        lossCount: gate.lossCount || 0,
        winRate: Number(gate.winRate) || 0,
        avgPnlPercent: Number(gate.avgPnlPercent) || 0,
        profitFactor: Number(gate.profitFactor) || 0,
        expectedValue: Number(gate.expectedValue) || 0,
        importanceScore: Number(gate.importanceScore) || 0,
      }));
    } catch (error) {
      console.error('Error getting gate effectiveness:', error);
      return [];
    }
  }

  /**
   * Get optimal threshold recommendations based on historical data
   */
  async getOptimalThresholds(): Promise<{
    minGateScore: ThresholdRecommendation;
    minGatesPassed: ThresholdRecommendation;
  }> {
    try {
      // Analyze performance at different score thresholds
      const scoreAnalysis = await db
        .select({
          scoreRange: sql<string>`
            CASE
              WHEN ${sevenGateSignalHistory.totalScore} >= 80 THEN '80+'
              WHEN ${sevenGateSignalHistory.totalScore} >= 70 THEN '70-79'
              WHEN ${sevenGateSignalHistory.totalScore} >= 60 THEN '60-69'
              ELSE '<60'
            END
          `,
          totalCount: count(),
          winCount: sql<number>`SUM(CASE WHEN ${sevenGateSignalHistory.outcome} = 'win' THEN 1 ELSE 0 END)`,
          avgPnl: avg(sevenGateSignalHistory.pnlPercent),
        })
        .from(sevenGateSignalHistory)
        .where(sql`${sevenGateSignalHistory.outcome} IS NOT NULL AND ${sevenGateSignalHistory.outcome} != 'pending'`)
        .groupBy(sql`1`)
        .orderBy(sql`1 DESC`);

      // Analyze performance at different gates passed thresholds
      const gatesAnalysis = await db
        .select({
          gatesPassed: sevenGateSignalHistory.gatesPassed,
          totalCount: count(),
          winCount: sql<number>`SUM(CASE WHEN ${sevenGateSignalHistory.outcome} = 'win' THEN 1 ELSE 0 END)`,
          avgPnl: avg(sevenGateSignalHistory.pnlPercent),
        })
        .from(sevenGateSignalHistory)
        .where(sql`${sevenGateSignalHistory.outcome} IS NOT NULL AND ${sevenGateSignalHistory.outcome} != 'pending'`)
        .groupBy(sevenGateSignalHistory.gatesPassed)
        .orderBy(desc(sevenGateSignalHistory.gatesPassed));

      // Find optimal score threshold
      let optimalScore = 70;
      let bestScoreWinRate = 0;

      for (const range of scoreAnalysis) {
        const winRate = range.totalCount > 0 ? (range.winCount / range.totalCount) * 100 : 0;
        if (winRate > bestScoreWinRate && range.totalCount >= 10) {
          bestScoreWinRate = winRate;
          optimalScore = parseInt(range.scoreRange.replace('+', '').split('-')[0]);
        }
      }

      // Find optimal gates passed threshold
      let optimalGates = 5;
      let bestGatesWinRate = 0;

      for (const gates of gatesAnalysis) {
        const winRate = gates.totalCount > 0 ? (gates.winCount / gates.totalCount) * 100 : 0;
        if (winRate > bestGatesWinRate && gates.totalCount >= 10) {
          bestGatesWinRate = winRate;
          optimalGates = gates.gatesPassed ?? 5;
        }
      }

      return {
        minGateScore: {
          currentThreshold: 70,
          recommendedThreshold: optimalScore,
          reason: `Signals with score >= ${optimalScore} have ${bestScoreWinRate.toFixed(1)}% win rate`,
          expectedImprovement: bestScoreWinRate > 50 ? `+${(bestScoreWinRate - 50).toFixed(1)}% above baseline` : 'Need more data',
        },
        minGatesPassed: {
          currentThreshold: 5,
          recommendedThreshold: optimalGates,
          reason: `Signals with ${optimalGates}+ gates passed have ${bestGatesWinRate.toFixed(1)}% win rate`,
          expectedImprovement: bestGatesWinRate > 50 ? `+${(bestGatesWinRate - 50).toFixed(1)}% above baseline` : 'Need more data',
        },
      };
    } catch (error) {
      console.error('Error calculating optimal thresholds:', error);
      return {
        minGateScore: {
          currentThreshold: 70,
          recommendedThreshold: 70,
          reason: 'Insufficient data for analysis',
          expectedImprovement: 'Need more signals',
        },
        minGatesPassed: {
          currentThreshold: 5,
          recommendedThreshold: 5,
          reason: 'Insufficient data for analysis',
          expectedImprovement: 'Need more signals',
        },
      };
    }
  }

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport(days: number = 30): Promise<PerformanceReport> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const signals = await db
        .select()
        .from(sevenGateSignalHistory)
        .where(
          and(
            gte(sevenGateSignalHistory.timestamp, startDate),
            sql`${sevenGateSignalHistory.outcome} IS NOT NULL AND ${sevenGateSignalHistory.outcome} != 'pending'`
          )
        );

      const totalSignals = signals.length;
      const wins = signals.filter((s) => s.outcome === 'win');
      const losses = signals.filter((s) => s.outcome === 'loss');

      const winRate = totalSignals > 0 ? (wins.length / totalSignals) * 100 : 0;

      const pnlValues = signals.map((s) => Number(s.pnlPercent) || 0);
      const avgPnlPercent = pnlValues.length > 0
        ? pnlValues.reduce((a, b) => a + b, 0) / pnlValues.length
        : 0;

      const totalWinPnl = wins.reduce((sum, s) => sum + (Number(s.pnlPercent) || 0), 0);
      const totalLossPnl = Math.abs(losses.reduce((sum, s) => sum + (Number(s.pnlPercent) || 0), 0));
      const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? Infinity : 0;

      // Calculate Sharpe ratio (simplified)
      const mean = avgPnlPercent;
      const variance = pnlValues.length > 1
        ? pnlValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (pnlValues.length - 1)
        : 0;
      const stdDev = Math.sqrt(variance);
      const sharpeRatio = stdDev > 0 ? mean / stdDev : 0;

      // Calculate max drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let cumulative = 0;
      for (const pnl of pnlValues) {
        cumulative += pnl;
        if (cumulative > peak) peak = cumulative;
        const drawdown = peak - cumulative;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      }

      // Session breakdown
      const sessionBreakdown = {
        london: this.getSessionStats(signals, 'london'),
        ny: this.getSessionStats(signals, 'ny'),
        asia: this.getSessionStats(signals, 'asia'),
      };

      // Regime breakdown
      const regimeBreakdown = {
        trending: this.getRegimeStats(signals, 'trending'),
        ranging: this.getRegimeStats(signals, 'ranging'),
        volatile: this.getRegimeStats(signals, 'volatile'),
      };

      const gateStats = await this.getGateEffectiveness();

      return {
        totalSignals,
        winRate,
        avgPnlPercent,
        profitFactor,
        sharpeRatio,
        maxDrawdown,
        gateStats,
        sessionBreakdown,
        regimeBreakdown,
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      return {
        totalSignals: 0,
        winRate: 0,
        avgPnlPercent: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        gateStats: [],
        sessionBreakdown: {
          london: { winRate: 0, count: 0 },
          ny: { winRate: 0, count: 0 },
          asia: { winRate: 0, count: 0 },
        },
        regimeBreakdown: {
          trending: { winRate: 0, count: 0 },
          ranging: { winRate: 0, count: 0 },
          volatile: { winRate: 0, count: 0 },
        },
      };
    }
  }

  /**
   * Get stats for a specific trading session
   */
  private getSessionStats(
    signals: typeof sevenGateSignalHistory.$inferSelect[],
    session: 'london' | 'ny' | 'asia'
  ): { winRate: number; count: number } {
    // Filter by session (simplified - would need timestamp analysis)
    // London: 08:00-16:00 UTC, NY: 13:00-21:00 UTC, Asia: 00:00-08:00 UTC
    const sessionSignals = signals.filter((s) => {
      if (!s.openedAt) return false;
      const hour = new Date(s.openedAt).getUTCHours();
      switch (session) {
        case 'london': return hour >= 8 && hour < 16;
        case 'ny': return hour >= 13 && hour < 21;
        case 'asia': return hour >= 0 && hour < 8;
        default: return false;
      }
    });

    const count = sessionSignals.length;
    const wins = sessionSignals.filter((s) => s.outcome === 'win').length;
    const winRate = count > 0 ? (wins / count) * 100 : 0;

    return { winRate, count };
  }

  /**
   * Get stats for a specific market regime
   */
  private getRegimeStats(
    signals: typeof sevenGateSignalHistory.$inferSelect[],
    regime: 'trending' | 'ranging' | 'volatile'
  ): { winRate: number; count: number } {
    const regimeSignals = signals.filter((s) => s.marketRegime === regime);
    const count = regimeSignals.length;
    const wins = regimeSignals.filter((s) => s.outcome === 'win').length;
    const winRate = count > 0 ? (wins / count) * 100 : 0;

    return { winRate, count };
  }

  /**
   * Get recent signals
   */
  async getRecentSignals(limit: number = 20): Promise<typeof sevenGateSignalHistory.$inferSelect[]> {
    try {
      return await db
        .select()
        .from(sevenGateSignalHistory)
        .orderBy(desc(sevenGateSignalHistory.timestamp))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent signals:', error);
      return [];
    }
  }

  /**
   * Get pending signals (not yet closed)
   */
  async getPendingSignals(): Promise<typeof sevenGateSignalHistory.$inferSelect[]> {
    try {
      return await db
        .select()
        .from(sevenGateSignalHistory)
        .where(eq(sevenGateSignalHistory.outcome, 'pending'))
        .orderBy(desc(sevenGateSignalHistory.timestamp));
    } catch (error) {
      console.error('Error getting pending signals:', error);
      return [];
    }
  }
}

// Export singleton instance
export const signalTracker = new SignalTracker();

// Export class for testing
export { SignalTracker };
