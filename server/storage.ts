import { 
  users, portfolios, strategies, defiProtocols, exitStrategies, alerts,
  tradingSystems, tradingSignals, tradingPositions, tradingPerformance,
  courses, liveCalls, cryptoProjects, launchpads, yieldPools, userCourseEnrollments, userInvestments,
  stockAlerts, stockNews, marketOverview, stockTradingSignals,
  trainingStrategies, passiveIncomeStrategies, oliverVelezTechniques, forexTradingLessons,
  type User, type InsertUser, type Portfolio, type InsertPortfolio,
  type Strategy, type InsertStrategy, type DefiProtocol, type InsertDefiProtocol,
  type ExitStrategy, type InsertExitStrategy, type Alert, type InsertAlert,
  type TradingSystem, type InsertTradingSystem, type TradingSignal, type InsertTradingSignal,
  type TradingPosition, type InsertTradingPosition, type TradingPerformance, type InsertTradingPerformance,
  type Course, type InsertCourse, type LiveCall, type InsertLiveCall,
  type CryptoProject, type InsertCryptoProject, type Launchpad, type InsertLaunchpad,
  type YieldPool, type InsertYieldPool, type UserCourseEnrollment, type InsertUserCourseEnrollment,
  type UserInvestment, type InsertUserInvestment, type StockAlert, type InsertStockAlert,
  type StockNews, type InsertStockNews, type MarketOverview, type InsertMarketOverview,
  type StockTradingSignal, type InsertStockTradingSignal,
  type TrainingStrategy, type InsertTrainingStrategy, type PassiveIncomeStrategy, type InsertPassiveIncomeStrategy,
  type OliverVelezTechnique, type InsertOliverVelezTechnique, type ForexTradingLesson, type InsertForexTradingLesson
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Portfolio operations
  getPortfolioByUserId(userId: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio>;
  
  // Strategy operations
  getStrategiesByUserId(userId: number): Promise<Strategy[]>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, strategy: Partial<InsertStrategy>): Promise<Strategy>;
  deleteStrategy(id: number): Promise<void>;
  
  // DeFi Protocol operations
  getAllProtocols(): Promise<DefiProtocol[]>;
  getProtocolById(id: number): Promise<DefiProtocol | undefined>;
  createProtocol(protocol: InsertDefiProtocol): Promise<DefiProtocol>;
  
  // Exit Strategy operations
  getExitStrategiesByUserId(userId: number): Promise<ExitStrategy[]>;
  createExitStrategy(exitStrategy: InsertExitStrategy): Promise<ExitStrategy>;
  
  // Alert operations
  getAlertsByUserId(userId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert>;
  
  // Trading System operations
  getTradingSystemsByUserId(userId: number): Promise<TradingSystem[]>;
  createTradingSystem(system: InsertTradingSystem): Promise<TradingSystem>;
  updateTradingSystem(id: number, system: Partial<InsertTradingSystem>): Promise<TradingSystem>;
  
  // Trading Signal operations
  getTradingSignalsBySystemId(systemId: number): Promise<TradingSignal[]>;
  createRobinhoodTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  
  // Trading Position operations
  getTradingPositionsByUserId(userId: number): Promise<TradingPosition[]>;
  createTradingPosition(position: InsertTradingPosition): Promise<TradingPosition>;
  updateTradingPosition(id: number, position: Partial<InsertTradingPosition>): Promise<TradingPosition>;
  
  // Trading Performance operations
  getTradingPerformanceBySystemId(systemId: number): Promise<TradingPerformance[]>;
  createTradingPerformance(performance: InsertTradingPerformance): Promise<TradingPerformance>;
  
  // Course operations
  getAllCourses(): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Live Call operations
  getAllLiveCalls(): Promise<LiveCall[]>;
  createLiveCall(call: InsertLiveCall): Promise<LiveCall>;
  
  // Crypto Project operations
  getAllCryptoProjects(): Promise<CryptoProject[]>;
  getCryptoProjectById(id: number): Promise<CryptoProject | undefined>;
  createCryptoProject(project: InsertCryptoProject): Promise<CryptoProject>;
  
  // Launchpad operations
  getAllLaunchpads(): Promise<Launchpad[]>;
  getLaunchpadById(id: number): Promise<Launchpad | undefined>;
  createLaunchpad(launchpad: InsertLaunchpad): Promise<Launchpad>;
  
  // Yield Pool operations
  getAllYieldPools(): Promise<YieldPool[]>;
  getYieldPoolById(id: number): Promise<YieldPool | undefined>;
  createYieldPool(pool: InsertYieldPool): Promise<YieldPool>;
  
  // User Course Enrollment operations
  getUserCourseEnrollments(userId: number): Promise<UserCourseEnrollment[]>;
  createUserCourseEnrollment(enrollment: InsertUserCourseEnrollment): Promise<UserCourseEnrollment>;
  
  // User Investment operations
  getUserInvestments(userId: number): Promise<UserInvestment[]>;
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;

  // 30SecondTrader operations
  getStockAlerts(): Promise<StockAlert[]>;
  createStockAlert(alert: InsertStockAlert): Promise<StockAlert>;
  getStockNews(): Promise<StockNews[]>;
  createStockNews(news: InsertStockNews): Promise<StockNews>;
  getMarketOverview(): Promise<MarketOverview[]>;
  createMarketOverview(overview: InsertMarketOverview): Promise<MarketOverview>;
  getStockTradingSignals(): Promise<StockTradingSignal[]>;
  createStockTradingSignal(signal: InsertStockTradingSignal): Promise<StockTradingSignal>;

  // Training Strategy operations
  getAllTrainingStrategies(): Promise<TrainingStrategy[]>;
  getTrainingStrategyById(strategyId: string): Promise<TrainingStrategy | undefined>;
  createTrainingStrategy(strategy: InsertTrainingStrategy): Promise<TrainingStrategy>;
  
  // Passive Income Strategy operations
  getAllPassiveIncomeStrategies(): Promise<PassiveIncomeStrategy[]>;
  getPassiveIncomeStrategyById(id: number): Promise<PassiveIncomeStrategy | undefined>;
  createPassiveIncomeStrategy(strategy: InsertPassiveIncomeStrategy): Promise<PassiveIncomeStrategy>;
  
  // Oliver Velez Technique operations
  getAllOliverVelezTechniques(): Promise<OliverVelezTechnique[]>;
  getOliverVelezTechniqueById(techniqueId: string): Promise<OliverVelezTechnique | undefined>;
  createOliverVelezTechnique(technique: InsertOliverVelezTechnique): Promise<OliverVelezTechnique>;
  
  // Forex Trading Lesson operations
  getAllForexTradingLessons(): Promise<ForexTradingLesson[]>;
  getForexTradingLessonById(lessonId: string): Promise<ForexTradingLesson | undefined>;
  createForexTradingLesson(lesson: InsertForexTradingLesson): Promise<ForexTradingLesson>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Portfolio operations
  async getPortfolioByUserId(userId: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
    return portfolio || undefined;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db
      .insert(portfolios)
      .values(portfolio)
      .returning();
    return newPortfolio;
  }

  async updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio> {
    const [updatedPortfolio] = await db
      .update(portfolios)
      .set(portfolio)
      .where(eq(portfolios.id, id))
      .returning();
    return updatedPortfolio;
  }

  // Strategy operations
  async getStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return await db.select().from(strategies).where(eq(strategies.userId, userId));
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [newStrategy] = await db
      .insert(strategies)
      .values(strategy)
      .returning();
    return newStrategy;
  }

  async updateStrategy(id: number, strategy: Partial<InsertStrategy>): Promise<Strategy> {
    const [updatedStrategy] = await db
      .update(strategies)
      .set(strategy)
      .where(eq(strategies.id, id))
      .returning();
    return updatedStrategy;
  }

  async deleteStrategy(id: number): Promise<void> {
    await db.delete(strategies).where(eq(strategies.id, id));
  }

  // DeFi Protocol operations
  async getAllProtocols(): Promise<DefiProtocol[]> {
    return await db.select().from(defiProtocols);
  }

  async getProtocolById(id: number): Promise<DefiProtocol | undefined> {
    const [protocol] = await db.select().from(defiProtocols).where(eq(defiProtocols.id, id));
    return protocol || undefined;
  }

  async createProtocol(protocol: InsertDefiProtocol): Promise<DefiProtocol> {
    const [newProtocol] = await db
      .insert(defiProtocols)
      .values(protocol)
      .returning();
    return newProtocol;
  }

  // Exit Strategy operations
  async getExitStrategiesByUserId(userId: number): Promise<ExitStrategy[]> {
    return await db.select().from(exitStrategies).where(eq(exitStrategies.userId, userId));
  }

  async createExitStrategy(exitStrategy: InsertExitStrategy): Promise<ExitStrategy> {
    const [newExitStrategy] = await db
      .insert(exitStrategies)
      .values(exitStrategy)
      .returning();
    return newExitStrategy;
  }

  // Alert operations
  async getAlertsByUserId(userId: number): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.userId, userId));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(alert)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  // Trading System operations
  async getTradingSystemsByUserId(userId: number): Promise<TradingSystem[]> {
    return await db.select().from(tradingSystems).where(eq(tradingSystems.userId, userId));
  }

  async createTradingSystem(system: InsertTradingSystem): Promise<TradingSystem> {
    const [newSystem] = await db
      .insert(tradingSystems)
      .values(system)
      .returning();
    return newSystem;
  }

  async updateTradingSystem(id: number, system: Partial<InsertTradingSystem>): Promise<TradingSystem> {
    const [updatedSystem] = await db
      .update(tradingSystems)
      .set(system)
      .where(eq(tradingSystems.id, id))
      .returning();
    return updatedSystem;
  }

  // Trading Signal operations
  async getTradingSignalsBySystemId(systemId: number): Promise<TradingSignal[]> {
    return await db.select().from(tradingSignals).where(eq(tradingSignals.systemId, systemId));
  }

  async createRobinhoodTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [newSignal] = await db
      .insert(tradingSignals)
      .values(signal)
      .returning();
    return newSignal;
  }

  // Trading Position operations
  async getTradingPositionsByUserId(userId: number): Promise<TradingPosition[]> {
    return await db.select().from(tradingPositions).where(eq(tradingPositions.userId, userId));
  }

  async createTradingPosition(position: InsertTradingPosition): Promise<TradingPosition> {
    const [newPosition] = await db
      .insert(tradingPositions)
      .values(position)
      .returning();
    return newPosition;
  }

  async updateTradingPosition(id: number, position: Partial<InsertTradingPosition>): Promise<TradingPosition> {
    const [updatedPosition] = await db
      .update(tradingPositions)
      .set(position)
      .where(eq(tradingPositions.id, id))
      .returning();
    return updatedPosition;
  }

  // Trading Performance operations
  async getTradingPerformanceBySystemId(systemId: number): Promise<TradingPerformance[]> {
    return await db.select().from(tradingPerformance).where(eq(tradingPerformance.systemId, systemId));
  }

  async createTradingPerformance(performance: InsertTradingPerformance): Promise<TradingPerformance> {
    const [newPerformance] = await db
      .insert(tradingPerformance)
      .values(performance)
      .returning();
    return newPerformance;
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [result] = await db
      .insert(courses)
      .values(course)
      .returning();
    return result;
  }

  // Live Call operations
  async getAllLiveCalls(): Promise<LiveCall[]> {
    return await db.select().from(liveCalls);
  }

  async createLiveCall(call: InsertLiveCall): Promise<LiveCall> {
    const [result] = await db
      .insert(liveCalls)
      .values(call)
      .returning();
    return result;
  }

  // Crypto Project operations
  async getAllCryptoProjects(): Promise<CryptoProject[]> {
    return await db.select().from(cryptoProjects);
  }

  async getCryptoProjectById(id: number): Promise<CryptoProject | undefined> {
    const [project] = await db.select().from(cryptoProjects).where(eq(cryptoProjects.id, id));
    return project;
  }

  async createCryptoProject(project: InsertCryptoProject): Promise<CryptoProject> {
    const [result] = await db
      .insert(cryptoProjects)
      .values(project)
      .returning();
    return result;
  }

  // Launchpad operations
  async getAllLaunchpads(): Promise<Launchpad[]> {
    return await db.select().from(launchpads);
  }

  async getLaunchpadById(id: number): Promise<Launchpad | undefined> {
    const [launchpad] = await db.select().from(launchpads).where(eq(launchpads.id, id));
    return launchpad;
  }

  async createLaunchpad(launchpad: InsertLaunchpad): Promise<Launchpad> {
    const [result] = await db
      .insert(launchpads)
      .values(launchpad)
      .returning();
    return result;
  }

  // Yield Pool operations
  async getAllYieldPools(): Promise<YieldPool[]> {
    return await db.select().from(yieldPools);
  }

  async getYieldPoolById(id: number): Promise<YieldPool | undefined> {
    const [pool] = await db.select().from(yieldPools).where(eq(yieldPools.id, id));
    return pool;
  }

  async createYieldPool(pool: InsertYieldPool): Promise<YieldPool> {
    const [result] = await db
      .insert(yieldPools)
      .values(pool)
      .returning();
    return result;
  }

  // User Course Enrollment operations
  async getUserCourseEnrollments(userId: number): Promise<UserCourseEnrollment[]> {
    return await db.select().from(userCourseEnrollments).where(eq(userCourseEnrollments.userId, userId));
  }

  async createUserCourseEnrollment(enrollment: InsertUserCourseEnrollment): Promise<UserCourseEnrollment> {
    const [result] = await db
      .insert(userCourseEnrollments)
      .values(enrollment)
      .returning();
    return result;
  }

  // User Investment operations
  async getUserInvestments(userId: number): Promise<UserInvestment[]> {
    return await db.select().from(userInvestments).where(eq(userInvestments.userId, userId));
  }

  async createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment> {
    const [result] = await db
      .insert(userInvestments)
      .values(investment)
      .returning();
    return result;
  }

  // 30SecondTrader operations
  async getStockAlerts(): Promise<StockAlert[]> {
    return await db.select().from(stockAlerts).orderBy(stockAlerts.createdAt);
  }

  async createStockAlert(alert: InsertStockAlert): Promise<StockAlert> {
    const [result] = await db
      .insert(stockAlerts)
      .values(alert)
      .returning();
    return result;
  }

  async getStockNews(): Promise<StockNews[]> {
    return await db.select().from(stockNews).orderBy(stockNews.publishedAt);
  }

  async createStockNews(news: InsertStockNews): Promise<StockNews> {
    const [result] = await db
      .insert(stockNews)
      .values(news)
      .returning();
    return result;
  }

  async getMarketOverview(): Promise<MarketOverview[]> {
    return await db.select().from(marketOverview).orderBy(marketOverview.lastUpdated);
  }

  async createMarketOverview(overview: InsertMarketOverview): Promise<MarketOverview> {
    const [result] = await db
      .insert(marketOverview)
      .values(overview)
      .returning();
    return result;
  }

  async getStockTradingSignals(): Promise<StockTradingSignal[]> {
    return await db.select().from(stockTradingSignals).where(eq(stockTradingSignals.isActive, true)).orderBy(stockTradingSignals.createdAt);
  }

  async createStockTradingSignal(signal: InsertStockTradingSignal): Promise<StockTradingSignal> {
    const [result] = await db
      .insert(stockTradingSignals)
      .values(signal)
      .returning();
    return result;
  }

  // Training Strategy operations
  async getAllTrainingStrategies(): Promise<TrainingStrategy[]> {
    return await db.select().from(trainingStrategies).orderBy(trainingStrategies.orderIndex);
  }

  async getTrainingStrategyById(strategyId: string): Promise<TrainingStrategy | undefined> {
    const [strategy] = await db.select().from(trainingStrategies).where(eq(trainingStrategies.strategyId, strategyId));
    return strategy;
  }

  async createTrainingStrategy(strategy: InsertTrainingStrategy): Promise<TrainingStrategy> {
    const [result] = await db
      .insert(trainingStrategies)
      .values(strategy)
      .returning();
    return result;
  }

  // Passive Income Strategy operations
  async getAllPassiveIncomeStrategies(): Promise<PassiveIncomeStrategy[]> {
    return await db.select().from(passiveIncomeStrategies).orderBy(passiveIncomeStrategies.title);
  }

  async getPassiveIncomeStrategyById(id: number): Promise<PassiveIncomeStrategy | undefined> {
    const [strategy] = await db.select().from(passiveIncomeStrategies).where(eq(passiveIncomeStrategies.id, id));
    return strategy;
  }

  async createPassiveIncomeStrategy(strategy: InsertPassiveIncomeStrategy): Promise<PassiveIncomeStrategy> {
    const [result] = await db
      .insert(passiveIncomeStrategies)
      .values(strategy)
      .returning();
    return result;
  }

  // Oliver Velez Technique operations
  async getAllOliverVelezTechniques(): Promise<OliverVelezTechnique[]> {
    return await db.select().from(oliverVelezTechniques).orderBy(oliverVelezTechniques.techniqueId);
  }

  async getOliverVelezTechniqueById(techniqueId: string): Promise<OliverVelezTechnique | undefined> {
    const [technique] = await db.select().from(oliverVelezTechniques).where(eq(oliverVelezTechniques.techniqueId, techniqueId));
    return technique;
  }

  async createOliverVelezTechnique(technique: InsertOliverVelezTechnique): Promise<OliverVelezTechnique> {
    const [result] = await db
      .insert(oliverVelezTechniques)
      .values(technique)
      .returning();
    return result;
  }

  // Forex Trading Lesson operations
  async getAllForexTradingLessons(): Promise<ForexTradingLesson[]> {
    return await db.select().from(forexTradingLessons).orderBy(forexTradingLessons.lessonId);
  }

  async getForexTradingLessonById(lessonId: string): Promise<ForexTradingLesson | undefined> {
    const [lesson] = await db.select().from(forexTradingLessons).where(eq(forexTradingLessons.lessonId, lessonId));
    return lesson;
  }

  async createForexTradingLesson(lesson: InsertForexTradingLesson): Promise<ForexTradingLesson> {
    const [result] = await db
      .insert(forexTradingLessons)
      .values(lesson)
      .returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
