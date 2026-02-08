import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, TrendingUp, Target, AlertTriangle, DollarSign, Clock, BarChart3, Brain, Shield } from 'lucide-react';

export function SystematicTradingMastery() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Systematic Trading Foundation",
      duration: "20 min",
      description: "Understanding the core principles of systematic trading and algorithmic decision-making",
      content: {
        overview: "Systematic trading eliminates human emotion and bias by using codified strategies and predefined rules for all trading decisions.",
        keyPoints: [
          "Remove emotional decision-making from trading process",
          "Use quantitative analysis and historical data for strategy development",
          "Implement predefined rules for entry, exit, and position sizing",
          "Focus on consistency over individual trade outcomes"
        ],
        practicalSteps: [
          "Define your systematic approach philosophy and objectives",
          "Establish clear rules for direction (buy/sell), price range, and quantity",
          "Create written documentation of all trading rules",
          "Set up systematic review process for rule adherence"
        ],
        example: "Rule example: Buy when 20-day MA crosses above 50-day MA with RSI <70 and volume >150% average. Position size = 2% account risk divided by stop distance."
      }
    },
    {
      id: 2,
      title: "Quantitative Analysis Framework",
      duration: "25 min", 
      description: "Master mathematical and statistical techniques for market analysis",
      content: {
        overview: "Quantitative analysis forms the analytical backbone of systematic trading using mathematical models to uncover market patterns.",
        keyPoints: [
          "Analyze historical price data, volume, and volatility patterns",
          "Use statistical models to identify recurring market behaviors", 
          "Develop predictive models based on quantitative research",
          "Optimize parameters through systematic backtesting"
        ],
        practicalSteps: [
          "Collect and clean historical market data for analysis",
          "Apply statistical methods to identify significant patterns",
          "Build mathematical models to predict future price movements",
          "Validate models using out-of-sample testing"
        ],
        example: "Analysis shows stocks with 12-month momentum >20% and RSI 40-60 have 68% win rate with 1.4:1 reward/risk ratio over 5-year period."
      }
    },
    {
      id: 3,
      title: "Systematic Stock Selection Process",
      duration: "30 min",
      description: "Learn systematic approaches to filtering and selecting stocks",
      content: {
        overview: "Stock selection involves systematic screening of entire market universe using quantitative criteria and multi-factor analysis.",
        keyPoints: [
          "Define trading universe and screening criteria",
          "Use fundamental and technical filters simultaneously",
          "Rank stocks using multi-factor scoring systems",
          "Implement systematic rebalancing procedures"
        ],
        practicalSteps: [
          "Define market universe (large cap, mid cap, sectors, etc.)",
          "Create quantitative screening criteria (P/E, ROE, momentum, etc.)",
          "Build scoring system combining multiple factors",
          "Establish systematic portfolio construction rules"
        ],
        example: "Universe: S&P 500. Screen: P/E <20, ROE >15%, 6M momentum >10%, daily volume >1M shares. Rank by combined z-score."
      }
    },
    {
      id: 4,
      title: "Strategy Development Process",
      duration: "35 min",
      description: "Step-by-step approach to developing robust systematic strategies",
      content: {
        overview: "Systematic strategy development follows rigorous process from hypothesis to implementation with proper validation at each step.",
        keyPoints: [
          "Start with market hypothesis based on logical reasoning",
          "Use fundamental analysis to identify worthwhile opportunities",
          "Specify strategy rules with precise mathematical definitions",
          "Validate through comprehensive backtesting with transaction costs"
        ],
        practicalSteps: [
          "Form testable hypothesis about market behavior",
          "Define entry/exit rules with specific trigger conditions",
          "Code strategy logic with precise mathematical formulas",
          "Backtest strategy including realistic costs and slippage"
        ],
        example: "Hypothesis: Mean reversion in high-quality stocks after 10%+ declines. Rules: Buy when stock down >10% in 5 days, P/E <15, exit at +15% or -7%."
      }
    },
    {
      id: 5,
      title: "Risk Management Systems",
      duration: "28 min",
      description: "Implement systematic risk controls and position sizing",
      content: {
        overview: "Systematic risk management uses objective rules to control portfolio risk, limit losses, and optimize position sizing.",
        keyPoints: [
          "Define maximum portfolio risk and individual position limits",
          "Use systematic position sizing based on volatility",
          "Implement automatic stop-loss and profit-taking rules",
          "Create portfolio-level risk monitoring systems"
        ],
        practicalSteps: [
          "Set maximum account risk per trade (typically 1-2%)",
          "Calculate position size using volatility-adjusted methods",
          "Define stop-loss rules based on technical or statistical levels",
          "Implement portfolio heat monitoring for total exposure"
        ],
        example: "Position size = (Account × 2% risk) ÷ (Entry price - Stop loss). Maximum 5% in single stock, 20% in single sector."
      }
    },
    {
      id: 6,
      title: "Backtesting and Validation", 
      duration: "32 min",
      description: "Test strategies rigorously using historical data",
      content: {
        overview: "Backtesting validates strategy performance using historical data while avoiding common pitfalls like overfitting and survivorship bias.",
        keyPoints: [
          "Use sufficient historical data for statistical significance",
          "Include realistic transaction costs and market impact",
          "Test across different market conditions and time periods",
          "Validate using walk-forward and out-of-sample testing"
        ],
        practicalSteps: [
          "Gather clean, survivorship-bias-free historical data",
          "Implement strategy logic with realistic execution assumptions",
          "Run backtests across multiple time periods and market cycles",
          "Perform sensitivity analysis on key parameters"
        ],
        example: "Backtest 2010-2023: 15.2% annual return, 18.4% volatility, 0.83 Sharpe ratio, -12.3% max drawdown. Consistent across bull/bear markets."
      }
    },
    {
      id: 7,
      title: "Algorithm Implementation",
      duration: "30 min",
      description: "Convert systematic strategies into executable algorithms",
      content: {
        overview: "Algorithm implementation translates systematic rules into automated trading systems with proper execution logic.",
        keyPoints: [
          "Code strategy logic with clear conditional statements",
          "Implement proper order management and execution",
          "Build in error handling and system monitoring",
          "Create systematic performance tracking and reporting"
        ],
        practicalSteps: [
          "Write clean, commented code for all strategy rules",
          "Implement order types and execution algorithms",
          "Build comprehensive logging and monitoring systems",
          "Create automated reporting for performance tracking"
        ],
        example: "Algorithm: IF (RSI <30 AND price >200MA AND volume >1.5x avg) THEN buy_signal = TRUE, position_size = calculate_risk_size()"
      }
    },
    {
      id: 8,
      title: "Portfolio Construction Methods",
      duration: "26 min",
      description: "Build diversified portfolios using systematic approaches",
      content: {
        overview: "Systematic portfolio construction optimizes diversification and risk-adjusted returns using mathematical optimization techniques.",
        keyPoints: [
          "Use correlation analysis to optimize diversification",
          "Implement systematic rebalancing procedures",
          "Apply modern portfolio theory principles",
          "Balance concentration vs diversification systematically"
        ],
        practicalSteps: [
          "Analyze correlations between selected securities",
          "Apply portfolio optimization techniques (mean variance, etc.)",
          "Set systematic rebalancing triggers and procedures",
          "Monitor portfolio metrics and systematic adjustments"
        ],
        example: "Portfolio: 20 stocks maximum, correlation <0.6 between holdings, equal volatility weighting, rebalance monthly or 20% drift."
      }
    },
    {
      id: 9,
      title: "Performance Optimization",
      duration: "28 min",
      description: "Optimize strategy parameters and improve performance",
      content: {
        overview: "Performance optimization improves strategy results through systematic parameter tuning while avoiding overfitting.",
        keyPoints: [
          "Use robust optimization techniques to avoid curve fitting",
          "Focus on out-of-sample performance improvement",
          "Optimize for risk-adjusted returns, not just total returns",
          "Implement systematic parameter review and adjustment"
        ],
        practicalSteps: [
          "Identify key parameters for optimization testing",
          "Use walk-forward optimization to avoid overfitting",
          "Test parameter stability across different market periods",
          "Implement systematic parameter review schedule"
        ],
        example: "Optimize moving average periods: Test 10-50 day combinations using 5-year walk-forward. Optimal: 20/45 with 0.92 Sharpe ratio."
      }
    },
    {
      id: 10,
      title: "Market Regime Detection",
      duration: "24 min",
      description: "Identify different market conditions and adapt strategies",
      content: {
        overview: "Market regime detection helps systematic strategies adapt to changing market conditions for improved performance.",
        keyPoints: [
          "Identify bull, bear, and sideways market regimes",
          "Use systematic indicators to detect regime changes",
          "Adapt strategy parameters based on market conditions",
          "Implement regime-specific risk management rules"
        ],
        practicalSteps: [
          "Define quantitative criteria for market regimes",
          "Build systematic regime detection algorithms",
          "Create regime-specific trading rules and parameters",
          "Test strategy performance across different regimes"
        ],
        example: "Bull regime: VIX <20, S&P above 200MA. Bear regime: VIX >30, S&P below 200MA. Adjust position sizes accordingly."
      }
    },
    {
      id: 11,
      title: "Technology Infrastructure",
      duration: "35 min",
      description: "Set up robust technology systems for systematic trading",
      content: {
        overview: "Technology infrastructure provides the foundation for reliable systematic trading execution with proper data feeds and systems.",
        keyPoints: [
          "Select trading platforms with algorithmic capabilities",
          "Ensure reliable real-time data feeds and backup systems",
          "Implement robust trade execution and order management",
          "Build comprehensive monitoring and alerting systems"
        ],
        practicalSteps: [
          "Choose trading platform supporting systematic strategies",
          "Set up multiple data feed sources for redundancy",
          "Configure automated execution with proper safeguards",
          "Implement system monitoring and alert mechanisms"
        ],
        example: "Platform: Interactive Brokers API, Data: Bloomberg + backup Reuters, Execution: TWS with risk limits, Monitoring: 24/7 alerts."
      }
    },
    {
      id: 12,
      title: "Live Trading Implementation",
      duration: "40 min",
      description: "Execute systematic strategies in live market conditions",
      content: {
        overview: "Live trading implementation requires careful transition from backtesting to real execution with proper safeguards and monitoring.",
        keyPoints: [
          "Start with paper trading to validate system operation",
          "Begin with small position sizes and gradually scale up",
          "Monitor systematic performance vs backtested expectations",
          "Maintain systematic discipline and avoid manual overrides"
        ],
        practicalSteps: [
          "Run parallel paper and live trading for validation",
          "Start with 25% of target position sizes for first month",
          "Create systematic performance monitoring dashboards",
          "Establish clear procedures for system maintenance"
        ],
        example: "Week 1-4: Paper trading validation. Week 5-8: 25% live size. Week 9-12: 50% size. Month 4+: Full systematic implementation."
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
            <Brain className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Strategy #14</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Systematic Trading Mastery
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master algorithmic trading systems with systematic rules, quantitative analysis, and automated execution for consistent market performance
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
              <Target className="h-6 w-6 text-purple-600" />
              Systematic Trading Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Eliminate emotional trading through systematic rules</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Quantitative analysis and mathematical modeling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Automated execution with robust risk controls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Continuous optimization and performance monitoring</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Key Advantages</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Consistency</div>
                    <div className="text-sm text-blue-700">Remove human emotion and bias</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Speed</div>
                    <div className="text-sm text-green-700">Rapid execution of opportunities</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Scalability</div>
                    <div className="text-sm text-purple-700">Handle hundreds of positions</div>
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
              <Card key={lesson.id} className={`border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${isCompleted ? 'bg-green-100' : 'bg-purple-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-purple-600" />
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
                          <Brain className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
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
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Practical Example</h4>
                    <p className="text-yellow-800">{lesson.content.example}</p>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center pt-4">
                    {!isCompleted ? (
                      <Button 
                        onClick={() => handleLessonComplete(lesson.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
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
          <Card className="mt-8 border-green-200 bg-gradient-to-r from-green-50 to-purple-50">
            <CardContent className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Systematic Trading Mastery Complete!
              </h3>
              <p className="text-green-800 mb-6">
                You've mastered all 12 lessons of systematic trading methodology. 
                You're now equipped to build and deploy algorithmic trading systems with confidence.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Algorithm Design</div>
                  <div className="text-sm text-gray-600">Systematic rule creation</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Automated controls mastered</div>
                </div>
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Live Implementation</div>
                  <div className="text-sm text-gray-600">Ready for market deployment</div>
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
            <CardTitle>Complement Your Systematic Trading Skills</CardTitle>
            <CardDescription>
              Enhance your systematic approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Momentum Trading</h4>
                <p className="text-blue-700 text-sm">Systematic momentum strategies</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/13')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Market Mastery Group</h4>
                <p className="text-green-700 text-sm">Professional systematic approach</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/6')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Oliver Velez Techniques</h4>
                <p className="text-purple-700 text-sm">Systematic moving average strategy</p>
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