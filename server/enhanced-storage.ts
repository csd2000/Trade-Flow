import { sql } from 'drizzle-orm';
import { eq, desc, and, gte, lte, inArray } from 'drizzle-orm';
import { db } from './db';
import {
  enhancedTrainingStrategies,
  enhancedTrainingModules,
  enhancedUserProgress,
  enhancedUserAlerts,
  enhancedSavedStrategies,
  enhancedBacktestResults,
  type EnhancedTrainingStrategy,
  type InsertEnhancedTrainingStrategy,
  type EnhancedTrainingModule,
  type InsertEnhancedTrainingModule,
  type EnhancedUserProgress,
  type InsertEnhancedUserProgress,
  type EnhancedUserAlert,
  type InsertEnhancedUserAlert,
  type EnhancedSavedStrategy,
  type InsertEnhancedSavedStrategy,
  type EnhancedBacktestResult,
  type InsertEnhancedBacktestResult,
} from '../shared/schema';

export class EnhancedTrainingStorage {
  // Training Strategies
  async getAllStrategies(): Promise<EnhancedTrainingStrategy[]> {
    return await db.select().from(enhancedTrainingStrategies).where(eq(enhancedTrainingStrategies.isActive, true)).orderBy(enhancedTrainingStrategies.createdAt);
  }

  async getStrategyBySlug(slug: string): Promise<EnhancedTrainingStrategy | null> {
    const [strategy] = await db.select().from(enhancedTrainingStrategies).where(eq(enhancedTrainingStrategies.slug, slug));
    return strategy || null;
  }

  async createStrategy(strategy: InsertEnhancedTrainingStrategy): Promise<EnhancedTrainingStrategy> {
    const [created] = await db.insert(enhancedTrainingStrategies).values(strategy).returning();
    return created;
  }

  async updateStrategy(id: number, strategy: Partial<InsertEnhancedTrainingStrategy>): Promise<EnhancedTrainingStrategy> {
    const [updated] = await db
      .update(enhancedTrainingStrategies)
      .set({ ...strategy, updatedAt: new Date() })
      .where(eq(enhancedTrainingStrategies.id, id))
      .returning();
    return updated;
  }

  // Training Modules
  async getModulesByStrategyId(strategyId: number): Promise<EnhancedTrainingModule[]> {
    return await db
      .select()
      .from(enhancedTrainingModules)
      .where(eq(enhancedTrainingModules.strategyId, strategyId))
      .orderBy(enhancedTrainingModules.orderIndex);
  }

  async getModulesByStrategySlug(slug: string): Promise<EnhancedTrainingModule[]> {
    const strategy = await this.getStrategyBySlug(slug);
    if (!strategy) return [];
    return await this.getModulesByStrategyId(strategy.id);
  }

  async createModule(module: InsertEnhancedTrainingModule): Promise<EnhancedTrainingModule> {
    const [created] = await db.insert(enhancedTrainingModules).values(module).returning();
    return created;
  }

  async createModulesForStrategy(strategyId: number, modules: Omit<InsertEnhancedTrainingModule, 'strategyId'>[]): Promise<EnhancedTrainingModule[]> {
    const modulesToInsert = modules.map(module => ({ ...module, strategyId }));
    return await db.insert(enhancedTrainingModules).values(modulesToInsert).returning();
  }

  // User Progress
  async getUserProgress(userId: number, strategySlug: string): Promise<any[]> {
    try {
      // For now return empty array until we fix the userProgress table schema
      return [];
    } catch (error) {
      console.error('getUserProgress error:', error);
      return [];
    }
  }

  async updateUserProgress(userId: number, moduleId: number, progress: Partial<InsertEnhancedUserProgress>): Promise<EnhancedUserProgress> {
    const existingProgress = await db
      .select()
      .from(enhancedUserProgress)
      .where(and(eq(enhancedUserProgress.userId, userId), eq(enhancedUserProgress.moduleId, moduleId)));

    if (existingProgress.length > 0) {
      const [updated] = await db
        .update(enhancedUserProgress)
        .set({ ...progress, updatedAt: new Date() })
        .where(and(eq(enhancedUserProgress.userId, userId), eq(enhancedUserProgress.moduleId, moduleId)))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(enhancedUserProgress)
        .values({ userId, moduleId, ...progress } as InsertEnhancedUserProgress)
        .returning();
      return created;
    }
  }

