import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, LineChart, Settings } from 'lucide-react';

export function AdvancedMarketAnalysisMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Multi-Timeframe Analysis Foundation",
      duration: "38 min",
      description: "Master multi-timeframe analysis for confluence-based trading decisions",
      content: {
        overview: "Develop expertise in analyzing multiple timeframes simultaneously to identify high-probability trading opportunities through confluence analysis and timing optimization.",
        keyPoints: [
          "Multi-timeframe structure and hierarchy understanding",
          "Confluence identification across different time horizons",
          "Top-down analysis methodology for trade planning",
          "Professional timeframe synchronization techniques"
        ],
        practicalSteps: [
          "Set up professional multi-timeframe workspace with synchronized charts",
          "Learn monthly/weekly/daily/4H/1H timeframe hierarchy",
          "Practice identifying confluence zones across timeframes",
          "Develop systematic top-down analysis routine"
        ],
        example: "Multi-timeframe setup: Weekly uptrend + Daily support + 4H bull flag + 1H breakout = High confluence long entry."
      }
    },
    {
      id: 2,
      title: "Volume Profile Trading Mastery", 
      duration: "35 min",
      description: "Master volume profile analysis for institutional-grade market structure trading",
      content: {
        overview: "Implement professional volume profile analysis to identify key support/resistance levels, value areas, and institutional trading zones for enhanced market timing.",
        keyPoints: [
          "Volume profile construction and interpretation methods",
          "Point of Control (POC) and Value Area analysis",
          "High Volume Nodes (HVN) and Low Volume Nodes (LVN) trading",
          "Professional volume profile integration with price action"
        ],
        practicalSteps: [
          "Set up volume profile indicators on TradingView or professional platform",
          "Learn to identify Point of Control and Value Area High/Low",
          "Practice trading bounces from High Volume Nodes",
          "Develop systematic volume profile scanning process"
        ],
        example: "Volume profile trade: Stock pulls back to POC at $48.50 with high volume support = Long entry target $52-54."
      }
    },
    {
      id: 3,
      title: "Advanced Chart Pattern Recognition",
      duration: "32 min",
      description: "Master institutional-grade chart pattern analysis and professional pattern trading",
      content: {
        overview: "Develop expertise in identifying and trading advanced chart patterns with institutional precision, including complex patterns and multi-pattern confluence setups.",
        keyPoints: [
          "Advanced pattern recognition: Head and Shoulders, Cup and Handle, Rectangles",
          "Complex patterns: Triple tops/bottoms, Diamond formations, Pennants",
          "Pattern failure recognition and counter-trend opportunities", 
          "Professional pattern measurement and target calculation"
        ],
        practicalSteps: [
          "Study advanced pattern library with historical examples",
          "Practice pattern identification on multiple timeframes",
          "Learn pattern measurement techniques for target calculation",
          "Develop systematic pattern validation checklist"
        ],
        example: "Cup and Handle pattern: 6-month cup formation with 3-week handle, breakout above $55 = Target $68 (+24%)."
      }
    },
    {
      id: 4,
      title: "Smart Money Concepts Integration",
      duration: "30 min",
      description: "Master Smart Money Concepts (SMC) for institutional flow analysis",
      content: {
        overview: "Implement Smart Money Concepts methodology to identify institutional order flow, market manipulation, and optimal entry/exit points based on smart money behavior.",
        keyPoints: [
          "Market structure breaks and change of character (CHoCH)",
          "Order blocks and institutional supply/demand zones",
          "Fair Value Gaps (FVG) and liquidity grab concepts",
          "Break of Structure (BOS) and shift in market bias"
        ],
        practicalSteps: [
          "Learn to identify market structure highs and lows",
          "Practice recognizing order blocks and institutional zones",
          "Study Fair Value Gap identification and trading strategies",
          "Develop systematic SMC analysis framework"
        ],
        example: "SMC setup: Market structure break at $50.20, order block at $49.80, FVG fill entry = Target previous high $52.50."
      }
    },
    {
      id: 5,
      title: "Advanced Technical Indicators",
      duration: "33 min",
      description: "Master professional technical indicators beyond basic moving averages",
      content: {
        overview: "Implement advanced technical indicators with institutional-grade interpretation, including oscillators, momentum indicators, and custom indicator combinations.",
        keyPoints: [
          "Advanced oscillators: Stochastic RSI, Williams %R, Ultimate Oscillator",
          "Momentum indicators: MACD variations, Rate of Change, TSI",
          "Volume indicators: OBV, Accumulation/Distribution, Chaikin MF",
          "Professional indicator confluence and signal filtering"
        ],
        practicalSteps: [
          "Set up advanced indicator workspace with optimized parameters",
          "Learn professional interpretation of indicator divergences",
          "Practice combining multiple indicators for signal confirmation",
          "Develop systematic indicator-based entry/exit protocols"
        ],
        example: "Indicator confluence: RSI bullish divergence + MACD positive crossover + OBV breakout = High probability long setup."
      }
    },
    {
      id: 6,
      title: "Market Structure Analysis",
      duration: "31 min",
      description: "Master professional market structure analysis for trend identification",
      content: {
        overview: "Develop expertise in market structure analysis to identify trend changes, support/resistance levels, and optimal trade timing through professional structure reading.",
        keyPoints: [
          "Higher highs/higher lows vs lower highs/lower lows analysis",
          "Support and resistance level identification and validation",
          "Trend line analysis and professional breakout confirmation",
          "Structure-based position sizing and risk management"
        ],
        practicalSteps: [
          "Practice identifying market structure on multiple timeframes",
          "Learn to draw professional trend lines and channels",
          "Develop systematic approach to structure break confirmation",
          "Implement structure-based stop loss and target placement"
        ],
        example: "Structure analysis: Series of higher lows intact, breakout above $51.20 resistance = Bullish structure continuation target $56."
      }
    },
    {
      id: 7,
      title: "Fibonacci Analysis Mastery",
      duration: "29 min",
      description: "Master professional Fibonacci analysis for precise entry and exit timing",
      content: {
        overview: "Implement advanced Fibonacci analysis techniques including retracements, extensions, and time-based Fibonacci for professional-grade trade timing and targeting.",
        keyPoints: [
          "Fibonacci retracement levels and professional application",
          "Fibonacci extensions for profit target calculation",
          "Fibonacci time zones and time-based analysis",
          "Advanced Fibonacci confluence and cluster analysis"
        ],
        practicalSteps: [
          "Master proper Fibonacci retracement drawing techniques",
          "Learn to identify high-probability Fibonacci confluence zones",
          "Practice Fibonacci extension target calculation",
          "Develop systematic Fibonacci-based trade planning"
        ],
        example: "Fibonacci setup: Pullback to 61.8% retracement at $48.75, confluence with 200 MA = Long entry target 161.8% extension $56.20."
      }
    },
    {
      id: 8,
      title: "Momentum Analysis Techniques",
      duration: "27 min",
      description: "Master momentum analysis for trend strength and continuation assessment",
      content: {
        overview: "Develop expertise in momentum analysis to assess trend strength, identify momentum shifts, and optimize entry timing based on momentum characteristics.",
        keyPoints: [
          "Momentum oscillator analysis and interpretation",
          "Rate of Change (ROC) and momentum divergence analysis",
          "Momentum breakouts and momentum continuation patterns",
          "Professional momentum-based position sizing"
        ],
        practicalSteps: [
          "Set up momentum indicators: ROC, momentum oscillator, TSI",
          "Learn to identify momentum divergences and convergences",
          "Practice momentum breakout identification and confirmation",
          "Develop momentum-based trade management protocols"
        ],
        example: "Momentum trade: Strong ROC above 5%, momentum oscillator above 80, price breakout = High momentum continuation setup."
      }
    },
    {
      id: 9,
      title: "Sector Rotation Analysis",
      duration: "34 min",
      description: "Master sector rotation analysis for optimal stock and ETF selection",
      content: {
        overview: "Implement professional sector rotation analysis to identify leading sectors and optimize portfolio allocation based on economic cycles and market leadership.",
        keyPoints: [
          "Sector rotation cycle understanding and identification",
          "Relative strength analysis across sectors and asset classes",
          "Economic cycle integration with sector performance",
          "Professional sector-based stock selection techniques"
        ],
        practicalSteps: [
          "Set up sector rotation monitoring with ETF comparison",
          "Learn to calculate and interpret relative strength ratios",
          "Study economic cycles and sector leadership patterns",
          "Develop systematic sector rotation trading strategies"
        ],
        example: "Sector rotation: Technology showing relative strength vs SPY, XLK/SPY ratio breaking above 0.28 = Focus on tech leaders."
      }
    },
    {
      id: 10,
      title: "Volatility Analysis Integration",
      duration: "26 min",
      description: "Master volatility analysis for risk assessment and trade optimization",
      content: {
        overview: "Develop expertise in volatility analysis using VIX, ATR, and volatility indicators to optimize position sizing, timing, and risk management based on market volatility.",
        keyPoints: [
          "VIX analysis and volatility regime identification",
          "Average True Range (ATR) for position sizing and stops",
          "Implied volatility vs historical volatility analysis",
          "Volatility-based trade selection and timing"
        ],
        practicalSteps: [
          "Monitor VIX levels and volatility percentiles for market context",
          "Use ATR for dynamic stop loss and position sizing calculation",
          "Learn implied volatility analysis for options-related decisions",
          "Develop volatility-adjusted trading protocols"
        ],
        example: "Volatility setup: VIX below 20, ATR at 2.5%, low volatility environment = Increase position size, tighter stops."
      }
    },
    {
      id: 11,
      title: "Correlation Analysis Methods",
      duration: "28 min",
      description: "Master correlation analysis for portfolio optimization and risk management",
      content: {
        overview: "Implement correlation analysis techniques to understand asset relationships, optimize portfolio diversification, and identify inter-market opportunities and risks.",
        keyPoints: [
          "Asset correlation calculation and interpretation methods",
          "Currency correlation impact on international trades",
          "Commodity correlation with related sectors and currencies",
          "Professional correlation-based risk management"
        ],
        practicalSteps: [
          "Calculate correlation coefficients between assets and sectors",
          "Monitor currency correlations for international exposure",
          "Study commodity-sector correlations (oil-energy, gold-miners)",
          "Implement correlation-based portfolio risk assessment"
        ],
        example: "Correlation trade: EUR/USD and GBP/USD correlation at 0.85, divergence setup = Trade the convergence back to correlation."
      }
    },
    {
      id: 12,
      title: "Economic Calendar Integration",
      duration: "25 min",
      description: "Master economic calendar analysis for fundamental-technical confluence",
      content: {
        overview: "Integrate economic calendar analysis with technical analysis to identify high-impact events, optimize trade timing, and manage fundamental risk exposure.",
        keyPoints: [
          "High-impact economic event identification and preparation",
          "Economic data interpretation and market impact assessment",
          "Fundamental-technical confluence analysis techniques",
          "Professional economic event risk management"
        ],
        practicalSteps: [
          "Set up economic calendar monitoring for high-impact events",
          "Learn to interpret key economic indicators and their market impact",
          "Practice pre-event positioning and post-event analysis",
          "Develop systematic economic event trading protocols"
        ],
        example: "Economic confluence: Technical breakout at $52 + NFP beat expectations + Fed dovish comments = Strong bullish setup."
      }
    },
    {
      id: 13,
      title: "Advanced Risk Assessment",
      duration: "30 min",
      description: "Master advanced risk assessment techniques for professional portfolio management",
      content: {
        overview: "Implement sophisticated risk assessment methodologies including Value at Risk (VaR), correlation risk, and scenario analysis for institutional-grade risk management.",
        keyPoints: [
          "Value at Risk (VaR) calculation and application methods",
          "Scenario analysis and stress testing techniques",
          "Portfolio heat and correlation risk assessment",
          "Professional drawdown analysis and recovery protocols"
        ],
        practicalSteps: [
          "Calculate portfolio VaR using historical and parametric methods",
          "Conduct scenario analysis for different market conditions",
          "Monitor portfolio correlation and concentration risk",
          "Develop systematic risk monitoring and adjustment protocols"
        ],
        example: "Risk assessment: Portfolio VaR 2.1%, correlation risk moderate, scenario analysis shows max 8% drawdown in bear market."
      }
    },
    {
      id: 14,
      title: "Advanced Performance Analytics",
      duration: "32 min",
      description: "Master comprehensive performance analysis for continuous strategy optimization",
      content: {
        overview: "Implement advanced performance analytics including Sharpe ratio, maximum drawdown analysis, and systematic performance optimization for continuous trading improvement.",
        keyPoints: [
          "Advanced performance metrics: Sharpe, Sortino, Calmar ratios",
          "Drawdown analysis and recovery time assessment",
          "Win rate optimization and profit factor improvement",
          "Systematic performance review and strategy refinement"
        ],
        practicalSteps: [
          "Calculate and track advanced performance metrics monthly",
          "Analyze drawdown periods and recovery characteristics",
          "Conduct systematic strategy performance reviews",
          "Implement continuous improvement protocols based on data"
        ],
        example: "Performance analysis: 1.8 Sharpe ratio, 12% max drawdown, 65% win rate = Strong strategy, optimize profit factor next."
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
            <span className="font-semibold text-blue-800">Strategy #21</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Market Analysis Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master advanced market analysis techniques with multi-timeframe analysis, volume profile trading, Smart Money Concepts, and institutional-grade technical analysis methodologies
          </p>
          
          {/* Progress Tracking */}
          <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Course Progress</span>
              <span className="text-sm text-gray-300">{completedLessons.length}/14 Lessons</span>
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
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Advanced Market Analysis Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Multi-timeframe analysis and confluence trading</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Volume profile and market structure analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Smart Money Concepts and institutional flow analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Advanced technical indicators and correlation analysis</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Analysis Accuracy</div>
                    <div className="text-sm text-blue-700">85%+ market direction prediction</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Win Rate Enhancement</div>
                    <div className="text-sm text-green-700">+15-20% improvement in trade accuracy</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Risk Optimization</div>
                    <div className="text-sm text-purple-700">50% reduction in false signals</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Advanced Market Analysis Curriculum</h2>
          
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
                          <BarChart3 className="h-6 w-6 text-blue-600" />
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
                          <BarChart3 className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
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
                        <BarChart3 className="h-4 w-4 mr-2" />
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
          <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                Advanced Market Analysis Master Complete!
              </h3>
              <p className="text-blue-800 mb-6">
                You've mastered all 14 lessons of advanced market analysis. 
                You're now equipped with multi-timeframe analysis, volume profile trading, Smart Money Concepts, and institutional-grade technical analysis techniques for superior market timing.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Multi-Timeframe Mastery</div>
                  <div className="text-sm text-gray-600">Confluence analysis expertise</div>
                </div>
                <div className="text-center">
                  <LineChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Volume Profile Trading</div>
                  <div className="text-sm text-gray-600">Institutional zone identification</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Smart Money Concepts</div>
                  <div className="text-sm text-gray-600">Professional market structure</div>
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
            <CardTitle>Complement Your Advanced Analysis Skills</CardTitle>
            <CardDescription>
              Enhance your market analysis approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Profit Taking Master</h4>
                <p className="text-purple-700 text-sm">Strategic exit optimization</p>
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
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Systematic Entry Exit</h4>
                <p className="text-blue-700 text-sm">Rule-based trading systems</p>
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