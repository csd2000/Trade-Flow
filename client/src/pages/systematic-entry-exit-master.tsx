import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Settings } from 'lucide-react';

export function SystematicEntryExitMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Systematic Trading Foundation",
      duration: "25 min",
      description: "Master the core principles of systematic trading with rule-based entry and exit strategies",
      content: {
        overview: "Build a comprehensive systematic trading framework that eliminates emotional decision-making through clearly defined rules for market entry, exit, and risk management.",
        keyPoints: [
          "Systematic approach removes emotional trading decisions",
          "Rule-based framework ensures consistent execution",
          "Clear entry and exit criteria eliminate guesswork",
          "Risk management integrated into every trading decision"
        ],
        practicalSteps: [
          "Define your trading style: trend following, mean reversion, or breakout",
          "Create written rules for market analysis and trade identification",
          "Establish risk parameters: maximum loss per trade and position sizing",
          "Set up systematic review process for strategy performance"
        ],
        example: "Systematic rule: Only enter trades with 3:1 risk-reward ratio + volume confirmation + trend alignment = 85% win rate improvement."
      }
    },
    {
      id: 2,
      title: "Technical Analysis Framework",
      duration: "28 min", 
      description: "Develop systematic technical analysis skills using multiple timeframes and confirmation signals",
      content: {
        overview: "Master professional technical analysis techniques using systematic approaches for trend identification, support/resistance analysis, and momentum confirmation.",
        keyPoints: [
          "Multiple timeframe analysis for trend confirmation",
          "Support and resistance identification using price action",
          "Momentum indicators for entry timing validation",
          "Volume analysis for signal strength confirmation"
        ],
        practicalSteps: [
          "Set up three-timeframe analysis: daily (trend), 4-hour (structure), 1-hour (entry)",
          "Identify key support/resistance levels using previous highs/lows",
          "Use RSI + MACD + Moving Averages for momentum confirmation",
          "Confirm all signals with volume analysis before entry"
        ],
        example: "Multi-timeframe setup: Daily uptrend + 4H support bounce + 1H bullish divergence + volume spike = High probability long entry."
      }
    },
    {
      id: 3,
      title: "Entry Strategy Mastery",
      duration: "30 min",
      description: "Master systematic entry strategies using breakouts, trend following, and mean reversion",
      content: {
        overview: "Implement professional entry strategies with systematic rules for breakout trading, trend following, and mean reversion opportunities.",
        keyPoints: [
          "Breakout strategy with volume confirmation requirements",
          "Trend following entries using momentum indicators",
          "Mean reversion entries at key support/resistance levels",
          "False breakout identification and counter-trend opportunities"
        ],
        practicalSteps: [
          "Breakout entry: Price closes above resistance + volume 150% of average",
          "Trend entry: Price pulls back to 20 EMA + RSI oversold + trend continuation",
          "Mean reversion: Price at major support + RSI below 30 + bullish divergence",
          "Set alerts for all entry conditions to automate signal detection"
        ],
        example: "Breakout system: AAPL breaks $150 resistance + 2M shares volume (vs 800K average) + daily close above = Systematic long entry."
      }
    },
    {
      id: 4,
      title: "Exit Strategy Systems",
      duration: "27 min",
      description: "Develop systematic exit rules using multiple targets, trailing stops, and time-based exits",
      content: {
        overview: "Create comprehensive exit strategies that maximize profits while protecting capital through systematic stop losses, profit targets, and trailing mechanisms.",
        keyPoints: [
          "Multiple profit target system for position scaling",
          "Trailing stop strategies to protect profits",
          "Time-based exits for momentum trades",
          "Break-even stop placement after initial profit"
        ],
        practicalSteps: [
          "Set TP1 at 1.5R, TP2 at 2.5R, TP3 at 4R (R = initial risk)",
          "Trail stops using ATR or percentage-based methods",
          "Close 50% position at TP1, 30% at TP2, 20% at TP3",
          "Move stop to breakeven +1 pip after TP1 hit"
        ],
        example: "Exit system: $1000 risk trade, TP1 at +$1500 (50% close), TP2 at +$2500 (30% close), trail remaining 20% position."
      }
    },
    {
      id: 5,
      title: "Position Sizing Mathematics",
      duration: "26 min",
      description: "Master professional position sizing calculations for optimal risk management",
      content: {
        overview: "Implement systematic position sizing techniques using mathematical formulas to optimize risk-reward while protecting capital.",
        keyPoints: [
          "Fixed percentage risk method for consistency",
          "Volatility-based position sizing using ATR",
          "Kelly Criterion for optimal position size calculation",
          "Portfolio heat management across multiple positions"
        ],
        practicalSteps: [
          "Calculate position size: (Account Risk ÷ Trade Risk) = Position Size",
          "Use ATR for volatility adjustment: Standard Size × (Current ATR ÷ Average ATR)",
          "Apply Kelly formula: f* = (bp - q) ÷ b where b=odds, p=win rate, q=loss rate",
          "Monitor total portfolio exposure: limit to 8-10% total risk across all trades"
        ],
        example: "Position sizing: $100K account, 1% risk ($1000), $5 stop distance = 200 shares maximum position size."
      }
    },
    {
      id: 6,
      title: "Risk Management Systems", 
      duration: "29 min",
      description: "Implement systematic risk controls and capital preservation strategies",
      content: {
        overview: "Develop comprehensive risk management systems that protect capital while allowing for optimal profit generation through systematic controls.",
        keyPoints: [
          "Maximum daily/weekly loss limits and enforcement",
          "Position correlation analysis and diversification",
          "Drawdown management and recovery strategies",
          "Portfolio risk assessment and adjustment protocols"
        ],
        practicalSteps: [
          "Set daily stop: Maximum 3% account loss, weekly stop: 6% loss",
          "Limit correlated positions: Maximum 3 trades in same sector",
          "Implement drawdown rules: Reduce size by 50% after 10% drawdown",
          "Monthly portfolio review: Adjust risk based on performance"
        ],
        example: "Risk control: After 2% daily loss, reduce position sizes by 50%. After 3% loss, stop trading for the day."
      }
    },
    {
      id: 7,
      title: "Trend Following Systems",
      duration: "31 min",
      description: "Master systematic trend following strategies with professional entry and exit timing",
      content: {
        overview: "Implement proven trend following systems that capture major market moves through systematic identification and execution of trending opportunities.",
        keyPoints: [
          "Trend identification using multiple moving averages",
          "Momentum confirmation with ADX and MACD systems",
          "Pullback entry strategies within established trends",
          "Trend continuation vs reversal signal recognition"
        ],
        practicalSteps: [
          "Confirm trend: 20 EMA > 50 EMA > 200 EMA for uptrend",
          "Wait for pullback to 20 EMA with RSI 30-50 range",
          "Enter on bullish candle close above 20 EMA with volume",
          "Trail stop 2 ATR below recent swing low in uptrend"
        ],
        example: "Trend system: SPY uptrend confirmed, pullback to 20 EMA at $400, bullish hammer + volume = Long entry with $395 stop."
      }
    },
    {
      id: 8,
      title: "Mean Reversion Strategies",
      duration: "24 min",
      description: "Master systematic mean reversion trading using oversold/overbought conditions",
      content: {
        overview: "Develop systematic mean reversion strategies that profit from price extremes and return to mean using statistical and technical analysis.",
        keyPoints: [
          "Identifying oversold/overbought conditions systematically",
          "Support and resistance confluence for entry points",
          "Statistical mean reversion using Bollinger Bands",
          "Time-based mean reversion in range-bound markets"
        ],
        practicalSteps: [
          "Identify range: Mark major support/resistance levels",
          "Oversold entry: RSI < 25 + price at support + bullish divergence",
          "Overbought entry: RSI > 75 + price at resistance + bearish divergence",
          "Target opposite range boundary with 50% position scaling"
        ],
        example: "Mean reversion: EUR/USD at 1.0500 support, RSI 18, bullish divergence = Long entry targeting 1.0600 resistance."
      }
    },
    {
      id: 9,
      title: "Breakout Trading Systems",
      duration: "28 min",
      description: "Master systematic breakout strategies with false breakout protection",
      content: {
        overview: "Implement professional breakout trading systems that capture explosive price movements while protecting against false breakouts through systematic validation.",
        keyPoints: [
          "Identifying high-probability breakout setups",
          "Volume confirmation requirements for valid breakouts",
          "False breakout detection and protection strategies",
          "Continuation vs exhaustion breakout patterns"
        ],
        practicalSteps: [
          "Identify consolidation: Minimum 10 touches of support/resistance",
          "Breakout entry: Close beyond level + volume 200% of 10-day average",
          "Confirm with momentum: RSI > 60 for upside breakouts",
          "Stop loss: 1 ATR below/above the breakout level"
        ],
        example: "Breakout system: TSLA consolidating at $200, breaks above with 5M volume vs 1.5M average = Valid breakout entry."
      }
    },
    {
      id: 10,
      title: "Market Structure Analysis",
      duration: "26 min",
      description: "Understand systematic market structure analysis for timing and context",
      content: {
        overview: "Master market structure analysis to understand institutional behavior and optimal timing for systematic trade entries and exits.",
        keyPoints: [
          "Higher highs and higher lows identification",
          "Market structure breaks and trend changes",
          "Support and resistance level significance",
          "Institutional order flow and smart money concepts"
        ],
        practicalSteps: [
          "Map major structure levels on daily and weekly charts",
          "Identify break of structure signals for trend changes",
          "Mark institutional levels: round numbers, previous highs/lows",
          "Time entries around market structure confluences"
        ],
        example: "Structure analysis: S&P 500 breaking above 4200 weekly resistance + institutional buying = Systematic long bias confirmed."
      }
    },
    {
      id: 11,
      title: "Performance Tracking Systems",
      duration: "23 min",
      description: "Implement systematic performance analysis and strategy optimization",
      content: {
        overview: "Develop comprehensive performance tracking systems that identify strengths, weaknesses, and optimization opportunities in your systematic approach.",
        keyPoints: [
          "Key performance metrics and ratio calculations",
          "Win rate and risk-reward analysis by strategy",
          "Drawdown analysis and recovery patterns",
          "Strategy performance attribution and optimization"
        ],
        practicalSteps: [
          "Track metrics: Win rate, average win/loss, profit factor, Sharpe ratio",
          "Analyze by strategy: Breakout vs trend vs mean reversion performance",
          "Monthly review: Identify best performing setups and market conditions",
          "Optimize rules: Adjust criteria based on performance data"
        ],
        example: "Performance data: Trend following 72% win rate, 2.8:1 R:R. Mean reversion 65% win rate, 2.1:1 R:R = Focus on trends."
      }
    },
    {
      id: 12,
      title: "Systematic Psychology & Discipline",
      duration: "27 min",
      description: "Master trading psychology and maintain systematic discipline under pressure",
      content: {
        overview: "Develop mental frameworks and systematic approaches to maintain discipline, control emotions, and execute your trading plan consistently.",
        keyPoints: [
          "Systematic approach to emotional control",
          "Discipline frameworks for rule adherence",
          "Stress management during losing streaks",
          "Continuous improvement mindset and adaptation"
        ],
        practicalSteps: [
          "Create pre-market routine: Review rules, market conditions, potential setups",
          "Use checklists: Verify all criteria before entering any trade",
          "Post-trade review: Analyze execution quality regardless of outcome",
          "Implement cooling-off periods after emotional trades or big losses"
        ],
        example: "Discipline system: After 3 consecutive losses, take 24-hour break. Use 5-point checklist before every entry. No exceptions."
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
            <Settings className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Strategy #17</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Systematic Entry Exit Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master professional systematic trading with rule-based entry/exit strategies, advanced position sizing, and comprehensive risk management systems
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
              <Settings className="h-6 w-6 text-blue-600" />
              Professional Systematic Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Rule-based framework eliminates emotional decisions</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Systematic entry/exit strategies with mathematical precision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Professional position sizing and risk management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Multi-strategy approach: trend, breakout, mean reversion</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Consistency</div>
                    <div className="text-sm text-green-700">85% rule adherence improvement</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Risk Control</div>
                    <div className="text-sm text-blue-700">Maximum 2% risk per trade</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Win Rate</div>
                    <div className="text-sm text-purple-700">70%+ with 2.5:1 R:R ratio</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Systematic Trading Curriculum</h2>
          
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
                          <Settings className="h-6 w-6 text-blue-600" />
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
                          <Settings className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
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
                        <Settings className="h-4 w-4 mr-2" />
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
              <Settings className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                Systematic Entry Exit Master Complete!
              </h3>
              <p className="text-blue-800 mb-6">
                You've mastered all 12 lessons of professional systematic trading. 
                You're now equipped with rule-based frameworks, mathematical position sizing, and institutional-grade risk management.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Systematic Rules</div>
                  <div className="text-sm text-gray-600">Eliminate emotional decisions</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Professional capital protection</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Performance</div>
                  <div className="text-sm text-gray-600">70%+ win rate optimization</div>
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
            <CardTitle>Complement Your Systematic Skills</CardTitle>
            <CardDescription>
              Enhance your systematic approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Algorithmic Trading</h4>
                <p className="text-purple-700 text-sm">Automated execution systems</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/14')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Momentum Trading</h4>
                <p className="text-green-700 text-sm">Systematic momentum capture</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/13')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Oliver Velez MA</h4>
                <p className="text-blue-700 text-sm">Systematic MA strategies</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/9')}
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