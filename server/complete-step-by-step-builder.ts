// Complete Step-by-Step Builder for All 24 Trading Strategies
// Ensures every single module has detailed step-by-step instructions

import { db } from './db';
import { trainingTracks, trainingModules } from '@shared/schema';
import { StepByStepGenerator } from './enhanced-step-by-step-generator';

// All 24 strategy definitions with their focus areas
export const ALL_24_STRATEGIES = [
  {
    id: 'passive-income-training',
    title: 'Passive Income Training',
    category: 'DeFi',
    focus: 'yield farming, liquidity provision, automated income generation'
  },
  {
    id: 'oliver-velez-techniques',
    title: 'Oliver Velez Trading Techniques',
    category: 'Day Trading',
    focus: 'swing trading, market timing, institutional patterns'
  },
  {
    id: 'defi-strategist-elite',
    title: 'DeFi Strategist Elite',
    category: 'DeFi',
    focus: 'advanced protocols, cross-chain strategies, yield optimization'
  },
  {
    id: 'mindful-study-education',
    title: 'Mindful Study & Education System',
    category: 'Education',
    focus: 'learning methodology, psychology, disciplined approach'
  },
  {
    id: 'all-trading-strategies-unified',
    title: 'ALL Trading Strategies — Unified',
    category: 'Comprehensive',
    focus: 'integrated approach, multi-strategy implementation'
  },
  {
    id: 'fc-intelligent-decision-strategy',
    title: 'F&C Intelligent Decision Strategy',
    category: 'Analysis',
    focus: 'data-driven decisions, risk assessment, systematic analysis'
  },
  {
    id: 'trading-freedom-group',
    title: 'Trading Freedom Group',
    category: 'Community',
    focus: 'group trading, shared strategies, collaborative learning'
  },
  {
    id: 'live-crypto-cashflow-challenge',
    title: 'LIVE Crypto Cashflow Challenge',
    category: 'Crypto',
    focus: 'live trading, cashflow generation, crypto markets'
  },
  {
    id: 'consolidated-crypto-hub',
    title: 'Consolidated Crypto Hub',
    category: 'Crypto',
    focus: 'centralized crypto management, portfolio optimization'
  },
  {
    id: 'protocol-analysis-selection',
    title: 'Protocol Analysis & Selection',
    category: 'DeFi',
    focus: 'protocol evaluation, due diligence, selection criteria'
  },
  {
    id: 'strategy-builder-platform',
    title: 'Strategy Builder Platform',
    category: 'Development',
    focus: 'custom strategy creation, backtesting, optimization'
  },
  {
    id: 'advanced-portfolio-management',
    title: 'Advanced Portfolio Management',
    category: 'Portfolio',
    focus: 'allocation strategies, rebalancing, risk management'
  },
  {
    id: 'profit-taking-mastery',
    title: 'Profit Taking Mastery',
    category: 'Exit Strategy',
    focus: 'exit timing, profit optimization, psychological discipline'
  },
  {
    id: 'exit-strategy-optimization',
    title: 'Exit Strategy Optimization',
    category: 'Exit Strategy',
    focus: 'systematic exits, loss minimization, profit maximization'
  },
  {
    id: 'learn-defi-fundamentals',
    title: 'Learn DeFi Fundamentals',
    category: 'Education',
    focus: 'DeFi basics, protocol understanding, foundational knowledge'
  },
  {
    id: 'stablecoin-strategies-guide',
    title: 'Stablecoin Strategies Guide',
    category: 'Stablecoin',
    focus: 'stable asset strategies, low-risk yields, capital preservation'
  },
  {
    id: 'robin-hood-trading-system',
    title: 'Robin Hood Trading System',
    category: 'Equity Trading',
    focus: 'commission-free trading, retail strategies, mobile trading'
  },
  {
    id: 'defi-safety-security-system',
    title: 'DeFi Safety & Security System',
    category: 'Security',
    focus: 'protocol security, wallet safety, risk mitigation'
  },
  {
    id: 'crypto-project-discovery',
    title: 'Crypto Project Discovery',
    category: 'Research',
    focus: 'project evaluation, early-stage identification, due diligence'
  },
  {
    id: 'advanced-yield-pool-strategies',
    title: 'Advanced Yield Pool Strategies',
    category: 'DeFi',
    focus: 'complex yield farming, multi-pool strategies, optimization'
  },
  {
    id: '30-second-trader-system',
    title: '30-Second Trader System',
    category: 'Scalping',
    focus: 'ultra-short term trading, quick execution, rapid decisions'
  },
  {
    id: 'warrior-trading-methodology',
    title: 'Warrior Trading Methodology',
    category: 'Day Trading',
    focus: 'aggressive trading, momentum strategies, high-frequency'
  },
  {
    id: 'nancy-pelosi-strategy',
    title: 'Nancy Pelosi Strategy',
    category: 'Political Trading',
    focus: 'political insights, regulatory trading, congress tracking'
  },
  {
    id: 'economic-calendar-trading',
    title: 'Economic Calendar Trading',
    category: 'News Trading',
    focus: 'economic events, news-based trading, fundamental analysis'
  }
];

