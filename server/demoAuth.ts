import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { seedDemoCommissionData } from "./seedDemoCommissionData";
import { seedUtilityData } from "./seedUtilityData";

// Demo users for testing - Limited to one sample per user type
export const DEMO_USERS = [
  {
    id: "demo-admin",
    email: "admin@test.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-pm",
    email: "manager@test.com", 
    password: "manager123",
    firstName: "JOHN",
    lastName: "DO",
    role: "portfolio-manager",
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-owner",
    email: "owner@test.com",
    password: "owner123", 
    firstName: "Property",
    lastName: "Owner",
    role: "owner",
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-staff",
    email: "staff@test.com",
    password: "staff123",
    firstName: "Staff",
    lastName: "Member", 
    role: "staff",
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-retail-agent",
    email: "retail@test.com",
    password: "retail123",
    firstName: "Retail",
    lastName: "Agent",
    role: "retail-agent", 
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-referral-agent",
    email: "referral@test.com",
    password: "referral123",
    firstName: "Referral", 
    lastName: "Agent",
    role: "referral-agent",
    organizationId: "default-org", 
    profileImageUrl: null,
  },
];

// Demo session configuration
export function getDemoSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || "demo-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for development
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

  // Seed demo users
  await seedDemoUsers();
  
  // Seed demo commission data
  await seedDemoCommissionData();
  await seedUtilityData();

  // Demo login route
  app.post("/api/auth/demo-login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (!demoUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      req.session.userId = demoUser.id;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
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
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Demo logout route  
  app.post("/api/auth/demo-logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful", redirectUrl: "/" });
    });
  });

  // GET logout route for direct navigation
  app.get("/api/auth/demo-logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.redirect("/");
    });
  });

  // Get demo users list (for login page)
  app.get("/api/auth/demo-users", (req, res) => {
    const safeUsers = DEMO_USERS.map(user => ({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }));
    res.json(safeUsers);
  });

  // Get current authenticated user
  app.get("/api/auth/user", async (req: any, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
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

  // Auto-login demo user for development (optional fallback)
  app.post("/api/auth/auto-demo-login", async (req: any, res) => {
    try {
      const demoUser = DEMO_USERS[0]; // Login as admin by default
      
      req.session.userId = demoUser.id;
      req.session.save((err: any) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        
        res.json({ 
          message: "Auto-login successful", 
          user: {
            id: demoUser.id,
            email: demoUser.email,
            firstName: demoUser.firstName,
            lastName: demoUser.lastName,
            role: demoUser.role,
          }
        });
      });
    } catch (error) {
      console.error("Auto-login error:", error);
      res.status(500).json({ message: "Auto-login failed" });
    }
  });
}

// Seed demo users into database
async function seedDemoUsers() {
  try {
    for (const demoUser of DEMO_USERS) {
      await storage.upsertUser({
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        organizationId: demoUser.organizationId,
        profileImageUrl: demoUser.profileImageUrl,
      });
    }
    console.log("Demo users seeded successfully");
  } catch (error) {
    console.error("Error seeding demo users:", error);
  }
}