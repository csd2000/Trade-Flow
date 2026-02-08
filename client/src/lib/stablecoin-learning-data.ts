import { StablecoinLearningModule, ConversionExample, StablecoinType, ConversionTiming, TaxScenario } from "@/types/stablecoin-learning";

export const stablecoinLearningModule: StablecoinLearningModule = {
  id: "stablecoin-conversion-guide",
  title: "Cryptocurrency to Stablecoin Conversion Guide",
  description: "Learn when and how to convert your crypto to stablecoins, understand tax implications, and master strategic timing for maximum profit.",
  difficulty: "Intermediate",
  duration: "45 minutes",
  sections: [
    {
      id: "introduction",
      title: "What Are Stablecoins?",
      type: "text",
      content: "Stablecoins are cryptocurrencies specifically designed to maintain a stable value relative to a reference asset, typically the US Dollar. Unlike volatile cryptocurrencies like Bitcoin or Ethereum, stablecoins offer price stability while remaining within the crypto ecosystem.",
      keyPoints: [
        "Stablecoins maintain stable value through various mechanisms",
        "They bridge traditional finance and DeFi",
        "Popular stablecoins include USDT, USDC, DAI, and BUSD",
        "Used for trading, lending, and as a store of value"
      ]
    },
    {
      id: "why-convert",
      title: "Why Convert to Stablecoins?",
      type: "text",
      content: "Converting crypto to stablecoins serves multiple strategic purposes in your DeFi journey. It's not just about avoiding volatility – it's about positioning yourself for better opportunities.",
      keyPoints: [
        "Preserve capital during market downturns",
        "Lock in profits without leaving crypto",
        "Earn yield through DeFi protocols",
        "Maintain liquidity for future investments",
        "Reduce portfolio volatility",
        "Easier economic transactions and planning"
      ]
    },
    {
      id: "tax-implications",
      title: "Tax Implications: 3 Key Scenarios",
      type: "interactive",
      content: "Converting cryptocurrency to stablecoins is a taxable event according to the IRS. Understanding the tax implications is crucial for proper planning.",
      keyPoints: [
        "Crypto is treated as property for tax purposes",
        "Conversion triggers capital gains/losses calculation",
        "Short-term vs long-term holding periods affect tax rates",
        "Capital losses can offset gains",
        "Record keeping is essential"
      ]
    },
    {
      id: "timing-strategy",
      title: "Strategic Timing for Conversions",
      type: "interactive",
      content: "Knowing when to convert your crypto to stablecoins can significantly impact your investment returns. Here are the key indicators and strategies.",
      keyPoints: [
        "Market volatility indicators",
        "Profit-taking opportunities",
        "Bear market protection",
        "Portfolio rebalancing needs",
        "DeFi yield opportunities"
      ]
    },
    {
      id: "stablecoin-types",
      title: "Types of Stablecoins",
      type: "text",
      content: "Not all stablecoins are created equal. Understanding the different types and their backing mechanisms helps you choose the right one for your needs.",
      keyPoints: [
        "Fiat-collateralized (USDT, USDC)",
        "Crypto-collateralized (DAI)",
        "Algorithmic stablecoins",
        "Regulatory considerations",
        "Transparency and auditing"
      ]
    },
    {
      id: "practical-implementation",
      title: "How to Convert: Step-by-Step",
      type: "interactive",
      content: "Learn the practical steps to convert your crypto to stablecoins using various platforms and methods.",
      keyPoints: [
        "Centralized exchanges (Coinbase, Binance)",
        "Decentralized exchanges (Uniswap, Curve)",
        "Direct wallet swaps",
        "Gas fees and slippage considerations",
        "Security best practices"
      ]
    }
  ],
  resources: [
    {
      title: "IRS Crypto Tax Guidelines",
      url: "https://www.irs.gov/businesses/small-businesses-self-employed/virtual-currencies",
      type: "official"
    },
    {
      title: "Stablecoin Comparison Chart",
      url: "#",
      type: "tool"
    },
    {
      title: "Tax Calculator",
      url: "#",
      type: "tool"
    }
  ]
};

export const conversionExamples: ConversionExample[] = [
  {
    id: "short-term-gain",
    title: "Short-term Capital Gains",
    scenario: "Alison bought 1 Bitcoin for $10,000 in January 2023 and converted it to USDT when Bitcoin reached $15,000 in June 2023.",
    initialValue: 10000,
    finalValue: 15000,
    holdingPeriod: 150, // days
    taxBracket: 24,
    gain: 5000,
    taxOwed: 1200,
    type: "short-term"
  },
  {
    id: "long-term-gain",
    title: "Long-term Capital Gains",
    scenario: "Blake bought 1 Bitcoin for $10,000 in January 2022 and converted it to USDT when Bitcoin reached $20,000 in February 2023.",
    initialValue: 10000,
    finalValue: 20000,
    holdingPeriod: 400, // days
    taxBracket: 15,
    gain: 10000,
    taxOwed: 1500,
    type: "long-term"
  },
  {
    id: "capital-loss",
    title: "Capital Loss",
    scenario: "Charlie bought 1 Ethereum for $2,000 in March 2023 and converted it to DAI when Ethereum dropped to $1,500 in August 2023.",
    initialValue: 2000,
    finalValue: 1500,
    holdingPeriod: 150, // days
    taxBracket: 35,
    gain: -500,
    taxOwed: 0,
    type: "loss"
  }
];

