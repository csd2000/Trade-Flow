import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, TrendingUp, Target, AlertTriangle, DollarSign, Clock, BarChart3 } from 'lucide-react';

export function SystematicMomentumStrategy() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Foundation of Systematic Trading",
      duration: "15 min",
      description: "Understanding the core principles of systematic momentum trading",
      content: {
        overview: "Systematic momentum trading removes emotion from trading decisions by following predefined rules based on quantitative analysis.",
        keyPoints: [
          "Momentum stocks move in trends - up trends tend to continue",
          "Systematic approach eliminates emotional trading decisions",
          "Focus on liquid stocks with strong institutional backing",
          "Use quantitative filters to identify highest probability setups"
        ],
        practicalSteps: [
          "Set up screening criteria for momentum stocks",
          "Define minimum daily volume requirements (1M+ shares)",
          "Establish price range filters ($5-$200 per share)",
          "Create market cap filters (minimum $1B market cap)"
        ],
        example: "Example: Screen for stocks with 50-day high breakouts, volume 150% above average, and strong relative strength vs S&P 500"
      }
    },
    {
      id: 2,
      title: "Momentum Stock Identification System",
      duration: "20 min", 
      description: "Learn the exact criteria for identifying high-momentum stocks",
      content: {
        overview: "A systematic approach to finding stocks with the highest probability of continued upward momentum.",
        keyPoints: [
          "Relative Strength Index (RSI) between 50-80 for healthy momentum",
          "Price above 20, 50, and 200-day moving averages",
          "Volume expansion on breakout days (200%+ average volume)",
          "Strong earnings growth and institutional ownership"
        ],
        practicalSteps: [
          "Use stock screeners to filter by technical criteria",
          "Check fundamental metrics: EPS growth >25% YoY",
          "Verify institutional ownership >70%",
          "Confirm recent positive earnings surprise"
        ],
        example: "Example filter: Stock price >$10, RSI 50-80, above 50MA, volume >1.5x average, EPS growth >25%"
      }
    },
    {
      id: 3,
      title: "Entry Signal Generation",
      duration: "25 min",
      description: "Master the precise entry signals for momentum trades",
      content: {
        overview: "Timing is critical in momentum trading. Learn the exact signals that indicate optimal entry points.",
        keyPoints: [
          "Breakout above resistance with volume confirmation",
          "Pullback to support (20-day MA) in strong uptrend",
          "Gap up on positive news with follow-through",
          "Base breakout after 3-8 week consolidation"
        ],
        practicalSteps: [
          "Wait for clean breakout above prior resistance",
          "Confirm with volume at least 150% of 20-day average",
          "Enter within 5% of breakout point",
          "Set initial stop loss 7-8% below entry"
        ],
        example: "Stock breaks above $50 resistance on 2x volume. Enter at $50.50, stop loss at $46.50"
      }
    },
    {
      id: 4,
      title: "Position Sizing and Risk Management",
      duration: "20 min",
      description: "Calculate optimal position sizes and manage risk systematically",
      content: {
        overview: "Proper position sizing is the difference between consistent profits and devastating losses.",
        keyPoints: [
          "Risk maximum 1-2% of account per trade",
          "Position size = (Account Risk) / (Entry Price - Stop Loss)",
          "Never risk more than 10% of account in single sector",
          "Use position scaling for high-conviction setups"
        ],
        practicalSteps: [
          "Calculate maximum dollar risk per trade",
          "Determine stop loss distance from entry",
          "Calculate position size using risk formula",
          "Verify position doesn't exceed sector allocation limits"
        ],
        example: "$100K account, 2% risk = $2000. Entry $50, stop $46 = $4 risk per share. Position = 500 shares"
      }
    },
    {
      id: 5,
      title: "Exit Strategy and Profit Taking",
      duration: "18 min",
      description: "Systematic approaches to maximizing profits and minimizing losses",
      content: {
        overview: "Having predetermined exit rules is crucial for maintaining discipline and maximizing returns.",
        keyPoints: [
          "Take partial profits at 20-25% gains",
          "Trail stop loss to breakeven after 15% gain",
          "Use moving average as trailing stop (20-day MA)",
          "Exit if momentum deteriorates (RSI <40)"
        ],
        practicalSteps: [
          "Scale out 1/3 position at first resistance level",
          "Move stop to breakeven after 15% gain",
          "Trail remaining position with 20-day MA",
          "Exit completely if stock closes below 20-day MA"
        ],
        example: "Entry $50, take 1/3 profits at $60, trail stop with 20-day MA, exit if closes below MA"
      }
    },
    {
      id: 6,
      title: "Market Environment Analysis", 
      duration: "22 min",
      description: "Adapt your strategy based on overall market conditions",
      content: {
        overview: "Momentum strategies work best in trending markets. Learn to identify optimal market conditions.",
        keyPoints: [
          "Bull market: Aggressive position sizing, hold winners longer",
          "Bear market: Reduce size, quick profits, tight stops",
          "Sideways market: Focus on sector rotation plays",
          "High volatility: Widen stops, reduce position size"
        ],
        practicalSteps: [
          "Track major indices (SPY, QQQ, IWM) trend direction",
          "Monitor VIX levels for volatility assessment",
          "Adjust position sizes based on market regime",
          "Increase cash allocation in uncertain markets"
        ],
        example: "SPY above 200MA = bull market. Use full position sizes. VIX >30 = high volatility, reduce size by 50%"
      }
    },
    {
      id: 7,
      title: "Sector Rotation and Leadership",
      duration: "25 min", 
      description: "Identify leading sectors and rotate capital for maximum returns",
      content: {
        overview: "Money flows between sectors in predictable patterns. Learn to follow the smart money.",
        keyPoints: [
          "Technology leads in growth phases",
          "Defensive sectors (utilities, staples) lead in corrections",
          "Cyclicals (industrials, materials) lead economic recovery",
          "Monitor sector ETF relative performance"
        ],
        practicalSteps: [
          "Create sector rotation watchlist using sector ETFs",
          "Track relative strength of sectors vs S&P 500",
          "Focus stock selection in strongest sectors",
          "Avoid stocks in weakest sectors"
        ],
        example: "XLK (tech) outperforming SPY by 5% over 4 weeks = focus on tech momentum stocks"
      }
    },
    {
      id: 8,
      title: "Backtesting and Performance Analysis",
      duration: "30 min",
      description: "Test your strategy and analyze performance for continuous improvement",
      content: {
        overview: "Systematic testing of your strategy on historical data reveals strengths and weaknesses.",
        keyPoints: [
          "Test strategy on 3-5 years of historical data",
          "Calculate key metrics: Win rate, avg win/loss, Sharpe ratio",
          "Identify optimal market conditions for strategy",
          "Continuously refine rules based on results"
        ],
        practicalSteps: [
          "Download historical data for testing",
          "Apply entry/exit rules systematically",
          "Record all trades with entry/exit prices",
          "Calculate performance metrics and drawdowns"
        ],
        example: "Backtest shows 65% win rate, 1.8 reward/risk ratio, 25% annual return with 15% max drawdown"
      }
    },
    {
      id: 9,
      title: "Advanced Momentum Indicators",
      duration: "28 min",
      description: "Utilize sophisticated technical indicators for enhanced signal accuracy",
      content: {
        overview: "Advanced indicators can improve entry timing and reduce false signals in momentum trading.",
        keyPoints: [
          "Relative Strength (RS) line vs S&P 500",
          "Accumulation/Distribution line for volume analysis",
          "Williams %R for overbought/oversold conditions",
          "MACD histogram for momentum confirmation"
        ],
        practicalSteps: [
          "Plot RS line to identify strongest stocks",
          "Use A/D line to confirm price movements",
          "Apply Williams %R for entry timing",
          "Confirm breakouts with MACD histogram"
        ],
        example: "Stock breaks resistance + RS line new high + MACD histogram positive = high probability setup"
      }
    },
    {
      id: 10,
      title: "Psychology and Discipline",
      duration: "20 min",
      description: "Maintain emotional control and systematic discipline",
      content: {
        overview: "The biggest enemy of systematic trading is abandoning your rules due to emotions.",
        keyPoints: [
          "Follow rules mechanically without deviation",
          "Accept that not every trade will be profitable",
          "Focus on process, not individual trade outcomes",
          "Keep detailed trading journal for accountability"
        ],
        practicalSteps: [
          "Write down your complete trading plan",
          "Review trades weekly for rule adherence",
          "Keep emotions in check during winning/losing streaks",
          "Take breaks after consecutive losses"
        ],
        example: "Trade journal entry: 'Entered NVDA at $120 per rules, stopped out at $111. Followed system correctly.'"
      }
    },
    {
      id: 11,
      title: "Portfolio Construction and Diversification",
      duration: "25 min",
      description: "Build a diversified momentum portfolio for consistent returns",
      content: {
        overview: "Proper portfolio construction reduces risk while maintaining momentum exposure.",
        keyPoints: [
          "Maximum 5% position size in any single stock",
          "Diversify across 10-15 positions minimum",
          "Limit sector concentration to 20%",
          "Maintain 10-20% cash for new opportunities"
        ],
        practicalSteps: [
          "Set maximum position size limits",
          "Track sector allocation percentages",
          "Rebalance when positions exceed limits",
          "Keep opportunity fund for best setups"
        ],
        example: "Portfolio: 15 positions, max 5% each, 6 sectors represented, 15% cash reserve"
      }
    },
    {
      id: 12,
      title: "Live Trading Implementation",
      duration: "35 min",
      description: "Execute your systematic momentum strategy in real market conditions",
      content: {
        overview: "Transitioning from theory to live trading requires careful preparation and execution.",
        keyPoints: [
          "Start with paper trading for 2-3 months",
          "Begin with small position sizes (0.5% risk)",
          "Gradually increase size as confidence builds",
          "Track performance vs benchmark continuously"
        ],
        practicalSteps: [
          "Set up real-time screening tools",
          "Create watchlists for momentum candidates",
          "Establish order entry procedures",
          "Implement systematic review process"
        ],
        example: "Week 1: Paper trade 5 positions. Week 8: Live trade with 0.5% risk. Week 20: Full 2% risk per trade"
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
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Strategy #13</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Systematic Momentum Trading
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master a quantitative approach to momentum trading with systematic rules for stock selection, entry signals, and risk management
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
                <div className="text-2xl font-bold text-blue-600">{completedLessons.length}</div>
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
              <Target className="h-6 w-6 text-blue-600" />
              Strategy Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Principles</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Systematic approach removes emotional trading decisions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Focus on stocks with strong upward momentum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Quantitative filters identify highest probability setups</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Strict risk management with predetermined exit rules</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Expected Outcomes</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Win Rate: 60-70%</div>
                    <div className="text-sm text-green-700">Historical backtesting results</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Risk/Reward: 1:2</div>
                    <div className="text-sm text-blue-700">Average loss vs average gain</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Annual Return: 20-35%</div>
                    <div className="text-sm text-purple-700">Net of fees and slippage</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Course Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
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
                          <TrendingUp className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Practical Implementation</h4>
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
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Trading Example</h4>
                    <p className="text-yellow-800">{lesson.content.example}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Lesson Complete
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
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Strategy Mastery Complete!
              </h3>
              <p className="text-green-800 mb-6">
                You've successfully completed all 12 lessons of the Systematic Momentum Trading strategy. 
                You're now ready to implement this quantitative approach in live markets.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Systematic rules mastered</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Signal Generation</div>
                  <div className="text-sm text-gray-600">Entry/exit criteria learned</div>
                </div>
                <div className="text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Portfolio Construction</div>
                  <div className="text-sm text-gray-600">Diversification principles applied</div>
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

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommended Next Steps</CardTitle>
            <CardDescription>
              Continue your trading education with these complementary strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Oliver Velez Strategy</h4>
                <p className="text-blue-700 text-sm">20-Period MA systematic approach</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/9')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Smart Money Concepts</h4>
                <p className="text-green-700 text-sm">Institutional trading insights</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/10')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Market Mastery Group</h4>
                <p className="text-purple-700 text-sm">45+ years professional experience</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/6')}
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