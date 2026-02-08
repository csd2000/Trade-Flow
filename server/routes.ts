import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { seedDatabase } from "./seed";
import { seedDannySapioStrategy } from "./danny-sapio-seeder";
import { registerEnhancedRoutes } from "./enhanced-routes";
import { registerEnhancedTrainingRoutes } from "./enhanced-training-routes";
import { dbSeeder } from "./db-seeder";
import registerTrainingSystemRoutes from "./training-system-routes";
import aiProfitStudioRoutes from "./ai-profit-studio-routes";
import multiModalRoutes from "./multimodal-routes";
import ttsRoutes from "./tts-routes";
import marketIntelligenceRoutes from "./market-intelligence-routes";
import searchRoutes from "./search-service";
import alertRoutes from "./alert-service";
import confluenceRoutes from "./hf-confluence-service";
import strategyV2Routes from "./strategy-v2-routes";
import sevenGateRoutes from "./seven-gate-routes";
import predictiveRoutes from "./predictive-routes";
import aiTradingAssistantRoutes from "./ai-trading-assistant-routes";
import finnhubFallbackRoutes from "./finnhub-fallback";
import tiingoFallbackRoutes from "./tiingo-fallback";
import alpacaL2Routes from "./alpaca-l2-stream";
import aiTradingPlanRoutes from "./ai-trading-plan-routes";
import enhancedStrategyRoutes from "./enhanced-trading-strategy-routes";
import universalForecasterRoutes from "./universal-forecaster-routes";
import supplyDemandRoutes from "./supply-demand-routes";
import customAlertRoutes from "./custom-alert-routes";
import liquidityAgentRoutes from "./liquidity-agent-routes";
import strongTrendRoutes from "./strong-trend-routes";
import maFibonacciRoutes from "./ma-fibonacci-routes";
import centralScannerRoutes from "./central-scanner-routes";
import institutionalAnalysisRoutes from "./institutional-analysis-routes";
import userPreferencesRoutes from "./user-preferences-routes";
import { newsMonitoringService } from "./news-monitoring-service";
import signalFusionRoutes from "./signal-fusion-routes";
import hfcAdvisorRoutes from "./hfc-advisor-routes";
import hedgeFundScannerRoutes from "./hedge-fund-scanner";
import {
  insertUserSchema,
  insertPortfolioSchema,
  insertStrategySchema,
  insertProtocolSchema,
  insertExitStrategySchema,
  insertAlertSchema,
  insertTradingSystemSchema,
  insertTradingSignalSchema,
  insertTradingPositionSchema,
  insertTradingPerformanceSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Note: seedDatabase is called in index.ts with retry logic, skip here
  
  // Seed enhanced training database
  try {
    const isSeeded = await dbSeeder.checkIfSeeded();
    if (!isSeeded) {
      await dbSeeder.seedTrainingStrategies();
    }
  } catch (error) {
    console.log('⚠️ Enhanced training seeding skipped - tables may not be ready yet');
  }
  
  // Register enhanced training routes
  registerEnhancedRoutes(app);
  
  // Register enhanced training content routes (detailed trading techniques)
  registerEnhancedTrainingRoutes(app);

  // Register User Preferences routes (Skill Level System)
  app.use('/api/user', userPreferencesRoutes);
  console.log('✅ User Preferences routes registered (Skill Level System)');

  // Register AI Profit Studio routes
  app.use('/api/ai-profit', aiProfitStudioRoutes);
  console.log('✅ AI Profit Studio routes registered');
  
  // Register Multi-Modal Pipeline routes
  app.use('/api/multimodal', multiModalRoutes);
  console.log('✅ Multi-Modal Data Pipeline routes registered');
  
  // Register Text-to-Speech routes
  app.use('/api/tts', ttsRoutes);
  console.log('✅ Text-to-Speech routes registered (ElevenLabs)');
  
  // Register Market Intelligence routes
  app.use('/api/market-intelligence', marketIntelligenceRoutes);
  console.log('✅ Market Intelligence routes registered');
  
  // Register Global Search routes
  app.use('/api/search', searchRoutes);
  console.log('✅ Global Search routes registered');
  
  // Register Alert Service routes
  app.use('/api/alerts', alertRoutes);
  console.log('✅ Alert Service routes registered (Email + Telegram)');
  
  // Register HF Confluence Scanner routes (EMA/MACD/Candle Color system)
  app.use('/api/confluence', confluenceRoutes);
  console.log('✅ HF Confluence Scanner routes registered (EMA 9/21/200 + MACD + Macro)');
  
  // Register Strategy Engine V2 routes (real-time price action with weighted scoring)
  app.use('/api/strategy-v2', strategyV2Routes);
  console.log('✅ Strategy Engine V2 routes registered (Real-time + Weighted Scoring + Multi-TF)');
  
  // Register 7-Gate ORB System routes (NewsData.io + Opening Range Breakout)
  app.use('/api/seven-gate', sevenGateRoutes);
  console.log('✅ 7-Gate ORB System routes registered');
  
  // Register Predictive Signal Engine routes (Neural Index, AI MAs, Double Confirmation)
  app.use('/api/predictive', predictiveRoutes);
  console.log('✅ Predictive Signal Engine routes registered (Neural Index + Double Confirmation)');
  
  // Register AI Trading Assistant routes (Personalized Strategy Recommendations)
  app.use('/api/ai-assistant', aiTradingAssistantRoutes);
  console.log('✅ AI Trading Assistant routes registered (Risk Profile + Strategy Matching)');
  
  // Register Finnhub Fallback routes (backup data source when primary APIs fail)
  app.use('/api/finnhub', finnhubFallbackRoutes);
  console.log('✅ Finnhub Fallback routes registered (Backup Data Source)');
  
  // Register Tiingo Fallback routes (tertiary data source)
  app.use('/api/tiingo', tiingoFallbackRoutes);
  console.log('✅ Tiingo Fallback routes registered (Tertiary Data Source)');
  
  // Register Alpaca L2 Order Book Stream routes (Gate 8 OBI Pressure)
  app.use('/api/orderbook', alpacaL2Routes);
  console.log('✅ Alpaca L2 Order Book routes registered (Gate 8 OBI Pressure)');
  
  // Register AI Trading Plan routes (Portfolio Tracker + AI Advisor)
  app.use('/api/trading-plan', aiTradingPlanRoutes);
  console.log('✅ AI Trading Plan routes registered (Portfolio + AI Advisor)');

  // Register Enhanced Trading Strategy routes (Multi-Factor Confluence System)
  app.use('/api/enhanced-strategy', enhancedStrategyRoutes);
  console.log('✅ Enhanced Trading Strategy routes registered (Multi-Factor Confluence System)');
  
  // Register Universal AI Forecaster routes (Multi-Asset Predictions + Alerts)
  app.use('/api/forecaster', universalForecasterRoutes);
  app.use('/api/supply-demand', supplyDemandRoutes);
  console.log('✅ Universal AI Forecaster routes registered (Multi-Asset + Alerts)');
  
  // Register Custom Alert System routes (User-Defined Technical Indicators + Price Levels)
  app.use('/api/custom-alerts', customAlertRoutes);
  console.log('✅ Custom Alert System routes registered (Price + Technical Indicators)');
  
  // Register Autonomous Liquidity Sweep Agent routes (Python/CCXT integration)
  app.use('/api/liquidity-agent', liquidityAgentRoutes);
  console.log('✅ Liquidity Sweep Agent routes registered (Python/CCXT + Gate 1 Verification)');
  
  // Register Strong Trend Detection Engine routes (Real-time global data analysis)
  app.use('/api/strong-trend', strongTrendRoutes);
  console.log('✅ Strong Trend Engine routes registered (Real-time Global Trend Detection)');
  
  // Register MA + Fibonacci Strategy Scanner routes (Best Trend Strategy)
  app.use('/api/ma-fibonacci', maFibonacciRoutes);
  console.log('✅ MA + Fibonacci Scanner routes registered (Moving Averages + Fibonacci Confluence)');
  
  // Register Rule Based Scanner routes (Multi-Source Rule-Based Scanner)
  app.use('/api/central-scanner', centralScannerRoutes);
  console.log('✅ Rule Based Scanner routes registered (Gate Sets + Liquidity Sweep + Rule Engine)');
  
  // Register Institutional Analysis System routes (Unified hedge fund, market maker, institutional flow)
  app.use('/api/institutional-analysis', institutionalAnalysisRoutes);
  console.log('✅ Institutional Analysis System routes registered (Unified HF/MM/Institutional Flow)');
  
  // Register Signal Fusion AI routes (Multi-Source Analysis System)
  app.use('/api/signal-fusion', signalFusionRoutes);
  console.log('✅ Signal Fusion AI routes registered (Technical + Sentiment + On-Chain + News Streams)');
  
  app.use('/api/hfc-advisor', hfcAdvisorRoutes);
  app.use('/api/hedge-fund', hedgeFundScannerRoutes);
  console.log('✅ HFC Advisor Chatbot routes registered (AI Trading Assistant)');
  
  // Skip direct training routes to prioritize database routes
  // Direct routes were causing conflicts with database API routes
  console.log("⚠️ Direct training routes skipped to prioritize database API routes");
  
  // Admin seeding route
  app.post('/api/admin/seed', async (req, res) => {
    try {
      const { trainingSeeder } = await import('./admin-seed');
      await trainingSeeder.seedAllTrainingContent();
      res.json({ success: true, message: 'Training content seeded successfully' });
    } catch (error: any) {
      console.error('Seeding error:', error);
      res.status(500).json({ error: 'Seeding failed', message: error?.message });
    }
  });

  // Danny Sapio strategy seeder
  app.post('/api/admin/seed-robinhood', async (req, res) => {
    try {
      await seedDannySapioStrategy();
      res.json({ success: true, message: "Danny Sapio's Robinhood strategy seeded successfully" });
    } catch (error: any) {
      console.error('Error seeding Danny Sapio strategy:', error);
      res.status(500).json({ error: 'Failed to seed Danny Sapio strategy', message: error?.message });
    }
  });

  // Complete Robinhood strategy seeder
  app.post('/api/admin/seed-robinhood-complete', async (req, res) => {
    try {
      const { seedCompleteRobinhoodStrategy } = await import('./complete-robinhood-seeder');
      await seedCompleteRobinhoodStrategy();
      res.json({ success: true, message: "Complete Robinhood strategy seeded successfully" });
    } catch (error: any) {
      console.error('Error seeding complete Robinhood strategy:', error);
      res.status(500).json({ error: 'Failed to seed complete Robinhood strategy', message: error?.message });
    }
  });

  // Enhanced trading techniques seeder - sync mode (updates existing)
  app.post('/api/admin/seed-enhanced-techniques', async (req, res) => {
    try {
      const { syncEnhancedContentToDatabase } = await import('./enhanced-content-seeder');
      const result = await syncEnhancedContentToDatabase();
      res.json({ 
        success: true, 
        message: `Enhanced techniques synced: ${result.strategiesUpdated} strategies with detailed trading content`,
        data: result
      });
    } catch (error: any) {
      console.error('Error syncing enhanced techniques:', error);
      res.status(500).json({ error: 'Failed to sync enhanced techniques', message: error?.message });
    }
  });

  // Enhanced trading techniques seeder - full rebuild mode
  app.post('/api/admin/rebuild-enhanced-techniques', async (req, res) => {
    try {
      const { seedEnhancedStrategiesFromScratch } = await import('./enhanced-content-seeder');
      const result = await seedEnhancedStrategiesFromScratch();
      res.json({ 
        success: true, 
        message: `Enhanced techniques rebuilt: ${result.strategiesSeeded} strategies with detailed trading content`,
        data: result
      });
    } catch (error: any) {
      console.error('Error rebuilding enhanced techniques:', error);
      res.status(500).json({ error: 'Failed to rebuild enhanced techniques', message: error?.message });
    }
  });

  // Build all strategy content
  app.post('/api/admin/build-all-content', async (req, res) => {
    try {
      const { buildAllStrategyContent } = await import('./complete-content-builder');
      const result = await buildAllStrategyContent();
      res.json({ 
        success: true, 
        message: `Built ${result.modulesBuilt} modules across ${result.strategiesBuilt} strategies`,
        data: result
      });
    } catch (error: any) {
      console.error('Error building all strategy content:', error);
      res.status(500).json({ error: 'Failed to build all strategy content', message: error?.message });
    }
  });

  // Master content builder - All 24 strategies with 192 modules
  app.post('/api/admin/build-master-content', async (req, res) => {
    try {
      const { buildAllMasterContent } = await import('./master-content-builder');
      const result = await buildAllMasterContent();
      res.json({ 
        success: true, 
        message: `MASTER BUILD: ${result.totalModulesBuilt} modules across ${result.strategiesBuilt} strategies - ${result.progress}`,
        data: result
      });
    } catch (error: any) {
      console.error('Error building master content:', error);
      res.status(500).json({ error: 'Failed to build master content', message: error?.message });
    }
  });

  // Comprehensive strategy builder - First 5 strategies with full content
  app.post('/api/admin/build-comprehensive', async (req, res) => {
    try {
      const { buildComprehensiveStrategies } = await import('./comprehensive-strategy-builder');
      const result = await buildComprehensiveStrategies();
      res.json({ 
        success: true, 
        message: `COMPREHENSIVE BUILD: ${result.totalModulesBuilt}/${result.targetModules} modules (${result.strategiesBuilt}/${result.targetStrategies} strategies) - ${result.progress}`,
        data: result
      });
    } catch (error: any) {
      console.error('Error building comprehensive content:', error);
      res.status(500).json({ error: 'Failed to build comprehensive content', message: error?.message });
    }
  });

  // Final comprehensive builder - Complete 5 strategies with full professional content  
  app.post('/api/admin/build-final-comprehensive', async (req, res) => {
    try {
      const { buildFinalComprehensiveContent } = await import('./final-comprehensive-builder');
      const result = await buildFinalComprehensiveContent();
      res.json({ 
        success: true, 
        message: `FINAL BUILD COMPLETE: ${result.totalModulesBuilt}/${result.targetModules} modules (${result.strategiesBuilt}/${result.targetStrategies} strategies) - ${result.progress}`,
        data: result
      });
    } catch (error: any) {
      console.error('Error building final comprehensive content:', error);
      res.status(500).json({ error: 'Failed to build final comprehensive content', message: error?.message });
    }
  });

  // Build comprehensive step-by-step instructions for all 192 modules
  app.post('/api/admin/build-step-by-step', async (req, res) => {
    try {
      const { completeStepByStepBuilder } = await import('./complete-step-by-step-builder');
      const result = await completeStepByStepBuilder.buildAllStepByStepContent();
      res.json({ 
        success: true, 
        message: `STEP-BY-STEP BUILD COMPLETE: Enhanced ${result.modulesEnhanced} modules across ${result.strategiesProcessed} strategies with ${result.totalSteps} total step-by-step instructions`,
        data: result
      });
    } catch (error: any) {
      console.error('Error building step-by-step content:', error);
      res.status(500).json({ error: 'Failed to build step-by-step content', message: error?.message });
    }
  });

  // Validate step-by-step content across all modules
  app.get('/api/admin/validate-step-by-step', async (req, res) => {
    try {
      const { completeStepByStepBuilder } = await import('./complete-step-by-step-builder');
      const result = await completeStepByStepBuilder.validateStepByStepContent();
      res.json({ 
        success: true, 
        message: `Validation complete: ${result.modulesWithSteps}/${result.totalModules} modules have proper step-by-step instructions`,
        data: result
      });
    } catch (error: any) {
      console.error('Error validating step-by-step content:', error);
      res.status(500).json({ error: 'Failed to validate step-by-step content', message: error?.message });
    }
  });

  // Generate comprehensive step-by-step report
  app.get('/api/admin/step-by-step-report', async (req, res) => {
    try {
      const { completeStepByStepBuilder } = await import('./complete-step-by-step-builder');
      const report = await completeStepByStepBuilder.generateStepByStepReport();
      res.type('text/plain').send(report);
    } catch (error: any) {
      console.error('Error generating step-by-step report:', error);
      res.status(500).json({ error: 'Failed to generate step-by-step report', message: error?.message });
    }
  });
  
  // Register training API routes (works with database)
  try {
    const { registerTrainingApiRoutes } = await import('./training-api-routes');
    registerTrainingApiRoutes(app);
    console.log("✅ Database training API routes registered");
  } catch (error) {
    console.log("⚠️ Training API routes failed:", error);
  }
  
  // Register Time Series AI routes
  try {
    const { registerTimeSeriesRoutes } = await import('./timeseries-routes');
    registerTimeSeriesRoutes(app);
    console.log("✅ Time Series AI routes registered");
  } catch (error) {
    console.log("⚠️ Time Series AI routes failed:", error);
  }
  
  // Register Real-Time Market Data routes
  try {
    const { registerRealTimeRoutes } = await import('./realtime-routes');
    registerRealTimeRoutes(app);
    console.log("✅ Real-Time Market Data routes registered");
  } catch (error) {
    console.log("⚠️ Real-Time Market Data routes failed:", error);
  }
  
  // Register LIVE Market Data routes (WebSocket-backed, truly real-time)
  try {
    const liveMarketRoutes = await import('./live-market-routes');
    app.use('/api/live', liveMarketRoutes.default);
    console.log("✅ LIVE Market Data routes registered (Binance WebSocket + Yahoo Finance)");
  } catch (error) {
    console.log("⚠️ LIVE Market Data routes failed:", error);
  }
  
  // Register Quantitative AI Trading routes
  try {
    const quantRoutes = await import('./quant-routes');
    app.use('/api/quant', quantRoutes.default);
    console.log("✅ Quantitative AI Trading routes registered");
  } catch (error) {
    console.log("⚠️ Quantitative AI Trading routes failed:", error);
  }
  
  // Register Command Center routes (Whale Alerts, News, AI Analysis)
  try {
    const commandCenterRoutes = await import('./command-center-routes');
    app.use('/api/command-center', commandCenterRoutes.default);
    console.log("✅ Command Center routes registered (Whale Stream, News, AI Analyst)");
  } catch (error) {
    console.log("⚠️ Command Center routes failed:", error);
  }
  
  // Register High-Frequency Scanner routes (5:1 Risk/Reward Algorithm)
  try {
    const hfScannerRoutes = await import('./hf-scanner-routes');
    app.use('/api/scanner', hfScannerRoutes.default);
    console.log("✅ High-Frequency Scanner routes registered (5:1 R/R Algorithm)");
  } catch (error) {
    console.log("⚠️ High-Frequency Scanner routes failed:", error);
  }

  // Register Futures Trading routes (Gold & Silver)
  try {
    const futuresRoutes = await import('./futures-routes');
    app.use('/api/futures', futuresRoutes.default);
    console.log("✅ Futures Trading routes registered (Gold & Silver)");
  } catch (error) {
    console.log("⚠️ Futures Trading routes failed:", error);
  }

  // Register Intermarket Analysis routes
  try {
    const intermarketRoutes = await import('./intermarket-routes');
    app.use('/api/intermarket', intermarketRoutes.default);
    console.log("✅ Intermarket Analysis routes registered (Cross-Asset Correlations)");
  } catch (error) {
    console.log("⚠️ Intermarket Analysis routes failed:", error);
  }

  // Register Stock Research Live Assistant routes
  try {
    const stockResearchRoutes = await import('./stock-research-routes');
    app.use('/api/stock-research', stockResearchRoutes.default);
    console.log("✅ Stock Research Live Assistant routes registered (AI-Powered Analysis)");
  } catch (error) {
    console.log("⚠️ Stock Research routes failed:", error);
  }

  // Register Income Machine routes (Options Scanner)
  try {
    const incomeMachineRoutes = await import('./income-machine-routes');
    app.use('/api/income-machine', incomeMachineRoutes.default);
    console.log("✅ Income Machine routes registered (Options Scanner)");
  } catch (error) {
    console.log("⚠️ Income Machine routes failed:", error);
  }

  // Register Institutional Data routes (Bloomberg/Refinitiv-style)
  try {
    const institutionalDataRoutes = await import('./institutional-data-routes');
    app.use('/api/institutional', institutionalDataRoutes.default);
    console.log("✅ Institutional Data routes registered (Multi-Source Aggregation)");
  } catch (error) {
    console.log("⚠️ Institutional Data routes failed:", error);
  }

  // Register Reversal Detection routes (Divergence + Sentiment + AI)
  try {
    const reversalRoutes = await import('./reversal-routes');
    app.use('/api/reversal', reversalRoutes.default);
    console.log("✅ Reversal Detection routes registered (Divergence + Sentiment + AI)");
  } catch (error) {
    console.log("⚠️ Reversal Detection routes failed:", error);
  }

  // Register High-Frequency Scalping routes (1m/5m Real-Time)
  try {
    const scalpingRoutes = await import('./scalping-routes');
    app.use('/api/scalping', scalpingRoutes.default);
    console.log("✅ HF Scalping Strategist routes registered (1m/5m Real-Time)");
  } catch (error) {
    console.log("⚠️ HF Scalping routes failed:", error);
  }

  // Register Secret Sauce Strategy routes (ICC + FVG-Fill + ORB + 5-Gate)
  try {
    const secretSauceRoutes = await import('./secret-sauce-routes');
    app.use('/api/secret-sauce', secretSauceRoutes.default);
    console.log("✅ Secret Sauce Strategy routes registered (ICC + FVG-Fill + ORB + 5-Gate Confluence)");
  } catch (error) {
    console.log("⚠️ Secret Sauce Strategy routes failed:", error);
  }

  // Register Previous Day High/Low Strategy routes
  try {
    const previousDayRoutes = await import('./previous-day-routes');
    app.use('/api/previous-day', previousDayRoutes.default);
    console.log("✅ Previous Day High/Low Strategy routes registered (57% Win Rate, 2.53 Profit Factor)");
  } catch (error) {
    console.log("⚠️ Previous Day Strategy routes failed:", error);
  }

  // Register First Candle Strategy (Opening Range Breakout) routes
  try {
    const firstCandleRoutes = await import('./first-candle-routes');
    app.use('/api/first-candle', firstCandleRoutes.default);
    console.log("✅ First Candle Strategy (ORB) routes registered (58% Win Rate)");
  } catch (error) {
    console.log("⚠️ First Candle Strategy routes failed:", error);
  }

  // Register Pre-Market Strategy routes
  try {
    const premarketRoutes = await import('./premarket-routes');
    app.use('/api/premarket', premarketRoutes.default);
    console.log("✅ Pre-Market Strategy routes registered (Low-Risk, High-Probability Institutional Setups)");
  } catch (error) {
    console.log("⚠️ Pre-Market Strategy routes failed:", error);
  }

  // Register Dark Pool AI routes (Institutional Trade Detection)
  try {
    const darkPoolRoutes = await import('./dark-pool-routes');
    app.use('/api/dark-pool', darkPoolRoutes.default);
    console.log("✅ Dark Pool AI routes registered (Institutional Trade Detection)");
  } catch (error) {
    console.log("⚠️ Dark Pool AI routes failed:", error);
  }

  // Register Trading Execution routes (Direct Order Execution)
  try {
    const tradingRoutes = await import('./trading-routes');
    app.use('/api/trading', tradingRoutes.default);
    console.log("✅ Trading Execution routes registered (Binance, Alpaca, OANDA, Coinbase)");
  } catch (error) {
    console.log("⚠️ Trading Execution routes failed:", error);
  }

  // Register Automated Trading Rules routes (Fully Automated Rule-Based Trading)
  try {
    const automationRoutes = await import('./automation-routes');
    app.use('/api/automation', automationRoutes.default);
    console.log("✅ Automated Trading Rules routes registered (Rule Engine + Auto Execution)");
  } catch (error) {
    console.log("⚠️ Automated Trading routes failed:", error);
  }

  // Register 7-Gate Trading Bot routes (Autonomous Sweep-First Trading)
  try {
    const sevenGateBotRoutes = await import('./seven-gate-bot-routes');
    app.use('/api/seven-gate-bot', sevenGateBotRoutes.default);
    console.log("✅ 7-Gate Trading Bot routes registered (Sweep-First + Bracket Orders + Heartbeat)");
  } catch (error) {
    console.log("⚠️ 7-Gate Trading Bot routes failed:", error);
  }

  // Register HFC Apex Engine routes (8-Gate Institutional Options System)
  try {
    const hfcApexRoutes = await import('./hfc-apex-routes');
    app.use('/api/hfc-apex', hfcApexRoutes.default);
    console.log("✅ HFC Apex Engine routes registered (8-Gate Institutional Options + OBI Pressure)");
  } catch (error) {
    console.log("⚠️ HFC Apex Engine routes failed:", error);
  }

  // Register Whale Shield routes (Max Pain + PCR + Sweep Verification)
  try {
    const whaleShieldRoutes = await import('./whale-shield-routes');
    app.use('/api/whale-shield', whaleShieldRoutes.default);
    console.log("✅ Whale Shield routes registered (Max Pain + PCR Sentiment + Sweep Verification)");
  } catch (error) {
    console.log("⚠️ Whale Shield routes failed:", error);
  }

  // Register Stink Bid Calculator routes (7-Gate System + Stink Bid Calculator)
  try {
    const sniperRoutes = await import('./sniper-routes');
    app.use('/api/sniper', sniperRoutes.default);
    console.log("✅ Stink Bid Calculator routes registered (7-Gate System + Stink Bid Calculator)");
  } catch (error) {
    console.log("⚠️ Stink Bid Calculator routes failed:", error);
  }

  // Register Daily Checklist routes (Asset-Specific Data)
  try {
    const checklistRoutes = await import('./checklist-routes');
    app.use('/api/checklist', checklistRoutes.default);
    console.log("✅ Daily Checklist routes registered (Asset-Specific Data)");
  } catch (error) {
    console.log("⚠️ Daily Checklist routes failed:", error);
  }
  
  // Register comprehensive training routes (database dependent)
  try {
    const { registerTrainingRoutes } = await import('./training-routes');
    registerTrainingRoutes(app);
    console.log("✅ Training routes registered successfully");
    
    // Skip enhanced training loader to prevent duplicate seeding conflicts
    console.log("✅ Enhanced training content already loaded");
  } catch (error) {
    console.log("⚠️ Training routes registration skipped:", error);
  }

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolios/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const portfolio = await storage.getPortfolioByUserId(userId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/portfolios", async (req: Request, res: Response) => {
    try {
      const portfolioData = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(portfolioData);
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  app.put("/api/portfolios/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const portfolioData = insertPortfolioSchema.partial().parse(req.body);
      const portfolio = await storage.updatePortfolio(id, portfolioData);
      res.json(portfolio);
    } catch (error) {
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });

  // Strategy routes
  app.get("/api/strategies/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const strategies = await storage.getStrategiesByUserId(userId);
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/strategies", async (req: Request, res: Response) => {
    try {
      const strategyData = insertStrategySchema.parse(req.body);
      const strategy = await storage.createStrategy(strategyData);
      res.status(201).json(strategy);
    } catch (error) {
      res.status(400).json({ error: "Invalid strategy data" });
    }
  });

  app.put("/api/strategies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const strategyData = insertStrategySchema.partial().parse(req.body);
      const strategy = await storage.updateStrategy(id, strategyData);
      res.json(strategy);
    } catch (error) {
      res.status(400).json({ error: "Invalid strategy data" });
    }
  });

  app.delete("/api/strategies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStrategy(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DeFi Protocol routes
  app.get("/api/protocols", async (req: Request, res: Response) => {
    try {
      const protocols = await storage.getAllProtocols();
      res.json(protocols);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/protocols/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const protocol = await storage.getProtocolById(id);
      if (!protocol) {
        return res.status(404).json({ error: "Protocol not found" });
      }
      res.json(protocol);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/protocols", async (req: Request, res: Response) => {
    try {
      const protocolData = insertProtocolSchema.parse(req.body);
      const protocol = await storage.createProtocol(protocolData);
      res.status(201).json(protocol);
    } catch (error) {
      res.status(400).json({ error: "Invalid protocol data" });
    }
  });

  // Exit Strategy routes
  app.get("/api/exit-strategies/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const exitStrategies = await storage.getExitStrategiesByUserId(userId);
      res.json(exitStrategies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/exit-strategies", async (req: Request, res: Response) => {
    try {
      const exitStrategyData = insertExitStrategySchema.parse(req.body);
      const exitStrategy = await storage.createExitStrategy(exitStrategyData);
      res.status(201).json(exitStrategy);
    } catch (error) {
      res.status(400).json({ error: "Invalid exit strategy data" });
    }
  });

  // Alert routes
  app.get("/api/alerts/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const alerts = await storage.getAlertsByUserId(userId);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  app.put("/api/alerts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const alertData = insertAlertSchema.partial().parse(req.body);
      const alert = await storage.updateAlert(id, alertData);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  // Trading System routes
  app.get("/api/trading-systems/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const systems = await storage.getTradingSystemsByUserId(userId);
      res.json(systems);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/trading-systems", async (req: Request, res: Response) => {
    try {
      const systemData = insertTradingSystemSchema.parse(req.body);
      const system = await storage.createTradingSystem(systemData);
      res.status(201).json(system);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading system data" });
    }
  });

  app.put("/api/trading-systems/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const systemData = insertTradingSystemSchema.partial().parse(req.body);
      const system = await storage.updateTradingSystem(id, systemData);
      res.json(system);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading system data" });
    }
  });

  // Trading Signal routes
  app.get("/api/trading-signals/system/:systemId", async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.systemId);
      const signals = await storage.getTradingSignalsBySystemId(systemId);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/trading-signals", async (req: Request, res: Response) => {
    try {
      const signalData = insertTradingSignalSchema.parse(req.body);
      const signal = await storage.createStockTradingSignal(signalData);
      res.status(201).json(signal);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading signal data" });
    }
  });

  // Trading Position routes
  app.get("/api/trading-positions/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const positions = await storage.getTradingPositionsByUserId(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/trading-positions", async (req: Request, res: Response) => {
    try {
      const positionData = insertTradingPositionSchema.parse(req.body);
      const position = await storage.createTradingPosition(positionData);
      res.status(201).json(position);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading position data" });
    }
  });

  app.put("/api/trading-positions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const positionData = insertTradingPositionSchema.partial().parse(req.body);
      const position = await storage.updateTradingPosition(id, positionData);
      res.json(position);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading position data" });
    }
  });

  // Trading Performance routes
  app.get("/api/trading-performance/system/:systemId", async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.systemId);
      const performance = await storage.getTradingPerformanceBySystemId(systemId);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/trading-performance", async (req: Request, res: Response) => {
    try {
      const performanceData = insertTradingPerformanceSchema.parse(req.body);
      const performance = await storage.createTradingPerformance(performanceData);
      res.status(201).json(performance);
    } catch (error) {
      res.status(400).json({ error: "Invalid trading performance data" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Live Call routes
  app.get("/api/live-calls", async (req: Request, res: Response) => {
    try {
      const liveCalls = await storage.getAllLiveCalls();
      res.json(liveCalls);
    } catch (error) {
      console.error("Error fetching live calls:", error);
      res.status(500).json({ message: "Failed to fetch live calls" });
    }
  });

  // Crypto Project routes
  app.get("/api/crypto-projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllCryptoProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching crypto projects:", error);
      res.status(500).json({ message: "Failed to fetch crypto projects" });
    }
  });

  // Launchpad routes
  app.get("/api/launchpads", async (req: Request, res: Response) => {
    try {
      const launchpads = await storage.getAllLaunchpads();
      res.json(launchpads);
    } catch (error) {
      console.error("Error fetching launchpads:", error);
      res.status(500).json({ message: "Failed to fetch launchpads" });
    }
  });

  // Yield Pool routes
  app.get("/api/yield-pools", async (req: Request, res: Response) => {
    try {
      const yieldPools = await storage.getAllYieldPools();
      res.json(yieldPools);
    } catch (error) {
      console.error("Error fetching yield pools:", error);
      res.status(500).json({ message: "Failed to fetch yield pools" });
    }
  });

  // 30SecondTrader Routes
  app.get("/api/stock-alerts", async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getStockAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching stock alerts:", error);
      res.status(500).json({ message: "Failed to fetch stock alerts" });
    }
  });

  app.post("/api/stock-alerts", async (req: Request, res: Response) => {
    try {
      const alert = await storage.createStockAlert(req.body);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating stock alert:", error);
      res.status(500).json({ message: "Failed to create stock alert" });
    }
  });

  app.get("/api/stock-news", async (req: Request, res: Response) => {
    try {
      const news = await storage.getStockNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching stock news:", error);
      res.status(500).json({ message: "Failed to fetch stock news" });
    }
  });

  app.post("/api/stock-news", async (req: Request, res: Response) => {
    try {
      const news = await storage.createStockNews(req.body);
      res.status(201).json(news);
    } catch (error) {
      console.error("Error creating stock news:", error);
      res.status(500).json({ message: "Failed to create stock news" });
    }
  });

  app.get("/api/market-overview", async (req: Request, res: Response) => {
    try {
      const overview = await storage.getMarketOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching market overview:", error);
      res.status(500).json({ message: "Failed to fetch market overview" });
    }
  });

  app.post("/api/market-overview", async (req: Request, res: Response) => {
    try {
      const overview = await storage.createMarketOverview(req.body);
      res.status(201).json(overview);
    } catch (error) {
      console.error("Error creating market overview:", error);
      res.status(500).json({ message: "Failed to create market overview" });
    }
  });

  app.get("/api/trading-signals", async (req: Request, res: Response) => {
    try {
      const signals = await storage.getStockTradingSignals();
      res.json(signals);
    } catch (error) {
      console.error("Error fetching trading signals:", error);
      res.status(500).json({ message: "Failed to fetch trading signals" });
    }
  });

  app.post("/api/trading-signals", async (req: Request, res: Response) => {
    try {
      const signal = await storage.createStockTradingSignal(req.body);
      res.status(201).json(signal);
    } catch (error) {
      console.error("Error creating trading signal:", error);
      res.status(500).json({ message: "Failed to create trading signal" });
    }
  });

  // Training Strategy routes
  app.get("/api/training-strategies", async (req: Request, res: Response) => {
    try {
      const strategies = await storage.getAllTrainingStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/training-strategies/:strategyId", async (req: Request, res: Response) => {
    try {
      const strategy = await storage.getTrainingStrategyById(req.params.strategyId);
      if (!strategy) {
        return res.status(404).json({ error: "Training strategy not found" });
      }
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Passive Income Strategy routes
  app.get("/api/passive-income-strategies", async (req: Request, res: Response) => {
    try {
      const strategies = await storage.getAllPassiveIncomeStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/passive-income-strategies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const strategy = await storage.getPassiveIncomeStrategyById(id);
      if (!strategy) {
        return res.status(404).json({ error: "Passive income strategy not found" });
      }
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Oliver Velez Technique routes
  app.get("/api/oliver-velez-techniques", async (req: Request, res: Response) => {
    try {
      const techniques = await storage.getAllOliverVelezTechniques();
      res.json(techniques);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/oliver-velez-techniques/:techniqueId", async (req: Request, res: Response) => {
    try {
      const technique = await storage.getOliverVelezTechniqueById(req.params.techniqueId);
      if (!technique) {
        return res.status(404).json({ error: "Oliver Velez technique not found" });
      }
      res.json(technique);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Forex Trading Lesson routes
  app.get("/api/forex-trading-lessons", async (req: Request, res: Response) => {
    try {
      const lessons = await storage.getAllForexTradingLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/forex-trading-lessons/:lessonId", async (req: Request, res: Response) => {
    try {
      const lesson = await storage.getForexTradingLessonById(req.params.lessonId);
      if (!lesson) {
        return res.status(404).json({ error: "Forex trading lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DeFi Modules routes
  app.get("/api/defi-modules", async (req: Request, res: Response) => {
    try {
      // Return mock DeFi modules data for now
      const modules = [
        {
          id: 1,
          title: "DeFi Basics",
          description: "Introduction to decentralized finance",
          created_at: new Date().toISOString()
        }
      ];
      res.json(modules);
    } catch (error) {
      console.error("Error fetching DeFi modules:", error);
      res.status(500).json({ error: "Failed to fetch DeFi modules" });
    }
  });

  // Mindful Study Courses routes  
  app.get("/api/mindful-study-courses", async (req: Request, res: Response) => {
    try {
      // Return mock mindful study courses data for now
      const courses = [
        {
          id: 1,
          title: "Mindful Trading",
          description: "Mindfulness techniques for traders",
          student_count: 150
        }
      ];
      res.json(courses);
    } catch (error) {
      console.error("Error fetching mindful study courses:", error);
      res.status(500).json({ error: "Failed to fetch mindful study courses" });
    }
  });

  // Register training system routes
  registerTrainingSystemRoutes(app);

  // News Alert API endpoints
  app.post('/api/news-alerts/trigger', (req, res) => {
    try {
      const { eventName, headline, impact, category, ticker, priceLevel } = req.body;
      const alert = newsMonitoringService.triggerManualAlert({
        eventName: eventName || 'Manual Alert',
        headline: headline || 'Manual test alert triggered',
        impact: impact || 'HIGH',
        category: category || 'BREAKING',
        ticker,
        priceLevel
      });
      res.json({ success: true, alert });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/news-alerts/sweep-update', (req, res) => {
    try {
      const { alertId, priceLevel, direction } = req.body;
      newsMonitoringService.updateSweepStatus(alertId, priceLevel, direction);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/news-alerts/status', (req, res) => {
    res.json({
      connected: true,
      clientCount: newsMonitoringService.getClientCount()
    });
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket news monitoring service
  newsMonitoringService.initialize(httpServer);
  console.log('✅ News Monitoring Service WebSocket initialized');

  return httpServer;
}
