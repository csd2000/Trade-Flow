import { PortfolioData, ActiveStrategy, ProtocolData, MarketData, Tutorial, ExitStrategyAlert } from '@/types';

export const mockPortfolioData: PortfolioData = {
  totalValue: "$285,650.00",
  dailyIncome: "$542.18",
  dailyChange: "+1.89%",
  incomeChange: "+8.4%",
  avgAPR: "22.1%",
  riskLevel: "Medium"
};

export const mockActiveStrategies: ActiveStrategy[] = [
  {
    id: "1",
    name: "Curve stETH/ETH LP",
    protocol: "Curve Finance",
    chain: "Ethereum",
    riskLevel: "Low",
    amount: "$42,150.00",
    apr: "5.2%",
    dailyEarnings: "$5.98",
    monthlyEarnings: "$179.40",
    status: "Active",
    icon: "ethereum",
    color: "blue"
  },
  {
    id: "2", 
    name: "Aave USDC Lending",
    protocol: "Aave",
    chain: "Polygon",
    riskLevel: "Low",
    amount: "$25,000.00",
    apr: "3.8%",
    dailyEarnings: "$2.60",
    monthlyEarnings: "$78.00",
    status: "Active",
    icon: "polygon",
    color: "purple"
  },
  {
    id: "3",
    name: "GMX GLP Staking",
    protocol: "GMX",
    chain: "Arbitrum", 
    riskLevel: "High",
    amount: "$18,500.00",
    apr: "22.4%",
    dailyEarnings: "$11.35",
    monthlyEarnings: "$340.50",
    status: "Active",
    icon: "arbitrum",
    color: "red"
  }
];

export const mockProtocols: ProtocolData[] = [
  {
    id: "1",
    name: "Curve Finance",
    chain: "Ethereum",
    category: "DEX/AMM",
    minAPR: "2.5%",
    maxAPR: "8.2%",
    tvl: "$2.1B",
    riskLevel: "Low",
    description: "Decentralized exchange optimized for stablecoin and pegged asset trading",
    icon: "layer-group",
    color: "blue"
  },
  {
    id: "2",
    name: "Aave",
    chain: "Multi-chain",
    category: "Lending",
    minAPR: "1.8%",
    maxAPR: "12.5%",
    tvl: "$8.9B",
    riskLevel: "Low",
    description: "Decentralized non-custodial liquidity market protocol",
    icon: "coins",
    color: "purple"
  },
  {
    id: "3",
    name: "GMX",
    chain: "Arbitrum",
    category: "Derivatives",
    minAPR: "15%",
    maxAPR: "35%",
    tvl: "$450M",
    riskLevel: "High",
    description: "Decentralized spot and perpetual exchange",
    icon: "fire",
    color: "red"
  },
  {
    id: "4",
    name: "Uniswap V3",
    chain: "Ethereum",
    category: "DEX/AMM",
    minAPR: "3.0%",
    maxAPR: "15.8%",
    tvl: "$3.2B",
    riskLevel: "Medium",
    description: "Automated market maker with concentrated liquidity",
    icon: "exchange-alt",
    color: "pink"
  },
  {
    id: "5",
    name: "Compound",
    chain: "Ethereum",
    category: "Lending",
    minAPR: "2.1%",
    maxAPR: "9.4%",
    tvl: "$1.8B",
    riskLevel: "Low",
    description: "Algorithmic money market protocol for lending and borrowing",
    icon: "calculator",
    color: "green"
  },
  {
    id: "6",
    name: "Yearn Finance",
    chain: "Multi-chain",
    category: "Yield Farming",
    minAPR: "4.5%",
    maxAPR: "18.9%",
    tvl: "$890M",
    riskLevel: "Medium",
    description: "Automated yield farming and optimization strategies",
    icon: "trending-up",
    color: "blue"
  },
  {
    id: "7",
    name: "Beefy Finance",
    chain: "Multi-chain",
    category: "Yield Farming",
    minAPR: "8.2%",
    maxAPR: "45.6%",
    tvl: "$650M",
    riskLevel: "Medium",
    description: "Auto-compounding yield optimizer across multiple chains",
    icon: "zap",
    color: "orange"
  },
  {
    id: "8",
    name: "Pendle",
    chain: "Ethereum",
    category: "Yield Trading",
    minAPR: "6.8%",
    maxAPR: "28.4%",
    tvl: "$420M",
    riskLevel: "High",
    description: "Protocol for trading and hedging yield",
    icon: "chart-line",
    color: "purple"
  }
];

export const mockMarketData: MarketData[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: "$117,872",
    change: "-0.07%",
    icon: "bitcoin",
    color: "orange"
  },
  {
    symbol: "ETH", 
    name: "Ethereum",
    price: "$2,967.49",
    change: "-1.05%",
    icon: "ethereum",
    color: "blue"
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: "$163.40", 
    change: "-0.40%",
    icon: "sun",
    color: "purple"
  },
  {
    symbol: "XRP",
    name: "Ripple",
    price: "$2.77",
    change: "+7.18%",
    icon: "waves",
    color: "blue"
  },
  {
    symbol: "AVAX",
    name: "Avalanche",
    price: "$20.85",
    change: "-0.22%",
    icon: "mountain",
    color: "red"
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    price: "$15.24",
    change: "-0.82%",
    icon: "link",
    color: "blue"
  }
];

export const mockTutorials: Tutorial[] = [
  {
    id: "1",
    title: "Understanding Impermanent Loss",
    description: "Learn what impermanent loss is and how to minimize it in your DeFi strategies",
    difficulty: "Beginner",
    duration: "10 min",
    category: "Risk Management"
  },
  {
    id: "2",
    title: "Yield Farming Strategies",
    description: "Explore different approaches to maximize your DeFi yields using protocols like Yearn and Beefy",
    difficulty: "Intermediate",
    duration: "15 min",
    category: "Strategy"
  },
  {
    id: "3",
    title: "Advanced LP Positioning",
    description: "Master concentrated liquidity and range orders on Uniswap V3",
    difficulty: "Advanced",
    duration: "20 min",
    category: "Advanced"
  },
  {
    id: "4",
    title: "DeFi Safety & Security",
    description: "Essential security practices for protecting your DeFi investments",
    difficulty: "Beginner",
    duration: "12 min",
    category: "Security"
  },
  {
    id: "5",
    title: "Multi-Chain Strategies",
    description: "Diversify across Ethereum, Arbitrum, Polygon, and other chains",
    difficulty: "Intermediate",
    duration: "18 min",
    category: "Strategy"
  },
  {
    id: "6",
    title: "Reading DeFi Analytics",
    description: "Understand TVL, APR, and key metrics using DeFiPulse and similar tools",
    difficulty: "Beginner",
    duration: "14 min",
    category: "Analytics"
  }
];

export const mockExitAlert: ExitStrategyAlert = {
  id: "1",
  title: "Exit Strategy Recommendation",
  description: "Based on current market conditions and your portfolio performance, consider taking some profits. Your GMX position has gained 28% and BTC is approaching resistance levels.",
  severity: "warning",
  actions: [
    { label: "Review Strategy", action: "open_exit_wizard" },
    { label: "Dismiss", action: "dismiss_alert" }
  ]
};
