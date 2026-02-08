import { db } from './db';
import { realTrainingModules } from './real-training-data';
import { 
  enhancedTrainingStrategies, 
  enhancedTrainingModules,
  type InsertEnhancedTrainingStrategy,
  type InsertEnhancedTrainingModule 
} from '../shared/schema';
import { strategies } from '../client/src/data/strategies';

export class DatabaseSeeder {
  async seedTrainingStrategies() {
    console.log('🌱 Seeding training strategies...');
    
    try {
      // Clear existing data
      await db.delete(enhancedTrainingModules);
      await db.delete(enhancedTrainingStrategies);
      
      // Insert strategies from our data
      const insertedStrategies = await db.insert(enhancedTrainingStrategies).values(
        strategies.map((strategy, index): InsertEnhancedTrainingStrategy => ({
          slug: strategy.slug,
          title: strategy.title,
          summary: strategy.summary,
          category: strategy.category,
          risk: strategy.risk,
          roiRange: strategy.roiRange,
          tags: strategy.tags,
          trainingUrl: strategy.trainingUrl,
          pdfUrl: strategy.pdfUrl,
          isActive: true,
        }))
      ).returning();

      console.log(`✅ Inserted ${insertedStrategies.length} strategies`);

      // Create training modules for each strategy
      for (const strategy of insertedStrategies) {
        const modules = this.generateModulesForStrategy(strategy.id, strategy.slug, strategy.category);
        await db.insert(enhancedTrainingModules).values(modules);
        console.log(`✅ Created ${modules.length} modules for ${strategy.title}`);
      }

      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private generateModulesForStrategy(strategyId: number, strategySlug: string, category: string): InsertEnhancedTrainingModule[] {
    // Find matching real training data
    const realData = realTrainingModules.find(m => m.title.toLowerCase().includes(strategySlug.toLowerCase().replace(/-/g, ' ')));
    
    if (realData) {
      // Generate modules from real training data
      const realDataModules = [
        {
          moduleNumber: 1,
          title: "Overview & Prerequisites",
          description: realData.overview,
          content: { overview: realData.overview, prerequisites: realData.prereqs, preparation: "Essential preparation steps" },
          duration: "15 minutes",
          durationMinutes: 15,
          orderIndex: 1,
        },
        {
          moduleNumber: 2,
          title: "Step-by-Step Implementation",
          description: "Detailed implementation guide with actionable steps",
          content: { steps: realData.steps, implementation: "Complete implementation walkthrough", practicalGuide: realData.steps },
          duration: "25 minutes",
          durationMinutes: 25,
          orderIndex: 2,
        },
        {
          moduleNumber: 3,
          title: "Risk Management & Safety",
          description: "Understanding and mitigating strategy risks",
          content: { risks: realData.risks, mitigation: "Risk mitigation strategies", safety: "Safety protocols and best practices" },
          duration: "20 minutes",
          durationMinutes: 20,
          orderIndex: 3,
        },
        {
          moduleNumber: 4,
          title: "Exit Strategy & Planning",
          description: "Strategic exit planning and execution",
          content: { exitPlan: realData.exit_plan, scenarios: "Multiple exit scenarios", planning: "Advanced exit planning techniques" },
          duration: "30 minutes",
          durationMinutes: 30,
          orderIndex: 4,
        },
        {
          moduleNumber: 5,
          title: "Advanced Techniques",
          description: "Advanced implementation and optimization methods",
          content: { advanced: "Advanced techniques and optimizations", optimization: "Performance optimization methods", scaling: "Scaling strategies" },
          duration: "25 minutes",
          durationMinutes: 25,
          orderIndex: 5,
        },
        {
          moduleNumber: 6,
          title: "Case Studies & Examples",
          description: "Real-world examples and detailed case studies",
          content: { examples: "Real-world implementation examples", analysis: "Detailed case study analysis", lessons: "Key lessons learned" },
          duration: "20 minutes",
          durationMinutes: 20,
          orderIndex: 6,
        },
        {
          moduleNumber: 7,
          title: "Common Pitfalls & Troubleshooting",
          description: "Avoiding mistakes and troubleshooting issues",
          content: { mistakes: "Common pitfalls and how to avoid them", troubleshooting: "Comprehensive troubleshooting guide", recovery: "Error recovery strategies" },
          duration: "15 minutes",
          durationMinutes: 15,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Mastery & Assessment",
          description: "Final assessment and certification process",
          content: { assessment: "Comprehensive final assessment", certification: "Strategy mastery certification", resources: "Additional learning resources and next steps" },
          duration: "30 minutes",
          durationMinutes: 30,
          orderIndex: 8,
        }
      ];

      return realDataModules.map((module): InsertEnhancedTrainingModule => ({
        strategyId,
        ...module,
        videoUrl: `https://training.cryptoflow.pro/video/${strategySlug}/${module.moduleNumber}`,
        isRequired: module.moduleNumber <= 4,
      }));
    }
    const baseModules = [
      {
        moduleNumber: 1,
        title: "Strategy Overview & Fundamentals",
        description: "Master the core concepts and theoretical foundation",
        duration: "15 minutes",
        durationMinutes: 15,
        orderIndex: 1,
      },
      {
        moduleNumber: 2,
        title: "Market Analysis & Setup",
        description: "Learn to identify optimal market conditions",
        duration: "20 minutes", 
        durationMinutes: 20,
        orderIndex: 2,
      },
      {
        moduleNumber: 3,
        title: "Entry Signals & Timing",
        description: "Precise entry techniques and signal confirmation",
        duration: "25 minutes",
        durationMinutes: 25,
        orderIndex: 3,
      },
      {
        moduleNumber: 4,
        title: "Risk Management Protocol",
        description: "Position sizing and stop-loss strategies",
        duration: "20 minutes",
        durationMinutes: 20,
        orderIndex: 4,
      },
      {
        moduleNumber: 5,
        title: "Exit Strategies & Profit Taking",
        description: "Systematic profit-taking and trade management",
        duration: "25 minutes",
        durationMinutes: 25,
        orderIndex: 5,
      },
      {
        moduleNumber: 6,
        title: "Live Trading Practice",
        description: "Step-by-step guided practice with real examples",
        duration: "30 minutes",
        durationMinutes: 30,
        orderIndex: 6,
      }
    ];

    // Add category-specific modules
    const categorySpecificModules = this.getCategorySpecificModules(category);
    const allModules = [...baseModules, ...categorySpecificModules];

    return allModules.map((module): InsertEnhancedTrainingModule => ({
      strategyId,
      ...module,
      content: this.generateModuleContent(strategySlug, module.title, category),
      videoUrl: `https://example.com/videos/${strategySlug}/${module.moduleNumber}`,
      isRequired: true,
    }));
  }

  private getCategorySpecificModules(category: string): Array<Omit<InsertEnhancedTrainingModule, 'strategyId' | 'content' | 'videoUrl' | 'isRequired'>> {
    const modulesByCategory = {
      DeFi: [
        {
          moduleNumber: 7,
          title: "DeFi Protocol Deep Dive",
          description: "Understanding liquidity pools, yield farming, and smart contract risks",
          duration: "35 minutes",
          durationMinutes: 35,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Gas Optimization & Transaction Timing",
          description: "Minimize costs and maximize efficiency",
          duration: "20 minutes",
          durationMinutes: 20,
          orderIndex: 8,
        },
      ],
      Day: [
        {
          moduleNumber: 7,
          title: "Scalping Techniques & Quick Profits",
          description: "High-frequency trading strategies for day traders",
          duration: "30 minutes",
          durationMinutes: 30,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Market Hours & Volume Analysis",
          description: "Optimal timing for day trading execution",
          duration: "25 minutes",
          durationMinutes: 25,
          orderIndex: 8,
        },
      ],
      Swing: [
        {
          moduleNumber: 7,
          title: "Trend Analysis & Market Cycles",
          description: "Long-term positioning and swing trading psychology",
          duration: "40 minutes",
          durationMinutes: 40,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Multi-Timeframe Analysis",
          description: "Coordinating different time horizons for swing trades",
          duration: "30 minutes",
          durationMinutes: 30,
          orderIndex: 8,
        },
      ],
      Alpha: [
        {
          moduleNumber: 7,
          title: "Alpha Generation Techniques",
          description: "Finding edge in competitive markets",
          duration: "45 minutes",
          durationMinutes: 45,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Advanced Risk-Adjusted Returns",
          description: "Sharpe ratio optimization and risk parity",
          duration: "35 minutes",
          durationMinutes: 35,
          orderIndex: 8,
        },
      ],
      Education: [
        {
          moduleNumber: 7,
          title: "Learning Psychology & Habit Formation",
          description: "Building sustainable trading habits and mindset",
          duration: "25 minutes",
          durationMinutes: 25,
          orderIndex: 7,
        },
        {
          moduleNumber: 8,
          title: "Performance Tracking & Improvement",
          description: "Measuring progress and iterating on strategies",
          duration: "30 minutes",
          durationMinutes: 30,
          orderIndex: 8,
        },
      ],
    };

    return modulesByCategory[category as keyof typeof modulesByCategory] || [];
  }

  private generateModuleContent(strategySlug: string, moduleTitle: string, category: string) {
    const contentTemplates = {
      "Strategy Overview & Fundamentals": {
        sections: [
          {
            title: "Introduction",
            content: `Welcome to the comprehensive training for this ${category.toLowerCase()} strategy. This module will provide you with a solid foundation in the core concepts and principles.`,
            type: "text"
          },
          {
            title: "Key Concepts",
            content: [
              "Market structure and dynamics",
              "Risk/reward fundamentals", 
              "Capital allocation principles",
              "Psychology and discipline"
            ],
            type: "list"
          },
          {
            title: "Success Metrics",
            content: "By the end of this module, you'll understand the fundamental principles that drive successful execution of this strategy.",
            type: "text"
          }
        ]
      },
      "Market Analysis & Setup": {
        sections: [
          {
            title: "Market Conditions",
            content: "Learn to identify the optimal market conditions for deploying this strategy effectively.",
            type: "text"
          },
          {
            title: "Setup Checklist",
            content: [
              "Market trend analysis",
              "Volume and liquidity assessment",
              "Risk environment evaluation",
              "Entry timing confirmation"
            ],
            type: "checklist"
          }
        ]
      },
      // Add more templates as needed...
    };

    return contentTemplates[moduleTitle as keyof typeof contentTemplates] || {
      sections: [
        {
          title: moduleTitle,
          content: `Comprehensive training content for ${moduleTitle} in the context of ${category} trading strategies.`,
          type: "text"
        }
      ]
    };
  }

  async checkIfSeeded(): Promise<boolean> {
    try {
      const strategies = await db.select().from(enhancedTrainingStrategies).limit(1);
      return strategies.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export const dbSeeder = new DatabaseSeeder();