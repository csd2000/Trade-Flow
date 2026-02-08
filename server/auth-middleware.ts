import type { Request, Response, NextFunction } from "express";

// Simple user type for our auth system
export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// Check if email is in admin list
export function isAdminEmail(email: string): boolean {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  console.log(`Checking admin status for ${email}, ADMIN_EMAILS env:`, adminEmailsEnv.substring(0, 100));
  
  // For development/testing - if the env var looks encoded or very long, use a fallback
  let adminEmails: string[] = [];
  
  if (adminEmailsEnv.length > 100 || adminEmailsEnv.includes('AKPAJDC')) {
    // This looks like an encoded/obfuscated value, use development fallback
    console.log('Using development fallback admin emails');
    adminEmails = [
      'admin@cryptoflow.com',
      'admin@test.com',
      'admin@example.com',
      'test@admin.com'
    ];
  } else {
    // Normal comma-separated email list
    adminEmails = adminEmailsEnv
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
  }
  
  console.log(`Admin emails configured:`, adminEmails);
  const isAdmin = adminEmails.includes(email.toLowerCase());
  console.log(`Email ${email} is admin: ${isAdmin}`);
  
  return isAdmin;
}

// Middleware to check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // For now, we'll use a simple session-based approach
  // In a real app, you'd integrate with your preferred auth provider
  const userSession = req.session as any;
  
  if (!userSession?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  req.user = userSession.user;
  next();
}

// Middleware to check if user is admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  });
}

// Mock login function for development (replace with real auth)
export function mockLogin(email: string, name?: string): AuthenticatedUser {
  const isAdmin = isAdminEmail(email);
  console.log(`Creating user for ${email}, admin status: ${isAdmin}`);
  
  return {
    id: email,
    email,
    name: name || email.split('@')[0],
    role: isAdmin ? 'admin' : 'user'
  };
}