import { Router } from 'express';
import { db } from './db';
import { enhancedTrainingStrategies, enhancedTrainingModules } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { candleCheatsheetStrategy, candleCheatsheetModules } from './candle-cheatsheet-data';

const router = Router();

// Complete training API routes that work with the enhanced database
export function registerTrainingApiRoutes(app: any) {
  
  // Get training module by strategy slug and module slug - uses enhanced tables
  app.get('/api/training/:strategySlug/:moduleSlug', async (req: any, res: any) => {
    try {
      const { strategySlug, moduleSlug } = req.params;
      console.log(`📚 Enhanced Training API request: ${strategySlug}/${moduleSlug}`);
      
      // First, find the strategy by slug
      const [strategy] = await db
        .select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, strategySlug));
      
      if (!strategy) {
        console.log(`❌ Strategy not found: ${strategySlug}`);
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      // Extract module number from slug (e.g., "ai-profit-module-1" -> 1)
      const moduleNumberMatch = moduleSlug.match(/module[-_]?(\d+)$/);
      const moduleNumber = moduleNumberMatch ? parseInt(moduleNumberMatch[1], 10) : null;
      
      if (!moduleNumber) {
        console.log(`❌ Invalid module slug format: ${moduleSlug}`);
        return res.status(400).json({ error: 'Invalid module slug format' });
      }
      
      // Get the module from enhanced_training_modules
      const [module] = await db
        .select()
        .from(enhancedTrainingModules)
        .where(and(
          eq(enhancedTrainingModules.strategyId, strategy.id),
          eq(enhancedTrainingModules.moduleNumber, moduleNumber)
        ));
      
      if (module) {
        console.log(`✅ Found module in enhanced database: ${module.title}`);
        
        // Get all modules for this strategy to determine previous/next
        const allModules = await db
          .select()
          .from(enhancedTrainingModules)
          .where(eq(enhancedTrainingModules.strategyId, strategy.id))
          .orderBy(enhancedTrainingModules.orderIndex);
        
        const currentIndex = allModules.findIndex(m => m.id === module.id);
        const previous = currentIndex > 0 ? allModules[currentIndex - 1] : null;
        const next = currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;
        
        res.json({
          id: module.id,
          slug: `${strategySlug}-module-${module.moduleNumber}`,
          track: strategySlug,
          order: module.orderIndex,
          of: allModules.length,
          title: module.title,
          duration: module.duration,
          overview: module.description || '',
          prerequisites: [],
          steps: module.content ? (module.content as any).sections || [] : [],
          notes_prompt: '',
          resources: {
            video: module.videoUrl || '',
            pdf: '',
            community: '',
            tools: []
          },
          additional_resources: [],
          previous: previous ? `${strategySlug}-module-${previous.moduleNumber}` : null,
          next: next ? `${strategySlug}-module-${next.moduleNumber}` : null
        });
        return;
      }
      
      console.log(`❌ Module not found for strategy ${strategySlug}, module number ${moduleNumber}`);
      res.status(404).json({ error: 'Training module not found' });
      
    } catch (error) {
      console.error('❌ Training API error:', error);
      res.status(500).json({ error: 'Failed to fetch training module' });
    }
  });
  
  // Get all modules for a strategy
  app.get('/api/training/:strategySlug/modules', async (req: any, res: any) => {
    try {
      const { strategySlug } = req.params;
      
      // Find strategy first
      const [strategy] = await db
        .select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, strategySlug));
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      const modules = await db
        .select({
          moduleNumber: enhancedTrainingModules.moduleNumber,
          title: enhancedTrainingModules.title,
          duration: enhancedTrainingModules.duration,
          order: enhancedTrainingModules.orderIndex,
          description: enhancedTrainingModules.description
        })
        .from(enhancedTrainingModules)
        .where(eq(enhancedTrainingModules.strategyId, strategy.id))
        .orderBy(enhancedTrainingModules.orderIndex);
      
      if (modules.length === 0) {
        return res.status(404).json({ error: 'No modules found for this strategy' });
      }
      
      res.json(modules.map(m => ({
        slug: `${strategySlug}-module-${m.moduleNumber}`,
        title: m.title,
        duration: m.duration,
        order: m.order,
        of: modules.length,
        overview: m.description
      })));
      
    } catch (error) {
      console.error('Error fetching training modules:', error);
      res.status(500).json({ error: 'Failed to fetch training modules' });
    }
  });
  
  // Get strategy information
  app.get('/api/training/:strategySlug', async (req: any, res: any) => {
    try {
      const { strategySlug } = req.params;
      
      // Skip if URL ends with module slug pattern
      if (req.url.includes('modules') || req.url.includes('-module-')) {
        return;
      }
      
      const [strategy] = await db
        .select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, strategySlug));
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      const modules = await db
        .select({
          moduleNumber: enhancedTrainingModules.moduleNumber,
          title: enhancedTrainingModules.title,
          duration: enhancedTrainingModules.duration,
          order: enhancedTrainingModules.orderIndex
        })
        .from(enhancedTrainingModules)
        .where(eq(enhancedTrainingModules.strategyId, strategy.id))
        .orderBy(enhancedTrainingModules.orderIndex);
      
      res.json({
        track_id: strategy.slug,
        title: strategy.title,
        total_modules: modules.length,
        modules: modules.map(m => ({
          slug: `${strategySlug}-module-${m.moduleNumber}`,
          title: m.title,
          duration: m.duration,
          order: m.order
        }))
      });
      
    } catch (error) {
      console.error('Error fetching strategy info:', error);
      res.status(500).json({ error: 'Failed to fetch strategy information' });
    }
  });
  
  // Strategy route moved to enhanced-routes.ts to avoid conflicts
  
  // Seed Candle Cheat Sheet Training
  app.post('/api/admin/seed-candle-cheatsheet', async (req: any, res: any) => {
    try {
      console.log('🕯️ Seeding Candle Cheat Sheet training...');
      
      // Check if strategy already exists
      const [existing] = await db
        .select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, candleCheatsheetStrategy.slug));
      
      let strategyId: number;
      
      if (existing) {
        strategyId = existing.id;
        console.log(`✅ Strategy already exists with ID ${strategyId}`);
      } else {
        // Insert strategy
        const [newStrategy] = await db
          .insert(enhancedTrainingStrategies)
          .values(candleCheatsheetStrategy)
          .returning({ id: enhancedTrainingStrategies.id });
        strategyId = newStrategy.id;
        console.log(`✅ Created strategy with ID ${strategyId}`);
      }
      
      // Delete existing modules for this strategy
      await db
        .delete(enhancedTrainingModules)
        .where(eq(enhancedTrainingModules.strategyId, strategyId));
      
      // Insert all modules
      for (const module of candleCheatsheetModules) {
        await db
          .insert(enhancedTrainingModules)
          .values({
            strategyId,
            moduleNumber: module.moduleNumber,
            title: module.title,
            description: module.description,
            content: module.content,
            duration: module.duration,
            durationMinutes: module.durationMinutes,
            orderIndex: module.orderIndex,
            isRequired: true
          });
      }
      
      console.log(`✅ Seeded ${candleCheatsheetModules.length} modules for Candle Cheat Sheet`);
      
      res.json({
        success: true,
        strategyId,
        modulesSeeded: candleCheatsheetModules.length,
        trainingUrl: `/training/${candleCheatsheetStrategy.slug}`
      });
    } catch (error) {
      console.error('❌ Error seeding candle cheatsheet:', error);
      res.status(500).json({ error: 'Failed to seed candle cheatsheet' });
    }
  });
  
  console.log('✅ Training API routes registered successfully');
}

export default router;