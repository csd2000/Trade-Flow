import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  boolean,
  text,
  decimal,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced training system tables
export const trainingStrategies = pgTable("training_strategies", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  summary: text("summary").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // DeFi, Day, Swing, Alpha, Education
  risk: varchar("risk", { length: 20 }).notNull(), // Low, Medium, High
  roiRange: varchar("roi_range", { length: 50 }),
  tags: text("tags").array(),
  trainingUrl: varchar("training_url", { length: 500 }),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingModules = pgTable("training_modules", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => trainingStrategies.id),
  moduleNumber: integer("module_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: jsonb("content"), // Rich content including text, images, videos
  videoUrl: varchar("video_url", { length: 500 }),
  duration: varchar("duration", { length: 50 }).notNull(), // "15 minutes", "30 minutes"
  durationMinutes: integer("duration_minutes").notNull(), // For calculations
  isRequired: boolean("is_required").default(true),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Will reference users table when auth is added
  moduleId: integer("module_id").references(() => trainingModules.id),
  strategySlug: varchar("strategy_slug", { length: 100 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  quizScore: integer("quiz_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAlerts = pgTable("user_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategySlug: varchar("strategy_slug", { length: 100 }).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // price_target, pattern_match, time_based
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  triggerConditions: jsonb("trigger_conditions"), // Complex alert logic
  isActive: boolean("is_active").default(true),
  isTriggered: boolean("is_triggered").default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedStrategies = pgTable("saved_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategySlug: varchar("strategy_slug", { length: 100 }).notNull(),
  customName: varchar("custom_name", { length: 255 }),
  personalNotes: text("personal_notes"),
  customSettings: jsonb("custom_settings"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backtestResults = pgTable("backtest_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategySlug: varchar("strategy_slug", { length: 100 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(), // 1D, 1W, 1M, 3M, 1Y
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  initialCapital: decimal("initial_capital", { precision: 20, scale: 8 }).notNull(),
  finalCapital: decimal("final_capital", { precision: 20, scale: 8 }).notNull(),
  totalReturn: decimal("total_return", { precision: 10, scale: 4 }).notNull(), // Percentage
  totalTrades: integer("total_trades").notNull(),
  winningTrades: integer("winning_trades").notNull(),
  losingTrades: integer("losing_trades").notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull(), // Percentage
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 4 }).notNull(),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 3 }),
  profitFactor: decimal("profit_factor", { precision: 5, scale: 3 }),
  avgWin: decimal("avg_win", { precision: 10, scale: 4 }),
  avgLoss: decimal("avg_loss", { precision: 10, scale: 4 }),
  maxWin: decimal("max_win", { precision: 10, scale: 4 }),
  maxLoss: decimal("max_loss", { precision: 10, scale: 4 }),
  tradeDetails: jsonb("trade_details"), // Individual trade records
  performanceChart: jsonb("performance_chart"), // Chart data points
  createdAt: timestamp("created_at").defaultNow(),
});

// Strategy builder configurations
export const strategyConfigurations = pgTable("strategy_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseStrategySlug: varchar("base_strategy_slug", { length: 100 }),
  entryConditions: jsonb("entry_conditions").notNull(),
  exitConditions: jsonb("exit_conditions").notNull(),
  riskManagement: jsonb("risk_management").notNull(),
  positionSizing: jsonb("position_sizing").notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  markets: text("markets").array(), // ["crypto", "stocks", "forex"]
  isPublic: boolean("is_public").default(false),
  backtestScore: decimal("backtest_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const trainingStrategiesRelations = relations(trainingStrategies, ({ many }) => ({
  modules: many(trainingModules),
}));

export const trainingModulesRelations = relations(trainingModules, ({ one, many }) => ({
  strategy: one(trainingStrategies, {
    fields: [trainingModules.strategyId],
    references: [trainingStrategies.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  module: one(trainingModules, {
    fields: [userProgress.moduleId],
    references: [trainingModules.id],
  }),
}));

// Schema validation
export const insertTrainingStrategySchema = createInsertSchema(trainingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAlertSchema = createInsertSchema(userAlerts).omit({
  id: true,
  createdAt: true,
  triggeredAt: true,
});

export const insertSavedStrategySchema = createInsertSchema(savedStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBacktestResultSchema = createInsertSchema(backtestResults).omit({
  id: true,
  createdAt: true,
});

export const insertStrategyConfigurationSchema = createInsertSchema(strategyConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type TrainingStrategy = typeof trainingStrategies.$inferSelect;
export type InsertTrainingStrategy = z.infer<typeof insertTrainingStrategySchema>;

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = z.infer<typeof insertUserAlertSchema>;

export type SavedStrategy = typeof savedStrategies.$inferSelect;
export type InsertSavedStrategy = z.infer<typeof insertSavedStrategySchema>;

export type BacktestResult = typeof backtestResults.$inferSelect;
export type InsertBacktestResult = z.infer<typeof insertBacktestResultSchema>;

export type StrategyConfiguration = typeof strategyConfigurations.$inferSelect;
export type InsertStrategyConfiguration = z.infer<typeof insertStrategyConfigurationSchema>;