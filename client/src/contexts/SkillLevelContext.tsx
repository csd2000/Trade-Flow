import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type SkillLevel = 'beginner' | 'experienced';

interface UnlockProgress {
  modulesCompleted: number;
  hoursSpent: number;
  strategiesCompleted: number;
  isUnlocked: boolean;
  requirements: {
    modulesRequired: number;
    hoursRequired: number;
    strategiesRequired: number;
  };
  progress: {
    modules: number;
    hours: number;
    strategies: number;
  };
}

interface SkillLevelContextValue {
  skillLevel: SkillLevel;
  setSkillLevel: (level: SkillLevel) => void;
  unlockProgress: UnlockProgress | null;
  isExperiencedUnlocked: boolean;
  hasSeenOnboarding: boolean;
  setOnboardingComplete: () => void;
  dismissedAdvancedWarnings: boolean;
  setDismissedAdvancedWarnings: (dismissed: boolean) => void;
  sessionId: string;
  isLoading: boolean;
  refreshUnlockProgress: () => Promise<void>;
  trackModuleCompletion: (modulesCompleted: number) => Promise<void>;
  trackTimeSpent: (additionalHours: number) => Promise<void>;
  trackStrategyCompletion: (strategiesCompleted: number) => Promise<void>;
}

const SkillLevelContext = createContext<SkillLevelContextValue | undefined>(undefined);

// Generate a unique session ID for unauthenticated users
function generateSessionId(): string {
  const existingId = localStorage.getItem('tradeflow_session_id');
  if (existingId) return existingId;

  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('tradeflow_session_id', newId);
  return newId;
}

interface SkillLevelProviderProps {
  children: ReactNode;
}

export function SkillLevelProvider({ children }: SkillLevelProviderProps) {
  const [sessionId] = useState(generateSessionId);
  const [skillLevel, setSkillLevelState] = useState<SkillLevel>('beginner');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [dismissedAdvancedWarnings, setDismissedAdvancedWarningsState] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState<UnlockProgress | null>(null);
  const [isExperiencedUnlocked, setIsExperiencedUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch preferences from server on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch(`/api/user/preferences/${sessionId}`);
        const data = await response.json();

        if (data.exists && data.preferences) {
          setSkillLevelState(data.preferences.skillLevel || 'beginner');
          setHasSeenOnboarding(data.preferences.hasSeenOnboarding || false);
          setDismissedAdvancedWarningsState(data.preferences.dismissedAdvancedWarnings || false);
          setIsExperiencedUnlocked(data.preferences.experiencedUnlockedAt !== null);
        } else {
          // Check localStorage for any cached preferences
          const cachedSkillLevel = localStorage.getItem('tradeflow_skill_level');
          const cachedOnboarding = localStorage.getItem('tradeflow_onboarding_complete');

          if (cachedSkillLevel) {
            setSkillLevelState(cachedSkillLevel as SkillLevel);
          }
          if (cachedOnboarding) {
            setHasSeenOnboarding(cachedOnboarding === 'true');
          }
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        // Fall back to localStorage
        const cachedSkillLevel = localStorage.getItem('tradeflow_skill_level');
        const cachedOnboarding = localStorage.getItem('tradeflow_onboarding_complete');

        if (cachedSkillLevel) {
          setSkillLevelState(cachedSkillLevel as SkillLevel);
        }
        if (cachedOnboarding) {
          setHasSeenOnboarding(cachedOnboarding === 'true');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchPreferences();
  }, [sessionId]);

  // Fetch unlock progress
  const refreshUnlockProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/unlock-progress/${sessionId}`);
      const data = await response.json();
      setUnlockProgress(data);
      setIsExperiencedUnlocked(data.isUnlocked);
    } catch (error) {
      console.error('Error fetching unlock progress:', error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!isLoading) {
      refreshUnlockProgress();
    }
  }, [isLoading, refreshUnlockProgress]);

  // Save preferences to server
  const savePreferences = useCallback(async (updates: Partial<{
    skillLevel: SkillLevel;
    hasSeenOnboarding: boolean;
    dismissedAdvancedWarnings: boolean;
  }>) => {
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...updates,
        }),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [sessionId]);

  const setSkillLevel = useCallback((level: SkillLevel) => {
    setSkillLevelState(level);
    localStorage.setItem('tradeflow_skill_level', level);
    savePreferences({ skillLevel: level });

    // If setting to experienced and not unlocked yet, unlock it
    if (level === 'experienced' && !isExperiencedUnlocked) {
      fetch(`/api/user/unlock-experienced/${sessionId}`, { method: 'POST' })
        .then(() => {
          setIsExperiencedUnlocked(true);
        })
        .catch(console.error);
    }
  }, [savePreferences, sessionId, isExperiencedUnlocked]);

  const setOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem('tradeflow_onboarding_complete', 'true');
    savePreferences({ hasSeenOnboarding: true });
  }, [savePreferences]);

  const setDismissedAdvancedWarnings = useCallback((dismissed: boolean) => {
    setDismissedAdvancedWarningsState(dismissed);
    localStorage.setItem('tradeflow_dismissed_warnings', dismissed.toString());
    savePreferences({ dismissedAdvancedWarnings: dismissed });
  }, [savePreferences]);

  // Track progress functions
  const trackModuleCompletion = useCallback(async (modulesCompleted: number) => {
    try {
      const response = await fetch('/api/user/track-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, modulesCompleted }),
      });
      const data = await response.json();

      if (data.justUnlocked) {
        setIsExperiencedUnlocked(true);
        setSkillLevelState('experienced');
      }

      await refreshUnlockProgress();
    } catch (error) {
      console.error('Error tracking module completion:', error);
    }
  }, [sessionId, refreshUnlockProgress]);

  const trackTimeSpent = useCallback(async (additionalHours: number) => {
    const currentHours = unlockProgress?.hoursSpent ?? 0;
    try {
      const response = await fetch('/api/user/track-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, hoursSpent: currentHours + additionalHours }),
      });
      const data = await response.json();

      if (data.justUnlocked) {
        setIsExperiencedUnlocked(true);
        setSkillLevelState('experienced');
      }

      await refreshUnlockProgress();
    } catch (error) {
      console.error('Error tracking time spent:', error);
    }
  }, [sessionId, unlockProgress, refreshUnlockProgress]);

  const trackStrategyCompletion = useCallback(async (strategiesCompleted: number) => {
    try {
      const response = await fetch('/api/user/track-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, strategiesCompleted }),
      });
      const data = await response.json();

      if (data.justUnlocked) {
        setIsExperiencedUnlocked(true);
        setSkillLevelState('experienced');
      }

      await refreshUnlockProgress();
    } catch (error) {
      console.error('Error tracking strategy completion:', error);
    }
  }, [sessionId, refreshUnlockProgress]);

  const value: SkillLevelContextValue = {
    skillLevel,
    setSkillLevel,
    unlockProgress,
    isExperiencedUnlocked,
    hasSeenOnboarding,
    setOnboardingComplete,
    dismissedAdvancedWarnings,
    setDismissedAdvancedWarnings,
    sessionId,
    isLoading,
    refreshUnlockProgress,
    trackModuleCompletion,
    trackTimeSpent,
    trackStrategyCompletion,
  };

  return (
    <SkillLevelContext.Provider value={value}>
      {children}
    </SkillLevelContext.Provider>
  );
}

export function useSkillLevel(): SkillLevelContextValue {
  const context = useContext(SkillLevelContext);
  if (context === undefined) {
    throw new Error('useSkillLevel must be used within a SkillLevelProvider');
  }
  return context;
}

export default SkillLevelContext;
