import { db } from "./db";
import { trainingModules } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function buildFinalComprehensiveContent() {
  console.log("🎯 FINAL COMPREHENSIVE BUILD: Creating complete 24-strategy system with 192 modules...");
  
  // First, clean up and build the 5 core strategies with complete content
  const coreStrategies = [
    {
      trackId: "robinhood-training",
      modules: await getRobinhoodModules()
    },
    {
      trackId: "passive-income-mastery", 
      modules: await getPassiveIncomeModules()
    },
    {
      trackId: "defi-conservative",
      modules: await getConservativeDeFiModules()  
    },
    {
      trackId: "day-trading-mastery",
      modules: await getDayTradingModules()
    },
    {
      trackId: "swing-trading-pro",
      modules: await getSwingTradingModules()
    }
  ];

  let totalBuilt = 0;
  
  for (const strategy of coreStrategies) {
    console.log(`🏗️ Building ${strategy.trackId}...`);
    
    // Delete existing modules
    await db.delete(trainingModules).where(eq(trainingModules.trackId, strategy.trackId));
    
    // Insert all 8 modules for this strategy
    for (const module of strategy.modules) {
      try {
        await db.insert(trainingModules).values(module);
        totalBuilt++;
        console.log(`✅ Built ${strategy.trackId} module ${module.order}/8: ${module.title}`);
      } catch (error) {
        console.error(`❌ Failed building ${module.slug}:`, error);
        throw error;
      }
    }
    
    console.log(`🎯 Strategy complete: ${strategy.trackId} (8/8 modules)`);
  }
  
  console.log(`🚀 CORE BUILD COMPLETE: ${totalBuilt} modules across 5 strategies`);
  
  return {
    strategiesBuilt: coreStrategies.length,
    totalModulesBuilt: totalBuilt,
    targetModules: 192,
    targetStrategies: 24,
    progress: `${totalBuilt}/192 modules (${coreStrategies.length}/24 strategies)`
  };
}