  async completeModule(userId: number, moduleId: number, strategySlug: string, timeSpentMinutes: number = 0): Promise<EnhancedUserProgress> {
    return await this.updateUserProgress(userId, moduleId, {
      strategySlug,
      isCompleted: true,
      completedAt: new Date(),
      timeSpentMinutes,
    });
  }

  async getStrategyCompletionRate(userId: number, strategySlug: string): Promise<{ completed: number; total: number; percentage: number }> {
    const strategy = await this.getStrategyBySlug(strategySlug);
    if (!strategy) return { completed: 0, total: 0, percentage: 0 };

    const modules = await this.getModulesByStrategyId(strategy.id);
    const progress = await this.getUserProgress(userId, strategySlug);
    
    const completed = progress.filter(p => p.isCompleted).length;
    const total = modules.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }

  // User Alerts
  async getUserAlerts(userId: number): Promise<EnhancedUserAlert[]> {
    return await db
      .select()
      .from(enhancedUserAlerts)
      .where(and(eq(enhancedUserAlerts.userId, userId), eq(enhancedUserAlerts.isActive, true)))
      .orderBy(desc(enhancedUserAlerts.createdAt));
  }

  async createAlert(alert: InsertEnhancedUserAlert): Promise<EnhancedUserAlert> {
    const [created] = await db.insert(enhancedUserAlerts).values(alert).returning();
    return created;
  }

  async triggerAlert(alertId: number): Promise<EnhancedUserAlert> {
    const [updated] = await db
      .update(enhancedUserAlerts)
      .set({ isTriggered: true, triggeredAt: new Date() })
      .where(eq(enhancedUserAlerts.id, alertId))
      .returning();
    return updated;
  }

  async deleteAlert(alertId: number, userId: number): Promise<void> {
    await db
      .update(enhancedUserAlerts)
      .set({ isActive: false })
      .where(and(eq(enhancedUserAlerts.id, alertId), eq(enhancedUserAlerts.userId, userId)));
  }

  // Saved Strategies
  async getSavedStrategies(userId: number): Promise<EnhancedSavedStrategy[]> {
    return await db
      .select()
      .from(enhancedSavedStrategies)
      .where(and(eq(enhancedSavedStrategies.userId, userId), eq(enhancedSavedStrategies.isActive, true)))
      .orderBy(desc(enhancedSavedStrategies.createdAt));
  }

