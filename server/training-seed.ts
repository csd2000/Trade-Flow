import { storage } from "./storage";
import type { InsertTrainingStrategy, InsertPassiveIncomeStrategy, InsertOliverVelezTechnique, InsertForexTradingLesson } from "@shared/schema";

// Training Strategies Data
const trainingStrategiesData: InsertTrainingStrategy[] = [
  {
    strategyId: "defi-conservative",
    title: "Conservative DeFi Strategies",
    category: "defi",
    difficulty: "Beginner",
    duration: "2-3 hours",
    description: "Low-risk DeFi strategies focused on stablecoin yields and established protocols with proven track records.",
    keyPoints: [
      "Focus on blue-chip protocols like Aave and Compound",
      "Prioritize stablecoin pairs for minimal volatility",
      "Start with small amounts to learn the ecosystem",
      "Use established, audited protocols only",
      "Understand impermanent loss in liquidity pools"
    ],
    successRate: "85-95%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 1
  },
  {
    strategyId: "defi-balanced",
    title: "Balanced DeFi Portfolio",
    category: "defi",
    difficulty: "Intermediate",
    duration: "3-4 hours",
    description: "Balanced approach mixing stablecoin yields with moderate-risk strategies across multiple protocols.",
    keyPoints: [
      "Diversify across 3-5 different protocols",
      "Mix stablecoin and blue-chip crypto yields",
      "Consider yield farming opportunities",
      "Monitor protocol governance and upgrades",
      "Implement proper risk management"
    ],
    successRate: "70-85%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 2
  },
  {
    strategyId: "defi-aggressive",
    title: "Aggressive DeFi Strategies",
    category: "defi",
    difficulty: "Advanced",
    duration: "4-5 hours",
    description: "High-yield DeFi strategies including newer protocols, leveraged positions, and advanced yield farming.",
    keyPoints: [
      "Explore newer protocols with higher yields",
      "Use leveraged yield farming strategies",
      "Participate in liquidity bootstrapping pools",
      "Monitor token launches and farming opportunities",
      "Advanced risk management essential"
    ],
    successRate: "50-70%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 3
  },
  {
    strategyId: "stock-day-trading",
    title: "Day Trading Fundamentals",
    category: "stocks",
    difficulty: "Intermediate",
    duration: "6-8 hours",
    description: "Complete guide to day trading stocks including technical analysis, risk management, and execution strategies.",
    keyPoints: [
      "Master chart patterns and technical indicators",
      "Develop strict risk management rules",
      "Use proper position sizing strategies",
      "Understand market psychology and timing",
      "Practice with paper trading first"
    ],
    successRate: "60-75%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 4
  },
  {
    strategyId: "forex-basics",
    title: "Forex Trading Foundations",
    category: "forex",
    difficulty: "Beginner",
    duration: "4-6 hours",
    description: "Essential forex trading concepts including currency pairs, leverage, and basic strategies.",
    keyPoints: [
      "Understand major, minor, and exotic currency pairs",
      "Learn to read economic calendars",
      "Master leverage and margin requirements",
      "Develop a trading plan and stick to it",
      "Use proper risk management techniques"
    ],
    successRate: "65-80%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 5
  },
  {
    strategyId: "crypto-momentum",
    title: "Crypto Momentum Trading",
    category: "crypto",
    difficulty: "Advanced",
    duration: "5-7 hours",
    description: "Advanced cryptocurrency momentum trading strategies using technical analysis and market sentiment.",
    keyPoints: [
      "Identify momentum patterns in crypto markets",
      "Use volume and volatility indicators",
      "Monitor market sentiment and news flow",
      "Implement stop-loss and take-profit levels",
      "Understand crypto market cycles"
    ],
    successRate: "55-70%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 6
  },
  {
    strategyId: "trading-psychology",
    title: "Trading Psychology Mastery",
    category: "psychology",
    difficulty: "All Levels",
    duration: "3-4 hours",
    description: "Master the mental game of trading including emotional control, discipline, and consistent execution.",
    keyPoints: [
      "Overcome fear and greed in trading",
      "Develop mental discipline and consistency",
      "Create and follow a trading routine",
      "Handle losses and drawdowns professionally",
      "Build confidence through preparation"
    ],
    successRate: "80-90%",
    isUnlocked: true,
    isCompleted: false,
    orderIndex: 7
  }
];