export const stablecoinTypes: StablecoinType[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    description: "Fully regulated stablecoin backed by US dollar reserves",
    backing: "US Dollar (1:1)",
    riskLevel: "Low",
    popularity: 95,
    useCases: ["Trading", "DeFi", "Payments", "Savings"],
    pros: ["Regulated", "Transparent", "Widely accepted", "Monthly audits"],
    cons: ["Centralized", "Freezable accounts"]
  },
  {
    name: "Tether",
    symbol: "USDT",
    description: "Most widely used stablecoin with highest liquidity",
    backing: "US Dollar + Commercial Paper",
    riskLevel: "Medium",
    popularity: 98,
    useCases: ["Trading", "Arbitrage", "Store of value"],
    pros: ["Highest liquidity", "Widely accepted", "Established"],
    cons: ["Transparency concerns", "Regulatory scrutiny"]
  },
  {
    name: "Dai",
    symbol: "DAI",
    description: "Decentralized stablecoin backed by crypto collateral",
    backing: "Ethereum + Other Crypto",
    riskLevel: "Medium",
    popularity: 80,
    useCases: ["DeFi", "Lending", "Borrowing"],
    pros: ["Decentralized", "Transparent", "Censorship resistant"],
    cons: ["Complex mechanism", "Crypto volatility risk"]
  },
  {
    name: "Binance USD",
    symbol: "BUSD",
    description: "Regulated stablecoin by Binance and Paxos",
    backing: "US Dollar (1:1)",
    riskLevel: "Low",
    popularity: 85,
    useCases: ["Trading", "Binance ecosystem"],
    pros: ["Regulated", "Low fees on Binance", "Transparent"],
    cons: ["Limited to Binance ecosystem", "Being phased out"]
  }
];

export const conversionTimings: ConversionTiming[] = [
  {
    condition: "High Market Volatility",
    description: "Convert when daily price swings exceed 5% to preserve capital",
    indicators: ["VIX above 30", "Bitcoin volatility >80%", "Market fear index >70"],
    riskLevel: "High",
    color: "bg-red-500"
  },
  {
    condition: "Profit Taking",
    description: "Lock in gains after significant price appreciation",
    indicators: ["Portfolio up 50%+", "Reaching resistance levels", "Overbought conditions"],
    riskLevel: "Medium",
    color: "bg-green-500"
  },
  {
    condition: "Bear Market Protection",
    description: "Preserve capital during sustained downtrends",
    indicators: ["20% decline from ATH", "Breaking support levels", "Negative market sentiment"],
    riskLevel: "Low",
    color: "bg-blue-500"
  },
  {
    condition: "DeFi Yield Opportunities",
    description: "Earn stable returns through lending and liquidity provision",
    indicators: ["Stablecoin yields >5%", "Attractive lending rates", "New DeFi protocols"],
    riskLevel: "Medium",
    color: "bg-purple-500"
  }
];

export const taxScenarios: TaxScenario[] = [
  {
    name: "Short-term Capital Gains",
    description: "Crypto held for 365 days or less, taxed as ordinary income",
    example: conversionExamples[0],
    taxRate: 24,
    tips: [
      "Consider holding for longer to qualify for long-term rates",
      "Harvest losses to offset gains",
      "Time conversions across tax years"
    ]
  },
  {
    name: "Long-term Capital Gains",
    description: "Crypto held for more than 365 days, taxed at preferential rates",
    example: conversionExamples[1],
    taxRate: 15,
    tips: [
      "Hold for at least one year when possible",
      "Consider tax-loss harvesting",
      "Plan conversions around tax brackets"
    ]
  },
  {
    name: "Capital Losses",
    description: "When crypto decreases in value, losses can offset other gains",
    example: conversionExamples[2],
    taxRate: 0,
    tips: [
      "Harvest losses to offset gains",
      "Can deduct up to $3,000 annually",
      "Carry forward excess losses"
    ]
  }
];

export const learningQuiz = [
  {
    id: "q1",
    question: "What happens tax-wise when you convert crypto to stablecoins?",
    options: [
      "No tax implications since both are cryptocurrencies",
      "It's a taxable event that triggers capital gains/losses",
      "Only taxable if you convert back to fiat",
      "Tax is deferred until you sell the stablecoin"
    ],
    correctAnswer: 1,
    explanation: "Converting crypto to stablecoins is treated as a disposal event by the IRS, triggering capital gains or losses calculation."
  },
  {
    id: "q2",
    question: "What's the main advantage of long-term capital gains tax rates?",
    options: [
      "No tax is owed",
      "Lower tax rates (0%, 15%, or 20%)",
      "Can defer tax for another year",
      "Higher deduction limits"
    ],
    correctAnswer: 1,
    explanation: "Long-term capital gains (assets held >365 days) are taxed at preferential rates of 0%, 15%, or 20% depending on income."
  },
  {
    id: "q3",
    question: "Which stablecoin is considered most decentralized?",
    options: ["USDT", "USDC", "DAI", "BUSD"],
    correctAnswer: 2,
    explanation: "DAI is backed by crypto collateral and governed by decentralized protocols, making it the most decentralized option."
  }
];