import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, Layers, TrendingUp, Shield, Search, Users } from 'lucide-react';

export function PrimaryMarketsMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Primary Markets Foundation",
      duration: "40 min",
      description: "Master the fundamentals of primary cryptocurrency markets and early-stage investment opportunities",
      content: {
        overview: "Build comprehensive understanding of primary cryptocurrency markets where blockchain projects launch before mainstream exchange listings, including institutional access methods and systematic opportunity identification.",
        keyPoints: [
          "Primary vs secondary market dynamics in cryptocurrency",
          "Early-stage blockchain project lifecycle understanding",
          "Professional market access requirements and infrastructure",
          "Systematic opportunity identification methodologies"
        ],
        practicalSteps: [
          "Set up professional investment infrastructure: hardware wallets, institutional DEX access",
          "Establish relationships with early-stage project accelerators and incubators",
          "Configure monitoring systems for upcoming token generation events (TGEs)",
          "Build systematic screening criteria for primary market opportunities"
        ],
        example: "Primary market flow: Private sale at $0.01 → Public sale at $0.05 → DEX listing at $0.10 → CEX listing at $0.50+."
      }
    },
    {
      id: 2,
      title: "Institutional Allocation Strategies", 
      duration: "42 min",
      description: "Implement professional allocation frameworks for primary market investments",
      content: {
        overview: "Develop sophisticated allocation strategies that mirror institutional approaches to primary market investments, including portfolio construction, risk budgeting, and systematic position sizing.",
        keyPoints: [
          "Institutional-grade portfolio allocation methodologies",
          "Risk budgeting for high-volatility early-stage investments",
          "Professional diversification across project stages and sectors",
          "Systematic position sizing based on conviction and risk assessment"
        ],
        practicalSteps: [
          "Allocate 5-15% of crypto portfolio to primary market opportunities",
          "Diversify across 15-25 early-stage projects to manage single-project risk",
          "Implement tiered allocation: 1-3% per project based on conviction level",
          "Create systematic rebalancing schedule based on project milestones"
        ],
        example: "Allocation framework: $100K portfolio, $15K primary allocation, $500-3K per project, 15 projects total."
      }
    },
    {
      id: 3,
      title: "Advanced Due Diligence Framework",
      duration: "38 min",
      description: "Master institutional-grade due diligence for early-stage blockchain projects",
      content: {
        overview: "Implement comprehensive due diligence frameworks that mirror venture capital and institutional investor methodologies for evaluating early-stage blockchain projects.",
        keyPoints: [
          "Team verification and background research methodologies",
          "Technology assessment and competitive landscape analysis",
          "Tokenomics evaluation and economic model validation",
          "Professional regulatory and compliance risk assessment"
        ],
        practicalSteps: [
          "Research team backgrounds: LinkedIn, GitHub, previous project history",
          "Analyze technology moats and competitive advantages",
          "Evaluate tokenomics: inflation rate, utility, value accrual mechanisms",
          "Assess regulatory compliance and legal structure"
        ],
        example: "Due diligence scorecard: Team 8/10, Tech 9/10, Tokenomics 7/10, Regulatory 8/10 = Qualified investment."
      }
    },
    {
      id: 4,
      title: "Private Sale and Pre-Sale Access",
      duration: "35 min",
      description: "Master systematic approaches to accessing private sales and pre-sale opportunities",
      content: {
        overview: "Develop systematic methods for accessing private sale rounds and pre-sale opportunities, including relationship building, qualification processes, and optimal participation strategies.",
        keyPoints: [
          "Private sale round identification and access strategies",
          "Professional relationship building with project teams and VCs",
          "Qualification requirements and minimum investment thresholds",
          "Optimal participation timing and allocation strategies"
        ],
        practicalSteps: [
          "Build network with crypto VCs, angels, and project advisors",
          "Monitor private sale opportunities through professional channels",
          "Prepare qualification materials: net worth, investment experience",
          "Develop systematic approach to private round participation"
        ],
        example: "Private access: Network contact → Private sale invitation → $25K minimum → 6-month vesting → 10x potential."
      }
    },
    {
      id: 5,
      title: "Token Generation Event (TGE) Strategies",
      duration: "33 min",
      description: "Master TGE participation and public sale optimization techniques",
      content: {
        overview: "Implement professional strategies for participating in Token Generation Events and public sales, including timing optimization, allocation maximization, and systematic execution.",
        keyPoints: [
          "TGE structure analysis and optimal participation strategies",
          "Public sale mechanics and allocation optimization",
          "Professional timing and execution techniques",
          "Systematic approach to multiple TGE participation"
        ],
        practicalSteps: [
          "Monitor TGE calendars and announcement schedules",
          "Prepare multiple wallets and allocation strategies",
          "Set up automated participation tools where appropriate",
          "Develop systematic post-TGE management protocols"
        ],
        example: "TGE strategy: Monitor 20 upcoming TGEs, qualify for 10, participate in 5, expect 2-3 winners."
      }
    },
    {
      id: 6,
      title: "Venture Capital and Angel Strategies",
      duration: "36 min",
      description: "Implement VC-style investment approaches for primary market opportunities",
      content: {
        overview: "Adopt venture capital investment methodologies for primary market crypto investments, including portfolio theory, stage-based investing, and professional due diligence processes.",
        keyPoints: [
          "Venture capital investment thesis development",
          "Stage-based investing: pre-seed, seed, Series A equivalent strategies",
          "Professional portfolio construction and management",
          "Systematic exit planning and liquidity management"
        ],
        practicalSteps: [
          "Develop clear investment thesis for blockchain sectors and stages",
          "Allocate across different funding stages: 40% seed, 40% Series A, 20% growth",
          "Implement systematic tracking and milestone monitoring",
          "Plan exit strategies: partial sales, full exits, and hold decisions"
        ],
        example: "VC approach: Clear thesis, stage diversification, milestone tracking, systematic exits = Professional results."
      }
    },
    {
      id: 7,
      title: "Regulatory Compliance and Legal Framework",
      duration: "31 min",
      description: "Master regulatory compliance for primary market cryptocurrency investments",
      content: {
        overview: "Develop comprehensive understanding of regulatory landscape and compliance requirements for primary market crypto investments, including jurisdiction considerations and legal structuring.",
        keyPoints: [
          "Regulatory landscape understanding for different jurisdictions",
          "Securities law implications for token investments",
          "Professional legal structuring and compliance protocols",
          "Tax optimization and reporting requirements"
        ],
        practicalSteps: [
          "Research local regulations regarding early-stage crypto investments",
          "Structure investments through appropriate legal entities where beneficial",
          "Maintain detailed records for tax and regulatory compliance",
          "Consult legal and tax professionals for complex structures"
        ],
        example: "Compliance framework: Know your jurisdiction, proper structuring, detailed records, professional guidance."
      }
    },
    {
      id: 8,
      title: "Liquidity and Exit Planning",
      duration: "34 min",
      description: "Master systematic exit strategies and liquidity management for primary market investments",
      content: {
        overview: "Implement professional exit strategies and liquidity management for primary market investments, including timing optimization, partial exit strategies, and systematic profit-taking.",
        keyPoints: [
          "Systematic exit planning and timing optimization",
          "Partial exit strategies and profit-taking schedules",
          "Liquidity assessment and market depth analysis",
          "Professional portfolio rebalancing and reinvestment"
        ],
        practicalSteps: [
          "Set systematic profit-taking levels: 25% at 10x, 25% at 25x, 25% at 50x, 25% hold",
          "Monitor listing schedules and exchange announcements",
          "Assess exit liquidity before major profit-taking decisions",
          "Reinvest proceeds into new primary market opportunities"
        ],
        example: "Exit strategy: Token at 10x → sell 25%, at 25x → sell 25%, at 50x → sell 25%, hold 25% for potential 100x+."
      }
    },
    {
      id: 9,
      title: "Network Building and Information Advantages",
      duration: "29 min",
      description: "Build professional networks for superior primary market deal flow and information",
      content: {
        overview: "Develop systematic approaches to building professional networks that provide superior deal flow, early access, and information advantages in primary cryptocurrency markets.",
        keyPoints: [
          "Professional network building strategies and relationship management",
          "Information source development and verification",
          "Deal flow optimization and opportunity prioritization",
          "Community building and knowledge sharing protocols"
        ],
        practicalSteps: [
          "Join professional crypto investment communities and networks",
          "Attend industry conferences, meetups, and networking events",
          "Build relationships with VCs, project teams, and other investors",
          "Develop systematic information sharing and deal flow processes"
        ],
        example: "Network building: Industry events → Relationship building → Deal sharing → Early access → Superior returns."
      }
    },
    {
      id: 10,
      title: "Risk Management for Primary Markets",
      duration: "32 min",
      description: "Implement specialized risk management for high-volatility primary market investments",
      content: {
        overview: "Develop comprehensive risk management protocols specifically designed for primary market investments, including position sizing, diversification, and systematic risk assessment.",
        keyPoints: [
          "Specialized risk assessment for early-stage blockchain projects",
          "Portfolio diversification and correlation management",
          "Systematic position sizing and allocation optimization",
          "Professional drawdown management and recovery protocols"
        ],
        practicalSteps: [
          "Implement strict position sizing: maximum 2-3% per individual project",
          "Diversify across sectors, stages, and geographic regions",
          "Set portfolio-level stop-loss and rebalancing triggers",
          "Monitor correlation risk and adjust allocation accordingly"
        ],
        example: "Risk framework: 2% max position, 20+ projects, sector diversification, systematic rebalancing."
      }
    },
    {
      id: 11,
      title: "Advanced Research and Analytics",
      duration: "37 min",
      description: "Master professional research tools and analytical frameworks for primary market evaluation",
      content: {
        overview: "Implement advanced research methodologies and analytical frameworks for evaluating primary market opportunities, including data sources, analytical tools, and systematic evaluation processes.",
        keyPoints: [
          "Professional research tools and data source utilization",
          "Analytical frameworks for project evaluation and comparison",
          "Systematic scoring and ranking methodologies",
          "Advanced market timing and opportunity assessment"
        ],
        practicalSteps: [
          "Utilize professional research platforms: Messari, DeFiPulse, Dune Analytics",
          "Develop systematic scoring frameworks for project evaluation",
          "Monitor on-chain metrics and developer activity",
          "Track macro trends and sector rotation patterns"
        ],
        example: "Research workflow: Multi-source data → Systematic scoring → Comparative analysis → Investment decision."
      }
    },
    {
      id: 12,
      title: "Portfolio Construction and Optimization",
      duration: "35 min",
      description: "Master systematic portfolio construction for primary市场投资",
      content: {
        overview: "Implement advanced portfolio construction techniques specifically designed for primary market cryptocurrency investments, including optimization algorithms and systematic rebalancing.",
        keyPoints: [
          "Advanced portfolio construction methodologies",
          "Systematic optimization and rebalancing techniques",
          "Correlation analysis and diversification optimization",
          "Professional performance tracking and attribution"
        ],
        practicalSteps: [
          "Construct diversified portfolios across stages, sectors, and geographies",
          "Implement systematic rebalancing based on performance and milestones",
          "Monitor portfolio correlation and adjust allocation accordingly",
          "Track performance attribution and optimize based on results"
        ],
        example: "Portfolio construction: 25 projects, 5 sectors, 3 stages, systematic rebalancing = Optimized risk-return."
      }
    },
    {
      id: 13,
      title: "Tax Optimization and Reporting",
      duration: "28 min",
      description: "Master tax optimization strategies for primary market cryptocurrency investments",
      content: {
        overview: "Develop comprehensive tax optimization strategies for primary market investments, including structuring, timing, and reporting requirements for maximum after-tax returns.",
        keyPoints: [
          "Tax-efficient investment structuring and timing",
          "Professional reporting and record-keeping requirements",
          "Loss harvesting and tax optimization strategies",
          "Cross-border tax considerations and planning"
        ],
        practicalSteps: [
          "Structure investments for optimal tax treatment",
          "Maintain detailed records of all transactions and valuations",
          "Implement tax-loss harvesting strategies where appropriate",
          "Work with tax professionals for complex cross-border situations"
        ],
        example: "Tax optimization: Proper structuring + detailed records + loss harvesting + professional guidance = Maximized returns."
      }
    },
    {
      id: 14,
      title: "Advanced Scaling Strategies",
      duration: "33 min",
      description: "Master systematic scaling and wealth management for primary market success",
      content: {
        overview: "Implement advanced scaling strategies to systematically grow primary market investments while maintaining risk control and optimizing for maximum long-term wealth creation.",
        keyPoints: [
          "Systematic reinvestment and compounding strategies",
          "Advanced position sizing and portfolio scaling",
          "Professional wealth management and asset protection",
          "Institutional-grade scaling and succession planning"
        ],
        practicalSteps: [
          "Reinvest 60-80% of profits into new primary market opportunities",
          "Scale allocation sizes based on track record and experience",
          "Implement wealth management strategies as portfolio grows",
          "Plan for asset protection and succession considerations"
        ],
        example: "Scaling strategy: $50K → $500K → reinvest $400K, secure $100K = Sustainable wealth building."
      }
    },
    {
      id: 15,
      title: "Institutional Integration and Evolution",
      duration: "30 min",
      description: "Master integration with institutional frameworks and continuous strategy evolution",
      content: {
        overview: "Develop capabilities for integrating with institutional investment frameworks and continuously evolving strategies based on market changes and new opportunities.",
        keyPoints: [
          "Institutional framework integration and co-investment opportunities",
          "Continuous strategy evolution and adaptation",
          "Professional development and skill enhancement",
          "Market leadership and thought leadership development"
        ],
        practicalSteps: [
          "Explore co-investment opportunities with institutional investors",
          "Continuously update strategies based on market evolution",
          "Develop thought leadership through research and content creation",
          "Consider launching investment vehicles or advisory services"
        ],
        example: "Evolution path: Individual investor → Sophisticated participant → Co-investor → Market leader."
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
          <div className="inline-flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full mb-4">
            <Layers className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Strategy #23</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Primary Markets Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master primary markets methodology for early-stage cryptocurrency investments with institutional-grade allocation strategies, professional due diligence, and systematic opportunity identification
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/15 Lessons</span>
            </div>
            <Progress value={progressPercentage} className="w-full mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{completedLessons.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{lessons.length - completedLessons.length}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-purple-600" />
              Primary Markets Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Primary markets identification and systematic access</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Institutional-grade allocation frameworks and positioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Advanced due diligence and project evaluation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Professional portfolio construction and risk management</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Early-Stage Returns</div>
                    <div className="text-sm text-purple-700">20-500x potential through primary access</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Success Rate</div>
                    <div className="text-sm text-blue-700">70%+ winners with institutional due diligence</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Portfolio Allocation</div>
                    <div className="text-sm text-green-700">5-15% of total crypto portfolio</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Warning */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-2">Critical Risk Disclosure</h4>
                <p className="text-red-700 text-sm">
                  Primary market investments are extremely high-risk and speculative. Many early-stage projects fail completely (100% loss). 
                  This strategy requires significant capital ($50K+ typically), advanced investment knowledge, and institutional-level risk tolerance. 
                  Only invest amounts you can afford to lose entirely. Regulatory restrictions may apply in your jurisdiction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Primary Markets Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-purple-100' : 'bg-purple-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-purple-600" />
                        ) : (
                          <Layers className="h-6 w-6 text-purple-600" />
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
                      <Badge className="bg-purple-100 text-purple-800">
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
                          <Layers className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <ol className="space-y-2">
                        {lesson.content.practicalSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-purple-800">{step}</span>
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
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
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
          <Card className="mt-8 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="text-center py-8">
              <Layers className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-900 mb-2">
                Primary Markets Master Complete!
              </h3>
              <p className="text-purple-800 mb-6">
                You've mastered all 15 lessons of primary markets investing. 
                You're now equipped with institutional-grade allocation strategies, professional due diligence, advanced portfolio construction, and systematic opportunity identification for early-stage cryptocurrency investments.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Layers className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Primary Market Access</div>
                  <div className="text-sm text-gray-600">Institutional-grade strategies</div>
                </div>
                <div className="text-center">
                  <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Professional Due Diligence</div>
                  <div className="text-sm text-gray-600">VC-level evaluation frameworks</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Early-Stage Returns</div>
                  <div className="text-sm text-gray-600">20-500x potential returns</div>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Return to Trading Academy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Strategies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complement Your Primary Markets Skills</CardTitle>
            <CardDescription>
              Enhance your early-stage investment approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Layers className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Native Markets Master</h4>
                <p className="text-green-700 text-sm">Early-stage DeFi opportunities</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/22')}
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
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Risk Management</h4>
                <p className="text-purple-700 text-sm">Advanced portfolio protection</p>
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