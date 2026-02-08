import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap,
  BookOpen,
  Users,
  Trophy,
  ArrowRight,
  Star,
  TrendingUp,
  Clock,
  Target,
  Zap
} from "lucide-react";

export function MasterAcademyQuickAction() {
  // Mock user progress data - in real app this would come from database
  const userProgress = {
    enrolledStrategies: 3,
    completedStrategies: 1,
    totalStrategies: 10,
    currentTrack: 'Foundation Track',
    nextLesson: 'Conservative DeFi Income - Module 2',
    overallProgress: 28,
    weeklyGoal: 75,
    currentStreak: 12,
    rank: 'Bronze Trader'
  };

  const quickStats = [
    {
      label: 'Current Rank',
      value: userProgress.rank,
      icon: Trophy,
      color: 'text-yellow-400'
    },
    {
      label: 'Learning Streak',
      value: `${userProgress.currentStreak} days`,
      icon: Star,
      color: 'text-blue-400'
    },
    {
      label: 'Strategies Completed',
      value: `${userProgress.completedStrategies}/${userProgress.totalStrategies}`,
      icon: Target,
      color: 'text-green-400'
    }
  ];

  return (
    <Card className="crypto-card-premium relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-crypto-primary/10 to-crypto-tertiary/10 opacity-50"></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-crypto-primary/15 rounded-xl">
              <GraduationCap className="w-6 h-6 text-crypto-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-crypto-text">Master Trading Academy</CardTitle>
              <p className="text-crypto-muted text-sm">Your unified training progress</p>
            </div>
          </div>
          <Badge className="badge-success animate-pulse">
            <Users className="w-3 h-3 mr-1" />
            Active
          </Badge>
        </div>

        {/* Current Track & Progress */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-crypto-muted text-sm">Current Track</span>
              <span className="text-crypto-primary font-semibold text-sm">{userProgress.currentTrack}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-crypto-muted text-sm">Overall Progress</span>
              <span className="text-crypto-text font-semibold text-sm">{userProgress.overallProgress}%</span>
            </div>
            <Progress value={userProgress.overallProgress} className="h-2" />
          </div>

          {/* Weekly Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-crypto-muted text-sm">Weekly Goal</span>
              <span className="text-crypto-tertiary font-semibold text-sm">{userProgress.weeklyGoal}%</span>
            </div>
            <Progress value={userProgress.weeklyGoal} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-crypto-surface/50 rounded-lg backdrop-blur-sm">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-sm font-semibold text-crypto-text">{stat.value}</div>
              <div className="text-xs text-crypto-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Next Lesson */}
        <div className="bg-crypto-surface/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-crypto-quaternary" />
            <span className="text-crypto-muted text-sm">Next Lesson</span>
          </div>
          <p className="text-crypto-text font-medium text-sm mb-3">{userProgress.nextLesson}</p>
          <div className="flex items-center gap-2 text-xs text-crypto-muted">
            <Clock className="w-3 h-3" />
            <span>Estimated 15 minutes</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full btn-primary group" onClick={() => window.location.href = '/free-training'}>
            <BookOpen className="w-4 h-4 mr-2" />
            Start Free Training
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button className="btn-secondary text-sm" onClick={() => window.location.href = '/master-academy'}>
              <TrendingUp className="w-4 h-4 mr-1" />
              Master Academy
            </Button>
            <Button className="btn-secondary text-sm">
              <Zap className="w-4 h-4 mr-1" />
              Track Progress
            </Button>
          </div>
        </div>

        {/* Achievement Hint */}
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">Achievement Goal</span>
          </div>
          <p className="text-crypto-text text-xs">
            Complete 2 more lessons to unlock <span className="text-yellow-400 font-semibold">Silver Trader</span> rank!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}