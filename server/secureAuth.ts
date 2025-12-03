import bcrypt from "bcrypt";
import { Express, Request, Response } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        permissions?: any;
        listingsAccess?: number[];
      };
    }
  }
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Default permissions for each role
const DEFAULT_PERMISSIONS = {
  'admin': {
    properties: { view: true, create: true, edit: true, delete: true },
    users: { view: true, create: true, edit: true, delete: true },
    finances: { view: true, create: true, edit: true, delete: true },
    bookings: { view: true, create: true, edit: true, delete: true },
    tasks: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true }
  },
  'portfolio-manager': {
    properties: { view: true, create: true, edit: true, delete: false },
    users: { view: true, create: false, edit: true, delete: false },
    finances: { view: true, create: true, edit: true, delete: false },
    bookings: { view: true, create: true, edit: true, delete: false },
    tasks: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false }
  },
  'owner': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: true, create: true, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'retail-agent': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: true, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'referral-agent': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: true, create: false, edit: false, delete: false },
    bookings: { view: true, create: true, edit: false, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false }
  },
  'staff': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: false, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: true, create: false, edit: true, delete: false },
    reports: { view: false, create: false, edit: false, delete: false }
  },
  'guest': {
    properties: { view: true, create: false, edit: false, delete: false },
    users: { view: false, create: false, edit: false, delete: false },
    finances: { view: false, create: false, edit: false, delete: false },
    bookings: { view: true, create: false, edit: false, delete: false },
    tasks: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, create: false, edit: false, delete: false }
  }
};

// Generate mock listings access based on role
function generateListingsAccess(role: string, userId: string): number[] {
  switch (role) {
    case 'admin':
    case 'portfolio-manager':
      return []; // Empty array means access to all listings
    case 'owner':
      // Owners typically have access to their own properties
      return [1, 2]; // Mock property IDs
    case 'retail-agent':
    case 'referral-agent':
      return [1, 2, 3]; // Agents have access to certain properties
    case 'staff':
      return [1]; // Staff typically assigned to specific properties
    case 'guest':
      return [1]; // Guests only see their booking property
    default:
      return [];
  }
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Role-based authorization middleware
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Forbidden", 
        required: allowedRoles, 
        current: userRole 
      });
    }
    next();
  };
}

// Permission-based authorization middleware
export function requirePermission(section: string, action: string) {
  return (req: Request, res: Response, next: Function) => {
    if (!req.user?.permissions) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sectionPermissions = req.user.permissions[section];
    if (!sectionPermissions || !sectionPermissions[action]) {
      return res.status(403).json({ 
        message: "Forbidden", 
        required: `${section}:${action}` 
      });
    }
    next();
  };
}

// Setup secure authentication routes
export function setupSecureAuth(app: Express) {
  // User session middleware - attach user to request
  app.use(async (req: Request, res: Response, next: Function) => {
    if (req.session?.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          req.user = {
            ...user,
            permissions: DEFAULT_PERMISSIONS[user.primaryRole || user.role] || DEFAULT_PERMISSIONS['guest'],
            listingsAccess: generateListingsAccess(user.primaryRole || user.role, user.id)
          };
        }
      } catch (error) {
        console.error("Error loading user from session:", error);
      }
    }
    next();
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update role if provided and user is admin
      if (role && user.primaryRole === 'admin') {
        // Admin can assume any role for testing
        user.primaryRole = role;
      }

      // Create session
      req.session.userId = user.id;
      req.session.userRole = user.primaryRole || user.role;

      // Generate response with permissions and listings access
      const authUser = {
        ...user,
        password: undefined, // Don't send password to client
        permissions: DEFAULT_PERMISSIONS[user.primaryRole || user.role] || DEFAULT_PERMISSIONS['guest'],
        listingsAccess: generateListingsAccess(user.primaryRole || user.role, user.id)
      };

      res.json({
        message: "Login successful",
        user: authUser,
        token: req.sessionID // Use session ID as token
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Update user role (admin only)
  app.put("/api/auth/users/:userId/role", 
    requireAuth, 
    requireRole(['admin']), 
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !DEFAULT_PERMISSIONS[role]) {
          return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await storage.updateUserRole(userId, role);
        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({ 
          message: "Role updated successfully", 
          user: { ...updatedUser, password: undefined } 
        });

      } catch (error) {
        console.error("Role update error:", error);
        res.status(500).json({ message: "Failed to update role" });
      }
    }
  );

  // Get user permissions
  app.get("/api/auth/permissions", requireAuth, (req: Request, res: Response) => {
    if (!req.user?.permissions) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      permissions: req.user.permissions,
      listingsAccess: req.user.listingsAccess,
      role: req.user.primaryRole || req.user.role
    });
  });
}

// Utility function to check if user can access a listing
export function canAccessListing(user: any, listingId: number): boolean {
  if (!user.listingsAccess || user.listingsAccess.length === 0) {
    return true; // Admin/PM level access
  }
  return user.listingsAccess.includes(listingId);
}