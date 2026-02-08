import { Router } from 'express';
import { db } from './db';
import { userRiskProfiles, enhancedTrainingStrategies } from '@shared/schema';
import { eq } from 'drizzle-orm';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function contentToString(content: any[]): string {
  const textBlocks = content.filter(block => block.type === 'text');
  return textBlocks.length > 0 ? textBlocks.map(block => block.text).join('\n') : '';
}

function calculateRiskScore(profile: {
  experienceLevel: string;
  riskTolerance: string;
  investmentHorizon: string;
  capitalAmount: string;
  timeCommitment: string;
  maxDrawdownTolerance?: number;
}): number {
  let score = 50;
  
  const expScores: Record<string, number> = {
    beginner: -15,
    intermediate: 0,
    advanced: 10,
    professional: 20
  };
  score += expScores[profile.experienceLevel] || 0;
  
  const riskScores: Record<string, number> = {
    conservative: -20,
    moderate: 0,
    aggressive: 15,
    very_aggressive: 25
  };
  score += riskScores[profile.riskTolerance] || 0;
  
  const horizonScores: Record<string, number> = {
    day_trading: 15,
    swing_trading: 5,
    position_trading: -5,
    long_term: -15
  };
  score += horizonScores[profile.investmentHorizon] || 0;
  
  const capitalScores: Record<string, number> = {
    under_1k: -10,
    '1k_10k': -5,
    '10k_50k': 0,
    '50k_100k': 5,
    over_100k: 10
  };
  score += capitalScores[profile.capitalAmount] || 0;
  
  if (profile.maxDrawdownTolerance) {
    if (profile.maxDrawdownTolerance >= 30) score += 10;
    else if (profile.maxDrawdownTolerance >= 20) score += 5;
    else if (profile.maxDrawdownTolerance <= 10) score -= 10;
  }
  
  return Math.max(1, Math.min(100, score));
}

function generateFallbackRecommendations(profile: any, strategies: any[]): any {
  const riskScore = profile.riskScore || 50;
  
  const riskMapping: Record<string, string[]> = {
    conservative: ['Low'],
    moderate: ['Low', 'Medium'],
    aggressive: ['Medium', 'High'],
    very_aggressive: ['High']
  };
  
  const horizonMapping: Record<string, string[]> = {
    day_trading: ['Day', 'Alpha'],
    swing_trading: ['Swing', 'Day', 'Alpha'],
    position_trading: ['Swing', 'DeFi'],
    long_term: ['DeFi', 'Education']
  };
  
  const allowedRisks = riskMapping[profile.riskTolerance] || ['Low', 'Medium'];
  const preferredCategories = horizonMapping[profile.investmentHorizon] || ['Swing', 'Day'];
  
  let scored = strategies.map(s => {
    let score = 50;
    
    if (allowedRisks.includes(s.risk)) score += 20;
    if (preferredCategories.includes(s.category)) score += 15;
    
    if (profile.preferredMarkets?.length > 0) {
      const tags = s.tags || [];
      const marketMatch = profile.preferredMarkets.some((m: string) => 
        tags.some((t: string) => t.toLowerCase().includes(m.toLowerCase()))
      );
      if (marketMatch) score += 10;
    }
    
    if (profile.experienceLevel === 'beginner' && s.category === 'Education') score += 15;
    if (profile.experienceLevel === 'advanced' && s.category === 'Alpha') score += 10;
    
    return { ...s, matchScore: Math.min(98, score) };
  });
  
  scored.sort((a, b) => b.matchScore - a.matchScore);
  const top5 = scored.slice(0, 5);
  
  return {
    recommendations: top5.map((s, idx) => ({
      slug: s.slug,
      matchScore: s.matchScore,
      reason: `This ${s.category} strategy with ${s.risk} risk level aligns well with your ${profile.riskTolerance} risk tolerance and ${profile.investmentHorizon.replace('_', ' ')} style.`,
      keyBenefits: [
        `Suited for ${s.risk.toLowerCase()} risk traders`,
        `${s.category} category matches your goals`,
        `Designed for ${profile.timeCommitment.replace('_', ' ')} time commitment`
      ],
      warnings: s.risk === 'High' ? ['Higher risk - start with paper trading'] : [],
      estimatedTimeToLearn: s.category === 'Education' ? '1-2 weeks' : '2-4 weeks',
      suggestedStartingCapital: profile.capitalAmount === 'under_1k' ? '$500' : '$1,000+'
    })),
    overallAdvice: `Based on your ${profile.experienceLevel} experience level and ${profile.riskTolerance} risk tolerance, we've matched you with strategies that fit your ${profile.investmentHorizon.replace('_', ' ')} approach. Focus on mastering one strategy before expanding.`,
    riskAssessment: `Your risk score of ${riskScore}/100 suggests a ${riskScore < 40 ? 'conservative' : riskScore < 60 ? 'balanced' : 'growth-oriented'} approach. Always use proper position sizing and never risk more than 2% per trade.`
  };
}

