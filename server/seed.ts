import { db } from "./db";
import { seedTrainingData } from "./training-seed";
import { 
  courses, 
  liveCalls, 
  cryptoProjects, 
  launchpads, 
  yieldPools,
  defiProtocols,
  users,
  portfolios
} from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if already seeded
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Sample users
    const sampleUsers = [
      {
        username: "alice_defi",
        password: "password123",
        walletAddress: "0x1234567890123456789012345678901234567890"
      },
      {
        username: "bob_trader",
        password: "password123",
        walletAddress: "0x0987654321098765432109876543210987654321"
      },
      {
        username: "charlie_yield",
        password: "password123",
        walletAddress: "0x1111222233334444555566667777888899990000"
      }
    ];

    await db.insert(users).values(sampleUsers);

    // Sample DeFi protocols
    const protocols = [
      {
        name: "Aave",
        chain: "Ethereum",
        category: "Lending",
        minAPR: "2.5",
        maxAPR: "15.8",
        tvl: "12400000000",
        riskLevel: "low",
        description: "Leading decentralized lending protocol with proven track record",
        logoUrl: "/logos/aave.png",
        isActive: true
      },
      {
        name: "Compound",
        chain: "Ethereum", 
        category: "Lending",
        minAPR: "1.8",
        maxAPR: "12.4",
        tvl: "8900000000",
        riskLevel: "low",
        description: "Established lending protocol with algorithmic interest rates",
        logoUrl: "/logos/compound.png",
        isActive: true
      },
      {
        name: "Uniswap V3",
        chain: "Ethereum",
        category: "DEX",
        minAPR: "5.2",
        maxAPR: "45.7",
        tvl: "5600000000",
        riskLevel: "medium",
        description: "Premier DEX with concentrated liquidity positions",
        logoUrl: "/logos/uniswap.png",
        isActive: true
      },
      {
        name: "PancakeSwap",
        chain: "BSC",
        category: "DEX",
        minAPR: "8.5",
        maxAPR: "125.3",
        tvl: "2100000000",
        riskLevel: "medium",
        description: "Leading BSC DEX with syrup pools and farms",
        logoUrl: "/logos/pancakeswap.png",
        isActive: true
      },
      {
        name: "Yearn Finance",
        chain: "Ethereum",
        category: "Yield Optimizer",
        minAPR: "6.8",
        maxAPR: "28.9",
        tvl: "1800000000",
        riskLevel: "medium",
        description: "Automated yield optimization strategies",
        logoUrl: "/logos/yearn.png",
        isActive: true
      },
      {
        name: "Convex Finance",
        chain: "Ethereum",
        category: "Yield Optimizer",
        minAPR: "12.4",
        maxAPR: "85.6",
        tvl: "3200000000",
        riskLevel: "medium",
        description: "Curve liquidity mining optimization platform",
        logoUrl: "/logos/convex.png",
        isActive: true
      },
      {
        name: "Anchor Protocol",
        chain: "Terra",
        category: "Stablecoin Yield",
        minAPR: "18.5",
        maxAPR: "19.5",
        tvl: "450000000",
        riskLevel: "high",
        description: "High-yield UST savings protocol",
        logoUrl: "/logos/anchor.png",
        isActive: false
      },
      {
        name: "Lido",
        chain: "Ethereum",
        category: "Staking",
        minAPR: "4.2",
        maxAPR: "6.8",
        tvl: "24500000000",
        riskLevel: "low",
        description: "Liquid staking for Ethereum 2.0",
        logoUrl: "/logos/lido.png",
        isActive: true
      }
    ];

    await db.insert(defiProtocols).values(protocols);

    // Sample courses
    const sampleCourses = [
      {
        title: "DeFi Fundamentals: Complete Beginner's Guide",
        instructor: "Dr. Sarah Chen",
        duration: "4.5 hours",
        level: "beginner" as const,
        category: "DeFi Basics",
        rating: 4.9,
        students: 15420,
        description: "Master the foundations of decentralized finance from wallets to yield farming",
        lessons: 28,
        completed: false
      },
      {
        title: "Advanced Yield Strategies & Portfolio Optimization",
        instructor: "Alex Rodriguez",
        duration: "6.2 hours",
        level: "advanced" as const,
        category: "Yield Strategies",
        rating: 4.8,
        students: 8930,
        description: "Professional-grade yield optimization techniques and risk management",
        lessons: 35,
        completed: false
      },
      {
        title: "Portfolio Rebalancing for Maximum Returns",
        instructor: "Michael Thompson",
        duration: "3.8 hours",
        level: "intermediate" as const,
        category: "Portfolio Management",
        rating: 4.7,
        students: 12650,
        description: "Systematic approaches to portfolio rebalancing and risk distribution",
        lessons: 22,
        completed: true
      },
      {
        title: "Crypto Tax Optimization Masterclass",
        instructor: "Jennifer Walsh, CPA",
        duration: "5.1 hours",
        level: "intermediate" as const,
        category: "Tax Planning",
        rating: 4.9,
        students: 6780,
        description: "Complete tax strategy for DeFi yields, staking, and trading profits",
        lessons: 31,
        completed: false
      },
      {
        title: "Technical Analysis for DeFi Trading",
        instructor: "Robert Kim",
        duration: "7.3 hours",
        level: "advanced" as const,
        category: "Trading",
        rating: 4.6,
        students: 9240,
        description: "Advanced charting techniques and trading strategies for DeFi tokens",
        lessons: 42,
        completed: false
      },
      {
        title: "Airdrop Hunting: The Complete System",
        instructor: "Emma Williams",
        duration: "2.9 hours",
        level: "beginner" as const,
        category: "Airdrops",
        rating: 4.8,
        students: 18720,
        description: "Systematic approach to discovering and qualifying for lucrative airdrops",
        lessons: 18,
        completed: false
      }
    ];

    await db.insert(courses).values(sampleCourses);

    // Sample live calls
    const sampleLiveCalls = [
      {
        title: "Weekly Market Analysis & Strategy Review",
        date: "2025-01-20",
        time: "2:00 PM EST",
        duration: "60 minutes",
        expert: "Sarah Chen & Alex Rodriguez",
        topic: "Current market conditions, new opportunities, and portfolio adjustments",
        attendees: 240,
        recording: true
      },
      {
        title: "Q&A Session: Advanced Yield Strategies",
        date: "2025-01-22",
        time: "12:00 PM EST",
        duration: "45 minutes",
        expert: "Michael Thompson",
        topic: "Live questions about complex yield optimization and risk management",
        attendees: 180,
        recording: true
      },
      {
        title: "New Project Deep Dive: AI Infrastructure",
        date: "2025-01-25",
        time: "3:00 PM EST",
        duration: "75 minutes",
        expert: "Robert Kim",
        topic: "Analysis of emerging AI infrastructure projects and investment opportunities",
        attendees: 320,
        recording: false
      }
    ];

    await db.insert(liveCalls).values(sampleLiveCalls);

    // Sample crypto projects
    const sampleProjects = [
      {
        name: "NeuralNet AI",
        symbol: "NNET",
        category: "AI Infrastructure",
        stage: "presale" as const,
        marketCap: 0,
        priceChange: 0,
        useCase: "Decentralized AI compute network",
        description: "Revolutionary AI infrastructure enabling distributed machine learning with blockchain incentives",
        fundamentalScore: 92,
        riskLevel: "medium" as const,
        launchDate: "2025-02-15",
        exchanges: ["Uniswap"],
        features: ["AI Compute", "Token Incentives", "Decentralized", "Scalable"]
      },
      {
        name: "StorageChain",
        symbol: "STOR",
        category: "DePIN Storage",
        stage: "ido" as const,
        marketCap: 15000000,
        priceChange: 12.5,
        useCase: "Decentralized storage network",
        description: "Next-generation distributed storage with built-in redundancy and encryption",
        fundamentalScore: 87,
        riskLevel: "low" as const,
        launchDate: "2025-01-30",
        exchanges: ["PancakeSwap", "Uniswap"],
        features: ["IPFS Integration", "Encrypted", "Redundant", "Cost Effective"]
      },
      {
        name: "GameFi Universe",
        symbol: "GAME",
        category: "Gaming",
        stage: "live" as const,
        marketCap: 125000000,
        priceChange: -5.2,
        useCase: "Gaming metaverse platform",
        description: "Comprehensive gaming ecosystem with NFTs, tournaments, and yield earning",
        fundamentalScore: 78,
        riskLevel: "high" as const,
        launchDate: "2024-11-20",
        exchanges: ["Binance", "Coinbase", "Uniswap"],
        features: ["NFT Gaming", "Tournaments", "Metaverse", "Play-to-Earn"]
      },
      {
        name: "DeFi Protocol X",
        symbol: "DPX",
        category: "DeFi",
        stage: "launching" as const,
        marketCap: 45000000,
        priceChange: 28.7,
        useCase: "Cross-chain yield optimization",
        description: "Advanced multi-chain yield aggregator with automated strategy execution",
        fundamentalScore: 85,
        riskLevel: "medium" as const,
        launchDate: "2025-01-18",
        exchanges: ["Uniswap", "SushiSwap"],
        features: ["Cross-chain", "Auto-compound", "Multi-strategy", "Low Fees"]
      }
    ];

    await db.insert(cryptoProjects).values(sampleProjects);

    // Sample launchpads
    const sampleLaunchpads = [
      {
        name: "Binance Launchpad",
        avgROI: "1250%",
        projects: 42,
        successRate: 94,
        tvl: "$2.8B",
        network: "BSC/Ethereum",
        requirements: ["BNB Holdings", "Verified Account", "Region Restrictions"],
        description: "Premier launchpad with highest success rate and institutional backing",
        rating: 9.5
      },
      {
        name: "Polkastarter",
        avgROI: "850%",
        projects: 178,
        successRate: 87,
        tvl: "$450M",
        network: "Polkadot/Ethereum",
        requirements: ["POLS Staking", "Whitelist", "KYC Required"],
        description: "Leading multi-chain launchpad focused on Web3 innovation",
        rating: 8.9
      },
      {
        name: "GameFi.org",
        avgROI: "650%",
        projects: 95,
        successRate: 82,
        tvl: "$280M",
        network: "BSC/Polygon",
        requirements: ["GAFI Staking", "Gaming Focus", "Community Vote"],
        description: "Specialized gaming and metaverse project launchpad",
        rating: 8.4
      },
      {
        name: "Seedify",
        avgROI: "720%",
        projects: 156,
        successRate: 89,
        tvl: "$320M",
        network: "Multi-chain",
        requirements: ["SFUND Staking", "Tier System", "Lottery Allocation"],
        description: "Community-driven launchpad with fair allocation system",
        rating: 8.7
      }
    ];

    await db.insert(launchpads).values(sampleLaunchpads);

    // Sample yield pools
    const sampleYieldPools = [
      {
        protocol: "Aave",
        name: "USDC Lending",
        chain: "Ethereum",
        apy: "8.5",
        tvl: "1200000000",
        category: "Lending",
        riskLevel: "low" as const,
        minimumDeposit: "1",
        lockupPeriod: "0",
        description: "Stable lending with variable rates based on utilization",
        verified: true,
        features: ["Variable APR", "No Lockup", "Insurance", "Governance Token"]
      },
      {
        protocol: "Uniswap V3",
        name: "ETH/USDC 0.3%",
        chain: "Ethereum",
        apy: "42.7",
        tvl: "280000000",
        category: "Liquidity Pool",
        riskLevel: "medium" as const,
        minimumDeposit: "100",
        lockupPeriod: "0",
        description: "High-yield concentrated liquidity position in popular pair",
        verified: true,
        features: ["Concentrated Liquidity", "Fee Earning", "IL Risk", "Auto-rebalance"]
      },
      {
        protocol: "Yearn Finance",
        name: "yvUSDC Vault",
        chain: "Ethereum",
        apy: "12.8",
        tvl: "450000000",
        category: "Yield Optimizer",
        riskLevel: "medium" as const,
        minimumDeposit: "1",
        lockupPeriod: "0",
        description: "Automated USDC yield optimization across multiple protocols",
        verified: true,
        features: ["Auto-compound", "Multi-strategy", "Gas Efficient", "Battle-tested"]
      },
      {
        protocol: "Convex",
        name: "3CRV Staking",
        chain: "Ethereum",
        apy: "18.9",
        tvl: "680000000",
        category: "Yield Optimizer",
        riskLevel: "medium" as const,
        minimumDeposit: "50",
        lockupPeriod: "0",
        description: "Optimized Curve stablecoin pool with CRV and CVX rewards",
        verified: true,
        features: ["Curve Boost", "Dual Rewards", "Stablecoin", "High APY"]
      },
      {
        protocol: "PancakeSwap",
        name: "CAKE Syrup Pool",
        chain: "BSC",
        apy: "65.4",
        tvl: "125000000",
        category: "Staking",
        riskLevel: "high" as const,
        minimumDeposit: "10",
        lockupPeriod: "0",
        description: "Single-asset CAKE staking with high rewards",
        verified: true,
        features: ["Single Asset", "High APY", "No IL", "Flexible"]
      },
      {
        protocol: "Lido",
        name: "stETH Staking",
        chain: "Ethereum",
        apy: "5.2",
        tvl: "24500000000",
        category: "Staking",
        riskLevel: "low" as const,
        minimumDeposit: "0.01",
        lockupPeriod: "0",
        description: "Liquid ETH 2.0 staking with immediate liquidity",
        verified: true,
        features: ["Liquid Staking", "ETH 2.0", "No Minimum", "Daily Rewards"]
      },
      {
        protocol: "Anchor",
        name: "UST Earn (Legacy)",
        chain: "Terra",
        apy: "0",
        tvl: "0",
        category: "Stablecoin Yield",
        riskLevel: "high" as const,
        minimumDeposit: "1",
        lockupPeriod: "0",
        description: "Legacy UST savings - DEPRECATED after Terra collapse",
        verified: false,
        features: ["DEPRECATED", "High Risk", "Do Not Use"]
      },
      {
        protocol: "Compound",
        name: "USDC Supply",
        chain: "Ethereum",
        apy: "6.7",
        tvl: "890000000",
        category: "Lending",
        riskLevel: "low" as const,
        minimumDeposit: "1",
        lockupPeriod: "0",
        description: "Algorithmic interest rate USDC lending",
        verified: true,
        features: ["Algorithmic Rate", "Instant Withdrawal", "COMP Rewards", "Battle-tested"]
      }
    ];

    await db.insert(yieldPools).values(sampleYieldPools);

    console.log("✅ Database seeded successfully!");
    
    // Seed training data
    await seedTrainingData();
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

export { seedDatabase };