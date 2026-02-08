import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, Brain, TrendingUp, Shield, Users, Award } from 'lucide-react';

export function CompleteTradingMasterySystem() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Trading Psychology Foundation",
      duration: "35 min",
      description: "Master the psychological foundations of successful trading and emotional control systems",
      content: {
        overview: "Build unshakeable psychological foundations for trading success, including emotional control systems, cognitive bias recognition, and professional mindset development for consistent performance.",
        keyPoints: [
          "Trading psychology fundamentals and emotional control mastery",
          "Cognitive bias recognition and systematic mitigation strategies",
          "Professional mindset development and confidence building",
          "Stress management and performance optimization techniques"
        ],
        practicalSteps: [
          "Complete comprehensive trading personality assessment",
          "Identify personal psychological triggers and emotional patterns",
          "Implement daily mental conditioning and visualization routines",
          "Develop systematic emotional control protocols for live trading"
        ],
        example: "Psychology routine: Morning visualization → Pre-market mental preparation → Trade with emotional discipline → Post-market reflection."
      }
    },
    {
      id: 2,
      title: "Market Fundamentals Mastery", 
      duration: "40 min",
      description: "Master comprehensive market mechanics, structure, and fundamental analysis principles",
      content: {
        overview: "Develop deep understanding of market mechanics, structure, and fundamental analysis to make informed trading decisions based on comprehensive market knowledge.",
        keyPoints: [
          "Market structure and mechanics: exchanges, market makers, order flow",
          "Economic indicators and fundamental analysis frameworks",
          "Sector analysis and market cycle understanding",
          "Professional news interpretation and event trading"
        ],
        practicalSteps: [
          "Study major market participants and their impact on price action",
          "Learn to interpret key economic indicators: GDP, inflation, unemployment",
          "Analyze sector rotation patterns and economic cycle stages",
          "Develop systematic approach to news trading and event analysis"
        ],
        example: "Fundamental analysis: GDP growth 3.2% + Low unemployment + Fed dovish = Bullish market environment."
      }
    },
    {
      id: 3,
      title: "Technical Analysis Mastery",
      duration: "42 min",
      description: "Master advanced technical analysis including chart patterns, indicators, and price action",
      content: {
        overview: "Implement comprehensive technical analysis methodologies including advanced chart patterns, technical indicators, and price action analysis for superior market timing.",
        keyPoints: [
          "Advanced chart pattern recognition and interpretation",
          "Technical indicator mastery: moving averages, oscillators, momentum",
          "Professional price action analysis and candlestick patterns",
          "Multi-timeframe technical analysis and confluence trading"
        ],
        practicalSteps: [
          "Master key chart patterns: triangles, flags, head and shoulders",
          "Learn optimal technical indicator combinations and settings",
          "Practice advanced candlestick pattern recognition",
          "Implement multi-timeframe analysis for entry timing"
        ],
        example: "Technical setup: Weekly uptrend + Daily flag pattern + 1H breakout + RSI oversold = High probability long entry."
      }
    },
    {
      id: 4,
      title: "Risk Management Systems",
      duration: "38 min",
      description: "Implement professional risk management frameworks and position sizing strategies",
      content: {
        overview: "Develop comprehensive risk management systems including position sizing, stop-loss strategies, and portfolio protection to ensure long-term trading survival and success.",
        keyPoints: [
          "Professional position sizing algorithms and risk budgeting",
          "Advanced stop-loss strategies and trade management",
          "Portfolio-level risk control and correlation management",
          "Systematic drawdown management and recovery protocols"
        ],
        practicalSteps: [
          "Implement 1-2% risk per trade rule with systematic position sizing",
          "Set up dynamic stop-loss strategies based on volatility",
          "Monitor portfolio correlation and sector concentration risk",
          "Develop systematic approach to drawdown management"
        ],
        example: "Risk framework: $100K account, 2% risk per trade, ATR-based stops, maximum 6% portfolio correlation."
      }
    },
    {
      id: 5,
      title: "Entry and Exit Strategies",
      duration: "36 min",
      description: "Master systematic entry and exit strategies for optimal trade timing and execution",
      content: {
        overview: "Implement professional entry and exit strategies that maximize profitability while minimizing risk through systematic timing and execution protocols.",
        keyPoints: [
          "Systematic entry strategies: breakouts, pullbacks, reversal patterns",
          "Professional exit strategies: profit targets, trailing stops, time exits",
          "Trade management and position scaling techniques",
          "Optimal timing and execution optimization"
        ],
        practicalSteps: [
          "Develop systematic entry criteria for different market conditions",
          "Implement multiple exit strategies: targets, stops, time-based",
          "Practice position scaling and partial profit-taking strategies",
          "Optimize execution timing and reduce slippage costs"
        ],
        example: "Entry/Exit system: Breakout entry → Initial target 2:1 R/R → Trail stop → Scale out 50% at target 1."
      }
    },
    {
      id: 6,
      title: "Trading Plan Development",
      duration: "33 min",
      description: "Create comprehensive trading plans and systematic trading protocols",
      content: {
        overview: "Develop comprehensive trading plans that integrate all aspects of trading into systematic, repeatable protocols for consistent execution and performance.",
        keyPoints: [
          "Complete trading plan architecture and components",
          "Market session and timeframe specialization strategies",
          "Systematic trade preparation and execution protocols",
          "Professional record keeping and performance tracking"
        ],
        practicalSteps: [
          "Create detailed written trading plan with all rules and criteria",
          "Specialize in specific market sessions and timeframes",
          "Develop pre-market preparation and trade scanning routines",
          "Implement comprehensive trade journaling and analysis system"
        ],
        example: "Trading plan: Pre-market scan → Setup identification → Risk assessment → Entry execution → Management → Review."
      }
    },
    {
      id: 7,
      title: "Money Management and Compounding",
      duration: "34 min",
      description: "Master advanced money management and systematic wealth compounding strategies",
      content: {
        overview: "Implement sophisticated money management strategies that optimize compounding while protecting capital through systematic allocation and risk-adjusted growth protocols.",
        keyPoints: [
          "Advanced position sizing and allocation optimization",
          "Systematic compounding strategies and reinvestment protocols",
          "Risk-adjusted return optimization and Sharpe ratio improvement",
          "Professional capital preservation and growth balance"
        ],
        practicalSteps: [
          "Implement Kelly Criterion and optimal position sizing formulas",
          "Develop systematic profit reinvestment and compounding schedules",
          "Monitor risk-adjusted returns and optimize allocation accordingly",
          "Balance capital preservation with aggressive growth strategies"
        ],
        example: "Compounding system: 10% monthly returns → Reinvest 80% → Withdraw 20% → Systematic scaling."
      }
    },
    {
      id: 8,
      title: "Market Regime Analysis",
      duration: "31 min",
      description: "Master market regime identification and adaptive trading strategies",
      content: {
        overview: "Develop expertise in identifying different market regimes and adapting trading strategies accordingly for optimal performance across all market conditions.",
        keyPoints: [
          "Market regime identification: trending, ranging, volatile markets",
          "Adaptive strategy selection based on market conditions",
          "Professional market cycle analysis and timing",
          "Systematic regime change detection and strategy adjustment"
        ],
        practicalSteps: [
          "Learn to identify trending vs ranging market conditions",
          "Develop different strategies for each market regime",
          "Monitor market cycle stages and adjust approach accordingly",
          "Implement systematic regime change detection algorithms"
        ],
        example: "Regime analysis: VIX <20, ADX >25, Strong trends = Momentum strategy selection."
      }
    },
    {
      id: 9,
      title: "Advanced Order Types and Execution",
      duration: "29 min",
      description: "Master professional order types, execution strategies, and trade management",
      content: {
        overview: "Implement advanced order types and execution strategies to optimize fills, reduce slippage, and improve overall trading performance through professional execution techniques.",
        keyPoints: [
          "Advanced order types: OCO, bracket orders, iceberg orders",
          "Professional execution strategies and slippage reduction",
          "Algorithmic order placement and timing optimization",
          "Trade management and dynamic adjustment techniques"
        ],
        practicalSteps: [
          "Master advanced order types and their optimal applications",
          "Learn professional execution techniques to minimize market impact",
          "Implement algorithmic order placement for better fills",
          "Develop dynamic trade management and adjustment protocols"
        ],
        example: "Execution strategy: Bracket order entry → OCO exit → Iceberg scaling → Dynamic adjustment based on flow."
      }
    },
    {
      id: 10,
      title: "Performance Analysis and Optimization",
      duration: "37 min",
      description: "Master comprehensive performance analysis and systematic strategy optimization",
      content: {
        overview: "Implement comprehensive performance analysis systems to identify strengths, weaknesses, and optimization opportunities for continuous trading improvement.",
        keyPoints: [
          "Advanced performance metrics and statistical analysis",
          "Systematic strategy optimization and backtesting",
          "Professional drawdown analysis and recovery protocols",
          "Continuous improvement and adaptation methodologies"
        ],
        practicalSteps: [
          "Calculate advanced performance metrics: Sharpe, Sortino, Calmar ratios",
          "Conduct systematic strategy backtesting and optimization",
          "Analyze drawdown periods and develop recovery strategies",
          "Implement continuous improvement and adaptation protocols"
        ],
        example: "Performance analysis: 2.1 Sharpe ratio, 8% max drawdown, 68% win rate = Strong performance, optimize R/R."
      }
    },
    {
      id: 11,
      title: "Diversification and Portfolio Construction",
      duration: "35 min",
      description: "Master systematic portfolio construction and diversification strategies",
      content: {
        overview: "Develop sophisticated portfolio construction techniques that optimize diversification while maintaining focus, balancing risk and return across multiple strategies and timeframes.",
        keyPoints: [
          "Strategic portfolio construction and asset allocation",
          "Professional diversification across timeframes and strategies",
          "Correlation analysis and risk optimization",
          "Systematic rebalancing and portfolio management"
        ],
        practicalSteps: [
          "Construct diversified portfolio across multiple strategies",
          "Analyze correlation between different trading approaches",
          "Implement systematic rebalancing and allocation protocols",
          "Monitor portfolio-level risk and performance metrics"
        ],
        example: "Portfolio construction: 40% swing trading, 30% day trading, 20% position trading, 10% options = Balanced approach."
      }
    },
    {
      id: 12,
      title: "Technology and Platform Mastery",
      duration: "32 min",
      description: "Master trading technology, platforms, and automation tools for enhanced performance",
      content: {
        overview: "Implement advanced trading technology and platform optimization to enhance execution speed, accuracy, and overall trading performance through technological advantages.",
        keyPoints: [
          "Trading platform optimization and customization",
          "Professional charting and analysis software mastery",
          "Automation tools and algorithmic assistance",
          "Technology-enhanced execution and monitoring systems"
        ],
        practicalSteps: [
          "Optimize trading platform setup for maximum efficiency",
          "Master advanced charting and analysis software features",
          "Implement automation tools for scanning and alerts",
          "Set up comprehensive monitoring and execution systems"
        ],
        example: "Technology setup: TradingView Pro + ThinkOrSwim + Custom scanners + Automated alerts = Professional edge."
      }
    },
    {
      id: 13,
      title: "Market Scanning and Opportunity Identification",
      duration: "30 min",
      description: "Master systematic market scanning and opportunity identification processes",
      content: {
        overview: "Develop systematic market scanning and opportunity identification processes to consistently find high-probability trading setups across different markets and timeframes.",
        keyPoints: [
          "Systematic market scanning and filtering techniques",
          "Professional opportunity identification and prioritization",
          "Automated screening and alert systems",
          "Multi-market and multi-timeframe scanning protocols"
        ],
        practicalSteps: [
          "Develop systematic scanning criteria for different strategies",
          "Set up automated screening and alert systems",
          "Create prioritization framework for multiple opportunities",
          "Implement efficient market monitoring and tracking systems"
        ],
        example: "Scanning system: Pre-market gappers → Technical screening → Fundamental filter → Priority ranking = Focus list."
      }
    },
    {
      id: 14,
      title: "Options Trading Integration",
      duration: "39 min",
      description: "Master options trading integration and advanced derivatives strategies",
      content: {
        overview: "Integrate options trading strategies with core trading approach to enhance returns, reduce risk, and create additional income streams through sophisticated derivatives usage.",
        keyPoints: [
          "Options basics and advanced strategies integration",
          "Professional income generation through options selling",
          "Risk management and hedging with derivatives",
          "Systematic options trading and portfolio enhancement"
        ],
        practicalSteps: [
          "Master options basics: calls, puts, spreads, combinations",
          "Implement income generation strategies: covered calls, cash-secured puts",
          "Use options for portfolio hedging and risk management",
          "Develop systematic approach to options trading integration"
        ],
        example: "Options integration: Long stock position + Covered calls + Protective puts = Enhanced returns with reduced risk."
      }
    },
    {
      id: 15,
      title: "Cryptocurrency Trading Mastery",
      duration: "36 min",
      description: "Master cryptocurrency trading strategies and digital asset market dynamics",
      content: {
        overview: "Develop expertise in cryptocurrency trading including unique market dynamics, 24/7 trading strategies, and digital asset-specific analysis techniques.",
        keyPoints: [
          "Cryptocurrency market dynamics and unique characteristics",
          "24/7 trading strategies and risk management",
          "Digital asset technical analysis and on-chain metrics",
          "Professional crypto portfolio management and allocation"
        ],
        practicalSteps: [
          "Understand crypto market structure and trading dynamics",
          "Develop 24/7 trading strategies with proper rest protocols",
          "Learn crypto-specific technical analysis and on-chain metrics",
          "Implement professional crypto portfolio management systems"
        ],
        example: "Crypto strategy: BTC dominance analysis + Altcoin rotation + DeFi opportunities + Risk management = Diversified approach."
      }
    },
    {
      id: 16,
      title: "Advanced Risk Controls and Safeguards",
      duration: "33 min",
      description: "Implement advanced risk controls and safeguard systems for professional trading",
      content: {
        overview: "Develop comprehensive risk control systems and safeguards that protect against catastrophic losses while maintaining profitability through advanced risk management protocols.",
        keyPoints: [
          "Advanced risk control systems and automatic safeguards",
          "Professional position limits and exposure management",
          "Systematic stress testing and scenario analysis",
          "Emergency protocols and disaster recovery plans"
        ],
        practicalSteps: [
          "Implement automatic position limits and risk controls",
          "Develop systematic stress testing and scenario analysis",
          "Create emergency protocols for different market conditions",
          "Set up disaster recovery and business continuity plans"
        ],
        example: "Risk controls: Auto position limits + Daily VaR monitoring + Stress testing + Emergency protocols = Bulletproof system."
      }
    },
    {
      id: 17,
      title: "Trading Business Development",
      duration: "38 min",
      description: "Master trading business development and professional trader mindset",
      content: {
        overview: "Develop trading as a professional business including business planning, tax optimization, record keeping, and scaling strategies for long-term success.",
        keyPoints: [
          "Trading business planning and professional structure",
          "Tax optimization and professional record keeping",
          "Scaling strategies and capital growth management",
          "Professional development and continuous learning"
        ],
        practicalSteps: [
          "Develop comprehensive trading business plan and structure",
          "Implement tax-efficient trading and record keeping systems",
          "Create systematic scaling and capital growth strategies",
          "Establish continuous learning and professional development programs"
        ],
        example: "Business development: LLC structure + Professional accounting + Systematic scaling + Continuous education = Professional trader."
      }
    },
    {
      id: 18,
      title: "Long-term Wealth Building Integration",
      duration: "40 min",
      description: "Master integration of trading with long-term wealth building and investment strategies",
      content: {
        overview: "Integrate active trading with long-term wealth building strategies to create comprehensive financial success through balanced approach to trading and investing.",
        keyPoints: [
          "Integration of trading profits with long-term investment",
          "Systematic wealth building and asset allocation",
          "Professional financial planning and goal achievement",
          "Comprehensive wealth management and preservation strategies"
        ],
        practicalSteps: [
          "Allocate trading profits between reinvestment and long-term wealth",
          "Develop systematic wealth building and investment strategies",
          "Create comprehensive financial planning and goal achievement systems",
          "Implement wealth preservation and tax optimization strategies"
        ],
        example: "Wealth integration: Trading profits → 50% reinvestment + 30% real estate + 20% index funds = Comprehensive wealth building."
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
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Strategy #24</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Trading Mastery System
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master the complete trading system covering psychology, technical analysis, risk management, and systematic wealth building with comprehensive step-by-step implementation guides for beginner to professional transformation
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/18 Lessons</span>
            </div>
            <Progress value={progressPercentage} className="w-full mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedLessons.length}</div>
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
              <BookOpen className="h-6 w-6 text-blue-600" />
              Complete Trading Mastery Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Complete trading psychology mastery and emotional control</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Advanced technical analysis and systematic strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Professional risk management and position sizing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Systematic wealth building and business development</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Complete Transformation</div>
                    <div className="text-sm text-blue-700">Beginner to professional trader journey</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Success Rate</div>
                    <div className="text-sm text-green-700">90%+ with systematic implementation</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Comprehensive Coverage</div>
                    <div className="text-sm text-purple-700">All aspects of professional trading</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Complete Learning System</h4>
                <p className="text-green-700 text-sm">
                  This comprehensive system takes you from complete beginner to professional trader through 18 structured lessons. 
                  Each lesson builds systematically upon previous knowledge, creating a complete trading education that addresses psychology, 
                  technical skills, risk management, and business development. Suitable for all experience levels with adaptive difficulty.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Trading Mastery Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-blue-100' : 'bg-blue-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-blue-600" />
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
                      <Badge className="bg-blue-100 text-blue-800">
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
                          <BookOpen className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <ol className="space-y-2">
                        {lesson.content.practicalSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-blue-800">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Example */}
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Practical Example</h4>
                    <p className="text-green-800">{lesson.content.example}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
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
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
            <CardContent className="text-center py-8">
              <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                Complete Trading Mastery System Complete!
              </h3>
              <p className="text-blue-800 mb-6">
                You've mastered all 18 lessons of the complete trading system. 
                You're now equipped with comprehensive trading psychology, advanced technical analysis, professional risk management, 
                and systematic wealth building strategies for complete trader transformation.
              </p>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Psychology Mastery</div>
                  <div className="text-sm text-gray-600">Emotional control systems</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Technical Analysis</div>
                  <div className="text-sm text-gray-600">Advanced charting skills</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Professional protection</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold">Wealth Building</div>
                  <div className="text-sm text-gray-600">Systematic growth</div>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Return to Trading Academy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Strategies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Continue Your Trading Journey</CardTitle>
            <CardDescription>
              Explore specialized strategies to complement your complete trading mastery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Profit Taking Master</h4>
                <p className="text-blue-700 text-sm">Advanced exit strategies</p>
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
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Professional Day Trading</h4>
                <p className="text-green-700 text-sm">Intraday execution mastery</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/20')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Systematic Entry Exit</h4>
                <p className="text-purple-700 text-sm">Automated trading systems</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/17')}
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