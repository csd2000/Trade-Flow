import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, CheckCircle, Target, AlertTriangle, DollarSign, Clock, Settings, TrendingUp, Shield, Users, Award } from 'lucide-react';

export function AdvancedPatternRecognitionSystem() {
  const [, setLocation] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "Pattern Recognition Foundations",
      duration: "32 min",
      description: "Master the fundamental principles of advanced pattern recognition and systematic identification",
      content: {
        overview: "Build comprehensive understanding of pattern recognition principles, systematic identification techniques, and professional pattern trading methodologies for consistent market advantage.",
        keyPoints: [
          "Pattern recognition fundamentals and systematic identification",
          "Professional pattern classification and filtering techniques",
          "Market context analysis and pattern reliability assessment",
          "Advanced pattern psychology and market structure understanding"
        ],
        practicalSteps: [
          "Study major pattern categories: continuation, reversal, consolidation patterns",
          "Learn systematic pattern identification using technical scanning",
          "Develop pattern reliability scoring and filtering systems",
          "Implement market context analysis for pattern validation"
        ],
        example: "Pattern identification: Bull flag pattern + Volume confirmation + Strong trend = High probability continuation setup."
      }
    },
    {
      id: 2,
      title: "Automated Scanning Systems", 
      duration: "35 min",
      description: "Master automated pattern scanning and systematic opportunity identification",
      content: {
        overview: "Implement automated scanning systems that identify high-probability patterns across multiple markets and timeframes, reducing manual analysis while increasing accuracy.",
        keyPoints: [
          "Automated scanning system architecture and implementation",
          "Multi-market and multi-timeframe pattern detection",
          "Professional filtering and priority ranking systems",
          "Real-time alerts and systematic monitoring protocols"
        ],
        practicalSteps: [
          "Set up automated pattern scanning across 500+ stocks daily",
          "Configure multi-timeframe analysis: daily, 4H, 1H pattern confluence",
          "Implement pattern scoring and ranking algorithms",
          "Create real-time alert systems for high-probability setups"
        ],
        example: "Scanning system: 500 stocks scanned → 50 patterns identified → 10 high-score patterns → 3 executed trades daily."
      }
    },
    {
      id: 3,
      title: "Risk-Adjusted Pattern Trading",
      duration: "30 min",
      description: "Master risk-adjusted pattern trading and systematic position management",
      content: {
        overview: "Implement risk-adjusted pattern trading strategies that optimize risk-reward ratios while maintaining high win rates through systematic position sizing and management.",
        keyPoints: [
          "Risk-adjusted position sizing and pattern-specific risk management",
          "Pattern-based stop loss and profit target optimization",
          "Systematic trade management and scaling techniques",
          "Professional performance tracking and optimization"
        ],
        practicalSteps: [
          "Calculate pattern-specific risk-reward ratios and position sizes",
          "Set systematic stop losses based on pattern invalidation levels",
          "Implement profit target scaling: 50% at 1:1, remainder at 2:1",
          "Track pattern performance and optimize entry/exit rules"
        ],
        example: "Risk management: Bull flag trade with 2% risk, 1:2 R/R, stop below flag low, target at flagpole projection."
      }
    },
    {
      id: 4,
      title: "High-Probability Setup Identification",
      duration: "38 min",
      description: "Master high-probability setup identification and confluence analysis",
      content: {
        overview: "Develop expertise in identifying highest-probability pattern setups through confluence analysis, market timing, and systematic validation protocols.",
        keyPoints: [
          "High-probability setup criteria and systematic validation",
          "Multi-factor confluence analysis and confirmation systems",
          "Market timing and session-based pattern optimization",
          "Professional setup grading and execution prioritization"
        ],
        practicalSteps: [
          "Develop 5-factor confluence system: pattern + volume + trend + support/resistance + momentum",
          "Grade setups A, B, C based on confluence factors",
          "Time entries based on market sessions and volatility",
          "Execute only A-grade setups with systematic discipline"
        ],
        example: "A-grade setup: Triangle breakout + Volume spike + Trend alignment + Key level break + RSI confirmation."
      }
    },
    {
      id: 5,
      title: "Pattern-Based Entry Systems",
      duration: "33 min",
      description: "Master systematic pattern-based entry strategies and execution timing",
      content: {
        overview: "Implement systematic pattern-based entry strategies that optimize timing and execution for maximum profitability and minimum slippage.",
        keyPoints: [
          "Pattern-specific entry strategies and timing optimization",
          "Breakout confirmation and false breakout avoidance",
          "Systematic entry execution and order management",
          "Professional timing and market session optimization"
        ],
        practicalSteps: [
          "Develop pattern-specific entry rules: breakout vs pullback entries",
          "Implement breakout confirmation: volume, momentum, follow-through",
          "Use limit orders for pullback entries, market orders for breakouts",
          "Optimize entry timing based on market sessions and volatility"
        ],
        example: "Entry system: Triangle breakout → Wait for volume confirmation → Enter on pullback to breakout level → Stop below pattern."
      }
    },
    {
      id: 6,
      title: "Advanced Pattern Psychology",
      duration: "29 min",
      description: "Master pattern psychology and market participant behavior analysis",
      content: {
        overview: "Understand the psychological foundations behind pattern formation and market participant behavior to improve pattern recognition and trading timing.",
        keyPoints: [
          "Pattern psychology and market participant behavior analysis",
          "Institutional vs retail pattern trading dynamics",
          "Pattern failure analysis and psychological reversals",
          "Professional sentiment analysis and contrarian indicators"
        ],
        practicalSteps: [
          "Study why patterns form: accumulation, distribution, continuation phases",
          "Analyze institutional vs retail participation in different patterns",
          "Identify pattern failure signatures and reversal psychology",
          "Use sentiment indicators to confirm or contradict pattern signals"
        ],
        example: "Pattern psychology: Head and shoulders = Distribution pattern where institutions sell to retail buyers at resistance."
      }
    },
    {
      id: 7,
      title: "Multi-Timeframe Pattern Analysis",
      duration: "36 min",
      description: "Master multi-timeframe pattern analysis and systematic confluence trading",
      content: {
        overview: "Implement multi-timeframe pattern analysis that identifies pattern confluence across different time horizons for superior trade timing and success rates.",
        keyPoints: [
          "Multi-timeframe pattern analysis and confluence identification",
          "Systematic timeframe alignment and pattern hierarchy",
          "Professional timing optimization using timeframe confluence",
          "Advanced pattern confirmation across multiple timeframes"
        ],
        practicalSteps: [
          "Analyze patterns across daily, 4H, 1H, and 15M timeframes",
          "Identify timeframe confluence: higher timeframe trend + lower timeframe entry",
          "Use higher timeframe patterns for direction, lower for timing",
          "Confirm pattern validity across all relevant timeframes"
        ],
        example: "Multi-timeframe: Daily uptrend + 4H flag pattern + 1H breakout + 15M pullback entry = Optimal confluence."
      }
    },
    {
      id: 8,
      title: "Pattern Failure Management",
      duration: "31 min",
      description: "Master pattern failure recognition and systematic damage control",
      content: {
        overview: "Develop expertise in recognizing pattern failures early and implementing damage control strategies that minimize losses and preserve capital.",
        keyPoints: [
          "Pattern failure recognition and early warning systems",
          "Systematic damage control and loss minimization",
          "Professional failure analysis and learning protocols",
          "Advanced reversal pattern identification after failures"
        ],
        practicalSteps: [
          "Identify pattern failure signals: volume divergence, momentum loss, key level breaks",
          "Implement early exit rules before full stop loss activation",
          "Analyze failure patterns for systematic improvement",
          "Look for reversal patterns after major pattern failures"
        ],
        example: "Failure management: Breakout fails + Volume dies + Price returns to pattern = Exit immediately, don't wait for stop."
      }
    },
    {
      id: 9,
      title: "Volume Analysis and Confirmation",
      duration: "34 min",
      description: "Master volume analysis and pattern confirmation techniques",
      content: {
        overview: "Implement comprehensive volume analysis techniques that confirm pattern validity and improve trade timing through professional volume interpretation.",
        keyPoints: [
          "Advanced volume analysis and pattern confirmation",
          "Volume profile analysis and institutional participation",
          "Professional volume indicators and confirmation systems",
          "Systematic volume-based entry and exit optimization"
        ],
        practicalSteps: [
          "Analyze volume during pattern formation: declining in consolidation, expanding on breakout",
          "Use volume profile to identify key support/resistance levels",
          "Implement volume-based confirmation for all pattern trades",
          "Monitor institutional volume patterns and participation"
        ],
        example: "Volume confirmation: Triangle pattern with declining volume + Breakout with 3x average volume = Strong confirmation."
      }
    },
    {
      id: 10,
      title: "Pattern-Based Portfolio Management",
      duration: "37 min",
      description: "Master pattern-based portfolio management and systematic allocation",
      content: {
        overview: "Implement pattern-based portfolio management strategies that optimize allocation across multiple pattern types and timeframes for consistent performance.",
        keyPoints: [
          "Pattern-based portfolio construction and allocation",
          "Systematic diversification across pattern types and timeframes",
          "Professional correlation management and risk optimization",
          "Advanced portfolio scaling and position management"
        ],
        practicalSteps: [
          "Allocate capital across different pattern types: 40% breakouts, 30% pullbacks, 30% reversals",
          "Diversify across timeframes: 50% swing patterns, 30% day patterns, 20% position patterns",
          "Monitor correlation between pattern trades and adjust accordingly",
          "Scale position sizes based on pattern confidence and account growth"
        ],
        example: "Portfolio allocation: 10 positions maximum, 2% risk each, diversified across pattern types and sectors."
      }
    },
    {
      id: 11,
      title: "Technology Integration and Automation",
      duration: "40 min",
      description: "Master technology integration and pattern trading automation",
      content: {
        overview: "Implement advanced technology integration and automation systems that enhance pattern recognition, execution speed, and overall trading performance.",
        keyPoints: [
          "Technology integration and pattern trading automation",
          "Professional scanning software and alert systems",
          "Automated execution and order management systems",
          "Advanced performance tracking and optimization tools"
        ],
        practicalSteps: [
          "Set up professional scanning software with custom pattern algorithms",
          "Implement automated alert systems for high-probability setups",
          "Use bracket orders for automated trade management",
          "Deploy performance tracking software for systematic optimization"
        ],
        example: "Technology stack: TradingView Pro scanning + ThinkOrSwim execution + Custom spreadsheet tracking = Complete system."
      }
    },
    {
      id: 12,
      title: "Performance Optimization and Scaling",
      duration: "35 min",
      description: "Master performance optimization and systematic trading scaling",
      content: {
        overview: "Implement comprehensive performance optimization and scaling strategies that maximize pattern trading results while managing increased capital efficiently.",
        keyPoints: [
          "Performance optimization and systematic improvement",
          "Trading scaling and capital management strategies",
          "Professional review and adaptation protocols",
          "Advanced metrics tracking and goal achievement"
        ],
        practicalSteps: [
          "Track key metrics: win rate, average R/R, profit factor, maximum drawdown",
          "Conduct weekly performance reviews and strategy optimization",
          "Scale position sizes as account grows while maintaining risk discipline",
          "Adapt strategies based on changing market conditions"
        ],
        example: "Performance tracking: 68% win rate, 1.8:1 avg R/R, 1.5 profit factor, 8% max drawdown = Strong performance."
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
            <Target className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Strategy #26</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Pattern Recognition System
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Master advanced pattern recognition and systematic trading through professional technical analysis, automated scanning systems, and systematic execution protocols for consistent pattern-based profits
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
                <div className="text-2xl font-bold text-purple-600">{lessons.length - completedLessons.length}</div>
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
              <Target className="h-6 w-6 text-purple-600" />
              Advanced Pattern Recognition Framework
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Core Methodology</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Advanced pattern recognition and systematic identification</span>
                  </li>
                  <li className="flex items-start gap-2">  
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Professional technical analysis and automated scanning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Systematic execution protocols and trade management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                    <span>Risk-adjusted performance optimization and scaling</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Performance Targets</h4>
                <div className="space-y-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">Pattern Mastery</div>
                    <div className="text-sm text-purple-700">90%+ pattern recognition accuracy</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">Systematic Excellence</div>
                    <div className="text-sm text-blue-700">Automated scanning and execution</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">Consistent Profits</div>
                    <div className="text-sm text-green-700">70%+ win rate with pattern discipline</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management Alert */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Risk-First Pattern Trading</h4>
                <p className="text-blue-700 text-sm">
                  This system emphasizes risk management as the foundation of pattern trading success. 
                  Maximum 2-5% risk per trade with systematic position sizing based on pattern reliability. 
                  Focus on high-probability setups with confirmed volume and technical confluence for consistent results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Complete Pattern Recognition Curriculum</h2>
          
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
                          <Target className="h-6 w-6 text-purple-600" />
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
                          <Target className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
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
                        <Target className="h-4 w-4 mr-2" />
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
              <Target className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-900 mb-2">
                Advanced Pattern Recognition System Complete!
              </h3>
              <p className="text-purple-800 mb-6">
                You've mastered all 12 lessons of advanced pattern recognition. 
                You're now equipped with professional pattern identification, automated scanning systems, 
                systematic execution protocols, and risk-adjusted performance optimization for consistent pattern-based profits.
              </p>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Pattern Mastery</div>
                  <div className="text-sm text-gray-600">Advanced recognition</div>
                </div>
                <div className="text-center">
                  <Settings className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold">Automation</div>
                  <div className="text-sm text-gray-600">Systematic scanning</div>
                </div>
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold">Risk Management</div>
                  <div className="text-sm text-gray-600">Professional protection</div>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-semibold">Performance</div>
                  <div className="text-sm text-gray-600">Systematic optimization</div>
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
            <CardTitle>Enhance Your Pattern Recognition Skills</CardTitle>
            <CardDescription>
              Combine pattern recognition with these complementary strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
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
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">Professional Day Trading</h4>
                <p className="text-green-700 text-sm">Intraday pattern execution</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/20')}
                >
                  Learn Strategy
                </Button>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-orange-900">Advanced Market Analysis</h4>
                <p className="text-orange-700 text-sm">Technical analysis mastery</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setLocation('/training/21')}
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