async function generateAIRecommendations(profile: any, strategies: any[]): Promise<any> {
  const strategyList = strategies.map(s => ({
    slug: s.slug,
    title: s.title,
    category: s.category,
    risk: s.risk,
    summary: s.summary
  }));
  
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('No Anthropic API key, using fallback recommendations');
    return generateFallbackRecommendations(profile, strategies);
  }
  
  const prompt = `You are an expert trading strategy advisor. Based on the user's risk profile, recommend the most suitable trading strategies.

USER RISK PROFILE:
- Experience Level: ${profile.experienceLevel}
- Risk Tolerance: ${profile.riskTolerance}
- Investment Horizon: ${profile.investmentHorizon}
- Available Capital: ${profile.capitalAmount}
- Time Commitment: ${profile.timeCommitment}
- Primary Goal: ${profile.primaryGoal}
- Preferred Markets: ${profile.preferredMarkets?.join(', ') || 'All'}
- Max Drawdown Tolerance: ${profile.maxDrawdownTolerance || 20}%
- Monthly Return Target: ${profile.monthlyReturnTarget || 10}%
- Risk Score: ${profile.riskScore}/100

AVAILABLE STRATEGIES:
${JSON.stringify(strategyList, null, 2)}

Please provide exactly 5 strategy recommendations in the following JSON format:
{
  "recommendations": [
    {
      "slug": "strategy-slug-from-list",
      "matchScore": 95,
      "reason": "Brief explanation why this strategy matches their profile",
      "keyBenefits": ["benefit1", "benefit2", "benefit3"],
      "warnings": ["Any relevant warnings or considerations"],
      "estimatedTimeToLearn": "2-4 weeks",
      "suggestedStartingCapital": "$1,000"
    }
  ],
  "overallAdvice": "A 2-3 sentence personalized message about their trading journey based on their profile",
  "riskAssessment": "Brief assessment of their risk profile and what they should be aware of"
}

Only recommend strategies from the provided list. Match the slug exactly. Order by match score descending.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const text = contentToString(response.content);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    console.log('AI response did not contain valid JSON, using fallback');
    return generateFallbackRecommendations(profile, strategies);
  } catch (error) {
    console.error('AI recommendation error, using fallback:', error);
    return generateFallbackRecommendations(profile, strategies);
  }
}

router.post('/profile', async (req, res) => {
  try {
    const {
      sessionId,
      experienceLevel,
      riskTolerance,
      investmentHorizon,
      capitalAmount,
      timeCommitment,
      primaryGoal,
      preferredMarkets,
      maxDrawdownTolerance,
      monthlyReturnTarget
    } = req.body;
    
    if (!sessionId || !experienceLevel || !riskTolerance || !investmentHorizon || !capitalAmount || !timeCommitment || !primaryGoal) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const riskScore = calculateRiskScore({
      experienceLevel,
      riskTolerance,
      investmentHorizon,
      capitalAmount,
      timeCommitment,
      maxDrawdownTolerance
    });
    
    const strategies = await db
      .select()
      .from(enhancedTrainingStrategies)
      .where(eq(enhancedTrainingStrategies.isActive, true));
    
    const [existing] = await db
      .select()
      .from(userRiskProfiles)
      .where(eq(userRiskProfiles.sessionId, sessionId));
    
    const profileData = {
      experienceLevel,
      riskTolerance,
      investmentHorizon,
      capitalAmount,
      timeCommitment,
      primaryGoal,
      preferredMarkets,
      maxDrawdownTolerance,
      monthlyReturnTarget,
      riskScore
    };
    
    const aiRecommendations = await generateAIRecommendations({
      ...profileData,
      riskScore
    }, strategies);
    
    let profile;
    if (existing) {
      [profile] = await db
        .update(userRiskProfiles)
        .set({
          ...profileData,
          aiRecommendations,
          updatedAt: new Date()
        })
        .where(eq(userRiskProfiles.sessionId, sessionId))
        .returning();
    } else {
      [profile] = await db
        .insert(userRiskProfiles)
        .values({
          sessionId,
          ...profileData,
          aiRecommendations
        })
        .returning();
    }
    
    res.json({
      success: true,
      profile,
      recommendations: aiRecommendations
    });
  } catch (error) {
    console.error('Error saving risk profile:', error);
    res.status(500).json({ error: 'Failed to save risk profile' });
  }
});

router.get('/profile/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [profile] = await db
      .select()
      .from(userRiskProfiles)
      .where(eq(userRiskProfiles.sessionId, sessionId));
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching risk profile:', error);
    res.status(500).json({ error: 'Failed to fetch risk profile' });
  }
});

router.post('/refresh-recommendations/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [profile] = await db
      .select()
      .from(userRiskProfiles)
      .where(eq(userRiskProfiles.sessionId, sessionId));
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const strategies = await db
      .select()
      .from(enhancedTrainingStrategies)
      .where(eq(enhancedTrainingStrategies.isActive, true));
    
    const aiRecommendations = await generateAIRecommendations(profile, strategies);
    
    await db
      .update(userRiskProfiles)
      .set({
        aiRecommendations,
        updatedAt: new Date()
      })
      .where(eq(userRiskProfiles.sessionId, sessionId));
    
    res.json({
      success: true,
      recommendations: aiRecommendations
    });
  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    res.status(500).json({ error: 'Failed to refresh recommendations' });
  }
});

router.get('/strategies', async (req, res) => {
  try {
    const strategies = await db
      .select({
        id: enhancedTrainingStrategies.id,
        slug: enhancedTrainingStrategies.slug,
        title: enhancedTrainingStrategies.title,
        summary: enhancedTrainingStrategies.summary,
        category: enhancedTrainingStrategies.category,
        risk: enhancedTrainingStrategies.risk,
        roiRange: enhancedTrainingStrategies.roiRange,
        tags: enhancedTrainingStrategies.tags
      })
      .from(enhancedTrainingStrategies)
      .where(eq(enhancedTrainingStrategies.isActive, true));
    
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
});

router.post('/quick-match', async (req, res) => {
  try {
    const { riskLevel, timeAvailable, experience, goal } = req.body;
    
    const strategies = await db
      .select()
      .from(enhancedTrainingStrategies)
      .where(eq(enhancedTrainingStrategies.isActive, true));
    
    let filtered = strategies;
    
    if (riskLevel) {
      const riskMap: Record<string, string[]> = {
        low: ['Low'],
        medium: ['Low', 'Medium'],
        high: ['Medium', 'High']
      };
      const allowedRisks = riskMap[riskLevel] || ['Low', 'Medium', 'High'];
      filtered = filtered.filter(s => allowedRisks.includes(s.risk));
    }
    
    if (timeAvailable) {
      const categoryMap: Record<string, string[]> = {
        minimal: ['DeFi', 'Swing', 'Education'],
        moderate: ['DeFi', 'Swing', 'Day', 'Education'],
        extensive: ['Day', 'Swing', 'Alpha', 'DeFi', 'Education']
      };
      const allowedCategories = categoryMap[timeAvailable] || [];
      if (allowedCategories.length > 0) {
        filtered = filtered.filter(s => allowedCategories.includes(s.category));
      }
    }
    
    const top5 = filtered.slice(0, 5).map(s => ({
      slug: s.slug,
      title: s.title,
      category: s.category,
      risk: s.risk,
      summary: s.summary,
      trainingUrl: `/training/${s.slug}`
    }));
    
    res.json({
      matches: top5,
      totalMatches: filtered.length
    });
  } catch (error) {
    console.error('Error in quick match:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

export default router;
