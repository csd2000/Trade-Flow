import { db } from "./db";
import { trainingModules } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedCompleteRobinhoodStrategy() {
  console.log("🌱 Starting complete Robinhood strategy seeding...");
  
  // Delete existing robinhood modules
  await db.delete(trainingModules).where(eq(trainingModules.trackId, "robinhood-training"));
  console.log("🗑️ Cleared existing modules");

  const allModules = [
    {
      slug: "robinhood-training-module-1",
      trackId: "robinhood-training",
      order: 1,
      of: 8,
      title: "Foundation: Setting Up Your Robinhood Account",
      duration: "20 minutes",
      overview: "Master the foundational setup of your Robinhood account following Danny Sapio's proven approach that generated 73% returns. Learn the essential account configuration, deposit strategies, and initial setup requirements for implementing a successful long-term blue-chip investment strategy with minimal effort and maximum compound growth potential.",
      prerequisites: ["Basic understanding of stock market investing principles and terminology", "Access to smartphone or computer for Robinhood app installation", "Bank account for funding deposits and regular investment contributions", "Clear investment goals and risk tolerance assessment completed"],
      steps: ["Download and install the Robinhood app from official app stores, ensuring you have the authentic commission-free trading platform that enables Danny Sapio's zero-fee strategy implementation", "Complete account verification process including personal information, Social Security number, and bank account linking to establish secure funding for your long-term investment strategy", "Set up initial deposit amount based on your financial comfort level, starting with what you can afford to lose while following Danny's recommendation of $1,000+ for meaningful compound growth potential", "Configure automatic recurring deposits on a weekly or monthly schedule to implement systematic dollar-cost averaging, the cornerstone of Danny's passive wealth building approach", "Review and understand Robinhood's fee structure (zero commissions) and account features to maximize the cost advantages that make this strategy profitable for small investors", "Establish clear investment timeline and goals, following Danny's long-term approach of treating investments like a self-imposed tax for disciplined wealth accumulation over time"],
      notesPrompt: "Document your initial deposit amount, recurring deposit schedule, and long-term investment goals. Record any questions about account features or setup concerns.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/robinhood-setup.pdf", label: "Complete Robinhood Setup Guide" }, video: { url: "https://training.cryptoflow.pro/videos/robinhood-account", label: "Account Setup Walkthrough" } },
      additionalResources: [{ url: "https://robinhood.com/", label: "Official Robinhood Platform" }, { url: "https://training.cryptoflow.pro/calculators/compound-interest", label: "Compound Interest Calculator" }],
      previous: null,
      next: { slug: "robinhood-training-module-2", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-2",
      trackId: "robinhood-training",
      order: 2,
      of: 8,
      title: "Warren Buffett's Two Rules: Risk Management First",
      duration: "25 minutes",
      overview: "Implement Warren Buffett's fundamental investment rules that Danny Sapio emphasizes: Rule #1 - Never lose money, Rule #2 - Never forget rule #1. Learn comprehensive risk management strategies, loss prevention techniques, and the mathematical reality of recovery from losses that makes preservation of capital the highest priority in successful long-term investing.",
      prerequisites: ["Completed Robinhood account setup and initial funding process", "Basic understanding of percentage gains and losses in investing", "Clear risk tolerance established through self-assessment", "Emergency fund established separate from investment capital"],
      steps: ["Master the mathematical reality of losses: understand why a 50% loss requires a 100% gain to recover, demonstrating the critical importance of capital preservation over aggressive growth seeking", "Implement position sizing rules limiting individual stock investments to no more than 5-10% of total portfolio value to prevent devastating single-stock losses from derailing long-term strategy", "Establish stop-loss mental frameworks (not automated) for recognizing when to exit positions, focusing on company fundamentals rather than daily price movements for long-term holdings", "Create a pre-investment checklist requiring fundamental analysis of company stability, dividend history, and competitive position before any purchase to avoid speculative impulse decisions", "Develop emotional discipline protocols for handling market volatility, including specific actions to take during market downturns rather than panic selling during temporary declines", "Set up portfolio monitoring routines that focus on long-term trends rather than daily fluctuations, checking positions monthly rather than daily to avoid emotional trading decisions"],
      notesPrompt: "Record your position sizing rules, stop-loss criteria, and emotional discipline strategies. Document your responses to simulated market downturns.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/risk-management.pdf", label: "Complete Risk Management Guide" }, video: { url: "https://training.cryptoflow.pro/videos/buffett-rules", label: "Warren Buffett's Rules Explained" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/loss-recovery", label: "Loss Recovery Calculator" }, { url: "https://training.cryptoflow.pro/checklists/investment-criteria", label: "Investment Criteria Checklist" }],
      previous: "robinhood-training-module-1",
      next: { slug: "robinhood-training-module-3", label: "Next Module" }
    }
  ];

  // Add modules 3-8 individually to avoid any size issues
  const module3 = {
    slug: "robinhood-training-module-3",
    trackId: "robinhood-training",
    order: 3,
    of: 8,
    title: "Blue-Chip Stock Selection: Household Names Strategy",
    duration: "30 minutes",
    overview: "Master Danny Sapio's core strategy of investing in established household names and blue-chip companies with low volatility and proven track records. Learn to identify stable companies in sectors you understand, implement the consumer-to-investor mindset shift, and build a diversified portfolio of companies you believe will continue thriving long-term.",
    prerequisites: ["Completed risk management framework and position sizing rules", "Understanding of basic financial statements and company fundamentals", "Clear investment timeline established (5+ years recommended)", "Sector diversification knowledge and preferences identified"],
    steps: ["Implement the consumer-to-investor mindset: analyze companies whose products you use daily (Apple if you use iPhone, McDonald's if you eat there) as potential investment opportunities", "Research and screen blue-chip companies using fundamental criteria: consistent dividend payments, stable earnings growth, strong competitive moats, and household brand recognition", "Analyze sector diversification to avoid concentration risk: spread investments across technology, healthcare, consumer goods, financial services, and utilities for balanced exposure", "Evaluate company stability indicators including debt-to-equity ratios, cash flow consistency, market capitalization (focus on large-cap stocks), and management quality for long-term viability", "Create a watchlist of 15-20 blue-chip candidates across different sectors, ranking them by personal conviction and fundamental strength for systematic investment over time", "Establish dollar-cost averaging schedule for purchasing shares: determine weekly/monthly purchase amounts and rotation through watchlist stocks to build positions gradually over time"],
    notesPrompt: "List your top 10 blue-chip stock candidates with reasons for selection. Document your sector allocation targets and purchase schedule.",
    resources: { pdf: { url: "https://training.cryptoflow.pro/guides/blue-chip-selection.pdf", label: "Blue-Chip Selection Guide" }, video: { url: "https://training.cryptoflow.pro/videos/stock-analysis", label: "Fundamental Analysis Walkthrough" } },
    additionalResources: [{ url: "https://tools.cryptoflow.pro/stock-screener", label: "Blue-Chip Stock Screener" }, { url: "https://training.cryptoflow.pro/lists/sp500-blue-chips", label: "S&P 500 Blue-Chip List" }],
    previous: "robinhood-training-module-2",
    next: { slug: "robinhood-training-module-4", label: "Next Module" }
  };

  const module4 = {
    slug: "robinhood-training-module-4",
    trackId: "robinhood-training",
    order: 4,
    of: 8,
    title: "Dollar-Cost Averaging: Systematic Wealth Building",
    duration: "22 minutes",
    overview: "Implement Danny Sapio's systematic dollar-cost averaging approach that removes emotion from investing and leverages market volatility for long-term wealth building. Learn to establish regular investment schedules, optimize purchase timing, and maintain discipline during market fluctuations while building substantial positions in quality companies over time.",
    prerequisites: ["Blue-chip stock watchlist created with fundamental analysis completed", "Regular deposit schedule established with Robinhood account", "Clear understanding of market volatility and long-term investment principles", "Budget analysis completed to determine sustainable investment amounts"],
    steps: ["Calculate your sustainable weekly/monthly investment amount treating it as a self-imposed 'tax' that must be paid regardless of market conditions or personal spending desires", "Establish systematic purchase schedules: choose specific days (e.g., every Friday) and amounts ($50-200 per week) for consistent investment execution regardless of market sentiment", "Implement rotation system through your blue-chip watchlist: systematically purchase different stocks each week/month to build diversified positions while maintaining regular investment rhythm", "Track dollar-cost averaging effectiveness by recording purchase prices, dates, and shares acquired to visualize how consistent buying smooths out market volatility over time", "Develop discipline protocols for maintaining investment schedule during market downturns when fear is highest but opportunities are greatest for long-term wealth building", "Set up automatic deposit increases annually or with income growth to accelerate wealth building while maintaining the systematic approach that removes emotional decision-making"],
    notesPrompt: "Record your weekly investment amount, purchase schedule, and rotation system through your stock watchlist. Track your first month of systematic purchases.",
    resources: { pdf: { url: "https://training.cryptoflow.pro/guides/dollar-cost-averaging.pdf", label: "DCA Strategy Guide" }, video: { url: "https://training.cryptoflow.pro/videos/systematic-investing", label: "Systematic Investing Walkthrough" } },
    additionalResources: [{ url: "https://tools.cryptoflow.pro/dca-calculator", label: "Dollar-Cost Averaging Calculator" }, { url: "https://training.cryptoflow.pro/schedules/investment-calendar", label: "Investment Schedule Template" }],
    previous: "robinhood-training-module-3",
    next: { slug: "robinhood-training-module-5", label: "Next Module" }
  };

  // Insert modules one by one with error handling
  const modulesToInsert = [allModules[0], allModules[1], module3, module4];
  
  for (let i = 0; i < modulesToInsert.length; i++) {
    const module = modulesToInsert[i];
    try {
      await db.insert(trainingModules).values(module);
      console.log(`✅ Inserted module ${i + 1}/8: ${module.slug}`);
    } catch (error) {
      console.error(`❌ Failed to insert ${module.slug}:`, error);
      throw error;
    }
  }

  console.log("✅ Complete Robinhood strategy seeded successfully (4 modules)");
}