export class CompleteStepByStepBuilder {

  // Build comprehensive step-by-step content for all 192 modules
  async buildAllStepByStepContent(): Promise<{
    strategiesProcessed: number;
    modulesEnhanced: number;
    totalSteps: number;
    report: string;
  }> {
    console.log('🔨 Building comprehensive step-by-step content for all 24 strategies...');
    
    let strategiesProcessed = 0;
    let modulesEnhanced = 0;
    let totalSteps = 0;
    const reportLines: string[] = [];

    for (const strategy of ALL_24_STRATEGIES) {
      console.log(`📚 Processing strategy: ${strategy.title}`);
      reportLines.push(`\n=== ${strategy.title.toUpperCase()} ===`);
      
      // Get or create modules for this strategy
      let modules = await db.select()
        .from(trainingModules)
        .where({ trackId: strategy.id })
        .orderBy('orderIndex');

      // If no modules exist, create them
      if (modules.length === 0) {
        modules = await this.createModulesForStrategy(strategy);
      }

      // Enhance each module with detailed step-by-step instructions
      for (let i = 0; i < 8; i++) {
        const moduleNumber = i + 1;
        const existingModule = modules.find(m => m.moduleNumber === moduleNumber);
        
        if (!existingModule) {
          // Create missing module
          const newModule = await this.createSingleModule(strategy, moduleNumber);
          modules.push(newModule);
        }

        // Generate enhanced content with comprehensive steps
        const enhancedContent = StepByStepGenerator.generateCompleteModuleContent(
          strategy.id,
          moduleNumber,
          `Module ${moduleNumber}: ${this.getModuleTitle(moduleNumber)}`
        );

        // Count steps for reporting
        const stepCount = enhancedContent.steps.length;
        totalSteps += stepCount;

        // Update module with enhanced content
        await db.update(trainingModules)
          .set({
            content: enhancedContent,
            updatedAt: new Date().toISOString()
          })
          .where({
            trackId: strategy.id,
            moduleNumber: moduleNumber
          });

        modulesEnhanced++;
        reportLines.push(`  Module ${moduleNumber}: ${stepCount} detailed steps`);
      }

      strategiesProcessed++;
    }

    const report = reportLines.join('\n');
    
    console.log(`✅ Enhanced ${modulesEnhanced} modules across ${strategiesProcessed} strategies`);
    console.log(`📊 Total step-by-step instructions: ${totalSteps}`);

    return {
      strategiesProcessed,
      modulesEnhanced,
      totalSteps,
      report
    };
  }

  private async createModulesForStrategy(strategy: typeof ALL_24_STRATEGIES[0]) {
    const modules = [];
    
    for (let i = 1; i <= 8; i++) {
      const module = await this.createSingleModule(strategy, i);
      modules.push(module);
    }
    
    return modules;
  }

  private async createSingleModule(strategy: typeof ALL_24_STRATEGIES[0], moduleNumber: number) {
    const moduleTitle = this.getModuleTitle(moduleNumber);
    const enhancedContent = StepByStepGenerator.generateCompleteModuleContent(
      strategy.id,
      moduleNumber,
      `Module ${moduleNumber}: ${moduleTitle}`
    );

    const moduleData = {
      trackId: strategy.id,
      slug: `${strategy.id}-module-${moduleNumber}`,
      moduleNumber,
      title: `Module ${moduleNumber}: ${moduleTitle}`,
      description: `${moduleTitle} for ${strategy.title} - ${strategy.focus}`,
      content: enhancedContent,
      videoUrl: null,
      duration: '60 minutes',
      durationMinutes: 60,
      isRequired: true,
      orderIndex: moduleNumber,
      createdAt: new Date().toISOString()
    };

    const [insertedModule] = await db.insert(trainingModules).values(moduleData).returning();
    return insertedModule;
  }

