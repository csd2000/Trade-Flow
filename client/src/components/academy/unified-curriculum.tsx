import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  Clock,
  Users,
  Star,
  ArrowRight,
  Award,
  Target,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Brain,
  Building,
  Rocket,
  BookOpen,
  Play
} from "lucide-react";

interface LearningPath {
  id: string;
  name: string;
  description: string;
  duration: string;
  strategies: string[];
  prerequisites: string[];
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Master';
  completionRate: number;
  averageReturn: string;
  icon: any;
  color: string;
  bgGradient: string;
}

export function UnifiedCurriculum() {
  const learningPaths: LearningPath[] = [
    {
      id: 'foundation',
      name: 'Foundation Track',
      description: 'Start your trading journey with conservative strategies and solid fundamentals',
      duration: '4-6 weeks',
      strategies: [
        'Conservative DeFi Income',
        'Crypto Passive Income',
        'Basic Trading Psychology'
      ],
      prerequisites: ['Basic crypto knowledge', 'MetaMask wallet'],
      difficulty: 'Foundation',
      completionRate: 94,
      averageReturn: '5-12% APY',
      icon: Shield,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-green-600/20'
    },
    {
      id: 'growth',
      name: 'Growth Track',
      description: 'Scale your returns with balanced strategies combining multiple markets',
      duration: '6-8 weeks',
      strategies: [
        'Balanced DeFi Growth',
        'Robin Hood 4PM System',
        'Congressional Trade Following',
        'Advanced Trading Psychology'
      ],
      prerequisites: ['Foundation Track completed', 'Trading platform access'],
      difficulty: 'Intermediate',
      completionRate: 82,
      averageReturn: '12-25% annually',
      icon: Target,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-blue-600/20'
    },
    {
      id: 'advanced',
      name: 'Advanced Track',
      description: 'Master high-performance strategies for maximum returns',
      duration: '8-12 weeks',
      strategies: [
        'High-Yield DeFi Alpha',
        'Warrior Day Trading',
        '30-Second Trader System',
        'Alpha Project Discovery',
        'Master Trading Psychology'
      ],
      prerequisites: ['Growth Track completed', 'Advanced platform access'],
      difficulty: 'Advanced',
      completionRate: 71,
      averageReturn: '25-50%+ potential',
      icon: Zap,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-purple-600/20'
    },
    {
      id: 'master',
      name: 'Master Track',
      description: 'Complete mastery combining all strategies into a unified portfolio approach',
      duration: '12+ weeks',
      strategies: [
        'All Advanced Strategies',
        'Portfolio Optimization',
        'Multi-Market Arbitrage',
        'Institutional Strategies',
        'Teaching & Mentoring'
      ],
      prerequisites: ['Advanced Track completed', 'Proven track record'],
      difficulty: 'Master',
      completionRate: 58,
      averageReturn: '50-100%+ potential',
      icon: Award,
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/20 to-orange-600/20'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Foundation': return 'text-green-400 bg-green-500/10';
      case 'Intermediate': return 'text-blue-400 bg-blue-500/10';
      case 'Advanced': return 'text-purple-400 bg-purple-500/10';
      case 'Master': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const combinedStats = {
    totalStrategies: learningPaths.reduce((acc, path) => acc + path.strategies.length, 0),
    averageCompletion: Math.round(learningPaths.reduce((acc, path) => acc + path.completionRate, 0) / learningPaths.length),
    totalDuration: '4-12+ weeks',
    studentsEnrolled: '15,247'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-crypto-text mb-4">
          Unified Learning Pathways
        </h2>
        <p className="text-crypto-muted max-w-3xl mx-auto mb-6">
          Progressive learning tracks that combine all trading strategies into a cohesive educational journey. 
          Each track builds upon the previous, creating a complete trading mastery system.
        </p>

        {/* Combined Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
          <Card className="crypto-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-crypto-primary mb-1">{combinedStats.totalStrategies}</div>
              <div className="text-crypto-muted text-sm">Total Strategies</div>
            </CardContent>
          </Card>
          <Card className="crypto-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-crypto-tertiary mb-1">{combinedStats.averageCompletion}%</div>
              <div className="text-crypto-muted text-sm">Avg Completion</div>
            </CardContent>
          </Card>
          <Card className="crypto-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-crypto-quaternary mb-1">{combinedStats.totalDuration}</div>
              <div className="text-crypto-muted text-sm">Duration Range</div>
            </CardContent>
          </Card>
          <Card className="crypto-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-crypto-secondary mb-1">{combinedStats.studentsEnrolled}</div>
              <div className="text-crypto-muted text-sm">Students</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {learningPaths.map((path, index) => (
          <Card key={path.id} className="crypto-card hover-lift h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl ${path.bgGradient}`}>
                  <path.icon className={`w-8 h-8 ${path.color}`} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-crypto-text text-sm font-semibold">
                      {path.completionRate}%
                    </span>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl text-crypto-text mb-2">{path.name}</CardTitle>
              <p className="text-crypto-muted text-sm">{path.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-crypto-surface rounded-lg">
                  <div className="text-lg font-bold text-crypto-primary">
                    {path.averageReturn}
                  </div>
                  <div className="text-crypto-muted text-xs">Expected Return</div>
                </div>
                <div className="text-center p-3 bg-crypto-surface rounded-lg">
                  <div className="text-lg font-bold text-crypto-tertiary">
                    {path.duration}
                  </div>
                  <div className="text-crypto-muted text-xs">Duration</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-crypto-muted">Completion Rate</span>
                  <span className="text-crypto-text font-semibold">{path.completionRate}%</span>
                </div>
                <Progress value={path.completionRate} className="h-2" />
              </div>

              {/* Included Strategies */}
              <div className="mb-6">
                <h4 className="text-crypto-text font-semibold text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Included Strategies ({path.strategies.length})
                </h4>
                <div className="space-y-2">
                  {path.strategies.map((strategy, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-crypto-tertiary" />
                      <span className="text-crypto-muted">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              <div className="mb-6">
                <h4 className="text-crypto-text font-semibold text-sm mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Prerequisites
                </h4>
                <div className="space-y-1">
                  {path.prerequisites.map((prereq, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-crypto-quaternary rounded-full"></div>
                      <span className="text-crypto-muted">{prereq}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time & Students */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-crypto-muted" />
                  <span className="text-crypto-muted">Duration</span>
                  <span className="text-crypto-text ml-auto">{path.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-crypto-muted" />
                  <span className="text-crypto-muted">Students</span>
                  <span className="text-crypto-text ml-auto">
                    {Math.floor(parseInt(combinedStats.studentsEnrolled.replace(',', '')) * (path.completionRate / 100) / 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full btn-primary group">
                <Play className="w-4 h-4 mr-2" />
                Start {path.name}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Track Connection Indicator */}
              {index < learningPaths.length - 1 && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-8 h-8 bg-crypto-primary rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-white rotate-90" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success Stories */}
      <div className="crypto-card-premium text-center py-12">
        <h3 className="text-2xl font-bold text-crypto-text mb-4">
          Complete System Success Stories
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-crypto-primary">$2.3M</div>
            <div className="text-crypto-muted">Average Portfolio Growth</div>
            <div className="text-xs text-crypto-text-subtle">Master Track Graduates</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-crypto-tertiary">847</div>
            <div className="text-crypto-muted">Certified Masters</div>
            <div className="text-xs text-crypto-text-subtle">All Tracks Completed</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-crypto-quaternary">94%</div>
            <div className="text-crypto-muted">Success Rate</div>
            <div className="text-xs text-crypto-text-subtle">Profitable After 6 Months</div>
          </div>
        </div>
        <div className="mt-8">
          <p className="text-crypto-muted max-w-2xl mx-auto mb-6">
            Our unified approach creates traders who succeed across multiple markets and strategies, 
            not just single-strategy specialists.
          </p>
          <Button className="btn-primary text-lg px-8 py-4">
            <Award className="w-5 h-5 mr-2" />
            View Success Stories
          </Button>
        </div>
      </div>
    </div>
  );
}