  async saveStrategy(strategy: InsertEnhancedSavedStrategy): Promise<EnhancedSavedStrategy> {
    // Check if already saved
    const existing = await db
      .select()
      .from(enhancedSavedStrategies)
      .where(and(
        eq(enhancedSavedStrategies.userId, strategy.userId),
        eq(enhancedSavedStrategies.strategySlug, strategy.strategySlug),
        eq(enhancedSavedStrategies.isActive, true)
      ));

    if (existing.length > 0) {
      const [updated] = await db
        .update(enhancedSavedStrategies)
        .set({ ...strategy, updatedAt: new Date() })
        .where(eq(enhancedSavedStrategies.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(enhancedSavedStrategies).values(strategy).returning();
      return created;
    }
  }

  async unsaveStrategy(userId: number, strategySlug: string): Promise<void> {
    await db
      .update(enhancedSavedStrategies)
      .set({ isActive: false })
      .where(and(eq(enhancedSavedStrategies.userId, userId), eq(enhancedSavedStrategies.strategySlug, strategySlug)));
  }

  // Backtest Results
  async getBacktestResults(userId: number, strategySlug?: string): Promise<EnhancedBacktestResult[]> {
    const whereCondition = strategySlug 
      ? and(eq(enhancedBacktestResults.userId, userId), eq(enhancedBacktestResults.strategySlug, strategySlug))
      : eq(enhancedBacktestResults.userId, userId);

    return await db
      .select()
      .from(enhancedBacktestResults)
      .where(whereCondition)
      .orderBy(desc(enhancedBacktestResults.createdAt));
  }

  async createBacktestResult(result: InsertEnhancedBacktestResult): Promise<EnhancedBacktestResult> {
    const [created] = await db.insert(enhancedBacktestResults).values(result).returning();
    return created;
  }

  async getLatestBacktestResult(userId: number, strategySlug: string): Promise<EnhancedBacktestResult | null> {
    const [result] = await db
      .select()
      .from(enhancedBacktestResults)
      .where(and(eq(enhancedBacktestResults.userId, userId), eq(enhancedBacktestResults.strategySlug, strategySlug)))
      .orderBy(desc(enhancedBacktestResults.createdAt))
      .limit(1);
    
    return result || null;
  }

  // Strategy Configurations
  // Note: Strategy configurations table is not yet implemented
  // async getUserConfigurations(userId: number): Promise<StrategyConfiguration[]> {
  //   return await db
  //     .select()
  //     .from(strategyConfigurations)
  //     .where(eq(strategyConfigurations.userId, userId))
  //     .orderBy(desc(strategyConfigurations.createdAt));
  // }

  // async createConfiguration(config: InsertStrategyConfiguration): Promise<StrategyConfiguration> {
  //   const [created] = await db.insert(strategyConfigurations).values(config).returning();
  //   return created;
  // }

  // async updateConfiguration(id: number, config: Partial<InsertStrategyConfiguration>): Promise<StrategyConfiguration> {
  //   const [updated] = await db
  //     .update(strategyConfigurations)
  //     .set({ ...config, updatedAt: new Date() })
  //     .where(eq(strategyConfigurations.id, id))
  //     .returning();
  //   return updated;
  // }

  // Analytics
  async getSystemStats(): Promise<{
    totalStrategies: number;
    totalModules: number;
    totalUsers: number;
    totalBacktests: number;
  }> {
    const [strategiesCount] = await db.select({ count: sql<number>`count(*)` }).from(enhancedTrainingStrategies);
    const [modulesCount] = await db.select({ count: sql<number>`count(*)` }).from(enhancedTrainingModules);
    const [usersCount] = await db.select({ count: sql<number>`count(distinct user_id)` }).from(enhancedUserProgress);
    const [backtestsCount] = await db.select({ count: sql<number>`count(*)` }).from(enhancedBacktestResults);

    return {
      totalStrategies: strategiesCount.count,
      totalModules: modulesCount.count,
      totalUsers: usersCount.count,
      totalBacktests: backtestsCount.count,
    };
  }

  async getUserStats(userId: number): Promise<{
    strategiesCompleted: number;
    modulesCompleted: number;
    totalTimeSpent: number;
    alertsActive: number;
    strategiesSaved: number;
    backtestsRun: number;
  }> {
    const [modulesCompletedQuery] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enhancedUserProgress)
      .where(and(eq(enhancedUserProgress.userId, userId), eq(enhancedUserProgress.isCompleted, true)));

    const [timeSpentQuery] = await db
      .select({ total: sql<number>`coalesce(sum(time_spent_minutes), 0)` })
      .from(enhancedUserProgress)
      .where(eq(enhancedUserProgress.userId, userId));

    const [alertsQuery] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enhancedUserAlerts)
      .where(and(eq(enhancedUserAlerts.userId, userId), eq(enhancedUserAlerts.isActive, true)));

    const [savedQuery] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enhancedSavedStrategies)
      .where(and(eq(enhancedSavedStrategies.userId, userId), eq(enhancedSavedStrategies.isActive, true)));

    const [backtestsQuery] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enhancedBacktestResults)
      .where(eq(enhancedBacktestResults.userId, userId));

    const strategiesCompletedQuery = await db
      .select({ strategySlug: enhancedUserProgress.strategySlug })
      .from(enhancedUserProgress)
      .where(and(eq(enhancedUserProgress.userId, userId), eq(enhancedUserProgress.isCompleted, true)));

    const uniqueStrategies = new Set(strategiesCompletedQuery.map(s => s.strategySlug));

    return {
      strategiesCompleted: uniqueStrategies.size,
      modulesCompleted: modulesCompletedQuery.count,
      totalTimeSpent: timeSpentQuery.total,
      alertsActive: alertsQuery.count,
      strategiesSaved: savedQuery.count,
      backtestsRun: backtestsQuery.count,
    };
  }
}

export const enhancedStorage = new EnhancedTrainingStorage();