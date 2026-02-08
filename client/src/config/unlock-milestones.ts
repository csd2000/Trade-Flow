export const UNLOCK_REQUIREMENTS = {
  modulesRequired: 10,
  hoursRequired: 5,
  strategiesRequired: 3,
};

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requirement: number;
  type: 'modules' | 'hours' | 'strategies';
  icon: 'book' | 'clock' | 'trophy' | 'star';
}

export const MILESTONES: Milestone[] = [
  {
    id: 'first-module',
    title: 'First Steps',
    description: 'Complete your first training module',
    requirement: 1,
    type: 'modules',
    icon: 'book',
  },
  {
    id: 'five-modules',
    title: 'Getting Started',
    description: 'Complete 5 training modules',
    requirement: 5,
    type: 'modules',
    icon: 'book',
  },
  {
    id: 'ten-modules',
    title: 'Module Master',
    description: 'Complete 10 training modules',
    requirement: 10,
    type: 'modules',
    icon: 'trophy',
  },
  {
    id: 'first-hour',
    title: 'Dedicated Learner',
    description: 'Spend 1 hour learning',
    requirement: 1,
    type: 'hours',
    icon: 'clock',
  },
  {
    id: 'five-hours',
    title: 'Time Invested',
    description: 'Spend 5 hours learning',
    requirement: 5,
    type: 'hours',
    icon: 'clock',
  },
  {
    id: 'first-strategy',
    title: 'Strategy Scholar',
    description: 'Complete a full trading strategy',
    requirement: 1,
    type: 'strategies',
    icon: 'star',
  },
  {
    id: 'three-strategies',
    title: 'Strategy Expert',
    description: 'Complete 3 trading strategies',
    requirement: 3,
    type: 'strategies',
    icon: 'trophy',
  },
];

// Helper to check if a milestone is complete
export function isMilestoneComplete(
  milestone: Milestone,
  progress: { modulesCompleted: number; hoursSpent: number; strategiesCompleted: number }
): boolean {
  switch (milestone.type) {
    case 'modules':
      return progress.modulesCompleted >= milestone.requirement;
    case 'hours':
      return progress.hoursSpent >= milestone.requirement;
    case 'strategies':
      return progress.strategiesCompleted >= milestone.requirement;
    default:
      return false;
  }
}

// Get progress percentage for a specific milestone
export function getMilestoneProgress(
  milestone: Milestone,
  progress: { modulesCompleted: number; hoursSpent: number; strategiesCompleted: number }
): number {
  let current: number;
  switch (milestone.type) {
    case 'modules':
      current = progress.modulesCompleted;
      break;
    case 'hours':
      current = progress.hoursSpent;
      break;
    case 'strategies':
      current = progress.strategiesCompleted;
      break;
    default:
      current = 0;
  }
  return Math.min(100, (current / milestone.requirement) * 100);
}

// Check if user has unlocked experienced mode
export function hasUnlockedExperienced(progress: {
  modulesCompleted: number;
  hoursSpent: number;
  strategiesCompleted: number;
}): boolean {
  return (
    progress.modulesCompleted >= UNLOCK_REQUIREMENTS.modulesRequired ||
    progress.hoursSpent >= UNLOCK_REQUIREMENTS.hoursRequired ||
    progress.strategiesCompleted >= UNLOCK_REQUIREMENTS.strategiesRequired
  );
}

// Get the best progress path toward unlock (the one closest to completion)
export function getBestUnlockPath(progress: {
  modulesCompleted: number;
  hoursSpent: number;
  strategiesCompleted: number;
}): {
  type: 'modules' | 'hours' | 'strategies';
  current: number;
  required: number;
  percentage: number;
} {
  const paths = [
    {
      type: 'modules' as const,
      current: progress.modulesCompleted,
      required: UNLOCK_REQUIREMENTS.modulesRequired,
      percentage: (progress.modulesCompleted / UNLOCK_REQUIREMENTS.modulesRequired) * 100,
    },
    {
      type: 'hours' as const,
      current: progress.hoursSpent,
      required: UNLOCK_REQUIREMENTS.hoursRequired,
      percentage: (progress.hoursSpent / UNLOCK_REQUIREMENTS.hoursRequired) * 100,
    },
    {
      type: 'strategies' as const,
      current: progress.strategiesCompleted,
      required: UNLOCK_REQUIREMENTS.strategiesRequired,
      percentage: (progress.strategiesCompleted / UNLOCK_REQUIREMENTS.strategiesRequired) * 100,
    },
  ];

  // Return the path with highest percentage (closest to unlock)
  return paths.reduce((best, current) =>
    current.percentage > best.percentage ? current : best
  );
}
