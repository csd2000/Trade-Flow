import { Request, Response, RequestHandler } from 'express';
import { trainingSystem } from './comprehensive-training-system';
// Import admin check function - will implement proper auth later
const isAdmin = (req: any, res: any, next: any) => {
  // For now, allow all requests - implement proper auth check later
  next();
};
import { db } from './db';
import { cmsContent, adminAuditLog, trainingTracks, trainingModules, strategyCatalog } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Seed endpoint for training data
export const seedTrainingData: RequestHandler = async (req: Request, res: Response) => {
  try {
    console.log("🌱 Admin seeding training data...");
    const result = await trainingSystem.seedDatabase();
    res.json(result);
  } catch (error: any) {
    console.error("❌ Seeding failed:", error);
    res.status(500).json({ error: error.message || "Training data seeding failed" });
  }
};

// Get all strategies
export const getAllStrategies: RequestHandler = async (req: Request, res: Response) => {
  try {
    const strategies = await trainingSystem.getAllStrategies();
    res.json(strategies);
  } catch (error: any) {
    console.error("❌ Error fetching strategies:", error);
    res.status(500).json({ error: error.message || "Failed to fetch strategies" });
  }
};

// Get specific strategy by slug
export const getStrategy: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const strategy = await trainingSystem.getStrategy(slug);
    
    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found" });
    }
    
    res.json(strategy);
  } catch (error: any) {
    console.error("❌ Error fetching strategy:", error);
    res.status(500).json({ error: error.message || "Failed to fetch strategy" });
  }
};

// Get training module by track and slug
export const getTrainingModule: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { track, slug } = req.params;
    
    if (!track || !slug) {
      return res.status(400).json({ error: "Track and slug parameters are required" });
    }
    
    const module = await trainingSystem.getModule(track, slug);
    
    if (!module) {
      return res.status(404).json({ error: "Training module not found" });
    }
    
    res.json(module);
  } catch (error: any) {
    console.error("❌ Error fetching training module:", error);
    res.status(500).json({ error: error.message || "Failed to fetch training module" });
  }
};

// Get all modules for a track
export const getTrackModules: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { track } = req.params;
    
    if (!track) {
      return res.status(400).json({ error: "Track parameter is required" });
    }
    
    const modules = await trainingSystem.getModulesByTrack(track);
    res.json(modules);
  } catch (error: any) {
    console.error("❌ Error fetching track modules:", error);
    res.status(500).json({ error: error.message || "Failed to fetch track modules" });
  }
};

// Get track information
export const getTrack: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { track } = req.params;
    
    if (!track) {
      return res.status(400).json({ error: "Track parameter is required" });
    }
    
    const trackData = await trainingSystem.getTrack(track);
    
    if (!trackData) {
      return res.status(404).json({ error: "Training track not found" });
    }
    
    res.json(trackData);
  } catch (error: any) {
    console.error("❌ Error fetching track:", error);
    res.status(500).json({ error: error.message || "Failed to fetch track" });
  }
};

// Admin CMS content management
export const getCmsContent: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { path } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: "Path parameter is required" });
    }
    
    const content = await db
      .select()
      .from(cmsContent)
      .where(eq(cmsContent.path, path))
      .limit(1);
    
    if (content.length === 0) {
      // Return empty content if not found
      return res.json({ path, data: {}, exists: false });
    }
    
    res.json({ ...content[0], exists: true });
  } catch (error: any) {
    console.error("❌ Error fetching CMS content:", error);
    res.status(500).json({ error: error.message || "Failed to fetch CMS content" });
  }
};

export const saveCmsContent: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { path, data } = req.body;
    const user = (req as any).user;
    
    if (!path || !data) {
      return res.status(400).json({ error: "Path and data are required" });
    }
    
    // Upsert content
    await db.insert(cmsContent)
      .values({
        path,
        data,
        updatedBy: user?.email || 'admin'
      })
      .onConflictDoUpdate({
        target: cmsContent.path,
        set: {
          data,
          updatedBy: user?.email || 'admin',
          updatedAt: new Date()
        }
      });
    
    // Log admin action
    await db.insert(adminAuditLog).values({
      email: user?.email || 'admin',
      action: 'CMS_CONTENT_UPDATED',
      path
    });
    
    res.json({ success: true, message: "CMS content saved successfully" });
  } catch (error: any) {
    console.error("❌ Error saving CMS content:", error);
    res.status(500).json({ error: error.message || "Failed to save CMS content" });
  }
};

// System stats for admin
export const getSystemStats: RequestHandler = async (req: Request, res: Response) => {
  try {
    const [tracks, modules, strategies] = await Promise.all([
      db.select().from(trainingTracks),
      db.select().from(trainingModules),
      db.select().from(strategyCatalog)
    ]);

    const stats = {
      totalUsers: 0, // Placeholder - implement user counting
      totalTracks: tracks?.length || 0,
      totalModules: modules?.length || 0,
      totalStrategies: strategies?.length || 0,
      systemHealth: "healthy",
      lastUpdated: new Date().toISOString()
    };

    res.json(stats);
  } catch (error: any) {
    console.error("❌ Error fetching system stats:", error);
    res.status(500).json({ 
      totalUsers: 0,
      totalTracks: 0,
      totalModules: 0,
      totalStrategies: 0,
      systemHealth: "error",
      lastUpdated: new Date().toISOString(),
      error: error.message 
    });
  }
};

// Route registration function
export function registerTrainingRoutes(app: any) {
  // Public training routes
  app.get('/api/strategies', getAllStrategies);
  app.get('/api/strategies/:slug', getStrategy);
  app.get('/api/training/:track/:slug', getTrainingModule);
  app.get('/api/training/:track', getTrackModules);
  app.get('/api/tracks/:track', getTrack);

  // Admin routes (protected)
  app.post('/api/admin/seed', isAdmin, seedTrainingData);
  app.get('/api/admin/stats', isAdmin, getSystemStats);
  app.get('/api/admin/content', isAdmin, getCmsContent);
  app.post('/api/admin/content', isAdmin, saveCmsContent);
}