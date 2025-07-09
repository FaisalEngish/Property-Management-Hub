import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { seedDemoCommissionData } from "./seedDemoCommissionData";
import { seedUtilityData } from "./seedUtilityData";

// Demo users for testing
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
    firstName: "Portfolio",
    lastName: "Manager",
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
    id: "staff-cleaning",
    email: "test_cleaning@example.com",
    password: "test123",
    firstName: "Maria",
    lastName: "Santos",
    role: "staff",
    organizationId: "default-org",
    profileImageUrl: null,
    department: "cleaning",
  },
  {
    id: "staff-pool",
    email: "test_pool@example.com", 
    password: "test123",
    firstName: "John",
    lastName: "Pool",
    role: "staff",
    organizationId: "default-org",
    profileImageUrl: null,
    department: "pool",
  },
  {
    id: "staff-garden",
    email: "test_garden@example.com",
    password: "test123", 
    firstName: "Green",
    lastName: "Thumb",
    role: "staff",
    organizationId: "default-org",
    profileImageUrl: null,
    department: "garden",
  },
  {
    id: "staff-maintenance",
    email: "test_maintenance@example.com",
    password: "test123",
    firstName: "Fix",
    lastName: "All",
    role: "staff",
    organizationId: "default-org", 
    profileImageUrl: null,
    department: "maintenance",
  },
  {
    id: "demo-agent",
    email: "retail@demo.com",
    password: "123456",
    firstName: "Test Retail",
    lastName: "Agent",
    role: "retail-agent", 
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "demo-referral",
    email: "referral@demo.com",
    password: "123456",
    firstName: "Test Referral", 
    lastName: "Agent",
    role: "referral-agent",
    organizationId: "default-org", 
    profileImageUrl: null,
  },
  {
    id: "demo-guest",
    email: "guest@hostpilotpro.com",
    password: "guest123",
    firstName: "Guest",
    lastName: "User",
    role: "guest",
    organizationId: "default-org",
    profileImageUrl: null,
  },
  {
    id: "agent1",
    email: "agent1@example.com",
    password: "test123",
    firstName: "Agent",
    lastName: "One",
    role: "retail-agent",
    organizationId: "default-org",
    profileImageUrl: null,
  },
];

// Demo session configuration
export function getDemoSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store to avoid database timeout issues
  return session({
    secret: process.env.SESSION_SECRET || "demo-secret-key",
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

  // Regular login route (matches database)
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      // Check against database users directly
      const { db } = await import("./db");
      const { users: usersTable } = await import("@shared/schema");
      const dbUsers = await db.select().from(usersTable);
      const user = dbUsers.find(u => u.email === email && u.password === password && u.organizationId === 'default-org');
      
      if (!user) {
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
            organizationId: user.organizationId,
          }
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

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

  // Regular logout route
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful", redirectUrl: "/" });
    });
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