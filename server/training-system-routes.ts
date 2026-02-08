// Training System Routes - Complete API for 24 Strategies System
import type { Express, Request, Response } from 'express';
import { db } from './db';
import { trainingTracks, trainingModules, strategyCatalog } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { masterTrainingSeeder } from './master-training-seeder';

export function registerTrainingSystemRoutes(app: Express) {
  
  // Comprehensive seeding endpoint
  app.post('/api/training/seed-all', async (req: Request, res: Response) => {
    try {
      console.log('🌱 Starting comprehensive training system seeding...');
      
      await masterTrainingSeeder.seedAllTrainingContent();
      
      res.json({
        success: true,
        message: 'All training content seeded successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('❌ Training seeding error:', error);
      res.status(500).json({
        success: false,
        error: 'Training seeding failed',
        message: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Training system test and verification
  app.get('/training-system-test', async (req: Request, res: Response) => {
    try {
      // Get comprehensive stats
      const strategies = await db.select().from(strategyCatalog);
      const tracks = await db.select().from(trainingTracks);
      const modules = await db.select().from(trainingModules);
      
      // Analyze data completeness
      const strategiesWithTracks = strategies.filter(s => 
        tracks.some(t => t.trackId === s.trackId)
      );
      
      const strategiesWithModules = strategies.filter(s =>
        modules.some(m => m.trackId === s.trackId)
      );
      
      const tracksWithModules = tracks.map(track => {
        const trackModules = modules.filter(m => m.trackId === track.trackId);
        return {
          ...track,
          moduleCount: trackModules.length,
          hasCompleteSet: trackModules.length === 8
        };
      });
      
      const completeTracks = tracksWithModules.filter(t => t.hasCompleteSet);
      
      // Module content analysis
      const modulesWithContent = modules.filter(m => 
        m.content && typeof m.content === 'object' && Object.keys(m.content).length > 0
      );
      
      const modulesWithLongOverview = modules.filter(m => {
        const content = m.content as any;
        return content?.overview && content.overview.length > 80;
      });
      
      // Generate HTML report
      const htmlReport = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Training System Test Results</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
            h2 { color: #34495e; margin-top: 30px; }
            .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
            .stat-number { font-size: 2em; font-weight: bold; color: #2c3e50; }
            .stat-label { color: #7f8c8d; font-size: 0.9em; }
            .success { color: #27ae60; }
            .warning { color: #f39c12; }
            .error { color: #e74c3c; }
            .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
            .status-good { background: #27ae60; }
            .status-warning { background: #f39c12; }
            .status-error { background: #e74c3c; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .track-name { font-weight: 600; }
            .module-count { text-align: center; }
            .complete-indicator { text-align: center; }
            .requirements-section { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .requirements-section h3 { color: #27ae60; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎯 Training System Test Results</h1>
            <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
            
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-number ${strategies.length === 24 ? 'success' : 'error'}">${strategies.length}</div>
                <div class="stat-label">Total Strategies</div>
                <div class="stat-label">${strategies.length === 24 ? '✅ Target: 24' : '❌ Target: 24'}</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-number ${tracks.length === 24 ? 'success' : 'error'}">${tracks.length}</div>
                <div class="stat-label">Training Tracks</div>
                <div class="stat-label">${tracks.length === 24 ? '✅ Target: 24' : '❌ Target: 24'}</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-number ${modules.length === 192 ? 'success' : 'error'}">${modules.length}</div>
                <div class="stat-label">Training Modules</div>
                <div class="stat-label">${modules.length === 192 ? '✅ Target: 192 (24×8)' : '❌ Target: 192 (24×8)'}</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-number ${completeTracks.length === 24 ? 'success' : 'warning'}">${completeTracks.length}</div>
                <div class="stat-label">Complete Tracks (8 modules)</div>
                <div class="stat-label">${completeTracks.length === 24 ? '✅ All Complete' : '⚠️ Some Incomplete'}</div>
              </div>
            </div>

            <h2>📊 Content Quality Analysis</h2>
            <div class="stat-grid">
              <div class="stat-card">
                <div class="stat-number ${strategiesWithTracks.length === strategies.length ? 'success' : 'error'}">${strategiesWithTracks.length}/${strategies.length}</div>
                <div class="stat-label">Strategies with Linked Tracks</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-number ${modulesWithContent.length}">${modulesWithContent.length}</div>
                <div class="stat-label">Modules with Content</div>
                <div class="stat-label">${((modulesWithContent.length / modules.length) * 100).toFixed(1)}% of total</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-number ${modulesWithLongOverview.length}">${modulesWithLongOverview.length}</div>
                <div class="stat-label">Modules with Comprehensive Overview (>80 chars)</div>
                <div class="stat-label">${((modulesWithLongOverview.length / modules.length) * 100).toFixed(1)}% of total</div>
              </div>
            </div>

            <h2>🎯 All 24 Trading Strategies Status</h2>
            <table>
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Track ID</th>
                  <th>Category</th>
                  <th>Modules</th>
                  <th>Complete</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${tracksWithModules.map(track => `
                  <tr>
                    <td class="track-name">${track.title}</td>
                    <td><code>${track.trackId}</code></td>
                    <td>${track.category}</td>
                    <td class="module-count">${track.moduleCount}/8</td>
                    <td class="complete-indicator">
                      ${track.hasCompleteSet ? 
                        '<span class="status-indicator status-good"></span>Complete' : 
                        '<span class="status-indicator status-warning"></span>Incomplete'
                      }
                    </td>
                    <td>
                      ${track.hasCompleteSet ? 
                        '<span class="success">✅ Ready</span>' : 
                        '<span class="warning">⚠️ Needs modules</span>'
                      }
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="requirements-section">
              <h3>✅ System Requirements Status</h3>
              <ul>
                <li><span class="${strategies.length === 24 ? 'success' : 'error'}">${strategies.length === 24 ? '✅' : '❌'}</span> All 24 strategies present</li>
                <li><span class="${tracks.length === 24 ? 'success' : 'error'}">${tracks.length === 24 ? '✅' : '❌'}</span> All training tracks created</li>
                <li><span class="${completeTracks.length === 24 ? 'success' : 'error'}">${completeTracks.length === 24 ? '✅' : '❌'}</span> All tracks have 8 modules</li>
                <li><span class="${strategiesWithTracks.length === strategies.length ? 'success' : 'error'}">${strategiesWithTracks.length === strategies.length ? '✅' : '❌'}</span> All strategies linked to tracks</li>
                <li><span class="${modulesWithLongOverview.length > (modules.length * 0.8) ? 'success' : 'warning'}">${modulesWithLongOverview.length > (modules.length * 0.8) ? '✅' : '⚠️'}</span> Comprehensive content quality</li>
              </ul>
            </div>

            ${strategies.length === 24 && modules.length === 192 && completeTracks.length === 24 ? 
              '<div class="requirements-section" style="background: #e8f5e8;"><h3 style="color: #27ae60;">🎉 System Status: FULLY OPERATIONAL</h3><p>All 24 strategies with 8 modules each are properly seeded and ready for use!</p></div>' :
              '<div class="requirements-section" style="background: #fff3cd;"><h3 style="color: #856404;">⚠️ System Status: INCOMPLETE</h3><p>Some components are missing. Run the seeding process to complete the system.</p></div>'
            }

            <h2>🔧 Actions</h2>
            <p><strong>To seed all content:</strong> POST to <code>/api/training/seed-all</code></p>
            <p><strong>Last Updated:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `;
      
      res.send(htmlReport);
      
    } catch (error: any) {
      console.error('Training system test error:', error);
      res.status(500).json({
        error: 'Training system test failed',
        message: error?.message || 'Unknown error'
      });
    }
  });

  // Get all strategies with module counts
  app.get('/api/training/strategies', async (req: Request, res: Response) => {
    try {
      const strategies = await db.select().from(strategyCatalog);
      const tracks = await db.select().from(trainingTracks);
      const modules = await db.select().from(trainingModules);
      
      const enrichedStrategies = strategies.map(strategy => {
        const track = tracks.find(t => t.trackId === strategy.trackId);
        const strategyModules = modules.filter(m => m.trackId === strategy.trackId);
        
        return {
          ...strategy,
          track,
          moduleCount: strategyModules.length,
          modules: strategyModules.sort((a, b) => a.orderIndex - b.orderIndex)
        };
      });
      
      res.json(enrichedStrategies);
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch strategies',
        message: error?.message || 'Unknown error'
      });
    }
  });

  // Get specific strategy with all modules
  app.get('/api/training/strategy/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const strategy = await db.select()
        .from(strategyCatalog)
        .where(eq(strategyCatalog.slug, slug))
        .limit(1);
      
      if (!strategy.length) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      
      const track = await db.select()
        .from(trainingTracks)
        .where(eq(trainingTracks.trackId, strategy[0].trackId!))
        .limit(1);
      
      const modules = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.trackId, strategy[0].trackId!))
        .orderBy(trainingModules.orderIndex);
      
      res.json({
        strategy: strategy[0],
        track: track[0] || null,
        modules
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch strategy',
        message: error?.message || 'Unknown error'
      });
    }
  });

  // Get specific module
  app.get('/api/training/module/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const module = await db.select()
        .from(trainingModules)
        .where(eq(trainingModules.slug, slug))
        .limit(1);
      
      if (!module.length) {
        return res.status(404).json({ error: 'Module not found' });
      }
      
      const track = await db.select()
        .from(trainingTracks)
        .where(eq(trainingTracks.trackId, module[0].trackId))
        .limit(1);
      
      res.json({
        module: module[0],
        track: track[0] || null
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch module',
        message: error?.message || 'Unknown error'
      });
    }
  });

  // Search strategies and modules
  app.get('/api/training/search', async (req: Request, res: Response) => {
    try {
      const { q, category, difficulty } = req.query;
      
      let strategies = await db.select().from(strategyCatalog);
      let tracks = await db.select().from(trainingTracks);
      
      // Filter by search query
      if (q && typeof q === 'string') {
        const searchTerm = q.toLowerCase();
        strategies = strategies.filter(s => 
          s.title.toLowerCase().includes(searchTerm) ||
          s.summary?.toLowerCase().includes(searchTerm) ||
          s.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      // Filter by category
      if (category && typeof category === 'string') {
        strategies = strategies.filter(s => 
          s.category?.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Filter by difficulty (from tracks)
      if (difficulty && typeof difficulty === 'string') {
        tracks = tracks.filter(t => 
          t.difficulty?.toLowerCase() === difficulty.toLowerCase()
        );
        strategies = strategies.filter(s => 
          tracks.some(t => t.trackId === s.trackId)
        );
      }
      
      res.json({
        strategies,
        total: strategies.length
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Search failed',
        message: error?.message || 'Unknown error'
      });
    }
  });

  console.log('📚 Training System Routes Registered');
}

export default registerTrainingSystemRoutes;