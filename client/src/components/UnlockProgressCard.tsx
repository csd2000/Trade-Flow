import { useSkillLevel } from '@/hooks/useSkillLevel';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, BookOpen, Clock, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { UNLOCK_REQUIREMENTS, getBestUnlockPath } from '@/config/unlock-milestones';
import { useLocation } from 'wouter';

interface UnlockProgressCardProps {
  variant?: 'sidebar' | 'full';
  className?: string;
}

export function UnlockProgressCard({ variant = 'full', className = '' }: UnlockProgressCardProps) {
  const { skillLevel, unlockProgress, isExperiencedUnlocked } = useSkillLevel();
  const [, setLocation] = useLocation();

  // Don't show if already experienced
  if (skillLevel === 'experienced' || isExperiencedUnlocked) {
    return null;
  }

  // If no unlock progress data yet, show loading state
  if (!unlockProgress) {
    return null;
  }

  const bestPath = getBestUnlockPath({
    modulesCompleted: unlockProgress.modulesCompleted,
    hoursSpent: unlockProgress.hoursSpent,
    strategiesCompleted: unlockProgress.strategiesCompleted,
  });

  const overallProgress = Math.max(
    unlockProgress.progress.modules,
    unlockProgress.progress.hours,
    unlockProgress.progress.strategies
  );

  const getPathIcon = (type: string) => {
    switch (type) {
      case 'modules':
        return BookOpen;
      case 'hours':
        return Clock;
      case 'strategies':
        return Trophy;
      default:
        return BookOpen;
    }
  };

  const getPathLabel = (type: string) => {
    switch (type) {
      case 'modules':
        return 'modules completed';
      case 'hours':
        return 'hours of learning';
      case 'strategies':
        return 'strategies completed';
      default:
        return '';
    }
  };

  const PathIcon = getPathIcon(bestPath.type);

  // Compact sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={`p-3 rounded-xl bg-gradient-to-br from-violet-900/50 to-violet-800/30 border border-violet-700/50 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-medium text-white">Unlock Experienced Mode</span>
        </div>
        <Progress value={overallProgress} className="h-2 mb-2" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {bestPath.current}/{bestPath.required} {getPathLabel(bestPath.type)}
          </span>
          <span className="text-violet-300">{Math.round(bestPath.percentage)}%</span>
        </div>
      </div>
    );
  }

  // Full card variant
  return (
    <Card className={`bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600/30 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Unlock Experienced Mode</CardTitle>
              <CardDescription className="text-slate-400">
                Complete training to access all features
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-violet-400">{Math.round(overallProgress)}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <Progress value={overallProgress} className="h-3" />

        {/* Progress Paths */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-slate-400">Modules</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {unlockProgress.modulesCompleted}/{UNLOCK_REQUIREMENTS.modulesRequired}
            </div>
            <Progress
              value={unlockProgress.progress.modules}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Hours</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {unlockProgress.hoursSpent.toFixed(1)}/{UNLOCK_REQUIREMENTS.hoursRequired}
            </div>
            <Progress
              value={unlockProgress.progress.hours}
              className="h-1 mt-2"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-400">Strategies</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {unlockProgress.strategiesCompleted}/{UNLOCK_REQUIREMENTS.strategiesRequired}
            </div>
            <Progress
              value={unlockProgress.progress.strategies}
              className="h-1 mt-2"
            />
          </div>
        </div>

        {/* Best path suggestion */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-600/20 border border-violet-500/30">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <div className="flex-1">
            <p className="text-sm text-white">
              You're closest to unlocking via{' '}
              <strong className="text-violet-300">{getPathLabel(bestPath.type)}</strong>
            </p>
            <p className="text-xs text-slate-400">
              {bestPath.required - bestPath.current} more to go!
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => setLocation('/master-academy')}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white"
        >
          Continue Learning
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Compact badge version for header/nav
export function UnlockProgressBadge() {
  const { skillLevel, unlockProgress, isExperiencedUnlocked } = useSkillLevel();

  if (skillLevel === 'experienced' || isExperiencedUnlocked || !unlockProgress) {
    return null;
  }

  const overallProgress = Math.max(
    unlockProgress.progress.modules,
    unlockProgress.progress.hours,
    unlockProgress.progress.strategies
  );

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-violet-600/20 border border-violet-500/30">
      <Lock className="w-3 h-3 text-violet-400" />
      <span className="text-xs text-violet-300">{Math.round(overallProgress)}% to unlock</span>
    </div>
  );
}

export default UnlockProgressCard;
