import { db } from './db';
import { enhancedTrainingModules, enhancedTrainingStrategies } from '../shared/schema';
import { ENHANCED_STRATEGY_MODULES } from './enhanced-strategy-techniques';
import { eq, and } from 'drizzle-orm';

interface EnhancedModule {
  slug: string;
  order: number;
  of: number;
  title: string;
  duration: string;
  overview: string;
  prerequisites: string[];
  steps: string[];
}

const enhancedStrategyTechniques = Object.entries(ENHANCED_STRATEGY_MODULES).map(([key, value]) => ({
  slug: value.track_id,
  name: value.title,
  description: value.description,
  modules: value.modules
}));

export async function syncEnhancedContentToDatabase() {
  console.log('🔄 Syncing enhanced training content to database...');
  
  try {
    for (const strategy of enhancedStrategyTechniques) {
      const existingStrategy = await db.select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, strategy.slug))
        .limit(1);
      
      if (existingStrategy.length === 0) {
        console.log(`⚠️ Strategy not found in database: ${strategy.slug}`);
        continue;
      }
      
      const strategyId = existingStrategy[0].id;
      
      for (const module of strategy.modules) {
        const richContent = {
          overview: module.overview,
          prerequisites: module.prerequisites,
          steps: module.steps,
          keyTechniques: module.steps.slice(0, 3),
          practicalApplication: module.steps.slice(3),
          estimatedDuration: module.duration
        };
        
        const existingModule = await db.select()
          .from(enhancedTrainingModules)
          .where(
            and(
              eq(enhancedTrainingModules.strategyId, strategyId),
              eq(enhancedTrainingModules.orderIndex, module.order)
            )
          )
          .limit(1);
        
        if (existingModule.length > 0) {
          await db.update(enhancedTrainingModules)
            .set({
              title: module.title,
              content: richContent,
              description: module.overview.substring(0, 255)
            })
            .where(
              and(
                eq(enhancedTrainingModules.strategyId, strategyId),
                eq(enhancedTrainingModules.orderIndex, module.order)
              )
            );
          console.log(`✅ Updated module ${module.order}/${module.of} for ${strategy.slug}: ${module.title}`);
        } else {
          await db.insert(enhancedTrainingModules).values({
            strategyId,
            moduleNumber: module.order,
            title: module.title,
            description: module.overview.substring(0, 255),
            content: richContent,
            duration: module.duration,
            durationMinutes: parseInt(module.duration) || 25,
            isRequired: true,
            orderIndex: module.order
          });
          console.log(`✨ Inserted new module ${module.order}/${module.of} for ${strategy.slug}: ${module.title}`);
        }
      }
    }
    
    console.log('🎉 Enhanced content sync completed!');
    return { success: true, strategiesUpdated: enhancedStrategyTechniques.length };
  } catch (error) {
    console.error('❌ Error syncing enhanced content:', error);
    throw error;
  }
}

export async function seedEnhancedStrategiesFromScratch() {
  console.log('🌱 Seeding enhanced strategies with detailed techniques...');
  
  try {
    for (const strategy of enhancedStrategyTechniques) {
      const existingStrategy = await db.select()
        .from(enhancedTrainingStrategies)
        .where(eq(enhancedTrainingStrategies.slug, strategy.slug))
        .limit(1);
      
      let strategyId: number;
      
      if (existingStrategy.length > 0) {
        strategyId = existingStrategy[0].id;
        console.log(`📝 Found existing strategy: ${strategy.slug} (ID: ${strategyId})`);
        
        await db.delete(enhancedTrainingModules)
          .where(eq(enhancedTrainingModules.strategyId, strategyId));
      } else {
        const [newStrategy] = await db.insert(enhancedTrainingStrategies)
          .values({
            slug: strategy.slug,
            title: strategy.name,
            summary: strategy.description,
            category: 'trading',
            risk: 'medium',
            roiRange: '10-50%',
            tags: ['trading', 'strategies'],
            trainingUrl: `/training/${strategy.slug}`,
            isActive: true
          })
          .returning();
        
        strategyId = newStrategy.id;
        console.log(`✨ Created new strategy: ${strategy.slug} (ID: ${strategyId})`);
      }
      
      const moduleInserts = strategy.modules.map((module: EnhancedModule) => ({
        strategyId,
        moduleNumber: module.order,
        title: module.title,
        description: module.overview.substring(0, 255),
        content: {
          overview: module.overview,
          prerequisites: module.prerequisites,
          steps: module.steps,
          keyTechniques: module.steps.slice(0, 3),
          practicalApplication: module.steps.slice(3)
        },
        duration: module.duration,
        durationMinutes: parseInt(module.duration) || 25,
        isRequired: true,
        orderIndex: module.order
      }));
      
      await db.insert(enhancedTrainingModules).values(moduleInserts);
      console.log(`✅ Inserted ${moduleInserts.length} modules for ${strategy.name}`);
    }
    
    console.log('🎉 Enhanced strategies seeding completed!');
    return { success: true, strategiesSeeded: enhancedStrategyTechniques.length };
  } catch (error) {
    console.error('❌ Error seeding enhanced strategies:', error);
    throw error;
  }
}
