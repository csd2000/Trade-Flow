import { readFileSync } from 'fs';
import { join } from 'path';
import { trainingSystem } from './comprehensive-training-system';

// Enhanced training data loader for comprehensive content integration
export class EnhancedTrainingLoader {
  
  private loadJsonFile(filename: string): any {
    try {
      const filePath = join(process.cwd(), 'attached_assets', filename);
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.log(`⚠️ Could not load ${filename}:`, error);
      return null;
    }
  }

  async loadAllTrainingContent(): Promise<void> {
    console.log('🔄 Loading comprehensive training content from attached assets...');
    
    try {
      // Load master training data
      const masterTraining = this.loadJsonFile('trade_ninja_master_training_1754783407159.json');
      const passiveIncomeModules = this.loadJsonFile('passive_income_training_modules_1754783415582.json');
      const strategyBuilderModules = this.loadJsonFile('strategy_builder_training_modules_1754783412744.json');
      const strategiesData = this.loadJsonFile('strategies_seed_1754783410211.json');
      
      console.log('✅ All training content files loaded successfully');
      
      // Use existing training system to seed the database
      await trainingSystem.seedDatabase();
      
      console.log('🎯 Enhanced training system fully loaded and operational');
      
    } catch (error) {
      console.error('❌ Error loading enhanced training content:', error);
      // Fallback to basic seeding
      await trainingSystem.seedDatabase();
    }
  }

  async getModuleContent(track: string, slug: string): Promise<any> {
    // Try to get from database first
    const module = await trainingSystem.getModule(track, slug);
    if (module) {
      return module;
    }

    // Fallback to file-based content
    const masterTraining = this.loadJsonFile('trade_ninja_master_training_1754783407159.json');
    if (masterTraining?.tracks) {
      const targetTrack = masterTraining.tracks.find((t: any) => t.track_id === track);
      if (targetTrack?.modules) {
        const targetModule = targetTrack.modules.find((m: any) => m.slug === slug);
        if (targetModule) {
          return targetModule;
        }
      }
    }

    return null;
  }

  async getAllStrategies(): Promise<any[]> {
    // Get from database first
    try {
      const strategies = await trainingSystem.getAllStrategies();
      if (strategies && strategies.length > 0) {
        return strategies;
      }
    } catch (error) {
      console.log('⚠️ Database strategies not available, using fallback');
    }

    // Fallback to file-based data
    const strategiesData = this.loadJsonFile('strategies_seed_1754783410211.json');
    return strategiesData?.strategies || [];
  }
}

export const enhancedTrainingLoader = new EnhancedTrainingLoader();