// Master Training Seeder - Complete 24 Strategies × 8 Modules System
import { db } from './db';
import { trainingTracks, trainingModules, strategyCatalog } from '@shared/schema';
import { comprehensiveTrainingData } from './comprehensive-training-data-enhanced';
import { complete24StrategiesData } from './complete-24-strategies-data';
import { StepByStepGenerator } from './enhanced-step-by-step-generator';

// Combine all strategy data
const allStrategiesData = {
  tracks: [
    ...comprehensiveTrainingData.tracks,
    ...complete24StrategiesData.strategies
  ]
};

export class MasterTrainingSeeder {
  
  async seedAllTrainingContent() {
    console.log('🌱 Starting Master Training Content Seeding...');
    
    try {
      // Clear existing data
      await this.clearExistingData();
      
      // Seed all strategies and tracks
      await this.seedStrategyCatalog();
      await this.seedTrainingTracks();
      await this.seedAllTrainingModules();
      
      console.log('✅ Master Training Content Seeding Completed Successfully!');
      console.log(`📊 Seeded ${allStrategiesData.tracks.length} strategies with ${this.getTotalModuleCount()} total modules`);
      
      // Verify seeding
      await this.verifySeeding();
      
    } catch (error) {
      console.error('❌ Master Training Seeding Error:', error);
      throw error;
    }
  }

  private async clearExistingData() {
    console.log('🧹 Clearing existing training data...');
    await db.delete(trainingModules);
    await db.delete(trainingTracks);
    await db.delete(strategyCatalog);
  }