// Passive Income Strategies Data
const passiveIncomeData: InsertPassiveIncomeStrategy[] = [
  {
    title: "Stablecoin Lending on Aave",
    platform: "Aave",
    chain: "Ethereum",
    riskLevel: "Low",
    minROI: "2.5",
    maxROI: "8.0",
    timeCommitment: "5-10 minutes setup",
    description: "Earn steady returns by lending stablecoins on Aave, one of the most established DeFi protocols.",
    steps: [
      "Connect wallet to Aave protocol",
      "Deposit USDC, USDT, or DAI",
      "Start earning interest immediately",
      "Monitor rates and adjust as needed",
      "Withdraw anytime without penalties"
    ],
    toolsRequired: ["MetaMask wallet", "Ethereum for gas fees", "Stablecoins (USDC/USDT/DAI)"],
    exitPlan: "Withdraw funds anytime with immediate liquidity",
    riskAnalysis: "Very low risk due to stablecoin stability and Aave's proven track record",
    resources: ["Aave documentation", "DeFi safety guides", "Gas tracker tools"]
  },
  {
    title: "Uniswap V3 Liquidity Providing",
    platform: "Uniswap",
    chain: "Ethereum",
    riskLevel: "Medium",
    minROI: "5.0",
    maxROI: "25.0",
    timeCommitment: "30-60 minutes setup",
    description: "Provide liquidity to Uniswap V3 pools for trading fees and potential token rewards.",
    steps: [
      "Choose appropriate trading pair",
      "Set price range for concentrated liquidity",
      "Deposit equal value of both tokens",
      "Monitor position and adjust range",
      "Collect fees and compound returns"
    ],
    toolsRequired: ["MetaMask wallet", "50% each of two tokens", "ETH for gas fees"],
    exitPlan: "Remove liquidity anytime, though timing affects returns",
    riskAnalysis: "Medium risk due to impermanent loss and price volatility",
    resources: ["Uniswap V3 calculator", "Impermanent loss guides", "Pool analytics tools"]
  },
  {
    title: "Polygon Yield Farming",
    platform: "QuickSwap",
    chain: "Polygon",
    riskLevel: "Medium",
    minROI: "8.0",
    maxROI: "50.0",
    timeCommitment: "45 minutes setup",
    description: "High-yield farming opportunities on Polygon network with lower gas fees.",
    steps: [
      "Bridge assets to Polygon network",
      "Add liquidity to high-yield pools",
      "Stake LP tokens in farms",
      "Harvest rewards regularly",
      "Compound or diversify gains"
    ],
    toolsRequired: ["Polygon-compatible wallet", "MATIC for gas", "Farming tokens"],
    exitPlan: "Unstake and remove liquidity, bridge back to Ethereum if needed",
    riskAnalysis: "Medium to high risk due to newer tokens and smart contract risks",
    resources: ["Polygon bridge guide", "QuickSwap documentation", "Yield tracking tools"]
  }
];

