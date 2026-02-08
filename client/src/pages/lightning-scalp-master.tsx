import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Zap, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield } from 'lucide-react';

export function LightningScalpMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Lightning Scalping Foundation",
      duration: "18 min",
      description: "Master the high-speed world of 1-minute chart scalping for rapid profits",
      content: {
        overview: "Lightning scalping targets tiny price movements within extremely short timeframes, making multiple quick trades that compound into significant daily profits.",
        keyPoints: [
          "Execute trades on 1-minute charts with lightning speed",
          "Target 2-15 pips per trade with high frequency execution",
          "Focus on high-volume sessions for maximum opportunities",
          "Accumulate small profits that compound throughout the session"
        ],
        practicalSteps: [
          "Set up 1-minute primary charts with 5-minute confirmation",
          "Identify optimal trading sessions (London/NY overlap)",
          "Configure ultra-fast execution platform with tight spreads",
          "Establish 1-2 hour focused trading windows daily"
        ],
        example: "Typical session: Trade EUR/USD during London-NY overlap (8-11 AM EST), target 8-12 pips per trade, execute 15-25 trades for 120-300 pip daily target."
      }
    },
    {
      id: 2,
      title: "Triple EMA Lightning Setup",
      duration: "22 min", 
      description: "Deploy the powerful Triple EMA system for trend detection and entry timing",
      content: {
        overview: "The Triple EMA system uses three exponential moving averages to create a robust trend filter that eliminates false signals in scalping.",
        keyPoints: [
          "50 EMA for short-term trend identification",
          "100 EMA for medium-term trend confirmation", 
          "150 EMA for long-term directional bias",
          "EMA alignment determines trade direction and strength"
        ],
        practicalSteps: [
          "Add 50, 100, and 150 EMAs to 1-minute chart",
          "Identify bullish alignment: 50 > 100 > 150 EMA",
          "Identify bearish alignment: 50 < 100 < 150 EMA",
          "Only trade in direction of EMA alignment"
        ],
        example: "Long setup: Price above 50 EMA, 50 EMA above 100 EMA, 100 EMA above 150 EMA. Enter on pullbacks to 50 EMA support with confirmation."
      }
    },
    {
      id: 3,
      title: "MACD Lightning Signals",
      duration: "20 min",
      description: "Configure MACD for ultra-fast scalping signals and momentum detection",
      content: {
        overview: "MACD settings optimized for 1-minute scalping provide rapid signal generation while filtering out market noise for precise entries.",
        keyPoints: [
          "Standard MACD (12,26,9) vs Fast MACD (6,13,5) settings",
          "MACD line crosses for entry signal generation",
          "Histogram changes for momentum confirmation",
          "Divergence detection for reversal opportunities"
        ],
        practicalSteps: [
          "Configure MACD with 6,13,5 settings for faster signals",
          "Watch for MACD line crossing above signal line (buy)",
          "Watch for MACD line crossing below signal line (sell)",
          "Confirm with histogram turning positive/negative"
        ],
        example: "Entry: MACD line crosses above signal line + histogram turns positive + price above 50 EMA = Strong long signal."
      }
    },
    {
      id: 4,
      title: "Stochastic Speed System",
      duration: "19 min",
      description: "Use Stochastic oscillator for overbought/oversold scalping opportunities",
      content: {
        overview: "Stochastic oscillator optimized for scalping identifies precise entry points when price reaches extreme overbought or oversold levels.",
        keyPoints: [
          "Standard settings (14,1,3) vs Fast settings (9,3,1)",
          "Overbought level above 80 for potential sells",
          "Oversold level below 20 for potential buys",
          "Crossover signals for momentum confirmation"
        ],
        practicalSteps: [
          "Set Stochastic to 9,3,1 for faster scalping signals",
          "Identify oversold crosses above 20 for long entries",
          "Identify overbought crosses below 80 for short entries", 
          "Combine with trend direction for confirmation"
        ],
        example: "Long entry: Stochastic rises above 20 + bullish EMA alignment + price bouncing off support = High probability scalp."
      }
    },
    {
      id: 5,
      title: "RSI Lightning Momentum",
      duration: "17 min",
      description: "Deploy RSI for momentum confirmation and divergence detection",
      content: {
        overview: "RSI optimized for scalping provides momentum confirmation and identifies divergence opportunities for high-probability reversals.",
        keyPoints: [
          "RSI(7) or RSI(9) for faster signals vs standard RSI(14)",
          "Overbought above 70, oversold below 30 levels",
          "Momentum confirmation with other indicators",
          "Divergence detection for reversal opportunities"
        ],
        practicalSteps: [
          "Configure RSI with period 7 for faster scalping signals",
          "Use RSI for momentum confirmation, not primary signals",
          "Watch for bullish divergence (price lower, RSI higher)",
          "Watch for bearish divergence (price higher, RSI lower)"
        ],
        example: "Momentum confirmation: MACD buy signal + RSI rising from below 30 + bullish EMA alignment = Strong long momentum."
      }
    },
    {
      id: 6,
      title: "VWAP Lightning Levels", 
      duration: "21 min",
      description: "Master VWAP as dynamic support/resistance for institutional sentiment",
      content: {
        overview: "VWAP (Volume Weighted Average Price) acts as a dynamic support/resistance level that reveals institutional buying and selling pressure.",
        keyPoints: [
          "Price above VWAP indicates bullish institutional bias",
          "Price below VWAP indicates bearish institutional bias",
          "VWAP acts as dynamic support in uptrends",
          "VWAP acts as dynamic resistance in downtrends"
        ],
        practicalSteps: [
          "Add VWAP indicator to 1-minute chart",
          "Identify bullish bias when price trades above VWAP",
          "Identify bearish bias when price trades below VWAP",
          "Use VWAP as entry trigger and profit target"
        ],
        example: "VWAP strategy: Price above VWAP + pullback to VWAP support + MACD bullish cross = High probability long scalp."
      }
    },
    {
      id: 7,
      title: "Lightning Entry Strategies",
      duration: "25 min",
      description: "Two proven scalping strategies for consistent profit extraction",
      content: {
        overview: "These battle-tested entry strategies combine multiple indicators for high-probability scalping setups with excellent risk-reward ratios.",
        keyPoints: [
          "Strategy 1: EMA + Stochastic + RSI combination",
          "Strategy 2: VWAP + MACD momentum system",
          "Multiple confirmation requirements reduce false signals",
          "Precise entry timing maximizes profit potential"
        ],
        practicalSteps: [
          "Master Strategy 1: EMA trend + Stochastic oversold/overbought + RSI momentum",
          "Master Strategy 2: VWAP bias + MACD signal + histogram confirmation",
          "Practice both strategies on demo until consistent",
          "Choose primary strategy based on market conditions"
        ],
        example: "Strategy 1 Long: 50>100>150 EMA + Stochastic crosses above 20 + RSI confirms upward momentum = Enter long."
      }
    },
    {
      id: 8,
      title: "Lightning Risk Management",
      duration: "23 min",
      description: "Protect capital with ultra-tight risk controls and position sizing",
      content: {
        overview: "Lightning scalping requires precise risk management with ultra-tight stops and proper position sizing to maximize profitability.",
        keyPoints: [
          "Risk maximum 0.5-1% of account per trade",
          "Use tight stop losses (5-15 pips maximum)",
          "Target minimum 1.5:1 risk-reward ratios",
          "Never hold losing positions hoping for recovery"
        ],
        practicalSteps: [
          "Calculate position size: (Account × Risk%) ÷ Stop Distance",
          "Place stops 1-2 pips beyond support/resistance",
          "Set profit targets at 1.5x-2x stop distance",
          "Move stops to breakeven +2 pips after 5 pip profit"
        ],
        example: "Risk management: $10k account, 1% risk, 10 pip stop = $100 risk = 1 micro lot position size."
      }
    },
    {
      id: 9,
      title: "Optimal Currency Pairs",
      duration: "16 min",
      description: "Select the best currency pairs for lightning scalping success",
      content: {
        overview: "Currency pair selection is crucial for scalping success, requiring tight spreads, high liquidity, and predictable price movement patterns.",
        keyPoints: [
          "EUR/USD: Highest liquidity and tightest spreads",
          "GBP/USD: Good volatility and momentum moves",
          "USD/JPY: Excellent trending characteristics",
          "AUD/USD and USD/CAD: Alternative high-volume pairs"
        ],
        practicalSteps: [
          "Focus on major pairs with spreads under 2 pips",
          "Trade during high-volume sessions for best execution",
          "Monitor economic calendar for news events",
          "Start with EUR/USD for learning and consistency"
        ],
        example: "Optimal setup: EUR/USD during London-NY overlap (8-11 AM EST) with 0.5-1.5 pip spreads and high volume."
      }
    },
    {
      id: 10,
      title: "Platform Lightning Setup",
      duration: "24 min",
      description: "Configure your trading platform for maximum scalping efficiency",
      content: {
        overview: "Platform configuration is critical for scalping success, requiring fast execution, reliable data feeds, and optimized interface layout.",
        keyPoints: [
          "Sub-second order execution capability essential",
          "Real-time tick data feeds required",
          "Low commission structure (under $5 per round turn)",
          "Backup internet and platform redundancy"
        ],
        practicalSteps: [
          "Choose broker with ECN/STP execution and tight spreads",
          "Configure one-click trading for instant execution",
          "Set up chart layout with all indicators visible",
          "Test execution speed and slippage during peak hours"
        ],
        example: "Optimal setup: MT4/MT5 with ECN broker, 1-click trading enabled, sub-second fills, backup internet connection."
      }
    },
    {
      id: 11,
      title: "Session Timing Mastery",
      duration: "18 min",
      description: "Master the optimal trading sessions for maximum scalping opportunities",
      content: {
        overview: "Trading session timing determines scalping success, with specific windows offering optimal volatility and liquidity combinations.",
        keyPoints: [
          "London session (3-12 PM GMT): High European activity",
          "New York session (1-10 PM GMT): Maximum US market activity", 
          "London-NY overlap (1-5 PM GMT): Premium scalping window",
          "Avoid Asian session unless trading JPY pairs"
        ],
        practicalSteps: [
          "Focus 80% of trading during London-NY overlap",
          "Monitor session opening breakouts for momentum",
          "Reduce position sizes during low-volume periods",
          "Track optimal performance hours in trading journal"
        ],
        example: "Prime time: 8-11 AM EST (London-NY overlap) provides 300-500% more scalping opportunities than other sessions."
      }
    },
    {
      id: 12,
      title: "Lightning Performance Optimization",
      duration: "26 min",
      description: "Optimize your scalping performance and scale to consistent profitability",
      content: {
        overview: "Performance optimization involves continuous improvement of entry timing, risk management, and psychological discipline for scalping mastery.",
        keyPoints: [
          "Track win rate (target 60-70% for successful scalping)",
          "Monitor average win (8-15 pips) vs average loss (5-10 pips)",
          "Maintain 1.5:1+ reward/risk ratio minimum",
          "Scale position sizes gradually as consistency improves"
        ],
        practicalSteps: [
          "Keep detailed trading journal with all trade data",
          "Review daily performance and identify patterns",
          "Practice on demo until achieving 30+ consecutive profitable days",
          "Start live with 25% target size, scale up monthly"
        ],
        example: "Target performance: 65% win rate, 10 pip average win, 6 pip average loss, 30-100 pips daily profit target."
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
          <div className="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full mb-4">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Strategy #15</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Lightning Scalp Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master high-speed 1-minute chart scalping for rapid profits using triple confirmation signals and lightning-fast execution
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
                <div className="text-2xl font-bold text-yellow-600">{completedLessons.length}</div>
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
              <Zap className="h-6 w-6 text-yellow-600" />
              Lightning Scalping Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>1-minute chart scalping with lightning execution</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Triple confirmation signals reduce false entries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Ultra-tight risk management with 2-15 pip targets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>High-frequency trading during optimal sessions</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Win Rate</div>
                    <div className="text-sm text-green-700">60-70% typical success rate</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Daily Target</div>
                    <div className="text-sm text-blue-700">30-100 pips per session</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-semibold text-yellow-800">Time Commitment</div>
                    <div className="text-sm text-yellow-700">1-3 hours focused trading</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Lightning Scalping Curriculum</h2>
          
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            
            return (
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Zap className="h-6 w-6 text-yellow-600" />
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
                          <Zap className="h-4 w-4 text-yellow-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practical Steps */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Steps</h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <ol className="space-y-2">
                        {lesson.content.practicalSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <span className="text-yellow-800">{step}</span>
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
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-8"
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
          <Card className="mt-8 border-yellow-200 bg-gradient-to-r from-yellow-50 to-green-50">
            <CardContent className="text-center py-8">
              <Zap className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">
                Lightning Scalp Master Complete!
              </h3>
              <p className="text-yellow-800 mb-6">
                You've mastered all 12 lessons of lightning-fast scalping methodology. 
                You're now equipped to execute rapid-fire trades with precision and confidence.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="font-semibold">Lightning Speed</div>
                  <div className="text-sm text-gray-600">Sub-second execution mastered</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Tight Risk Control</div>
                  <div className="text-sm text-gray-600">Ultra-precise stop losses</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">High Frequency</div>
                  <div className="text-sm text-gray-600">30-100 pips daily targets</div>
                </div>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Return to Trading Academy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Related Strategies */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Complement Your Lightning Scalping Skills</CardTitle>
            <CardDescription>
              Enhance your scalping approach with these related strategies
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
                <p className="text-blue-700 text-sm">20-period moving average system</p>
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