  private async seedStrategyCatalog() {
    console.log('📚 Seeding strategy catalog...');
    
    const strategies = allStrategiesData.tracks.map((track, index) => ({
      id: index + 1,
      slug: track.track_id,
      title: track.title,
      summary: track.description,
      category: track.category || 'General',
      risk: this.mapDifficultyToRisk(track.difficulty),
      roiRange: this.generateROIRange(track.category),
      tags: this.generateTags(track),
      trackId: track.track_id,
      firstModuleSlug: track.modules?.[0]?.slug || `${track.track_id}-module-1`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await db.insert(strategyCatalog).values(strategies);
    console.log(`✅ Seeded ${strategies.length} strategies in catalog`);
  }

  private async seedTrainingTracks() {
    console.log('🛤️ Seeding training tracks...');
    
    const tracks = allStrategiesData.tracks.map((track, index) => ({
      id: index + 1,
      trackId: track.track_id,
      title: track.title,
      description: track.description,
      category: track.category || 'General',
      difficulty: track.difficulty || 'Intermediate',
      estimatedDuration: track.estimated_duration || '6-8 weeks',
      moduleCount: track.modules?.length || 8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await db.insert(trainingTracks).values(tracks);
    console.log(`✅ Seeded ${tracks.length} training tracks`);
  }

  private async seedAllTrainingModules() {
    console.log('📖 Seeding all training modules...');
    
    let moduleId = 1;
    const allModules = [];

    for (const track of allStrategiesData.tracks) {
      const trackModules = track.modules || this.generateDefaultModules(track.track_id);
      
      for (let i = 0; i < 8; i++) {
        const module = trackModules[i] || this.generateDefaultModule(track.track_id, i + 1);
        
        allModules.push({
          id: moduleId++,
          trackId: track.track_id,
          slug: module.slug,
          moduleNumber: i + 1,
          title: module.title,
          description: module.overview || `Module ${i + 1} for ${track.title}`,
          content: this.generateModuleContent(module, track.track_id, i + 1),
          videoUrl: module.videoUrl || null,
          duration: module.duration || '60 minutes',
          durationMinutes: this.parseDurationToMinutes(module.duration || '60 minutes'),
          isRequired: true,
          orderIndex: i + 1,
          createdAt: new Date().toISOString()
        });
      }
    }

    // Seed modules in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < allModules.length; i += batchSize) {
      const batch = allModules.slice(i, i + batchSize);
      await db.insert(trainingModules).values(batch);
      console.log(`📝 Seeded modules ${i + 1}-${Math.min(i + batchSize, allModules.length)}`);
    }

    console.log(`✅ Seeded ${allModules.length} total training modules`);
  }

  private generateDefaultModules(trackId: string) {
    const moduleTopics = [
      'Foundations & Prerequisites',
      'Setup & Configuration', 
      'Core Concepts & Theory',
      'Implementation & Practice',
      'Risk Management & Optimization',
      'Advanced Techniques',
      'Troubleshooting & Common Mistakes',
      'Mastery & Next Steps'
    ];

    return moduleTopics.map((topic, index) => ({
      slug: `${trackId}-module-${index + 1}`,
      track: trackId,
      order: index + 1,
      of: 8,
      title: `Module ${index + 1}: ${topic}`,
      duration: '60 minutes',
      overview: `Comprehensive coverage of ${topic.toLowerCase()} for ${trackId} strategy. Learn essential concepts, practical implementation, and best practices for optimal results.`,
      prerequisites: this.generateDefaultPrerequisites(index),
      learningObjectives: this.generateDefaultObjectives(topic),
      steps: this.generateDefaultSteps(topic),
      keyTakeaways: this.generateDefaultTakeaways(topic),
      practicalExercises: this.generateDefaultExercises(topic),
      resources: this.generateDefaultResources(),
      additionalResources: this.generateDefaultAdditionalResources(),
      quiz: this.generateDefaultQuiz(topic),
      notesPrompt: `What aspects of ${topic.toLowerCase()} are most relevant to your situation? How will you implement these concepts?`
    }));
  }

  private generateDefaultModule(trackId: string, moduleNumber: number) {
    const topics = [
      'Foundations & Prerequisites',
      'Setup & Configuration', 
      'Core Concepts & Theory',
      'Implementation & Practice',
      'Risk Management & Optimization',
      'Advanced Techniques',
      'Troubleshooting & Common Mistakes',
      'Mastery & Next Steps'
    ];
    
    const topic = topics[moduleNumber - 1] || 'Advanced Concepts';
    
    return {
      slug: `${trackId}-module-${moduleNumber}`,
      track: trackId,
      order: moduleNumber,
      of: 8,
      title: `Module ${moduleNumber}: ${topic}`,
      duration: '60 minutes',
      overview: `Comprehensive coverage of ${topic.toLowerCase()} for this strategy. Learn essential concepts, practical implementation, and best practices for optimal results in your trading journey.`,
      prerequisites: [
        `Completion of previous modules in this track`,
        `Basic understanding of the strategy fundamentals`,
        `Access to necessary tools and platforms`,
        `Commitment to practice and implementation`
      ],
      learningObjectives: [
        `Master the key concepts in ${topic.toLowerCase()}`,
        `Implement practical techniques effectively`,
        `Understand risk factors and mitigation strategies`,
        `Develop systematic approach to execution`,
        `Create monitoring and improvement systems`
      ],
      steps: [
        `Review and understand theoretical foundation`,
        `Set up necessary tools and environment`,
        `Practice implementation in controlled environment`,
        `Apply concepts to real-world scenarios`,
        `Monitor results and gather feedback`,
        `Optimize approach based on performance`,
        `Document learnings and best practices`,
        `Prepare for next level advancement`
      ],
      keyTakeaways: [
        `Systematic approach yields better results than ad-hoc methods`,
        `Practice and repetition build competence and confidence`,
        `Risk management is integral to sustainable success`,
        `Continuous monitoring enables optimization and improvement`,
        `Documentation creates foundation for future advancement`
      ],
      practicalExercises: [
        {
          title: `${topic} Implementation Challenge`,
          description: `Apply the concepts learned in this module to a practical scenario`,
          timeRequired: '2-3 hours',
          deliverable: `Implementation report with results and analysis`
        }
      ],
      resources: [
        'Relevant documentation and guides',
        'Industry best practices and standards',
        'Tools and software recommendations',
        'Community forums and support resources'
      ],
      additionalResources: [
        {
          type: 'guide',
          title: `Advanced ${topic} Guide`,
          url: `https://advanced-guide.com/${topic.toLowerCase().replace(/\s+/g, '-')}`,
          description: `Comprehensive guide for advanced ${topic.toLowerCase()}`
        }
      ],
      quiz: [
        {
          question: `What is the most important aspect of ${topic.toLowerCase()}?`,
          options: ['Speed', 'Accuracy', 'Systematic approach', 'Experience'],
          correct: 2,
          explanation: `A systematic approach ensures consistent results and continuous improvement in ${topic.toLowerCase()}.`
        }
      ],
      notesPrompt: `What aspects of ${topic.toLowerCase()} are most relevant to your situation? How will you implement these concepts in your strategy?`
    };
  }

  private generateModuleContent(module: any, trackId: string, moduleNumber: number) {
    // Use enhanced step-by-step generator if module doesn't have detailed steps
    if (!module.steps || module.steps.length < 5) {
      const enhancedContent = StepByStepGenerator.generateCompleteModuleContent(
        trackId, 
        moduleNumber, 
        module.title || `Module ${moduleNumber}`
      );
      
      return {
        overview: module.overview || enhancedContent.overview,
        prerequisites: module.prerequisites || enhancedContent.prerequisites,
        learningObjectives: module.learningObjectives || enhancedContent.learningObjectives,
        steps: enhancedContent.steps, // Always use enhanced step-by-step instructions
        keyTakeaways: module.keyTakeaways || enhancedContent.keyTakeaways,
        practicalExercises: module.practicalExercises || enhancedContent.practicalExercises,
        resources: module.resources || enhancedContent.resources,
        additionalResources: module.additionalResources || enhancedContent.additionalResources,
        quiz: module.quiz || enhancedContent.quiz,
        notesPrompt: module.notesPrompt || enhancedContent.notesPrompt
      };
    }

    return {
      overview: module.overview || `Comprehensive module covering essential concepts and practical implementation.`,
      prerequisites: module.prerequisites || [],
      learningObjectives: module.learningObjectives || [],
      steps: module.steps || [],
      keyTakeaways: module.keyTakeaways || [],
      practicalExercises: module.practicalExercises || [],
      resources: module.resources || [],
      additionalResources: module.additionalResources || [],
      quiz: module.quiz || [],
      notesPrompt: module.notesPrompt || 'What are your key takeaways from this module?'
    };
  }

  private generateDefaultPrerequisites(index: number): string[] {
    if (index === 0) {
      return [
        'Basic understanding of financial markets',
        'Access to necessary trading tools',
        'Commitment to learning and practice'
      ];
    }
    return [
      `Completion of Module ${index}`,
      'Understanding of previous concepts',
      'Practical experience with basic techniques'
    ];
  }

  private generateDefaultObjectives(topic: string): string[] {
    return [
      `Master the fundamentals of ${topic.toLowerCase()}`,
      `Implement practical techniques effectively`,
      `Understand risk factors and mitigation`,
      `Develop systematic execution approach`,
      `Create monitoring and improvement systems`
    ];
  }

  private generateDefaultSteps(topic: string): string[] {
    return [
      `Study theoretical foundation of ${topic.toLowerCase()}`,
      `Set up necessary tools and environment`,
      `Practice implementation techniques`,
      `Apply concepts to real scenarios`,
      `Monitor performance and results`,
      `Optimize based on feedback`,
      `Document best practices`,
      `Prepare for advanced techniques`
    ];
  }

  private generateDefaultTakeaways(topic: string): string[] {
    return [
      `${topic} requires systematic approach for best results`,
      `Practice and repetition build competence`,
      `Risk management is essential component`,
      `Continuous monitoring enables optimization`,
      `Documentation supports long-term success`
    ];
  }

  private generateDefaultExercises(topic: string): any[] {
    return [
      {
        title: `${topic} Practice Exercise`,
        description: `Hands-on practice implementing ${topic.toLowerCase()} concepts`,
        timeRequired: '2 hours',
        deliverable: `Practice report with analysis and results`
      }
    ];
  }

  private generateDefaultResources(): string[] {
    return [
      'Official documentation and guides',
      'Industry best practices',
      'Recommended tools and platforms',
      'Community resources and forums'
    ];
  }

  private generateDefaultAdditionalResources(): any[] {
    return [
      {
        type: 'guide',
        title: 'Comprehensive Implementation Guide',
        url: 'https://implementation-guide.com',
        description: 'Step-by-step guide for practical implementation'
      }
    ];
  }

  private generateDefaultQuiz(topic: string): any[] {
    return [
      {
        question: `What is the key to success in ${topic.toLowerCase()}?`,
        options: ['Natural talent', 'Systematic approach', 'Luck', 'Experience only'],
        correct: 1,
        explanation: `Systematic approach ensures consistent results and continuous improvement in ${topic.toLowerCase()}.`
      }
    ];
  }

  private mapDifficultyToRisk(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'Low';
      case 'intermediate': return 'Medium';
      case 'advanced': 
      case 'expert': return 'High';
      default: return 'Medium';
    }
  }

  private generateROIRange(category: string): string {
    switch (category?.toLowerCase()) {
      case 'defi': return '5-50%';
      case 'day trading': 
      case 'scalping': return '10-100%';
      case 'education': return 'N/A';
      case 'security': return 'Risk Reduction';
      default: return '5-25%';
    }
  }

  private generateTags(track: any): string[] {
    const baseTags = [track.category?.toLowerCase() || 'strategy'];
    
    if (track.difficulty) baseTags.push(track.difficulty.toLowerCase());
    if (track.track_id.includes('defi')) baseTags.push('defi');
    if (track.track_id.includes('trading')) baseTags.push('trading');
    if (track.track_id.includes('passive')) baseTags.push('passive-income');
    
    return baseTags;
  }

  private parseDurationToMinutes(duration: string): number {
    const match = duration.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/i);
    if (!match) return 60;
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    if (unit.includes('hour') || unit.includes('hr')) {
      return value * 60;
    }
    return value;
  }

  private getTotalModuleCount(): number {
    return allStrategiesData.tracks.length * 8;
  }

  private async verifySeeding() {
    console.log('🔍 Verifying seeding results...');
    
    const strategiesCount = await db.select().from(strategyCatalog);
    const tracksCount = await db.select().from(trainingTracks);
    const modulesCount = await db.select().from(trainingModules);
    
    console.log(`📊 Verification Results:`);
    console.log(`   • Strategies: ${strategiesCount.length}`);
    console.log(`   • Training Tracks: ${tracksCount.length}`);
    console.log(`   • Training Modules: ${modulesCount.length}`);
    
    if (strategiesCount.length !== 24) {
      console.warn(`⚠️  Expected 24 strategies, found ${strategiesCount.length}`);
    }
    
    if (modulesCount.length !== 192) {
      console.warn(`⚠️  Expected 192 modules (24×8), found ${modulesCount.length}`);
    }
    
    // Check for proper linkage
    const strategiesWithTracks = strategiesCount.filter(s => 
      tracksCount.some(t => t.trackId === s.trackId)
    );
    
    console.log(`🔗 Linkage verification:`);
    console.log(`   • Strategies with tracks: ${strategiesWithTracks.length}/${strategiesCount.length}`);
    
    if (strategiesWithTracks.length === strategiesCount.length) {
      console.log('✅ All strategies properly linked to training tracks');
    } else {
      console.warn('⚠️  Some strategies not properly linked to training tracks');
    }
  }
}

// Export singleton instance
export const masterTrainingSeeder = new MasterTrainingSeeder();