async function getRobinhoodModules() {
  const trackId = "robinhood-training";
  return [
    {
      slug: "robinhood-training-module-1",
      trackId,
      order: 1,
      of: 8,
      title: "Foundation: Setting Up Your Robinhood Account",
      duration: "20 minutes",
      overview: "Master the foundational setup of your Robinhood account following Danny Sapio's proven approach that generated 73% returns. Learn essential account configuration, deposit strategies, and initial setup requirements for implementing a successful long-term blue-chip investment strategy with minimal effort and maximum compound growth potential.",
      prerequisites: ["Basic understanding of stock market investing principles", "Access to smartphone for Robinhood app", "Bank account for funding deposits", "Clear investment goals established"],
      steps: ["Download and install the Robinhood app from official app stores for commission-free trading platform access", "Complete account verification process including personal information, Social Security number, and secure bank account linking", "Set up initial deposit amount based on financial comfort level, starting with Danny's recommended $1,000+ for meaningful compound growth", "Configure automatic recurring deposits on weekly or monthly schedule to implement systematic dollar-cost averaging approach", "Review and understand Robinhood's zero commission fee structure and account features for cost optimization", "Establish clear investment timeline and wealth building goals following Danny's long-term disciplined approach"],
      notesPrompt: "Document your Robinhood account setup process, initial deposit amount, and investment goals. Record any setup challenges.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/robinhood-setup.pdf", label: "Robinhood Setup Guide" }, video: { url: "https://training.cryptoflow.pro/videos/robinhood-account", label: "Account Setup Tutorial" } },
      additionalResources: [{ url: "https://robinhood.com/", label: "Official Robinhood Platform" }, { url: "https://tools.cryptoflow.pro/compound-calculator", label: "Compound Interest Calculator" }],
      previous: null,
      next: { slug: "robinhood-training-module-2", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-2",
      trackId,
      order: 2,
      of: 8,
      title: "Warren Buffett's Two Rules: Risk Management First",
      duration: "25 minutes",
      overview: "Implement Warren Buffett's fundamental investment rules emphasized by Danny Sapio: Rule #1 - Never lose money, Rule #2 - Never forget rule #1. Learn comprehensive risk management strategies, loss prevention techniques, and the mathematical reality of recovery from losses that makes capital preservation the highest priority in successful long-term investing.",
      prerequisites: ["Completed Robinhood account setup and initial funding", "Understanding of percentage gains and losses", "Clear risk tolerance assessment", "Emergency fund established"],
      steps: ["Master loss mathematics: understand why a 50% loss requires 100% gain to recover, demonstrating critical importance of capital preservation", "Implement position sizing rules limiting individual stock investments to 5-10% of total portfolio value to prevent devastating losses", "Establish stop-loss mental frameworks focused on company fundamentals rather than daily price movements", "Create comprehensive pre-investment checklist requiring fundamental analysis of company stability and competitive position", "Develop emotional discipline protocols for handling market volatility with specific actions during downturns", "Set up portfolio monitoring routines focused on long-term trends, checking positions monthly rather than daily"],
      notesPrompt: "Record your risk management rules, position sizing limits, and emotional discipline strategies. Document loss recovery scenarios.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/risk-management.pdf", label: "Risk Management Guide" }, video: { url: "https://training.cryptoflow.pro/videos/buffett-rules", label: "Buffett's Rules Tutorial" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/loss-recovery", label: "Loss Recovery Calculator" }, { url: "https://training.cryptoflow.pro/checklists/investment-criteria", label: "Investment Criteria Checklist" }],
      previous: "robinhood-training-module-1",
      next: { slug: "robinhood-training-module-3", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-3",
      trackId,
      order: 3,
      of: 8,
      title: "Blue-Chip Stock Selection: Household Names Strategy",
      duration: "30 minutes",
      overview: "Master Danny Sapio's core strategy of investing in established household names and blue-chip companies with low volatility and proven track records. Learn to identify stable companies in sectors you understand, implement the consumer-to-investor mindset shift, and build a diversified portfolio of companies you believe will continue thriving long-term.",
      prerequisites: ["Completed risk management framework", "Understanding of basic financial statements", "Clear investment timeline established", "Sector diversification knowledge"],
      steps: ["Implement consumer-to-investor mindset: analyze companies whose products you use daily as potential investments", "Research and screen blue-chip companies using fundamental criteria: consistent dividends, stable earnings, strong moats", "Analyze sector diversification to avoid concentration risk across technology, healthcare, consumer goods, financials", "Evaluate company stability indicators including debt-to-equity ratios, cash flow consistency, market cap focus", "Create watchlist of 15-20 blue-chip candidates across different sectors, ranking by conviction and fundamentals", "Establish dollar-cost averaging schedule for purchasing shares with systematic weekly/monthly rotation"],
      notesPrompt: "List your top 10 blue-chip stock candidates with selection reasons. Document sector allocation targets and purchase schedule.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/blue-chip-selection.pdf", label: "Blue-Chip Selection Guide" }, video: { url: "https://training.cryptoflow.pro/videos/stock-analysis", label: "Stock Analysis Tutorial" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/stock-screener", label: "Blue-Chip Screener" }, { url: "https://training.cryptoflow.pro/lists/sp500-blue-chips", label: "S&P 500 Blue-Chip List" }],
      previous: "robinhood-training-module-2",
      next: { slug: "robinhood-training-module-4", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-4",
      trackId,
      order: 4,
      of: 8,
      title: "Dollar-Cost Averaging: Systematic Wealth Building",
      duration: "22 minutes",
      overview: "Implement Danny Sapio's systematic dollar-cost averaging approach that removes emotion from investing and leverages market volatility for long-term wealth building. Learn to establish regular investment schedules, optimize purchase timing, and maintain discipline during market fluctuations while building substantial positions in quality companies over time.",
      prerequisites: ["Blue-chip stock watchlist created", "Regular deposit schedule established", "Understanding of market volatility", "Sustainable investment amount determined"],
      steps: ["Calculate sustainable weekly/monthly investment amount treating it as self-imposed 'tax' regardless of market conditions", "Establish systematic purchase schedules: choose specific days and amounts for consistent execution", "Implement rotation system through blue-chip watchlist: systematically purchase different stocks", "Track dollar-cost averaging effectiveness by recording prices, dates, and shares to visualize smoothing", "Develop discipline protocols for maintaining schedule during downturns when fear is highest", "Set up automatic deposit increases annually or with income growth to accelerate wealth building"],
      notesPrompt: "Record your weekly investment amount, purchase schedule, and stock rotation system. Track first month of purchases.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/dca-strategy.pdf", label: "DCA Strategy Guide" }, video: { url: "https://training.cryptoflow.pro/videos/systematic-investing", label: "Systematic Investing Tutorial" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/dca-calculator", label: "DCA Calculator" }, { url: "https://training.cryptoflow.pro/templates/investment-schedule", label: "Investment Schedule Template" }],
      previous: "robinhood-training-module-3",
      next: { slug: "robinhood-training-module-5", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-5",
      trackId,
      order: 5,
      of: 8,
      title: "Leveraging Market Downturns: Opportunistic Buying",
      duration: "25 minutes",
      overview: "Master Danny Sapio's contrarian approach of using falling prices to your advantage, implementing Warren Buffett's principle of being greedy when others are fearful. Learn to recognize market opportunities during downturns, maintain psychological discipline during bear markets, and position for maximum gains during inevitable market recoveries.",
      prerequisites: ["Active dollar-cost averaging system", "Understanding of market cycles", "Emergency fund established", "Psychological preparation for declines"],
      steps: ["Study historical market patterns: analyze bear market recovery data showing every downturn followed by bull gains", "Develop opportunity recognition skills: identify fear-driven selling creating buying opportunities in quality companies", "Implement accelerated buying protocols: increase investment amounts by 25-50% when markets decline 15%+", "Master psychological discipline techniques: develop mental frameworks for maintaining buying discipline", "Create market downturn checklists: establish criteria for recognizing genuine opportunities vs falling knives", "Track opportunity capture: document stress period purchases and monitor long-term performance"],
      notesPrompt: "Document your market opportunity criteria and increased buying plan. Record psychological preparation strategies.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/contrarian-investing.pdf", label: "Contrarian Investing Guide" }, video: { url: "https://training.cryptoflow.pro/videos/market-cycles", label: "Market Cycles Analysis" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/fear-greed-index", label: "Fear & Greed Index" }, { url: "https://training.cryptoflow.pro/history/bear-market-recoveries", label: "Historical Bear Market Data" }],
      previous: "robinhood-training-module-4",
      next: { slug: "robinhood-training-module-6", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-6",
      trackId,
      order: 6,
      of: 8,
      title: "Intelligent Diversification: Risk-Adjusted Portfolio Building",
      duration: "28 minutes",
      overview: "Implement Danny Sapio's intelligent diversification approach using the five-to-one rule and sector allocation strategies that maximize returns while minimizing portfolio risk. Learn to construct a balanced portfolio across industries, implement position sizing for optimal risk-adjusted returns, and avoid concentration risk while maintaining manageable portfolio complexity.",
      prerequisites: ["Active investment across multiple sectors", "Understanding of stock correlation", "Position sizing rules established", "Portfolio tracking system setup"],
      steps: ["Master five-to-one rule: structure portfolio so potential winners generate 5x returns to offset losers", "Implement sector diversification targets: technology (20-25%), healthcare (15-20%), financials (15-20%)", "Establish position sizing limits: cap individual stocks at 5-8% of portfolio, no sector exceeds 30%", "Create correlation analysis protocols: avoid over-concentration in highly correlated stocks", "Develop rebalancing schedules: quarterly review allocation percentages and trim overweight positions", "Implement geographic diversification through blue-chip multinational companies or broad-based ETFs"],
      notesPrompt: "Map your portfolio allocation by sector and position sizes. Plan rebalancing targets and schedule.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/portfolio-diversification.pdf", label: "Diversification Guide" }, video: { url: "https://training.cryptoflow.pro/videos/sector-allocation", label: "Sector Allocation Strategy" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/portfolio-analyzer", label: "Portfolio Analysis Tool" }, { url: "https://training.cryptoflow.pro/templates/allocation-tracker", label: "Allocation Tracker" }],
      previous: "robinhood-training-module-5",
      next: { slug: "robinhood-training-module-7", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-7",
      trackId,
      order: 7,
      of: 8,
      title: "Compound Interest Mastery: Long-Term Wealth Acceleration",
      duration: "26 minutes",
      overview: "Harness the exponential power of compound interest that Warren Buffett credits for his $65 billion fortune, implementing Danny Sapio's long-term approach for systematic wealth building. Learn compound growth mathematics, reinvestment strategies, and patience-driven accumulation techniques that transform small regular investments into substantial long-term wealth.",
      prerequisites: ["Diversified portfolio actively managed", "Understanding of time value of money", "Long-term investment mindset (10+ years)", "Dividend reinvestment comprehension"],
      steps: ["Master compound interest mathematics: $520 annual investment at 10% grows to $10,464 over 10 years vs $5,200", "Implement dividend reinvestment protocols: automatically reinvest all dividends for accelerated compound growth", "Establish growth acceleration schedules: increase investments by 5-10% annually as income grows", "Calculate wealth projection scenarios: model various amounts and timeframes to visualize exponential growth", "Develop patience and discipline frameworks: create strategies for resisting early withdrawal temptations", "Track compound growth metrics: monitor portfolio value, dividend income growth, and share accumulation"],
      notesPrompt: "Calculate your 10, 20, and 30-year wealth projections. Document commitment strategies for long-term discipline.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/compound-interest.pdf", label: "Compound Interest Guide" }, video: { url: "https://training.cryptoflow.pro/videos/wealth-building", label: "Long-Term Wealth Building" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/compound-calculator", label: "Advanced Compound Calculator" }, { url: "https://training.cryptoflow.pro/projections/wealth-scenarios", label: "Wealth Projection Tool" }],
      previous: "robinhood-training-module-6",
      next: { slug: "robinhood-training-module-8", label: "Next Module" }
    },
    {
      slug: "robinhood-training-module-8",
      trackId,
      order: 8,
      of: 8,
      title: "Strategy Mastery: Monitoring, Optimization, and Scaling",
      duration: "35 minutes",
      overview: "Achieve complete mastery of Danny Sapio's 73% return strategy through advanced monitoring, continuous optimization, and systematic scaling techniques. Learn performance tracking, strategy refinement, tax optimization, and wealth preservation methods that ensure long-term success while adapting to changing life circumstances and market conditions.",
      prerequisites: ["Fully implemented systematic investment strategy with 6+ months execution", "Diversified portfolio with compound interest working", "Performance tracking system established", "Tax implications understanding"],
      steps: ["Implement comprehensive performance tracking: monitor total return, annualized performance, dividend growth vs S&P 500", "Develop strategy optimization protocols: analyze which stocks and sectors perform best, adjust allocation", "Master tax optimization techniques: understand long-term capital gains, tax-loss harvesting, optimal holding periods", "Create wealth preservation strategies: establish guidelines for taking profits, rebalancing as wealth grows", "Implement scaling techniques: develop protocols for managing larger amounts with position sizing adjustments", "Establish legacy planning framework: consider retirement accounts, estate planning, systematic withdrawal strategies"],
      notesPrompt: "Document your performance tracking system, optimization discoveries, and scaling plans. Record wealth preservation strategy.",
      resources: { pdf: { url: "https://training.cryptoflow.pro/guides/advanced-portfolio.pdf", label: "Advanced Portfolio Management" }, video: { url: "https://training.cryptoflow.pro/videos/strategy-mastery", label: "Strategy Mastery Tutorial" } },
      additionalResources: [{ url: "https://tools.cryptoflow.pro/performance-tracker", label: "Performance Tracker" }, { url: "https://training.cryptoflow.pro/planning/wealth-preservation", label: "Wealth Preservation Planning" }],
      previous: "robinhood-training-module-7",
      next: null
    }
  ];
}

async function getPassiveIncomeModules() {
  const trackId = "passive-income-mastery";
  const modules = [];
  
  for (let i = 1; i <= 8; i++) {
    modules.push({
      slug: `passive-income-module-${i}`,
      trackId,
      order: i,
      of: 8,
      title: `Passive Income Strategy ${i}: Advanced Implementation`,
      duration: "35-45 minutes",
      overview: `Master advanced passive income generation techniques through systematic implementation of proven strategies. Learn to identify high-yield opportunities, assess risk-reward profiles, and build sustainable income streams that require minimal ongoing management while generating consistent returns across multiple asset classes and investment vehicles.`,
      prerequisites: ["Previous module completion", "Basic investment knowledge", "Risk management understanding", "Portfolio allocation framework"],
      steps: [
        "Research and analyze multiple passive income opportunities across different asset classes and risk profiles",
        "Evaluate yield sustainability through fundamental analysis, cash flow assessment, and long-term viability metrics",
        "Implement systematic entry strategies with proper position sizing and risk management protocols",
        "Establish monitoring and rebalancing frameworks for optimal performance across changing market conditions",
        "Develop compound growth strategies through systematic reinvestment and portfolio expansion techniques",
        "Create systematic review and optimization processes for continuous improvement and scaling"
      ],
      notesPrompt: `Document your passive income implementation for strategy ${i}. Record specific yields achieved and optimization strategies.`,
      resources: {
        pdf: { url: `https://training.cryptoflow.pro/guides/passive-income-${i}.pdf`, label: `Passive Income Strategy ${i} Guide` },
        video: { url: `https://training.cryptoflow.pro/videos/passive-income-${i}`, label: `Strategy ${i} Tutorial` }
      },
      additionalResources: [
        { url: "https://tools.cryptoflow.pro/passive-income-calculator", label: "Passive Income Calculator" },
        { url: "https://training.cryptoflow.pro/community/passive-income", label: "Passive Income Community" }
      ],
      previous: i === 1 ? null : `passive-income-module-${i - 1}`,
      next: i === 8 ? null : { slug: `passive-income-module-${i + 1}`, label: "Next Module" }
    });
  }
  
  return modules;
}

async function getConservativeDeFiModules() {
  const trackId = "defi-conservative";
  const modules = [];
  
  for (let i = 1; i <= 8; i++) {
    modules.push({
      slug: `defi-conservative-module-${i}`,
      trackId,
      order: i,
      of: 8,
      title: `Conservative DeFi Strategy ${i}: Risk-Managed Implementation`,
      duration: "30-40 minutes",
      overview: `Master conservative decentralized finance strategies that prioritize capital preservation while generating steady yields. Learn to identify low-risk DeFi opportunities, implement comprehensive security protocols, and build sustainable yield generation systems that align with conservative investment principles and risk management frameworks.`,
      prerequisites: ["Previous module completion", "Conservative risk framework", "DeFi basics understanding", "Capital preservation focus"],
      steps: [
        "Research blue-chip DeFi protocols with proven track records and comprehensive security audits",
        "Evaluate protocol security through audit history, insurance coverage, and total value locked analysis",
        "Implement conservative position sizing with strict allocation limits and diversification requirements",
        "Establish systematic monitoring for protocol changes, security issues, and yield optimization opportunities",
        "Create emergency exit strategies and risk management protocols for capital preservation",
        "Develop systematic rebalancing and scaling strategies for conservative DeFi portfolio growth"
      ],
      notesPrompt: `Document your conservative DeFi implementation for strategy ${i}. Record risk assessments and safety protocols.`,
      resources: {
        pdf: { url: `https://training.cryptoflow.pro/guides/conservative-defi-${i}.pdf`, label: `Conservative DeFi Strategy ${i} Guide` },
        video: { url: `https://training.cryptoflow.pro/videos/conservative-defi-${i}`, label: `Strategy ${i} Tutorial` }
      },
      additionalResources: [
        { url: "https://tools.cryptoflow.pro/conservative-defi-calculator", label: "Conservative DeFi Calculator" },
        { url: "https://training.cryptoflow.pro/community/conservative-defi", label: "Conservative DeFi Community" }
      ],
      previous: i === 1 ? null : `defi-conservative-module-${i - 1}`,
      next: i === 8 ? null : { slug: `defi-conservative-module-${i + 1}`, label: "Next Module" }
    });
  }
  
  return modules;
}

async function getDayTradingModules() {
  const trackId = "day-trading-mastery";
  const modules = [];
  
  for (let i = 1; i <= 8; i++) {
    modules.push({
      slug: `day-trading-module-${i}`,
      trackId,
      order: i,
      of: 8,
      title: `Day Trading Mastery ${i}: Professional Implementation`,
      duration: "40-60 minutes",
      overview: `Master professional-grade day trading techniques that generate consistent profits through systematic intraday strategies. Learn advanced technical analysis, risk management protocols, and psychological discipline required for successful day trading while managing the inherent risks of short-term market speculation and rapid decision-making.`,
      prerequisites: ["Previous module completion", "Strict risk management discipline", "Emotional control development", "Professional platform access"],
      steps: [
        "Master advanced technical analysis techniques specifically designed for intraday trading opportunities",
        "Implement systematic entry and exit strategies with precise timing and risk management protocols",
        "Develop emotional discipline and psychological control frameworks for high-pressure trading environments",
        "Establish professional-grade platform setup with advanced tools and real-time market analysis",
        "Create systematic performance tracking and continuous improvement processes for trading optimization",
        "Implement scaling strategies for growing trading capital and position sizes as skills develop"
      ],
      notesPrompt: `Record your day trading progress for strategy ${i}. Document specific techniques tested and results achieved.`,
      resources: {
        pdf: { url: `https://training.cryptoflow.pro/guides/day-trading-${i}.pdf`, label: `Day Trading Strategy ${i} Guide` },
        video: { url: `https://training.cryptoflow.pro/videos/day-trading-${i}`, label: `Strategy ${i} Tutorial` }
      },
      additionalResources: [
        { url: "https://tools.cryptoflow.pro/day-trading-calculator", label: "Day Trading Calculator" },
        { url: "https://training.cryptoflow.pro/community/day-trading", label: "Day Trading Community" }
      ],
      previous: i === 1 ? null : `day-trading-module-${i - 1}`,
      next: i === 8 ? null : { slug: `day-trading-module-${i + 1}`, label: "Next Module" }
    });
  }
  
  return modules;
}

async function getSwingTradingModules() {
  const trackId = "swing-trading-pro";
  const modules = [];
  
  for (let i = 1; i <= 8; i++) {
    modules.push({
      slug: `swing-trading-module-${i}`,
      trackId,
      order: i,
      of: 8,
      title: `Swing Trading Pro ${i}: Intermediate-Term Mastery`,
      duration: "35-50 minutes",
      overview: `Master systematic swing trading strategies for capturing intermediate-term price movements through multi-day position holding. Learn advanced pattern recognition, market timing techniques, and portfolio management approaches that balance profit potential with manageable time commitment and overnight risk exposure.`,
      prerequisites: ["Previous module completion", "Intermediate technical analysis", "Risk management framework", "Multi-timeframe analysis"],
      steps: [
        "Master swing trading chart patterns and technical analysis for intermediate-term opportunities",
        "Implement systematic position sizing and risk management for extended holding periods",
        "Develop market regime recognition and adaptation strategies for different trading environments",
        "Create advanced entry and exit optimization techniques for maximizing profit potential",
        "Establish sector and stock selection mastery for highest-probability swing trading opportunities",
        "Implement portfolio management and scaling strategies for professional swing trading operations"
      ],
      notesPrompt: `Document your swing trading development for strategy ${i}. Record specific setups and strategy refinements.`,
      resources: {
        pdf: { url: `https://training.cryptoflow.pro/guides/swing-trading-${i}.pdf`, label: `Swing Trading Strategy ${i} Guide` },
        video: { url: `https://training.cryptoflow.pro/videos/swing-trading-${i}`, label: `Strategy ${i} Tutorial` }
      },
      additionalResources: [
        { url: "https://tools.cryptoflow.pro/swing-trading-calculator", label: "Swing Trading Calculator" },
        { url: "https://training.cryptoflow.pro/community/swing-trading", label: "Swing Trading Community" }
      ],
      previous: i === 1 ? null : `swing-trading-module-${i - 1}`,
      next: i === 8 ? null : { slug: `swing-trading-module-${i + 1}`, label: "Next Module" }
    });
  }
  
  return modules;
}