import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Zap } from 'lucide-react';

export function AutomatedIncomeMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Automated Trading Foundation",
      duration: "30 min",
      description: "Master the core principles of legitimate automated trading systems and passive income generation",
      content: {
        overview: "Build a comprehensive understanding of automated trading systems, distinguishing between legitimate opportunities and high-risk schemes while establishing realistic income expectations.",
        keyPoints: [
          "Understanding legitimate automated trading vs high-risk schemes",
          "Realistic return expectations: 8-15% annually vs unrealistic monthly claims",
          "Due diligence framework for evaluating automated systems",
          "Regulatory compliance and investor protection requirements"
        ],
        practicalSteps: [
          "Research regulated brokers with automated trading capabilities",
          "Verify all performance claims through independent auditing",
          "Start with demo accounts before committing real capital",
          "Establish risk tolerance: never invest more than 5-10% in automated systems"
        ],
        example: "Professional approach: Start with $1,000 in regulated platform, target 1% monthly returns, verify all performance data = Sustainable automated income."
      }
    },
    {
      id: 2,
      title: "Algorithmic Trading Systems",
      duration: "35 min", 
      description: "Develop understanding of algorithmic trading strategies and automated execution systems",
      content: {
        overview: "Master the technology and methodology behind legitimate algorithmic trading systems, including strategy development, backtesting, and risk management protocols.",
        keyPoints: [
          "Algorithm types: trend following, mean reversion, arbitrage",
          "Backtesting methodology and performance validation",
          "Risk management integration in automated systems",
          "Technology infrastructure and execution platforms"
        ],
        practicalSteps: [
          "Study proven algorithmic strategies: moving average crossovers, momentum systems",
          "Learn backtesting on platforms like QuantConnect or TradingView",
          "Set up paper trading with algorithmic execution",
          "Implement strict risk controls: stop losses, position sizing, daily limits"
        ],
        example: "Algorithm setup: 50/200 day MA crossover + RSI confirmation + 2% stop loss + 1% position size = Systematic automated trading."
      }
    },
    {
      id: 3,
      title: "Copy Trading Networks",
      duration: "28 min",
      description: "Master legitimate social trading platforms and professional trader copying systems",
      content: {
        overview: "Implement professional copy trading strategies through regulated platforms, including trader selection, risk management, and performance monitoring.",
        keyPoints: [
          "Regulated copy trading platforms: eToro, ZuluTrade, MetaTrader",
          "Professional trader evaluation criteria and selection process",
          "Portfolio diversification across multiple signal providers",
          "Performance monitoring and optimization strategies"
        ],
        practicalSteps: [
          "Register with regulated copy trading platforms",
          "Evaluate traders: minimum 12-month track record, consistent returns, low drawdown",
          "Diversify across 5-8 different traders in various strategies",
          "Monitor weekly: remove underperformers, scale successful traders"
        ],
        example: "Copy trading setup: 5 verified traders, 6+ month records, max 20% per trader, 15% annual target = Diversified automated income."
      }
    },
    {
      id: 4,
      title: "Robo-Advisor Integration",
      duration: "25 min",
      description: "Implement professional robo-advisor strategies for automated portfolio management",
      content: {
        overview: "Utilize institutional-grade robo-advisor platforms for automated portfolio rebalancing, tax optimization, and systematic wealth building.",
        keyPoints: [
          "Major robo-advisors: Betterment, Wealthfront, Schwab Intelligent",
          "Portfolio theory and automated rebalancing strategies",
          "Tax-loss harvesting and optimization techniques",
          "Goal-based investing and automatic savings systems"
        ],
        practicalSteps: [
          "Set up accounts with 2-3 major robo-advisors for comparison",
          "Configure risk tolerance assessment and investment goals",
          "Enable automatic deposits and rebalancing features",
          "Track performance vs benchmarks and adjust allocations quarterly"
        ],
        example: "Robo setup: $500/month auto-deposit, 70/30 stock/bond allocation, tax-loss harvesting enabled = 8-12% annual automated returns."
      }
    },
    {
      id: 5,
      title: "DeFi Yield Automation", 
      duration: "32 min",
      description: "Master automated DeFi yield strategies and liquidity mining with professional risk management",
      content: {
        overview: "Implement automated DeFi strategies including yield farming, liquidity mining, and staking with institutional-grade risk management and security protocols.",
        keyPoints: [
          "Automated yield farming strategies and protocol selection",
          "Smart contract security assessment and risk evaluation",
          "Impermanent loss protection and mitigation strategies",
          "Automated compounding and optimization tools"
        ],
        practicalSteps: [
          "Research established DeFi protocols: Compound, Aave, Uniswap V3",
          "Use yield aggregators: Yearn Finance, Harvest Finance for automation",
          "Implement dollar-cost averaging into DeFi positions",
          "Set up automated monitoring and rebalancing tools"
        ],
        example: "DeFi automation: $5K in Yearn vaults, automated compounding, 15-25% APY target, monthly rebalancing = Professional DeFi income."
      }
    },
    {
      id: 6,
      title: "Risk Management Automation",
      duration: "27 min",
      description: "Implement systematic risk controls and automated portfolio protection strategies",
      content: {
        overview: "Develop comprehensive automated risk management systems that protect capital while optimizing returns through systematic position sizing and portfolio monitoring.",
        keyPoints: [
          "Automated stop-loss and take-profit systems",
          "Position sizing algorithms and capital allocation",
          "Portfolio correlation monitoring and diversification",
          "Automated drawdown protection and recovery strategies"
        ],
        practicalSteps: [
          "Set up automatic position sizing based on volatility (ATR-based)",
          "Implement portfolio-wide risk limits: max 10% correlation exposure",
          "Configure automated stop-loss orders at 2% account risk per trade",
          "Enable automated rebalancing when allocations drift 5% from target"
        ],
        example: "Risk automation: 2% max risk per position, auto-stops at 15% drawdown, correlation limits = Systematic capital protection."
      }
    },
    {
      id: 7,
      title: "Performance Tracking Systems",
      duration: "24 min",
      description: "Master automated performance analysis and strategy optimization systems",
      content: {
        overview: "Implement comprehensive performance tracking and analysis systems that automatically monitor, evaluate, and optimize automated trading strategies.",
        keyPoints: [
          "Automated performance metrics calculation and reporting",
          "Strategy comparison and optimization algorithms",
          "Real-time monitoring and alert systems",
          "Tax reporting and compliance automation"
        ],
        practicalSteps: [
          "Set up automated reporting: daily P&L, weekly strategy performance",
          "Configure performance alerts: drawdown warnings, profit targets",
          "Implement automated tax tracking and reporting systems",
          "Create monthly strategy review and optimization protocols"
        ],
        example: "Performance system: Daily automated reports, 10% drawdown alerts, monthly optimization review = Professional tracking."
      }
    },
    {
      id: 8,
      title: "Income Diversification Strategies", 
      duration: "29 min",
      description: "Develop multiple automated income streams for consistent passive revenue generation",
      content: {
        overview: "Create a diversified automated income portfolio spanning multiple asset classes and strategies to reduce risk and increase consistent returns.",
        keyPoints: [
          "Multi-asset automation: stocks, bonds, crypto, commodities",
          "Income source diversification across different platforms",
          "Correlation analysis and portfolio optimization",
          "Automated rebalancing between income streams"
        ],
        practicalSteps: [
          "Allocate across 5 income sources: 30% stocks, 25% bonds, 20% DeFi, 15% REITs, 10% commodities",
          "Use different platforms for each asset class to reduce platform risk",
          "Set up automated monthly rebalancing based on performance",
          "Monitor correlation and adjust allocations when correlation increases"
        ],
        example: "Income portfolio: $50K across 5 automated strategies, 12% annual target, monthly rebalancing = Diversified passive income."
      }
    },
    {
      id: 9,
      title: "Tax Optimization Automation",
      duration: "26 min",
      description: "Implement automated tax-loss harvesting and optimization strategies for maximum after-tax returns",
      content: {
        overview: "Master automated tax optimization techniques including tax-loss harvesting, asset location strategies, and automated compliance reporting.",
        keyPoints: [
          "Automated tax-loss harvesting algorithms and implementation",
          "Asset location optimization across account types",
          "Automated wash sale rule compliance and avoidance",
          "Real-time tax impact monitoring and optimization"
        ],
        practicalSteps: [
          "Enable tax-loss harvesting on all automated platforms",
          "Optimize asset placement: growth in Roth IRA, income in traditional accounts",
          "Set up automated wash sale monitoring and prevention",
          "Configure quarterly tax impact reporting and optimization"
        ],
        example: "Tax automation: Automated harvesting saves 1-2% annually, optimal asset placement, wash sale prevention = Tax-efficient income."
      }
    },
    {
      id: 10,
      title: "Platform Integration Systems",
      duration: "31 min",
      description: "Master multi-platform automation and portfolio synchronization across different services",
      content: {
        overview: "Implement sophisticated multi-platform automation systems that coordinate strategies across different providers while maintaining optimal risk management.",
        keyPoints: [
          "API integration and automated portfolio synchronization",
          "Cross-platform risk management and monitoring",
          "Automated arbitrage opportunities between platforms",
          "Unified reporting and performance analysis"
        ],
        practicalSteps: [
          "Connect platforms via APIs for unified portfolio management",
          "Set up cross-platform risk monitoring to prevent over-leverage",
          "Implement automated rebalancing across all platforms",
          "Create unified dashboard for all automated strategies"
        ],
        example: "Platform integration: 4 platforms connected, unified risk management, automated arbitrage = Optimized multi-platform income."
      }
    },
    {
      id: 11,
      title: "Advanced Automation Strategies",
      duration: "33 min",
      description: "Implement sophisticated automated trading strategies using machine learning and AI",
      content: {
        overview: "Deploy advanced automation techniques including machine learning algorithms, sentiment analysis, and adaptive strategy optimization for enhanced returns.",
        keyPoints: [
          "Machine learning algorithm implementation for strategy optimization",
          "Automated sentiment analysis and market regime detection",
          "Adaptive position sizing based on market conditions",
          "AI-driven rebalancing and strategy selection"
        ],
        practicalSteps: [
          "Implement ML-based strategy selection using platforms like QuantConnect",
          "Set up automated sentiment monitoring using news and social media data",
          "Deploy adaptive algorithms that adjust to market volatility",
          "Create automated strategy evolution based on performance feedback"
        ],
        example: "Advanced automation: ML strategy selection, sentiment-based sizing, adaptive algorithms = Next-generation automated income."
      }
    },
    {
      id: 12,
      title: "Scaling and Optimization Mastery",
      duration: "28 min",
      description: "Master advanced scaling techniques and continuous optimization of automated income systems",
      content: {
        overview: "Develop sophisticated scaling and optimization frameworks that continuously improve automated income generation while managing increased complexity.",
        keyPoints: [
          "Systematic scaling protocols and capacity management",
          "Continuous optimization and strategy evolution",
          "Advanced risk management for larger portfolios",
          "Automated strategy retirement and replacement systems"
        ],
        practicalSteps: [
          "Develop scaling plan: increase allocations by 20% quarterly based on performance",
          "Implement automated strategy performance reviews and optimization",
          "Set up capacity limits and alternative strategy deployment",
          "Create automated strategy lifecycle management system"
        ],
        example: "Scaling system: Start $10K, scale to $100K over 12 months, automated optimization, strategy evolution = Mastery-level automation."
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
            <Zap className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-800">Strategy #18</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Automated Income Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master legitimate automated income generation through professional trading systems, algorithmic strategies, and diversified passive income streams with institutional-grade risk management
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
              <Zap className="h-6 w-6 text-green-600" />
              Professional Automated Income Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Legitimate automated systems with regulatory compliance</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Diversified income streams across multiple asset classes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Professional risk management and capital protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Realistic returns: 8-15% annually through automation</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Annual Returns</div>
                    <div className="text-sm text-green-700">8-15% realistic automated income</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Risk Control</div>
                    <div className="text-sm text-blue-700">Maximum 2% daily risk limits</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Diversification</div>
                    <div className="text-sm text-purple-700">5+ automated income streams</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Automated Income Curriculum</h2>
          
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
                          <Zap className="h-6 w-6 text-green-600" />
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
                          <Zap className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
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
                        <Zap className="h-4 w-4 mr-2" />
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
              <Zap className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Automated Income Master Complete!
              </h3>
              <p className="text-green-800 mb-6">
                You've mastered all 12 lessons of professional automated income generation. 
                You're now equipped with legitimate automation strategies, risk management systems, and diversified income streams for sustainable passive income.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Automated Systems</div>
                  <div className="text-sm text-gray-600">Professional income generation</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Capital protection protocols</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Diversification</div>
                  <div className="text-sm text-gray-600">Multiple income streams</div>
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
            <CardTitle>Complement Your Automated Income Skills</CardTitle>
            <CardDescription>
              Enhance your automation approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Algorithmic Trading</h4>
                <p className="text-purple-700 text-sm">Systematic automated execution</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/14')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">DeFi Yield Master</h4>
                <p className="text-blue-700 text-sm">Automated DeFi strategies</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/16')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Systematic Entry Exit</h4>
                <p className="text-green-700 text-sm">Rule-based trading systems</p>
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