// Oliver Velez Techniques Data
const oliverVelezData: InsertOliverVelezTechnique[] = [
  {
    techniqueId: "pristine-buy-setup",
    technique: "Pristine Buy Setup (PBS)",
    category: "Entry Strategies",
    difficulty: "Intermediate",
    description: "A systematic approach to identifying optimal buy entry points using moving averages and momentum.",
    timeFrame: "5-minute to daily charts",
    successRate: "65-75%",
    detailedSteps: JSON.stringify({
      setup: [
        "Stock must be above 20 SMA (short-term trend)",
        "20 SMA must be above 50 SMA (intermediate trend)",
        "Stock pulls back to test 20 SMA support",
        "Volume should be lighter on pullback",
        "Look for reversal signals near 20 SMA"
      ],
      entry: [
        "Enter when stock bounces off 20 SMA with volume",
        "Entry price should be above pullback low",
        "Confirm with candlestick reversal patterns",
        "Ensure overall market is supportive"
      ],
      stopLoss: "Place stop below 20 SMA or pullback low",
      target: "Previous high or resistance levels"
    }),
    riskManagement: JSON.stringify({
      positionSize: "1-2% of account per trade",
      stopLoss: "5-8% maximum loss",
      riskReward: "Minimum 2:1 ratio",
      timeStop: "Exit if no movement in 2-3 days"
    }),
    examples: [
      "AAPL bouncing off 20 SMA with volume confirmation",
      "TSLA pullback to 20 SMA in uptrend",
      "SPY testing moving average support"
    ]
  },
  {
    techniqueId: "pristine-sell-setup",
    technique: "Pristine Sell Setup (PSS)",
    category: "Exit Strategies",
    difficulty: "Intermediate",
    description: "Systematic approach to identifying optimal sell/short entry points using moving average resistance.",
    timeFrame: "5-minute to daily charts",
    successRate: "60-70%",
    detailedSteps: JSON.stringify({
      setup: [
        "Stock must be below 20 SMA (bearish short-term)",
        "20 SMA must be below 50 SMA (bearish intermediate)",
        "Stock rallies to test 20 SMA resistance",
        "Volume should increase on rally attempt",
        "Look for rejection signals at 20 SMA"
      ],
      entry: [
        "Enter short when stock fails at 20 SMA",
        "Entry price should be below rally high",
        "Confirm with bearish candlestick patterns",
        "Market environment should be weak"
      ],
      stopLoss: "Place stop above 20 SMA or rally high",
      target: "Previous low or support levels"
    }),
    riskManagement: JSON.stringify({
      positionSize: "1-2% of account per trade",
      stopLoss: "5-8% maximum loss",
      riskReward: "Minimum 2:1 ratio",
      marketCondition: "Best in weak market environments"
    }),
    examples: [
      "Weak stock failing at 20 SMA resistance",
      "Market leader showing distribution",
      "Breakdown below key moving averages"
    ]
  },
  {
    techniqueId: "moving-average-mastery",
    technique: "Moving Average Mastery",
    category: "Technical Analysis",
    difficulty: "Beginner",
    description: "Complete understanding and application of moving averages for trend identification and trading.",
    timeFrame: "All timeframes",
    successRate: "70-80%",
    detailedSteps: JSON.stringify({
      basics: [
        "10 SMA: Very short-term momentum",
        "20 SMA: Short-term trend direction",
        "50 SMA: Intermediate trend",
        "200 SMA: Long-term trend",
        "Moving average relationships show market health"
      ],
      signals: [
        "Price above MA = bullish bias",
        "Price below MA = bearish bias",
        "MA slope indicates trend strength",
        "MA spacing shows momentum",
        "Cross-overs signal trend changes"
      ],
      application: [
        "Use as dynamic support/resistance",
        "Trend filters for trade direction",
        "Position sizing based on MA distance",
        "Exit signals when MAs fail"
      ]
    }),
    riskManagement: JSON.stringify({
      trendAlignment: "Trade with MA trend",
      stopPlacement: "Use MAs as stop levels",
      positionSize: "Larger when aligned with trend",
      exitStrategy: "Honor MA breaks"
    }),
    examples: [
      "Using 20 SMA as dynamic support in uptrend",
      "50 SMA acting as resistance in downtrend",
      "200 SMA as major trend determinant"
    ]
  }
];

