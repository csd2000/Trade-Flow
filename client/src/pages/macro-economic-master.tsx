import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, Activity, TrendingUp, Shield, Globe, Award } from 'lucide-react';

export function MacroEconomicMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Macro Economic Foundations",
      duration: "42 min",
      description: "Master the fundamentals of macro-economic analysis and long-term wealth building cycles",
      content: {
        overview: "Build comprehensive understanding of macro-economic principles, historical cycles, and systemic wealth building strategies that enable generational wealth creation through economic understanding.",
        keyPoints: [
          "Macro-economic principles and systematic wealth building foundations",
          "Historical economic cycles and pattern recognition",
          "Central bank operations and monetary policy impact analysis",
          "Global economic interconnections and geopolitical implications"
        ],
        practicalSteps: [
          "Study major economic indicators: GDP, inflation, employment, trade balances",
          "Analyze historical economic cycles and pattern recognition techniques",
          "Monitor central bank communications and policy changes systematically",
          "Track global economic interconnections and geopolitical developments"
        ],
        example: "Macro analysis: Fed hawkish policy + Rising interest rates + Dollar strength = Deflationary pressure on risk assets."
      }
    },
    {
      id: 2,
      title: "Economic Cycle Analysis", 
      duration: "38 min",
      description: "Master comprehensive economic cycle identification and strategic positioning",
      content: {
        overview: "Develop expertise in identifying and positioning within different phases of economic cycles to maximize investment returns and protect wealth during transitions.",
        keyPoints: [
          "Economic cycle phases and characteristics identification",
          "Systematic cycle timing and strategic positioning",
          "Asset allocation optimization across cycle phases",
          "Professional recession and expansion recognition"
        ],
        practicalSteps: [
          "Learn to identify expansion, peak, contraction, and trough phases",
          "Develop asset allocation strategies for each cycle phase",
          "Monitor leading economic indicators for cycle transitions",
          "Position investments ahead of major cycle changes"
        ],
        example: "Cycle positioning: Late expansion phase + High valuations + Rising rates = Reduce risk assets, increase cash position."
      }
    },
    {
      id: 3,
      title: "Technology Wave Analysis",
      duration: "40 min",
      description: "Master 50-year technology waves and systematic innovation cycle investing",
      content: {
        overview: "Implement systematic approach to identifying and investing in major technology waves that create generational wealth building opportunities every 50 years.",
        keyPoints: [
          "50-year technology wave identification and analysis",
          "Innovation cycle phases and investment timing",
          "Technology convergence recognition and positioning",
          "Systematic early-stage technology investment strategies"
        ],
        practicalSteps: [
          "Study historical technology waves: railroads, electricity, automobiles, computers",
          "Identify current wave convergence: AI, Bitcoin, Web3 intersection",
          "Position for early-stage adoption before mainstream recognition",
          "Implement systematic technology investment and scaling protocols"
        ],
        example: "Tech wave: AI + Bitcoin + Web3 convergence = 6th major technology revolution with 50-year wealth creation potential."
      }
    },
    {
      id: 4,
      title: "Monetary Policy Mastery",
      duration: "36 min",
      description: "Master central bank operations and monetary policy impact on investment strategies",
      content: {
        overview: "Develop deep understanding of central bank operations, monetary policy transmission, and systematic positioning based on policy changes and economic conditions.",
        keyPoints: [
          "Federal Reserve operations and policy transmission mechanisms",
          "Global central bank coordination and currency impacts",
          "Monetary policy cycle analysis and investment positioning",
          "Professional policy change anticipation and positioning"
        ],
        practicalSteps: [
          "Monitor FOMC meetings, minutes, and policy communications",
          "Track money supply changes and quantitative easing programs",
          "Analyze yield curve dynamics and policy effectiveness",
          "Position investments based on policy cycle analysis"
        ],
        example: "Policy analysis: QE expansion + Zero rates + Fiscal stimulus = Risk asset inflation, currency debasement environment."
      }
    },
    {
      id: 5,
      title: "Asset-First Wealth Building",
      duration: "34 min",
      description: "Master asset-first wealth building and strategic debt utilization strategies",
      content: {
        overview: "Implement asset-first wealth building strategies that prioritize asset accumulation over cash savings, using strategic debt and leverage for accelerated wealth creation.",
        keyPoints: [
          "Asset-first philosophy and wealth building acceleration",
          "Strategic debt utilization and leverage optimization",
          "Cash flow generation through asset ownership",
          "Professional tax optimization and wealth preservation"
        ],
        practicalSteps: [
          "Prioritize acquiring appreciating assets over cash accumulation",
          "Use strategic debt against assets for liquidity and tax benefits",
          "Generate cash flow through rental properties, dividends, business ownership",
          "Optimize tax strategy through asset-based wealth building"
        ],
        example: "Asset strategy: Buy Bitcoin at $30K + Borrow against Bitcoin + Use proceeds for real estate + Tax-efficient structure."
      }
    },
    {
      id: 6,
      title: "Bitcoin as Treasury Asset",
      duration: "39 min",
      description: "Master Bitcoin treasury strategy and sound money principles",
      content: {
        overview: "Implement Bitcoin treasury strategies for individuals and businesses, understanding Bitcoin as sound money and systematic store of value in inflationary environments.",
        keyPoints: [
          "Bitcoin treasury strategy and implementation framework",
          "Sound money principles and monetary system understanding",
          "Strategic Bitcoin accumulation and position building",
          "Professional Bitcoin collateralization and leverage strategies"
        ],
        practicalSteps: [
          "Understand Bitcoin's monetary properties and scarcity characteristics",
          "Implement systematic Bitcoin accumulation (dollar-cost averaging)",
          "Learn Bitcoin collateralization for liquidity without selling",
          "Develop Bitcoin treasury management for businesses and individuals"
        ],
        example: "Bitcoin treasury: Company allocates excess cash to Bitcoin + Borrows against Bitcoin for operations + Maintains Bitcoin exposure."
      }
    },
    {
      id: 7,
      title: "Geopolitical Analysis and Positioning",
      duration: "33 min",
      description: "Master geopolitical analysis and strategic positioning for global economic changes",
      content: {
        overview: "Develop comprehensive geopolitical analysis skills to position investments and wealth strategically based on global political and economic developments.",
        keyPoints: [
          "Geopolitical risk assessment and investment impact analysis",
          "Global trade dynamics and supply chain implications",
          "Currency wars and international monetary system changes",
          "Strategic geographic and asset diversification"
        ],
        practicalSteps: [
          "Monitor major geopolitical developments and economic implications",
          "Assess trade war impacts and supply chain disruptions",
          "Track currency competition and international monetary changes",
          "Position assets geographically based on geopolitical analysis"
        ],
        example: "Geopolitical positioning: US-China tension + Supply chain reshoring + Dollar weaponization = Invest in domestic production, Bitcoin."
      }
    },
    {
      id: 8,
      title: "Inflation and Currency Debasement",
      duration: "35 min",
      description: "Master inflation analysis and currency debasement protection strategies",
      content: {
        overview: "Implement comprehensive inflation analysis and protection strategies to preserve and grow wealth during currency debasement and monetary expansion periods.",
        keyPoints: [
          "Inflation measurement and real vs nominal analysis",
          "Currency debasement recognition and protection strategies",
          "Hard asset allocation and inflation hedging",
          "Professional purchasing power preservation techniques"
        ],
        practicalSteps: [
          "Track real inflation vs official CPI measurements",
          "Identify currency debasement trends and acceleration",
          "Allocate to hard assets: Bitcoin, real estate, commodities, stocks",
          "Monitor and adjust inflation protection strategies systematically"
        ],
        example: "Inflation protection: CPI 8% but real inflation 15% = Allocate to Bitcoin, real estate, productive assets vs cash."
      }
    },
    {
      id: 9,
      title: "Real Estate Investment Strategy",
      duration: "37 min",
      description: "Master strategic real estate investing and cash flow generation",
      content: {
        overview: "Develop comprehensive real estate investment strategies that generate cash flow, appreciate with inflation, and provide tax benefits within macro-economic framework.",
        keyPoints: [
          "Strategic real estate acquisition and cash flow optimization",
          "Inflation protection and appreciation strategies",
          "Real estate leverage and financing optimization",
          "Professional property management and scaling techniques"
        ],
        practicalSteps: [
          "Identify cash flow positive properties in growth markets",
          "Optimize financing with low interest rates and leverage",
          "Implement systematic property management and scaling",
          "Use real estate for tax benefits and wealth preservation"
        ],
        example: "Real estate strategy: 20% down on rental property + 8% cap rate + 3% mortgage = 25%+ ROI plus appreciation."
      }
    },
    {
      id: 10,
      title: "Business Acquisition and Ownership",
      duration: "41 min",
      description: "Master business acquisition and systematic business building for wealth creation",
      content: {
        overview: "Implement systematic business acquisition and ownership strategies that generate cash flow, appreciate in value, and provide tax benefits and operational control.",
        keyPoints: [
          "Strategic business acquisition and due diligence frameworks",
          "Cash flow analysis and business valuation techniques",
          "Systematic business improvement and scaling strategies",
          "Professional exit planning and wealth optimization"
        ],
        practicalSteps: [
          "Identify undervalued businesses with strong cash flow potential",
          "Conduct comprehensive due diligence and valuation analysis",
          "Implement systematic improvements and operational optimization",
          "Plan strategic exits and wealth optimization strategies"
        ],
        example: "Business acquisition: Buy 3x EBITDA business + Improve operations + Scale to 5x EBITDA + Exit at 6x multiple."
      }
    },
    {
      id: 11,
      title: "Portfolio Construction and Allocation",
      duration: "32 min",
      description: "Master macro-based portfolio construction and strategic asset allocation",
      content: {
        overview: "Develop sophisticated portfolio construction techniques based on macro-economic analysis, focusing on concentration in high-conviction areas rather than traditional diversification.",
        keyPoints: [
          "Macro-based asset allocation and portfolio construction",
          "Strategic concentration vs traditional diversification",
          "Economic cycle-based allocation adjustments",
          "Professional risk management and position sizing"
        ],
        practicalSteps: [
          "Allocate based on macro trends: 60% Bitcoin/crypto, 30% real estate, 10% business",
          "Concentrate in 2-3 high-conviction areas during major cycles",
          "Adjust allocation based on economic cycle phases",
          "Monitor and rebalance based on macro developments"
        ],
        example: "Macro allocation: Technology wave phase = 60% crypto/tech, 25% real estate, 15% cash/opportunities."
      }
    },
    {
      id: 12,
      title: "Tax Optimization and Wealth Preservation",
      duration: "30 min",
      description: "Master tax optimization and systematic wealth preservation strategies",
      content: {
        overview: "Implement comprehensive tax optimization and wealth preservation strategies that maximize after-tax returns while protecting wealth across economic cycles.",
        keyPoints: [
          "Strategic tax planning and optimization frameworks",
          "Asset protection and wealth preservation techniques",
          "Estate planning and generational wealth transfer",
          "Professional jurisdiction and structure optimization"
        ],
        practicalSteps: [
          "Use debt against assets to avoid taxable sales events",
          "Implement tax-advantaged structures for business and investments",
          "Plan estate and wealth transfer strategies systematically",
          "Optimize jurisdiction and legal structures for wealth protection"
        ],
        example: "Tax strategy: Borrow against Bitcoin vs selling + Real estate depreciation + Business deductions = Minimize taxes."
      }
    },
    {
      id: 13,
      title: "Market Timing and Entry Strategies",
      duration: "28 min",
      description: "Master macro-based market timing and systematic entry strategies",
      content: {
        overview: "Develop systematic market timing approaches based on macro-economic analysis, historical cycles, and contrarian positioning for optimal entry and exit points.",
        keyPoints: [
          "Macro-based market timing and cycle analysis",
          "Contrarian positioning and crowd psychology",
          "Systematic entry and exit strategies",
          "Professional opportunity identification and execution"
        ],
        practicalSteps: [
          "Buy during macro-driven crashes and fear periods",
          "Use contrarian indicators and crowd sentiment analysis",
          "Position ahead of major macro developments",
          "Scale into positions during optimal macro windows"
        ],
        example: "Market timing: March 2020 crash + Fed policy response + Fiscal stimulus = Massive opportunity window for assets."
      }
    },
    {
      id: 14,
      title: "Wealth Scaling and Compounding",
      duration: "36 min",
      description: "Master systematic wealth scaling and compounding strategies",
      content: {
        overview: "Implement advanced wealth scaling and compounding techniques that accelerate wealth creation through strategic reinvestment and systematic growth protocols.",
        keyPoints: [
          "Systematic wealth scaling and compounding frameworks",
          "Strategic reinvestment and growth acceleration",
          "Professional risk scaling and position management",
          "Advanced wealth management and preservation techniques"
        ],
        practicalSteps: [
          "Reinvest profits into higher-yield opportunities systematically",
          "Scale position sizes as wealth and experience increase",
          "Use profits to acquire cash-flowing assets",
          "Compound wealth through multiple asset classes and strategies"
        ],
        example: "Wealth scaling: $100K → Bitcoin profits → Real estate down payments → Business acquisitions → $1M+ compounded."
      }
    },
    {
      id: 15,
      title: "Crisis Opportunity Management",
      duration: "34 min",
      description: "Master crisis opportunity identification and systematic positioning",
      content: {
        overview: "Develop expertise in identifying and capitalizing on crisis-driven opportunities that create generational wealth transfer and positioning advantages.",
        keyPoints: [
          "Crisis opportunity identification and systematic positioning",
          "Wealth transfer dynamics during economic disruption",
          "Strategic liquidity management for opportunistic buying",
          "Professional contrarian investing and recovery positioning"
        ],
        practicalSteps: [
          "Maintain liquidity reserves for crisis opportunities",
          "Identify assets trading below intrinsic value during crises",
          "Position contrarian to general market sentiment",
          "Scale into opportunities during maximum pessimism"
        ],
        example: "Crisis opportunity: 2020 crash + Bitcoin at $4K + Real estate discounts + Stock market capitulation = Generational buying."
      }
    },
    {
      id: 16,
      title: "Long-term Wealth Legacy Planning",
      duration: "38 min",
      description: "Master generational wealth building and legacy preservation strategies",
      content: {
        overview: "Implement comprehensive generational wealth building and legacy preservation strategies that create lasting wealth across multiple generations and economic cycles.",
        keyPoints: [
          "Generational wealth building and legacy planning",
          "Multi-generational asset preservation strategies",
          "Educational wealth transfer and knowledge preservation",
          "Professional family office and wealth management techniques"
        ],
        practicalSteps: [
          "Structure wealth for multi-generational preservation",
          "Educate family members on wealth management and preservation",
          "Create systematic wealth transfer and governance protocols",
          "Establish family office or advanced wealth management systems"
        ],
        example: "Legacy planning: Trust structures + Bitcoin holdings + Real estate portfolio + Business interests = Multi-generational wealth."
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
          <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full mb-4">
            <Activity className="h-5 w-5 text-orange-600" />
            <span className="font-semibold text-orange-800">Strategy #25</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Macro Economic Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master macro-economic investment strategies and systematic wealth building through economic cycle analysis, monetary policy understanding, and strategic asset allocation for generational wealth creation
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/16 Lessons</span>
            </div>
            <Progress value={progressPercentage} className="w-full mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-600">{completedLessons.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{lessons.length - completedLessons.length}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{Math.round(progressPercentage)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-600" />
              Macro Economic Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Comprehensive macro-economic analysis and frameworks</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Economic cycle identification and strategic positioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Technology wave analysis and innovation investing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                    <span>Asset-first wealth building and generational strategies</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="font-semibold text-orange-800">Wealth Multiplication</div>
                    <div className="text-sm text-orange-700">5x wealth over 5 years through macro positioning</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Cycle Advantage</div>
                    <div className="text-sm text-blue-700">50-year technology wave positioning</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Legacy Building</div>
                    <div className="text-sm text-green-700">Generational wealth preservation</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technology Wave Alert */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">6th Technology Wave Opportunity</h4>
                <p className="text-blue-700 text-sm">
                  We are currently in the 6th major technology wave (AI + Bitcoin + Web3 convergence) that occurs every 50 years. 
                  This creates generational wealth building opportunities for those who position early in the convergence phase. 
                  Historical precedent shows 100-1000x returns are possible during these transformation periods.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Macro Economic Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-orange-200 bg-orange-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-orange-100' : 'bg-orange-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-orange-600" />
                        ) : (
                          <Activity className="h-6 w-6 text-orange-600" />
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
                      <Badge className="bg-orange-100 text-orange-800">
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
                          <Activity className="h-4 w-4 text-orange-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <ol className="space-y-2">
                        {lesson.content.practicalSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-orange-800">{step}</span>
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
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8"
                      >
                        <Activity className="h-4 w-4 mr-2" />
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
          <Card className="mt-8 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="text-center py-8">
              <Activity className="h-16 w-16 text-orange-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-orange-900 mb-2">
                Macro Economic Master Complete!
              </h3>
              <p className="text-orange-800 mb-6">
                You've mastered all 16 lessons of macro-economic investing. 
                You're now equipped with comprehensive economic cycle analysis, technology wave positioning, 
                asset-first wealth building strategies, and generational wealth creation techniques for systematic macro success.
              </p>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold">Macro Analysis</div>
                  <div className="text-sm text-gray-600">Economic cycle mastery</div>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Technology Waves</div>
                  <div className="text-sm text-gray-600">50-year cycle positioning</div>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Asset-First Building</div>
                  <div className="text-sm text-gray-600">Strategic wealth creation</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Legacy Planning</div>
                  <div className="text-sm text-gray-600">Generational wealth</div>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Return to Trading Academy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Strategies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complement Your Macro Economic Skills</CardTitle>
            <CardDescription>
              Enhance your macro approach with these complementary strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Primary Markets Master</h4>
                <p className="text-purple-700 text-sm">Early-stage investments</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/23')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Complete Trading Mastery</h4>
                <p className="text-blue-700 text-sm">Comprehensive trading education</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/24')}
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