  private getModuleTitle(moduleNumber: number): string {
    const titles = [
      'Foundations & Prerequisites', // Module 1
      'Setup & Configuration',      // Module 2
      'Core Concepts & Theory',     // Module 3
      'Implementation & Practice',  // Module 4
      'Risk Management & Optimization', // Module 5
      'Advanced Techniques',        // Module 6
      'Troubleshooting & Common Mistakes', // Module 7
      'Mastery & Next Steps'       // Module 8
    ];
    
    return titles[moduleNumber - 1] || `Module ${moduleNumber}`;
  }

  // Validate that all modules have comprehensive step-by-step instructions
  async validateStepByStepContent(): Promise<{
    valid: boolean;
    totalModules: number;
    modulesWithSteps: number;
    averageStepsPerModule: number;
    issues: string[];
  }> {
    console.log('🔍 Validating step-by-step content across all modules...');
    
    const allModules = await db.select().from(trainingModules);
    const issues: string[] = [];
    let modulesWithSteps = 0;
    let totalSteps = 0;

    for (const module of allModules) {
      const content = module.content as any;
      const steps = content?.steps || [];
      
      if (steps.length === 0) {
        issues.push(`${module.trackId} Module ${module.moduleNumber}: No steps found`);
      } else if (steps.length < 5) {
        issues.push(`${module.trackId} Module ${module.moduleNumber}: Only ${steps.length} steps (minimum 5 recommended)`);
      } else {
        modulesWithSteps++;
        totalSteps += steps.length;
      }
    }

    const averageStepsPerModule = Math.round(totalSteps / Math.max(modulesWithSteps, 1));
    const valid = issues.length === 0 && modulesWithSteps === allModules.length;

    console.log(`📊 Validation Results:`);
    console.log(`   • Total modules: ${allModules.length}`);
    console.log(`   • Modules with steps: ${modulesWithSteps}`);
    console.log(`   • Average steps per module: ${averageStepsPerModule}`);
    console.log(`   • Issues found: ${issues.length}`);

    if (issues.length > 0) {
      console.log(`⚠️  Issues:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return {
      valid,
      totalModules: allModules.length,
      modulesWithSteps,
      averageStepsPerModule,
      issues
    };
  }

  // Generate a comprehensive report of all step-by-step content
  async generateStepByStepReport(): Promise<string> {
    const modules = await db.select().from(trainingModules).orderBy('trackId', 'orderIndex');
    const tracks = await db.select().from(trainingTracks);
    
    const report: string[] = [];
    report.push('# COMPLETE STEP-BY-STEP TRAINING REPORT');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push(`Total Strategies: ${tracks.length}`);
    report.push(`Total Modules: ${modules.length}`);
    report.push('');

    // Group modules by track
    const modulesByTrack: Record<string, any[]> = {};
    modules.forEach(module => {
      if (!modulesByTrack[module.trackId]) {
        modulesByTrack[module.trackId] = [];
      }
      modulesByTrack[module.trackId].push(module);
    });

    // Generate report for each strategy
    for (const track of tracks) {
      const trackModules = modulesByTrack[track.trackId] || [];
      const totalSteps = trackModules.reduce((sum, module) => {
        const content = module.content as any;
        return sum + (content?.steps?.length || 0);
      }, 0);

      report.push(`## ${track.title}`);
      report.push(`Category: ${track.category}`);
      report.push(`Modules: ${trackModules.length}/8`);
      report.push(`Total Steps: ${totalSteps}`);
      report.push('');

      // List each module with step count
      trackModules.forEach(module => {
        const content = module.content as any;
        const stepCount = content?.steps?.length || 0;
        const hasExercises = content?.practicalExercises?.length > 0;
        const hasQuiz = content?.quiz?.length > 0;
        
        report.push(`  ### ${module.title}`);
        report.push(`  Duration: ${module.duration}`);
        report.push(`  Steps: ${stepCount}`);
        report.push(`  Exercises: ${hasExercises ? '✓' : '✗'}`);
        report.push(`  Quiz: ${hasQuiz ? '✓' : '✗'}`);
        
        if (stepCount > 0) {
          report.push(`  Step-by-step instructions:`);
          content.steps.forEach((step: string, index: number) => {
            report.push(`    ${index + 1}. ${step}`);
          });
        }
        report.push('');
      });
    }

    return report.join('\n');
  }
}

// Export singleton instance
export const completeStepByStepBuilder = new CompleteStepByStepBuilder();