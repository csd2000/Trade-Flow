import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, BarChart3, TrendingUp, Shield, Moon } from 'lucide-react';

export function OvernightOptionsMaster() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Overnight Options Foundation",
      duration: "32 min",
      description: "Master the core principles of overnight options trading and income generation strategies",
      content: {
        overview: "Build a comprehensive understanding of overnight options trading, including the unique characteristics of overnight positions, time decay acceleration, and professional risk management techniques.",
        keyPoints: [
          "Understanding overnight options mechanics and time decay",
          "Zero overnight risk strategies using 0DTE options",
          "Professional entry and exit timing for maximum profit",
          "Risk management fundamentals for overnight positions"
        ],
        practicalSteps: [
          "Learn SPX options basics: settlement, liquidity, and trading hours",
          "Study time decay acceleration on expiration day options",
          "Practice identifying high-probability overnight setups",
          "Set up overnight position monitoring and alert systems"
        ],
        example: "Overnight setup: SPX 4200 call sold at 3:45 PM for $2.50, expires worthless next day = $250 profit per contract."
      }
    },
    {
      id: 2,
      title: "Zero Overnight Risk Strategies",
      duration: "35 min", 
      description: "Develop zero overnight risk techniques using same-day expiration options",
      content: {
        overview: "Master professional zero overnight risk strategies that generate daily income through same-day expiration options with rapid time decay and controlled risk exposure.",
        keyPoints: [
          "0DTE (Zero Days to Expiration) options strategy fundamentals",
          "Same-day SPX options for zero overnight exposure",
          "Time decay acceleration exploitation on expiration day",
          "Daily income generation with controlled risk parameters"
        ],
        practicalSteps: [
          "Identify 0DTE SPX options with optimal time decay characteristics",
          "Set up same-day entry and exit protocols",
          "Monitor implied volatility for optimal selling opportunities",
          "Implement position sizing based on account risk tolerance"
        ],
        example: "0DTE strategy: Sell SPX 4180 put at 10 AM for $3.00, buy back at 2 PM for $0.50 = $250 profit, zero overnight risk."
      }
    },
    {
      id: 3,
      title: "Divergent Bar Analysis",
      duration: "28 min",
      description: "Master divergent bar pattern recognition for overnight directional prediction",
      content: {
        overview: "Implement professional divergent bar analysis techniques to predict overnight market direction and optimize options positioning for maximum profitability.",
        keyPoints: [
          "Divergent bar pattern identification and interpretation",
          "Support and resistance confluence analysis",
          "Overnight directional prediction methodology",
          "Pattern validation using multiple timeframe analysis"
        ],
        practicalSteps: [
          "Learn to identify bullish and bearish divergent bars",
          "Combine divergent bars with support/resistance levels",
          "Use 15-minute and hourly charts for pattern confirmation",
          "Set up alerts for divergent bar formations in final trading hour"
        ],
        example: "Pattern setup: Bullish divergent bar at 3:50 PM off major support = High probability overnight bullish move for call options."
      }
    },
    {
      id: 4,
      title: "SPX Options Mastery",
      duration: "30 min",
      description: "Master SPX index options trading for optimal liquidity and cash settlement",
      content: {
        overview: "Develop expertise in SPX options trading, including cash settlement advantages, liquidity benefits, and professional execution techniques for consistent income generation.",
        keyPoints: [
          "SPX options advantages: cash settlement and European style",
          "Optimal strike selection and spread construction",
          "Liquidity analysis and bid-ask spread optimization",
          "Tax advantages of SPX options for active traders"
        ],
        practicalSteps: [
          "Study SPX options chain and identify high-volume strikes",
          "Practice vertical spread construction for defined risk",
          "Learn cash settlement process and timing",
          "Set up SPX-specific watchlists and scanning criteria"
        ],
        example: "SPX spread: Sell 4200 call/buy 4210 call for $3.50 credit, maximum profit $350, maximum risk $650 per spread."
      }
    },
    {
      id: 5,
      title: "Time Decay Acceleration", 
      duration: "27 min",
      description: "Master time decay acceleration on expiration day for enhanced profitability",
      content: {
        overview: "Exploit rapid time decay acceleration on options expiration day to generate consistent income through professional theta harvesting strategies.",
        keyPoints: [
          "Theta acceleration mechanics on expiration day",
          "Optimal timing for theta harvesting strategies",
          "Gamma risk management near expiration",
          "Professional theta farming techniques"
        ],
        practicalSteps: [
          "Calculate theta values for different time periods",
          "Monitor gamma exposure as options approach expiration",
          "Time entries to maximize theta decay benefit",
          "Implement automated theta harvesting protocols"
        ],
        example: "Theta strategy: Option with $0.25 theta at 10 AM accelerates to $0.75 theta at 3 PM = 3x faster decay rate."
      }
    },
    {
      id: 6,
      title: "Institutional Flow Analysis",
      duration: "33 min",
      description: "Master institutional order flow analysis for high-probability trade identification",
      content: {
        overview: "Implement professional institutional flow analysis to identify large options orders and follow smart money for enhanced trade probability and timing.",
        keyPoints: [
          "Unusual options activity identification and interpretation",
          "Large block order analysis and smart money tracking",
          "Institutional sentiment indicators and signals",
          "Professional flow analysis tools and techniques"
        ],
        practicalSteps: [
          "Set up unusual options activity scanners",
          "Learn to interpret large block orders and their implications",
          "Monitor institutional sentiment through options flow",
          "Develop systematic approach to following smart money"
        ],
        example: "Flow analysis: 5,000 SPX 4200 calls bought in single block = Institutional bullish bias for overnight positioning."
      }
    },
    {
      id: 7,
      title: "Risk Management Systems",
      duration: "29 min",
      description: "Implement comprehensive risk management for overnight options strategies",
      content: {
        overview: "Develop sophisticated risk management systems specifically designed for overnight options trading, including position sizing, portfolio exposure limits, and emergency protocols.",
        keyPoints: [
          "Position sizing algorithms for overnight options",
          "Portfolio exposure limits and correlation management",
          "Emergency stop-loss and profit-taking protocols",
          "Volatility-based risk adjustment techniques"
        ],
        practicalSteps: [
          "Calculate optimal position size based on account risk",
          "Set maximum portfolio exposure limits for overnight positions",
          "Implement automated stop-loss orders for gap protection",
          "Create volatility-adjusted position sizing formulas"
        ],
        example: "Risk system: 2% account risk per trade, maximum 10% total overnight exposure, automated stops at 50% loss."
      }
    },
    {
      id: 8,
      title: "Vertical Spread Strategies", 
      duration: "31 min",
      description: "Master vertical spread construction for defined risk overnight trading",
      content: {
        overview: "Implement professional vertical spread strategies that provide defined risk parameters while maintaining profit potential for overnight options income generation.",
        keyPoints: [
          "Bull and bear spread construction for overnight trades",
          "Spread selection based on risk-reward ratios",
          "Optimal strike spacing and expiration timing",
          "Professional spread management and adjustment techniques"
        ],
        practicalSteps: [
          "Learn to construct credit and debit spreads",
          "Calculate maximum profit and loss for each spread type",
          "Practice spread entry and exit timing",
          "Develop systematic spread selection criteria"
        ],
        example: "Credit spread: Sell SPX 4200 call/Buy 4210 call for $3.50 = $350 max profit, $650 max risk per spread."
      }
    },
    {
      id: 9,
      title: "Market Structure Integration",
      duration: "26 min",
      description: "Integrate market structure analysis with overnight options positioning",
      content: {
        overview: "Combine professional market structure analysis with overnight options strategies to enhance timing and directional accuracy for consistent profitability.",
        keyPoints: [
          "Support and resistance integration with options positioning",
          "Market structure breaks and overnight implications",
          "Volume profile analysis for optimal strike selection",
          "Professional market context interpretation"
        ],
        practicalSteps: [
          "Identify key support and resistance levels for SPX",
          "Integrate market structure with options strike selection",
          "Use volume profile to identify high-probability zones",
          "Develop systematic market structure checklist"
        ],
        example: "Structure setup: SPX at 4200 resistance, volume profile gap below = High probability bear spread opportunity."
      }
    },
    {
      id: 10,
      title: "Performance Optimization",
      duration: "24 min",
      description: "Master performance tracking and strategy optimization for overnight options",
      content: {
        overview: "Implement comprehensive performance tracking and optimization systems to continuously improve overnight options trading results and maximize income generation.",
        keyPoints: [
          "Trade performance metrics and analysis techniques",
          "Strategy optimization based on historical results",
          "Market condition adaptation and strategy adjustment",
          "Professional record keeping and tax optimization"
        ],
        practicalSteps: [
          "Track key metrics: win rate, average profit/loss, risk-reward ratios",
          "Analyze performance by market conditions and volatility",
          "Optimize strategy parameters based on historical data",
          "Implement systematic performance review protocols"
        ],
        example: "Performance data: 75% win rate, 2.1:1 reward-risk ratio, $1,250 average monthly income from overnight options."
      }
    },
    {
      id: 11,
      title: "Advanced Income Techniques",
      duration: "34 min",
      description: "Implement advanced overnight options techniques for enhanced income generation",
      content: {
        overview: "Deploy sophisticated overnight options techniques including multi-leg strategies, volatility trading, and systematic income generation methods for professional-level results.",
        keyPoints: [
          "Multi-leg options strategies for enhanced income",
          "Volatility trading and IV rank exploitation",
          "Systematic income generation protocols",
          "Advanced hedging and portfolio protection techniques"
        ],
        practicalSteps: [
          "Learn iron condor and iron butterfly strategies",
          "Master implied volatility analysis and exploitation",
          "Develop systematic income generation schedules",
          "Implement portfolio hedging with overnight options"
        ],
        example: "Advanced strategy: Iron condor on SPX generates $500 weekly income with 85% probability of profit."
      }
    },
    {
      id: 12,
      title: "Professional Execution Mastery",
      duration: "28 min",
      description: "Master professional execution techniques and scaling for consistent overnight income",
      content: {
        overview: "Develop mastery-level execution skills and scaling techniques that enable consistent overnight options income generation with institutional-grade precision and risk management.",
        keyPoints: [
          "Professional order execution and timing techniques",
          "Scaling strategies for growing overnight income",
          "Automation integration and systematic execution",
          "Continuous improvement and strategy evolution"
        ],
        practicalSteps: [
          "Master limit order placement and execution timing",
          "Develop systematic scaling protocols for increased size",
          "Integrate automation tools for consistent execution",
          "Create continuous improvement feedback loops"
        ],
        example: "Mastery execution: Automated overnight system generates $2,500 monthly income with 78% win rate and full risk control."
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
            <Moon className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Strategy #19</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Overnight Options Master
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master professional overnight options trading with zero overnight risk strategies, time decay acceleration, and institutional-grade income generation techniques
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
              <Moon className="h-6 w-6 text-blue-600" />
              Professional Overnight Options Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Zero overnight risk strategies using 0DTE options</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Time decay acceleration exploitation on expiration day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Professional SPX options trading with cash settlement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <span>Institutional flow analysis for high-probability setups</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Daily Income</div>
                    <div className="text-sm text-blue-700">$200-500 per day with 0DTE strategies</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Win Rate</div>
                    <div className="text-sm text-green-700">75%+ with professional execution</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Risk Control</div>
                    <div className="text-sm text-purple-700">Maximum 2% account risk per trade</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Overnight Options Curriculum</h2>
          
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
                          <Moon className="h-6 w-6 text-blue-600" />
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
                          <Moon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
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
                        <Moon className="h-4 w-4 mr-2" />
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
              <Moon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-900 mb-2">
                Overnight Options Master Complete!
              </h3>
              <p className="text-blue-800 mb-6">
                You've mastered all 12 lessons of professional overnight options trading. 
                You're now equipped with zero overnight risk strategies, time decay acceleration techniques, and institutional-grade income generation methods.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <Moon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Zero Risk Strategies</div>
                  <div className="text-sm text-gray-600">0DTE professional techniques</div>
                </div>
                <div className="text-center">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Time Decay Mastery</div>
                  <div className="text-sm text-gray-600">Theta acceleration exploitation</div>
                </div>
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Daily Income</div>
                  <div className="text-sm text-gray-600">Consistent overnight profits</div>
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
            <CardTitle>Complement Your Overnight Options Skills</CardTitle>
            <CardDescription>
              Enhance your options approach with these related strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Profit Taking Master</h4>
                <p className="text-purple-700 text-sm">Strategic exit techniques</p>
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
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Algorithmic Trading</h4>
                <p className="text-green-700 text-sm">Systematic automation</p>
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
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Market Mastery</h4>
                <p className="text-blue-700 text-sm">Professional market analysis</p>
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