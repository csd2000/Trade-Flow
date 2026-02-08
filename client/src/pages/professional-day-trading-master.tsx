import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Activity } from 'lucide-react';

export function ProfessionalDayTradingMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Professional Day Trading Foundation",
      duration: "35 min",
      description: "Master the foundational principles of professional day trading with institutional-grade techniques",
      content: {
        overview: "Build a comprehensive understanding of professional day trading methodologies, market structure analysis, and the psychological framework required for consistent profitable trading.",
        keyPoints: [
          "Professional trading mindset and discipline development",
          "Market structure fundamentals and price action analysis",
          "Risk management protocols for day trading success",
          "Professional setup and trading environment optimization"
        ],
        practicalSteps: [
          "Establish professional trading workspace with multiple monitors",
          "Set up Level II quotes and real-time market data feeds",
          "Develop pre-market routine and daily preparation checklist",
          "Implement strict risk management rules: 2% maximum account risk per trade"
        ],
        example: "Professional setup: 3-monitor system, Level II data, $25K account with 2% risk rule = Maximum $500 per trade risk."
      }
    },
    {
      id: 2,
      title: "Market Maker Psychology",
      duration: "32 min", 
      description: "Understand market maker behavior and how to identify and avoid common trading traps",
      content: {
        overview: "Master the psychology and tactics of market makers, learning to identify manipulation patterns and position yourself on the right side of institutional moves.",
        keyPoints: [
          "Market maker manipulation tactics and identification",
          "Institutional order flow analysis and smart money tracking",
          "Common retail trader traps and how to avoid them",
          "Professional positioning strategies against market makers"
        ],
        practicalSteps: [
          "Study Level II order book manipulation patterns",
          "Learn to identify fake walls and hidden liquidity",
          "Monitor institutional volume and block trades",
          "Develop systematic approach to following smart money"
        ],
        example: "Market maker trap: Fake resistance at $50.00 with hidden buy orders above = Opportunity for breakout trade."
      }
    },
    {
      id: 3,
      title: "Level II Order Book Mastery",
      duration: "30 min",
      description: "Master Level II order book analysis for professional trade execution and timing",
      content: {
        overview: "Develop expertise in reading Level II order books, identifying support and resistance levels, and timing entries and exits with institutional precision.",
        keyPoints: [
          "Level II order book structure and interpretation",
          "Bid-ask spread analysis and liquidity assessment",
          "Support and resistance identification through order flow",
          "Professional order execution and slippage minimization"
        ],
        practicalSteps: [
          "Practice reading Level II data in real-time market conditions",
          "Learn to identify strong vs weak support/resistance levels",
          "Master limit order placement for optimal fills",
          "Develop systematic approach to order book analysis"
        ],
        example: "Level II analysis: 10,000 share bid at $49.95, thin offers above $50.10 = Strong breakout potential."
      }
    },
    {
      id: 4,
      title: "Intraday Chart Patterns",
      duration: "28 min",
      description: "Master professional intraday chart pattern recognition and trading strategies",
      content: {
        overview: "Implement professional chart pattern analysis for intraday trading, including high-probability setups and optimal entry/exit timing for consistent profitability.",
        keyPoints: [
          "Professional intraday pattern identification and validation",
          "Bull and bear flag formations for trend continuation",
          "Breakout and breakdown patterns with volume confirmation",
          "Professional pattern failure recognition and management"
        ],
        practicalSteps: [
          "Study 1-minute, 5-minute, and 15-minute chart patterns",
          "Learn to combine patterns with volume analysis",
          "Practice pattern recognition in live market conditions",
          "Develop systematic pattern-based entry and exit rules"
        ],
        example: "Bull flag pattern: Stock consolidates at $52 after move from $48, breaks above $52.20 with volume = Target $56."
      }
    },
    {
      id: 5,
      title: "Professional Risk Management", 
      duration: "33 min",
      description: "Implement institutional-grade risk management systems for consistent capital preservation",
      content: {
        overview: "Develop comprehensive risk management protocols that protect capital while maximizing profit potential through professional position sizing and portfolio management techniques.",
        keyPoints: [
          "Professional position sizing algorithms and implementation",
          "Stop-loss placement and adjustment techniques",
          "Portfolio heat and correlation risk management",
          "Professional drawdown recovery and capital preservation"
        ],
        practicalSteps: [
          "Calculate optimal position size based on account risk tolerance",
          "Implement systematic stop-loss placement rules",
          "Monitor portfolio correlation and sector concentration",
          "Develop drawdown recovery protocols and risk adjustment"
        ],
        example: "Risk management: $100K account, 2% risk = $2K max loss, stock at $50 with $49 stop = 2,000 shares maximum position."
      }
    },
    {
      id: 6,
      title: "Momentum Trading Strategies",
      duration: "31 min",
      description: "Master professional momentum identification and exploitation techniques",
      content: {
        overview: "Implement advanced momentum trading strategies that identify and capitalize on strong directional moves with institutional-grade timing and execution.",
        keyPoints: [
          "Momentum identification using volume and price action",
          "Professional momentum entry and exit timing",
          "Relative strength analysis and sector rotation",
          "Momentum failure recognition and position management"
        ],
        practicalSteps: [
          "Scan for high relative volume and unusual activity",
          "Identify momentum catalysts: earnings, news, analyst upgrades",
          "Master pullback entries in strong momentum moves",
          "Develop systematic momentum exit strategies"
        ],
        example: "Momentum trade: Stock breaks $55 resistance on 3x average volume, enter pullback to $55.50 = Target $60-62."
      }
    },
    {
      id: 7,
      title: "Scalping Techniques",
      duration: "27 min",
      description: "Master professional scalping strategies for quick profits in liquid markets",
      content: {
        overview: "Develop expertise in professional scalping techniques that generate consistent small profits through rapid-fire trading with minimal risk exposure.",
        keyPoints: [
          "Professional scalping setup and execution requirements",
          "Optimal market conditions and stock selection for scalping",
          "Level II scalping techniques and order flow trading",
          "Professional scalping risk management and profit taking"
        ],
        practicalSteps: [
          "Identify liquid stocks with tight spreads for scalping",
          "Master 1-minute and tick chart analysis for entries",
          "Develop rapid execution skills and hotkey setup",
          "Implement strict profit targets and stop-loss discipline"
        ],
        example: "Scalping trade: Enter $50.05, target $50.15, stop $49.98 = 10 cent profit, 7 cent risk, 1.43:1 reward-risk."
      }
    },
    {
      id: 8,
      title: "Gap Trading Strategies", 
      duration: "29 min",
      description: "Master professional gap trading techniques for pre-market and opening bell opportunities",
      content: {
        overview: "Implement professional gap trading strategies that capitalize on overnight price movements and market inefficiencies for consistent morning profits.",
        keyPoints: [
          "Gap types identification and trading implications",
          "Pre-market analysis and gap assessment techniques",
          "Professional gap fill and gap continuation strategies",
          "Opening bell execution and volume confirmation"
        ],
        practicalSteps: [
          "Scan for significant gaps (>3%) with catalyst identification",
          "Analyze pre-market volume and price action",
          "Develop systematic gap trading entry and exit rules",
          "Master opening bell volatility and execution timing"
        ],
        example: "Gap trade: Stock gaps up 5% to $52 on earnings, pre-market resistance at $52.50, short bounce = Target $50.50."
      }
    },
    {
      id: 9,
      title: "News-Based Trading",
      duration: "26 min",
      description: "Master professional news-driven trading strategies and catalyst identification",
      content: {
        overview: "Develop expertise in news-based trading strategies that capitalize on market-moving events and catalysts with professional timing and risk management.",
        keyPoints: [
          "Catalyst identification and market impact assessment",
          "Professional news trading setup and execution timing",
          "Earnings and FDA approval trading strategies",
          "News fade and momentum continuation strategies"
        ],
        practicalSteps: [
          "Set up news feeds and real-time catalyst monitoring",
          "Develop systematic news impact assessment framework",
          "Practice pre-position and reactive trading strategies",
          "Master news-based risk management and position sizing"
        ],
        example: "News trade: FDA approval announcement, stock jumps 15% to $60, wait for pullback to $57 = Target $65-70."
      }
    },
    {
      id: 10,
      title: "Advanced Execution Techniques",
      duration: "24 min",
      description: "Master professional order execution and trade management techniques",
      content: {
        overview: "Implement advanced execution techniques that minimize slippage, optimize fills, and maximize profitability through professional order management and timing.",
        keyPoints: [
          "Professional order types and execution algorithms",
          "Slippage minimization and optimal fill techniques",
          "Advanced position scaling and profit taking strategies",
          "Professional trade management and adjustment protocols"
        ],
        practicalSteps: [
          "Master limit orders, stop-market, and iceberg orders",
          "Learn optimal timing for market vs limit order execution",
          "Develop systematic position scaling and profit taking",
          "Implement professional trade adjustment protocols"
        ],
        example: "Execution strategy: Use iceberg orders for large positions, scale out 1/3 at +20%, 1/3 at +40%, runner at +80%."
      }
    },
    {
      id: 11,
      title: "Market Regime Analysis",
      duration: "34 min",
      description: "Master market regime identification and strategy adaptation for different market conditions",
      content: {
        overview: "Develop expertise in identifying different market regimes and adapting trading strategies accordingly for consistent performance across all market conditions.",
        keyPoints: [
          "Market regime identification: trending, ranging, volatile",
          "Strategy adaptation for different market conditions",
          "VIX analysis and volatility-based position sizing",
          "Professional market timing and strategy selection"
        ],
        practicalSteps: [
          "Monitor market breadth indicators and sector rotation",
          "Analyze VIX levels and implied volatility trends",
          "Adapt position sizing based on market volatility",
          "Develop regime-specific trading playbooks"
        ],
        example: "Market regime: High VIX (>25), reduce position sizes 50%, focus on mean reversion vs momentum strategies."
      }
    },
    {
      id: 12,
      title: "Professional Performance Analysis",
      duration: "28 min",
      description: "Master professional performance tracking and continuous improvement methodologies",
      content: {
        overview: "Implement comprehensive performance analysis systems that identify strengths, weaknesses, and optimization opportunities for continuous trading improvement.",
        keyPoints: [
          "Professional performance metrics and KPI tracking",
          "Trade journal analysis and pattern identification",
          "Psychological performance evaluation and improvement",
          "Systematic strategy optimization and backtesting"
        ],
        practicalSteps: [
          "Track key metrics: win rate, profit factor, average R-multiple",
          "Maintain detailed trade journal with setup classifications",
          "Conduct weekly and monthly performance reviews",
          "Implement systematic improvement protocols"
        ],
        example: "Performance analysis: 60% win rate, 1.8 profit factor, identify best setups = Focus 80% on highest probability patterns."
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
            <Activity className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Strategy #20</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Day Trading Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master institutional-grade day trading techniques with market maker psychology, Level II analysis, and professional execution strategies for consistent daily profits
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
              <Activity className="h-6 w-6 text-purple-600" />
              Professional Day Trading Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Market maker psychology and institutional flow analysis</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Level II order book mastery for optimal execution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Professional risk management and capital preservation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Multiple strategy integration: momentum, scalping, gaps, news</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Daily Income</div>
                    <div className="text-sm text-purple-700">$500-2,000 per day with proper execution</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Win Rate</div>
                    <div className="text-sm text-green-700">60%+ with professional discipline</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Risk Control</div>
                    <div className="text-sm text-blue-700">Maximum 2% account risk per trade</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Professional Day Trading Curriculum</h2>
          
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
                          <Activity className="h-6 w-6 text-purple-600" />
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
                          <Activity className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
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
                  <div className="bg-green-50 border-l-4 border-green-400 p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Practical Example</h4>
                    <p className="text-green-800">{lesson.content.example}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
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
          <Card className="mt-8 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="text-center py-8">
              <Activity className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-900 mb-2">
                Professional Day Trading Master Complete!
              </h3>
              <p className="text-purple-800 mb-6">
                You've mastered all 12 lessons of professional day trading. 
                You're now equipped with market maker psychology, Level II mastery, professional execution techniques, and institutional-grade strategies for consistent daily profits.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Professional Execution</div>
                  <div className="text-sm text-gray-600">Institutional-grade techniques</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Market Psychology</div>
                  <div className="text-sm text-gray-600">Smart money strategies</div>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Daily Income</div>
                  <div className="text-sm text-gray-600">Consistent profit generation</div>
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
            <CardTitle>Complement Your Professional Day Trading Skills</CardTitle>
            <CardDescription>
              Enhance your day trading approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Lightning Scalp Master</h4>
                <p className="text-blue-700 text-sm">Advanced scalping techniques</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/15')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Profit Taking Master</h4>
                <p className="text-green-700 text-sm">Strategic exit techniques</p>
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
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Market Mastery Group</h4>
                <p className="text-purple-700 text-sm">Advanced market analysis</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/7')}
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