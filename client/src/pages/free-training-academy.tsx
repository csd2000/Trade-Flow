import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  Star,
  Target,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Brain,
  Building,
  Rocket,
  BarChart3,
  Activity,
  Award,
  ArrowRight,
  Lock,
  Unlock,
  GraduationCap,
  Calendar,
  Globe
} from "lucide-react";
import { TrainingSummary } from "@/components/shared/training-summary";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  description: string;
  keyPoints: string[];
  completed: boolean;
  unlocked: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  icon: any;
  color: string;
  completedLessons: number;
}

export default function FreeTrainingAcademy() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const trainingModules: Module[] = [
    // Foundation Module - DeFi Basics
    {
      id: 'defi-foundation',
      title: 'DeFi Foundation & Protocols',
      description: 'Master DeFi protocols, yield farming, stablecoin strategies, and safety systems',
      category: 'defi',
      difficulty: 'Beginner',
      estimatedTime: '4-5 weeks',
      icon: Shield,
      color: 'text-green-400',
      completedLessons: 0,
      lessons: [
        {
          id: 'defi-1',
          title: 'DeFi Fundamentals & Protocol Overview',
          duration: '20 min',
          description: 'Complete guide to DeFi protocols, yield opportunities, and safety',
          keyPoints: [
            'Traditional finance vs DeFi comparison',
            'Major protocols: Aave, Compound, Uniswap, Curve',
            'Understanding APY, TVL, and risk metrics',
            'Setting up MetaMask and wallet security'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'defi-2',
          title: 'Stablecoin Strategies & Conservative Income',
          duration: '25 min',
          description: 'Complete stablecoin guide for stable 5-8% returns + safety systems',
          keyPoints: [
            'USDC, USDT, DAI lending strategies',
            'Curve Finance stable pools optimization',
            '11-Point DeFi Safety System implementation',
            'Risk management and diversification rules'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'defi-3',
          title: 'Yield Farming & Liquidity Provision',
          duration: '30 min',
          description: 'Advanced yield farming with real yield pool analysis',
          keyPoints: [
            'Understanding liquidity pools and impermanent loss',
            'Yield optimization across 15+ top protocols',
            'Live yield pool analysis and selection',
            'Automated compound strategies'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'defi-4',
          title: 'Passive Income Training & Portfolio Strategy',
          duration: '25 min',
          description: '11 detailed passive income strategies + portfolio construction',
          keyPoints: [
            'Complete passive income curriculum with 11 strategies',
            'Step-by-step guides for Curve, Aave, GMX, Pendle, Lido',
            'Advanced search and filtering by risk, ROI, platform',
            'Complete exit strategies and risk analysis for each'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'defi-5',
          title: 'Project Discovery & Alpha Research',
          duration: '22 min',
          description: 'Finding strong crypto projects before major exchange listings',
          keyPoints: [
            'Research methodology for new projects',
            'Team and tokenomics analysis',
            'Community sentiment tracking',
            'Timing entry and exit points'
          ],
          completed: false,
          unlocked: true
        }
      ]
    },

    // Stock Trading Module
    {
      id: 'stock-trading',
      title: 'Complete Stock Trading System',
      description: 'Day trading, 30-second trading, Robin Hood system, Warrior strategies, and congressional following',
      category: 'stocks',
      difficulty: 'Intermediate',
      estimatedTime: '7-9 weeks',
      icon: TrendingUp,
      color: 'text-red-400',
      completedLessons: 0,
      lessons: [
        {
          id: 'stock-1',
          title: 'Stock Market Foundation & Setup',
          duration: '25 min',
          description: 'Complete market structure, broker setup, and fundamental analysis',
          keyPoints: [
            'Market structure and mechanics',
            'Broker selection and setup',
            'Reading charts and technical indicators',
            'Economic calendar and market timing'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-2',
          title: 'Warrior Trading Strategies - Ross\'s 5 Pillars',
          duration: '35 min',
          description: 'Complete Ross Cameron methodology for day trading success',
          keyPoints: [
            'Momentum breakout patterns and scanning',
            'Bull flag setups with precise entry rules',
            'VWAP bounce strategies and execution',
            'Opening range breakouts timing',
            'Risk management and position sizing'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-2b',
          title: 'Oliver Velez Trading Techniques',
          duration: '45 min',
          description: 'Complete Pristine Trading methodology with advanced patterns',
          keyPoints: [
            'The Pristine Method with systematic entry/exit rules',
            'Moving average mastery and confluence trading',
            'PBS/PSS setups and pattern recognition',
            'Intraday system from pre-market to close',
            'Master trader mindset and psychology'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-3',
          title: '30-Second Trading System',
          duration: '28 min',
          description: 'Lightning-fast news-based trading for daily top movers',
          keyPoints: [
            'Identifying daily top 5 movers analysis',
            'News-based trading signals and alerts',
            'Quick entry and exit execution techniques',
            'Risk control for high-speed trades'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-4',
          title: 'Robin Hood 4PM Trading System',
          duration: '22 min',
          description: 'Systematic end-of-day trading with automated signals',
          keyPoints: [
            'Market close momentum pattern recognition',
            'Automated signal generation and alerts',
            'Position sizing and risk calculation',
            'Performance tracking and optimization'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-5',
          title: 'Nancy Pelosi Congressional Strategy',
          duration: '30 min',
          description: 'Following high-profile congressional trades for 74% win rate',
          keyPoints: [
            'Tracking congressional disclosure filings',
            'Technology sector focus strategy (75% allocation)',
            'Optimal timing: 30-45 day execution window',
            'Policy committee advantage analysis'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'stock-6',
          title: 'Profit Taking & Exit Strategies',
          duration: '20 min',
          description: 'Professional profit-taking plans and portfolio management',
          keyPoints: [
            '5 professional profit-taking strategies',
            'Automated exit planning and execution',
            'Portfolio rebalancing techniques',
            'Tax optimization considerations'
          ],
          completed: false,
          unlocked: true
        }
      ]
    },

    // Forex Trading Module
    {
      id: 'forex-trading',
      title: 'Forex Trading Systems',
      description: 'Currency trading strategies and global market analysis',
      category: 'forex',
      difficulty: 'Intermediate',
      estimatedTime: '5-6 weeks',
      icon: Globe,
      color: 'text-blue-400',
      completedLessons: 0,
      lessons: [
        {
          id: 'forex-1',
          title: 'Forex Market Fundamentals',
          duration: '25 min',
          description: 'Understanding currency pairs and global markets',
          keyPoints: [
            'Major, minor, and exotic pairs',
            'Market sessions and overlap times',
            'Economic indicators impact',
            'Central bank policies'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'forex-2',
          title: 'Technical Analysis for Forex',
          duration: '30 min',
          description: 'Chart patterns and indicators specific to currency trading',
          keyPoints: [
            'Support and resistance levels',
            'Trend line analysis',
            'Moving average strategies',
            'RSI and MACD signals'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'forex-3',
          title: 'Risk Management in Forex',
          duration: '20 min',
          description: 'Protecting capital in leveraged currency trading',
          keyPoints: [
            'Position sizing with leverage',
            'Stop loss placement',
            'Risk-reward ratios',
            'Correlation analysis'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'forex-4',
          title: 'News Trading Strategies',
          duration: '22 min',
          description: 'Trading economic announcements and market events',
          keyPoints: [
            'Economic calendar usage',
            'NFP and CPI trading',
            'Central bank announcements',
            'Volatility management'
          ],
          completed: false,
          unlocked: true
        }
      ]
    },

    // Crypto Trading Module
    {
      id: 'crypto-trading',
      title: 'Crypto Trading & Analysis',
      description: 'Cryptocurrency trading strategies and project discovery',
      category: 'crypto',
      difficulty: 'Advanced',
      estimatedTime: '4-5 weeks',
      icon: Rocket,
      color: 'text-orange-400',
      completedLessons: 0,
      lessons: [
        {
          id: 'crypto-1',
          title: 'Crypto Market Structure',
          duration: '20 min',
          description: 'Understanding cryptocurrency markets and exchanges',
          keyPoints: [
            'Centralized vs decentralized exchanges',
            'Market cap and volume analysis',
            'Tokenomics fundamentals',
            'Regulatory considerations'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'crypto-2',
          title: 'Alpha Project Discovery',
          duration: '35 min',
          description: 'Finding crypto projects before major exchange listings',
          keyPoints: [
            'Project research methodology',
            'Team and advisor analysis',
            'Tokenomics evaluation',
            'Community sentiment tracking'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'crypto-3',
          title: 'Passive Income Strategies',
          duration: '25 min',
          description: 'Building sustainable crypto income streams',
          keyPoints: [
            'Staking strategies by chain',
            'Lending platform comparison',
            'Yield optimization techniques',
            'Tax implications and tracking'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'crypto-4',
          title: 'Safety and Security',
          duration: '18 min',
          description: '11-point system to avoid scams and protect investments',
          keyPoints: [
            'Smart contract audit verification',
            'Team doxxing requirements',
            'Liquidity and lock analysis',
            'Red flag identification'
          ],
          completed: false,
          unlocked: true
        }
      ]
    },

    // Trading Psychology & Education
    {
      id: 'trading-psychology',
      title: 'Trading Psychology & Mindful Education',
      description: 'Complete mental training, education platform, and performance optimization',
      category: 'psychology',
      difficulty: 'Advanced',
      estimatedTime: '6-8 weeks',
      icon: Brain,
      color: 'text-purple-400',
      completedLessons: 0,
      lessons: [
        {
          id: 'psych-1',
          title: 'Emotional Control & Trading Psychology',
          duration: '25 min',
          description: 'Complete emotional mastery and psychological trading foundation',
          keyPoints: [
            'Fear and greed psychology management',
            'Confirmation bias and cognitive errors',
            'FOMO and revenge trading prevention',
            'Mindfulness and meditation techniques'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'psych-2',
          title: 'Risk Psychology & Mental Discipline',
          duration: '28 min',
          description: 'Advanced risk perception and mental discipline training',
          keyPoints: [
            'Risk tolerance assessment and calibration',
            'Position sizing psychology optimization',
            'Loss aversion understanding and control',
            'Probability thinking and decision making'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'psych-3',
          title: 'Mindful Study Education Platform',
          duration: '30 min',
          description: '25+ professional education courses and learning paths',
          keyPoints: [
            'Structured learning curricula and paths',
            'Live educational sessions and mentorship',
            '1-on-1 professional guidance programs',
            'Community interaction and support'
          ],
          completed: false,
          unlocked: true
        },
        {
          id: 'psych-4',
          title: 'Performance Optimization & Routine Building',
          duration: '22 min',
          description: 'Peak performance techniques and systematic routines',
          keyPoints: [
            'Daily preparation and review routines',
            'Rule-based trading system development',
            'Mental training and stress management',
            'Success visualization and goal setting'
          ],
          completed: false,
          unlocked: true
        }
      ]
    }
  ];

  const selectedModuleData = trainingModules.find(m => m.id === selectedModule);
  // Add Cashflow Challenge module
  trainingModules.push({
    id: 'cashflow-challenge',
    title: 'Crypto Cashflow Challenge & AltcoinPro',
    description: '3-day live challenge system + complete AltcoinPro integration for passive income',
    category: 'crypto',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 weeks',
    icon: DollarSign,
    color: 'text-yellow-400',
    completedLessons: 0,
    lessons: [
      {
        id: 'cashflow-1',
        title: '3-Day Crypto Cashflow Challenge',
        duration: '45 min',
        description: 'Live event system for turning HODL into passive income streams',
        keyPoints: [
          'Day 1: Portfolio assessment and optimization',
          'Day 2: Yield strategy implementation',
          'Day 3: Automation and scaling techniques',
          'Live community support and guidance'
        ],
        completed: false,
        unlocked: true
      },
      {
        id: 'cashflow-2',
        title: 'AltcoinPro Integration Strategy',
        duration: '35 min',
        description: 'Complete system based on proven track record and success stories',
        keyPoints: [
          'FTX collapse prediction methodology',
          'Celsius/BlockFi early warning system',
          'Proven track record analysis',
          'Success story implementation'
        ],
        completed: false,
        unlocked: true
      }
    ]
  });

  const totalLessons = trainingModules.reduce((acc, module) => acc + module.lessons.length, 0);
  const totalCompleted = completedLessons.length;
  const overallProgress = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'Advanced': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-300 bg-gray-500/10';
    }
  };

  if (selectedModule && selectedModuleData) {
    return (
      <div className="min-h-screen bg-white p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button & Module Header */}
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedModule(null)}
              className="btn-secondary mb-4"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Modules
            </Button>
            
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${selectedModuleData.color.replace('text-', 'from-')}/20 to-gray-600/20`}>
                <selectedModuleData.icon className={`w-8 h-8 ${selectedModuleData.color}`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-crypto-text mb-2">{selectedModuleData.title}</h1>
                <p className="text-crypto-muted mb-4">{selectedModuleData.description}</p>
                <div className="flex items-center gap-4">
                  <Badge className={getDifficultyColor(selectedModuleData.difficulty)}>
                    {selectedModuleData.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2 text-crypto-muted">
                    <Clock className="w-4 h-4" />
                    <span>{selectedModuleData.estimatedTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-crypto-muted">
                    <BookOpen className="w-4 h-4" />
                    <span>{selectedModuleData.lessons.length} lessons</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Module Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-crypto-muted">Module Progress</span>
                <span className="text-crypto-text font-semibold">
                  {selectedModuleData.lessons.filter(l => completedLessons.includes(l.id)).length}/{selectedModuleData.lessons.length} completed
                </span>
              </div>
              <Progress 
                value={(selectedModuleData.lessons.filter(l => completedLessons.includes(l.id)).length / selectedModuleData.lessons.length) * 100} 
                className="h-3" 
              />
            </div>
          </div>

          {/* Lessons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {selectedModuleData.lessons.map((lesson, index) => (
              <Card key={lesson.id} className="crypto-card hover-lift">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        completedLessons.includes(lesson.id) 
                          ? 'bg-crypto-tertiary' 
                          : lesson.unlocked 
                            ? 'bg-crypto-primary' 
                            : 'bg-gray-600'
                      }`}>
                        {completedLessons.includes(lesson.id) ? (
                          <CheckCircle className="w-4 h-4 text-gray-900" />
                        ) : lesson.unlocked ? (
                          <span className="text-gray-900 text-sm font-bold">{index + 1}</span>
                        ) : (
                          <Lock className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-crypto-text">{lesson.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-crypto-muted text-sm">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </div>
                          {completedLessons.includes(lesson.id) && (
                            <Badge className="bg-crypto-tertiary/10 text-crypto-tertiary text-xs">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-crypto-muted text-sm mb-3">{lesson.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Key Points */}
                  <div className="mb-4">
                    <h4 className="text-crypto-text font-semibold text-sm mb-2">What you'll learn:</h4>
                    <ul className="space-y-1">
                      {lesson.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-crypto-muted">
                          <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  {lesson.unlocked ? (
                    <Button 
                      className={`w-full ${
                        completedLessons.includes(lesson.id) 
                          ? 'btn-success' 
                          : 'btn-primary'
                      }`}
                      onClick={() => {
                        setActiveLesson(lesson.id);
                        markLessonComplete(lesson.id);
                      }}
                    >
                      {completedLessons.includes(lesson.id) ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Review Lesson
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Lesson
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full btn-secondary" disabled>
                      <Lock className="w-4 h-4 mr-2" />
                      Complete Previous Lessons
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-crypto-primary/15 rounded-xl">
              <GraduationCap className="w-8 h-8 text-crypto-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">Free Training Academy</h1>
          </div>
          <p className="text-xl text-crypto-muted max-w-3xl mx-auto mb-6">
            Complete access to ALL trading strategies: DeFi protocols, yield farming, stablecoin guides, stock trading (Warrior/30-second/Robin Hood), forex, crypto analysis, congressional strategies, passive income training, cashflow challenges, psychology, and education platform - 100% FREE.
          </p>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-crypto-muted">Overall Progress</span>
              <span className="text-crypto-text font-semibold">{totalCompleted}/{totalLessons} lessons completed</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-crypto-muted text-sm mt-2">{overallProgress.toFixed(1)}% complete</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-primary mb-1">{trainingModules.length}</div>
                <div className="text-crypto-muted text-sm">Training Modules</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-tertiary mb-1">{totalLessons}</div>
                <div className="text-crypto-muted text-sm">Total Lessons</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-quaternary mb-1">100%</div>
                <div className="text-crypto-muted text-sm">Free Access</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-secondary mb-1">∞</div>
                <div className="text-crypto-muted text-sm">Lifetime Access</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Training Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingModules.map((module) => (
            <Card key={module.id} className="crypto-card hover-lift cursor-pointer h-full" onClick={() => setSelectedModule(module.id)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color.replace('text-', 'from-')}/20 to-gray-600/20`}>
                    <module.icon className={`w-6 h-6 ${module.color}`} />
                  </div>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-crypto-text">{module.title}</CardTitle>
                <p className="text-crypto-muted text-sm">{module.description}</p>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col h-full">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-crypto-muted">Progress</span>
                    <span className="text-crypto-text">
                      {module.lessons.filter(l => completedLessons.includes(l.id)).length}/{module.lessons.length}
                    </span>
                  </div>
                  <Progress 
                    value={(module.lessons.filter(l => completedLessons.includes(l.id)).length / module.lessons.length) * 100} 
                    className="h-2" 
                  />
                </div>

                {/* Module Info */}
                <div className="space-y-2 mb-4 flex-grow">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-crypto-muted" />
                      <span className="text-crypto-muted">Lessons</span>
                    </div>
                    <span className="text-crypto-text">{module.lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-crypto-muted" />
                      <span className="text-crypto-muted">Duration</span>
                    </div>
                    <span className="text-crypto-text">{module.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-crypto-muted" />
                      <span className="text-crypto-muted">Access</span>
                    </div>
                    <span className="text-crypto-tertiary">Free</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full btn-primary group mt-auto">
                  <Play className="w-4 h-4 mr-2" />
                  Start Module
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Training Summary & Consolidated Information */}
        <section className="mt-12">
          <TrainingSummary showFullDetails={true} />
        </section>

        {/* Bottom CTA */}
        <div className="text-center mt-12 py-16">
          <div className="crypto-card-premium max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-crypto-text mb-4">
              Complete Training System - 100% Free
            </h2>
            <p className="text-xl text-crypto-muted mb-8 max-w-2xl mx-auto">
              No paywalls, no premium tiers. Get full access to all {totalLessons} lessons covering every aspect of modern trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary text-lg px-8 py-4">
                <Star className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                <BarChart3 className="w-5 h-5 mr-2" />
                Track Progress
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-primary">DeFi</div>
                <div className="text-crypto-muted text-sm">Foundation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-tertiary">Stocks</div>
                <div className="text-crypto-muted text-sm">Day Trading</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-quaternary">Forex</div>
                <div className="text-crypto-muted text-sm">Currency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-crypto-secondary">Crypto</div>
                <div className="text-crypto-muted text-sm">Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}