// Forex Trading Lessons Data
const forexLessonsData: InsertForexTradingLesson[] = [
  {
    lessonId: "forex-fundamentals",
    title: "Forex Market Fundamentals",
    duration: "90 minutes",
    difficulty: "Beginner",
    description: "Complete introduction to the foreign exchange market, currency pairs, and basic concepts.",
    learningObjectives: [
      "Understand what forex trading is and how it works",
      "Learn about major, minor, and exotic currency pairs",
      "Grasp concepts of base and quote currencies",
      "Understand market hours and trading sessions",
      "Learn about spreads, pips, and lot sizes"
    ],
    detailedContent: JSON.stringify({
      introduction: {
        title: "What is Forex?",
        content: "The foreign exchange market is the largest financial market in the world, with over $6 trillion traded daily. It involves buying one currency while selling another.",
        keyPoints: [
          "24-hour market, 5 days a week",
          "Decentralized global marketplace",
          "No central exchange",
          "High liquidity and low spreads"
        ]
      },
      currencyPairs: {
        title: "Understanding Currency Pairs",
        content: "Currencies are traded in pairs, with the first currency being the base and the second being the quote currency.",
        majorPairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD"],
        minorPairs: ["EUR/GBP", "EUR/JPY", "GBP/JPY", "CHF/JPY"],
        exoticPairs: ["USD/TRY", "EUR/PLN", "GBP/ZAR"]
      },
      basicConcepts: {
        pip: "The smallest price move in a currency pair (usually 4th decimal place)",
        spread: "The difference between bid and ask prices",
        lot: "Standard trading unit (100,000 units of base currency)",
        leverage: "Using borrowed money to increase potential returns"
      }
    }),
    resources: JSON.stringify({
      websites: ["Forex.com education", "BabyPips.com", "DailyFX.com"],
      books: ["Currency Trading for Dummies", "The Little Book of Currency Trading"],
      tools: ["Economic calendar", "Currency correlation matrix", "Pip calculator"]
    }),
    practicalExercises: [
      "Identify 10 major currency pairs and their characteristics",
      "Calculate pip values for different lot sizes",
      "Track EUR/USD for one week and note price movements",
      "Practice reading forex quotes and spreads"
    ],
    assessmentQuestions: [
      "What is the base currency in GBP/USD?",
      "How many pips is a move from 1.2500 to 1.2650?",
      "What time does the New York forex session open?",
      "What is the typical spread for EUR/USD during London session?"
    ]
  },
  {
    lessonId: "technical-analysis",
    title: "Forex Technical Analysis",
    duration: "120 minutes",
    difficulty: "Intermediate",
    description: "Master technical analysis for forex trading including chart patterns, indicators, and trend analysis.",
    learningObjectives: [
      "Learn to read and analyze forex charts",
      "Understand support and resistance levels",
      "Master key technical indicators",
      "Identify chart patterns and their implications",
      "Develop a technical analysis framework"
    ],
    detailedContent: JSON.stringify({
      chartBasics: {
        title: "Reading Forex Charts",
        candlesticks: "Japanese candlestick patterns show open, high, low, close",
        timeframes: "Multiple timeframe analysis for better entries",
        trends: "Uptrend (higher highs/lows), Downtrend (lower highs/lows), Sideways"
      },
      supportResistance: {
        title: "Support and Resistance",
        support: "Price level where buying pressure exceeds selling pressure",
        resistance: "Price level where selling pressure exceeds buying pressure",
        identification: "Previous highs/lows, round numbers, pivot points",
        trading: "Buy near support, sell near resistance"
      },
      indicators: {
        trend: "Moving averages (20, 50, 200 period)",
        momentum: "RSI, MACD, Stochastic",
        volatility: "Bollinger Bands, ATR",
        volume: "Volume indicators for confirmation"
      },
      patterns: {
        reversal: "Head and shoulders, double top/bottom",
        continuation: "Triangles, flags, pennants",
        candlestick: "Doji, hammer, engulfing patterns"
      }
    }),
    resources: JSON.stringify({
      platforms: ["TradingView", "MetaTrader 4/5", "cTrader"],
      books: ["Japanese Candlestick Charting", "Technical Analysis of Financial Markets"],
      courses: ["Forex technical analysis masterclass", "Chart pattern recognition"]
    }),
    practicalExercises: [
      "Identify 5 support/resistance levels on EUR/USD daily chart",
      "Find 3 chart patterns on different currency pairs",
      "Set up RSI and MACD on your trading platform",
      "Practice drawing trendlines on multiple timeframes"
    ],
    assessmentQuestions: [
      "What does a doji candlestick pattern indicate?",
      "When RSI is above 70, what might this suggest?",
      "How do you identify a valid trendline?",
      "What is the difference between support and resistance?"
    ]
  }
];

export async function seedTrainingData() {
  console.log("🌱 Seeding training strategies...");
  
  try {
    // Check if data already exists
    const existingStrategies = await storage.getAllTrainingStrategies();
    const existingPassiveIncome = await storage.getAllPassiveIncomeStrategies();
    const existingTechniques = await storage.getAllOliverVelezTechniques();
    const existingLessons = await storage.getAllForexTradingLessons();

    // Seed Training Strategies
    if (existingStrategies.length === 0) {
      for (const strategy of trainingStrategiesData) {
        await storage.createTrainingStrategy(strategy);
      }
      console.log("✅ Training strategies seeded");
    }

    // Seed Passive Income Strategies
    if (existingPassiveIncome.length === 0) {
      for (const strategy of passiveIncomeData) {
        await storage.createPassiveIncomeStrategy(strategy);
      }
      console.log("✅ Passive income strategies seeded");
    }

    // Seed Oliver Velez Techniques
    if (existingTechniques.length === 0) {
      for (const technique of oliverVelezData) {
        await storage.createOliverVelezTechnique(technique);
      }
      console.log("✅ Oliver Velez techniques seeded");
    }

    // Seed Forex Lessons
    if (existingLessons.length === 0) {
      for (const lesson of forexLessonsData) {
        await storage.createForexTradingLesson(lesson);
      }
      console.log("✅ Forex trading lessons seeded");
    }

    console.log("🎉 All training data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding training data:", error);
  }
}