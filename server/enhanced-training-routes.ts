import { ENHANCED_STRATEGY_MODULES } from './enhanced-strategy-techniques';

export function registerEnhancedTrainingRoutes(app: any) {
  console.log('📚 Registering enhanced training routes...');

  // Get all enhanced strategy tracks
  app.get('/api/enhanced-training/strategies', (req: any, res: any) => {
    try {
      const strategies = Object.entries(ENHANCED_STRATEGY_MODULES).map(([key, strategy]) => ({
        slug: strategy.track_id,
        title: strategy.title,
        description: strategy.description,
        module_count: strategy.modules.length
      }));
      res.json(strategies);
    } catch (error) {
      console.error('Error fetching enhanced strategies:', error);
      res.status(500).json({ error: 'Failed to fetch enhanced strategies' });
    }
  });

  // Get specific strategy with all modules
  app.get('/api/enhanced-training/:strategySlug', (req: any, res: any) => {
    try {
      const { strategySlug } = req.params;
      
      const strategy = ENHANCED_STRATEGY_MODULES[strategySlug as keyof typeof ENHANCED_STRATEGY_MODULES];
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found in enhanced content' });
      }
      
      res.json({
        track_id: strategy.track_id,
        title: strategy.title,
        description: strategy.description,
        total_modules: strategy.modules.length,
        modules: strategy.modules.map(m => ({
          slug: m.slug,
          order: m.order,
          of: m.of,
          title: m.title,
          duration: m.duration
        }))
      });
    } catch (error) {
      console.error('Error fetching enhanced strategy:', error);
      res.status(500).json({ error: 'Failed to fetch enhanced strategy' });
    }
  });

  // Get all modules for an enhanced strategy
  app.get('/api/enhanced-training/:strategySlug/modules', (req: any, res: any) => {
    try {
      const { strategySlug } = req.params;
      
      const strategy = ENHANCED_STRATEGY_MODULES[strategySlug as keyof typeof ENHANCED_STRATEGY_MODULES];
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found in enhanced content' });
      }
      
      res.json(strategy.modules.map(m => ({
        slug: m.slug,
        order: m.order,
        of: m.of,
        title: m.title,
        duration: m.duration,
        overview: m.overview
      })));
    } catch (error) {
      console.error('Error fetching enhanced modules:', error);
      res.status(500).json({ error: 'Failed to fetch enhanced modules' });
    }
  });

  // Get specific module with full content
  app.get('/api/enhanced-training/:strategySlug/:moduleSlug', (req: any, res: any) => {
    try {
      const { strategySlug, moduleSlug } = req.params;
      
      const strategy = ENHANCED_STRATEGY_MODULES[strategySlug as keyof typeof ENHANCED_STRATEGY_MODULES];
      
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found in enhanced content' });
      }
      
      const module = strategy.modules.find(m => m.slug === moduleSlug);
      
      if (!module) {
        // Try finding by module number
        const moduleNum = moduleSlug.match(/module[-_]?(\d+)$/);
        if (moduleNum) {
          const num = parseInt(moduleNum[1], 10);
          const foundModule = strategy.modules.find(m => m.order === num);
          if (foundModule) {
            return res.json({
              ...foundModule,
              track: strategy.track_id,
              strategy_title: strategy.title,
              previous: foundModule.order > 1 ? {
                slug: strategy.modules[foundModule.order - 2].slug,
                label: `Previous: ${strategy.modules[foundModule.order - 2].title}`
              } : null,
              next: foundModule.order < strategy.modules.length ? {
                slug: strategy.modules[foundModule.order].slug,
                label: `Next: ${strategy.modules[foundModule.order].title}`
              } : null
            });
          }
        }
        return res.status(404).json({ error: 'Module not found in enhanced content' });
      }
      
      const moduleIndex = strategy.modules.findIndex(m => m.slug === moduleSlug);
      
      res.json({
        ...module,
        track: strategy.track_id,
        strategy_title: strategy.title,
        previous: moduleIndex > 0 ? {
          slug: strategy.modules[moduleIndex - 1].slug,
          label: `Previous: ${strategy.modules[moduleIndex - 1].title}`
        } : null,
        next: moduleIndex < strategy.modules.length - 1 ? {
          slug: strategy.modules[moduleIndex + 1].slug,
          label: `Next: ${strategy.modules[moduleIndex + 1].title}`
        } : null
      });
    } catch (error) {
      console.error('Error fetching enhanced module:', error);
      res.status(500).json({ error: 'Failed to fetch enhanced module' });
    }
  });

  console.log('✅ Enhanced training routes registered');
}
