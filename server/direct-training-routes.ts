import { Router } from 'express';
import { comprehensiveTrainingData } from './comprehensive-training-modules';

const router = Router();

// Direct routes for comprehensive training modules - bypasses database dependency
export function registerDirectTrainingRoutes(app: any) {
  
  // Get comprehensive training module by track and slug
  app.get('/api/training/:track/:slug', (req: any, res: any) => {
    try {
      const { track, slug } = req.params;
      
      console.log(`📚 Direct training request: ${track}/${slug}`);
      
      // Find the track
      const targetTrack = comprehensiveTrainingData.tracks.find(t => t.track_id === track);
      if (!targetTrack) {
        console.log(`❌ Track not found: ${track}`);
        return res.status(404).json({ error: 'Training track not found' });
      }
      
      // Find the module
      const module = targetTrack.modules.find(m => m.slug === slug);
      if (!module) {
        console.log(`❌ Module not found: ${slug} in track ${track}`);
        return res.status(404).json({ error: 'Training module not found' });
      }
      
      console.log(`✅ Serving module: ${module.title}`);
      res.json(module);
      
    } catch (error) {
      console.error('❌ Error serving training module:', error);
      res.status(500).json({ error: 'Failed to fetch training module' });
    }
  });
  
  // Get all modules for a track (fix the route to match)
  app.get('/api/training/:track', (req: any, res: any) => {
    try {
      const { track } = req.params;
      
      // If it ends with '/modules', handle that case
      if (req.url.endsWith('/modules')) {
        const targetTrack = comprehensiveTrainingData.tracks.find(t => t.track_id === track);
        if (!targetTrack) {
          return res.status(404).json({ error: 'Training track not found' });
        }
        
        const modules = targetTrack.modules.map(module => ({
          slug: module.slug,
          title: module.title,
          duration: module.duration,
          order: module.order,
          of: module.of,
          overview: module.overview
        }));
        
        res.json(modules);
        return;
      }
      
      // Otherwise handle track info request
      const targetTrack = comprehensiveTrainingData.tracks.find(t => t.track_id === track);
      if (!targetTrack) {
        return res.status(404).json({ error: 'Training track not found' });
      }
      
      res.json({
        track_id: targetTrack.track_id,
        title: targetTrack.title,
        description: targetTrack.description,
        total_modules: targetTrack.modules.length,
        modules: targetTrack.modules.map(m => ({
          slug: m.slug,
          title: m.title,
          duration: m.duration,
          order: m.order
        }))
      });
      
    } catch (error) {
      console.error('Error serving training modules:', error);
      res.status(500).json({ error: 'Failed to fetch training modules' });
    }
  });
  
  // Get track information
  app.get('/api/training/:track', (req: any, res: any) => {
    try {
      const { track } = req.params;
      
      const targetTrack = comprehensiveTrainingData.tracks.find(t => t.track_id === track);
      if (!targetTrack) {
        return res.status(404).json({ error: 'Training track not found' });
      }
      
      res.json({
        track_id: targetTrack.track_id,
        title: targetTrack.title,
        description: targetTrack.description,
        total_modules: targetTrack.modules.length,
        modules: targetTrack.modules.map(m => ({
          slug: m.slug,
          title: m.title,
          duration: m.duration,
          order: m.order
        }))
      });
      
    } catch (error) {
      console.error('Error serving track info:', error);
      res.status(500).json({ error: 'Failed to fetch track information' });
    }
  });
  
  // Get comprehensive training strategy
  app.get('/api/strategies/comprehensive-trading-master', (req: any, res: any) => {
    try {
      const strategy = comprehensiveTrainingData.strategies[0];
      res.json(strategy);
    } catch (error) {
      console.error('Error serving strategy:', error);
      res.status(500).json({ error: 'Failed to fetch strategy' });
    }
  });
  
  console.log('✅ Direct training routes registered successfully');
}

export default router;