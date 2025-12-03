import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { seedDemoCommissionData } from "./seedDemoCommissionData";
import { seedUtilityData } from "./seedUtilityData";

// Demo users for quick login - these are in-memory only and don't need database passwords
export const DEMO_USERS = [
  {
    id: "demo-admin",
    organizationId: "default-org",
    email: "admin@hostpilot.com",
    password: "demo123",
    firstName: "Admin",
    lastName: "Demo",
    role: "admin",
    profileImageUrl: null,
  },
  {
    id: "demo-owner",
    organizationId: "default-org",
    email: "owner@hostpilot.com",
    password: "demo123",
    firstName: "Property",
    lastName: "Owner",
    role: "owner",
    profileImageUrl: null,
  },
  {
    id: "demo-manager",
    organizationId: "default-org",
    email: "manager@hostpilot.com",
    password: "demo123",
    firstName: "Property",
    lastName: "Manager",
    role: "property_manager",
    profileImageUrl: null,
  },
  {
    id: "demo-cleaner",
    organizationId: "default-org",
    email: "cleaner@hostpilot.com",
    password: "demo123",
    firstName: "Cleaning",
    lastName: "Staff",
    role: "cleaner",
    profileImageUrl: null,
  },
];

// Detect production environment (Render, Railway, etc.)
export function isProductionEnvironment(): boolean {
  // RENDER is set as 'true' (string) by Render.com when deployed
  // Check for both NODE_ENV and RENDER flag
  const isProduction = process.env.NODE_ENV === 'production' || 
                       !!process.env.RENDER || // Render sets this variable when deployed
                       process.env.RAILWAY_ENVIRONMENT === 'production';
  return isProduction;
}

// Centralized cookie options - used by both session and logout
export function getCookieOptions() {
  const isProduction = isProductionEnvironment();
  return {
    httpOnly: true,
    secure: isProduction, // true for HTTPS (Render), false for HTTP (dev)
    sameSite: 'lax' as const, // 'lax' works for same-origin (frontend+backend on same domain)
    path: '/',
  };
}

// Demo session configuration - works on both Replit and Render
export function getDemoSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Auto-create sessions table if missing
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const isProduction = isProductionEnvironment();
  const cookieOptions = getCookieOptions();
  
  console.log(`🔐 Session config: isProduction=${isProduction}, NODE_ENV=${process.env.NODE_ENV}, RENDER=${process.env.RENDER}`);
  
  return session({
    secret: process.env.SESSION_SECRET || "hostpilot-secure-secret-key-2024",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'hostpilot.sid',
    proxy: isProduction, // Trust the proxy in production (Render)
    cookie: {
      ...cookieOptions,
      maxAge: sessionTtl,
    },
  });
}

// Demo authentication middleware
export const isDemoAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // First check if it's a demo user (in-memory)
    const demoUser = DEMO_USERS.find(u => u.id === req.session.userId);
    if (demoUser) {
      req.user = demoUser;
      return next();
    }

    // Otherwise check database
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Setup demo authentication routes
export async function setupDemoAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getDemoSession());

  // Demo seeding disabled for production - all data comes from database
  console.log("✅ Demo seeding disabled - production mode active");

  // Demo login route
  app.post("/api/auth/demo-login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      const cookieOptions = getCookieOptions();
      console.log(`🔑 Login attempt for: ${email}, production=${isProductionEnvironment()}, secure=${cookieOptions.secure}`);
      
      // First check demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        req.session.userId = demoUser.id;
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          
          console.log(`✅ Demo user logged in: ${demoUser.id}, sessionID: ${req.sessionID}`);
          res.json({ 
            message: "Login successful", 
            redirectUrl: "/",
            user: {
              id: demoUser.id,
              email: demoUser.email,
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
              role: demoUser.role,
            }
          });
        });
        return;
      }

      // If not a demo user, check database
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password with bcrypt
      const bcrypt = await import('bcrypt');
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        res.json({ 
          message: "Login successful", 
          redirectUrl: "/",
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Demo logout route  
  app.post("/api/auth/demo-logout", (req: any, res) => {
    const sessionId = req.session?.userId;
    console.log(`🚪 Logout requested for user: ${sessionId}`);
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear cookie with same options used to set it (critical for production HTTPS)
      const cookieOptions = getCookieOptions();
      res.clearCookie('hostpilot.sid', cookieOptions);
      console.log(`✅ Session destroyed and cookie cleared for user: ${sessionId} (secure=${cookieOptions.secure})`);
      res.json({ message: "Logout successful", redirectUrl: "/" });
    });
  });

  // GET logout route for direct navigation
  app.get("/api/auth/demo-logout", (req: any, res) => {
    const sessionId = req.session?.userId;
    console.log(`🚪 GET Logout requested for user: ${sessionId}`);
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      // Clear cookie with same options used to set it (critical for production HTTPS)
      const cookieOptions = getCookieOptions();
      res.clearCookie('hostpilot.sid', cookieOptions);
      console.log(`✅ Session destroyed and cookie cleared for user: ${sessionId} (secure=${cookieOptions.secure})`);
      res.redirect("/");
    });
  });

  // Demo users endpoint - returns available demo accounts for quick login
  app.get("/api/auth/demo-users", (req, res) => {
    // Return demo users without passwords
    const safeUsers = DEMO_USERS.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
    }));
    res.json(safeUsers);
  });

  // Get current authenticated user
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // First check if it's a demo user (in-memory)
      const demoUser = DEMO_USERS.find(u => u.id === req.session.userId);
      if (demoUser) {
        return res.json({
          id: demoUser.id,
          organizationId: demoUser.organizationId,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          role: demoUser.role,
          profileImageUrl: demoUser.profileImageUrl,
          isActive: true,
          permissions: [],
          listingsAccess: []
        });
      }

      // Otherwise check database
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        organizationId: user.organizationId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        permissions: [],
        listingsAccess: []
      });
    } catch (error) {
      console.error("Auth user error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  // Auto-login disabled for production
  app.post("/api/auth/auto-demo-login", async (req: any, res) => {
    res.status(403).json({ message: "Auto-login disabled in production mode" });
  });
}