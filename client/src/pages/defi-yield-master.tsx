import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Coins, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';

export function DeFiYieldMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "DeFi Foundation & Market Access",
      duration: "22 min",
      description: "Master the fundamentals of decentralized finance and access hidden markets before mainstream adoption",
      content: {
        overview: "Understand the DeFi ecosystem structure, institutional access points, and how to identify opportunities before tokens reach major exchanges.",
        keyPoints: [
          "DeFi ecosystem architecture and core protocols",
          "Institutional investment patterns and hedge fund strategies",
          "Early token identification before exchange listings",
          "Understanding yield farming vs traditional investing returns"
        ],
        practicalSteps: [
          "Set up hardware wallet with multi-chain support (Ethereum, Polygon, Arbitrum)",
          "Configure DeFi portfolio tracking tools (DeBank, Zapper, Zerion)",
          "Research institutional DeFi positions using Nansen or similar analytics",
          "Create watchlist system for pre-exchange token opportunities"
        ],
        example: "Example: Uniswap (UNI) tokens were available to liquidity providers at $0.40 before Coinbase listing at $3.00+ (750% gain opportunity)."
      }
    },
    {
      id: 2,
      title: "Smart Contract Security & Due Diligence",
      duration: "25 min", 
      description: "Develop institutional-grade security practices for smart contract interaction and protocol evaluation",
      content: {
        overview: "Learn comprehensive security frameworks to protect capital while maximizing DeFi opportunities through systematic risk assessment.",
        keyPoints: [
          "Smart contract audit evaluation and risk scoring",
          "Protocol TVL analysis and sustainability metrics",
          "Rug pull detection patterns and warning signs",
          "Insurance protocols and risk mitigation strategies"
        ],
        practicalSteps: [
          "Use tools like DeFiSafety.com for protocol security scoring",
          "Implement multi-signature wallet setup for larger positions",
          "Create systematic due diligence checklist for all protocols",
          "Set up protocol monitoring alerts for TVL and audit changes"
        ],
        example: "Security framework: Only interact with protocols having 90+ DeFiSafety scores, audits by top firms, and $100M+ TVL stability."
      }
    },
    {
      id: 3,
      title: "Yield Farming Optimization Strategies",
      duration: "28 min",
      description: "Master advanced yield farming techniques for maximizing returns across multiple protocols",
      content: {
        overview: "Implement systematic yield farming strategies that institutions use to generate consistent 20-60% APY through strategic liquidity provision.",
        keyPoints: [
          "Liquidity pool selection and APY optimization",
          "Impermanent loss calculation and mitigation strategies", 
          "Auto-compounding vault strategies and fee optimization",
          "Cross-chain yield farming for diversification"
        ],
        practicalSteps: [
          "Identify highest APY opportunities using yield tracking tools",
          "Calculate impermanent loss risk for each pool using simulators",
          "Set up auto-compounding positions in Yearn, Beefy, or similar",
          "Implement cross-chain strategies using bridges and Layer 2 solutions"
        ],
        example: "Strategy: USDC-USDT Curve pool (5% base APY) + CRV rewards (15% APY) + convex boost (8% APY) = 28% total APY."
      }
    },
    {
      id: 4,
      title: "Liquidity Mining & Token Rewards",
      duration: "24 min",
      description: "Extract maximum value from governance tokens and liquidity mining programs",
      content: {
        overview: "Understand how institutions approach liquidity mining to earn protocol tokens while providing liquidity, maximizing both fees and token appreciation.",
        keyPoints: [
          "Governance token value accrual mechanisms",
          "Liquidity mining program evaluation and timing",
          "Token lock-up strategies and vesting optimization",
          "DAO governance participation for additional rewards"
        ],
        practicalSteps: [
          "Identify new liquidity mining programs using DeFiPulse and DefiLlama",
          "Calculate token emission rates and dilution schedules",
          "Set up governance token staking for additional yield",
          "Create systematic token claiming and reinvestment schedule"
        ],
        example: "Compound liquidity mining: Provide USDT to earn 8% lending APY + COMP tokens worth additional 12% APY at launch."
      }
    },
    {
      id: 5,
      title: "Lending & Borrowing Optimization",
      duration: "26 min",
      description: "Master DeFi lending protocols for capital efficiency and leveraged strategies",
      content: {
        overview: "Utilize institutional lending strategies across Compound, Aave, and other protocols to maximize capital efficiency and create leveraged yield positions.",
        keyPoints: [
          "Collateralization ratios and liquidation risk management",
          "Interest rate optimization across multiple protocols",
          "Leveraged yield farming using borrowed capital",
          "Flash loan strategies for arbitrage opportunities"
        ],
        practicalSteps: [
          "Compare lending rates across Compound, Aave, and Maker protocols",
          "Set up collateralized debt positions with conservative ratios",
          "Implement automated liquidation protection using DeFiSaver",
          "Practice flash loan strategies on testnets before live deployment"
        ],
        example: "Leveraged strategy: Supply ETH as collateral, borrow USDC at 5%, supply to 12% yield farm for 7% net leveraged return."
      }
    },
    {
      id: 6,
      title: "DEX Trading & Arbitrage Systems", 
      duration: "30 min",
      description: "Execute advanced trading strategies and arbitrage opportunities across decentralized exchanges",
      content: {
        overview: "Implement systematic trading strategies using DEX aggregators and identify arbitrage opportunities that institutions exploit for consistent profits.",
        keyPoints: [
          "DEX aggregator optimization for best execution prices",
          "Cross-DEX arbitrage identification and execution",
          "MEV (Maximal Extractable Value) protection strategies",
          "Automated trading bot deployment and management"
        ],
        practicalSteps: [
          "Use 1inch or Paraswap for optimal trade routing across DEXs",
          "Set up arbitrage monitoring across Uniswap, SushiSwap, Curve",
          "Implement MEV protection using Flashbots or private mempools",
          "Deploy simple arbitrage bots using frameworks like DeFiBot"
        ],
        example: "Arbitrage opportunity: ETH trading at $2,000 on Uniswap vs $2,005 on Sushiswap = $5 profit per ETH traded."
      }
    },
    {
      id: 7,
      title: "Layer 2 & Cross-Chain Strategies",
      duration: "27 min",
      description: "Leverage Layer 2 solutions and cross-chain protocols for cost optimization and expanded opportunities",
      content: {
        overview: "Access higher yields and lower costs through Layer 2 solutions and cross-chain protocols, following institutional multi-chain strategies.",
        keyPoints: [
          "Polygon, Arbitrum, and Optimism ecosystem navigation",
          "Cross-chain bridge strategies and security considerations",
          "Layer 2 native protocols and exclusive opportunities",
          "Gas optimization techniques for cost efficiency"
        ],
        practicalSteps: [
          "Bridge assets to Polygon for lower-cost DeFi interactions",
          "Explore Arbitrum and Optimism native protocols and incentives",
          "Set up multi-chain portfolio tracking and management",
          "Implement gas optimization strategies using tools like Gas Now"
        ],
        example: "L2 advantage: Uniswap V3 position management costs $200+ on Ethereum vs $0.50 on Polygon for same returns."
      }
    },
    {
      id: 8,
      title: "Stablecoin Strategies & Risk Management",
      duration: "23 min",
      description: "Optimize stablecoin allocations and manage risks across different stablecoin protocols",
      content: {
        overview: "Implement institutional stablecoin strategies to maximize yield while managing depeg risks and regulatory considerations.",
        keyPoints: [
          "Stablecoin risk assessment and diversification strategies",
          "Yield optimization across USDC, USDT, DAI, and FRAX",
          "Depeg protection and insurance strategies",
          "Regulatory compliance and reporting considerations"
        ],
        practicalSteps: [
          "Diversify stablecoin holdings across different backing mechanisms",
          "Monitor stablecoin health using tools like DeFiPulse Stablecoin tracker",
          "Set up depeg alerts and emergency exit strategies",
          "Implement tax-efficient stablecoin yield strategies"
        ],
        example: "Diversified approach: 40% USDC (centralized), 30% DAI (decentralized), 20% FRAX (algorithmic), 10% emergency cash."
      }
    },
    {
      id: 9,
      title: "Portfolio Construction & Rebalancing",
      duration: "29 min",
      description: "Build and manage diversified DeFi portfolios using institutional allocation strategies",
      content: {
        overview: "Construct optimal DeFi portfolios that balance risk and return while implementing systematic rebalancing for long-term growth.",
        keyPoints: [
          "DeFi portfolio allocation models and risk budgeting",
          "Systematic rebalancing triggers and execution strategies",
          "Correlation analysis between DeFi protocols and strategies",
          "Performance tracking and attribution analysis"
        ],
        practicalSteps: [
          "Create target allocation percentages for different DeFi strategies",
          "Set up automated rebalancing using tools like Set Protocol",
          "Track portfolio performance using DeBank or Zapper analytics",
          "Implement systematic review schedule for allocation adjustments"
        ],
        example: "Institutional allocation: 40% stable yield farming, 30% lending/borrowing, 20% LP positions, 10% speculative tokens."
      }
    },
    {
      id: 10,
      title: "Tax Optimization & Reporting",
      duration: "21 min",
      description: "Implement tax-efficient DeFi strategies and maintain comprehensive transaction records",
      content: {
        overview: "Navigate DeFi tax implications using institutional strategies for optimization while maintaining compliance with reporting requirements.",
        keyPoints: [
          "DeFi transaction categorization for tax purposes",
          "Yield farming tax treatment and optimization strategies",
          "Loss harvesting opportunities in DeFi positions",
          "International tax considerations for cross-chain activities"
        ],
        practicalSteps: [
          "Use tools like Koinly or TokenTax for DeFi transaction tracking",
          "Implement tax-loss harvesting strategies for DeFi positions",
          "Maintain detailed records of all protocol interactions",
          "Consult with crypto-specialized tax professionals for optimization"
        ],
        example: "Tax optimization: Harvest losses on underperforming LP tokens while maintaining similar exposure through correlated pairs."
      }
    },
    {
      id: 11,
      title: "Advanced Protocol Strategies",
      duration: "32 min",
      description: "Master cutting-edge DeFi protocols and emerging yield opportunities",
      content: {
        overview: "Access institutional-level strategies using advanced protocols like options vaults, perpetual futures, and structured products.",
        keyPoints: [
          "Options strategies using Ribbon Finance and Dopex",
          "Perpetual futures funding rate arbitrage",
          "Structured DeFi products and automated strategies",
          "Real World Asset (RWA) protocols and institutional adoption"
        ],
        practicalSteps: [
          "Deploy covered call strategies using Ribbon Protocol vaults",
          "Implement funding rate arbitrage on GMX or dYdX",
          "Explore structured products on platforms like Pendle or Element",
          "Research emerging RWA protocols for institutional yield"
        ],
        example: "Advanced strategy: Ribbon ETH covered calls generate 20-40% APY through systematic options premiums collection."
      }
    },
    {
      id: 12,
      title: "Institutional DeFi Implementation",
      duration: "35 min",
      description: "Scale to institutional-level DeFi operations with proper infrastructure and risk management",
      content: {
        overview: "Implement enterprise-grade DeFi operations including institutional custody, risk management systems, and scalable execution strategies.",
        keyPoints: [
          "Institutional custody solutions and security frameworks",
          "Systematic risk monitoring and automated alerts",
          "Scalable execution strategies for large capital deployment",
          "Regulatory compliance and institutional reporting requirements"
        ],
        practicalSteps: [
          "Implement multi-signature treasury management systems",
          "Set up comprehensive risk monitoring dashboards",
          "Create systematic execution strategies for large positions",
          "Establish institutional-grade reporting and compliance procedures"
        ],
        example: "Institutional setup: $10M+ AUM requires multi-sig custody, automated risk monitoring, and systematic execution to avoid slippage."
      }
    }
  ];

  const handleLessonComplete = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const progressPercentage = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Academy
          </Button>
        </div>

        {/* Strategy Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4">
            <Coins className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Strategy #16</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DeFi Yield Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master institutional-grade DeFi strategies for accessing hidden markets, yield farming optimization, and generating consistent returns before mainstream adoption
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/12 Lessons</span>
            </div>
            <Progress value={progressPercentage} className="w-full mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedLessons.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{lessons.length - completedLessons.length}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-green-600" />
              Institutional DeFi Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Access tokens before exchange listings (up to 957X potential)</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Institutional yield farming strategies (20-60% APY)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Advanced security and risk management protocols</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Cross-chain and Layer 2 optimization strategies</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Annual Returns</div>
                    <div className="text-sm text-green-700">20-60% APY through yield strategies</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Early Access</div>
                    <div className="text-sm text-blue-700">Pre-exchange token opportunities</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Risk Management</div>
                    <div className="text-sm text-purple-700">Institutional-grade security</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete DeFi Mastery Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-green-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Coins className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Lesson {lesson.id}: {lesson.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span>{lesson.description}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{lesson.duration}</span>
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800">
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Overview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Overview</h4>
                    <p className="text-gray-700">{lesson.content.overview}</p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Learning Points</h4>
                    <ul className="space-y-2">
                      {lesson.content.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Coins className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <div className="bg-green-50 rounded-lg p-4">
                      <ol className="space-y-2">
                        {lesson.content.practicalSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-green-800">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Practical Example</h4>
                    <p className="text-blue-800">{lesson.content.example}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-8"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Complete Lesson
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Lesson Completed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Completion Message */}
        {completedLessons.length === lessons.length && (
          <Card className="mt-8 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="text-center py-8">
              <Coins className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                DeFi Yield Master Complete!
              </h3>
              <p className="text-green-800 mb-6">
                You've mastered all 12 lessons of institutional-grade DeFi strategies. 
                You're now equipped to access hidden markets and generate consistent yields like hedge funds and institutions.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Coins className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Market Access</div>
                  <div className="text-sm text-gray-600">Pre-exchange opportunities</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Yield Optimization</div>
                  <div className="text-sm text-gray-600">20-60% annual returns</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Institutional security</div>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-green-600 hover:bg-green-700"
              >
                Return to Trading Academy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Strategies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complement Your DeFi Skills</CardTitle>
            <CardDescription>
              Enhance your DeFi approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Systematic Trading</h4>
                <p className="text-purple-700 text-sm">Algorithmic execution systems</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/14')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-semibold text-yellow-900">Lightning Scalping</h4>
                <p className="text-yellow-700 text-sm">High-speed trading techniques</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/15')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Primary Markets</h4>
                <p className="text-blue-700 text-sm">Pre-exchange access strategies</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/12')}
                >
                  Learn Strategy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}