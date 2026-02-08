import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, bigint, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  totalValue: decimal("total_value", { precision: 20, scale: 8 }).notNull(),
  dailyIncome: decimal("daily_income", { precision: 20, scale: 8 }).notNull(),
  avgAPR: decimal("avg_apr", { precision: 5, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high'
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const defiProtocols = pgTable("defi_protocols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chain: text("chain").notNull(),
  category: text("category").notNull(),
  minAPR: decimal("min_apr", { precision: 5, scale: 2 }).notNull(),
  maxAPR: decimal("max_apr", { precision: 5, scale: 2 }).notNull(),
  tvl: decimal("tvl", { precision: 20, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  protocolId: integer("protocol_id").references(() => defiProtocols.id),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  currentAPR: decimal("current_apr", { precision: 5, scale: 2 }).notNull(),
  dailyEarnings: decimal("daily_earnings", { precision: 20, scale: 8 }).notNull(),
  monthlyEarnings: decimal("monthly_earnings", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull(), // 'active', 'paused', 'exited'
  startDate: timestamp("start_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exitStrategies = pgTable("exit_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  strategyId: integer("strategy_id").references(() => strategies.id),
  exitType: text("exit_type").notNull(), // 'percentage', 'dca', 'full'
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  percentageToSell: decimal("percentage_to_sell", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'price_target', 'apr_drop', 'whale_exit'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Master Trading Academy Tables
export const tradingAcademy = pgTable("trading_academy", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  strategyId: text("strategy_id").notNull(), // defi-conservative, stock-day-trading, etc.
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  progressPercentage: integer("progress_percentage").default(0),
  isCompleted: boolean("is_completed").default(false),
  certificateIssued: boolean("certificate_issued").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

export const strategyModules = pgTable("strategy_modules", {
  id: serial("id").primaryKey(),
  strategyId: text("strategy_id").notNull(),
  moduleNumber: integer("module_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // JSON content for lessons
  videoUrl: text("video_url"),
  estimatedTime: integer("estimated_time_minutes"),
  isRequired: boolean("is_required").default(true),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  moduleId: integer("module_id").references(() => strategyModules.id),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent_minutes"),
  quizScore: integer("quiz_score"),
  notes: text("notes"),
});

// Robin Hood 4PM Trading System Tables (deprecated - moved to academy)
export const tradingSystems = pgTable("trading_systems", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'robinhood_4pm', 'lance_system', 'hybrid'
  isActive: boolean("is_active").default(true),
  executionTime: text("execution_time").notNull(), // '16:00' for 4PM
  riskLevel: text("risk_level").notNull(), // 'conservative', 'moderate', 'aggressive'
  capitalAllocation: decimal("capital_allocation", { precision: 5, scale: 2 }).notNull(),
  minPositionSize: decimal("min_position_size", { precision: 20, scale: 8 }).notNull(),
  maxPositionSize: decimal("max_position_size", { precision: 20, scale: 8 }).notNull(),
  stopLossPercentage: decimal("stop_loss_percentage", { precision: 5, scale: 2 }),
  takeProfitPercentage: decimal("take_profit_percentage", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").references(() => tradingSystems.id),
  userId: integer("user_id").references(() => users.id),
  symbol: text("symbol").notNull(), // 'BTC', 'ETH', etc.
  action: text("action").notNull(), // 'BUY', 'SELL', 'HOLD'
  signalType: text("signal_type").notNull(), // 'time_based', 'technical', 'fundamental'
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 8 }),
  reasoning: text("reasoning"),
  isExecuted: boolean("is_executed").default(false),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingPositions = pgTable("trading_positions", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").references(() => tradingSystems.id),
  userId: integer("user_id").references(() => users.id),
  signalId: integer("signal_id").references(() => tradingSignals.id),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'LONG', 'SHORT'
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 20, scale: 8 }),
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  currentValue: decimal("current_value", { precision: 20, scale: 8 }).notNull(),
  unrealizedPnL: decimal("unrealized_pnl", { precision: 20, scale: 8 }),
  realizedPnL: decimal("realized_pnl", { precision: 20, scale: 8 }),
  status: text("status").notNull(), // 'OPEN', 'CLOSED', 'PARTIAL'
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),
  protocol: text("protocol"), // 'uniswap', 'aave', 'compound', etc.
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const tradingPerformance = pgTable("trading_performance", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").references(() => tradingSystems.id),
  userId: integer("user_id").references(() => users.id),
  period: text("period").notNull(), // 'daily', 'weekly', 'monthly'
  totalTrades: integer("total_trades").notNull(),
  winningTrades: integer("winning_trades").notNull(),
  losingTrades: integer("losing_trades").notNull(),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }).notNull(),
  totalReturn: decimal("total_return", { precision: 20, scale: 8 }).notNull(),
  totalReturnPercentage: decimal("total_return_percentage", { precision: 5, scale: 2 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }),
  sharpeRatio: decimal("sharpe_ratio", { precision: 5, scale: 3 }),
  avgTradeReturn: decimal("avg_trade_return", { precision: 20, scale: 8 }),
  bestTrade: decimal("best_trade", { precision: 20, scale: 8 }),
  worstTrade: decimal("worst_trade", { precision: 20, scale: 8 }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  updatedAt: true,
});

export const insertProtocolSchema = createInsertSchema(defiProtocols).omit({
  id: true,
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  startDate: true,
  updatedAt: true,
});

export const insertExitStrategySchema = createInsertSchema(exitStrategies).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type DefiProtocol = typeof defiProtocols.$inferSelect;
export type InsertDefiProtocol = z.infer<typeof insertProtocolSchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type ExitStrategy = typeof exitStrategies.$inferSelect;
export type InsertExitStrategy = z.infer<typeof insertExitStrategySchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Trading System Schema Exports
export const insertTradingSystemSchema = createInsertSchema(tradingSystems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
  executedAt: true,
});

export const insertTradingPositionSchema = createInsertSchema(tradingPositions).omit({
  id: true,
  openedAt: true,
  closedAt: true,
});

export const insertTradingPerformanceSchema = createInsertSchema(tradingPerformance).omit({
  id: true,
  createdAt: true,
});

export type TradingSystem = typeof tradingSystems.$inferSelect;
export type InsertTradingSystem = z.infer<typeof insertTradingSystemSchema>;

export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;

export type TradingPosition = typeof tradingPositions.$inferSelect;
export type InsertTradingPosition = z.infer<typeof insertTradingPositionSchema>;

export type TradingPerformance = typeof tradingPerformance.$inferSelect;
export type InsertTradingPerformance = z.infer<typeof insertTradingPerformanceSchema>;

// Comprehensive Training System Tables
export const trainingTracks = pgTable("training_tracks", {
  id: serial("id").primaryKey(),
  trackId: varchar("track_id", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trainingModules = pgTable("training_modules", {
  id: serial("id").primaryKey(),
  trackId: varchar("track_id", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  order: integer("order").notNull(),
  of: integer("of").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  overview: text("overview"),
  prerequisites: jsonb("prerequisites").default([]),
  steps: jsonb("steps").default([]),
  notesPrompt: text("notes_prompt"),
  resources: jsonb("resources").default({}),
  additionalResources: jsonb("additional_resources").default([]),
  previous: jsonb("previous"),
  next: jsonb("next"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cmsContent = pgTable("cms_content", {
  id: serial("id").primaryKey(),
  path: varchar("path", { length: 500 }).notNull().unique(),
  data: jsonb("data").notNull().default({}),
  updatedBy: varchar("updated_by", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminAuditLog = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }),
  action: varchar("action", { length: 255 }),
  path: varchar("path", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update strategies table to include training linkage
export const strategyCatalog = pgTable("strategies_catalog", {
  id: integer("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  risk: varchar("risk", { length: 50 }),
  roiRange: varchar("roi_range", { length: 100 }),
  tags: jsonb("tags").default([]),
  summary: text("summary"),
  trackId: varchar("track_id", { length: 100 }),
  firstModuleSlug: varchar("first_module_slug", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training System Schema Exports
export const insertTrainingTrackSchema = createInsertSchema(trainingTracks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCmsContentSchema = createInsertSchema(cmsContent).omit({
  id: true,
  updatedAt: true,
});

export const insertStrategyCatalogSchema = createInsertSchema(strategyCatalog).omit({
  createdAt: true,
  updatedAt: true,
});

// Training System Types
export type TrainingTrack = typeof trainingTracks.$inferSelect;
export type InsertTrainingTrack = z.infer<typeof insertTrainingTrackSchema>;

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;

export type CmsContent = typeof cmsContent.$inferSelect;
export type InsertCmsContent = z.infer<typeof insertCmsContentSchema>;

export type StrategyCatalog = typeof strategyCatalog.$inferSelect;
export type InsertStrategyCatalog = z.infer<typeof insertStrategyCatalogSchema>;

// Educational content tables
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  instructor: varchar("instructor", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(), // 'beginner', 'intermediate', 'advanced'
  category: varchar("category", { length: 100 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  students: integer("students").default(0),
  description: text("description").notNull(),
  lessons: integer("lessons").default(0),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training Strategies Tables
export const trainingStrategies = pgTable("training_strategies", {
  id: serial("id").primaryKey(),
  strategyId: varchar("strategy_id", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'defi', 'stocks', 'forex', 'crypto', 'psychology'
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  description: text("description").notNull(),
  keyPoints: text("key_points").array(),
  successRate: varchar("success_rate", { length: 20 }),
  isUnlocked: boolean("is_unlocked").default(true),
  isCompleted: boolean("is_completed").default(false),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passiveIncomeStrategies = pgTable("passive_income_strategies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  chain: varchar("chain", { length: 50 }).notNull(),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(),
  minROI: decimal("min_roi", { precision: 5, scale: 2 }).notNull(),
  maxROI: decimal("max_roi", { precision: 5, scale: 2 }).notNull(),
  timeCommitment: varchar("time_commitment", { length: 50 }).notNull(),
  description: text("description").notNull(),
  steps: text("steps").array(),
  toolsRequired: text("tools_required").array(),
  exitPlan: text("exit_plan"),
  riskAnalysis: text("risk_analysis"),
  resources: text("resources").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const oliverVelezTechniques = pgTable("oliver_velez_techniques", {
  id: serial("id").primaryKey(),
  techniqueId: varchar("technique_id", { length: 100 }).notNull().unique(),
  technique: varchar("technique", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  description: text("description").notNull(),
  timeFrame: varchar("time_frame", { length: 100 }).notNull(),
  successRate: varchar("success_rate", { length: 20 }).notNull(),
  detailedSteps: text("detailed_steps"), // JSON content
  riskManagement: text("risk_management"), // JSON content
  examples: text("examples").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forexTradingLessons = pgTable("forex_trading_lessons", {
  id: serial("id").primaryKey(),
  lessonId: varchar("lesson_id", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 50 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(),
  description: text("description").notNull(),
  learningObjectives: text("learning_objectives").array(),
  detailedContent: text("detailed_content"), // JSON content
  resources: text("resources"), // JSON content
  practicalExercises: text("practical_exercises").array(),
  assessmentQuestions: text("assessment_questions").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Training Strategy Schema Exports
export const insertTrainingStrategySchema = createInsertSchema(trainingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPassiveIncomeStrategySchema = createInsertSchema(passiveIncomeStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOliverVelezTechniqueSchema = createInsertSchema(oliverVelezTechniques).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForexTradingLessonSchema = createInsertSchema(forexTradingLessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TrainingStrategy = typeof trainingStrategies.$inferSelect;
export type InsertTrainingStrategy = z.infer<typeof insertTrainingStrategySchema>;

export type PassiveIncomeStrategy = typeof passiveIncomeStrategies.$inferSelect;
export type InsertPassiveIncomeStrategy = z.infer<typeof insertPassiveIncomeStrategySchema>;

export type OliverVelezTechnique = typeof oliverVelezTechniques.$inferSelect;
export type InsertOliverVelezTechnique = z.infer<typeof insertOliverVelezTechniqueSchema>;

export type ForexTradingLesson = typeof forexTradingLessons.$inferSelect;
export type InsertForexTradingLesson = z.infer<typeof insertForexTradingLessonSchema>;

// Enhanced training system tables - integrated for comprehensive strategy management
export const enhancedTrainingStrategies = pgTable("enhanced_training_strategies", {
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
  trackId: varchar("track_id", { length: 255 }),
  firstModuleSlug: varchar("first_module_slug", { length: 255 }),
  isActive: boolean("is_active").default(true),
  groupId: varchar("group_id", { length: 100 }), // Groups related strategies together
  variantKey: varchar("variant_key", { length: 50 }), // Variant identifier within group
  sortOrder: integer("sort_order").default(0), // Order within group
  isPrimary: boolean("is_primary").default(false), // Primary variant shown in cards
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enhancedTrainingModules = pgTable("enhanced_training_modules", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").references(() => enhancedTrainingStrategies.id),
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

export const enhancedUserProgress = pgTable("enhanced_user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Will reference users table when auth is added
  moduleId: integer("module_id").references(() => enhancedTrainingModules.id),
  strategySlug: varchar("strategy_slug", { length: 100 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  quizScore: integer("quiz_score"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enhancedUserAlerts = pgTable("enhanced_user_alerts", {
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

export const enhancedSavedStrategies = pgTable("enhanced_saved_strategies", {
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

export const enhancedBacktestResults = pgTable("enhanced_backtest_results", {
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

// Enhanced schema exports for training system
export const insertEnhancedTrainingStrategySchema = createInsertSchema(enhancedTrainingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnhancedTrainingModuleSchema = createInsertSchema(enhancedTrainingModules).omit({
  id: true,
  createdAt: true,
});

export const insertEnhancedUserProgressSchema = createInsertSchema(enhancedUserProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnhancedUserAlertSchema = createInsertSchema(enhancedUserAlerts).omit({
  id: true,
  createdAt: true,
  triggeredAt: true,
});

export const insertEnhancedSavedStrategySchema = createInsertSchema(enhancedSavedStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEnhancedBacktestResultSchema = createInsertSchema(enhancedBacktestResults).omit({
  id: true,
  createdAt: true,
});

// Enhanced types
export type EnhancedTrainingStrategy = typeof enhancedTrainingStrategies.$inferSelect;
export type InsertEnhancedTrainingStrategy = z.infer<typeof insertEnhancedTrainingStrategySchema>;

export type EnhancedTrainingModule = typeof enhancedTrainingModules.$inferSelect;
export type InsertEnhancedTrainingModule = z.infer<typeof insertEnhancedTrainingModuleSchema>;

export type EnhancedUserProgress = typeof enhancedUserProgress.$inferSelect;
export type InsertEnhancedUserProgress = z.infer<typeof insertEnhancedUserProgressSchema>;

export type EnhancedUserAlert = typeof enhancedUserAlerts.$inferSelect;
export type InsertEnhancedUserAlert = z.infer<typeof insertEnhancedUserAlertSchema>;

export type EnhancedSavedStrategy = typeof enhancedSavedStrategies.$inferSelect;
export type InsertEnhancedSavedStrategy = z.infer<typeof insertEnhancedSavedStrategySchema>;

export type EnhancedBacktestResult = typeof enhancedBacktestResults.$inferSelect;
export type InsertEnhancedBacktestResult = z.infer<typeof insertEnhancedBacktestResultSchema>;

export const liveCalls = pgTable("live_calls", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  duration: varchar("duration", { length: 20 }).notNull(),
  expert: varchar("expert", { length: 255 }).notNull(),
  topic: text("topic").notNull(),
  attendees: integer("attendees").default(0),
  recording: boolean("recording").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cryptoProjects = pgTable("crypto_projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  stage: varchar("stage", { length: 20 }).notNull(), // 'presale', 'ido', 'launching', 'live'
  marketCap: bigint("market_cap", { mode: "number" }).default(0),
  priceChange: decimal("price_change", { precision: 8, scale: 2 }).default("0"),
  useCase: text("use_case").notNull(),
  description: text("description").notNull(),
  fundamentalScore: integer("fundamental_score").notNull(),
  riskLevel: varchar("risk_level", { length: 10 }).notNull(), // 'low', 'medium', 'high'
  launchDate: date("launch_date").notNull(),
  exchanges: text("exchanges").array(),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const launchpads = pgTable("launchpads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  avgROI: varchar("avg_roi", { length: 20 }).notNull(),
  projects: integer("projects").default(0),
  successRate: integer("success_rate").notNull(),
  tvl: varchar("tvl", { length: 50 }).notNull(),
  network: varchar("network", { length: 100 }).notNull(),
  requirements: text("requirements").array(),
  description: text("description").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const yieldPools = pgTable("yield_pools", {
  id: serial("id").primaryKey(),
  protocol: varchar("protocol", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  apy: decimal("apy", { precision: 8, scale: 2 }).notNull(),
  tvl: bigint("tvl", { mode: "number" }).notNull(),
  riskLevel: varchar("risk_level", { length: 10 }).notNull(),
  chain: varchar("chain", { length: 50 }).notNull(),
  tokens: text("tokens").array(),
  category: varchar("category", { length: 100 }).notNull(),
  lockPeriod: varchar("lock_period", { length: 50 }).notNull(),
  verified: boolean("verified").default(false),
  safetyScore: integer("safety_score").notNull(),
  description: text("description").notNull(),
  features: text("features").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userCourseEnrollments = pgTable("user_course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const userInvestments = pgTable("user_investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  poolId: integer("pool_id").references(() => yieldPools.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  investedAt: timestamp("invested_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'withdrawn', 'pending'
});

// Insert schemas for new tables
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLiveCallSchema = createInsertSchema(liveCalls).omit({
  id: true,
  createdAt: true,
});

export const insertCryptoProjectSchema = createInsertSchema(cryptoProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLaunchpadSchema = createInsertSchema(launchpads).omit({
  id: true,
  createdAt: true,
});

export const insertYieldPoolSchema = createInsertSchema(yieldPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCourseEnrollmentSchema = createInsertSchema(userCourseEnrollments).omit({
  id: true,
  enrolledAt: true,
  completedAt: true,
});

export const insertUserInvestmentSchema = createInsertSchema(userInvestments).omit({
  id: true,
  investedAt: true,
});

// Types for new tables
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type LiveCall = typeof liveCalls.$inferSelect;
export type InsertLiveCall = z.infer<typeof insertLiveCallSchema>;

export type CryptoProject = typeof cryptoProjects.$inferSelect;
export type InsertCryptoProject = z.infer<typeof insertCryptoProjectSchema>;

export type Launchpad = typeof launchpads.$inferSelect;
export type InsertLaunchpad = z.infer<typeof insertLaunchpadSchema>;

export type YieldPool = typeof yieldPools.$inferSelect;
export type InsertYieldPool = z.infer<typeof insertYieldPoolSchema>;

export type UserCourseEnrollment = typeof userCourseEnrollments.$inferSelect;
export type InsertUserCourseEnrollment = z.infer<typeof insertUserCourseEnrollmentSchema>;

export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertUserInvestment = z.infer<typeof insertUserInvestmentSchema>;

// 30SecondTrader Integration Tables
export const stockAlerts = pgTable("stock_alerts", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  companyName: text("company_name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceChange: decimal("price_change", { precision: 5, scale: 2 }).notNull(),
  percentChange: decimal("percent_change", { precision: 5, scale: 2 }).notNull(),
  volume: bigint("volume", { mode: "number" }).notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  sector: text("sector"),
  alertType: text("alert_type").notNull(), // 'top_mover', 'breakout', 'volume_spike'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockNews = pgTable("stock_news", {
  id: serial("id").primaryKey(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  source: text("source").notNull(),
  url: text("url"),
  publishedAt: timestamp("published_at").notNull(),
  impactLevel: text("impact_level").notNull(), // 'high', 'medium', 'low'
  affectedSymbols: text("affected_symbols").array(),
  category: text("category").notNull(), // 'earnings', 'merger', 'regulatory', 'economic'
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketOverview = pgTable("market_overview", {
  id: serial("id").primaryKey(),
  indexName: text("index_name").notNull(),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).notNull(),
  changeValue: decimal("change_value", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  volume: bigint("volume", { mode: "number" }),
  high: decimal("high", { precision: 10, scale: 2 }),
  low: decimal("low", { precision: 10, scale: 2 }),
  marketStatus: text("market_status").notNull(), // 'open', 'closed', 'pre_market', 'after_hours'
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const stockTradingSignals = pgTable("stock_trading_signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  signalType: text("signal_type").notNull(), // 'buy', 'sell', 'hold', 'watch'
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  confidence: integer("confidence").notNull(), // 1-100
  timeframe: text("timeframe").notNull(), // 'short', 'medium', 'long'
  reasoning: text("reasoning"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// 30SecondTrader schema types
export const insertStockAlertSchema = createInsertSchema(stockAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertStockNewsSchema = createInsertSchema(stockNews).omit({
  id: true,
  createdAt: true,
});

export const insertMarketOverviewSchema = createInsertSchema(marketOverview).omit({
  id: true,
  lastUpdated: true,
});

export const insertStockTradingSignalSchema = createInsertSchema(stockTradingSignals).omit({
  id: true,
  createdAt: true,
});

export type StockAlert = typeof stockAlerts.$inferSelect;
export type InsertStockAlert = z.infer<typeof insertStockAlertSchema>;

export type StockNews = typeof stockNews.$inferSelect;
export type InsertStockNews = z.infer<typeof insertStockNewsSchema>;

export type MarketOverview = typeof marketOverview.$inferSelect;
export type InsertMarketOverview = z.infer<typeof insertMarketOverviewSchema>;

export type StockTradingSignal = typeof stockTradingSignals.$inferSelect;
export type InsertStockTradingSignal = z.infer<typeof insertStockTradingSignalSchema>;

// AI Profit Studio Tables
export const aiStocks = pgTable("ai_stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  exchange: text("exchange"), // NASDAQ, NYSE, etc.
  sector: text("sector"),
  industry: text("industry"),
  marketCap: bigint("market_cap", { mode: "number" }),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  volume: bigint("volume", { mode: "number" }),
  avgVolume: bigint("avg_volume", { mode: "number" }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  predictionDate: timestamp("prediction_date").defaultNow(),
  targetDate: timestamp("target_date").notNull(),
  predictedReturn: decimal("predicted_return", { precision: 10, scale: 4 }), // % return
  direction: text("direction").notNull(), // 'up', 'down', 'sideways'
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100%
  profitPotential: decimal("profit_potential", { precision: 10, scale: 2 }), // % potential profit
  riskLevel: decimal("risk_level", { precision: 10, scale: 2 }), // % potential loss
  profitRiskRatio: decimal("profit_risk_ratio", { precision: 5, scale: 2 }), // Profit/Risk ratio
  timeframeDays: integer("timeframe_days").notNull(), // Number of days
  meetsCriteria: boolean("meets_criteria").default(false), // Meets 3 strict criteria
  technicalScore: decimal("technical_score", { precision: 5, scale: 2 }),
  fundamentalScore: decimal("fundamental_score", { precision: 5, scale: 2 }),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  features: jsonb("features"), // Technical indicators used
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiWatchlists = pgTable("ai_watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiWatchlistItems = pgTable("ai_watchlist_items", {
  id: serial("id").primaryKey(),
  watchlistId: integer("watchlist_id").references(() => aiWatchlists.id).notNull(),
  symbol: text("symbol").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  notes: text("notes"),
});

export const aiSignals = pgTable("ai_signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  signalType: text("signal_type").notNull(), // 'buy', 'sell', 'hold'
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  compositeScore: decimal("composite_score", { precision: 10, scale: 4 }), // Z-score based ranking
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  macd: decimal("macd", { precision: 10, scale: 4 }),
  macdSignal: decimal("macd_signal", { precision: 10, scale: 4 }),
  macdHist: decimal("macd_hist", { precision: 10, scale: 4 }),
  ma20: decimal("ma20", { precision: 10, scale: 2 }),
  ma50: decimal("ma50", { precision: 10, scale: 2 }),
  bollingerUpper: decimal("bollinger_upper", { precision: 10, scale: 2 }),
  bollingerLower: decimal("bollinger_lower", { precision: 10, scale: 2 }),
  atr: decimal("atr", { precision: 10, scale: 4 }),
  reasoning: text("reasoning"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const aiBacktests = pgTable("ai_backtests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  symbols: jsonb("symbols").notNull(), // Array of stock symbols tested
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  initialCapital: decimal("initial_capital", { precision: 20, scale: 2 }).notNull(),
  finalCapital: decimal("final_capital", { precision: 20, scale: 2 }),
  totalReturn: decimal("total_return", { precision: 10, scale: 2 }), // %
  cagr: decimal("cagr", { precision: 10, scale: 2 }), // Compound Annual Growth Rate
  sharpeRatio: decimal("sharpe_ratio", { precision: 10, scale: 4 }),
  maxDrawdown: decimal("max_drawdown", { precision: 10, scale: 2 }), // %
  winRate: decimal("win_rate", { precision: 5, scale: 2 }), // %
  avgWin: decimal("avg_win", { precision: 10, scale: 2 }), // %
  avgLoss: decimal("avg_loss", { precision: 10, scale: 2 }), // %
  totalTrades: integer("total_trades"),
  winningTrades: integer("winning_trades"),
  losingTrades: integer("losing_trades"),
  parameters: jsonb("parameters"), // Strategy parameters used
  equityCurve: jsonb("equity_curve"), // Time series data
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiScans = pgTable("ai_scans", {
  id: serial("id").primaryKey(),
  scanDate: timestamp("scan_date").defaultNow(),
  totalStocksScanned: integer("total_stocks_scanned").notNull(),
  totalDatapoints: integer("total_datapoints"),
  filteredCount: integer("filtered_count"), // After applying filters
  topSignalsCount: integer("top_signals_count"), // Final count (5-10)
  scanDurationMs: integer("scan_duration_ms"),
  criteria: jsonb("criteria"), // The 3 strict criteria applied
  results: jsonb("results"), // Array of top signals
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Profit Studio insert schemas
export const insertAiStockSchema = createInsertSchema(aiStocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertAiPredictionSchema = createInsertSchema(aiPredictions).omit({
  id: true,
  predictionDate: true,
  createdAt: true,
});

export const insertAiWatchlistSchema = createInsertSchema(aiWatchlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiWatchlistItemSchema = createInsertSchema(aiWatchlistItems).omit({
  id: true,
  addedAt: true,
});

export const insertAiSignalSchema = createInsertSchema(aiSignals).omit({
  id: true,
  createdAt: true,
});

export const insertAiBacktestSchema = createInsertSchema(aiBacktests).omit({
  id: true,
  createdAt: true,
});

export const insertAiScanSchema = createInsertSchema(aiScans).omit({
  id: true,
  scanDate: true,
  createdAt: true,
});

// AI Profit Studio types
export type AiStock = typeof aiStocks.$inferSelect;
export type InsertAiStock = z.infer<typeof insertAiStockSchema>;

export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = z.infer<typeof insertAiPredictionSchema>;

export type AiWatchlist = typeof aiWatchlists.$inferSelect;
export type InsertAiWatchlist = z.infer<typeof insertAiWatchlistSchema>;

export type AiWatchlistItem = typeof aiWatchlistItems.$inferSelect;
export type InsertAiWatchlistItem = z.infer<typeof insertAiWatchlistItemSchema>;

export type AiSignal = typeof aiSignals.$inferSelect;
export type InsertAiSignal = z.infer<typeof insertAiSignalSchema>;

export type AiBacktest = typeof aiBacktests.$inferSelect;
export type InsertAiBacktest = z.infer<typeof insertAiBacktestSchema>;

export type AiScan = typeof aiScans.$inferSelect;
export type InsertAiScan = z.infer<typeof insertAiScanSchema>;

// =====================================================
// TIME SERIES AI PREDICTION SYSTEM
// =====================================================

// Industry verticals for time series predictions
export const timeseriesIndustryEnum = pgTable("timeseries_industry_enum", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
});

// Time series data sources
export const timeseriesSources = pgTable("timeseries_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  industry: varchar("industry", { length: 50 }).notNull(), // finance, retail, energy, healthcare, supply_chain
  sourceType: varchar("source_type", { length: 50 }).notNull(), // stock, crypto, demand, energy, vitals, logistics
  symbol: varchar("symbol", { length: 50 }), // For stocks/crypto (e.g., AAPL, BTC)
  dataProvider: varchar("data_provider", { length: 100 }), // alpha_vantage, coingecko, custom
  updateFrequency: varchar("update_frequency", { length: 50 }), // realtime, daily, hourly, weekly
  metadata: jsonb("metadata"), // Additional source-specific metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Raw time series observations
export const timeseriesObservations = pgTable("timeseries_observations", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => timeseriesSources.id).notNull(),
  observedAt: timestamp("observed_at").notNull(),
  value: decimal("value", { precision: 20, scale: 8 }).notNull(),
  open: decimal("open", { precision: 20, scale: 8 }), // For OHLCV data
  high: decimal("high", { precision: 20, scale: 8 }),
  low: decimal("low", { precision: 20, scale: 8 }),
  close: decimal("close", { precision: 20, scale: 8 }),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  metadata: jsonb("metadata"), // Additional fields like adjusted close, dividends
  createdAt: timestamp("created_at").defaultNow(),
});

// Time series predictions
export const timeseriesPredictions = pgTable("timeseries_predictions", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => timeseriesSources.id).notNull(),
  modelType: varchar("model_type", { length: 50 }).notNull(), // prophet, arima, lstm, ensemble, ai_analysis
  predictionDate: timestamp("prediction_date").defaultNow(),
  horizonDays: integer("horizon_days").notNull(), // How many days into the future
  predictions: jsonb("predictions").notNull(), // Array of {date, value, lower_bound, upper_bound}
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100%
  mape: decimal("mape", { precision: 10, scale: 4 }), // Mean Absolute Percentage Error
  rmse: decimal("rmse", { precision: 20, scale: 8 }), // Root Mean Square Error
  trend: varchar("trend", { length: 20 }), // bullish, bearish, neutral, volatile
  summary: text("summary"), // AI-generated summary of prediction
  methodology: text("methodology"), // Explanation of prediction approach
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prediction accuracy tracking
export const timeseriesAccuracy = pgTable("timeseries_accuracy", {
  id: serial("id").primaryKey(),
  predictionId: integer("prediction_id").references(() => timeseriesPredictions.id).notNull(),
  evaluatedAt: timestamp("evaluated_at").defaultNow(),
  actualValue: decimal("actual_value", { precision: 20, scale: 8 }).notNull(),
  predictedValue: decimal("predicted_value", { precision: 20, scale: 8 }).notNull(),
  errorPercent: decimal("error_percent", { precision: 10, scale: 4 }),
  withinConfidenceInterval: boolean("within_confidence_interval"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prediction jobs queue
export const timeseriesJobs = pgTable("timeseries_jobs", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => timeseriesSources.id),
  jobType: varchar("job_type", { length: 50 }).notNull(), // ingest, predict, evaluate, analyze
  status: varchar("status", { length: 20 }).notNull(), // pending, running, completed, failed
  parameters: jsonb("parameters"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for time series tables
export const insertTimeseriesSourceSchema = createInsertSchema(timeseriesSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeseriesObservationSchema = createInsertSchema(timeseriesObservations).omit({
  id: true,
  createdAt: true,
});

export const insertTimeseriesPredictionSchema = createInsertSchema(timeseriesPredictions).omit({
  id: true,
  predictionDate: true,
  createdAt: true,
});

export const insertTimeseriesAccuracySchema = createInsertSchema(timeseriesAccuracy).omit({
  id: true,
  evaluatedAt: true,
  createdAt: true,
});

export const insertTimeseriesJobSchema = createInsertSchema(timeseriesJobs).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
});

// Time series types
export type TimeseriesSource = typeof timeseriesSources.$inferSelect;
export type InsertTimeseriesSource = z.infer<typeof insertTimeseriesSourceSchema>;

export type TimeseriesObservation = typeof timeseriesObservations.$inferSelect;
export type InsertTimeseriesObservation = z.infer<typeof insertTimeseriesObservationSchema>;

export type TimeseriesPrediction = typeof timeseriesPredictions.$inferSelect;
export type InsertTimeseriesPrediction = z.infer<typeof insertTimeseriesPredictionSchema>;

export type TimeseriesAccuracy = typeof timeseriesAccuracy.$inferSelect;
export type InsertTimeseriesAccuracy = z.infer<typeof insertTimeseriesAccuracySchema>;

export type TimeseriesJob = typeof timeseriesJobs.$inferSelect;
export type InsertTimeseriesJob = z.infer<typeof insertTimeseriesJobSchema>;

// =====================================================
// QUANTITATIVE AI TRADING SYSTEM
// =====================================================

// Quant trading assets (stocks, crypto, forex)
export const quantAssets = pgTable("quant_assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  assetType: varchar("asset_type", { length: 20 }).notNull(), // stock, crypto, forex
  exchange: varchar("exchange", { length: 50 }),
  sector: varchar("sector", { length: 100 }),
  isActive: boolean("is_active").default(true),
  lastPrice: decimal("last_price", { precision: 20, scale: 8 }),
  lastUpdated: timestamp("last_updated"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Technical indicators calculated for each asset
export const quantIndicators = pgTable("quant_indicators", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => quantAssets.id).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // 5min, 15min, 1h, 4h, daily
  
  // Price data
  open: decimal("open", { precision: 20, scale: 8 }),
  high: decimal("high", { precision: 20, scale: 8 }),
  low: decimal("low", { precision: 20, scale: 8 }),
  close: decimal("close", { precision: 20, scale: 8 }),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  
  // Momentum indicators
  rsi14: decimal("rsi_14", { precision: 8, scale: 4 }),
  macdLine: decimal("macd_line", { precision: 20, scale: 8 }),
  macdSignal: decimal("macd_signal", { precision: 20, scale: 8 }),
  macdHistogram: decimal("macd_histogram", { precision: 20, scale: 8 }),
  stochK: decimal("stoch_k", { precision: 8, scale: 4 }),
  stochD: decimal("stoch_d", { precision: 8, scale: 4 }),
  
  // Trend indicators (EMAs)
  ema9: decimal("ema_9", { precision: 20, scale: 8 }),
  ema20: decimal("ema_20", { precision: 20, scale: 8 }),
  ema50: decimal("ema_50", { precision: 20, scale: 8 }),
  ema200: decimal("ema_200", { precision: 20, scale: 8 }),
  sma20: decimal("sma_20", { precision: 20, scale: 8 }),
  sma50: decimal("sma_50", { precision: 20, scale: 8 }),
  
  // Volatility indicators
  atr14: decimal("atr_14", { precision: 20, scale: 8 }),
  bollingerUpper: decimal("bollinger_upper", { precision: 20, scale: 8 }),
  bollingerMiddle: decimal("bollinger_middle", { precision: 20, scale: 8 }),
  bollingerLower: decimal("bollinger_lower", { precision: 20, scale: 8 }),
  bollingerWidth: decimal("bollinger_width", { precision: 10, scale: 6 }),
  volatilityPercent: decimal("volatility_percent", { precision: 10, scale: 4 }),
  
  // Volume indicators
  obv: decimal("obv", { precision: 20, scale: 2 }),
  vpt: decimal("vpt", { precision: 20, scale: 2 }),
  volumeSma20: decimal("volume_sma_20", { precision: 20, scale: 2 }),
  volumeRatio: decimal("volume_ratio", { precision: 10, scale: 4 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Sentiment analysis scores
export const quantSentiment = pgTable("quant_sentiment", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => quantAssets.id),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  
  // Fear & Greed Index (0-100)
  fearGreedIndex: integer("fear_greed_index"),
  fearGreedLabel: varchar("fear_greed_label", { length: 50 }), // Extreme Fear, Fear, Neutral, Greed, Extreme Greed
  
  // AI Sentiment Scores (-1 to 1)
  newsSentiment: decimal("news_sentiment", { precision: 5, scale: 4 }),
  socialSentiment: decimal("social_sentiment", { precision: 5, scale: 4 }),
  overallSentiment: decimal("overall_sentiment", { precision: 5, scale: 4 }),
  
  // Topic intensity scores
  topicScores: jsonb("topic_scores"), // {regulatory_risk: 0.3, product_launch: 0.8, etc}
  
  // News and social data
  newsCount: integer("news_count"),
  socialMentions: integer("social_mentions"),
  sentimentSources: jsonb("sentiment_sources"), // Array of sources used
  
  aiAnalysis: text("ai_analysis"), // AI-generated sentiment summary
  createdAt: timestamp("created_at").defaultNow(),
});

// Quantitative trading signals
export const quantSignals = pgTable("quant_signals", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => quantAssets.id).notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  
  // Signal details
  signalType: varchar("signal_type", { length: 20 }).notNull(), // buy, sell, hold, strong_buy, strong_sell
  direction: varchar("direction", { length: 20 }).notNull(), // bullish, bearish, neutral
  strength: decimal("strength", { precision: 5, scale: 2 }).notNull(), // 0-100 signal strength
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100 confidence
  
  // Price targets
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }),
  targetPrice: decimal("target_price", { precision: 20, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 6, scale: 2 }),
  
  // Factor scores (contributing to signal)
  technicalScore: decimal("technical_score", { precision: 5, scale: 2 }), // -100 to 100
  momentumScore: decimal("momentum_score", { precision: 5, scale: 2 }),
  trendScore: decimal("trend_score", { precision: 5, scale: 2 }),
  volumeScore: decimal("volume_score", { precision: 5, scale: 2 }),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 2 }),
  
  // Timeframe and validity
  timeframe: varchar("timeframe", { length: 20 }).notNull(), // short, medium, long
  validUntil: timestamp("valid_until"),
  
  // AI analysis
  reasoning: text("reasoning"),
  keyFactors: jsonb("key_factors"), // Array of key factors driving signal
  
  // Status tracking
  status: varchar("status", { length: 20 }).default("active"), // active, expired, triggered, cancelled
  triggeredAt: timestamp("triggered_at"),
  outcome: varchar("outcome", { length: 20 }), // win, loss, neutral
  actualReturn: decimal("actual_return", { precision: 10, scale: 4 }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Quant predictions (AI-enhanced forecasts)
export const quantPredictions = pgTable("quant_predictions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => quantAssets.id).notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  
  // Prediction details
  predictionType: varchar("prediction_type", { length: 50 }).notNull(), // price, direction, volatility
  horizonMinutes: integer("horizon_minutes").notNull(), // Prediction horizon in minutes
  
  // Price predictions
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  predictedPrice: decimal("predicted_price", { precision: 20, scale: 8 }),
  predictedChange: decimal("predicted_change", { precision: 10, scale: 4 }), // Percentage
  lowerBound: decimal("lower_bound", { precision: 20, scale: 8 }),
  upperBound: decimal("upper_bound", { precision: 20, scale: 8 }),
  
  // Direction prediction
  predictedDirection: varchar("predicted_direction", { length: 20 }), // up, down, sideways
  directionConfidence: decimal("direction_confidence", { precision: 5, scale: 2 }),
  
  // Multi-factor analysis
  technicalFactors: jsonb("technical_factors"),
  sentimentFactors: jsonb("sentiment_factors"),
  
  // Model info
  modelType: varchar("model_type", { length: 50 }), // ensemble, technical, ai_hybrid
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  
  aiAnalysis: text("ai_analysis"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for quant tables
export const insertQuantAssetSchema = createInsertSchema(quantAssets).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertQuantIndicatorSchema = createInsertSchema(quantIndicators).omit({
  id: true,
  calculatedAt: true,
  createdAt: true,
});

export const insertQuantSentimentSchema = createInsertSchema(quantSentiment).omit({
  id: true,
  calculatedAt: true,
  createdAt: true,
});

export const insertQuantSignalSchema = createInsertSchema(quantSignals).omit({
  id: true,
  generatedAt: true,
  triggeredAt: true,
  createdAt: true,
});

export const insertQuantPredictionSchema = createInsertSchema(quantPredictions).omit({
  id: true,
  generatedAt: true,
  createdAt: true,
});

// Quant types
export type QuantAsset = typeof quantAssets.$inferSelect;
export type InsertQuantAsset = z.infer<typeof insertQuantAssetSchema>;

export type QuantIndicator = typeof quantIndicators.$inferSelect;
export type InsertQuantIndicator = z.infer<typeof insertQuantIndicatorSchema>;

export type QuantSentiment = typeof quantSentiment.$inferSelect;
export type InsertQuantSentiment = z.infer<typeof insertQuantSentimentSchema>;

export type QuantSignal = typeof quantSignals.$inferSelect;
export type InsertQuantSignal = z.infer<typeof insertQuantSignalSchema>;

export type QuantPrediction = typeof quantPredictions.$inferSelect;
export type InsertQuantPrediction = z.infer<typeof insertQuantPredictionSchema>;

// Multi-Modal Data Pipeline Tables
export const multiModalPriceData = pgTable("multi_modal_price_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(), // 'stock', 'crypto', 'forex'
  timestamp: timestamp("timestamp").notNull(),
  open: decimal("open", { precision: 20, scale: 8 }).notNull(),
  high: decimal("high", { precision: 20, scale: 8 }).notNull(),
  low: decimal("low", { precision: 20, scale: 8 }).notNull(),
  close: decimal("close", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 2 }),
  rsi14: decimal("rsi_14", { precision: 10, scale: 4 }),
  macdLine: decimal("macd_line", { precision: 20, scale: 8 }),
  macdSignal: decimal("macd_signal", { precision: 20, scale: 8 }),
  macdHistogram: decimal("macd_histogram", { precision: 20, scale: 8 }),
  ema9: decimal("ema_9", { precision: 20, scale: 8 }),
  ema20: decimal("ema_20", { precision: 20, scale: 8 }),
  ema50: decimal("ema_50", { precision: 20, scale: 8 }),
  sma20: decimal("sma_20", { precision: 20, scale: 8 }),
  sma50: decimal("sma_50", { precision: 20, scale: 8 }),
  atr14: decimal("atr_14", { precision: 20, scale: 8 }),
  bollingerUpper: decimal("bollinger_upper", { precision: 20, scale: 8 }),
  bollingerMiddle: decimal("bollinger_middle", { precision: 20, scale: 8 }),
  bollingerLower: decimal("bollinger_lower", { precision: 20, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const multiModalSentiment = pgTable("multi_modal_sentiment", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  sentimentScore: decimal("sentiment_score", { precision: 5, scale: 4 }), // -1.0 to +1.0
  sentimentVelocity: decimal("sentiment_velocity", { precision: 5, scale: 4 }), // Change per hour
  newsCount: integer("news_count"),
  positiveNewsCount: integer("positive_news_count"),
  negativeNewsCount: integer("negative_news_count"),
  neutralNewsCount: integer("neutral_news_count"),
  socialVolume: integer("social_volume"),
  socialSentiment: decimal("social_sentiment", { precision: 5, scale: 4 }),
  fearGreedIndex: integer("fear_greed_index"),
  source: text("source"), // 'news', 'twitter', 'reddit', 'combined'
  createdAt: timestamp("created_at").defaultNow(),
});

export const multiModalInstitutionalFlow = pgTable("multi_modal_institutional_flow", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  darkPoolVolume: decimal("dark_pool_volume", { precision: 20, scale: 2 }),
  darkPoolRatio: decimal("dark_pool_ratio", { precision: 5, scale: 4 }),
  netExchangeFlow: decimal("net_exchange_flow", { precision: 20, scale: 8 }), // For crypto
  exchangeInflowVolume: decimal("exchange_inflow_volume", { precision: 20, scale: 8 }),
  exchangeOutflowVolume: decimal("exchange_outflow_volume", { precision: 20, scale: 8 }),
  largeTransactionCount: integer("large_transaction_count"),
  whaleAccumulation: decimal("whale_accumulation", { precision: 20, scale: 8 }),
  institutionalBuying: decimal("institutional_buying", { precision: 20, scale: 2 }),
  institutionalSelling: decimal("institutional_selling", { precision: 20, scale: 2 }),
  netInstitutionalFlow: decimal("net_institutional_flow", { precision: 20, scale: 2 }),
  optionsFlow: decimal("options_flow", { precision: 20, scale: 2 }),
  callPutRatio: decimal("call_put_ratio", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const multiModalFusedFeatures = pgTable("multi_modal_fused_features", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  priceDataId: integer("price_data_id").references(() => multiModalPriceData.id),
  sentimentId: integer("sentiment_id").references(() => multiModalSentiment.id),
  institutionalFlowId: integer("institutional_flow_id").references(() => multiModalInstitutionalFlow.id),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  priceChange5m: decimal("price_change_5m", { precision: 10, scale: 6 }),
  priceChange15m: decimal("price_change_15m", { precision: 10, scale: 6 }),
  priceChange1h: decimal("price_change_1h", { precision: 10, scale: 6 }),
  volatilityScore: decimal("volatility_score", { precision: 5, scale: 4 }),
  momentumScore: decimal("momentum_score", { precision: 5, scale: 4 }),
  trendStrength: decimal("trend_strength", { precision: 5, scale: 4 }),
  combinedSentiment: decimal("combined_sentiment", { precision: 5, scale: 4 }),
  institutionalPressure: decimal("institutional_pressure", { precision: 5, scale: 4 }),
  overallSignalScore: decimal("overall_signal_score", { precision: 5, scale: 4 }), // -1.0 to +1.0
  signalDirection: text("signal_direction"), // 'long', 'short', 'neutral'
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for multi-modal tables
export const insertMultiModalPriceDataSchema = createInsertSchema(multiModalPriceData).omit({
  id: true,
  createdAt: true,
});

export const insertMultiModalSentimentSchema = createInsertSchema(multiModalSentiment).omit({
  id: true,
  createdAt: true,
});

export const insertMultiModalInstitutionalFlowSchema = createInsertSchema(multiModalInstitutionalFlow).omit({
  id: true,
  createdAt: true,
});

export const insertMultiModalFusedFeaturesSchema = createInsertSchema(multiModalFusedFeatures).omit({
  id: true,
  createdAt: true,
});

// Multi-modal types
export type MultiModalPriceData = typeof multiModalPriceData.$inferSelect;
export type InsertMultiModalPriceData = z.infer<typeof insertMultiModalPriceDataSchema>;

export type MultiModalSentiment = typeof multiModalSentiment.$inferSelect;
export type InsertMultiModalSentiment = z.infer<typeof insertMultiModalSentimentSchema>;

export type MultiModalInstitutionalFlow = typeof multiModalInstitutionalFlow.$inferSelect;
export type InsertMultiModalInstitutionalFlow = z.infer<typeof insertMultiModalInstitutionalFlowSchema>;

export type MultiModalFusedFeatures = typeof multiModalFusedFeatures.$inferSelect;
export type InsertMultiModalFusedFeatures = z.infer<typeof insertMultiModalFusedFeaturesSchema>;

// ==========================================
// AI TRADER PORTFOLIO & VQ TABLES
// TradeSmith-like portfolio tracking and analysis
// ==========================================

export const aiTraderPortfolios = pgTable("ai_trader_portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  totalValue: decimal("total_value", { precision: 20, scale: 2 }).default("0"),
  cashBalance: decimal("cash_balance", { precision: 20, scale: 2 }).default("0"),
  totalGainLoss: decimal("total_gain_loss", { precision: 20, scale: 2 }).default("0"),
  totalGainLossPercent: decimal("total_gain_loss_percent", { precision: 10, scale: 4 }).default("0"),
  riskScore: integer("risk_score").default(50),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiTraderPositions = pgTable("ai_trader_positions", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => aiTraderPortfolios.id),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  shares: decimal("shares", { precision: 20, scale: 8 }).notNull(),
  avgCost: decimal("avg_cost", { precision: 20, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  marketValue: decimal("market_value", { precision: 20, scale: 2 }),
  gainLoss: decimal("gain_loss", { precision: 20, scale: 2 }),
  gainLossPercent: decimal("gain_loss_percent", { precision: 10, scale: 4 }),
  vqValue: decimal("vq_value", { precision: 20, scale: 8 }),
  vqPercent: decimal("vq_percent", { precision: 10, scale: 4 }),
  stopLossPrice: decimal("stop_loss_price", { precision: 20, scale: 8 }),
  healthZone: text("health_zone"),
  healthStatus: text("health_status"),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vqCalculations = pgTable("vq_calculations", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  vqValue: decimal("vq_value", { precision: 20, scale: 8 }).notNull(),
  vqPercent: decimal("vq_percent", { precision: 10, scale: 4 }).notNull(),
  atr: decimal("atr", { precision: 20, scale: 8 }).notNull(),
  atrPercent: decimal("atr_percent", { precision: 10, scale: 4 }).notNull(),
  volatilityLevel: text("volatility_level").notNull(),
  stopLossPrice: decimal("stop_loss_price", { precision: 20, scale: 8 }).notNull(),
  trailingStopPercent: decimal("trailing_stop_percent", { precision: 10, scale: 4 }).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const healthIndicators = pgTable("health_indicators", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  highWaterMark: decimal("high_water_mark", { precision: 20, scale: 8 }).notNull(),
  dropFromHigh: decimal("drop_from_high", { precision: 20, scale: 8 }).notNull(),
  dropPercent: decimal("drop_percent", { precision: 10, scale: 4 }).notNull(),
  vqMultiple: decimal("vq_multiple", { precision: 10, scale: 4 }).notNull(),
  zone: text("zone").notNull(),
  status: text("status").notNull(),
  recommendation: text("recommendation").notNull(),
  description: text("description"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const stockStateIndicators = pgTable("stock_state_indicators", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }).notNull(),
  vqValue: decimal("vq_value", { precision: 20, scale: 8 }),
  vqPercent: decimal("vq_percent", { precision: 10, scale: 4 }),
  volatilityLevel: text("volatility_level"),
  healthZone: text("health_zone"),
  healthStatus: text("health_status"),
  recommendation: text("recommendation"),
  signalAction: text("signal_action"),
  signalConfidence: decimal("signal_confidence", { precision: 5, scale: 2 }),
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),
  reasoning: text("reasoning"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const aiTraderWatchlist = pgTable("ai_trader_watchlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(),
  notes: text("notes"),
  alertPrice: decimal("alert_price", { precision: 20, scale: 8 }),
  alertType: text("alert_type"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for AI Trader tables
export const insertAiTraderPortfolioSchema = createInsertSchema(aiTraderPortfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiTraderPositionSchema = createInsertSchema(aiTraderPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVqCalculationSchema = createInsertSchema(vqCalculations).omit({
  id: true,
  calculatedAt: true,
});

export const insertHealthIndicatorSchema = createInsertSchema(healthIndicators).omit({
  id: true,
  calculatedAt: true,
});

export const insertStockStateIndicatorSchema = createInsertSchema(stockStateIndicators).omit({
  id: true,
  calculatedAt: true,
});

export const insertAiTraderWatchlistSchema = createInsertSchema(aiTraderWatchlist).omit({
  id: true,
  createdAt: true,
});

// AI Trader types
export type AiTraderPortfolio = typeof aiTraderPortfolios.$inferSelect;
export type InsertAiTraderPortfolio = z.infer<typeof insertAiTraderPortfolioSchema>;

export type AiTraderPosition = typeof aiTraderPositions.$inferSelect;
export type InsertAiTraderPosition = z.infer<typeof insertAiTraderPositionSchema>;

export type VqCalculation = typeof vqCalculations.$inferSelect;
export type InsertVqCalculation = z.infer<typeof insertVqCalculationSchema>;

export type HealthIndicator = typeof healthIndicators.$inferSelect;
export type InsertHealthIndicator = z.infer<typeof insertHealthIndicatorSchema>;

export type StockStateIndicator = typeof stockStateIndicators.$inferSelect;
export type InsertStockStateIndicator = z.infer<typeof insertStockStateIndicatorSchema>;

export type AiTraderWatchlist = typeof aiTraderWatchlist.$inferSelect;
export type InsertAiTraderWatchlist = z.infer<typeof insertAiTraderWatchlistSchema>;

// High-Frequency Stock Scanner Tables (5:1 Risk/Reward Algorithm)
export const scannerJobs = pgTable("scanner_jobs", {
  id: serial("id").primaryKey(),
  scanDate: timestamp("scan_date").defaultNow(),
  status: text("status").notNull(), // 'running', 'completed', 'failed'
  totalStocksScanned: integer("total_stocks_scanned").default(0),
  qualifiedCount: integer("qualified_count").default(0),
  topAlertSymbol: text("top_alert_symbol"),
  scanDurationMs: integer("scan_duration_ms"),
  batchesProcessed: integer("batches_processed").default(0),
  errorCount: integer("error_count").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scannerCandidates = pgTable("scanner_candidates", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => scannerJobs.id),
  symbol: text("symbol").notNull(),
  name: text("name"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }).notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  riskAmount: decimal("risk_amount", { precision: 10, scale: 4 }).notNull(), // $ per share
  rewardAmount: decimal("reward_amount", { precision: 10, scale: 4 }).notNull(), // $ per share
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }).notNull(), // 5.0 means 5:1
  compositeScore: decimal("composite_score", { precision: 10, scale: 4 }).notNull(),
  trendScore: decimal("trend_score", { precision: 5, scale: 2 }),
  momentumScore: decimal("momentum_score", { precision: 5, scale: 2 }),
  volumeScore: decimal("volume_score", { precision: 5, scale: 2 }),
  volatilityScore: decimal("volatility_score", { precision: 5, scale: 2 }),
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  atr: decimal("atr", { precision: 10, scale: 4 }),
  volume: bigint("volume", { mode: "number" }),
  avgVolume: bigint("avg_volume", { mode: "number" }),
  pattern: text("pattern"), // 'breakout', 'pullback', 'reversal', etc.
  sector: text("sector"),
  reasoning: text("reasoning"),
  isTopAlert: boolean("is_top_alert").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scannerAlerts = pgTable("scanner_alerts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => scannerJobs.id),
  candidateId: integer("candidate_id").references(() => scannerCandidates.id),
  symbol: text("symbol").notNull(),
  alertType: text("alert_type").notNull(), // 'top_pick', 'runner_up'
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }).notNull(),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }).notNull(),
  compositeScore: decimal("composite_score", { precision: 10, scale: 4 }).notNull(),
  alertMessage: text("alert_message"),
  isSent: boolean("is_sent").default(false),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scanner insert schemas
export const insertScannerJobSchema = createInsertSchema(scannerJobs).omit({
  id: true,
  scanDate: true,
  createdAt: true,
});

export const insertScannerCandidateSchema = createInsertSchema(scannerCandidates).omit({
  id: true,
  createdAt: true,
});

export const insertScannerAlertSchema = createInsertSchema(scannerAlerts).omit({
  id: true,
  createdAt: true,
});

// Scanner types
export type ScannerJob = typeof scannerJobs.$inferSelect;
export type InsertScannerJob = z.infer<typeof insertScannerJobSchema>;

export type ScannerCandidate = typeof scannerCandidates.$inferSelect;
export type InsertScannerCandidate = z.infer<typeof insertScannerCandidateSchema>;

export type ScannerAlert = typeof scannerAlerts.$inferSelect;
export type InsertScannerAlert = z.infer<typeof insertScannerAlertSchema>;

// Futures Trading Tables (Gold & Silver)
export const futuresContracts = pgTable("futures_contracts", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // GC=F, SI=F
  name: text("name").notNull(), // Gold Futures, Silver Futures
  exchange: text("exchange").notNull(), // COMEX
  contractSize: decimal("contract_size", { precision: 10, scale: 2 }).notNull(), // 100 oz for gold, 5000 oz for silver
  tickSize: decimal("tick_size", { precision: 10, scale: 4 }).notNull(), // 0.10 for gold, 0.005 for silver
  tickValue: decimal("tick_value", { precision: 10, scale: 2 }).notNull(), // $10 for gold, $25 for silver
  marginRequirement: decimal("margin_requirement", { precision: 12, scale: 2 }).notNull(), // Initial margin
  tradingHours: text("trading_hours"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const futuresSignals = pgTable("futures_signals", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").references(() => futuresContracts.id),
  symbol: text("symbol").notNull(),
  signalType: text("signal_type").notNull(), // 'long', 'short', 'hold'
  entryPrice: decimal("entry_price", { precision: 12, scale: 4 }).notNull(),
  stopLoss: decimal("stop_loss", { precision: 12, scale: 4 }),
  targetPrice: decimal("target_price", { precision: 12, scale: 4 }),
  riskRewardRatio: decimal("risk_reward_ratio", { precision: 5, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  reasoning: text("reasoning"),
  indicators: jsonb("indicators"), // RSI, MACD, etc.
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const futuresAnalytics = pgTable("futures_analytics", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  currentPrice: decimal("current_price", { precision: 12, scale: 4 }).notNull(),
  dayOpen: decimal("day_open", { precision: 12, scale: 4 }),
  dayHigh: decimal("day_high", { precision: 12, scale: 4 }),
  dayLow: decimal("day_low", { precision: 12, scale: 4 }),
  prevClose: decimal("prev_close", { precision: 12, scale: 4 }),
  volume: bigint("volume", { mode: "number" }),
  openInterest: bigint("open_interest", { mode: "number" }),
  atr: decimal("atr", { precision: 10, scale: 4 }),
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  macdLine: decimal("macd_line", { precision: 10, scale: 4 }),
  macdSignal: decimal("macd_signal", { precision: 10, scale: 4 }),
  macdHistogram: decimal("macd_histogram", { precision: 10, scale: 4 }),
  ema9: decimal("ema9", { precision: 12, scale: 4 }),
  ema20: decimal("ema20", { precision: 12, scale: 4 }),
  ema50: decimal("ema50", { precision: 12, scale: 4 }),
  trend: text("trend"), // 'bullish', 'bearish', 'neutral'
  volatility: text("volatility"), // 'low', 'medium', 'high'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Futures insert schemas
export const insertFuturesContractSchema = createInsertSchema(futuresContracts).omit({
  id: true,
  updatedAt: true,
});

export const insertFuturesSignalSchema = createInsertSchema(futuresSignals).omit({
  id: true,
  createdAt: true,
});

export const insertFuturesAnalyticsSchema = createInsertSchema(futuresAnalytics).omit({
  id: true,
  updatedAt: true,
});

// Futures types
export type FuturesContract = typeof futuresContracts.$inferSelect;
export type InsertFuturesContract = z.infer<typeof insertFuturesContractSchema>;

export type FuturesSignal = typeof futuresSignals.$inferSelect;
export type InsertFuturesSignal = z.infer<typeof insertFuturesSignalSchema>;

export type FuturesAnalytics = typeof futuresAnalytics.$inferSelect;
export type InsertFuturesAnalytics = z.infer<typeof insertFuturesAnalyticsSchema>;

// Income Machine - Options Scanner Tables
export const optionsScannerJobs = pgTable("options_scanner_jobs", {
  id: serial("id").primaryKey(),
  scanType: text("scan_type").notNull(), // 'calls', 'puts', 'both'
  status: text("status").notNull().default('pending'), // 'pending', 'running', 'completed', 'failed'
  totalStocksScanned: integer("total_stocks_scanned").default(0),
  opportunitiesFound: integer("opportunities_found").default(0),
  topPickSymbol: text("top_pick_symbol"),
  scanDuration: integer("scan_duration"), // milliseconds
  scanDate: timestamp("scan_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const optionsOpportunities = pgTable("options_opportunities", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => optionsScannerJobs.id),
  symbol: text("symbol").notNull(),
  companyName: text("company_name"),
  optionType: text("option_type").notNull(), // 'call', 'put'
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  strikePrice: decimal("strike_price", { precision: 10, scale: 2 }).notNull(),
  estimatedPremium: decimal("estimated_premium", { precision: 10, scale: 4 }),
  impliedVolatility: decimal("implied_volatility", { precision: 6, scale: 2 }), // percentage
  daysToExpiry: integer("days_to_expiry"),
  expirationDate: text("expiration_date"),
  annualizedReturn: decimal("annualized_return", { precision: 8, scale: 2 }), // percentage
  maxProfit: decimal("max_profit", { precision: 10, scale: 2 }),
  maxLoss: decimal("max_loss", { precision: 10, scale: 2 }),
  breakeven: decimal("breakeven", { precision: 10, scale: 2 }),
  probabilityOfProfit: decimal("probability_of_profit", { precision: 5, scale: 2 }),
  rsi: decimal("rsi", { precision: 5, scale: 2 }),
  trend: text("trend"), // 'bullish', 'bearish', 'neutral'
  support: decimal("support", { precision: 10, scale: 2 }),
  resistance: decimal("resistance", { precision: 10, scale: 2 }),
  volumeRatio: decimal("volume_ratio", { precision: 6, scale: 2 }),
  compositeScore: decimal("composite_score", { precision: 8, scale: 4 }).notNull(),
  incomeScore: decimal("income_score", { precision: 8, scale: 4 }),
  safetyScore: decimal("safety_score", { precision: 8, scale: 4 }),
  technicalScore: decimal("technical_score", { precision: 8, scale: 4 }),
  reasoning: text("reasoning"),
  isTopPick: boolean("is_top_pick").default(false),
  sector: text("sector"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const optionsWatchlist = pgTable("options_watchlist", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").references(() => optionsOpportunities.id),
  symbol: text("symbol").notNull(),
  optionType: text("option_type").notNull(),
  strikePrice: decimal("strike_price", { precision: 10, scale: 2 }).notNull(),
  expirationDate: text("expiration_date"),
  entryPrice: decimal("entry_price", { precision: 10, scale: 4 }),
  notes: text("notes"),
  status: text("status").default('watching'), // 'watching', 'entered', 'exited'
  createdAt: timestamp("created_at").defaultNow(),
});

// High-Probability Options Positions (70-Delta Strategy)
export const optionsPositions = pgTable("options_positions", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  optionType: text("option_type").notNull(), // 'call', 'put'
  strikePrice: decimal("strike_price", { precision: 10, scale: 2 }).notNull(),
  expirationDate: text("expiration_date").notNull(),
  contractSymbol: text("contract_symbol"), // Polygon OCC symbol
  entryPrice: decimal("entry_price", { precision: 10, scale: 4 }).notNull(), // Premium paid
  entryDate: timestamp("entry_date").defaultNow(),
  entryDelta: decimal("entry_delta", { precision: 5, scale: 4 }), // Delta at entry (0.70-0.85)
  currentPrice: decimal("current_price", { precision: 10, scale: 4 }),
  currentDelta: decimal("current_delta", { precision: 5, scale: 4 }),
  stopLossPrice: decimal("stop_loss_price", { precision: 10, scale: 2 }), // 20-day MA
  profitTarget: decimal("profit_target", { precision: 10, scale: 4 }), // 30% gain
  quantity: integer("quantity").default(1),
  status: text("status").default('open'), // 'open', 'profit_target_hit', 'time_exit', 'stopped_out', 'closed'
  daysHeld: integer("days_held").default(0),
  timeExitDate: timestamp("time_exit_date"), // 7 days after entry
  currentPnl: decimal("current_pnl", { precision: 10, scale: 2 }),
  currentPnlPercent: decimal("current_pnl_percent", { precision: 6, scale: 2 }),
  closedAt: timestamp("closed_at"),
  closePrice: decimal("close_price", { precision: 10, scale: 4 }),
  closeReason: text("close_reason"), // 'profit_target', 'time_exit', 'stop_loss', 'manual'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Position Alerts for 7-day management
export const optionsAlerts = pgTable("options_alerts", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").references(() => optionsPositions.id),
  symbol: text("symbol").notNull(),
  alertType: text("alert_type").notNull(), // 'time_exit', 'profit_target', 'stop_loss', 'delta_change'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  triggeredAt: timestamp("triggered_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Options Scanner insert schemas
export const insertOptionsScannerJobSchema = createInsertSchema(optionsScannerJobs).omit({
  id: true,
  scanDate: true,
  createdAt: true,
});

export const insertOptionsOpportunitySchema = createInsertSchema(optionsOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertOptionsWatchlistSchema = createInsertSchema(optionsWatchlist).omit({
  id: true,
  createdAt: true,
});

export const insertOptionsPositionSchema = createInsertSchema(optionsPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOptionsAlertSchema = createInsertSchema(optionsAlerts).omit({
  id: true,
  createdAt: true,
});

// Options Scanner types
export type OptionsScannerJob = typeof optionsScannerJobs.$inferSelect;
export type InsertOptionsScannerJob = z.infer<typeof insertOptionsScannerJobSchema>;

export type OptionsOpportunity = typeof optionsOpportunities.$inferSelect;
export type InsertOptionsOpportunity = z.infer<typeof insertOptionsOpportunitySchema>;

export type OptionsWatchlist = typeof optionsWatchlist.$inferSelect;
export type InsertOptionsWatchlist = z.infer<typeof insertOptionsWatchlistSchema>;

export type OptionsPosition = typeof optionsPositions.$inferSelect;
export type InsertOptionsPosition = z.infer<typeof insertOptionsPositionSchema>;

export type OptionsAlert = typeof optionsAlerts.$inferSelect;
export type InsertOptionsAlert = z.infer<typeof insertOptionsAlertSchema>;

// User Risk Profiles for AI Trading Assistant
export const userRiskProfiles = pgTable("user_risk_profiles", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(),
  experienceLevel: varchar("experience_level", { length: 50 }).notNull(), // beginner, intermediate, advanced, professional
  riskTolerance: varchar("risk_tolerance", { length: 50 }).notNull(), // conservative, moderate, aggressive, very_aggressive
  investmentHorizon: varchar("investment_horizon", { length: 50 }).notNull(), // day_trading, swing_trading, position_trading, long_term
  capitalAmount: varchar("capital_amount", { length: 50 }).notNull(), // under_1k, 1k_10k, 10k_50k, 50k_100k, over_100k
  timeCommitment: varchar("time_commitment", { length: 50 }).notNull(), // minutes_per_day, hour_per_day, several_hours, full_time
  primaryGoal: varchar("primary_goal", { length: 100 }).notNull(), // income, growth, preservation, speculation
  preferredMarkets: text("preferred_markets").array(), // stocks, crypto, forex, options, defi
  maxDrawdownTolerance: integer("max_drawdown_tolerance"), // percentage 5, 10, 20, 30, 50
  monthlyReturnTarget: integer("monthly_return_target"), // percentage
  riskScore: integer("risk_score"), // calculated 1-100
  aiRecommendations: jsonb("ai_recommendations"), // cached AI strategy recommendations
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserRiskProfileSchema = createInsertSchema(userRiskProfiles).omit({
  id: true,
  riskScore: true,
  aiRecommendations: true,
  createdAt: true,
  updatedAt: true,
});

export type UserRiskProfile = typeof userRiskProfiles.$inferSelect;
export type InsertUserRiskProfile = z.infer<typeof insertUserRiskProfileSchema>;

// Trading Platform Connections (API keys stored in Replit Secrets, NOT in database)
// Security: Only stores connection metadata. API keys are retrieved from env vars using platform type.
// Supported platforms use standard env var names: BINANCE_API_KEY, ALPACA_API_KEY, OANDA_API_KEY, COINBASE_API_KEY
export const tradingConnections = pgTable("trading_connections", {
  id: serial("id").primaryKey(),
  connectionUuid: text("connection_uuid").notNull().unique(), // UUID for secure reference
  platform: text("platform").notNull(), // 'binance', 'coinbase', 'alpaca', 'oanda'
  nickname: text("nickname").notNull(), // User-friendly name
  isActive: boolean("is_active").default(true),
  isPaperTrading: boolean("is_paper_trading").default(true), // Safety: start with paper trading
  lastConnectedAt: timestamp("last_connected_at"),
  connectionStatus: text("connection_status").default('pending'), // 'pending', 'connected', 'error'
  createdAt: timestamp("created_at").defaultNow(),
});

// Trade Execution Orders
export const tradeOrders = pgTable("trade_orders", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => tradingConnections.id),
  platform: text("platform").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // 'buy', 'sell'
  orderType: text("order_type").notNull(), // 'market', 'limit', 'stop'
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  price: decimal("price", { precision: 20, scale: 8 }),
  stopPrice: decimal("stop_price", { precision: 20, scale: 8 }),
  takeProfitPrice: decimal("take_profit_price", { precision: 20, scale: 8 }),
  status: text("status").default('pending'), // 'pending', 'submitted', 'filled', 'partial', 'cancelled', 'rejected'
  externalOrderId: text("external_order_id"), // Order ID from exchange
  filledQuantity: decimal("filled_quantity", { precision: 20, scale: 8 }),
  filledPrice: decimal("filled_price", { precision: 20, scale: 8 }),
  commission: decimal("commission", { precision: 20, scale: 8 }),
  signalSource: text("signal_source"), // 'hf_scalping', 'reversal', 'ai_profit'
  signalStrength: decimal("signal_strength", { precision: 5, scale: 2 }),
  errorMessage: text("error_message"),
  submittedAt: timestamp("submitted_at"),
  filledAt: timestamp("filled_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for trading
export const insertTradingConnectionSchema = createInsertSchema(tradingConnections).omit({
  id: true,
  createdAt: true,
  lastConnectedAt: true,
});

export const insertTradeOrderSchema = createInsertSchema(tradeOrders).omit({
  id: true,
  createdAt: true,
  submittedAt: true,
  filledAt: true,
});

// Trading types
export type TradingConnection = typeof tradingConnections.$inferSelect;
export type InsertTradingConnection = z.infer<typeof insertTradingConnectionSchema>;

export type TradeOrder = typeof tradeOrders.$inferSelect;
export type InsertTradeOrder = z.infer<typeof insertTradeOrderSchema>;

// AI Trading Plan - Portfolio Positions (Multi-Asset Tracking)
export const portfolioPositions = pgTable("portfolio_positions", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  assetType: text("asset_type").notNull(), // 'stock', 'options', 'crypto', 'forex', 'futures'
  side: text("side").notNull(), // 'long', 'short'
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }).notNull(),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  strikePrice: decimal("strike_price", { precision: 20, scale: 8 }), // For options
  expirationDate: date("expiration_date"), // For options/futures
  optionType: text("option_type"), // 'call', 'put' for options
  contractSize: integer("contract_size").default(100), // For options/futures
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 20, scale: 8 }),
  unrealizedPnlPercent: decimal("unrealized_pnl_percent", { precision: 10, scale: 4 }),
  aiAdvice: text("ai_advice"), // 'HOLD', 'EXIT', 'SCALE_IN', 'TAKE_PROFIT'
  aiReasoning: text("ai_reasoning"),
  aiConfidence: decimal("ai_confidence", { precision: 5, scale: 2 }),
  gatesPassed: integer("gates_passed").default(0),
  liquiditySweepDetected: boolean("liquidity_sweep_detected").default(false),
  volatilityAlert: boolean("volatility_alert").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  status: text("status").default('active'), // 'active', 'closed', 'expired'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Trading Plan Alerts
export const tradingPlanAlerts = pgTable("trading_plan_alerts", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").references(() => portfolioPositions.id),
  alertType: text("alert_type").notNull(), // 'volatility_spike', 'price_target', 'stop_loss', 'take_profit', 'liquidity_sweep', 'expiration_warning'
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  triggeredAt: timestamp("triggered_at").defaultNow(),
});

// Insert schemas for AI Trading Plan
export const insertPortfolioPositionSchema = createInsertSchema(portfolioPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
});

export const insertTradingPlanAlertSchema = createInsertSchema(tradingPlanAlerts).omit({
  id: true,
  triggeredAt: true,
});

// AI Trading Plan types
export type PortfolioPosition = typeof portfolioPositions.$inferSelect;
export type InsertPortfolioPosition = z.infer<typeof insertPortfolioPositionSchema>;

export type TradingPlanAlert = typeof tradingPlanAlerts.$inferSelect;
export type InsertTradingPlanAlert = z.infer<typeof insertTradingPlanAlertSchema>;

// ============================================
// AUTOMATED TRADING RULES SYSTEM
// ============================================

// Trading Rules - Define entry/exit conditions for automated execution
export const automatedTradingRules = pgTable("automated_trading_rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  symbol: varchar("symbol", { length: 50 }).notNull(), // 'AAPL', 'BTC', 'EURUSD', or 'SCAN' for scanner-based
  assetType: varchar("asset_type", { length: 20 }).notNull(), // 'stock', 'crypto', 'forex', 'options', 'futures'
  connectionId: integer("connection_id").references(() => tradingConnections.id),
  
  // Entry conditions (JSON array of conditions)
  entryConditions: jsonb("entry_conditions").notNull().default([]),
  // Exit conditions (JSON array of conditions)
  exitConditions: jsonb("exit_conditions").notNull().default([]),
  
  // Position sizing
  positionSizeType: varchar("position_size_type", { length: 20 }).notNull().default('fixed'), // 'fixed', 'percent_capital', 'risk_based'
  positionSize: decimal("position_size", { precision: 20, scale: 8 }).notNull(), // Amount or percentage
  maxPositionValue: decimal("max_position_value", { precision: 20, scale: 2 }), // Max $ value per trade
  
  // Risk management
  stopLossType: varchar("stop_loss_type", { length: 20 }).notNull().default('percentage'), // 'percentage', 'fixed', 'atr', 'trailing'
  stopLossValue: decimal("stop_loss_value", { precision: 10, scale: 4 }).notNull(), // Percentage or fixed amount
  takeProfitType: varchar("take_profit_type", { length: 20 }), // 'percentage', 'fixed', 'risk_reward'
  takeProfitValue: decimal("take_profit_value", { precision: 10, scale: 4 }),
  trailingStopActivation: decimal("trailing_stop_activation", { precision: 10, scale: 4 }), // Activate trailing stop after X% gain
  trailingStopDistance: decimal("trailing_stop_distance", { precision: 10, scale: 4 }), // Trail by X%
  maxDailyLoss: decimal("max_daily_loss", { precision: 20, scale: 2 }), // Stop trading after X$ daily loss
  maxDailyTrades: integer("max_daily_trades"), // Max trades per day
  
  // Timing
  tradingHoursStart: varchar("trading_hours_start", { length: 10 }), // '09:30' EST
  tradingHoursEnd: varchar("trading_hours_end", { length: 10 }), // '16:00' EST
  tradingDays: text("trading_days").array().default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  timezone: varchar("timezone", { length: 50 }).default('America/New_York'),
  
  // State
  isActive: boolean("is_active").default(false),
  isPaperTrading: boolean("is_paper_trading").default(true),
  lastTriggeredAt: timestamp("last_triggered_at"),
  nextCheckAt: timestamp("next_check_at"),
  todayTradeCount: integer("today_trade_count").default(0),
  todayPnl: decimal("today_pnl", { precision: 20, scale: 2 }).default('0'),
  totalTrades: integer("total_trades").default(0),
  winningTrades: integer("winning_trades").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Condition templates for easy rule creation
export const conditionTypes = {
  price: ['price_above', 'price_below', 'price_crosses_above', 'price_crosses_below'],
  indicator: ['rsi_above', 'rsi_below', 'macd_crossover', 'macd_crossunder', 'ema_cross_above', 'ema_cross_below', 'bollinger_breakout', 'volume_spike'],
  time: ['at_time', 'after_time', 'before_time', 'market_open', 'market_close'],
  pattern: ['breakout_high', 'breakdown_low', 'support_bounce', 'resistance_reject'],
  position: ['profit_percent', 'loss_percent', 'time_in_trade', 'trailing_stop_hit'],
} as const;

// Automated Trade Executions - Log all automated trades
export const automatedTradeExecutions = pgTable("automated_trade_executions", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => automatedTradingRules.id),
  connectionId: integer("connection_id").references(() => tradingConnections.id),
  orderId: integer("order_id").references(() => tradeOrders.id),
  
  symbol: varchar("symbol", { length: 50 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(), // 'buy', 'sell'
  executionType: varchar("execution_type", { length: 20 }).notNull(), // 'entry', 'exit', 'stop_loss', 'take_profit', 'trailing_stop'
  
  triggeredConditions: jsonb("triggered_conditions"), // Which conditions triggered this trade
  quantity: decimal("quantity", { precision: 20, scale: 8 }).notNull(),
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 20, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),
  
  pnl: decimal("pnl", { precision: 20, scale: 2 }),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // 'pending', 'filled', 'rejected', 'cancelled'
  errorMessage: text("error_message"),
  
  executedAt: timestamp("executed_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Rule execution logs for debugging and monitoring
export const ruleExecutionLogs = pgTable("rule_execution_logs", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").references(() => automatedTradingRules.id),
  logType: varchar("log_type", { length: 20 }).notNull(), // 'check', 'trigger', 'execute', 'error', 'skip'
  message: text("message").notNull(),
  conditionsChecked: jsonb("conditions_checked"),
  marketData: jsonb("market_data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for automated trading
export const insertAutomatedTradingRuleSchema = createInsertSchema(automatedTradingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTriggeredAt: true,
  nextCheckAt: true,
  todayTradeCount: true,
  todayPnl: true,
  totalTrades: true,
  winningTrades: true,
});

export const insertAutomatedTradeExecutionSchema = createInsertSchema(automatedTradeExecutions).omit({
  id: true,
  executedAt: true,
  closedAt: true,
});

export const insertRuleExecutionLogSchema = createInsertSchema(ruleExecutionLogs).omit({
  id: true,
  createdAt: true,
});

// Automated trading types
export type AutomatedTradingRule = typeof automatedTradingRules.$inferSelect;
export type InsertAutomatedTradingRule = z.infer<typeof insertAutomatedTradingRuleSchema>;

export type AutomatedTradeExecution = typeof automatedTradeExecutions.$inferSelect;
export type InsertAutomatedTradeExecution = z.infer<typeof insertAutomatedTradeExecutionSchema>;

export type RuleExecutionLog = typeof ruleExecutionLogs.$inferSelect;
export type InsertRuleExecutionLog = z.infer<typeof insertRuleExecutionLogSchema>;

// Condition type definitions for frontend
export interface TradingCondition {
  id: string;
  type: string;
  operator: 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'equals';
  value: number;
  period?: number; // For indicators like RSI, EMA
  secondaryPeriod?: number; // For indicators like MACD
  timeframe?: string; // '1m', '5m', '15m', '1h', '4h', '1d'
}

// ============================================
// CUSTOMIZABLE ALERT SYSTEM
// ============================================

export const customAlerts = pgTable("custom_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  assetType: varchar("asset_type", { length: 20 }).notNull().default('stock'),
  
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  condition: varchar("condition", { length: 50 }).notNull(),
  targetValue: decimal("target_value", { precision: 20, scale: 8 }).notNull(),
  secondaryValue: decimal("secondary_value", { precision: 20, scale: 8 }),
  indicatorPeriod: integer("indicator_period"),
  
  notifyEmail: boolean("notify_email").default(true),
  notifyPush: boolean("notify_push").default(true),
  notifyInApp: boolean("notify_in_app").default(true),
  
  isActive: boolean("is_active").default(true),
  isTriggered: boolean("is_triggered").default(false),
  triggerCount: integer("trigger_count").default(0),
  repeatAlert: boolean("repeat_alert").default(false),
  cooldownMinutes: integer("cooldown_minutes").default(60),
  
  lastTriggeredAt: timestamp("last_triggered_at"),
  lastCheckedAt: timestamp("last_checked_at"),
  lastValue: decimal("last_value", { precision: 20, scale: 8 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alertNotifications = pgTable("alert_notifications", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => customAlerts.id),
  userId: integer("user_id").references(() => users.id),
  
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  symbol: varchar("symbol", { length: 50 }).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(),
  triggeredValue: decimal("triggered_value", { precision: 20, scale: 8 }),
  targetValue: decimal("target_value", { precision: 20, scale: 8 }),
  
  notificationChannel: varchar("notification_channel", { length: 20 }).notNull(),
  isRead: boolean("is_read").default(false),
  isSent: boolean("is_sent").default(false),
  sentAt: timestamp("sent_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const alertTypes = {
  price: ['price_above', 'price_below', 'price_change_percent', 'price_range'],
  indicator: ['rsi_overbought', 'rsi_oversold', 'macd_crossover', 'macd_crossunder', 'ema_cross', 'bollinger_upper', 'bollinger_lower', 'volume_spike'],
  momentum: ['momentum_bullish', 'momentum_bearish', 'trend_reversal'],
  volatility: ['atr_spike', 'volatility_breakout'],
} as const;

export const alertConditions = {
  price_above: { label: 'Price Above', description: 'Trigger when price rises above target' },
  price_below: { label: 'Price Below', description: 'Trigger when price drops below target' },
  price_change_percent: { label: 'Price Change %', description: 'Trigger on percentage change' },
  rsi_overbought: { label: 'RSI Overbought', description: 'RSI crosses above threshold (default 70)' },
  rsi_oversold: { label: 'RSI Oversold', description: 'RSI crosses below threshold (default 30)' },
  macd_crossover: { label: 'MACD Bullish Cross', description: 'MACD line crosses above signal line' },
  macd_crossunder: { label: 'MACD Bearish Cross', description: 'MACD line crosses below signal line' },
  ema_cross: { label: 'EMA Crossover', description: 'Fast EMA crosses slow EMA' },
  bollinger_upper: { label: 'Bollinger Upper Touch', description: 'Price touches upper band' },
  bollinger_lower: { label: 'Bollinger Lower Touch', description: 'Price touches lower band' },
  volume_spike: { label: 'Volume Spike', description: 'Volume exceeds average by multiplier' },
} as const;

export const insertCustomAlertSchema = createInsertSchema(customAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTriggeredAt: true,
  lastCheckedAt: true,
  lastValue: true,
  triggerCount: true,
  isTriggered: true,
});

export const insertAlertNotificationSchema = createInsertSchema(alertNotifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export type CustomAlert = typeof customAlerts.$inferSelect;
export type InsertCustomAlert = z.infer<typeof insertCustomAlertSchema>;

export type AlertNotification = typeof alertNotifications.$inferSelect;
export type InsertAlertNotification = z.infer<typeof insertAlertNotificationSchema>;

// Gate Sets for Central Scanner
export const gateSets = pgTable("gate_sets", {
  id: serial("id").primaryKey(),
  setId: text("set_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  gates: jsonb("gates").notNull().$type<GateConfig[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export interface GateConfig {
  gate: number;
  rule_id: string;
  required: boolean;
  weight: number;
  params?: Record<string, any>;
}

export const insertGateSetSchema = createInsertSchema(gateSets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GateSet = typeof gateSets.$inferSelect;
export type InsertGateSet = z.infer<typeof insertGateSetSchema>;

// User Preferences for Skill Level System
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().unique(), // For unauthenticated users
  userId: integer("user_id").references(() => users.id), // For authenticated users
  skillLevel: varchar("skill_level", { length: 20 }).notNull().default('beginner'), // 'beginner' | 'experienced'
  experiencedUnlockedAt: timestamp("experienced_unlocked_at"), // When they earned experienced access
  modulesCompletedForUnlock: integer("modules_completed_for_unlock").default(0),
  hoursSpentForUnlock: decimal("hours_spent_for_unlock", { precision: 10, scale: 2 }).default("0"),
  strategiesCompletedForUnlock: integer("strategies_completed_for_unlock").default(0),
  hasSeenOnboarding: boolean("has_seen_onboarding").default(false),
  dismissedAdvancedWarnings: boolean("dismissed_advanced_warnings").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// ============================================
// 7-GATE INSTITUTIONAL RISK MANAGEMENT SYSTEM
// Signal tracking, risk limits, and performance analytics
// ============================================

// Signal History - Records all 7-gate signals with outcomes
export const sevenGateSignalHistory = pgTable("seven_gate_signal_history", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull(), // 'long' | 'short'
  entryPrice: decimal("entry_price", { precision: 20, scale: 8 }),
  exitPrice: decimal("exit_price", { precision: 20, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 20, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 20, scale: 8 }),
  quantity: decimal("quantity", { precision: 20, scale: 8 }),

  // Gate scores breakdown
  gateScores: jsonb("gate_scores").$type<{
    gate1: number; // Liquidity Sweep
    gate2: number; // Fair Value Gap
    gate3: number; // Order Block
    gate4: number; // Market Structure
    gate5: number; // Momentum
    gate6: number; // Session Timing
    gate7: number; // Confluence
  }>(),
  totalScore: integer("total_score").notNull(),
  gatesPassed: integer("gates_passed").notNull(),

  // Outcome tracking
  outcome: text("outcome"), // 'win' | 'loss' | 'breakeven' | 'pending' | 'stopped'
  pnlAmount: decimal("pnl_amount", { precision: 20, scale: 8 }),
  pnlPercent: decimal("pnl_percent", { precision: 10, scale: 4 }),
  holdingPeriodMinutes: integer("holding_period_minutes"),

  // Market context at signal time
  marketRegime: text("market_regime"), // 'trending' | 'ranging' | 'volatile'
  atr: decimal("atr", { precision: 20, scale: 8 }), // ATR at signal time
  atrPercent: decimal("atr_percent", { precision: 10, scale: 4 }), // ATR as % of price
  volumeRatio: decimal("volume_ratio", { precision: 10, scale: 4 }),

  // Sweep details
  sweepType: text("sweep_type"), // 'BULLISH_SWEEP' | 'BEARISH_SWEEP'
  sweepLevel: text("sweep_level"), // 'pdh' | 'pdl' | 'session_high' | 'session_low' | 'equal_highs' | 'equal_lows'
  penetrationPercent: decimal("penetration_percent", { precision: 10, scale: 4 }),

  openedAt: timestamp("opened_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Gate Performance - Track effectiveness of each gate
export const sevenGatePerformance = pgTable("seven_gate_performance", {
  id: serial("id").primaryKey(),
  gateNumber: integer("gate_number").notNull(), // 1-7
  gateName: text("gate_name").notNull(),
  scoreThreshold: integer("score_threshold"), // Min score for this gate to "pass"

  // Aggregate statistics
  totalSignals: integer("total_signals").default(0),
  winCount: integer("win_count").default(0),
  lossCount: integer("loss_count").default(0),
  breakEvenCount: integer("break_even_count").default(0),

  // Performance metrics
  avgPnlPercent: decimal("avg_pnl_percent", { precision: 10, scale: 4 }),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }), // Percentage
  avgWinPercent: decimal("avg_win_percent", { precision: 10, scale: 4 }),
  avgLossPercent: decimal("avg_loss_percent", { precision: 10, scale: 4 }),
  profitFactor: decimal("profit_factor", { precision: 10, scale: 4 }), // Gross profit / Gross loss
  expectedValue: decimal("expected_value", { precision: 10, scale: 4 }), // (winRate * avgWin) - (lossRate * avgLoss)

  // Gate importance ranking
  importanceScore: decimal("importance_score", { precision: 10, scale: 4 }), // Correlation with wins

  // Time-based performance
  performanceBySession: jsonb("performance_by_session"), // {london: {winRate, count}, ny: {...}, asia: {...}}
  performanceByRegime: jsonb("performance_by_regime"), // {trending: {winRate, count}, ranging: {...}}

  lastCalculatedAt: timestamp("last_calculated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk Limits - Configurable risk parameters
export const sevenGateRiskLimits = pgTable("seven_gate_risk_limits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),

  // Position limits
  maxDailyLossPercent: decimal("max_daily_loss_percent", { precision: 5, scale: 2 }).notNull().default("3"), // -3% of capital
  maxOpenPositions: integer("max_open_positions").notNull().default(5),
  maxCorrelatedExposurePercent: decimal("max_correlated_exposure_percent", { precision: 5, scale: 2 }).notNull().default("50"), // 50% in correlated assets
  maxPositionSizePercent: decimal("max_position_size_percent", { precision: 5, scale: 2 }).notNull().default("2"), // 2% of capital per trade
  maxDrawdownPercent: decimal("max_drawdown_percent", { precision: 5, scale: 2 }).notNull().default("10"), // -10% triggers halt

  // Session limits
  maxTradesPerSession: integer("max_trades_per_session").default(10),
  minTimeBetweenTradesMinutes: integer("min_time_between_trades_minutes").default(5),

  // Score thresholds (data-driven)
  minGateScore: integer("min_gate_score").notNull().default(70),
  minGatesPassed: integer("min_gates_passed").notNull().default(5),

  // Capital tracking
  initialCapital: decimal("initial_capital", { precision: 20, scale: 2 }),
  currentCapital: decimal("current_capital", { precision: 20, scale: 2 }),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily Risk Metrics - Track daily performance and risk exposure
export const sevenGateDailyMetrics = pgTable("seven_gate_daily_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  userId: integer("user_id").references(() => users.id),

  // Daily P&L
  startingCapital: decimal("starting_capital", { precision: 20, scale: 2 }),
  endingCapital: decimal("ending_capital", { precision: 20, scale: 2 }),
  dailyPnl: decimal("daily_pnl", { precision: 20, scale: 2 }),
  dailyPnlPercent: decimal("daily_pnl_percent", { precision: 10, scale: 4 }),

  // Trade statistics
  totalTrades: integer("total_trades").default(0),
  winningTrades: integer("winning_trades").default(0),
  losingTrades: integer("losing_trades").default(0),
  winRate: decimal("win_rate", { precision: 5, scale: 2 }),

  // Risk metrics
  maxDrawdownPercent: decimal("max_drawdown_percent", { precision: 10, scale: 4 }),
  highWaterMark: decimal("high_water_mark", { precision: 20, scale: 2 }),
  peakExposure: decimal("peak_exposure", { precision: 20, scale: 2 }),
  avgPositionSize: decimal("avg_position_size", { precision: 20, scale: 2 }),

  // Session breakdown
  londonPnl: decimal("london_pnl", { precision: 20, scale: 2 }),
  nyPnl: decimal("ny_pnl", { precision: 20, scale: 2 }),
  asiaPnl: decimal("asia_pnl", { precision: 20, scale: 2 }),

  // Risk limit breaches
  dailyLossLimitHit: boolean("daily_loss_limit_hit").default(false),
  maxPositionsLimitHit: boolean("max_positions_limit_hit").default(false),
  correlationLimitHit: boolean("correlation_limit_hit").default(false),
  tradingHaltTriggered: boolean("trading_halt_triggered").default(false),
  haltReason: text("halt_reason"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Asset Correlation Matrix - Pre-calculated correlations for risk management
export const assetCorrelations = pgTable("asset_correlations", {
  id: serial("id").primaryKey(),
  symbolA: text("symbol_a").notNull(),
  symbolB: text("symbol_b").notNull(),
  correlation: decimal("correlation", { precision: 5, scale: 4 }).notNull(), // -1 to 1
  correlationPeriodDays: integer("correlation_period_days").notNull().default(30),
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for 7-Gate risk management
export const insertSevenGateSignalHistorySchema = createInsertSchema(sevenGateSignalHistory).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

export const insertSevenGatePerformanceSchema = createInsertSchema(sevenGatePerformance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSevenGateRiskLimitsSchema = createInsertSchema(sevenGateRiskLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSevenGateDailyMetricsSchema = createInsertSchema(sevenGateDailyMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetCorrelationSchema = createInsertSchema(assetCorrelations).omit({
  id: true,
  lastCalculatedAt: true,
  createdAt: true,
});

// 7-Gate risk management types
export type SevenGateSignalHistory = typeof sevenGateSignalHistory.$inferSelect;
export type InsertSevenGateSignalHistory = z.infer<typeof insertSevenGateSignalHistorySchema>;

export type SevenGatePerformance = typeof sevenGatePerformance.$inferSelect;
export type InsertSevenGatePerformance = z.infer<typeof insertSevenGatePerformanceSchema>;

export type SevenGateRiskLimits = typeof sevenGateRiskLimits.$inferSelect;
export type InsertSevenGateRiskLimits = z.infer<typeof insertSevenGateRiskLimitsSchema>;

export type SevenGateDailyMetrics = typeof sevenGateDailyMetrics.$inferSelect;
export type InsertSevenGateDailyMetrics = z.infer<typeof insertSevenGateDailyMetricsSchema>;

export type AssetCorrelation = typeof assetCorrelations.$inferSelect;
export type InsertAssetCorrelation = z.infer<typeof insertAssetCorrelationSchema>;
