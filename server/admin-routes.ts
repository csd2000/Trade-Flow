import type { Express } from "express";
import { requireAdmin, mockLogin } from "./auth-middleware";
import { promises as fs } from "fs";
import path from "path";

export function registerAdminRoutes(app: Express) {
  // Mock login endpoint for development
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // In production, verify credentials with your auth provider
      // For now, we'll allow any email with password "admin" for testing
      if (!email || password !== "admin") {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const user = mockLogin(email);
      (req.session as any).user = user;
      
      console.log(`User logged in: ${email}, role: ${user.role}, admin emails: ${process.env.ADMIN_EMAILS}`);
      
      res.json({
        user,
        message: "Login successful"
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Get current user
  app.get('/api/auth/user', (req, res) => {
    const userSession = req.session as any;
    if (!userSession?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(userSession.user);
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin: Get content by path
  app.get('/api/admin/content', requireAdmin, async (req, res) => {
    try {
      const { path: contentPath } = req.query;
      
      if (!contentPath || typeof contentPath !== 'string') {
        return res.status(400).json({ error: "Path parameter required" });
      }

      // Map content paths to actual files
      let filePath: string;
      
      if (contentPath.startsWith('/academy/module/')) {
        // Training module content
        filePath = path.join(process.cwd(), 'data', 'training_modules.json');
      } else if (contentPath.startsWith('/strategies/')) {
        // Strategy content - check multiple possible files
        filePath = path.join(process.cwd(), 'server', 'real-training-data.ts');
      } else {
        return res.status(404).json({ error: "Content path not found" });
      }

      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        let data;
        
        if (filePath.endsWith('.json')) {
          data = JSON.parse(fileContent);
        } else if (filePath.endsWith('.ts')) {
          // For TypeScript files, we'll extract the exported data
          // This is a simplified approach - in production you might use a proper parser
          data = { 
            content: fileContent,
            type: 'typescript',
            message: 'TypeScript file content - edit with caution'
          };
        }

        res.json({
          path: contentPath,
          data,
          lastModified: (await fs.stat(filePath)).mtime,
          updatedBy: req.user?.email
        });
      } catch (fileError) {
        res.status(404).json({ error: "Content file not found" });
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Admin: Update content
  app.post('/api/admin/content', requireAdmin, async (req, res) => {
    try {
      const { path: contentPath, data } = req.body;
      
      if (!contentPath || !data) {
        return res.status(400).json({ error: "Path and data required" });
      }

      // Map content paths to actual files
      let filePath: string;
      
      if (contentPath.startsWith('/academy/module/')) {
        filePath = path.join(process.cwd(), 'data', 'training_modules.json');
      } else {
        return res.status(400).json({ error: "Invalid content path for editing" });
      }

      // Backup current file
      const backupPath = `${filePath}.backup.${Date.now()}`;
      try {
        const currentContent = await fs.readFile(filePath, 'utf-8');
        await fs.writeFile(backupPath, currentContent);
      } catch (backupError) {
        console.warn('Could not create backup:', backupError);
      }

      // Write new content
      const contentToWrite = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, contentToWrite);

      // Log the change
      console.log(`Admin ${req.user?.email} updated content at ${contentPath}`);

      res.json({
        path: contentPath,
        message: "Content updated successfully",
        updatedBy: req.user?.email,
        timestamp: new Date().toISOString(),
        backupCreated: backupPath
      });
    } catch (error) {
      console.error('Error updating content:', error);
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  // Admin: Get all training modules
  app.get('/api/admin/training-modules', requireAdmin, async (req, res) => {
    try {
      const filePath = path.join(process.cwd(), 'data', 'training_modules.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      res.json({
        modules: data.modules || [],
        totalModules: data.modules?.length || 0,
        lastModified: (await fs.stat(filePath)).mtime
      });
    } catch (error) {
      console.error('Error fetching training modules:', error);
      res.status(500).json({ error: "Failed to fetch training modules" });
    }
  });

  // Admin: Get strategies for management
  app.get('/api/admin/strategies', requireAdmin, async (req, res) => {
    try {
      const strategies = await enhancedStorage.getAllStrategies();
      res.json({
        strategies,
        totalStrategies: strategies.length
      });
    } catch (error) {
      console.error('Error fetching strategies:', error);
      res.status(500).json({ error: "Failed to fetch strategies" });
    }
  });

  // Admin: Get system stats
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      // Get various system statistics
      const stats = {
        totalUsers: 0, // Would come from your user storage
        totalStrategies: 0,
        totalModules: 0,
        systemHealth: 'healthy',
        lastUpdated: new Date().toISOString()
      };

      try {
        const strategies = await enhancedStorage.getAllStrategies();
        stats.totalStrategies = strategies.length;
      } catch (e) {
        console.warn('Could not fetch strategy count:', e);
      }

      try {
        // Count modules from database instead of JSON file
        const { db, schema } = await import('./db');
        const modules = await db.select().from(schema.trainingModules);
        stats.totalModules = modules.length;
      } catch (e) {
        console.warn('Could not fetch module count:', e);
      }

      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: "Failed to fetch system statistics" });
    }
  });

  // Admin: Expand all training modules with comprehensive content
  app.post('/api/admin/expand-modules', requireAdmin, async (req, res) => {
    try {
      console.log('🚀 Starting module expansion...');
      const { expandAllModules } = await import('./expand-all-modules');
      const result = await expandAllModules();
      res.json({
        success: true,
        message: "All modules expanded successfully",
        ...result
      });
    } catch (error) {
      console.error('Error expanding modules:', error);
      res.status(500).json({ error: "Failed to expand modules" });
    }
  });
}

// Import enhanced storage (this will be available after routes are set up)
let enhancedStorage: any;
try {
  enhancedStorage = require('./enhanced-storage').enhancedStorage;
} catch (e) {
  console.warn('Enhanced storage not available for admin routes');
  enhancedStorage = {
    getAllStrategies: () => Promise.resolve([])
  };
}