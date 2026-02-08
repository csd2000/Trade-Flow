import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap,
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  DollarSign,
  Clock,
  Users,
  Award,
  BookOpen,
  Play,
  CheckCircle,
  BarChart3,
  Brain,
  Briefcase,
  Calendar,
  Activity,
  Star,
  ArrowRight,
  Building,
  Rocket,
  Eye,
  Map
} from "lucide-react";
import { UnifiedCurriculum } from "@/components/academy/unified-curriculum";

interface TradingStrategy {
  id: string;
  name: string;
  category: 'defi' | 'stocks' | 'crypto' | 'psychology' | 'congressional';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  timeToComplete: string;
  successRate: string;
  averageReturn: string;
  description: string;
  keyFeatures: string[];
  prerequisites: string[];
  icon: any;
  color: string;
  bgGradient: string;
  isCompleted: boolean;
  progress: number;
  instructors: string[];
  nextLiveSession?: string;
}

export default function MasterTradingAcademy() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [completedStrategies, setCompletedStrategies] = useState<string[]>([]);
  const [enrolledStrategies, setEnrolledStrategies] = useState<string[]>([]);

  const tradingStrategies: TradingStrategy[] = [
    // DeFi Strategies
    {
      id: 'defi-conservative',
      name: 'Conservative DeFi Income',
      category: 'defi',
      difficulty: 'Beginner',
      timeToComplete: '2-3 weeks',
      successRate: '94%',
      averageReturn: '5-8% APY',
      description: 'Master stable, low-risk DeFi strategies using proven lending protocols like Aave and Compound.',
      keyFeatures: ['Stablecoin lending', 'Risk management', 'Protocol diversification', 'Automated monitoring'],
      prerequisites: ['Basic crypto knowledge', 'MetaMask wallet'],
      icon: Shield,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['DeFi Dad', 'Yield Guru']
    },
    {
      id: 'defi-balanced',
      name: 'Balanced DeFi Growth',
      category: 'defi',
      difficulty: 'Intermediate',
      timeToComplete: '3-4 weeks',
      successRate: '87%',
      averageReturn: '12-18% APY',
      description: 'Learn yield farming, liquidity provision, and balanced portfolio construction across multiple protocols.',
      keyFeatures: ['Yield farming', 'LP strategies', 'Impermanent loss protection', 'Portfolio rebalancing'],
      prerequisites: ['Conservative DeFi completed', 'Understanding of DEXs'],
      icon: Target,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Curve Master', 'Uniswap Pro']
    },
    {
      id: 'defi-aggressive',
      name: 'High-Yield DeFi Alpha',
      category: 'defi',
      difficulty: 'Advanced',
      timeToComplete: '4-6 weeks',
      successRate: '73%',
      averageReturn: '25-50%+ APY',
      description: 'Advanced strategies including leveraged farming, new protocol launches, and arbitrage opportunities.',
      keyFeatures: ['Leveraged positions', 'New protocol launches', 'Arbitrage strategies', 'Advanced risk management'],
      prerequisites: ['Balanced DeFi completed', 'Advanced DeFi knowledge'],
      icon: Zap,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Alpha Hunter', 'Leverage Expert']
    },

    // Stock Trading Strategies
    {
      id: 'stock-day-trading',
      name: 'Warrior Day Trading',
      category: 'stocks',
      difficulty: 'Intermediate',
      timeToComplete: '6-8 weeks',
      successRate: '68%',
      averageReturn: '15-25% monthly',
      description: 'Master Ross Cameron\'s proven day trading strategies including momentum breakouts and VWAP bounces.',
      keyFeatures: ['5 Pillars of Stock Selection', 'Momentum strategies', 'Risk management', 'Live trading sessions'],
      prerequisites: ['Basic stock knowledge', 'Trading platform account'],
      icon: TrendingUp,
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-red-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Ross Cameron', 'Warrior Team'],
      nextLiveSession: 'Tomorrow 9:30 AM EST'
    },
    {
      id: 'stock-30second',
      name: '30-Second Trader System',
      category: 'stocks',
      difficulty: 'Advanced',
      timeToComplete: '4-5 weeks',
      successRate: '71%',
      averageReturn: '20-30% monthly',
      description: 'Lightning-fast trading system focused on top daily movers and market-moving news.',
      keyFeatures: ['Daily top movers', 'News-based trading', 'Quick entry/exit', 'SMS alerts'],
      prerequisites: ['Day trading experience', 'Level 2 data access'],
      icon: Activity,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/20 to-yellow-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Speed Trader Pro', 'News Master']
    },
    {
      id: 'stock-robin-hood',
      name: 'Robin Hood 4PM System',
      category: 'stocks',
      difficulty: 'Intermediate',
      timeToComplete: '3-4 weeks',
      successRate: '82%',
      averageReturn: '12-18% monthly',
      description: 'Systematic approach to trading market close movements with automated execution.',
      keyFeatures: ['4PM close trading', 'Automated signals', 'Risk management', 'Backtested strategies'],
      prerequisites: ['Basic trading knowledge', 'Broker API access'],
      icon: Clock,
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/20 to-cyan-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Robin Hood Expert', 'Algorithm Developer']
    },

    // Crypto Strategies
    {
      id: 'crypto-passive-income',
      name: 'Crypto Passive Income',
      category: 'crypto',
      difficulty: 'Beginner',
      timeToComplete: '2-3 weeks',
      successRate: '91%',
      averageReturn: '8-15% APY',
      description: 'Build sustainable passive income streams through staking, lending, and yield optimization.',
      keyFeatures: ['Staking strategies', 'Lending platforms', 'Yield optimization', 'Tax considerations'],
      prerequisites: ['Basic crypto knowledge', 'Exchange account'],
      icon: DollarSign,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Passive Income Pro', 'Staking Expert']
    },
    {
      id: 'crypto-project-discovery',
      name: 'Alpha Project Discovery',
      category: 'crypto',
      difficulty: 'Advanced',
      timeToComplete: '5-6 weeks',
      successRate: '65%',
      averageReturn: '50-200%+ potential',
      description: 'Find and evaluate crypto projects before major exchange listings and mainstream adoption.',
      keyFeatures: ['Project analysis', 'Tokenomics evaluation', 'Team assessment', 'Early entry strategies'],
      prerequisites: ['Advanced crypto knowledge', 'Research skills'],
      icon: Rocket,
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/20 to-red-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Alpha Researcher', 'Project Analyst']
    },

    // Trading Psychology
    {
      id: 'trading-psychology',
      name: 'Mindful Trading Psychology',
      category: 'psychology',
      difficulty: 'Intermediate',
      timeToComplete: '4-6 weeks',
      successRate: '88%',
      averageReturn: 'Improved win rate by 15-25%',
      description: 'Master the mental game of trading with proven psychological techniques and emotional control.',
      keyFeatures: ['Emotional control', 'Risk psychology', 'Mental discipline', 'Performance optimization'],
      prerequisites: ['Some trading experience', 'Commitment to self-improvement'],
      icon: Brain,
      color: 'text-indigo-400',
      bgGradient: 'from-indigo-500/20 to-purple-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Trading Psychologist', 'Mental Coach']
    },

    // Congressional Trading
    {
      id: 'congressional-trading',
      name: 'Congressional Trade Following',
      category: 'congressional',
      difficulty: 'Intermediate',
      timeToComplete: '3-4 weeks',
      successRate: '74%',
      averageReturn: '18-25% annually',
      description: 'Follow high-profile congressional trades with proven outperformance based on academic research.',
      keyFeatures: ['Disclosure tracking', 'Policy analysis', 'Timing strategies', 'Technology sector focus'],
      prerequisites: ['Stock trading knowledge', 'Political awareness'],
      icon: Building,
      color: 'text-slate-200',
      bgGradient: 'from-slate-500/20 to-gray-600/20',
      isCompleted: false,
      progress: 0,
      instructors: ['Policy Analyst', 'Congressional Expert']
    }
  ];

  const categories = [
    { id: 'all', name: 'All Strategies', icon: GraduationCap, color: 'text-crypto-primary' },
    { id: 'defi', name: 'DeFi Strategies', icon: Shield, color: 'text-green-400' },
    { id: 'stocks', name: 'Stock Trading', icon: TrendingUp, color: 'text-red-400' },
    { id: 'crypto', name: 'Crypto Strategies', icon: BarChart3, color: 'text-yellow-400' },
    { id: 'psychology', name: 'Trading Psychology', icon: Brain, color: 'text-indigo-400' },
    { id: 'congressional', name: 'Congressional Trading', icon: Building, color: 'text-slate-200' }
  ];

  const getFilteredStrategies = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      return tradingStrategies;
    }
    return tradingStrategies.filter(strategy => strategy.category === selectedCategory);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'Advanced': return 'text-orange-400 bg-orange-500/10';
      case 'Expert': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-300 bg-gray-500/10';
    }
  };

  const getSuccessRateColor = (rate: string) => {
    const numRate = parseInt(rate);
    if (numRate >= 90) return 'text-green-400';
    if (numRate >= 80) return 'text-cyan-400';
    if (numRate >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const enrollInStrategy = (strategyId: string) => {
    setEnrolledStrategies(prev => [...prev, strategyId]);
  };

  const totalProgress = tradingStrategies.reduce((acc, strategy) => acc + strategy.progress, 0) / tradingStrategies.length;
  const completedCount = tradingStrategies.filter(s => s.isCompleted).length;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-crypto-primary/15 rounded-xl">
              <GraduationCap className="w-8 h-8 text-crypto-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gradient">Master Trading Academy</h1>
          </div>
          <p className="text-xl text-crypto-muted max-w-3xl mx-auto mb-6">
            Complete professional trading education combining DeFi, stocks, crypto, and psychology into one unified platform
          </p>

          {/* Academy Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-primary mb-1">{tradingStrategies.length}</div>
                <div className="text-crypto-muted text-sm">Total Strategies</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-tertiary mb-1">{completedCount}</div>
                <div className="text-crypto-muted text-sm">Completed</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-quaternary mb-1">{totalProgress.toFixed(0)}%</div>
                <div className="text-crypto-muted text-sm">Overall Progress</div>
              </CardContent>
            </Card>
            <Card className="crypto-card text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-crypto-secondary mb-1">15K+</div>
                <div className="text-crypto-muted text-sm">Students</div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-crypto-muted">Academy Progress</span>
              <span className="text-crypto-text font-semibold">{totalProgress.toFixed(0)}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`${
                selectedCategory === category.id 
                  ? 'btn-primary' 
                  : 'btn-secondary hover:border-crypto-primary'
              } flex items-center gap-2`}
            >
              <category.icon className={`w-4 h-4 ${category.color}`} />
              {category.name}
            </Button>
          ))}
        </div>

        {/* Learning Pathways Section */}
        <Tabs defaultValue="strategies" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-crypto-surface">
            <TabsTrigger value="strategies">Individual Strategies</TabsTrigger>
            <TabsTrigger value="pathways">Learning Pathways</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pathways" className="mt-8">
            <UnifiedCurriculum />
          </TabsContent>
          
          <TabsContent value="strategies" className="mt-8">
            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {getFilteredStrategies().map((strategy) => (
            <Card key={strategy.id} className="crypto-card hover-lift h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl ${strategy.bgGradient}`}>
                    <strategy.icon className={`w-6 h-6 ${strategy.color}`} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getDifficultyColor(strategy.difficulty)}>
                      {strategy.difficulty}
                    </Badge>
                    {strategy.isCompleted && (
                      <CheckCircle className="w-5 h-5 text-crypto-tertiary" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg text-crypto-text">{strategy.name}</CardTitle>
                <p className="text-crypto-muted text-sm">{strategy.description}</p>
              </CardHeader>

              <CardContent className="pt-0 flex flex-col h-full">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-crypto-surface rounded-lg">
                    <div className={`text-lg font-bold ${getSuccessRateColor(strategy.successRate)}`}>
                      {strategy.successRate}
                    </div>
                    <div className="text-crypto-muted text-xs">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-crypto-surface rounded-lg">
                    <div className="text-lg font-bold text-crypto-primary">
                      {strategy.averageReturn}
                    </div>
                    <div className="text-crypto-muted text-xs">Avg Return</div>
                  </div>
                </div>

                {/* Progress */}
                {strategy.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-crypto-muted">Progress</span>
                      <span className="text-crypto-text">{strategy.progress}%</span>
                    </div>
                    <Progress value={strategy.progress} className="h-2" />
                  </div>
                )}

                {/* Key Features */}
                <div className="mb-4 flex-grow">
                  <h4 className="text-crypto-text font-semibold text-sm mb-2">Key Features</h4>
                  <div className="space-y-1">
                    {strategy.keyFeatures.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-crypto-primary rounded-full"></div>
                        <span className="text-crypto-muted text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructors */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-crypto-muted" />
                    <span className="text-crypto-muted text-sm">Instructors</span>
                  </div>
                  <div className="text-crypto-text text-sm">
                    {strategy.instructors.join(', ')}
                  </div>
                </div>

                {/* Time & Next Session */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-crypto-muted" />
                      <span className="text-crypto-muted">Duration</span>
                    </div>
                    <span className="text-crypto-text">{strategy.timeToComplete}</span>
                  </div>
                  {strategy.nextLiveSession && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-crypto-muted" />
                        <span className="text-crypto-muted">Next Live</span>
                      </div>
                      <span className="text-crypto-primary">{strategy.nextLiveSession}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  {strategy.isCompleted ? (
                    <Button className="w-full btn-success" disabled>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </Button>
                  ) : enrolledStrategies.includes(strategy.id) ? (
                    <Button className="w-full btn-primary">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      className="w-full btn-secondary group"
                      onClick={() => enrollInStrategy(strategy.id)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Start Strategy
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </div>
              </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="text-center mt-12 py-16">
          <div className="crypto-card-premium max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-crypto-text mb-4">
              Ready to Master Professional Trading?
            </h2>
            <p className="text-xl text-crypto-muted mb-8 max-w-2xl mx-auto">
              Join thousands of successful traders using our unified academy platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-primary text-lg px-8 py-4">
                <Star className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button className="btn-secondary text-lg px-8 py-4">
                <Eye className="w-5 h-5 mr-2" />
                View Curriculum
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}