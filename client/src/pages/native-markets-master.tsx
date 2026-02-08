import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Layers, Search, Star } from 'lucide-react';

export function NativeMarketsMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Native Markets Foundation",
      duration: "35 min",
      description: "Master the fundamentals of native markets and early-stage DeFi opportunities",
      content: {
        overview: "Build comprehensive understanding of native markets, primary token offerings, and early-stage DeFi opportunities that trade before major exchange listings, including institutional access methods.",
        keyPoints: [
          "Native markets definition and ecosystem understanding",
          "Primary vs secondary market dynamics in DeFi",
          "Early-stage opportunity identification techniques",
          "Professional market access and wallet setup requirements"
        ],
        practicalSteps: [
          "Set up professional DeFi wallet with hardware security (Ledger/Trezor)",
          "Configure access to major DEX platforms: Uniswap, SushiSwap, PancakeSwap",
          "Install and verify authentic wallet connections for native market access",
          "Establish secure seed phrase backup and recovery protocols"
        ],
        example: "Native market setup: Hardware wallet → MetaMask → Uniswap V3 → Early token at $0.001 before Coinbase listing at $0.10."
      }
    },
    {
      id: 2,
      title: "Project Research & Due Diligence", 
      duration: "38 min",
      description: "Implement institutional-grade due diligence for early-stage DeFi projects",
      content: {
        overview: "Develop professional due diligence frameworks to evaluate early-stage DeFi projects, assess legitimacy, and identify high-potential opportunities before they gain mainstream attention.",
        keyPoints: [
          "Team verification and background research methodologies",
          "Tokenomics analysis and smart contract audit assessment",
          "Community and social media sentiment analysis",
          "Professional red flag identification and scam avoidance"
        ],
        practicalSteps: [
          "Research team backgrounds using LinkedIn, GitHub, and professional networks",
          "Analyze tokenomics: supply schedule, vesting, team allocation, community rewards",
          "Review smart contract audits from Certik, ConsenSys, Trail of Bits",
          "Monitor social channels: Discord activity, Twitter engagement authenticity"
        ],
        example: "Due diligence checklist: Doxxed team ✓, Certik audit ✓, <20% team allocation ✓, active Discord ✓ = Qualified opportunity."
      }
    },
    {
      id: 3,
      title: "DEX Trading Mastery",
      duration: "32 min",
      description: "Master professional DEX trading techniques and optimal execution strategies",
      content: {
        overview: "Implement advanced DEX trading strategies including optimal timing, slippage management, and professional execution techniques for maximum profitability in native markets.",
        keyPoints: [
          "DEX selection and liquidity analysis for optimal trading",
          "Slippage optimization and MEV protection strategies",
          "Gas fee optimization and transaction timing",
          "Professional limit order and DCA strategies on DEX platforms"
        ],
        practicalSteps: [
          "Compare liquidity across multiple DEX platforms for best execution",
          "Set optimal slippage tolerance: 0.5-1% for liquid pairs, 2-5% for new tokens",
          "Use gas trackers (ETH Gas Station) for optimal transaction timing",
          "Implement DCA strategies using DeFi automation tools (Gelato, Chainlink)"
        ],
        example: "DEX execution: Check 5 DEX platforms, select highest liquidity, 1% slippage, low gas time = Save 15-30% on execution."
      }
    },
    {
      id: 4,
      title: "Liquidity Pool Analysis",
      duration: "30 min",
      description: "Master liquidity pool analysis for informed native market entry decisions",
      content: {
        overview: "Develop expertise in analyzing liquidity pools to assess market depth, identify optimal entry points, and understand the liquidity landscape of early-stage tokens.",
        keyPoints: [
          "Liquidity pool structure and depth analysis techniques",
          "Total Value Locked (TVL) assessment and implications",
          "Pool composition and impermanent loss risk evaluation",
          "Professional liquidity trend analysis and timing"
        ],
        practicalSteps: [
          "Analyze pool depth using DEX analytics: DexTools, DexGuru, DEXScreener",
          "Calculate minimum liquidity requirements for safe trading ($50K+ recommended)",
          "Monitor liquidity trends: increasing vs decreasing over time",
          "Assess pool composition: 50/50 vs weighted pools, stablecoin pairs"
        ],
        example: "Liquidity analysis: $200K TVL, 70% 30-day growth, ETH/TOKEN pair, increasing volume trend = Strong liquidity signal."
      }
    },
    {
      id: 5,
      title: "Timing & Market Entry Strategies",
      duration: "33 min",
      description: "Master optimal timing strategies for native market entry and position building",
      content: {
        overview: "Implement professional timing strategies to maximize entry opportunities in native markets, including pre-launch positioning and systematic accumulation techniques.",
        keyPoints: [
          "Pre-launch research and positioning strategies",
          "Launch day execution and volatility management",
          "Dollar-cost averaging techniques for early positions",
          "Professional entry timing using technical analysis"
        ],
        practicalSteps: [
          "Monitor project roadmaps and announcement calendars for launch timing",
          "Set up price alerts and automated buying triggers",
          "Implement systematic DCA over 2-4 weeks to build positions",
          "Use technical analysis: support/resistance on new token charts"
        ],
        example: "Entry strategy: Week 1 after launch, DCA $1000 over 4 weeks, buy dips below moving average = Optimal accumulation."
      }
    },
    {
      id: 6,
      title: "Risk Management for Native Markets",
      duration: "31 min",
      description: "Implement specialized risk management for high-volatility native market investments",
      content: {
        overview: "Develop comprehensive risk management protocols specifically designed for native market investments, including position sizing, diversification, and exit strategies.",
        keyPoints: [
          "Position sizing algorithms for high-risk/high-reward opportunities",
          "Portfolio allocation limits for speculative native market investments",
          "Stop-loss strategies adapted for extreme volatility",
          "Professional diversification across multiple early-stage projects"
        ],
        practicalSteps: [
          "Limit native market allocation to 5-10% of total crypto portfolio",
          "Use 1-2% position sizes per individual project maximum",
          "Set mental stops: -50% exit rule, +500% profit-taking levels",
          "Diversify across 10-20 projects to manage individual project risk"
        ],
        example: "Risk framework: $100K portfolio, $10K native allocation, $500-1000 per project, 20 projects maximum."
      }
    },
    {
      id: 7,
      title: "Smart Contract Interaction",
      duration: "29 min",
      description: "Master direct smart contract interaction for advanced native market strategies",
      content: {
        overview: "Develop skills in direct smart contract interaction for advanced strategies including presales, staking, and early protocol participation.",
        keyPoints: [
          "Smart contract verification and interaction safety protocols",
          "Direct contract interaction using Etherscan and block explorers",
          "Presale and IDO participation strategies",
          "Professional protocol interaction and early farming opportunities"
        ],
        practicalSteps: [
          "Learn to verify contracts on Etherscan before interaction",
          "Practice reading contract functions and understanding parameters",
          "Participate in legitimate presales with proper due diligence",
          "Set up early farming positions in new protocols with high APY"
        ],
        example: "Contract interaction: Verify on Etherscan → Read contract → Test with small amount → Execute full strategy safely."
      }
    },
    {
      id: 8,
      title: "Airdrop and Incentive Strategies",
      duration: "27 min",
      description: "Master airdrop hunting and protocol incentive strategies for additional returns",
      content: {
        overview: "Implement systematic approaches to capture airdrops, protocol incentives, and early user rewards that often accompany native market opportunities.",
        keyPoints: [
          "Airdrop eligibility requirements and strategy optimization",
          "Early protocol interaction for maximum reward qualification",
          "Multi-wallet strategies for increased airdrop allocation",
          "Professional tracking and claiming of protocol rewards"
        ],
        practicalSteps: [
          "Research upcoming protocols and airdrop speculation opportunities",
          "Interact with testnets and early protocol versions",
          "Maintain transaction history and early user status",
          "Set up systematic airdrop tracking and claiming schedules"
        ],
        example: "Airdrop strategy: Early Uniswap users received $12K+ UNI tokens, early Arbitrum users got $10K+ ARB tokens."
      }
    },
    {
      id: 9,
      title: "Portfolio Tracking & Analytics",
      duration: "26 min",
      description: "Implement professional portfolio tracking for native market investments",
      content: {
        overview: "Develop comprehensive tracking systems for native market investments including performance analytics, cost basis tracking, and tax optimization.",
        keyPoints: [
          "Multi-wallet portfolio aggregation and tracking",
          "Cost basis calculation for complex DeFi transactions",
          "Performance analytics and ROI measurement",
          "Professional tax reporting and record keeping"
        ],
        practicalSteps: [
          "Set up portfolio tracking: DeBank, Zapper, or Zerion for DeFi positions",
          "Track cost basis using Koinly or CoinTracker for tax purposes",
          "Monitor performance metrics: total return, individual project performance",
          "Maintain detailed transaction records for tax compliance"
        ],
        example: "Portfolio tracking: DeBank shows $50K total value, 15 native positions, 285% total return, organized for taxes."
      }
    },
    {
      id: 10,
      title: "Exit Strategy Development",
      duration: "28 min",
      description: "Master systematic exit strategies for native market investments",
      content: {
        overview: "Implement professional exit strategies to maximize profits from native market investments while managing risk through systematic profit-taking protocols.",
        keyPoints: [
          "Systematic profit-taking schedules and level identification",
          "Major exchange listing preparation and timing",
          "Liquidity assessment for large position exits",
          "Professional portfolio rebalancing and reinvestment strategies"
        ],
        practicalSteps: [
          "Set profit-taking levels: 25% at 5x, 25% at 10x, 25% at 20x, 25% at 50x+",
          "Monitor exchange listing rumors and announcements",
          "Assess exit liquidity before taking large profits",
          "Reinvest profits into new native market opportunities systematically"
        ],
        example: "Exit strategy: Token bought at $0.01, sell 25% at $0.05, 25% at $0.10, 25% at $0.20, hold 25% for moonshot."
      }
    },
    {
      id: 11,
      title: "Advanced Research Tools",
      duration: "34 min",
      description: "Master professional research tools and information sources for native market analysis",
      content: {
        overview: "Implement advanced research methodologies using professional tools and data sources to identify and analyze native market opportunities before they become mainstream.",
        keyPoints: [
          "On-chain analytics tools for deep project research",
          "Social sentiment analysis and community monitoring",
          "Insider information identification and verification",
          "Professional research workflow and systematic screening"
        ],
        practicalSteps: [
          "Use on-chain tools: Dune Analytics, DeFiPulse, Nansen for wallet tracking",
          "Monitor social sentiment: LunarCrush, Santiment for community analysis",
          "Track venture capital investments and insider activity",
          "Develop systematic screening criteria and research checklists"
        ],
        example: "Research workflow: Dune Analytics shows whale accumulation + LunarCrush sentiment spike = High-priority research target."
      }
    },
    {
      id: 12,
      title: "Regulatory & Compliance Awareness",
      duration: "25 min",
      description: "Master regulatory awareness and compliance for native market investments",
      content: {
        overview: "Develop understanding of regulatory landscape and compliance requirements for native market investments, including tax implications and legal considerations.",
        keyPoints: [
          "Regulatory landscape understanding for DeFi investments",
          "Tax implications and reporting requirements",
          "Geographic restrictions and compliance considerations",
          "Professional legal risk assessment and mitigation"
        ],
        practicalSteps: [
          "Research local regulations regarding DeFi and early-stage crypto investments",
          "Understand tax implications: short-term vs long-term capital gains",
          "Verify project compliance and regulatory standing",
          "Consult tax professionals for complex DeFi transaction reporting"
        ],
        example: "Compliance check: Project registered legally ✓, tax strategy planned ✓, geographic access confirmed ✓ = Compliant investment."
      }
    },
    {
      id: 13,
      title: "Advanced Scaling Strategies",
      duration: "30 min",
      description: "Master advanced scaling and optimization techniques for native market success",
      content: {
        overview: "Implement advanced scaling strategies to systematically grow native market investments while maintaining risk control and optimizing for maximum long-term returns.",
        keyPoints: [
          "Systematic reinvestment and compounding strategies",
          "Advanced position sizing and portfolio optimization",
          "Professional network building and information advantages",
          "Institutional-grade scaling and wealth management techniques"
        ],
        practicalSteps: [
          "Reinvest 50% of profits into new native market opportunities",
          "Scale position sizes based on track record and confidence levels",
          "Build network of other native market investors for information sharing",
          "Implement wealth management strategies as portfolio grows"
        ],
        example: "Scaling strategy: $10K → $100K → reinvest $50K, withdraw $25K, lifestyle $25K = Sustainable growth model."
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
            <Layers className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Strategy #22</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Native Markets Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master step-by-step native market buying strategies for early-stage DeFi opportunities before they reach major exchanges, with institutional-grade due diligence and professional risk management
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/13 Lessons</span>
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
                <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-green-600" />
              Native Markets Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Step-by-step native market identification and access</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Professional due diligence for early-stage projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Advanced DEX trading and liquidity pool strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Institutional-grade risk assessment and scaling</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Early Opportunity Capture</div>
                    <div className="text-sm text-green-700">10-100x potential returns before major listings</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Success Rate</div>
                    <div className="text-sm text-blue-700">70%+ winners with proper due diligence</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Risk Control</div>
                    <div className="text-sm text-purple-700">Maximum 5-10% portfolio allocation</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Important Risk Disclosure</h4>
                <p className="text-orange-700 text-sm">
                  Native market investments are extremely high-risk and speculative. Many projects fail completely (100% loss). 
                  Only invest amounts you can afford to lose entirely. This strategy requires advanced DeFi knowledge and significant risk tolerance. 
                  Always conduct thorough due diligence and never invest more than 5-10% of your total crypto portfolio in native markets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Native Markets Curriculum</h2>
          
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
                          <Layers className="h-6 w-6 text-green-600" />
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
                          <Layers className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
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
                        <Layers className="h-4 w-4 mr-2" />
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
              <Layers className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Native Markets Master Complete!
              </h3>
              <p className="text-green-800 mb-6">
                You've mastered all 13 lessons of native markets trading. 
                You're now equipped with step-by-step buying strategies, professional due diligence, advanced DEX trading, and institutional-grade risk management for early-stage DeFi opportunities.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Layers className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Native Market Access</div>
                  <div className="text-sm text-gray-600">Step-by-step buying mastery</div>
                </div>
                <div className="text-center">
                  <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Professional Due Diligence</div>
                  <div className="text-sm text-gray-600">Institutional-grade research</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Early Opportunity Capture</div>
                  <div className="text-sm text-gray-600">10-100x potential returns</div>
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
            <CardTitle>Complement Your Native Markets Skills</CardTitle>
            <CardDescription>
              Enhance your DeFi approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">DeFi Yield Master</h4>
                <p className="text-purple-700 text-sm">Advanced yield farming</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/16')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Profit Taking Master</h4>
                <p className="text-blue-700 text-sm">Strategic exit optimization</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/4')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Risk Management</h4>
                <p className="text-green-700 text-sm">Advanced portfolio protection</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/8')}
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