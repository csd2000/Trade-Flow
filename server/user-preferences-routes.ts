import { Router, Request, Response } from 'express';
import { db } from './db';
import { userPreferences, userProgress, strategyModules } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Unlock requirements
const UNLOCK_REQUIREMENTS = {
  modulesRequired: 10,
  hoursRequired: 5,
  strategiesRequired: 3,
};

// Get user preferences by session ID
router.get('/preferences/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.sessionId, sessionId))
      .limit(1);

    if (!prefs) {
      return res.json({ exists: false, preferences: null });
    }

    return res.json({ exists: true, preferences: prefs });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Create or update user preferences
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const { sessionId, userId, skillLevel, hasSeenOnboarding, dismissedAdvancedWarnings } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Check if preferences already exist
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.sessionId, sessionId))
      .limit(1);

    if (existing) {
      // Update existing preferences
      const [updated] = await db
        .update(userPreferences)
        .set({
          skillLevel: skillLevel ?? existing.skillLevel,
          userId: userId ?? existing.userId,
          hasSeenOnboarding: hasSeenOnboarding ?? existing.hasSeenOnboarding,
          dismissedAdvancedWarnings: dismissedAdvancedWarnings ?? existing.dismissedAdvancedWarnings,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.sessionId, sessionId))
        .returning();

      return res.json({ success: true, preferences: updated });
    } else {
      // Create new preferences
      const [created] = await db
        .insert(userPreferences)
        .values({
          sessionId,
          userId: userId ?? null,
          skillLevel: skillLevel ?? 'beginner',
          hasSeenOnboarding: hasSeenOnboarding ?? false,
          dismissedAdvancedWarnings: dismissedAdvancedWarnings ?? false,
        })
        .returning();

      return res.json({ success: true, preferences: created });
    }
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Get unlock progress for a session
router.get('/unlock-progress/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Get user preferences
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.sessionId, sessionId))
      .limit(1);

    if (!prefs) {
      return res.json({
        modulesCompleted: 0,
        hoursSpent: 0,
        strategiesCompleted: 0,
        isUnlocked: false,
        requirements: UNLOCK_REQUIREMENTS,
        progress: {
          modules: 0,
          hours: 0,
          strategies: 0,
        },
      });
    }

    const modulesCompleted = prefs.modulesCompletedForUnlock ?? 0;
    const hoursSpent = parseFloat(prefs.hoursSpentForUnlock?.toString() ?? '0');
    const strategiesCompleted = prefs.strategiesCompletedForUnlock ?? 0;

    // Check if any requirement is met
    const isUnlocked =
      prefs.experiencedUnlockedAt !== null ||
      modulesCompleted >= UNLOCK_REQUIREMENTS.modulesRequired ||
      hoursSpent >= UNLOCK_REQUIREMENTS.hoursRequired ||
      strategiesCompleted >= UNLOCK_REQUIREMENTS.strategiesRequired;

    return res.json({
      modulesCompleted,
      hoursSpent,
      strategiesCompleted,
      isUnlocked,
      requirements: UNLOCK_REQUIREMENTS,
      progress: {
        modules: Math.min(100, (modulesCompleted / UNLOCK_REQUIREMENTS.modulesRequired) * 100),
        hours: Math.min(100, (hoursSpent / UNLOCK_REQUIREMENTS.hoursRequired) * 100),
        strategies: Math.min(100, (strategiesCompleted / UNLOCK_REQUIREMENTS.strategiesRequired) * 100),
      },
    });
  } catch (error) {
    console.error('Error fetching unlock progress:', error);
    return res.status(500).json({ error: 'Failed to fetch unlock progress' });
  }
});

// Update progress when user completes a module
router.post('/track-progress', async (req: Request, res: Response) => {
  try {
    const { sessionId, modulesCompleted, hoursSpent, strategiesCompleted } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Get existing preferences
    const [existing] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.sessionId, sessionId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    const newModulesCompleted = modulesCompleted ?? existing.modulesCompletedForUnlock ?? 0;
    const newHoursSpent = hoursSpent ?? parseFloat(existing.hoursSpentForUnlock?.toString() ?? '0');
    const newStrategiesCompleted = strategiesCompleted ?? existing.strategiesCompletedForUnlock ?? 0;

    // Check if should unlock experienced mode
    const shouldUnlock =
      existing.experiencedUnlockedAt === null &&
      (newModulesCompleted >= UNLOCK_REQUIREMENTS.modulesRequired ||
       newHoursSpent >= UNLOCK_REQUIREMENTS.hoursRequired ||
       newStrategiesCompleted >= UNLOCK_REQUIREMENTS.strategiesRequired);

    const [updated] = await db
      .update(userPreferences)
      .set({
        modulesCompletedForUnlock: newModulesCompleted,
        hoursSpentForUnlock: newHoursSpent.toString(),
        strategiesCompletedForUnlock: newStrategiesCompleted,
        experiencedUnlockedAt: shouldUnlock ? new Date() : existing.experiencedUnlockedAt,
        skillLevel: shouldUnlock && existing.skillLevel === 'beginner' ? 'experienced' : existing.skillLevel,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.sessionId, sessionId))
      .returning();

    return res.json({
      success: true,
      preferences: updated,
      justUnlocked: shouldUnlock,
    });
  } catch (error) {
    console.error('Error tracking progress:', error);
    return res.status(500).json({ error: 'Failed to track progress' });
  }
});

// Manually unlock experienced mode (for users who self-identify as experienced)
router.post('/unlock-experienced/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const [updated] = await db
      .update(userPreferences)
      .set({
        skillLevel: 'experienced',
        experiencedUnlockedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.sessionId, sessionId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    return res.json({ success: true, preferences: updated });
  } catch (error) {
    console.error('Error unlocking experienced mode:', error);
    return res.status(500).json({ error: 'Failed to unlock experienced mode' });
  }
});

// Get unlock milestones for display
router.get('/milestones', async (_req: Request, res: Response) => {
  return res.json({
    milestones: [
      {
        id: 'first-module',
        title: 'Complete your first module',
        requirement: 1,
        type: 'modules',
      },
      {
        id: 'five-modules',
        title: 'Complete 5 modules',
        requirement: 5,
        type: 'modules',
      },
      {
        id: 'first-strategy',
        title: 'Complete a full strategy',
        requirement: 1,
        type: 'strategies',
      },
      {
        id: 'three-hours',
        title: 'Spend 3 hours learning',
        requirement: 3,
        type: 'hours',
      },
      {
        id: 'unlock-experienced',
        title: 'Unlock Experienced Mode!',
        requirement: 'any',
        type: 'unlock',
        description: 'Complete 10 modules, 5 hours, or 3 strategies',
      },
    ],
    requirements: UNLOCK_REQUIREMENTS,
  });
});

export default router;
