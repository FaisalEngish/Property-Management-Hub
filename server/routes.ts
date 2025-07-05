import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated as prodAuth } from "./replitAuth";
import { setupDemoAuth, isDemoAuthenticated } from "./demoAuth";
import { authenticatedTenantMiddleware, getTenantContext } from "./multiTenant";
import { insertPropertySchema, insertTaskSchema, insertBookingSchema, insertFinanceSchema, insertPlatformSettingSchema, insertAddonServiceSchema, insertAddonBookingSchema, insertUtilityBillSchema, insertPropertyUtilityAccountSchema, insertUtilityBillReminderSchema, insertOwnerActivityTimelineSchema, insertOwnerPayoutRequestSchema, insertOwnerInvoiceSchema, insertOwnerPreferencesSchema, insertGuestServiceRequestSchema, insertGuestConfirmedServiceSchema, insertBookingLinkedTaskSchema } from "@shared/schema";
import { z } from "zod";
import { CrossSyncedTaskVisibilityStorage } from "./crossSyncedTaskVisibility";
import { seedThailandUtilityProviders } from "./seedThailandUtilityProviders";
import { seedVillaSamuiDemo } from "./seedVillaSamuiDemo";
import { UserManagementStorage } from "./userManagementStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup demo authentication (for development/testing)
  await setupDemoAuth(app);
  
  // Also setup production auth (fallback)
  await setupAuth(app);

  // Seed Thailand utility providers on startup
  await seedThailandUtilityProviders("default-org");
  
  // Seed Villa Aruna demo data
  const { seedVillaArunaDemo } = await import("./seedVillaArunaDemo");
  await seedVillaArunaDemo();

  // Seed Extended Utilities demo data
  // const { seedExtendedUtilitiesDemo } = await import("./seedExtendedUtilitiesDemo");
  // await seedExtendedUtilitiesDemo();

  // Auth routes
  app.get('/api/auth/user', isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ===== USER MANAGEMENT SYSTEM ROUTES =====

  // Middleware for admin-only operations
  const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Middleware for portfolio manager or admin access
  const requirePortfolioManagerOrAdmin = (req: any, res: any, next: any) => {
    if (!['admin', 'portfolio-manager'].includes(req.user?.role)) {
      return res.status(403).json({ message: "Portfolio Manager or Admin access required" });
    }
    next();
  };

  // Get all users with filtering and search
  app.get("/api/user-management/users", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const filters = {
        search: req.query.search as string,
        role: req.query.role as string,
        propertyId: req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const users = await userMgmt.getAllUsers(filters);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/user-management/users/:userId", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const user = await userMgmt.getUserById(req.params.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user role
  app.put("/api/user-management/users/:userId/role", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const { primaryRole, subRole } = req.body;
      const userId = req.params.userId;
      const assignedBy = req.user.id;

      // Check if user has existing role
      const existingUser = await userMgmt.getUserById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let result;
      if (existingUser.userRole) {
        // Update existing role
        result = await userMgmt.updateUserRole(userId, { primaryRole, subRole, assignedBy });
      } else {
        // Assign new role
        result = await userMgmt.assignUserRole({ userId, primaryRole, subRole, assignedBy });
      }

      if (!result) {
        return res.status(500).json({ message: "Failed to update role" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Update user permissions
  app.put("/api/user-management/users/:userId/permissions", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const { moduleAccess } = req.body;
      const userId = req.params.userId;
      const updatedBy = req.user.id;

      const result = await userMgmt.updateUserPermissions(userId, moduleAccess, updatedBy);
      if (!result) {
        return res.status(500).json({ message: "Failed to update permissions" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ message: "Failed to update user permissions" });
    }
  });

  // Update user status (activate/deactivate)
  app.put("/api/user-management/users/:userId/status", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const { isActive } = req.body;
      const userId = req.params.userId;
      const updatedBy = req.user.id;

      const success = await userMgmt.updateUserStatus(userId, isActive, updatedBy);
      if (!success) {
        return res.status(500).json({ message: "Failed to update user status" });
      }

      res.json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Assign property to user
  app.post("/api/user-management/users/:userId/properties", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const { propertyId, assignmentType, startDate, endDate } = req.body;
      const userId = req.params.userId;
      const assignedBy = req.user.id;

      const assignment = await userMgmt.assignUserToProperty({
        userId,
        propertyId,
        assignmentType,
        startDate: startDate || null,
        endDate: endDate || null,
        assignedBy,
      });

      res.json(assignment);
    } catch (error) {
      console.error("Error assigning property to user:", error);
      res.status(500).json({ message: "Failed to assign property to user" });
    }
  });

  // Remove property assignment
  app.delete("/api/user-management/users/:userId/properties/:propertyId", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const userId = req.params.userId;
      const propertyId = parseInt(req.params.propertyId);

      const success = await userMgmt.removeUserFromProperty(userId, propertyId);
      if (!success) {
        return res.status(500).json({ message: "Failed to remove property assignment" });
      }

      res.json({ success: true, message: "Property assignment removed successfully" });
    } catch (error) {
      console.error("Error removing property assignment:", error);
      res.status(500).json({ message: "Failed to remove property assignment" });
    }
  });

  // Get user activity history
  app.get("/api/user-management/users/:userId/activity", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const userId = req.params.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      const activities = await userMgmt.getUserActivityHistory(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Failed to fetch user activity" });
    }
  });

  // Send user invitation
  app.post("/api/user-management/invitations", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const { email, roleAssignment, subRoleAssignment, propertyAssignments, modulePermissions, expiresAt } = req.body;
      const invitedBy = req.user.id;

      const invitation = await userMgmt.createUserInvitation({
        email,
        roleAssignment,
        subRoleAssignment: subRoleAssignment || null,
        propertyAssignments: propertyAssignments || null,
        modulePermissions: modulePermissions || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        invitedBy,
      });

      res.json(invitation);
    } catch (error) {
      console.error("Error sending invitation:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  // Get pending invitations
  app.get("/api/user-management/invitations", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const invitations = await userMgmt.getPendingInvitations();
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  // Accept invitation (public endpoint)
  app.post("/api/user-management/invitations/:inviteCode/accept", async (req: any, res) => {
    try {
      // This would normally be called after user authentication via invitation link
      // For now, we'll just mark it as accepted
      const { inviteCode } = req.params;
      
      // You would implement the logic to:
      // 1. Find invitation by code
      // 2. Create user account if needed
      // 3. Assign role and permissions
      // 4. Mark invitation as accepted
      
      res.json({ message: "Invitation system ready - requires full authentication flow" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // FREELANCER MANAGEMENT

  // Get freelancer task requests
  app.get("/api/user-management/freelancer-requests", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const freelancerId = req.query.freelancerId as string;
      const status = req.query.status as string;

      const requests = await userMgmt.getFreelancerTaskRequests(freelancerId, status);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching freelancer requests:", error);
      res.status(500).json({ message: "Failed to fetch freelancer requests" });
    }
  });

  // Create freelancer task request
  app.post("/api/user-management/freelancer-requests", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const requestData = {
        ...req.body,
        requestedBy: req.user.id,
      };

      const request = await userMgmt.createFreelancerTaskRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating freelancer request:", error);
      res.status(500).json({ message: "Failed to create freelancer request" });
    }
  });

  // Update freelancer task request
  app.put("/api/user-management/freelancer-requests/:requestId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const requestId = parseInt(req.params.requestId);
      const updates = req.body;

      const request = await userMgmt.updateFreelancerTaskRequest(requestId, updates);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error("Error updating freelancer request:", error);
      res.status(500).json({ message: "Failed to update freelancer request" });
    }
  });

  // Get freelancer availability
  app.get("/api/user-management/freelancers/:freelancerId/availability", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const freelancerId = req.params.freelancerId;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      const availability = await userMgmt.getFreelancerAvailability(freelancerId, startDate, endDate);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching freelancer availability:", error);
      res.status(500).json({ message: "Failed to fetch freelancer availability" });
    }
  });

  // Update freelancer availability
  app.post("/api/user-management/freelancers/:freelancerId/availability", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const freelancerId = req.params.freelancerId;
      
      // Check if user is updating their own availability or is admin/PM
      if (req.user.id !== freelancerId && !['admin', 'portfolio-manager'].includes(req.user.role)) {
        return res.status(403).json({ message: "Can only update your own availability" });
      }

      const availabilityData = {
        ...req.body,
        freelancerId,
      };

      const availability = await userMgmt.updateFreelancerAvailability(availabilityData);
      res.json(availability);
    } catch (error) {
      console.error("Error updating freelancer availability:", error);
      res.status(500).json({ message: "Failed to update freelancer availability" });
    }
  });

  // AUDIT AND REPORTING

  // Get system activity log
  app.get("/api/user-management/audit-log", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      const activities = await userMgmt.getSystemActivityLog(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // Get user performance metrics
  app.get("/api/user-management/users/:userId/performance", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const userId = req.params.userId;
      const periodYear = req.query.year ? parseInt(req.query.year as string) : undefined;
      const periodMonth = req.query.month ? parseInt(req.query.month as string) : undefined;

      const metrics = await userMgmt.getUserPerformanceMetrics(userId, periodYear, periodMonth);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching user performance:", error);
      res.status(500).json({ message: "Failed to fetch user performance" });
    }
  });

  // Update user performance metrics (usually called by system jobs)
  app.post("/api/user-management/users/:userId/performance", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const userMgmt = new UserManagementStorage(organizationId);
      
      const userId = req.params.userId;
      const metricsData = {
        ...req.body,
        userId,
      };

      const metrics = await userMgmt.updateUserPerformanceMetrics(metricsData);
      res.json(metrics);
    } catch (error) {
      console.error("Error updating user performance:", error);
      res.status(500).json({ message: "Failed to update user performance" });
    }
  });

  // Property routes
  app.get("/api/properties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const userId = req.user?.id;
      
      let properties;
      if (user?.role === 'admin' || user?.role === 'portfolio-manager') {
        properties = await storage.getProperties();
      } else {
        properties = await storage.getPropertiesByOwner(userId);
      }
      
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const propertyData = insertPropertySchema.parse({ ...req.body, ownerId: userId });
      const property = await storage.createProperty(propertyData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put("/api/properties/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const propertyData = req.body;
      const property = await storage.updateProperty(id, propertyData);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete("/api/properties/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Task routes
  app.get("/api/tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      let tasks;
      if (user?.role === 'staff') {
        tasks = await storage.getTasksByAssignee(userId);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskData = insertTaskSchema.parse({ ...req.body, createdBy: userId });
      const task = await storage.createTask(taskData);
      
      // Send notification to assigned user
      if (task.assignedTo && task.assignedTo !== userId) {
        await storage.notifyTaskAssignment(task.id, task.assignedTo, userId);
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const taskData = req.body;
      const task = await storage.updateTask(id, taskData);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Enhanced task management routes
  app.patch("/api/tasks/:id/complete", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const id = parseInt(req.params.id);
      const { evidencePhotos = [], issuesFound = [], notes } = req.body;
      
      const task = await storage.completeTask(id, userData.claims.sub, evidencePhotos, issuesFound, notes);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.patch("/api/tasks/:id/skip", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Skip reason is required" });
      }
      
      const task = await storage.skipTask(id, userData.claims.sub, reason);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error skipping task:", error);
      res.status(500).json({ message: "Failed to skip task" });
    }
  });

  app.patch("/api/tasks/:id/reschedule", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const id = parseInt(req.params.id);
      const { newDate, reason } = req.body;
      
      if (!newDate || !reason) {
        return res.status(400).json({ message: "New date and reason are required" });
      }
      
      const task = await storage.rescheduleTask(id, userData.claims.sub, new Date(newDate), reason);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error rescheduling task:", error);
      res.status(500).json({ message: "Failed to reschedule task" });
    }
  });

  app.patch("/api/tasks/:id/start", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const id = parseInt(req.params.id);
      
      const task = await storage.startTask(id, userData.claims.sub);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ message: "Failed to start task" });
    }
  });

  // Task history routes
  app.get("/api/tasks/:id/history", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const history = await storage.getTaskHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });

  app.get("/api/properties/:id/task-history", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const history = await storage.getTaskHistoryByProperty(propertyId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching property task history:", error);
      res.status(500).json({ message: "Failed to fetch property task history" });
    }
  });

  // Booking routes
  app.get("/api/bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Finance routes
  app.get("/api/finances", isDemoAuthenticated, async (req, res) => {
    try {
      const finances = await storage.getFinances();
      res.json(finances);
    } catch (error) {
      console.error("Error fetching finances:", error);
      res.status(500).json({ message: "Failed to fetch finances" });
    }
  });

  app.post("/api/finances", isDemoAuthenticated, async (req, res) => {
    try {
      const financeData = insertFinanceSchema.parse(req.body);
      const finance = await storage.createFinance(financeData);
      res.status(201).json(finance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid finance data", errors: error.errors });
      }
      console.error("Error creating finance record:", error);
      res.status(500).json({ message: "Failed to create finance record" });
    }
  });

  // Inventory routes (legacy route - now handled by specific inventory endpoints below)
  app.get("/api/inventory/:propertyId", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      const inventory = await storage.getInventoryByProperty(propertyId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // ==================== OWNER ONBOARDING SYSTEM ROUTES ====================

  // Get owner onboarding processes
  app.get("/api/owner-onboarding/processes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = "demo-org";
      
      // Admin/PM can see all processes, owners only see their own
      let processes;
      if (user?.role === 'admin' || user?.role === 'portfolio-manager') {
        processes = await storage.getOwnerOnboardingProcesses(organizationId);
      } else if (user?.role === 'owner') {
        processes = await storage.getOwnerOnboardingProcesses(organizationId, { ownerId: user.id });
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(processes);
    } catch (error) {
      console.error("Error fetching onboarding processes:", error);
      res.status(500).json({ message: "Failed to fetch onboarding processes" });
    }
  });

  // Get specific onboarding process
  app.get("/api/owner-onboarding/processes/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const process = await storage.getOwnerOnboardingProcess(parseInt(id));
      if (!process) {
        return res.status(404).json({ message: "Onboarding process not found" });
      }
      
      // Check access permissions
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager' && process.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(process);
    } catch (error) {
      console.error("Error fetching onboarding process:", error);
      res.status(500).json({ message: "Failed to fetch onboarding process" });
    }
  });

  // Create new onboarding process
  app.post("/api/owner-onboarding/processes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Only admin/PM can create new onboarding processes
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const processData = {
        ...req.body,
        organizationId: "demo-org",
        createdBy: user.id,
        currentStep: 1,
        status: 'in_progress' as const
      };
      
      const process = await storage.createOwnerOnboardingProcess(processData);
      res.status(201).json(process);
    } catch (error) {
      console.error("Error creating onboarding process:", error);
      res.status(500).json({ message: "Failed to create onboarding process" });
    }
  });

  // Update onboarding process
  app.put("/api/owner-onboarding/processes/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.user;
      
      const process = await storage.getOwnerOnboardingProcess(parseInt(id));
      if (!process) {
        return res.status(404).json({ message: "Onboarding process not found" });
      }
      
      // Check access permissions
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager' && process.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedProcess = await storage.updateOwnerOnboardingProcess(parseInt(id), req.body);
      res.json(updatedProcess);
    } catch (error) {
      console.error("Error updating onboarding process:", error);
      res.status(500).json({ message: "Failed to update onboarding process" });
    }
  });

  // Get onboarding step details
  app.get("/api/owner-onboarding/processes/:processId/steps", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { processId } = req.params;
      const user = req.user;
      const organizationId = "demo-org";
      
      const process = await storage.getOwnerOnboardingProcess(parseInt(processId));
      if (!process) {
        return res.status(404).json({ message: "Onboarding process not found" });
      }
      
      // Check access permissions
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager' && process.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const steps = await storage.getOnboardingStepDetails(organizationId, { processId: parseInt(processId) });
      res.json(steps);
    } catch (error) {
      console.error("Error fetching onboarding steps:", error);
      res.status(500).json({ message: "Failed to fetch onboarding steps" });
    }
  });

  // Update onboarding step
  app.put("/api/owner-onboarding/steps/:stepId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { stepId } = req.params;
      const user = req.user;
      
      const step = await storage.getOnboardingStepDetail(parseInt(stepId));
      if (!step) {
        return res.status(404).json({ message: "Onboarding step not found" });
      }
      
      const process = await storage.getOwnerOnboardingProcess(step.processId);
      if (!process) {
        return res.status(404).json({ message: "Associated onboarding process not found" });
      }
      
      // Check access permissions
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager' && process.ownerId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedStep = await storage.updateOnboardingStepDetail(parseInt(stepId), {
        ...req.body,
        updatedBy: user.id,
        updatedAt: new Date()
      });
      
      res.json(updatedStep);
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      res.status(500).json({ message: "Failed to update onboarding step" });
    }
  });

  // Get owner documents
  app.get("/api/owner-onboarding/documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = "demo-org";
      const { ownerId, category, processId } = req.query;
      
      const filters: any = {};
      if (ownerId) filters.ownerId = ownerId as string;
      if (category) filters.category = category as string;
      if (processId) filters.processId = parseInt(processId as string);
      
      // Owners can only see their own documents
      if (user?.role === 'owner') {
        filters.ownerId = user.id;
      }
      
      const documents = await storage.getOwnerDocuments(organizationId, filters);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching owner documents:", error);
      res.status(500).json({ message: "Failed to fetch owner documents" });
    }
  });

  // Upload owner document
  app.post("/api/owner-onboarding/documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      const documentData = {
        ...req.body,
        organizationId: "demo-org",
        uploadedBy: user.id,
        status: 'pending' as const
      };
      
      const document = await storage.createOwnerDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading owner document:", error);
      res.status(500).json({ message: "Failed to upload owner document" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", isDemoAuthenticated, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const bookings = await storage.getBookings();
      const tasks = await storage.getTasks();
      const finances = await storage.getFinances();

      const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'checked-in');
      const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress');
      
      const monthlyRevenue = finances
        .filter(f => f.type === 'income' && new Date(f.date).getMonth() === new Date().getMonth())
        .reduce((sum, f) => sum + parseFloat(f.amount || '0'), 0);

      res.json({
        totalProperties: properties.length,
        activeBookings: activeBookings.length,
        pendingTasks: pendingTasks.length,
        monthlyRevenue: monthlyRevenue,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Platform Settings routes (Admin only)
  app.get("/api/admin/settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const settings = await storage.getPlatformSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  app.get("/api/admin/settings/:category", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { category } = req.params;
      const settings = await storage.getPlatformSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings by category:", error);
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  app.put("/api/admin/settings/:key", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { key } = req.params;
      const settingData = insertPlatformSettingSchema.parse({
        ...req.body,
        settingKey: key,
        updatedBy: userId,
      });
      
      const setting = await storage.upsertPlatformSetting(settingData);
      res.json(setting);
    } catch (error) {
      console.error("Error updating platform setting:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update platform setting" });
      }
    }
  });

  app.delete("/api/admin/settings/:key", isDemoAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { key } = req.params;
      const deleted = await storage.deletePlatformSetting(key);
      
      if (!deleted) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      console.error("Error deleting platform setting:", error);
      res.status(500).json({ message: "Failed to delete platform setting" });
    }
  });

  // Hostaway API routes
  app.post("/api/hostaway/sync", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const { syncHostawayData } = await import("./hostaway");
      const result = await syncHostawayData(req, userId);
      
      res.json({
        message: "Hostaway sync completed successfully",
        ...result
      });
    } catch (error) {
      console.error("Error syncing Hostaway data:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to sync Hostaway data"
      });
    }
  });

  app.get("/api/hostaway/properties", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { getHostawayAPI } = await import("./hostaway");
      const hostaway = await getHostawayAPI(req);
      
      if (!hostaway) {
        return res.status(404).json({ message: "Hostaway API not configured" });
      }

      const properties = await hostaway.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching Hostaway properties:", error);
      res.status(500).json({ message: "Failed to fetch Hostaway properties" });
    }
  });

  app.get("/api/hostaway/bookings", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { getHostawayAPI } = await import("./hostaway");
      const hostaway = await getHostawayAPI(req);
      
      if (!hostaway) {
        return res.status(404).json({ message: "Hostaway API not configured" });
      }

      const bookings = await hostaway.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching Hostaway bookings:", error);
      res.status(500).json({ message: "Failed to fetch Hostaway bookings" });
    }
  });

  app.get("/api/hostaway/calendar", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { getHostawayAPI } = await import("./hostaway");
      const hostaway = await getHostawayAPI(req);
      
      if (!hostaway) {
        return res.status(404).json({ message: "Hostaway API not configured" });
      }

      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      const calendar = await hostaway.getCalendar(propertyId);
      res.json(calendar);
    } catch (error) {
      console.error("Error fetching Hostaway calendar:", error);
      res.status(500).json({ message: "Failed to fetch Hostaway calendar" });
    }
  });

  app.get("/api/hostaway/earnings", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { getHostawayAPI } = await import("./hostaway");
      const hostaway = await getHostawayAPI(req);
      
      if (!hostaway) {
        return res.status(404).json({ message: "Hostaway API not configured" });
      }

      const earnings = await hostaway.getEarnings();
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching Hostaway earnings:", error);
      res.status(500).json({ message: "Failed to fetch Hostaway earnings" });
    }
  });

  // Add-on Services routes
  app.get("/api/addon-services", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const services = await storage.getAddonServices();
      // Filter by organization in production - for demo, return all
      res.json(services);
    } catch (error) {
      console.error("Error fetching addon services:", error);
      res.status(500).json({ message: "Failed to fetch addon services" });
    }
  });

  app.post("/api/addon-services", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const validatedData = insertAddonServiceSchema.parse({
        ...req.body,
        organizationId,
      });

      const service = await storage.createAddonService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating addon service:", error);
      res.status(500).json({ message: "Failed to create addon service" });
    }
  });

  // Add-on Bookings routes
  app.get("/api/addon-bookings", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const bookings = await storage.getAddonBookings();
      // Filter by organization in production - for demo, return all
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching addon bookings:", error);
      res.status(500).json({ message: "Failed to fetch addon bookings" });
    }
  });

  app.post("/api/addon-bookings", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const validatedData = insertAddonBookingSchema.parse({
        ...req.body,
        organizationId,
        bookedBy: userData.id,
        chargedTo: req.body.billingType?.includes('guest') ? 'guest' : 
                   req.body.billingType?.includes('owner') ? 'owner' : 'company',
      });

      const booking = await storage.createAddonBooking(validatedData);

      // Create financial record for billing
      if (booking.totalPrice > 0) {
        const financeData = {
          organizationId,
          propertyId: booking.propertyId,
          type: booking.billingType?.includes('gift') ? 'expense' : 'income',
          source: booking.billingType === 'owner-gift' ? 'complimentary' :
                  booking.billingType === 'company-gift' ? 'complimentary' :
                  booking.billingType === 'auto-bill-owner' ? 'owner-charge' : 'guest-payment',
          sourceType: booking.billingType?.includes('gift') ? booking.billingType : null,
          category: 'add-on-service',
          subcategory: req.body.serviceCategory || 'general',
          amount: booking.totalPrice.toString(),
          description: `Add-on service: ${req.body.serviceName} for ${booking.guestName}`,
          date: new Date().toISOString().split('T')[0],
          status: booking.billingType?.includes('gift') ? 'paid' : 'pending',
          processedBy: userData.id,
          referenceNumber: `ADDON-${booking.id}`,
        };

        await storage.createFinance(financeData);
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating addon booking:", error);
      res.status(500).json({ message: "Failed to create addon booking" });
    }
  });

  // Utility Bills routes
  app.get("/api/utility-bills", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const bills = await storage.getUtilityBills();
      // Filter by organization in production - for demo, return all
      res.json(bills);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      res.status(500).json({ message: "Failed to fetch utility bills" });
    }
  });

  app.post("/api/utility-bills", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      
      const validatedData = insertUtilityBillSchema.parse({
        ...req.body,
        organizationId,
      });

      const bill = await storage.createUtilityBill(validatedData);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating utility bill:", error);
      res.status(500).json({ message: "Failed to create utility bill" });
    }
  });

  // Welcome Pack Inventory routes
  app.get("/api/welcome-pack-items", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const items = await storage.getWelcomePackItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching welcome pack items:", error);
      res.status(500).json({ message: "Failed to fetch welcome pack items" });
    }
  });

  app.post("/api/welcome-pack-items", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      
      const validatedData = {
        ...req.body,
        organizationId,
      };

      const item = await storage.createWelcomePackItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating welcome pack item:", error);
      res.status(500).json({ message: "Failed to create welcome pack item" });
    }
  });

  app.get("/api/welcome-pack-templates", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const templates = await storage.getWelcomePackTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching welcome pack templates:", error);
      res.status(500).json({ message: "Failed to fetch welcome pack templates" });
    }
  });

  app.get("/api/welcome-pack-templates/property/:propertyId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const templates = await storage.getWelcomePackTemplatesByProperty(propertyId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching property welcome pack templates:", error);
      res.status(500).json({ message: "Failed to fetch property welcome pack templates" });
    }
  });

  app.post("/api/welcome-pack-templates", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      
      const validatedData = {
        ...req.body,
        organizationId,
      };

      const template = await storage.createWelcomePackTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating welcome pack template:", error);
      res.status(500).json({ message: "Failed to create welcome pack template" });
    }
  });

  app.get("/api/welcome-pack-usage", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const usage = await storage.getWelcomePackUsage();
      res.json(usage);
    } catch (error) {
      console.error("Error fetching welcome pack usage:", error);
      res.status(500).json({ message: "Failed to fetch welcome pack usage" });
    }
  });

  app.post("/api/welcome-pack-usage/checkout", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const { bookingId, propertyId } = req.body;
      
      const usageRecords = await storage.logWelcomePackUsageFromCheckout(
        bookingId, 
        propertyId, 
        userData.claims.sub
      );
      
      res.status(201).json(usageRecords);
    } catch (error) {
      console.error("Error logging welcome pack checkout usage:", error);
      res.status(500).json({ message: "Failed to log welcome pack checkout usage" });
    }
  });

  // Inventory analytics endpoints
  app.get("/api/inventory/stats", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { propertyId, staffId, fromDate, toDate } = req.query;
      
      const filters = {
        propertyId: propertyId as string,
        staffId: staffId as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      };
      
      const stats = await storage.getInventoryStats(organizationId, filters);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ message: "Failed to fetch inventory stats" });
    }
  });

  app.get("/api/welcome-pack-usage/detailed", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { propertyId, staffId, fromDate, toDate } = req.query;
      
      const filters = {
        propertyId: propertyId as string,
        staffId: staffId as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      };
      
      const usage = await storage.getDetailedWelcomePackUsage(organizationId, filters);
      res.json(usage);
    } catch (error) {
      console.error("Error fetching detailed welcome pack usage:", error);
      res.status(500).json({ message: "Failed to fetch detailed welcome pack usage" });
    }
  });

  // Financial & Invoice Toolkit routes

  // Staff salary routes
  app.get("/api/staff/salary/:userId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const salary = await storage.getStaffSalary(userId);
      res.json(salary);
    } catch (error) {
      console.error("Error fetching staff salary:", error);
      res.status(500).json({ message: "Failed to fetch staff salary" });
    }
  });

  app.post("/api/staff/salary", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const salaryData = { ...req.body, organizationId };
      const salary = await storage.createStaffSalary(salaryData);
      res.status(201).json(salary);
    } catch (error) {
      console.error("Error creating staff salary:", error);
      res.status(500).json({ message: "Failed to create staff salary" });
    }
  });

  // Commission earnings routes
  app.get("/api/commission-earnings/:userId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { userId } = req.params;
      const { period } = req.query;
      const earnings = await storage.getCommissionEarnings(userId, period as string);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching commission earnings:", error);
      res.status(500).json({ message: "Failed to fetch commission earnings" });
    }
  });

  app.get("/api/portfolio-manager/earnings/:managerId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { managerId } = req.params;
      const { period } = req.query;
      const earnings = await storage.getPortfolioManagerEarnings(managerId, period as string);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching portfolio manager earnings:", error);
      res.status(500).json({ message: "Failed to fetch portfolio manager earnings" });
    }
  });

  // Portfolio assignment routes
  app.get("/api/portfolio-assignments/:managerId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { managerId } = req.params;
      const assignments = await storage.getPortfolioAssignments(managerId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching portfolio assignments:", error);
      res.status(500).json({ message: "Failed to fetch portfolio assignments" });
    }
  });

  app.post("/api/portfolio-assignments", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const assignmentData = { ...req.body, organizationId };
      const assignment = await storage.assignPortfolioProperty(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating portfolio assignment:", error);
      res.status(500).json({ message: "Failed to create portfolio assignment" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { userId, type, status } = req.query;
      const filters = {
        userId: userId as string,
        type: type as string,
        status: status as string,
      };
      const invoices = await storage.getInvoices(organizationId, filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      const { lineItems, ...invoiceData } = req.body;
      
      // Generate invoice number
      const invoiceNumber = await storage.generateInvoiceNumber(organizationId);
      
      const invoice = await storage.createInvoice(
        {
          ...invoiceData,
          organizationId,
          invoiceNumber,
          createdBy: userData.claims.sub,
        },
        lineItems || []
      );
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/invoices/:id", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.updateInvoice(parseInt(id), req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvoice(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Owner Payout routes
  app.get("/api/owner-payouts", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { status, ownerId, propertyId } = req.query;
      
      let payouts;
      if (status) {
        payouts = await storage.getOwnerPayoutsByStatus(status as string);
      } else if (ownerId) {
        payouts = await storage.getOwnerPayoutsByOwner(ownerId as string);
      } else if (propertyId) {
        payouts = await storage.getOwnerPayoutsByProperty(parseInt(propertyId as string));
      } else {
        payouts = await storage.getOwnerPayouts();
      }
      
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching owner payouts:", error);
      res.status(500).json({ message: "Failed to fetch owner payouts" });
    }
  });

  app.get("/api/owner-payouts/:id", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const payoutId = parseInt(req.params.id);
      const payout = await storage.getOwnerPayout(payoutId);
      
      if (!payout) {
        return res.status(404).json({ message: "Owner payout not found" });
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Error fetching owner payout:", error);
      res.status(500).json({ message: "Failed to fetch owner payout" });
    }
  });

  app.post("/api/owner-payouts", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const { organizationId } = getTenantContext(req);
      
      const validatedData = {
        ...req.body,
        organizationId,
        requestedBy: userData.claims.sub,
        status: 'pending',
        requestDate: new Date(),
      };

      const payout = await storage.createOwnerPayout(validatedData);
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error creating owner payout:", error);
      res.status(500).json({ message: "Failed to create owner payout" });
    }
  });

  app.patch("/api/owner-payouts/:id/approve", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const payoutId = parseInt(req.params.id);
      const { approvalNotes } = req.body;
      
      const updatedPayout = await storage.approveOwnerPayout(
        payoutId, 
        userData.claims.sub, 
        approvalNotes
      );
      
      if (!updatedPayout) {
        return res.status(404).json({ message: "Owner payout not found" });
      }
      
      // Send notification to the requester
      await storage.notifyPayoutAction(payoutId, updatedPayout.requestedBy, 'approved', userData.claims.sub);
      
      res.json(updatedPayout);
    } catch (error) {
      console.error("Error approving owner payout:", error);
      res.status(500).json({ message: "Failed to approve owner payout" });
    }
  });

  app.patch("/api/owner-payouts/:id/mark-paid", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const payoutId = parseInt(req.params.id);
      const { paymentMethod, paymentReference } = req.body;
      
      const updatedPayout = await storage.markOwnerPayoutPaid(
        payoutId, 
        userData.claims.sub, 
        paymentMethod, 
        paymentReference
      );
      
      if (!updatedPayout) {
        return res.status(404).json({ message: "Owner payout not found" });
      }
      
      res.json(updatedPayout);
    } catch (error) {
      console.error("Error marking owner payout as paid:", error);
      res.status(500).json({ message: "Failed to mark owner payout as paid" });
    }
  });

  app.patch("/api/owner-payouts/:id/upload-receipt", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const payoutId = parseInt(req.params.id);
      const { receiptUrl } = req.body;
      
      const updatedPayout = await storage.uploadOwnerPayoutReceipt(
        payoutId, 
        receiptUrl, 
        userData.claims.sub
      );
      
      if (!updatedPayout) {
        return res.status(404).json({ message: "Owner payout not found" });
      }
      
      res.json(updatedPayout);
    } catch (error) {
      console.error("Error uploading owner payout receipt:", error);
      res.status(500).json({ message: "Failed to upload owner payout receipt" });
    }
  });

  app.patch("/api/owner-payouts/:id/confirm-received", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userData = req.user as any;
      const payoutId = parseInt(req.params.id);
      
      const updatedPayout = await storage.confirmOwnerPayoutReceived(
        payoutId, 
        userData.claims.sub
      );
      
      if (!updatedPayout) {
        return res.status(404).json({ message: "Owner payout not found" });
      }
      
      res.json(updatedPayout);
    } catch (error) {
      console.error("Error confirming owner payout received:", error);
      res.status(500).json({ message: "Failed to confirm owner payout received" });
    }
  });

  app.get("/api/owner-balance/:ownerId", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { ownerId } = req.params;
      const { propertyId, startDate, endDate } = req.query;
      
      const balance = await storage.calculateOwnerBalance(
        ownerId,
        propertyId ? parseInt(propertyId as string) : undefined,
        startDate as string,
        endDate as string
      );
      
      res.json(balance);
    } catch (error) {
      console.error("Error calculating owner balance:", error);
      res.status(500).json({ message: "Failed to calculate owner balance" });
    }
  });

  // Notification API routes
  app.get("/api/notifications", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const notifications = await storage.getNotifications(userId);
      const filteredNotifications = notifications.filter(n => n.organizationId === organizationId);
      res.json(filteredNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const notifications = await storage.getUnreadNotifications(userId);
      const filteredNotifications = notifications.filter(n => n.organizationId === organizationId);
      res.json(filteredNotifications);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications/:id/read", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationRead(parseInt(id));
      if (success) {
        res.json({ message: "Notification marked as read" });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const success = await storage.markAllNotificationsRead(userId);
      res.json({ message: "All notifications marked as read", success });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteNotification(parseInt(id));
      if (success) {
        res.json({ message: "Notification deleted" });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Test notification route for development
  app.post("/api/test-notification", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const notification = await storage.createNotification({
        organizationId,
        userId,
        type: 'task_assignment',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working',
        relatedEntityType: 'test',
        relatedEntityId: 1,
        priority: 'normal',
        actionUrl: '/dashboard',
        actionLabel: 'View Dashboard',
        createdBy: userId,
      });

      res.json(notification);
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification" });
    }
  });

  // Notification preferences API routes
  app.get("/api/notification-preferences", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const preferences = await storage.getUserNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.post("/api/notification-preferences", authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const preferencesData = {
        ...req.body,
        organizationId,
        userId,
      };

      const preferences = await storage.upsertNotificationPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // ===== AI FEEDBACK SYSTEM ENDPOINTS =====

  // Guest feedback endpoints
  app.get("/api/ai/feedback", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, processed, requiresAction } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (processed !== undefined) filters.processed = processed === 'true';
      if (requiresAction !== undefined) filters.requiresAction = requiresAction === 'true';
      
      const feedback = await storage.getGuestFeedback(organizationId, filters);
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching guest feedback:", error);
      res.status(500).json({ message: "Failed to fetch guest feedback" });
    }
  });

  app.post("/api/ai/feedback", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user as any;
      
      const feedbackData = {
        ...req.body,
        organizationId,
        receivedAt: new Date(),
      };
      
      // Process feedback for AI keywords
      const aiAnalysis = await storage.processMessageForKeywords(
        feedbackData.originalMessage,
        organizationId
      );
      
      // Save feedback with AI analysis
      const feedback = await storage.createGuestFeedback({
        ...feedbackData,
        detectedKeywords: aiAnalysis.detectedKeywords,
        aiConfidence: aiAnalysis.matchedRules.length > 0 ? 0.85 : 0.1,
        requiresAction: aiAnalysis.matchedRules.length > 0,
      });
      
      // Auto-create tasks if rules match
      if (aiAnalysis.matchedRules.length > 0) {
        for (const rule of aiAnalysis.matchedRules) {
          try {
            await storage.createTaskFromFeedback(feedback.id, rule.id);
          } catch (error) {
            console.error("Error creating task from feedback:", error);
          }
        }
      }
      
      res.json({
        feedback,
        aiAnalysis,
        autoTasksCreated: aiAnalysis.matchedRules.length,
      });
    } catch (error) {
      console.error("Error creating guest feedback:", error);
      res.status(500).json({ message: "Failed to create guest feedback" });
    }
  });

  app.put("/api/ai/feedback/:id/process", isDemoAuthenticated, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const user = req.user as any;
      const { processingNotes, assignedTaskId, createTask, ruleId } = req.body;
      
      if (createTask && ruleId) {
        // Create task from rule
        const task = await storage.createTaskFromFeedback(feedbackId, ruleId);
        const feedback = await storage.processGuestFeedback(
          feedbackId,
          user.username,
          processingNotes,
          task.id
        );
        res.json({ feedback, createdTask: task });
      } else {
        const feedback = await storage.processGuestFeedback(
          feedbackId,
          user.username,
          processingNotes,
          assignedTaskId
        );
        res.json({ feedback });
      }
    } catch (error) {
      console.error("Error processing feedback:", error);
      res.status(500).json({ message: "Failed to process feedback" });
    }
  });

  // ===== GUEST MESSAGING SYSTEM API ENDPOINTS =====

  // Get guest messages
  app.get("/api/guest-messages/:guestId", async (req, res) => {
    try {
      const guestId = req.params.guestId;
      const organizationId = "default-org"; // Use demo org for now
      
      const messages = await storage.getGuestMessages(organizationId, guestId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching guest messages:", error);
      res.status(500).json({ message: "Failed to fetch guest messages" });
    }
  });

  // Create new guest message
  app.post("/api/guest-messages", async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        organizationId: "default-org",
      };
      
      const newMessage = await storage.createGuestMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error creating guest message:", error);
      res.status(500).json({ message: "Failed to create guest message" });
    }
  });

  // Get guest service requests
  app.get("/api/guest-service-requests/:guestId", async (req, res) => {
    try {
      const guestId = req.params.guestId;
      const organizationId = "default-org";
      
      const requests = await storage.getGuestServiceRequests(organizationId, guestId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching guest service requests:", error);
      res.status(500).json({ message: "Failed to fetch guest service requests" });
    }
  });

  // Create new guest service request
  app.post("/api/guest-service-requests", async (req, res) => {
    try {
      const requestData = {
        ...req.body,
        organizationId: "default-org",
      };
      
      const newRequest = await storage.createGuestServiceRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating guest service request:", error);
      res.status(500).json({ message: "Failed to create guest service request" });
    }
  });

  // Get guest bookings
  app.get("/api/guest-bookings/:guestId", async (req, res) => {
    try {
      const guestId = req.params.guestId;
      
      const bookings = await storage.getGuestBookings(guestId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching guest bookings:", error);
      res.status(500).json({ message: "Failed to fetch guest bookings" });
    }
  });

  // Get AI generated tasks
  app.get("/api/ai-generated-tasks", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "default-org";
      
      const tasks = await storage.getAIGeneratedTasks(organizationId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching AI generated tasks:", error);
      res.status(500).json({ message: "Failed to fetch AI generated tasks" });
    }
  });

  // AI Task Rules endpoints
  app.get("/api/ai/rules", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { isActive, department } = req.query;
      
      const filters: any = {};
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (department) filters.department = department as string;
      
      const rules = await storage.getAiTaskRules(organizationId, filters);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching AI task rules:", error);
      res.status(500).json({ message: "Failed to fetch AI task rules" });
    }
  });

  app.post("/api/ai/rules", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user as any;
      
      const ruleData = {
        ...req.body,
        organizationId,
        createdBy: user.username,
        triggerCount: 0,
      };
      
      const rule = await storage.createAiTaskRule(ruleData);
      res.json(rule);
    } catch (error) {
      console.error("Error creating AI task rule:", error);
      res.status(500).json({ message: "Failed to create AI task rule" });
    }
  });

  app.put("/api/ai/rules/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const rule = await storage.updateAiTaskRule(ruleId, req.body);
      res.json(rule);
    } catch (error) {
      console.error("Error updating AI task rule:", error);
      res.status(500).json({ message: "Failed to update AI task rule" });
    }
  });

  app.delete("/api/ai/rules/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const success = await storage.deleteAiTaskRule(ruleId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting AI task rule:", error);
      res.status(500).json({ message: "Failed to delete AI task rule" });
    }
  });

  // Processing logs endpoints
  app.get("/api/ai/processing-logs", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { feedbackId } = req.query;
      
      const logs = await storage.getProcessingLogs(
        organizationId,
        feedbackId ? parseInt(feedbackId as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching processing logs:", error);
      res.status(500).json({ message: "Failed to fetch processing logs" });
    }
  });

  app.get("/api/ai/processing-log", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { feedbackId } = req.query;
      
      const logs = await storage.getProcessingLogs(
        organizationId,
        feedbackId ? parseInt(feedbackId as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching processing logs:", error);
      res.status(500).json({ message: "Failed to fetch processing logs" });
    }
  });

  // Enhanced AI feedback endpoints for advanced dashboard
  app.get("/api/ai/task-rules", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const rules = await storage.getAiTaskRules(organizationId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching AI task rules:", error);
      res.status(500).json({ message: "Failed to fetch AI task rules" });
    }
  });

  app.get("/api/ai/feedback-analytics", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      
      // Mock analytics data - in production this would be calculated from real data
      const analytics = {
        totalFeedback: 127,
        unprocessedCount: 8,
        highUrgencyCount: 3,
        averageProcessingTime: 125, // seconds
        topIssueCategories: [
          { category: "Maintenance", count: 45 },
          { category: "Cleanliness", count: 32 },
          { category: "Pool Issues", count: 28 },
          { category: "Garden/Landscaping", count: 22 }
        ],
        recentTrends: [
          { date: "2025-01-01", count: 12 },
          { date: "2025-01-02", count: 15 },
          { date: "2025-01-03", count: 8 },
          { date: "2025-01-04", count: 18 },
          { date: "2025-01-05", count: 11 }
        ],
        automationRate: 87
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching feedback analytics:", error);
      res.status(500).json({ message: "Failed to fetch feedback analytics" });
    }
  });

  app.post("/api/ai/feedback/:id/process", isDemoAuthenticated, async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { action, notes } = req.body;
      const user = req.user as any;
      
      let result: any = {
        success: true,
        action,
        feedbackId
      };
      
      if (action === 'create_task') {
        // Create a mock task
        result.taskTitle = "Maintenance Task - Guest Feedback";
        result.taskId = Math.floor(Math.random() * 1000) + 1;
        
        // Update feedback status
        await storage.updateGuestFeedbackProcessing(feedbackId, {
          isProcessed: true,
          processedBy: user.username,
          processingNotes: notes || "Auto-generated task from feedback",
          assignedTaskId: result.taskId,
          processedAt: new Date()
        });
      } else if (action === 'mark_resolved') {
        await storage.updateGuestFeedbackProcessing(feedbackId, {
          isProcessed: true,
          processedBy: user.username,
          processingNotes: notes || "Marked as resolved manually",
          processedAt: new Date()
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error processing feedback:", error);
      res.status(500).json({ message: "Failed to process feedback" });
    }
  });

  app.post("/api/ai/auto-process-feedback", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      
      // Get all unprocessed high urgency feedback
      const urgentFeedback = await storage.getGuestFeedback(organizationId, {
        processed: false,
        urgencyLevel: 'high'
      });
      
      let processedCount = 0;
      
      for (const feedback of urgentFeedback) {
        try {
          // Auto-process high urgency items
          await storage.updateGuestFeedbackProcessing(feedback.id, {
            isProcessed: true,
            processedBy: 'system',
            processingNotes: 'Auto-processed due to high urgency',
            processedAt: new Date()
          });
          processedCount++;
        } catch (error) {
          console.error(`Error auto-processing feedback ${feedback.id}:`, error);
        }
      }
      
      res.json({
        success: true,
        processedCount,
        message: `Auto-processed ${processedCount} high-urgency feedback items`
      });
    } catch (error) {
      console.error("Error auto-processing feedback:", error);
      res.status(500).json({ message: "Failed to auto-process feedback" });
    }
  });

  // AI Configuration endpoints
  app.get("/api/ai/config", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const config = await storage.getAiConfiguration(organizationId);
      res.json(config || {
        organizationId,
        isEnabled: true,
        autoTaskCreation: true,
        confidenceThreshold: 0.7,
        enabledDepartments: ['maintenance', 'housekeeping', 'front-desk'],
        openaiApiKey: null,
        customPrompts: {},
      });
    } catch (error) {
      console.error("Error fetching AI config:", error);
      res.status(500).json({ message: "Failed to fetch AI configuration" });
    }
  });

  app.put("/api/ai/config", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const configData = {
        ...req.body,
        organizationId,
      };
      
      const config = await storage.upsertAiConfiguration(configData);
      res.json(config);
    } catch (error) {
      console.error("Error updating AI config:", error);
      res.status(500).json({ message: "Failed to update AI configuration" });
    }
  });

  // AI processing endpoints
  app.post("/api/ai/analyze-message", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const analysis = await storage.processMessageForKeywords(message, organizationId);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing message:", error);
      res.status(500).json({ message: "Failed to analyze message" });
    }
  });

  app.post("/api/ai/create-task-from-feedback", isDemoAuthenticated, async (req, res) => {
    try {
      const { feedbackId, ruleId, assignedTo } = req.body;
      
      if (!feedbackId || !ruleId) {
        return res.status(400).json({ message: "feedbackId and ruleId are required" });
      }
      
      const task = await storage.createTaskFromFeedback(
        parseInt(feedbackId),
        parseInt(ruleId),
        assignedTo
      );
      res.json(task);
    } catch (error) {
      console.error("Error creating task from feedback:", error);
      res.status(500).json({ message: "Failed to create task from feedback" });
    }
  });

  // ===== GUEST ACTIVITY TRACKER & RECOMMENDATIONS AI ENDPOINTS =====

  // Get property activity recommendations
  app.get("/api/guest-activity-recommendations/:propertyId", async (req, res) => {
    try {
      const organizationId = "default-org";
      const propertyId = parseInt(req.params.propertyId);
      const { category, isFeatured, suitableFor } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
      if (suitableFor) filters.suitableFor = (suitableFor as string).split(',');
      
      const recommendations = await storage.getPropertyActivityRecommendations(organizationId, propertyId, filters);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching activity recommendations:", error);
      res.status(500).json({ message: "Failed to fetch activity recommendations" });
    }
  });

  // Get personalized recommendations for a guest
  app.get("/api/guest-activity-recommendations/:propertyId/personalized", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const { reservationId, guestId } = req.query;
      
      if (!reservationId || !guestId) {
        return res.status(400).json({ message: "reservationId and guestId are required" });
      }
      
      const recommendations = await storage.getPersonalizedRecommendations(
        reservationId as string, 
        guestId as string, 
        propertyId
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      res.status(500).json({ message: "Failed to fetch personalized recommendations" });
    }
  });

  // Get guest activity preferences
  app.get("/api/guest-activity-preferences/:reservationId", async (req, res) => {
    try {
      const reservationId = req.params.reservationId;
      const preferences = await storage.getGuestActivityPreferences(reservationId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching guest preferences:", error);
      res.status(500).json({ message: "Failed to fetch guest preferences" });
    }
  });

  // Update guest activity preferences
  app.post("/api/guest-activity-preferences", async (req, res) => {
    try {
      const preferences = await storage.createGuestActivityPreferences(req.body);
      res.status(201).json(preferences);
    } catch (error) {
      console.error("Error creating guest preferences:", error);
      res.status(500).json({ message: "Failed to create guest preferences" });
    }
  });

  app.put("/api/guest-activity-preferences/:reservationId", async (req, res) => {
    try {
      const reservationId = req.params.reservationId;
      const preferences = await storage.updateGuestActivityPreferences(reservationId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating guest preferences:", error);
      res.status(500).json({ message: "Failed to update guest preferences" });
    }
  });

  // Track recommendation interactions
  app.post("/api/guest-recommendation-interactions", async (req, res) => {
    try {
      const interaction = await storage.createRecommendationInteraction(req.body);
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error tracking recommendation interaction:", error);
      res.status(500).json({ message: "Failed to track recommendation interaction" });
    }
  });

  // Get recommendation interactions for a guest
  app.get("/api/guest-recommendation-interactions/:reservationId", async (req, res) => {
    try {
      const reservationId = req.params.reservationId;
      const { recommendationId, interactionType } = req.query;
      
      const filters: any = {};
      if (recommendationId) filters.recommendationId = parseInt(recommendationId as string);
      if (interactionType) filters.interactionType = interactionType as string;
      
      const interactions = await storage.getRecommendationInteractions(reservationId, filters);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching recommendation interactions:", error);
      res.status(500).json({ message: "Failed to fetch recommendation interactions" });
    }
  });

  // Get recommendation analytics (admin/PM only)
  app.get("/api/recommendation-analytics/:propertyId", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "default-org";
      const propertyId = parseInt(req.params.propertyId);
      const { fromDate, toDate, category } = req.query;
      
      const filters: any = {};
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);
      if (category) filters.category = category as string;
      
      const analytics = await storage.getRecommendationAnalytics(organizationId, propertyId, filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching recommendation analytics:", error);
      res.status(500).json({ message: "Failed to fetch recommendation analytics" });
    }
  });

  // Admin endpoints for managing property recommendations
  app.post("/api/admin/property-activity-recommendations", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or Portfolio Manager role required." });
      }
      
      const recommendationData = {
        ...req.body,
        organizationId: "default-org",
        createdBy: user.username,
      };
      
      const recommendation = await storage.createPropertyActivityRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating property recommendation:", error);
      res.status(500).json({ message: "Failed to create property recommendation" });
    }
  });

  app.put("/api/admin/property-activity-recommendations/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or Portfolio Manager role required." });
      }
      
      const recommendationId = parseInt(req.params.id);
      const recommendation = await storage.updatePropertyActivityRecommendation(recommendationId, req.body);
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating property recommendation:", error);
      res.status(500).json({ message: "Failed to update property recommendation" });
    }
  });

  app.delete("/api/admin/property-activity-recommendations/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or Portfolio Manager role required." });
      }
      
      const recommendationId = parseInt(req.params.id);
      const success = await storage.deletePropertyActivityRecommendation(recommendationId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting property recommendation:", error);
      res.status(500).json({ message: "Failed to delete property recommendation" });
    }
  });

  // ===== GUEST ADD-ON SERVICE BOOKING PLATFORM =====
  
  // Guest add-on services CRUD
  app.get("/api/guest-addon-services", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { category, isActive } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const services = await storage.getGuestAddonServices(organizationId, filters);
      res.json(services);
    } catch (error) {
      console.error("Error fetching guest addon services:", error);
      res.status(500).json({ message: "Failed to fetch guest addon services" });
    }
  });

  app.get("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const service = await storage.getGuestAddonServiceById(serviceId);
      
      if (!service) {
        return res.status(404).json({ message: "Guest addon service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching guest addon service:", error);
      res.status(500).json({ message: "Failed to fetch guest addon service" });
    }
  });

  app.post("/api/guest-addon-services", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user as any;
      
      const serviceData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
      };
      
      const service = await storage.createGuestAddonService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating guest addon service:", error);
      res.status(500).json({ message: "Failed to create guest addon service" });
    }
  });

  app.put("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const service = await storage.updateGuestAddonService(serviceId, req.body);
      
      if (!service) {
        return res.status(404).json({ message: "Guest addon service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error updating guest addon service:", error);
      res.status(500).json({ message: "Failed to update guest addon service" });
    }
  });

  app.delete("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const success = await storage.deleteGuestAddonService(serviceId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting guest addon service:", error);
      res.status(500).json({ message: "Failed to delete guest addon service" });
    }
  });

  // Guest add-on bookings CRUD
  app.get("/api/guest-addon-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, status, billingRoute } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (status) filters.status = status as string;
      if (billingRoute) filters.billingRoute = billingRoute as string;
      
      const bookings = await storage.getGuestAddonBookings(organizationId, filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching guest addon bookings:", error);
      res.status(500).json({ message: "Failed to fetch guest addon bookings" });
    }
  });

  app.get("/api/guest-addon-bookings/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getGuestAddonBookingById(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Guest addon booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching guest addon booking:", error);
      res.status(500).json({ message: "Failed to fetch guest addon booking" });
    }
  });

  app.post("/api/guest-addon-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      
      const bookingData = {
        ...req.body,
        organizationId,
        bookingDate: new Date(),
      };
      
      const booking = await storage.createGuestAddonBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating guest addon booking:", error);
      res.status(500).json({ message: "Failed to create guest addon booking" });
    }
  });

  app.put("/api/guest-addon-bookings/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.updateGuestAddonBooking(bookingId, req.body);
      
      if (!booking) {
        return res.status(404).json({ message: "Guest addon booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating guest addon booking:", error);
      res.status(500).json({ message: "Failed to update guest addon booking" });
    }
  });

  app.put("/api/guest-addon-bookings/:id/confirm", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.user as any;
      
      const booking = await storage.confirmGuestAddonBooking(bookingId, user.username);
      
      if (!booking) {
        return res.status(404).json({ message: "Guest addon booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error confirming guest addon booking:", error);
      res.status(500).json({ message: "Failed to confirm guest addon booking" });
    }
  });

  app.put("/api/guest-addon-bookings/:id/cancel", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const user = req.user as any;
      const { reason } = req.body;
      
      const booking = await storage.cancelGuestAddonBooking(bookingId, user.username, reason);
      
      if (!booking) {
        return res.status(404).json({ message: "Guest addon booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error cancelling guest addon booking:", error);
      res.status(500).json({ message: "Failed to cancel guest addon booking" });
    }
  });

  app.put("/api/guest-addon-bookings/:id/payment", isDemoAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { paymentStatus, paymentMethod, stripePaymentIntentId } = req.body;
      
      const booking = await storage.updateBookingPaymentStatus(
        bookingId,
        paymentStatus,
        paymentMethod,
        stripePaymentIntentId
      );
      
      if (!booking) {
        return res.status(404).json({ message: "Guest addon booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking payment status:", error);
      res.status(500).json({ message: "Failed to update booking payment status" });
    }
  });

  // Guest portal access
  app.get("/api/guest-portal/:accessToken", async (req, res) => {
    try {
      const { accessToken } = req.params;
      const access = await storage.getGuestPortalAccess(accessToken);
      
      if (!access || !access.isActive || access.expiresAt < new Date()) {
        return res.status(401).json({ message: "Invalid or expired access token" });
      }
      
      // Update last accessed time
      await storage.updateGuestPortalAccessActivity(accessToken);
      
      res.json(access);
    } catch (error) {
      console.error("Error verifying guest portal access:", error);
      res.status(500).json({ message: "Failed to verify guest portal access" });
    }
  });

  app.post("/api/guest-portal", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user as any;
      
      const accessData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
        accessToken: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };
      
      const access = await storage.createGuestPortalAccess(accessData);
      res.status(201).json(access);
    } catch (error) {
      console.error("Error creating guest portal access:", error);
      res.status(500).json({ message: "Failed to create guest portal access" });
    }
  });

  app.put("/api/guest-portal/:accessToken/deactivate", isDemoAuthenticated, async (req, res) => {
    try {
      const { accessToken } = req.params;
      const success = await storage.deactivateGuestPortalAccess(accessToken);
      res.json({ success });
    } catch (error) {
      console.error("Error deactivating guest portal access:", error);
      res.status(500).json({ message: "Failed to deactivate guest portal access" });
    }
  });

  // Guest add-on service analytics
  app.get("/api/guest-addon-analytics", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { fromDate, toDate } = req.query;
      
      const filters: any = {};
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);
      
      const analytics = await storage.getGuestAddonServiceAnalytics(organizationId, filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching guest addon service analytics:", error);
      res.status(500).json({ message: "Failed to fetch guest addon service analytics" });
    }
  });

  // ==================== PROPERTY MEDIA LIBRARY ROUTES ====================

  // Get agent media library data (for agent dashboard)
  app.get("/api/agent-media-library", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId;
      const agentId = user.id;
      const { propertyStatus, mediaType } = req.query;

      const filters: any = {};
      if (propertyStatus) filters.propertyStatus = propertyStatus as string;
      if (mediaType) filters.mediaType = mediaType as string;

      const data = await storage.getAgentMediaLibraryData(organizationId, agentId, filters);
      res.json(data);
    } catch (error) {
      console.error("Error fetching agent media library data:", error);
      res.status(500).json({ message: "Failed to fetch agent media library data" });
    }
  });

  // Get property media (admin/PM only for upload panel, agents for viewing approved)
  app.get("/api/property-media", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId;
      const { propertyId, mediaType, isAgentApproved } = req.query;

      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (mediaType) filters.mediaType = mediaType as string;
      
      // For agents, only show approved media
      if (user.role === 'retail-agent' || user.role === 'referral-agent') {
        filters.isAgentApproved = true;
      } else if (isAgentApproved !== undefined) {
        filters.isAgentApproved = isAgentApproved === 'true';
      }

      const media = await storage.getPropertyMedia(organizationId, filters);
      res.json(media);
    } catch (error) {
      console.error("Error fetching property media:", error);
      res.status(500).json({ message: "Failed to fetch property media" });
    }
  });

  // Upload property media (admin/PM only)
  app.post("/api/property-media", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can upload media
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can upload media" });
      }

      const organizationId = user.organizationId;
      const {
        propertyId,
        mediaType,
        title,
        description,
        mediaUrl,
        thumbnailUrl,
        fileSize,
        mimeType,
        displayOrder,
        tags
      } = req.body;

      if (!propertyId || !mediaType || !title || !mediaUrl) {
        return res.status(400).json({ message: "Property ID, media type, title, and media URL are required" });
      }

      const mediaData = {
        organizationId,
        propertyId: parseInt(propertyId),
        mediaType,
        title,
        description,
        mediaUrl,
        thumbnailUrl,
        fileSize: fileSize ? parseInt(fileSize) : null,
        mimeType,
        displayOrder: displayOrder || 0,
        tags: tags || [],
        isAgentApproved: false, // New uploads need approval
        uploadedBy: user.id,
      };

      const newMedia = await storage.createPropertyMedia(mediaData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error("Error uploading property media:", error);
      res.status(500).json({ message: "Failed to upload property media" });
    }
  });

  // Approve media for agent access (admin/PM only)
  app.patch("/api/property-media/:id/approve", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can approve media
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can approve media" });
      }

      const mediaId = parseInt(req.params.id);
      const approvedMedia = await storage.approveMediaForAgents(mediaId, user.id);

      if (!approvedMedia) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json(approvedMedia);
    } catch (error) {
      console.error("Error approving media:", error);
      res.status(500).json({ message: "Failed to approve media" });
    }
  });

  // Update property media (admin/PM only)
  app.patch("/api/property-media/:id", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can update media
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can update media" });
      }

      const mediaId = parseInt(req.params.id);
      const updates = req.body;

      const updatedMedia = await storage.updatePropertyMedia(mediaId, updates);

      if (!updatedMedia) {
        return res.status(404).json({ message: "Media not found" });
      }

      res.json(updatedMedia);
    } catch (error) {
      console.error("Error updating property media:", error);
      res.status(500).json({ message: "Failed to update property media" });
    }
  });

  // Delete property media (admin/PM only)
  app.delete("/api/property-media/:id", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can delete media
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can delete media" });
      }

      const mediaId = parseInt(req.params.id);
      await storage.deletePropertyMedia(mediaId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property media:", error);
      res.status(500).json({ message: "Failed to delete property media" });
    }
  });

  // ===== ENHANCED GUEST DASHBOARD API ENDPOINTS =====

  // Guest Dashboard - Current Booking
  app.get("/api/guest-dashboard/current-booking", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const guestId = "guest-1"; // In real implementation, get from session or JWT
      
      const booking = await storage.getCurrentGuestBooking(organizationId, guestId);
      res.json(booking);
    } catch (error) {
      console.error("Error fetching current booking:", error);
      res.status(500).json({ message: "Failed to fetch current booking" });
    }
  });

  // Guest Dashboard - Property Amenities
  app.get("/api/guest-dashboard/property-amenities/:propertyId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const propertyId = parseInt(req.params.propertyId);
      
      const amenities = await storage.getPropertyAmenities(organizationId, propertyId);
      res.json(amenities);
    } catch (error) {
      console.error("Error fetching property amenities:", error);
      res.status(500).json({ message: "Failed to fetch property amenities" });
    }
  });

  // Guest Dashboard - AI Recommendations
  app.get("/api/guest-dashboard/ai-recommendations/:propertyId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const propertyId = parseInt(req.params.propertyId);
      
      const recommendations = await storage.getAiRecommendations(organizationId, propertyId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations" });
    }
  });

  // Guest Dashboard Extended Modules
  
  // Booking Overview
  app.get("/api/guest-dashboard/booking-overview/:guestId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const guestId = req.params.guestId;
      
      const bookingOverview = await storage.getGuestBookingOverview(organizationId, guestId);
      res.json(bookingOverview);
    } catch (error) {
      console.error("Error fetching guest booking overview:", error);
      res.status(500).json({ message: "Failed to fetch booking overview" });
    }
  });

  // Services Ordered
  app.get("/api/guest-dashboard/services-ordered/:bookingId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const bookingId = parseInt(req.params.bookingId);
      
      const servicesOrdered = await storage.getGuestServicesOrdered(organizationId, bookingId);
      res.json(servicesOrdered);
    } catch (error) {
      console.error("Error fetching guest services ordered:", error);
      res.status(500).json({ message: "Failed to fetch services ordered" });
    }
  });

  // Electricity Billing
  app.get("/api/guest-dashboard/electricity-billing/:bookingId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const bookingId = parseInt(req.params.bookingId);
      
      const electricityBilling = await storage.getGuestElectricityBilling(organizationId, bookingId);
      res.json(electricityBilling);
    } catch (error) {
      console.error("Error fetching guest electricity billing:", error);
      res.status(500).json({ message: "Failed to fetch electricity billing" });
    }
  });

  // Deposit Overview
  app.get("/api/guest-dashboard/deposit-overview/:bookingId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const bookingId = parseInt(req.params.bookingId);
      
      const depositOverview = await storage.getGuestDepositOverview(organizationId, bookingId);
      res.json(depositOverview);
    } catch (error) {
      console.error("Error fetching guest deposit overview:", error);
      res.status(500).json({ message: "Failed to fetch deposit overview" });
    }
  });

  // Guest Dashboard - Service Timeline
  app.get("/api/guest-dashboard/service-timeline/:propertyId", async (req, res) => {
    try {
      const organizationId = "demo-org";
      const propertyId = parseInt(req.params.propertyId);
      
      const timeline = await storage.getGuestServiceTimeline(organizationId, propertyId);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching service timeline:", error);
      res.status(500).json({ message: "Failed to fetch service timeline" });
    }
  });

  // Get property internal notes
  app.get("/api/property-internal-notes", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId;
      const { propertyId, category, isVisibleToAgents } = req.query;

      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (category) filters.category = category as string;
      
      // For agents, only show notes visible to them
      if (user.role === 'retail-agent' || user.role === 'referral-agent') {
        filters.isVisibleToAgents = true;
      } else if (isVisibleToAgents !== undefined) {
        filters.isVisibleToAgents = isVisibleToAgents === 'true';
      }

      const notes = await storage.getPropertyInternalNotes(organizationId, filters);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching property internal notes:", error);
      res.status(500).json({ message: "Failed to fetch property internal notes" });
    }
  });

  // Create property internal note (admin/PM only)
  app.post("/api/property-internal-notes", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can create internal notes
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can create internal notes" });
      }

      const organizationId = user.organizationId;
      const {
        propertyId,
        category,
        title,
        content,
        isVisibleToAgents,
        tags
      } = req.body;

      if (!propertyId || !title || !content) {
        return res.status(400).json({ message: "Property ID, title, and content are required" });
      }

      const noteData = {
        organizationId,
        propertyId: parseInt(propertyId),
        category: category || 'general',
        title,
        content,
        isVisibleToAgents: isVisibleToAgents || false,
        tags: tags || [],
        createdBy: user.id,
      };

      const newNote = await storage.createPropertyInternalNote(noteData);
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error creating property internal note:", error);
      res.status(500).json({ message: "Failed to create property internal note" });
    }
  });

  // Update property internal note (admin/PM only)
  app.patch("/api/property-internal-notes/:id", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can update internal notes
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can update internal notes" });
      }

      const noteId = parseInt(req.params.id);
      const updates = req.body;

      const updatedNote = await storage.updatePropertyInternalNote(noteId, updates);

      if (!updatedNote) {
        return res.status(404).json({ message: "Internal note not found" });
      }

      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating property internal note:", error);
      res.status(500).json({ message: "Failed to update property internal note" });
    }
  });

  // Delete property internal note (admin/PM only)
  app.delete("/api/property-internal-notes/:id", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can delete internal notes
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admins and portfolio managers can delete internal notes" });
      }

      const noteId = parseInt(req.params.id);
      await storage.deletePropertyInternalNote(noteId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property internal note:", error);
      res.status(500).json({ message: "Failed to delete property internal note" });
    }
  });

  // Track agent media access (for analytics)
  app.post("/api/agent-media-access", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { mediaId, actionType } = req.body;

      if (!mediaId || !actionType) {
        return res.status(400).json({ message: "Media ID and action type are required" });
      }

      const accessData = {
        organizationId: user.organizationId,
        agentId: user.id,
        mediaId: parseInt(mediaId),
        accessGrantedBy: user.id, // Self-granted for agent access
        lastViewedAt: actionType === 'view' ? new Date() : null,
        copyCount: actionType === 'copy' ? 1 : 0,
      };

      // Handle different action types
      if (actionType === 'view') {
        await storage.updateAgentMediaLastViewed(user.id, parseInt(mediaId));
      } else if (actionType === 'copy') {
        await storage.incrementCopyCount(user.id, parseInt(mediaId));
      }

      const accessRecord = await storage.trackAgentMediaAccess(accessData);
      res.status(201).json(accessRecord);
    } catch (error) {
      console.error("Error tracking agent media access:", error);
      res.status(500).json({ message: "Failed to track agent media access" });
    }
  });

  // ===== GUEST ADD-ON SERVICE BOOKING PLATFORM =====

  // Get all guest add-on services
  app.get("/api/guest-addon-services", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { category, isActive } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const services = await storage.getGuestAddonServices(organizationId, filters);
      res.json(services);
    } catch (error) {
      console.error("Error fetching guest add-on services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get guest add-on service by ID
  app.get("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const service = await storage.getGuestAddonServiceById(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching guest add-on service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  // Create new guest add-on service
  app.post("/api/guest-addon-services", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const serviceData = {
        ...req.body,
        organizationId,
      };

      const service = await storage.createGuestAddonService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating guest add-on service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Update guest add-on service
  app.patch("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const service = await storage.updateGuestAddonService(parseInt(req.params.id), req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating guest add-on service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  // Delete guest add-on service
  app.delete("/api/guest-addon-services/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const success = await storage.deleteGuestAddonService(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guest add-on service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Get all guest add-on bookings
  app.get("/api/guest-addon-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId, status, billingRoute } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (status) filters.status = status as string;
      if (billingRoute) filters.billingRoute = billingRoute as string;
      
      const bookings = await storage.getGuestAddonBookings(organizationId, filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching guest add-on bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get guest add-on booking by ID
  app.get("/api/guest-addon-bookings/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getGuestAddonBookingById(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching guest add-on booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Create new guest add-on booking
  app.post("/api/guest-addon-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const bookingData = {
        ...req.body,
        organizationId,
      };

      const booking = await storage.createGuestAddonBooking(bookingData);

      // If booking is completed, create finance record
      if (booking.status === 'completed') {
        const service = await storage.getGuestAddonServiceById(booking.serviceId);
        const property = await storage.getPropertyById(booking.propertyId);
        
        if (service && property) {
          await storage.createFinance({
            organizationId,
            amount: booking.totalAmount,
            type: booking.billingRoute === 'guest_billable' ? 'income' : 'expense',
            description: `${service.serviceName} - ${booking.guestName}`,
            category: `addon_${service.category}`,
            propertyId: booking.propertyId,
            source: booking.billingRoute,
            referenceNumber: `ADDON-${booking.id}`,
            processedBy: req.user.id,
          });
        }
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating guest add-on booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Update guest add-on booking
  app.patch("/api/guest-addon-bookings/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const booking = await storage.updateGuestAddonBooking(parseInt(req.params.id), req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // If booking is completed, create finance record
      if (req.body.status === 'completed' && booking.status === 'completed') {
        const service = await storage.getGuestAddonServiceById(booking.serviceId);
        const property = await storage.getPropertyById(booking.propertyId);
        
        if (service && property) {
          await storage.createFinance({
            organizationId: req.user.organizationId,
            amount: booking.totalAmount,
            type: booking.billingRoute === 'guest_billable' ? 'income' : 'expense',
            description: `${service.serviceName} - ${booking.guestName}`,
            category: `addon_${service.category}`,
            propertyId: booking.propertyId,
            source: booking.billingRoute,
            referenceNumber: `ADDON-${booking.id}`,
            processedBy: req.user.id,
          });
        }
      }

      res.json(booking);
    } catch (error) {
      console.error("Error updating guest add-on booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Confirm guest add-on booking
  app.post("/api/guest-addon-bookings/:id/confirm", isDemoAuthenticated, async (req, res) => {
    try {
      const booking = await storage.confirmGuestAddonBooking(parseInt(req.params.id), req.user.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error confirming guest add-on booking:", error);
      res.status(500).json({ message: "Failed to confirm booking" });
    }
  });

  // Cancel guest add-on booking
  app.post("/api/guest-addon-bookings/:id/cancel", isDemoAuthenticated, async (req, res) => {
    try {
      const { reason } = req.body;
      const booking = await storage.cancelGuestAddonBooking(parseInt(req.params.id), req.user.id, reason);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error cancelling guest add-on booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // ===== OWNER DASHBOARD ROUTES =====

  // Get owner dashboard stats
  app.get("/api/owner/dashboard/stats", isDemoAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, propertyId } = req.query;
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
      };
      
      const stats = await storage.getOwnerDashboardStats(req.user.organizationId, req.user.id, filters);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching owner dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Get owner financial summary
  app.get("/api/owner/dashboard/financial-summary", isDemoAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, propertyId, currency } = req.query;
      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        currency: currency as string,
      };
      
      const summary = await storage.getOwnerFinancialSummary(req.user.organizationId, req.user.id, filters);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching owner financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Get owner activity timeline
  app.get("/api/owner/dashboard/activity", isDemoAuthenticated, async (req, res) => {
    try {
      const { propertyId, activityType, startDate, endDate, limit } = req.query;
      const filters = {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        activityType: activityType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
      };
      
      const activities = await storage.getOwnerActivityTimeline(req.user.organizationId, req.user.id, filters);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching owner activity timeline:", error);
      res.status(500).json({ message: "Failed to fetch activity timeline" });
    }
  });

  // Create owner activity timeline entry (for system use)
  app.post("/api/owner/dashboard/activity", isDemoAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOwnerActivityTimelineSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        createdBy: req.user.id,
      });
      
      const activity = await storage.createOwnerActivityTimeline(validatedData);
      res.json(activity);
    } catch (error) {
      console.error("Error creating owner activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Get owner payout requests
  app.get("/api/owner/dashboard/payouts", isDemoAuthenticated, async (req, res) => {
    try {
      const { status, startDate, endDate } = req.query;
      const filters = {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };
      
      const payouts = await storage.getOwnerPayoutRequests(req.user.organizationId, req.user.id, filters);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching owner payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // Create owner payout request
  app.post("/api/owner/dashboard/payouts", isDemoAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOwnerPayoutRequestSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        ownerId: req.user.id,
        status: 'pending',
      });
      
      const payout = await storage.createOwnerPayoutRequest(validatedData);
      res.json(payout);
    } catch (error) {
      console.error("Error creating owner payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Update payout request (mark as received by owner)
  app.patch("/api/owner/dashboard/payouts/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const payout = await storage.updateOwnerPayoutRequest(parseInt(id), updates);
      if (!payout) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Error updating payout request:", error);
      res.status(500).json({ message: "Failed to update payout request" });
    }
  });

  // Admin approve payout request
  app.post("/api/owner/dashboard/payouts/:id/approve", isDemoAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      const payout = await storage.approvePayoutRequest(parseInt(id), req.user.id, notes);
      if (!payout) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Error approving payout request:", error);
      res.status(500).json({ message: "Failed to approve payout request" });
    }
  });

  // Admin complete payout request
  app.post("/api/owner/dashboard/payouts/:id/complete", isDemoAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentReference, paymentReceiptUrl } = req.body;
      
      const payout = await storage.completePayoutRequest(parseInt(id), req.user.id, {
        paymentMethod,
        paymentReference,
        paymentReceiptUrl,
      });
      
      if (!payout) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      
      res.json(payout);
    } catch (error) {
      console.error("Error completing payout request:", error);
      res.status(500).json({ message: "Failed to complete payout request" });
    }
  });

  // Get owner invoices
  app.get("/api/owner/dashboard/invoices", isDemoAuthenticated, async (req, res) => {
    try {
      const { propertyId, invoiceType, status, startDate, endDate } = req.query;
      const filters = {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        invoiceType: invoiceType as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };
      
      const invoices = await storage.getOwnerInvoices(req.user.organizationId, req.user.id, filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching owner invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Create owner invoice (admin only)
  app.post("/api/owner/dashboard/invoices", isDemoAuthenticated, async (req, res) => {
    try {
      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const validatedData = insertOwnerInvoiceSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        invoiceNumber,
        createdBy: req.user.id,
      });
      
      const invoice = await storage.createOwnerInvoice(validatedData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating owner invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update owner invoice
  app.patch("/api/owner/dashboard/invoices/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const invoice = await storage.updateOwnerInvoice(parseInt(id), updates);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Get owner preferences
  app.get("/api/owner/dashboard/preferences", isDemoAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.getOwnerPreferences(req.user.organizationId, req.user.id);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching owner preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  // Update owner preferences
  app.post("/api/owner/dashboard/preferences", isDemoAuthenticated, async (req, res) => {
    try {
      const validatedData = insertOwnerPreferencesSchema.parse({
        ...req.body,
        organizationId: req.user.organizationId,
        ownerId: req.user.id,
      });
      
      const preferences = await storage.upsertOwnerPreferences(validatedData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating owner preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Get owner bookings with enhanced details
  app.get("/api/owner/dashboard/bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate, status, propertyId } = req.query;
      
      // Get owner's properties first
      const ownerProperties = await storage.getProperties(req.user.organizationId, { ownerId: req.user.id });
      const propertyIds = ownerProperties.map(p => p.id);
      
      if (propertyIds.length === 0) {
        return res.json([]);
      }

      // Build filters for bookings
      const filters: any = { propertyIds };
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (status) filters.status = status as string;
      if (propertyId) filters.propertyId = parseInt(propertyId as string);

      const bookings = await storage.getBookings(req.user.organizationId, filters);
      
      // Enhance bookings with property details and revenue information
      const enhancedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const property = ownerProperties.find(p => p.id === booking.propertyId);
          
          // Get financial data for this booking
          const finances = await storage.getFinances(req.user.organizationId, { 
            bookingId: booking.id 
          });
          
          const revenue = finances
            .filter(f => f.type === 'income')
            .reduce((sum, f) => sum + parseFloat(f.amount), 0);

          return {
            ...booking,
            propertyName: property?.name,
            revenue,
            source: booking.source || 'Direct',
          };
        })
      );
      
      res.json(enhancedBookings);
    } catch (error) {
      console.error("Error fetching owner bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // ===== PORTFOLIO MANAGER DASHBOARD ROUTES =====

  // PM Financial Overview
  app.get("/api/pm/dashboard/financial-overview", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { startDate, endDate, propertyId } = req.query;
      
      const overview = await storage.getPMFinancialOverview(organizationId, managerId, {
        startDate,
        endDate,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
      });
      
      res.json(overview);
    } catch (error) {
      console.error("Error fetching PM financial overview:", error);
      res.status(500).json({ message: "Failed to fetch financial overview" });
    }
  });

  // PM Commission Balance
  app.get("/api/pm/dashboard/balance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      
      const balance = await storage.getPMCommissionBalance(organizationId, managerId);
      
      res.json(balance || {
        totalEarned: 0,
        totalPaid: 0,
        currentBalance: 0,
        lastPayoutDate: null,
      });
    } catch (error) {
      console.error("Error fetching PM balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // PM Payout Requests
  app.get("/api/pm/dashboard/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { status, startDate, endDate } = req.query;
      
      const payouts = await storage.getPMPayoutRequests(organizationId, managerId, {
        status,
        startDate,
        endDate,
      });
      
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching PM payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post("/api/pm/dashboard/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { amount, requestNotes } = req.body;
      
      const payoutRequest = await storage.createPMPayoutRequest({
        organizationId,
        managerId,
        amount: parseFloat(amount),
        requestNotes,
        currency: 'AUD',
      });
      
      // Create notification for admin
      await storage.createNotification({
        organizationId,
        userId: 'admin', // TODO: Get actual admin users
        type: 'payout_request',
        title: 'New PM Payout Request',
        message: `Portfolio Manager has requested a payout of $${amount}`,
        relatedType: 'payout',
        relatedId: payoutRequest.id.toString(),
        priority: 'medium',
      });
      
      res.json(payoutRequest);
    } catch (error) {
      console.error("Error creating PM payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  app.patch("/api/pm/dashboard/payouts/:id/received", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: managerId } = req.user;
      const { id } = req.params;
      
      const updated = await storage.markPMPaymentReceived(parseInt(id), managerId);
      
      if (!updated) {
        return res.status(404).json({ message: "Payout request not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error marking payment received:", error);
      res.status(500).json({ message: "Failed to mark payment received" });
    }
  });

  // PM Task Logs
  app.get("/api/pm/dashboard/task-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { propertyId, department, status, startDate, endDate, limit } = req.query;
      
      const taskLogs = await storage.getPMTaskLogs(organizationId, managerId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        department,
        status,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : undefined,
      });
      
      res.json(taskLogs);
    } catch (error) {
      console.error("Error fetching PM task logs:", error);
      res.status(500).json({ message: "Failed to fetch task logs" });
    }
  });

  // PM Portfolio Properties
  app.get("/api/pm/dashboard/portfolio", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      
      const properties = await storage.getPMPortfolioProperties(organizationId, managerId);
      
      res.json(properties);
    } catch (error) {
      console.error("Error fetching PM portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  // PM Notifications
  app.get("/api/pm/dashboard/notifications", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { type, severity, isRead, actionRequired, limit } = req.query;
      
      const notifications = await storage.getPMNotifications(organizationId, managerId, {
        type,
        severity,
        isRead: isRead ? JSON.parse(isRead) : undefined,
        actionRequired: actionRequired ? JSON.parse(actionRequired) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching PM notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/pm/dashboard/notifications/:id/read", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: managerId } = req.user;
      const { id } = req.params;
      
      const updated = await storage.markPMNotificationAsRead(parseInt(id), managerId);
      
      if (!updated) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch("/api/pm/dashboard/notifications/read-all", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      
      await storage.markAllPMNotificationsAsRead(organizationId, managerId);
      
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // AI Companion - Get suggestions from guest reviews
  app.get("/api/owner/dashboard/ai-suggestions", isDemoAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.query;
      const filters = {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
      };
      
      const suggestions = await storage.getOwnerAISuggestions((req.user as any).organizationId, (req.user as any).id, filters);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Approve/reject AI suggestion
  app.post("/api/owner/dashboard/ai-suggestions/:id/respond", isDemoAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body; // action: 'approve', 'reject', 'request_quote'
      
      const suggestion = await storage.respondToAISuggestion(parseInt(id), action, notes, (req.user as any).id);
      res.json(suggestion);
    } catch (error) {
      console.error("Error responding to AI suggestion:", error);
      res.status(500).json({ message: "Failed to respond to suggestion" });
    }
  });

  // Get enhanced booking insights with OTA sync status
  app.get("/api/owner/dashboard/booking-insights", isDemoAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.query;
      const filters = {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
      };
      
      const insights = await storage.getOwnerBookingInsights((req.user as any).organizationId, (req.user as any).id, filters);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching booking insights:", error);
      res.status(500).json({ message: "Failed to fetch booking insights" });
    }
  });

  // PM Invoice Builder
  app.post("/api/pm/dashboard/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { 
        receiverType, 
        receiverId, 
        receiverName, 
        receiverAddress,
        invoiceType,
        description,
        lineItems,
        taxRate,
        notes,
        dueDate,
        referenceNumber 
      } = req.body;
      
      // Generate invoice number
      const invoiceNumber = `PM-${Date.now()}`;
      
      // Calculate totals
      const subtotal = lineItems.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.quantity || 1) * parseFloat(item.unitPrice || 0)), 0);
      const taxAmount = subtotal * (parseFloat(taxRate || 0) / 100);
      const totalAmount = subtotal + taxAmount;
      
      // Get user info for sender
      const pmUser = await storage.getUser(managerId);
      
      // Create invoice
      const invoice = await storage.createInvoice({
        organizationId,
        invoiceNumber,
        senderType: 'user',
        senderId: managerId,
        senderName: `${pmUser?.firstName || ''} ${pmUser?.lastName || ''}`.trim() || 'Portfolio Manager',
        senderAddress: pmUser?.email || '',
        receiverType,
        receiverId,
        receiverName,
        receiverAddress,
        invoiceType,
        description,
        subtotal,
        taxRate: parseFloat(taxRate || 0),
        taxAmount,
        totalAmount,
        dueDate,
        referenceNumber,
        notes,
        createdBy: managerId,
      });
      
      // Create line items
      for (const item of lineItems) {
        await storage.createInvoiceLineItem({
          invoiceId: invoice.id,
          description: item.description,
          quantity: parseFloat(item.quantity || 1),
          unitPrice: parseFloat(item.unitPrice || 0),
          totalPrice: parseFloat(item.quantity || 1) * parseFloat(item.unitPrice || 0),
          referenceId: item.referenceId,
          referenceType: item.referenceType,
        });
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error creating PM invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.get("/api/pm/dashboard/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: managerId } = req.user;
      const { status, startDate, endDate } = req.query;
      
      const invoices = await storage.getInvoices(organizationId, {
        createdBy: managerId,
        status,
        startDate,
        endDate,
      });
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching PM invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // ===== RETAIL AGENT INTERFACE API ENDPOINTS =====

  // Agent Available Properties (for booking engine) - Enhanced with robust error handling
  app.get("/api/agent/properties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { 
        checkIn, 
        checkOut, 
        guests, 
        bedrooms, 
        priceMin, 
        priceMax, 
        amenities 
      } = req.query;

      // Validate required user role
      if (req.user.role !== 'retail-agent') {
        return res.status(403).json({ 
          message: "Access denied: Retail agent role required",
          fallbackData: []
        });
      }

      const properties = await storage.getAgentAvailableProperties(organizationId, {
        checkIn,
        checkOut,
        guests: guests ? parseInt(guests) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        priceMin: priceMin ? parseFloat(priceMin) : undefined,
        priceMax: priceMax ? parseFloat(priceMax) : undefined,
        amenities: amenities ? amenities.split(',') : undefined,
      });

      // Ensure properties is always an array
      const safeProperties = Array.isArray(properties) ? properties : [];
      
      // Add default commission rate and ensure all required fields exist
      const enhancedProperties = safeProperties.map(property => ({
        id: property.id || 0,
        name: property.name || "Villa Property",
        description: property.description || "Beautiful villa property",
        address: property.address || "Koh Samui, Thailand",
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        maxGuests: property.maxGuests || 6,
        pricePerNight: property.pricePerNight || "5000",
        currency: property.currency || "THB",
        commission: property.commission || 15.00, // Default 15% commission
        commissionRate: property.commissionRate || 15.00,
        isAvailable: property.isAvailable !== false, // Default to available
        amenities: property.amenities || ["wifi", "parking", "pool", "kitchen"],
        images: property.images || [],
        marketingMedia: property.marketingMedia || [],
        status: property.status || "active"
      }));

      res.json(enhancedProperties);
    } catch (error) {
      console.error("Error fetching agent properties:", error);
      
      // Return safe fallback data instead of error
      const fallbackProperties = [
        {
          id: 1,
          name: "Villa Samui Breeze",
          description: "Luxury beachfront villa with stunning ocean views",
          address: "Plai Laem, Koh Samui, Thailand",
          bedrooms: 4,
          bathrooms: 3,
          maxGuests: 8,
          pricePerNight: "8500",
          currency: "THB",
          commission: 15.00,
          commissionRate: 15.00,
          isAvailable: true,
          amenities: ["wifi", "parking", "pool", "kitchen", "aircon", "beach"],
          images: [],
          marketingMedia: [],
          status: "active"
        },
        {
          id: 2,
          name: "Villa Tropical Paradise",
          description: "Modern villa with private pool and garden",
          address: "Choeng Mon, Koh Samui, Thailand",
          bedrooms: 3,
          bathrooms: 2,
          maxGuests: 6,
          pricePerNight: "6500",
          currency: "THB",
          commission: 15.00,
          commissionRate: 15.00,
          isAvailable: true,
          amenities: ["wifi", "parking", "pool", "kitchen", "aircon"],
          images: [],
          marketingMedia: [],
          status: "active"
        }
      ];
      
      res.json(fallbackProperties);
    }
  });

  // Agent Bookings - Enhanced with safe fallback
  app.get("/api/agent/bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      const { status, propertyId, startDate, endDate } = req.query;

      const bookings = await storage.getAgentBookings(organizationId, agentId, {
        status,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        startDate,
        endDate,
      });

      // Ensure safe array response
      const safeBookings = Array.isArray(bookings) ? bookings : [];
      res.json(safeBookings);
    } catch (error) {
      console.error("Error fetching agent bookings:", error);
      // Return empty array instead of error for bookings
      res.json([]);
    }
  });

  app.post("/api/agent/bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      
      const bookingData = {
        ...req.body,
        organizationId,
        retailAgentId: agentId,
        bookingStatus: 'pending',
        commissionStatus: 'pending',
        createdAt: new Date(),
      };

      const booking = await storage.createAgentBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating agent booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Agent Commission Summary - Enhanced with safe fallback
  app.get("/api/agent/commission-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      
      const summary = await storage.getAgentCommissionSummary(organizationId, agentId);
      
      // Ensure safe object response with default values
      const safeSummary = {
        totalCommissionEarned: summary?.totalCommissionEarned || 0,
        totalCommissionPaid: summary?.totalCommissionPaid || 0,
        pendingCommission: summary?.pendingCommission || 0,
        totalBookings: summary?.totalBookings || 0,
        thisMonthCommission: summary?.thisMonthCommission || 0,
        thisMonthBookings: summary?.thisMonthBookings || 0,
        lastMonthCommission: summary?.lastMonthCommission || 0,
        lastMonthBookings: summary?.lastMonthBookings || 0,
        averageCommissionPerBooking: summary?.averageCommissionPerBooking || 0,
        commissionRate: summary?.commissionRate || 15.0,
        currency: summary?.currency || "THB",
        ...summary
      };
      
      res.json(safeSummary);
    } catch (error) {
      console.error("Error fetching commission summary:", error);
      
      // Return safe fallback summary data instead of error
      const fallbackSummary = {
        totalCommissionEarned: 0,
        totalCommissionPaid: 0,
        pendingCommission: 0,
        totalBookings: 0,
        thisMonthCommission: 0,
        thisMonthBookings: 0,
        lastMonthCommission: 0,
        lastMonthBookings: 0,
        averageCommissionPerBooking: 0,
        commissionRate: 15.0,
        currency: "THB"
      };
      
      res.json(fallbackSummary);
    }
  });

  // Agent Payouts - Enhanced with safe fallback
  app.get("/api/agent/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      const { status, startDate, endDate } = req.query;

      const payouts = await storage.getAgentPayouts(organizationId, agentId, {
        status,
        startDate,
        endDate,
      });

      // Ensure safe array response
      const safePayouts = Array.isArray(payouts) ? payouts : [];
      res.json(safePayouts);
    } catch (error) {
      console.error("Error fetching agent payouts:", error);
      // Return empty array instead of error for payouts
      res.json([]);
    }
  });

  app.post("/api/agent/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      
      const payoutData = {
        ...req.body,
        organizationId,
        agentId,
        agentType: 'retail-agent',
        payoutStatus: 'pending',
        requestedAt: new Date(),
      };

      const payout = await storage.createAgentPayout(payoutData);
      res.json(payout);
    } catch (error) {
      console.error("Error creating agent payout:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Property Marketing Media
  app.get("/api/agent/marketing-media", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, mediaType, category } = req.query;

      const media = await storage.getPropertyMarketingMedia(organizationId, 
        propertyId ? parseInt(propertyId) : undefined, {
        mediaType,
        category,
        agentAccessLevel: 'all',
      });

      res.json(media);
    } catch (error) {
      console.error("Error fetching marketing media:", error);
      res.status(500).json({ message: "Failed to fetch marketing media" });
    }
  });

  // Agent Booking Requests
  app.get("/api/agent/booking-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      const { status, propertyId, urgencyLevel } = req.query;

      const requests = await storage.getAgentBookingRequests(organizationId, agentId, {
        status,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        urgencyLevel,
      });

      res.json(requests);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      res.status(500).json({ message: "Failed to fetch booking requests" });
    }
  });

  app.post("/api/agent/booking-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId } = req.user;
      
      const requestData = {
        ...req.body,
        organizationId,
        agentId,
        status: 'pending',
        submittedAt: new Date(),
      };

      const request = await storage.createAgentBookingRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating booking request:", error);
      res.status(500).json({ message: "Failed to create booking request" });
    }
  });

  // Property Commission Rules
  app.get("/api/agent/commission-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId } = req.query;

      const rules = await storage.getPropertyCommissionRules(organizationId, 
        propertyId ? parseInt(propertyId) : undefined);

      res.json(rules);
    } catch (error) {
      console.error("Error fetching commission rules:", error);
      res.status(500).json({ message: "Failed to fetch commission rules" });
    }
  });

  // ===== REFERRAL AGENT API ROUTES =====

  // Get referral agent's assigned properties
  app.get("/api/referral-agent/properties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      
      const properties = await storage.getReferralAgentProperties(organizationId, referralAgentId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching referral agent properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get referral earnings
  app.get("/api/referral-agent/earnings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      const { month, year, propertyId, status } = req.query;
      
      const earnings = await storage.getReferralEarnings(organizationId, referralAgentId, {
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        status,
      });
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching referral earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  // Get referral commission summary
  app.get("/api/referral-agent/commission-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      
      const summary = await storage.getReferralCommissionSummary(organizationId, referralAgentId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching commission summary:", error);
      res.status(500).json({ message: "Failed to fetch commission summary" });
    }
  });

  // Get referral payouts
  app.get("/api/referral-agent/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      const { status, startDate, endDate } = req.query;
      
      const payouts = await storage.getReferralPayouts(organizationId, referralAgentId, {
        status,
        startDate,
        endDate,
      });
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching referral payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  // Create referral payout request
  app.post("/api/referral-agent/payouts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      
      const payoutData = {
        ...req.body,
        organizationId,
        agentId: referralAgentId,
        agentType: 'referral-agent',
        payoutStatus: 'pending',
        requestedAt: new Date(),
      };

      const payout = await storage.createReferralPayout(payoutData);
      res.json(payout);
    } catch (error) {
      console.error("Error creating referral payout:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Get referral program rules
  app.get("/api/referral-agent/program-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { ruleType, isActive } = req.query;
      
      const rules = await storage.getReferralProgramRules(organizationId, {
        ruleType,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });
      res.json(rules);
    } catch (error) {
      console.error("Error fetching program rules:", error);
      res.status(500).json({ message: "Failed to fetch program rules" });
    }
  });

  // Get property performance analytics
  app.get("/api/referral-agent/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: referralAgentId } = req.user;
      const { propertyId, startMonth, startYear, endMonth, endYear } = req.query;
      
      const analytics = await storage.getPropertyPerformanceAnalytics(organizationId, referralAgentId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        startMonth: startMonth ? parseInt(startMonth) : undefined,
        startYear: startYear ? parseInt(startYear) : undefined,
        endMonth: endMonth ? parseInt(endMonth) : undefined,
        endYear: endYear ? parseInt(endYear) : undefined,
      });
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching performance analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== STAFF DASHBOARD API ENDPOINTS =====

  // Staff Dashboard Overview
  app.get("/api/staff/dashboard/overview", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1"; // Demo organization
      const staffId = user.id;
      const department = user.department;

      const overview = await storage.getStaffDashboardOverview(organizationId, staffId, department);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching staff dashboard overview:", error);
      res.status(500).json({ message: "Failed to fetch dashboard overview" });
    }
  });

  // Staff Tasks Management
  app.get("/api/staff/tasks", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const staffId = user.id;
      const filters = req.query;

      const tasks = await storage.getStaffTasks(organizationId, staffId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching staff tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Start Task
  app.post("/api/staff/tasks/:taskId/start", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const taskId = parseInt(req.params.taskId);
      const staffId = user.id;

      const task = await storage.startTask(organizationId, taskId, staffId);
      res.json(task);
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ message: "Failed to start task" });
    }
  });

  // Complete Task
  app.post("/api/staff/tasks/:taskId/complete", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const taskId = parseInt(req.params.taskId);
      const staffId = user.id;
      const completionData = req.body;

      const task = await storage.completeTask(organizationId, taskId, staffId, completionData);
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Skip Task
  app.post("/api/staff/tasks/:taskId/skip", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const taskId = parseInt(req.params.taskId);
      const staffId = user.id;
      const { reason } = req.body;

      const task = await storage.skipTask(organizationId, taskId, staffId, reason);
      res.json(task);
    } catch (error) {
      console.error("Error skipping task:", error);
      res.status(500).json({ message: "Failed to skip task" });
    }
  });

  // Reschedule Task
  app.post("/api/staff/tasks/:taskId/reschedule", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const taskId = parseInt(req.params.taskId);
      const staffId = user.id;
      const { newDate, reason } = req.body;

      const task = await storage.rescheduleTask(organizationId, taskId, staffId, new Date(newDate), reason);
      res.json(task);
    } catch (error) {
      console.error("Error rescheduling task:", error);
      res.status(500).json({ message: "Failed to reschedule task" });
    }
  });

  // Staff Salary Information - Role-based access control
  app.get("/api/staff/salary", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const { period, userId } = req.query;
      
      // Role-based access control
      const hasFullSalaryAccess = user.role === 'admin' || user.role === 'hr';
      
      if (hasFullSalaryAccess) {
        // Admin/HR can view all staff salaries
        const allSalaries = await storage.getAllStaffSalaries(organizationId, period as string);
        res.json(allSalaries);
      } else if (user.role === 'staff') {
        // Staff can only view their own salary
        const salary = await storage.getStaffSalary(organizationId, user.id, period as string);
        res.json(salary);
      } else {
        // Other roles (pool, garden, maintenance, cleaning staff) can only view their own salary
        const salary = await storage.getStaffSalary(organizationId, user.id, period as string);
        res.json(salary);
      }
    } catch (error) {
      console.error("Error fetching staff salary:", error);
      res.status(500).json({ message: "Failed to fetch salary information" });
    }
  });

  // Staff Expense Management
  app.get("/api/staff/expenses", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const staffId = user.id;
      const filters = req.query;

      const expenses = await storage.getStaffExpenses(organizationId, staffId, filters);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching staff expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Create Staff Expense
  app.post("/api/staff/expenses", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const staffId = user.id;
      const expenseData = { 
        ...req.body, 
        organizationId, 
        staffId 
      };

      const expense = await storage.createStaffExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating staff expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Staff Task History
  app.get("/api/staff/task-history", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const staffId = user.id;
      const filters = req.query;

      const history = await storage.getStaffTaskHistory(organizationId, staffId, filters);
      res.json(history);
    } catch (error) {
      console.error("Error fetching task history:", error);
      res.status(500).json({ message: "Failed to fetch task history" });
    }
  });

  // ===== STAFF SALARY, OVERTIME & EMERGENCY TRACKER API =====
  
  // Get staff list for salary management
  app.get("/api/staff-salary/staff-list", isDemoAuthenticated, async (req: any, res) => {
    try {
      const mockStaffList = [
        { id: "staff1", name: "Maria Santos", department: "housekeeping", role: "staff" },
        { id: "staff2", name: "Carlos Rivera", department: "pool", role: "staff" },
        { id: "staff3", name: "Ana Rodriguez", department: "maintenance", role: "staff" },
        { id: "staff4", name: "Diego Martinez", department: "security", role: "staff" },
      ];
      res.json(mockStaffList);
    } catch (error) {
      console.error("Error fetching staff list:", error);
      res.status(500).json({ message: "Failed to fetch staff list" });
    }
  });

  // Get salary settings for a staff member
  app.get("/api/staff-salary/settings/:staffId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { staffId } = req.params;
      const mockSettings = {
        id: 1,
        staffId,
        staffName: "Maria Santos",
        department: "housekeeping",
        fixedMonthlySalary: 4500.00,
        currency: "AUD",
        hourlyOvertime: 35.00,
        emergencyTaskBonus: 100.00,
        regularShiftStart: "08:00",
        regularShiftEnd: "16:00",
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        isActive: true,
        effectiveFrom: "2024-01-01",
      };
      res.json(mockSettings);
    } catch (error) {
      console.error("Error fetching salary settings:", error);
      res.status(500).json({ message: "Failed to fetch salary settings" });
    }
  });

  // Get clock logs for a specific month
  app.get("/api/staff-salary/clock-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.query;
      const mockClockLogs = [
        {
          id: 1,
          staffId: "demo-staff",
          staffName: "Maria Santos",
          clockInTime: "2024-12-01T08:00:00Z",
          clockOutTime: "2024-12-01T16:30:00Z",
          clockInReason: "regular_shift",
          clockOutReason: "shift_end",
          totalHours: 8.5,
          regularHours: 8.0,
          overtimeHours: 0.5,
          overtimeType: "emergency",
          overtimeApprovalStatus: "approved",
          notes: "Extended shift for emergency pool cleaning"
        },
        {
          id: 2,
          staffId: "demo-staff",
          staffName: "Maria Santos",
          clockInTime: "2024-12-02T08:00:00Z",
          clockOutTime: "2024-12-02T16:00:00Z",
          clockInReason: "regular_shift",
          clockOutReason: "shift_end",
          totalHours: 8.0,
          regularHours: 8.0,
          overtimeHours: 0,
          overtimeApprovalStatus: "approved",
          notes: ""
        }
      ];
      res.json(mockClockLogs);
    } catch (error) {
      console.error("Error fetching clock logs:", error);
      res.status(500).json({ message: "Failed to fetch clock logs" });
    }
  });

  // Get payroll summary for a specific month
  app.get("/api/staff-salary/payroll-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.query;
      const mockPayrollSummary = {
        id: 1,
        summaryMonth: month || "2024-12",
        totalStaff: 4,
        totalFixedSalaries: 18000.00,
        totalOvertimePay: 875.00,
        totalEmergencyBonuses: 400.00,
        totalPayroll: 19275.00,
        departmentBreakdown: {
          housekeeping: 9000.00,
          pool: 4500.00,
          maintenance: 4500.00,
          security: 1275.00
        },
        overtimeHoursBreakdown: {
          housekeeping: 12.5,
          pool: 8.0,
          maintenance: 5.5,
          security: 3.0
        },
        emergencyTasksCount: 4,
        paymentCompletionRate: 95.5,
        averageOvertimeHours: 7.25
      };
      res.json(mockPayrollSummary);
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
      res.status(500).json({ message: "Failed to fetch payroll summary" });
    }
  });

  // Record clock in/out
  app.post("/api/staff-salary/clock", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { action, reason, notes } = req.body;
      
      const mockResponse = {
        id: Date.now(),
        staffId: user.id,
        staffName: user.name || "Staff Member",
        action,
        reason,
        notes,
        timestamp: new Date().toISOString(),
        success: true
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error recording clock action:", error);
      res.status(500).json({ message: "Failed to record clock action" });
    }
  });

  // Record emergency task bonus
  app.post("/api/staff-salary/emergency-bonus", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { taskId, bonusAmount, emergencyType, notes } = req.body;
      
      const mockResponse = {
        id: Date.now(),
        taskId,
        staffId: user.id,
        staffName: user.name || "Staff Member",
        emergencyType,
        bonusAmount,
        currency: "AUD",
        bonusApprovalStatus: "pending",
        notes,
        createdAt: new Date().toISOString()
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error recording emergency bonus:", error);
      res.status(500).json({ message: "Failed to record emergency bonus" });
    }
  });

  // Get advance requests - Role-based access control
  app.get("/api/staff-salary/advance-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Role-based access control
      const hasFullAccess = user.role === 'admin' || user.role === 'hr';
      
      const mockAdvanceRequests = [
        {
          id: 1,
          staffId: "demo-staff",
          staffName: "Maria Santos",
          amount: 500.00,
          reason: "Medical emergency",
          requestedDate: "2024-12-15",
          status: "pending",
          createdAt: "2024-12-01T10:00:00Z",
          approvedBy: null,
          approvedAt: null
        },
        {
          id: 2,
          staffId: "demo-staff-2",
          staffName: "John Pool Cleaner",
          amount: 300.00,
          reason: "Family celebration",
          requestedDate: "2024-11-20",
          status: "approved",
          createdAt: "2024-11-10T14:30:00Z",
          approvedBy: "admin",
          approvedAt: "2024-11-11T09:15:00Z"
        },
        {
          id: 3,
          staffId: user.id,
          staffName: user.firstName + " " + user.lastName,
          amount: 400.00,
          reason: "Personal emergency",
          requestedDate: "2024-12-10",
          status: "pending",
          createdAt: "2024-12-05T08:00:00Z",
          approvedBy: null,
          approvedAt: null
        }
      ];
      
      if (hasFullAccess) {
        // Admin/HR can view all advance requests
        res.json(mockAdvanceRequests);
      } else {
        // Staff can only view their own advance requests
        const userRequests = mockAdvanceRequests.filter(req => req.staffId === user.id);
        res.json(userRequests);
      }
    } catch (error) {
      console.error("Error fetching advance requests:", error);
      res.status(500).json({ message: "Failed to fetch advance requests" });
    }
  });

  // Submit advance request
  app.post("/api/staff-salary/advance-request", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { amount, reason, requestedDate } = req.body;
      
      const mockResponse = {
        id: Date.now(),
        staffId: user.id,
        staffName: user.name || "Staff Member",
        amount,
        reason,
        requestedDate,
        status: "pending",
        createdAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error submitting advance request:", error);
      res.status(500).json({ message: "Failed to submit advance request" });
    }
  });

  // Get overtime requests
  app.get("/api/staff-salary/overtime-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const mockOvertimeRequests = [
        {
          id: 1,
          staffId: "demo-staff",
          staffName: "Maria Santos",
          taskId: 101,
          hoursWorked: 3.5,
          requestType: "pay",
          status: "approved",
          notes: "Emergency pool cleaning after storm",
          createdAt: "2024-12-01T18:00:00Z",
          approvedBy: "admin",
          approvedAt: "2024-12-02T08:30:00Z"
        },
        {
          id: 2,
          staffId: "demo-staff",
          staffName: "Maria Santos",
          taskId: 102,
          hoursWorked: 2.0,
          requestType: "time_off",
          status: "pending",
          notes: "Extended housekeeping due to large group checkout",
          createdAt: "2024-12-03T16:30:00Z",
          approvedBy: null,
          approvedAt: null
        }
      ];
      res.json(mockOvertimeRequests);
    } catch (error) {
      console.error("Error fetching overtime requests:", error);
      res.status(500).json({ message: "Failed to fetch overtime requests" });
    }
  });

  // Submit overtime request
  app.post("/api/staff-salary/overtime-request", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { taskId, hoursWorked, requestType, notes } = req.body;
      
      const mockResponse = {
        id: Date.now(),
        staffId: user.id,
        staffName: user.name || "Staff Member",
        taskId,
        hoursWorked,
        requestType,
        status: "pending",
        notes,
        createdAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error submitting overtime request:", error);
      res.status(500).json({ message: "Failed to submit overtime request" });
    }
  });

  // Approve/reject advance request - Admin/HR only
  app.post("/api/staff-salary/approve-advance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { requestId, action, notes } = req.body;
      
      // Role-based access control - Only admin/HR can approve advance requests
      if (user.role !== 'admin' && user.role !== 'hr') {
        return res.status(403).json({ 
          message: "Access denied: Only admin and HR roles can approve advance requests" 
        });
      }
      
      const mockResponse = {
        id: requestId,
        action,
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        notes,
        success: true
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error updating advance request:", error);
      res.status(500).json({ message: "Failed to update advance request" });
    }
  });

  // Approve/reject overtime request
  app.post("/api/staff-salary/approve-overtime", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { requestId, action, notes } = req.body;
      
      const mockResponse = {
        id: requestId,
        action,
        approvedBy: user.id,
        approvedAt: new Date().toISOString(),
        notes,
        success: true
      };
      
      res.json(mockResponse);
    } catch (error) {
      console.error("Error updating overtime request:", error);
      res.status(500).json({ message: "Failed to update overtime request" });
    }
  });

  // Task Checklist
  app.get("/api/staff/task-checklist/:taskType", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = "demo-org-1";
      const { taskType } = req.params;
      const { propertyId } = req.query;

      const checklist = await storage.getTaskChecklist(
        organizationId, 
        taskType, 
        propertyId ? parseInt(propertyId as string) : undefined
      );
      res.json(checklist);
    } catch (error) {
      console.error("Error fetching task checklist:", error);
      res.status(500).json({ message: "Failed to fetch checklist" });
    }
  });

  // ===== ADMIN FINANCE RESET CONTROL API ENDPOINTS =====

  // Admin only middleware for finance reset operations
  const isAdminOnly = (req: any, res: any, next: any) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is admin role
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      next();
    } catch (error) {
      console.error("Error checking admin privileges:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  // Get users available for balance reset
  app.get("/api/admin/balance-reset/users", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const { userType } = req.query;
      
      const users = await storage.getUsersForBalanceReset(
        organizationId, 
        userType !== 'all' ? userType : undefined
      );
      res.json(users);
    } catch (error) {
      console.error("Error fetching users for reset:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get user balance summary
  app.get("/api/admin/balance-reset/user/:userId/balance", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      const balanceSummary = await storage.getUserBalanceSummary(userId);
      res.json(balanceSummary);
    } catch (error) {
      console.error("Error fetching user balance:", error);
      res.status(500).json({ message: "Failed to fetch balance information" });
    }
  });

  // Execute balance reset
  app.post("/api/admin/balance-reset/execute", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const adminUser = req.user;
      const { userId, resetReason, propertyId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const auditRecord = await storage.resetUserBalance(
        userId,
        adminUser.id,
        resetReason,
        propertyId
      );

      res.json({
        success: true,
        message: "Balance reset successfully",
        auditRecord
      });
    } catch (error) {
      console.error("Error resetting balance:", error);
      res.status(500).json({ message: "Failed to reset balance" });
    }
  });

  // Get balance reset audit log
  app.get("/api/admin/balance-reset/audit", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const { userId, fromDate, toDate } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId;
      if (fromDate) filters.fromDate = new Date(fromDate);
      if (toDate) filters.toDate = new Date(toDate);

      const auditLog = await storage.getBalanceResetAuditLog(organizationId, filters);
      res.json(auditLog);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // ===== UTILITY PROVIDERS & CUSTOM EXPENSE MANAGEMENT API ENDPOINTS =====

  // Get utility providers
  app.get("/api/utility-providers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const { utilityType } = req.query;
      
      const providers = await storage.getUtilityProviders(organizationId, utilityType);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching utility providers:", error);
      res.status(500).json({ message: "Failed to fetch utility providers" });
    }
  });

  // Create utility provider
  app.post("/api/utility-providers", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const user = req.user;
      
      const providerData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
      };

      const provider = await storage.createUtilityProvider(providerData);
      res.json(provider);
    } catch (error) {
      console.error("Error creating utility provider:", error);
      res.status(500).json({ message: "Failed to create utility provider" });
    }
  });

  // Update utility provider
  app.put("/api/utility-providers/:id", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const provider = await storage.updateUtilityProvider(parseInt(id), req.body);
      res.json(provider);
    } catch (error) {
      console.error("Error updating utility provider:", error);
      res.status(500).json({ message: "Failed to update utility provider" });
    }
  });

  // Delete utility provider
  app.delete("/api/utility-providers/:id", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUtilityProvider(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting utility provider:", error);
      res.status(500).json({ message: "Failed to delete utility provider" });
    }
  });

  // Get custom expense categories
  app.get("/api/custom-expense-categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const categories = await storage.getCustomExpenseCategories(organizationId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching custom expense categories:", error);
      res.status(500).json({ message: "Failed to fetch custom expense categories" });
    }
  });

  // Create custom expense category
  app.post("/api/custom-expense-categories", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const user = req.user;
      
      const categoryData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
      };

      const category = await storage.createCustomExpenseCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating custom expense category:", error);
      res.status(500).json({ message: "Failed to create custom expense category" });
    }
  });

  // Update custom expense category
  app.put("/api/custom-expense-categories/:id", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      const category = await storage.updateCustomExpenseCategory(parseInt(id), req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating custom expense category:", error);
      res.status(500).json({ message: "Failed to update custom expense category" });
    }
  });

  // Delete custom expense category
  app.delete("/api/custom-expense-categories/:id", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomExpenseCategory(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom expense category:", error);
      res.status(500).json({ message: "Failed to delete custom expense category" });
    }
  });

  // Get property utility settings
  app.get("/api/property-utility-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const { propertyId } = req.query;
      
      const settings = await storage.getPropertyUtilitySettings(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(settings);
    } catch (error) {
      console.error("Error fetching property utility settings:", error);
      res.status(500).json({ message: "Failed to fetch property utility settings" });
    }
  });

  // Create property utility settings
  app.post("/api/property-utility-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const user = req.user;
      
      const settingsData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
      };

      const settings = await storage.createPropertyUtilitySettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error creating property utility settings:", error);
      res.status(500).json({ message: "Failed to create property utility settings" });
    }
  });

  // Update property utility settings
  app.put("/api/property-utility-settings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const settings = await storage.updatePropertyUtilitySettings(parseInt(id), req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating property utility settings:", error);
      res.status(500).json({ message: "Failed to update property utility settings" });
    }
  });

  // Delete property utility settings
  app.delete("/api/property-utility-settings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePropertyUtilitySettings(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting property utility settings:", error);
      res.status(500).json({ message: "Failed to delete property utility settings" });
    }
  });

  // Get property custom expenses
  app.get("/api/property-custom-expenses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const { propertyId } = req.query;
      
      const expenses = await storage.getPropertyCustomExpenses(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching property custom expenses:", error);
      res.status(500).json({ message: "Failed to fetch property custom expenses" });
    }
  });

  // Create property custom expenses
  app.post("/api/property-custom-expenses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const user = req.user;
      
      const expenseData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
      };

      const expense = await storage.createPropertyCustomExpenses(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating property custom expenses:", error);
      res.status(500).json({ message: "Failed to create property custom expenses" });
    }
  });

  // Update property custom expenses
  app.put("/api/property-custom-expenses/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const expense = await storage.updatePropertyCustomExpenses(parseInt(id), req.body);
      res.json(expense);
    } catch (error) {
      console.error("Error updating property custom expenses:", error);
      res.status(500).json({ message: "Failed to update property custom expenses" });
    }
  });

  // Delete property custom expenses
  app.delete("/api/property-custom-expenses/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePropertyCustomExpenses(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting property custom expenses:", error);
      res.status(500).json({ message: "Failed to delete property custom expenses" });
    }
  });

  // Seed default providers and categories (Admin only)
  app.post("/api/admin/seed-defaults", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1"; // Demo organization
      const user = req.user;
      
      await storage.seedDefaultUtilityProviders(organizationId, user.id);
      await storage.seedDefaultCustomExpenseCategories(organizationId, user.id);
      
      res.json({ success: true, message: "Default providers and categories seeded successfully" });
    } catch (error) {
      console.error("Error seeding defaults:", error);
      res.status(500).json({ message: "Failed to seed default data" });
    }
  });

  // ===== ENHANCED COMMISSION MANAGEMENT API =====

  // Agent Commission Summary with KPIs (Agent Access)
  app.get("/api/agent/commission-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId, role } = req.user;
      
      if (!['retail-agent', 'referral-agent'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Agent role required." });
      }

      const summary = await storage.getAgentCommissionSummary(organizationId, agentId, role);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching commission summary:", error);
      res.status(500).json({ message: "Failed to fetch commission summary" });
    }
  });

  // Agent Commission Log (Agent Access)
  app.get("/api/agent/commission-log", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId, role } = req.user;
      const { propertyId, status, startDate, endDate, limit } = req.query;

      if (!['retail-agent', 'referral-agent'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Agent role required." });
      }

      const commissions = await storage.getCommissionLog(organizationId, {
        agentId,
        agentType: role,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commission log:", error);
      res.status(500).json({ message: "Failed to fetch commission log" });
    }
  });

  // Generate Commission Invoice (Agent Access)
  app.post("/api/agent/generate-invoice", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId, role } = req.user;
      const { periodStart, periodEnd, description, agentNotes } = req.body;

      if (!['retail-agent', 'referral-agent'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Agent role required." });
      }

      // Get pending commissions for the period
      const commissions = await storage.getCommissionLog(organizationId, {
        agentId,
        agentType: role,
        status: 'pending',
        startDate: periodStart,
        endDate: periodEnd,
      });

      if (commissions.length === 0) {
        return res.status(400).json({ message: "No pending commissions found for the selected period" });
      }

      const totalCommissions = commissions.reduce((sum, comm) => sum + Number(comm.commissionAmount), 0);

      // Generate invoice number
      const invoiceNumber = await storage.generateInvoiceNumber(organizationId, role);

      // Create invoice
      const invoice = await storage.createCommissionInvoice({
        organizationId,
        agentId,
        agentType: role,
        invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0],
        periodStart,
        periodEnd,
        totalCommissions: totalCommissions.toString(),
        currency: 'THB',
        description,
        agentNotes,
        generatedBy: agentId,
      });

      // Create line items
      for (const commission of commissions) {
        await storage.createInvoiceLineItem({
          organizationId,
          invoiceId: invoice.id,
          commissionLogId: commission.id,
          description: `Commission for ${commission.propertyName || 'Property'} - ${commission.referenceNumber}`,
          propertyName: commission.propertyName || 'Property',
          referenceNumber: commission.referenceNumber,
          commissionDate: commission.createdAt.toISOString().split('T')[0],
          commissionAmount: commission.commissionAmount,
        });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Agent Invoices (Agent Access)
  app.get("/api/agent/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId, role } = req.user;
      const { status, startDate, endDate } = req.query;

      if (!['retail-agent', 'referral-agent'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Agent role required." });
      }

      const invoices = await storage.getAgentInvoices(organizationId, agentId, {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(invoices);
    } catch (error) {
      console.error("Error fetching agent invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Submit Invoice for Approval (Agent Access)
  app.patch("/api/agent/invoices/:id/submit", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: agentId, role } = req.user;
      const { id } = req.params;

      if (!['retail-agent', 'referral-agent'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Agent role required." });
      }

      const invoice = await storage.submitInvoiceForApproval(parseInt(id), agentId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error submitting invoice:", error);
      res.status(500).json({ message: "Failed to submit invoice" });
    }
  });

  // ===== ADMIN COMMISSION MANAGEMENT API =====

  // Admin Commission Overview with CSV Export (Admin Access)
  app.get("/api/admin/commission-overview", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { agentType, startDate, endDate, status, format } = req.query;

      const commissions = await storage.getCommissionOverviewForExport(organizationId, {
        agentType: agentType as 'retail-agent' | 'referral-agent',
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
      });

      if (format === 'csv') {
        const csv = [
          'Agent ID,Agent Name,Agent Email,Agent Type,Property,Reference,Date,Base Amount,Rate %,Commission Amount,Currency,Status,Processed By,Processed Date',
          ...commissions.map(c => 
            `${c.agentId},"${c.agentName}","${c.agentEmail}",${c.agentType},"${c.propertyName}",${c.referenceNumber},${c.commissionDate.toISOString().split('T')[0]},${c.baseAmount},${c.commissionRate},${c.commissionAmount},${c.currency},${c.status},"${c.processedBy || ''}","${c.processedAt ? c.processedAt.toISOString().split('T')[0] : ''}"`
          )
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="commission-overview-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
      } else {
        res.json(commissions);
      }
    } catch (error) {
      console.error("Error fetching commission overview:", error);
      res.status(500).json({ message: "Failed to fetch commission overview" });
    }
  });

  // Mark Commission as Paid (Admin Access)
  app.patch("/api/admin/commissions/:id/mark-paid", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id: adminId } = req.user;
      const { id } = req.params;
      const { notes } = req.body;

      const commission = await storage.markCommissionAsPaid(parseInt(id), adminId, notes);
      
      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      res.json(commission);
    } catch (error) {
      console.error("Error marking commission as paid:", error);
      res.status(500).json({ message: "Failed to mark commission as paid" });
    }
  });

  // Adjust Commission Amount (Admin Access)
  app.patch("/api/admin/commissions/:id/adjust", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id: adminId } = req.user;
      const { id } = req.params;
      const { newAmount, reason } = req.body;

      if (!newAmount || !reason) {
        return res.status(400).json({ message: "New amount and reason are required" });
      }

      const result = await storage.adjustCommissionAmount(parseInt(id), parseFloat(newAmount), adminId, reason);
      res.json(result);
    } catch (error) {
      console.error("Error adjusting commission:", error);
      res.status(500).json({ message: "Failed to adjust commission" });
    }
  });

  // Approve Invoice (Admin Access)
  app.patch("/api/admin/invoices/:id/approve", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id: adminId } = req.user;
      const { id } = req.params;
      const { notes } = req.body;

      const invoice = await storage.approveInvoice(parseInt(id), adminId, notes);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error approving invoice:", error);
      res.status(500).json({ message: "Failed to approve invoice" });
    }
  });

  // Reject Invoice (Admin Access)
  app.patch("/api/admin/invoices/:id/reject", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { id: adminId } = req.user;
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const invoice = await storage.rejectInvoice(parseInt(id), adminId, reason);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Error rejecting invoice:", error);
      res.status(500).json({ message: "Failed to reject invoice" });
    }
  });

  // Trigger Commission Payout (Admin Access)
  app.post("/api/admin/commissions/trigger-payout", isDemoAuthenticated, isAdminOnly, async (req: any, res) => {
    try {
      const { organizationId, id: adminId } = req.user;
      const { agentId, amount, agentType } = req.body;

      if (!agentId || !amount || !agentType) {
        return res.status(400).json({ message: "Agent ID, amount, and agent type are required" });
      }

      const payout = await storage.triggerCommissionPayout(
        agentId, 
        organizationId, 
        parseFloat(amount), 
        agentType, 
        adminId
      );

      res.json(payout);
    } catch (error) {
      console.error("Error triggering payout:", error);
      res.status(500).json({ message: "Failed to trigger payout" });
    }
  });

  // ===== AI GUEST PORTAL & SMART COMMUNICATION CENTER API ENDPOINTS =====

  // Guest Message Management
  app.get("/api/guest-portal/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, guestId, messageType, priority, status } = req.query;

      const filters = {
        propertyId,
        guestId,
        messageType,
        priority,
        status,
      };

      const messages = await storage.getGuestMessages(organizationId, filters);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching guest messages:", error);
      res.status(500).json({ message: "Failed to fetch guest messages" });
    }
  });

  app.post("/api/guest-portal/messages", async (req: any, res) => {
    try {
      const messageData = {
        ...req.body,
        organizationId: req.body.organizationId || "default-org",
        guestId: req.body.guestId || `guest-${Date.now()}`,
      };

      const message = await storage.createGuestMessage(messageData);
      
      // Simulate AI processing and possibly create task
      if (message.aiKeywords && message.aiKeywords.length > 0) {
        await storage.generateTaskFromMessage(message.id, message, {
          keywords: message.aiKeywords,
          confidence: parseFloat(message.aiConfidence),
          priority: message.priority,
        });
      }

      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating guest message:", error);
      res.status(500).json({ message: "Failed to create guest message" });
    }
  });

  app.patch("/api/guest-portal/messages/:id/respond", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { response } = req.body;
      const { id: userId } = req.user;

      const message = await storage.respondToGuestMessage(parseInt(id), response, userId);
      res.json(message);
    } catch (error) {
      console.error("Error responding to guest message:", error);
      res.status(500).json({ message: "Failed to respond to guest message" });
    }
  });

  // AI-Generated Task Management
  app.get("/api/guest-portal/ai-tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { department, status, urgency, assignedTo } = req.query;

      const filters = {
        department,
        status,
        urgency,
        assignedTo,
      };

      const tasks = await storage.getAiGeneratedTasks(organizationId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching AI-generated tasks:", error);
      res.status(500).json({ message: "Failed to fetch AI-generated tasks" });
    }
  });

  app.patch("/api/guest-portal/ai-tasks/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const task = await storage.approveAiTask(parseInt(id), userId);
      res.json(task);
    } catch (error) {
      console.error("Error approving AI task:", error);
      res.status(500).json({ message: "Failed to approve AI task" });
    }
  });

  app.patch("/api/guest-portal/ai-tasks/:id/reject", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const task = await storage.rejectAiTask(parseInt(id), userId);
      res.json(task);
    } catch (error) {
      console.error("Error rejecting AI task:", error);
      res.status(500).json({ message: "Failed to reject AI task" });
    }
  });

  // Guest Service Request Management
  app.get("/api/guest-portal/service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, guestId, serviceType, status } = req.query;

      const filters = {
        propertyId,
        guestId,
        serviceType,
        status,
      };

      const serviceRequests = await storage.getGuestServiceRequests(organizationId, filters);
      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching guest service requests:", error);
      res.status(500).json({ message: "Failed to fetch guest service requests" });
    }
  });

  app.post("/api/guest-portal/service-requests", async (req: any, res) => {
    try {
      const requestData = {
        ...req.body,
        organizationId: req.body.organizationId || "default-org",
        guestId: req.body.guestId || `guest-${Date.now()}`,
      };

      const serviceRequest = await storage.createGuestServiceRequest(requestData);
      res.status(201).json(serviceRequest);
    } catch (error) {
      console.error("Error creating guest service request:", error);
      res.status(500).json({ message: "Failed to create guest service request" });
    }
  });

  app.patch("/api/guest-portal/service-requests/:id/confirm", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const serviceRequest = await storage.confirmServiceRequest(parseInt(id), userId);
      res.json(serviceRequest);
    } catch (error) {
      console.error("Error confirming service request:", error);
      res.status(500).json({ message: "Failed to confirm service request" });
    }
  });

  app.patch("/api/guest-portal/service-requests/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { guestRating, guestFeedback } = req.body;

      const serviceRequest = await storage.completeServiceRequest(parseInt(id), guestRating, guestFeedback);
      res.json(serviceRequest);
    } catch (error) {
      console.error("Error completing service request:", error);
      res.status(500).json({ message: "Failed to complete service request" });
    }
  });

  // AI Smart Suggestions Management
  app.get("/api/guest-portal/ai-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { suggestionType, targetAudience, status, priority } = req.query;

      const filters = {
        suggestionType,
        targetAudience,
        status,
        priority,
      };

      const suggestions = await storage.getAiSmartSuggestions(organizationId, filters);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI smart suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI smart suggestions" });
    }
  });

  app.post("/api/guest-portal/ai-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;

      const suggestionData = {
        ...req.body,
        organizationId,
      };

      const suggestion = await storage.createAiSmartSuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      console.error("Error creating AI smart suggestion:", error);
      res.status(500).json({ message: "Failed to create AI smart suggestion" });
    }
  });

  app.patch("/api/guest-portal/ai-suggestions/:id/review", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const { id: userId } = req.user;

      const suggestion = await storage.reviewAiSuggestion(parseInt(id), userId, status, notes);
      res.json(suggestion);
    } catch (error) {
      console.error("Error reviewing AI suggestion:", error);
      res.status(500).json({ message: "Failed to review AI suggestion" });
    }
  });

  app.patch("/api/guest-portal/ai-suggestions/:id/implement", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;

      const suggestion = await storage.implementAiSuggestion(parseInt(id));
      res.json(suggestion);
    } catch (error) {
      console.error("Error implementing AI suggestion:", error);
      res.status(500).json({ message: "Failed to implement AI suggestion" });
    }
  });

  // Guest Portal Settings Management
  app.get("/api/guest-portal/settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId } = req.query;

      const settings = await storage.getGuestPortalSettings(organizationId, propertyId ? parseInt(propertyId) : undefined);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching guest portal settings:", error);
      res.status(500).json({ message: "Failed to fetch guest portal settings" });
    }
  });

  app.put("/api/guest-portal/settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const settings = await storage.updateGuestPortalSettings(organizationId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating guest portal settings:", error);
      res.status(500).json({ message: "Failed to update guest portal settings" });
    }
  });

  // Guest Dashboard Analytics
  app.get("/api/guest-portal/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { month, propertyId } = req.query;

      const analytics = await storage.getGuestDashboardAnalytics(
        organizationId,
        month as string,
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching guest dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch guest dashboard analytics" });
    }
  });

  // ===== ENHANCED SERVICE REQUEST CONFIRMATION API ENDPOINTS =====

  // Create service request with enhanced confirmation workflow (Guest accessible)
  app.post("/api/service-requests/create-with-confirmation", async (req, res) => {
    try {
      const organizationId = "default-org"; // Use default for demo
      
      const serviceRequestData = {
        ...req.body,
        organizationId,
      };

      const serviceRequest = await storage.createServiceRequestWithConfirmation(organizationId, serviceRequestData);
      res.status(201).json({
        serviceRequest,
        message: "Service request submitted and pending confirmation",
        confirmationRequired: serviceRequest.awaitingConfirmation
      });
    } catch (error) {
      console.error("Error creating service request with confirmation:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  // Get pending service request notifications for admin/host review
  app.get("/api/service-requests/notifications/pending", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const notifications = await storage.getPendingServiceRequestNotifications(organizationId, role);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching pending service request notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get service request details for review
  app.get("/api/service-requests/:serviceRequestId/details", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { serviceRequestId } = req.params;
      
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const serviceRequest = await storage.getServiceRequestDetails(organizationId, parseInt(serviceRequestId));
      res.json(serviceRequest);
    } catch (error) {
      console.error("Error fetching service request details:", error);
      res.status(500).json({ message: "Failed to fetch service request details" });
    }
  });

  // Confirm service request with pricing and assignment (Admin/PM only)
  app.post("/api/service-requests/:serviceRequestId/confirm", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId, firstName, lastName } = req.user;
      const { serviceRequestId } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const confirmationData = {
        ...req.body,
        confirmedBy: userId,
        confirmedByName: `${firstName} ${lastName}`,
      };

      const confirmation = await storage.confirmServiceRequest(organizationId, parseInt(serviceRequestId), confirmationData);
      res.json({
        confirmation,
        message: "Service request confirmed successfully",
        taskCreated: confirmation.autoCreateTask
      });
    } catch (error) {
      console.error("Error confirming service request:", error);
      res.status(500).json({ message: "Failed to confirm service request" });
    }
  });

  // Decline service request with reason (Admin/PM only)
  app.post("/api/service-requests/:serviceRequestId/decline", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId, firstName, lastName } = req.user;
      const { serviceRequestId } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const declineData = {
        ...req.body,
        declinedBy: userId,
        declinedByName: `${firstName} ${lastName}`,
      };

      const decline = await storage.declineServiceRequest(organizationId, parseInt(serviceRequestId), declineData);
      res.json({
        decline,
        message: "Service request declined"
      });
    } catch (error) {
      console.error("Error declining service request:", error);
      res.status(500).json({ message: "Failed to decline service request" });
    }
  });

  // Mark notification as acknowledged (Admin/PM/Staff)
  app.patch("/api/service-requests/notifications/:notificationId/acknowledge", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { notificationId } = req.params;
      const { notes } = req.body;

      // Mock acknowledgment response
      const acknowledgment = {
        notificationId: parseInt(notificationId),
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        notes,
        status: "acknowledged"
      };

      res.json({
        acknowledgment,
        message: "Notification acknowledged"
      });
    } catch (error) {
      console.error("Error acknowledging notification:", error);
      res.status(500).json({ message: "Failed to acknowledge notification" });
    }
  });

  // Get all service requests with enhanced filtering (Admin/PM/Staff)
  app.get("/api/service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, priority, serviceCategory, propertyId, awaitingConfirmation } = req.query;

      // Mock service requests with filtering
      let serviceRequests = [
        {
          id: 101,
          reservationId: "Demo1234",
          guestName: "Liam Andersen",
          propertyName: "Villa Aruna",
          title: "Private Spa Massage",
          serviceCategory: "spa",
          status: "pending",
          priority: "normal",
          awaitingConfirmation: true,
          estimatedCost: 3500,
          currency: "THB",
          createdAt: new Date("2025-07-04T15:30:00Z"),
        },
        {
          id: 102,
          reservationId: "Demo1234",
          guestName: "Liam Andersen",
          propertyName: "Villa Aruna",
          title: "Extra Pool Towels",
          serviceCategory: "housekeeping",
          status: "pending",
          priority: "high",
          awaitingConfirmation: true,
          estimatedCost: 0,
          currency: "THB",
          createdAt: new Date("2025-07-04T14:45:00Z"),
        }
      ];

      // Apply filters
      if (status) {
        serviceRequests = serviceRequests.filter(req => req.status === status);
      }
      if (priority) {
        serviceRequests = serviceRequests.filter(req => req.priority === priority);
      }
      if (serviceCategory) {
        serviceRequests = serviceRequests.filter(req => req.serviceCategory === serviceCategory);
      }
      if (awaitingConfirmation !== undefined) {
        const needsConfirmation = awaitingConfirmation === 'true';
        serviceRequests = serviceRequests.filter(req => req.awaitingConfirmation === needsConfirmation);
      }

      res.json(serviceRequests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.post("/api/guest-portal/analytics/update", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { month, propertyId } = req.body;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const analytics = await storage.updateGuestDashboardAnalytics(organizationId, month, propertyId);
      res.json(analytics);
    } catch (error) {
      console.error("Error updating guest dashboard analytics:", error);
      res.status(500).json({ message: "Failed to update guest dashboard analytics" });
    }
  });

  // Guest Communication Notifications
  app.get("/api/guest-portal/notifications", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: userId } = req.user;
      const { notificationType, isRead } = req.query;

      const filters = {
        notificationType,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
      };

      const notifications = await storage.getGuestCommunicationNotifications(userId, filters);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching guest communication notifications:", error);
      res.status(500).json({ message: "Failed to fetch guest communication notifications" });
    }
  });

  app.patch("/api/guest-portal/notifications/:id/read", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;

      const notification = await storage.markNotificationAsRead(parseInt(id));
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // ===== GUEST COMMUNICATION CENTER ROUTES =====
  
  // Get guest session information (public access for guests)
  app.get("/api/guest-portal/session", async (req, res) => {
    try {
      // Mock guest session for demo
      const guestSession = {
        id: 1,
        guestName: "John Smith",
        guestEmail: "john.smith@email.com",
        accessToken: "demo-guest-token",
        isActive: true,
        propertyId: 1,
        currentBookingId: 1,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      res.json(guestSession);
    } catch (error) {
      console.error("Error fetching guest session:", error);
      res.status(500).json({ message: "Failed to fetch guest session" });
    }
  });

  // Get guest bookings (public access for guests)
  app.get("/api/guest-portal/bookings", async (req, res) => {
    try {
      // Mock booking data
      const bookings = [
        {
          id: 1,
          propertyName: "Villa Paradise",
          propertyId: 1,
          checkIn: new Date().toISOString(),
          checkOut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          guestCount: 4,
          status: "confirmed",
          totalAmount: 2100.00,
          bookingReference: "VP2024001"
        },
        {
          id: 2,
          propertyName: "Beach House Retreat",
          propertyId: 2,
          checkIn: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          checkOut: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
          guestCount: 6,
          status: "upcoming",
          totalAmount: 3200.00,
          bookingReference: "BH2024002"
        }
      ];
      
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching guest bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get property information (public access for guests)
  app.get("/api/guest-portal/property-info/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      
      // Mock property info
      const propertyInfo = {
        id: propertyId,
        name: "Villa Paradise",
        address: "123 Paradise Drive, Tropical Island",
        amenities: [
          "Private Pool",
          "WiFi",
          "Air Conditioning",
          "Full Kitchen",
          "Washer/Dryer",
          "Parking",
          "Beach Access",
          "Garden"
        ],
        emergencyContacts: [
          {
            name: "Property Manager",
            phone: "+1-555-123-4567",
            type: "primary"
          },
          {
            name: "Maintenance",
            phone: "+1-555-987-6543",
            type: "maintenance"
          }
        ],
        houseRules: [
          "Check-in: 3:00 PM",
          "Check-out: 11:00 AM",
          "No smoking inside",
          "No pets allowed",
          "Maximum 4 guests",
          "Quiet hours: 10 PM - 8 AM"
        ],
        wifiPassword: "VillaParadise2024"
      };
      
      res.json(propertyInfo);
    } catch (error) {
      console.error("Error fetching property info:", error);
      res.status(500).json({ message: "Failed to fetch property information" });
    }
  });

  // Get available addon services (public access for guests)
  app.get("/api/guest-portal/addon-services", async (req, res) => {
    try {
      // Mock addon services
      const services = [
        {
          id: 1,
          name: "Private Chef Service",
          description: "Professional chef will prepare a delicious meal for your group",
          price: 150.00,
          category: "dining",
          duration: "3 hours",
          isAvailable: true
        },
        {
          id: 2,
          name: "Massage Service",
          description: "Relaxing massage service in the comfort of your villa",
          price: 80.00,
          category: "wellness",
          duration: "1 hour",
          isAvailable: true
        },
        {
          id: 3,
          name: "Extra Cleaning",
          description: "Additional cleaning service during your stay",
          price: 60.00,
          category: "cleaning",
          duration: "2 hours",
          isAvailable: true
        },
        {
          id: 4,
          name: "Airport Transfer",
          description: "Private transfer to/from the airport",
          price: 45.00,
          category: "transportation",
          duration: "1 hour",
          isAvailable: true
        },
        {
          id: 5,
          name: "Grocery Delivery",
          description: "Pre-stock your villa with groceries before arrival",
          price: 25.00,
          category: "convenience",
          duration: "30 minutes",
          isAvailable: true
        }
      ];
      
      res.json(services);
    } catch (error) {
      console.error("Error fetching addon services:", error);
      res.status(500).json({ message: "Failed to fetch addon services" });
    }
  });

  // Get local attractions (public access for guests)
  app.get("/api/guest-portal/local-attractions", async (req, res) => {
    try {
      // Mock local attractions
      const attractions = [
        {
          id: 1,
          name: "Paradise Beach",
          description: "Beautiful white sand beach with crystal clear waters",
          category: "beach",
          distance: "0.2 miles",
          rating: 4.8,
          image: "/images/paradise-beach.jpg"
        },
        {
          id: 2,
          name: "Tropical Restaurant",
          description: "Authentic local cuisine with ocean views",
          category: "dining",
          distance: "0.5 miles",
          rating: 4.6,
          image: "/images/tropical-restaurant.jpg"
        },
        {
          id: 3,
          name: "Island Tours",
          description: "Guided tours around the island's highlights",
          category: "tours",
          distance: "1.0 mile",
          rating: 4.9,
          image: "/images/island-tours.jpg"
        },
        {
          id: 4,
          name: "Adventure Sports Center",
          description: "Kayaking, snorkeling, and water sports rentals",
          category: "activities",
          distance: "1.2 miles",
          rating: 4.7,
          image: "/images/adventure-sports.jpg"
        },
        {
          id: 5,
          name: "Local Market",
          description: "Fresh produce, local crafts, and souvenirs",
          category: "shopping",
          distance: "0.8 miles",
          rating: 4.4,
          image: "/images/local-market.jpg"
        }
      ];
      
      res.json(attractions);
    } catch (error) {
      console.error("Error fetching local attractions:", error);
      res.status(500).json({ message: "Failed to fetch local attractions" });
    }
  });

  // Report issue (public access for guests)
  app.post("/api/guest-portal/report-issue", async (req, res) => {
    try {
      const { category, description, urgency, propertyId, location, images } = req.body;
      
      // Create issue report
      const issueReport = {
        id: Date.now(),
        category,
        description,
        urgency,
        propertyId,
        location,
        images: images || [],
        status: "reported",
        reportedBy: "John Smith",
        reportedAt: new Date().toISOString()
      };

      // AI processing - automatically create task based on issue category
      const autoTask = await processGuestIssueForAI(issueReport);
      
      // Send notification to property manager
      await storage.createNotification({
        organizationId: "demo-org",
        userId: "demo-admin",
        type: "issue_reported",
        title: `Guest Issue Reported: ${category}`,
        message: `${description} (Urgency: ${urgency})`,
        priority: urgency === "urgent" ? "high" : "medium",
        relatedEntityType: "property",
        relatedEntityId: propertyId
      });
      
      res.json({ 
        issueReport, 
        autoTask,
        message: "Issue reported successfully. We'll address it promptly." 
      });
    } catch (error) {
      console.error("Error reporting issue:", error);
      res.status(500).json({ message: "Failed to report issue" });
    }
  });

  // Service request (public access for guests)
  app.post("/api/guest-portal/service-request", async (req, res) => {
    try {
      const { serviceType, description, preferredDate, preferredTime, specialRequests, propertyId } = req.body;
      
      // Create service request
      const serviceRequest = {
        id: Date.now(),
        serviceType,
        description,
        preferredDate,
        preferredTime,
        specialRequests,
        propertyId,
        status: "requested",
        requestedBy: "John Smith",
        requestedAt: new Date().toISOString()
      };

      // Create notification for staff
      await storage.createNotification({
        organizationId: "demo-org",
        userId: "demo-admin",
        type: "service_requested",
        title: `Service Request: ${serviceType}`,
        message: `${description} - Preferred: ${preferredDate} at ${preferredTime}`,
        priority: "medium",
        relatedEntityType: "property",
        relatedEntityId: propertyId
      });
      
      res.json({ 
        serviceRequest,
        message: "Service request submitted successfully. We'll schedule it for you." 
      });
    } catch (error) {
      console.error("Error submitting service request:", error);
      res.status(500).json({ message: "Failed to submit service request" });
    }
  });

  // Addon booking (public access for guests)
  app.post("/api/guest-portal/addon-booking", async (req, res) => {
    try {
      const { serviceId, quantity, scheduledDate, scheduledTime, notes, propertyId } = req.body;
      
      // Get service details for price calculation
      const services = [
        { id: 1, price: 150.00 },
        { id: 2, price: 80.00 },
        { id: 3, price: 60.00 },
        { id: 4, price: 45.00 },
        { id: 5, price: 25.00 }
      ];
      
      const service = services.find(s => s.id === serviceId);
      const totalAmount = service ? service.price * quantity : 0;
      
      // Create addon booking
      const addonBooking = {
        id: Date.now(),
        serviceId,
        quantity,
        scheduledDate,
        scheduledTime,
        notes,
        propertyId,
        status: "booked",
        bookedBy: "John Smith",
        bookedAt: new Date().toISOString(),
        totalAmount
      };

      // Create notification for staff
      await storage.createNotification({
        organizationId: "demo-org",
        userId: "demo-admin",
        type: "addon_booked",
        title: `Addon Service Booked`,
        message: `Service ID ${serviceId} booked for ${scheduledDate} at ${scheduledTime}`,
        priority: "medium",
        relatedEntityType: "property",
        relatedEntityId: propertyId
      });
      
      res.json({ 
        addonBooking,
        message: "Service booked successfully!" 
      });
    } catch (error) {
      console.error("Error booking addon service:", error);
      res.status(500).json({ message: "Failed to book service" });
    }
  });

  app.get("/api/guest-portal/notifications/unread-count", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: userId } = req.user;

      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  // ===== GUEST PORTAL SMART REQUESTS & AI CHAT API ENDPOINTS =====

  // Get chat messages for a reservation
  app.get("/api/guest-portal/chat-messages/:reservationId", async (req, res) => {
    try {
      const { reservationId } = req.params;
      const messages = await storage.getGuestChatMessages(reservationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Send a new message
  app.post("/api/guest-portal/send-message", async (req, res) => {
    try {
      const { reservationId, messageText, senderType, senderId } = req.body;
      
      // Create the message
      const messageData = {
        organizationId: "Demo1234", // Demo organization
        conversationId: 1, // Demo conversation
        senderType,
        senderId,
        messageText,
        isSystemGenerated: false,
      };

      const message = await storage.createGuestChatMessage(messageData);
      
      // AI intent analysis for guest messages
      if (senderType === "guest") {
        const aiAnalysis = await storage.analyzeMessageIntent(message.id, messageText);
        
        if (aiAnalysis && aiAnalysis.requiresAction) {
          // Generate service request automatically
          await storage.generateServiceRequestFromMessage(message.id, aiAnalysis.intent, aiAnalysis.category);
        }
      }

      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get service requests for a reservation
  app.get("/api/guest-portal/service-requests/:reservationId", async (req, res) => {
    try {
      const { reservationId } = req.params;
      const requests = await storage.getGuestServiceRequestsByReservation(reservationId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Handle service request actions (accept/decline/edit)
  app.post("/api/guest-portal/service-requests/:requestId/action", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { requestId } = req.params;
      const { action, notes } = req.body;
      const { role } = req.user;

      if (!["admin", "portfolio-manager", "staff"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      let status;
      switch (action) {
        case "accept":
          status = "accepted";
          break;
        case "decline":
          status = "declined";
          break;
        default:
          return res.status(400).json({ message: "Invalid action" });
      }

      const updatedRequest = await storage.updateGuestServiceRequest(parseInt(requestId), {
        status,
        staffNotes: notes,
        processedAt: new Date(),
      });

      // If accepted, create task automatically
      if (status === "accepted" && updatedRequest) {
        await storage.createTaskFromServiceRequest(updatedRequest.id);
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error processing service request action:", error);
      res.status(500).json({ message: "Failed to process service request action" });
    }
  });

  // ===== LOCAL & EMERGENCY CONTACTS ROUTES =====

  // Get property local contacts
  app.get("/api/property-local-contacts/:propertyId", async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { category } = req.query;

      let contacts;
      if (category) {
        contacts = await storage.getPropertyLocalContactsByCategory(parseInt(propertyId), category as string);
      } else {
        contacts = await storage.getPropertyLocalContacts(parseInt(propertyId));
      }

      res.json(contacts);
    } catch (error) {
      console.error("Error fetching property local contacts:", error);
      res.status(500).json({ message: "Failed to fetch property local contacts" });
    }
  });

  // Get single property local contact
  app.get("/api/property-local-contacts/contact/:contactId", async (req, res) => {
    try {
      const { contactId } = req.params;
      const contact = await storage.getPropertyLocalContact(parseInt(contactId));
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      console.error("Error fetching property local contact:", error);
      res.status(500).json({ message: "Failed to fetch property local contact" });
    }
  });

  // Create property local contact (Admin/Manager only)
  app.post("/api/property-local-contacts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const contactData = {
        ...req.body,
        organizationId: req.body.organizationId || "default-org",
        createdBy: req.user.id,
      };

      const contact = await storage.createPropertyLocalContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating property local contact:", error);
      res.status(500).json({ message: "Failed to create property local contact" });
    }
  });

  // Update property local contact (Admin/Manager only)
  app.patch("/api/property-local-contacts/:contactId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { contactId } = req.params;
      const contact = await storage.updatePropertyLocalContact(parseInt(contactId), req.body);
      
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json(contact);
    } catch (error) {
      console.error("Error updating property local contact:", error);
      res.status(500).json({ message: "Failed to update property local contact" });
    }
  });

  // Delete property local contact (Admin/Manager only)
  app.delete("/api/property-local-contacts/:contactId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { contactId } = req.params;
      const success = await storage.deletePropertyLocalContact(parseInt(contactId));
      
      if (!success) {
        return res.status(404).json({ message: "Contact not found" });
      }

      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting property local contact:", error);
      res.status(500).json({ message: "Failed to delete property local contact" });
    }
  });

  // Reorder property local contacts (Admin/Manager only)
  app.post("/api/property-local-contacts/reorder", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { contactIds, displayOrders } = req.body;
      const success = await storage.reorderPropertyLocalContacts(contactIds, displayOrders);
      
      res.json({ success });
    } catch (error) {
      console.error("Error reordering property local contacts:", error);
      res.status(500).json({ message: "Failed to reorder property local contacts" });
    }
  });

  // Contact Template Zone routes (Admin/Manager only)
  app.get("/api/contact-template-zones", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, organizationId } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const templates = await storage.getContactTemplateZones(organizationId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contact template zones:", error);
      res.status(500).json({ message: "Failed to fetch contact template zones" });
    }
  });

  // Apply contact template to property (Admin/Manager only)
  app.post("/api/contact-template-zones/:templateId/apply", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { templateId } = req.params;
      const { propertyId } = req.body;

      const contacts = await storage.applyContactTemplate(propertyId, parseInt(templateId), req.user.id);
      res.json(contacts);
    } catch (error) {
      console.error("Error applying contact template:", error);
      res.status(500).json({ message: "Failed to apply contact template" });
    }
  });

  // Get pending notifications for staff
  app.get("/api/guest-portal/notifications", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;

      if (!["admin", "portfolio-manager", "staff"].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const notifications = await storage.getPendingServiceRequestNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // ===== STAFF SALARY, OVERTIME & INVOICE GENERATOR API ENDPOINTS =====

  // Staff Salary Profile Management
  app.get("/api/staff-salary/profiles", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const profiles = await storage.getStaffSalaryProfiles(organizationId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching staff salary profiles:", error);
      res.status(500).json({ message: "Failed to fetch staff salary profiles" });
    }
  });

  app.get("/api/staff-salary/profiles/:userId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getStaffSalaryProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Staff salary profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching staff salary profile:", error);
      res.status(500).json({ message: "Failed to fetch staff salary profile" });
    }
  });

  app.post("/api/staff-salary/profiles", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const profileData = {
        ...req.body,
        organizationId,
      };

      const profile = await storage.createStaffSalaryProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating staff salary profile:", error);
      res.status(500).json({ message: "Failed to create staff salary profile" });
    }
  });

  app.put("/api/staff-salary/profiles/:userId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { userId } = req.params;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const profile = await storage.updateStaffSalaryProfile(userId, req.body);
      if (!profile) {
        return res.status(404).json({ message: "Staff salary profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating staff salary profile:", error);
      res.status(500).json({ message: "Failed to update staff salary profile" });
    }
  });

  // Staff Commission & Bonus Log
  app.get("/api/staff-salary/commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { targetUserId, month, status } = req.query;

      const filters = {
        userId: role === 'admin' ? targetUserId : userId,
        month: month as string,
        status: status as string,
      };

      const commissions = await storage.getStaffCommissionLog(organizationId, filters);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching staff commission log:", error);
      res.status(500).json({ message: "Failed to fetch staff commission log" });
    }
  });

  app.post("/api/staff-salary/commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const commissionData = {
        ...req.body,
        organizationId,
      };

      const commission = await storage.createStaffCommissionLog(commissionData);
      res.status(201).json(commission);
    } catch (error) {
      console.error("Error creating staff commission log:", error);
      res.status(500).json({ message: "Failed to create staff commission log" });
    }
  });

  app.patch("/api/staff-salary/commissions/:id/status", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;
      const { status } = req.body;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const commission = await storage.updateStaffCommissionStatus(parseInt(id), status, userId);
      if (!commission) {
        return res.status(404).json({ message: "Commission log not found" });
      }
      res.json(commission);
    } catch (error) {
      console.error("Error updating commission status:", error);
      res.status(500).json({ message: "Failed to update commission status" });
    }
  });

  // Emergency Clock-In System
  app.get("/api/staff-salary/time-clocks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { targetUserId, clockType, month } = req.query;

      const filters = {
        userId: role === 'admin' ? targetUserId : userId,
        clockType: clockType as string,
        month: month as string,
      };

      const timeClocks = await storage.getStaffTimeClocks(organizationId, filters);
      res.json(timeClocks);
    } catch (error) {
      console.error("Error fetching staff time clocks:", error);
      res.status(500).json({ message: "Failed to fetch staff time clocks" });
    }
  });

  app.post("/api/staff-salary/time-clocks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;

      const timeClockData = {
        ...req.body,
        organizationId,
        userId,
        clockTime: new Date(),
      };

      const timeClock = await storage.createStaffTimeClock(timeClockData);
      res.status(201).json(timeClock);
    } catch (error) {
      console.error("Error creating staff time clock:", error);
      res.status(500).json({ message: "Failed to create staff time clock" });
    }
  });

  app.patch("/api/staff-salary/time-clocks/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const timeClock = await storage.updateStaffTimeClock(parseInt(id), req.body);
      if (!timeClock) {
        return res.status(404).json({ message: "Time clock not found" });
      }
      res.json(timeClock);
    } catch (error) {
      console.error("Error updating staff time clock:", error);
      res.status(500).json({ message: "Failed to update staff time clock" });
    }
  });

  app.patch("/api/staff-salary/time-clocks/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;
      const { hoursPaid, notes } = req.body;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const timeClock = await storage.approveTimeClock(parseInt(id), userId, parseFloat(hoursPaid), notes);
      if (!timeClock) {
        return res.status(404).json({ message: "Time clock not found" });
      }
      res.json(timeClock);
    } catch (error) {
      console.error("Error approving time clock:", error);
      res.status(500).json({ message: "Failed to approve time clock" });
    }
  });

  // Emergency Callout Summary
  app.get("/api/staff-salary/emergency-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { month } = req.query;
      const summary = await storage.getEmergencyCalloutSummary(organizationId, month as string);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching emergency callout summary:", error);
      res.status(500).json({ message: "Failed to fetch emergency callout summary" });
    }
  });

  app.post("/api/staff-salary/emergency-summary/:userId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { userId } = req.params;
      const { month } = req.body;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const summary = await storage.updateEmergencyCalloutSummary(userId, month);
      res.json(summary);
    } catch (error) {
      console.error("Error updating emergency callout summary:", error);
      res.status(500).json({ message: "Failed to update emergency callout summary" });
    }
  });

  // ===== INVOICE GENERATOR API ENDPOINTS =====

  // Invoice Operations
  app.get("/api/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { fromPartyId, toPartyId, status } = req.query;

      const filters = {
        fromPartyId: role === 'admin' ? fromPartyId : userId,
        toPartyId: toPartyId as string,
        status: status as string,
      };

      const invoices = await storage.getInvoices(organizationId, filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.getInvoice(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;

      const invoiceData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const invoice = await storage.updateInvoice(parseInt(id), req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInvoice(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Invoice Line Items
  app.get("/api/invoices/:invoiceId/line-items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { invoiceId } = req.params;
      const lineItems = await storage.getInvoiceLineItems(parseInt(invoiceId));
      res.json(lineItems);
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      res.status(500).json({ message: "Failed to fetch invoice line items" });
    }
  });

  app.post("/api/invoices/:invoiceId/line-items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { invoiceId } = req.params;

      const lineItemData = {
        ...req.body,
        organizationId,
        invoiceId: parseInt(invoiceId),
      };

      const lineItem = await storage.createInvoiceLineItem(lineItemData);
      res.status(201).json(lineItem);
    } catch (error) {
      console.error("Error creating invoice line item:", error);
      res.status(500).json({ message: "Failed to create invoice line item" });
    }
  });

  app.put("/api/invoices/line-items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const lineItem = await storage.updateInvoiceLineItem(parseInt(id), req.body);
      if (!lineItem) {
        return res.status(404).json({ message: "Invoice line item not found" });
      }
      res.json(lineItem);
    } catch (error) {
      console.error("Error updating invoice line item:", error);
      res.status(500).json({ message: "Failed to update invoice line item" });
    }
  });

  app.delete("/api/invoices/line-items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteInvoiceLineItem(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Invoice line item not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting invoice line item:", error);
      res.status(500).json({ message: "Failed to delete invoice line item" });
    }
  });

  // Invoice Payments
  app.get("/api/invoices/:invoiceId/payments", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { invoiceId } = req.params;
      const payments = await storage.getInvoicePayments(parseInt(invoiceId));
      res.json(payments);
    } catch (error) {
      console.error("Error fetching invoice payments:", error);
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/invoices/:invoiceId/payments", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const { invoiceId } = req.params;

      const paymentData = {
        ...req.body,
        organizationId,
        invoiceId: parseInt(invoiceId),
        recordedBy: userId,
      };

      const payment = await storage.createInvoicePayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating invoice payment:", error);
      res.status(500).json({ message: "Failed to create invoice payment" });
    }
  });

  // Salary Analytics
  app.get("/api/staff-salary/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { month } = req.query;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getSalaryAnalytics(organizationId, month as string);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching salary analytics:", error);
      res.status(500).json({ message: "Failed to fetch salary analytics" });
    }
  });

  app.post("/api/staff-salary/analytics/:month", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { month } = req.params;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.updateSalaryAnalytics(organizationId, month);
      res.json(analytics);
    } catch (error) {
      console.error("Error updating salary analytics:", error);
      res.status(500).json({ message: "Failed to update salary analytics" });
    }
  });

  // ===== PORTFOLIO MANAGER COMMISSION ACCESS =====

  // PM Commission Overview (PM Access)
  app.get("/api/pm/commission-overview", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { agentType, startDate, endDate, status } = req.query;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin or PM role required." });
      }

      const commissions = await storage.getCommissionLog(organizationId, {
        agentType: agentType as 'retail-agent' | 'referral-agent',
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
      });

      res.json(commissions);
    } catch (error) {
      console.error("Error fetching PM commission overview:", error);
      res.status(500).json({ message: "Failed to fetch commission overview" });
    }
  });

  // ===== GUEST ADD-ON SERVICE API =====

  // Get active guest add-on services for booking
  app.get("/api/guest/addon-services", async (req: any, res) => {
    try {
      const organizationId = req.query.organizationId || "default-org";
      const services = await storage.getActiveGuestAddonServices(organizationId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching guest addon services:", error);
      res.status(500).json({ message: "Failed to fetch guest addon services" });
    }
  });

  // Create a new guest addon booking (public endpoint)
  app.post("/api/guest/addon-bookings", async (req: any, res) => {
    try {
      const {
        serviceId,
        propertyId,
        guestName,
        guestEmail,
        guestPhone,
        serviceDate,
        specialRequests,
        quantity,
        totalAmount,
        currency = "USD",
        organizationId = "default-org"
      } = req.body;

      const booking = await storage.createGuestAddonBooking({
        serviceId,
        propertyId,
        guestName,
        guestEmail,
        guestPhone,
        bookingDate: new Date(),
        serviceDate: new Date(serviceDate),
        specialRequests: specialRequests || "",
        totalAmount: totalAmount.toString(),
        currency,
        status: "pending",
        billingRoute: "guest_billable",
        bookedBy: "guest",
        organizationId
      });

      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating guest addon booking:", error);
      res.status(500).json({ message: "Failed to create guest addon booking" });
    }
  });

  // ===== ADMIN ADD-ON BOOKING MANAGEMENT API =====

  // Get all guest addon bookings (Admin/PM access)
  app.get("/api/admin/addon-bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin or PM role required." });
      }

      const bookings = await storage.getGuestAddonBookings(organizationId);
      
      // Map the booking data to match the frontend interface
      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        serviceName: booking.serviceName,
        propertyName: booking.propertyName,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        bookingDate: booking.createdAt?.toISOString() || new Date().toISOString(),
        serviceDate: booking.serviceDate.toISOString(),
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        billingRoute: booking.billingRoute,
        complimentaryType: booking.complimentaryType,
        specialRequests: booking.specialRequests,
        internalNotes: booking.internalNotes,
        bookedBy: booking.bookedBy,
        confirmedBy: booking.confirmedBy,
        cancelledBy: booking.cancelledBy,
        cancellationReason: booking.cancellationReason
      }));

      res.json(formattedBookings);
    } catch (error) {
      console.error("Error fetching admin addon bookings:", error);
      res.status(500).json({ message: "Failed to fetch admin addon bookings" });
    }
  });

  // Update guest addon booking (Admin/PM access)
  app.put("/api/admin/addon-bookings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;
      const updateData = req.body;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin or PM role required." });
      }

      // Add tracking fields based on status change
      if (updateData.status === "confirmed") {
        updateData.confirmedBy = userId;
      } else if (updateData.status === "cancelled") {
        updateData.cancelledBy = userId;
      }

      const updatedBooking = await storage.updateGuestAddonBooking(
        parseInt(id),
        organizationId,
        updateData
      );

      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating addon booking:", error);
      res.status(500).json({ message: "Failed to update addon booking" });
    }
  });

  // Export guest addon bookings as CSV (Admin access)
  app.get("/api/admin/addon-bookings/export", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin or PM role required." });
      }

      const bookings = await storage.getGuestAddonBookings(organizationId);

      const csv = [
        'ID,Service,Property,Guest Name,Guest Email,Guest Phone,Service Date,Amount,Currency,Status,Billing Route,Special Requests,Booked Date',
        ...bookings.map(b => 
          `${b.id},"${b.serviceName}","${b.propertyName}","${b.guestName}","${b.guestEmail || ''}","${b.guestPhone || ''}","${b.serviceDate.toISOString().split('T')[0]}","${b.totalAmount}","${b.currency}","${b.status}","${b.billingRoute}","${b.specialRequests || ''}","${b.createdAt?.toISOString().split('T')[0] || ''}"`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="addon-bookings-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting addon bookings:", error);
      res.status(500).json({ message: "Failed to export addon bookings" });
    }
  });

  // ===== ADMIN ADD-ON SERVICE SETTINGS API =====

  // Get all guest addon services (Admin access)
  app.get("/api/admin/addon-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin or PM role required." });
      }

      const services = await storage.getGuestAddonServices(organizationId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching admin addon services:", error);
      res.status(500).json({ message: "Failed to fetch admin addon services" });
    }
  });

  // Create new guest addon service (Admin access)
  app.post("/api/admin/addon-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Check role permissions
      if (role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const serviceData = {
        ...req.body,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const service = await storage.createGuestAddonService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating addon service:", error);
      res.status(500).json({ message: "Failed to create addon service" });
    }
  });

  // Update guest addon service (Admin access)
  app.put("/api/admin/addon-services/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { id } = req.params;

      // Check role permissions
      if (role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const updatedService = await storage.updateGuestAddonService(
        parseInt(id),
        organizationId,
        req.body
      );

      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(updatedService);
    } catch (error) {
      console.error("Error updating addon service:", error);
      res.status(500).json({ message: "Failed to update addon service" });
    }
  });

  // ===== LOYALTY & REPEAT GUEST TRACKER + SMART MESSAGING SYSTEM API =====

  // Get guest loyalty profiles (Admin/PM access)
  app.get("/api/loyalty/guests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const profiles = await storage.getAllGuestLoyaltyProfiles(organizationId);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching guest loyalty profiles:", error);
      res.status(500).json({ message: "Failed to fetch guest loyalty profiles" });
    }
  });

  // Get repeat guests only
  app.get("/api/loyalty/repeat-guests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const repeatGuests = await storage.getRepeatGuests(organizationId);
      res.json(repeatGuests);
    } catch (error) {
      console.error("Error fetching repeat guests:", error);
      res.status(500).json({ message: "Failed to fetch repeat guests" });
    }
  });

  // Get loyalty tiers
  app.get("/api/loyalty/tiers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const tiers = await storage.getLoyaltyTiers(organizationId);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching loyalty tiers:", error);
      res.status(500).json({ message: "Failed to fetch loyalty tiers" });
    }
  });

  // Create loyalty tier (Admin only)
  app.post("/api/loyalty/tiers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const { tierName, minStays, tierColor, benefits, perks } = req.body;

      const tierData = {
        organizationId,
        tierName,
        minStays,
        tierColor: tierColor || "#6B7280",
        benefits: benefits || [],
        perks: perks || {},
        isActive: true,
      };

      const tier = await storage.createLoyaltyTier(tierData);
      res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating loyalty tier:", error);
      res.status(500).json({ message: "Failed to create loyalty tier" });
    }
  });

  // Check if guest is repeat guest
  app.post("/api/loyalty/check-repeat-guest", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { guestEmail, guestName, guestPhone } = req.body;

      const result = await storage.identifyRepeatGuest(organizationId, guestEmail, guestName, guestPhone);
      res.json(result);
    } catch (error) {
      console.error("Error checking repeat guest:", error);
      res.status(500).json({ message: "Failed to check repeat guest status" });
    }
  });

  // Update guest loyalty on new booking
  app.post("/api/loyalty/update-on-booking", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { 
        guestEmail, 
        guestName, 
        guestPhone, 
        propertyId, 
        bookingAmount, 
        checkInDate, 
        checkOutDate 
      } = req.body;

      const profile = await storage.updateGuestLoyaltyOnBooking(
        organizationId,
        guestEmail,
        guestName,
        guestPhone,
        propertyId,
        parseFloat(bookingAmount),
        new Date(checkInDate),
        new Date(checkOutDate)
      );

      res.json(profile);
    } catch (error) {
      console.error("Error updating guest loyalty on booking:", error);
      res.status(500).json({ message: "Failed to update guest loyalty" });
    }
  });

  // ===== GUEST MESSAGING SYSTEM API =====

  // Get guest messages
  app.get("/api/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { threadId } = req.query;

      const messages = await storage.getGuestMessages(organizationId, threadId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching guest messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Create new message
  app.post("/api/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { 
        threadId, 
        guestLoyaltyId, 
        bookingId, 
        propertyId, 
        messageContent, 
        messageType, 
        attachments, 
        urgencyLevel 
      } = req.body;

      const messageData = {
        organizationId,
        threadId,
        guestLoyaltyId,
        bookingId,
        propertyId,
        senderId: userId,
        senderType: role,
        senderName: req.user.firstName + " " + req.user.lastName,
        messageContent,
        messageType: messageType || "text",
        attachments: attachments || [],
        isAutomated: false,
        urgencyLevel: urgencyLevel || "normal",
        isRead: false,
      };

      const message = await storage.createGuestMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Mark message as read
  app.patch("/api/messages/:messageId/read", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: userId } = req.user;
      const { messageId } = req.params;

      await storage.markMessageAsRead(parseInt(messageId), userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Get unread messages count
  app.get("/api/messages/unread-count", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const count = await storage.getUnreadMessagesCount(organizationId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // ===== SMART REPLY SUGGESTIONS API =====

  // Get smart reply suggestions
  app.get("/api/smart-replies", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { category } = req.query;

      const suggestions = await storage.getSmartReplySuggestions(organizationId, category);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching smart reply suggestions:", error);
      res.status(500).json({ message: "Failed to fetch smart replies" });
    }
  });

  // Create smart reply suggestion (Admin/PM)
  app.post("/api/smart-replies", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { category, trigger, messageTemplate, userRole } = req.body;

      const suggestionData = {
        organizationId,
        category,
        trigger,
        messageTemplate,
        userRole: userRole || "all",
        createdBy: userId,
      };

      const suggestion = await storage.createSmartReplySuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      console.error("Error creating smart reply suggestion:", error);
      res.status(500).json({ message: "Failed to create smart reply" });
    }
  });

  // Use smart reply suggestion (increment usage)
  app.post("/api/smart-replies/:suggestionId/use", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { suggestionId } = req.params;
      await storage.incrementSmartReplyUsage(parseInt(suggestionId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing smart reply usage:", error);
      res.status(500).json({ message: "Failed to update usage" });
    }
  });

  // ===== MESSAGING TRIGGERS API =====

  // Get messaging triggers
  app.get("/api/messaging-triggers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const triggers = await storage.getMessagingTriggers(organizationId);
      res.json(triggers);
    } catch (error) {
      console.error("Error fetching messaging triggers:", error);
      res.status(500).json({ message: "Failed to fetch messaging triggers" });
    }
  });

  // Create messaging trigger (Admin only)
  app.post("/api/messaging-triggers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin'].includes(role)) {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const {
        triggerName,
        triggerType,
        triggerCondition,
        delayMinutes,
        messageTemplate,
        loyaltyTierTargets,
        propertyTargets
      } = req.body;

      const triggerData = {
        organizationId,
        triggerName,
        triggerType,
        triggerCondition,
        delayMinutes: delayMinutes || 0,
        messageTemplate,
        isActive: true,
        loyaltyTierTargets: loyaltyTierTargets || [],
        propertyTargets: propertyTargets || [],
        triggerCount: 0,
      };

      const trigger = await storage.createMessagingTrigger(triggerData);
      res.status(201).json(trigger);
    } catch (error) {
      console.error("Error creating messaging trigger:", error);
      res.status(500).json({ message: "Failed to create messaging trigger" });
    }
  });

  // ===== COMPREHENSIVE PAYROLL, COMMISSION & INVOICE MANAGEMENT API =====

  // ===== STAFF PAYROLL MANAGEMENT ROUTES =====

  // Get staff payroll records
  app.get("/api/payroll/staff", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { staffId, year, month, paymentStatus } = req.query;

      // Admin can see all, staff can only see their own
      const targetStaffId = role === 'admin' ? staffId : userId;
      
      const records = await storage.getStaffPayrollRecords(organizationId, {
        staffId: targetStaffId,
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        paymentStatus,
      });

      res.json(records);
    } catch (error) {
      console.error("Error fetching staff payroll records:", error);
      res.status(500).json({ message: "Failed to fetch payroll records" });
    }
  });

  // Create staff payroll record (admin only)
  app.post("/api/payroll/staff", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const payrollData = {
        ...req.body,
        organizationId,
        processedBy: userId,
      };

      const record = await storage.createStaffPayrollRecord(payrollData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating staff payroll record:", error);
      res.status(500).json({ message: "Failed to create payroll record" });
    }
  });

  // Mark payroll as paid (admin only)
  app.patch("/api/payroll/staff/:id/mark-paid", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { paymentMethod, paymentReference, paymentSlipUrl, notes } = req.body;
      
      const record = await storage.markPayrollAsPaid(parseInt(id), userId, {
        paymentMethod,
        paymentReference,
        paymentSlipUrl,
        notes,
      });

      res.json(record);
    } catch (error) {
      console.error("Error marking payroll as paid:", error);
      res.status(500).json({ message: "Failed to mark payroll as paid" });
    }
  });

  // Get staff payroll summary
  app.get("/api/payroll/staff/:staffId/summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { staffId } = req.params;
      const { year } = req.query;

      // Admin can see any staff, staff can only see their own
      if (role !== 'admin' && staffId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const summary = await storage.getStaffPayrollSummary(
        organizationId, 
        staffId, 
        year ? parseInt(year) : undefined
      );

      res.json(summary);
    } catch (error) {
      console.error("Error fetching staff payroll summary:", error);
      res.status(500).json({ message: "Failed to fetch payroll summary" });
    }
  });

  // ===== PORTFOLIO MANAGER COMMISSION ROUTES =====

  // Get portfolio manager commissions
  app.get("/api/commissions/portfolio-manager", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { managerId, year, month, payoutStatus } = req.query;

      // Admin can see all, PM can only see their own
      const targetManagerId = (role === 'admin') ? managerId : (role === 'portfolio-manager' ? userId : undefined);
      
      if (!targetManagerId && role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const commissions = await storage.getPortfolioManagerCommissions(organizationId, targetManagerId, {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        payoutStatus,
      });

      res.json(commissions);
    } catch (error) {
      console.error("Error fetching portfolio manager commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Create portfolio manager commission
  app.post("/api/commissions/portfolio-manager", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const commissionData = {
        ...req.body,
        organizationId,
        processedBy: userId,
      };

      const commission = await storage.createPortfolioManagerCommission(commissionData);
      res.status(201).json(commission);
    } catch (error) {
      console.error("Error creating portfolio manager commission:", error);
      res.status(500).json({ message: "Failed to create commission" });
    }
  });

  // Request portfolio manager payout
  app.patch("/api/commissions/portfolio-manager/:id/request-payout", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;

      if (role !== 'portfolio-manager' && role !== 'admin') {
        return res.status(403).json({ message: "Portfolio Manager or Admin access required" });
      }

      const commission = await storage.requestPortfolioManagerPayout(parseInt(id));
      res.json(commission);
    } catch (error) {
      console.error("Error requesting portfolio manager payout:", error);
      res.status(500).json({ message: "Failed to request payout" });
    }
  });

  // Approve portfolio manager payout (admin only)
  app.patch("/api/commissions/portfolio-manager/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;
      const { notes } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const commission = await storage.approvePortfolioManagerPayout(parseInt(id), userId, notes);
      res.json(commission);
    } catch (error) {
      console.error("Error approving portfolio manager payout:", error);
      res.status(500).json({ message: "Failed to approve payout" });
    }
  });

  // Generate portfolio manager invoice
  app.post("/api/commissions/portfolio-manager/:id/generate-invoice", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;

      if (role !== 'portfolio-manager' && role !== 'admin') {
        return res.status(403).json({ message: "Portfolio Manager or Admin access required" });
      }

      // Generate invoice number
      const invoiceNumber = await storage.generateInvoiceNumber(organizationId, 'commission');
      
      // In a real implementation, you would generate the PDF here
      const invoicePdfUrl = `/api/invoices/${invoiceNumber}.pdf`;

      const commission = await storage.generatePortfolioManagerInvoice(parseInt(id), invoiceNumber, invoicePdfUrl);
      res.json(commission);
    } catch (error) {
      console.error("Error generating portfolio manager invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // ===== REFERRAL AGENT COMMISSION ROUTES =====

  // Get referral agent commission logs
  app.get("/api/commissions/referral-agent", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { agentId, year, month, propertyId, paymentStatus } = req.query;

      // Admin can see all, referral agent can only see their own
      const targetAgentId = (role === 'admin') ? agentId : (role === 'referral-agent' ? userId : undefined);
      
      if (!targetAgentId && role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const logs = await storage.getReferralAgentCommissionLogs(organizationId, targetAgentId, {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        paymentStatus,
      });

      res.json(logs);
    } catch (error) {
      console.error("Error fetching referral agent commission logs:", error);
      res.status(500).json({ message: "Failed to fetch commission logs" });
    }
  });

  // Create referral agent commission log
  app.post("/api/commissions/referral-agent", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const logData = {
        ...req.body,
        organizationId,
        processedBy: userId,
      };

      const log = await storage.createReferralAgentCommissionLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating referral agent commission log:", error);
      res.status(500).json({ message: "Failed to create commission log" });
    }
  });

  // Request referral agent payment
  app.patch("/api/commissions/referral-agent/:id/request-payment", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;

      if (role !== 'referral-agent' && role !== 'admin') {
        return res.status(403).json({ message: "Referral Agent or Admin access required" });
      }

      const log = await storage.requestReferralAgentPayment(parseInt(id));
      res.json(log);
    } catch (error) {
      console.error("Error requesting referral agent payment:", error);
      res.status(500).json({ message: "Failed to request payment" });
    }
  });

  // Confirm referral agent payment (admin only)
  app.patch("/api/commissions/referral-agent/:id/confirm-payment", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;
      const { paymentSlipUrl, notes } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const log = await storage.confirmReferralAgentPayment(parseInt(id), userId, paymentSlipUrl, notes);
      res.json(log);
    } catch (error) {
      console.error("Error confirming referral agent payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // ===== UNIVERSAL INVOICE GENERATOR ROUTES =====

  // Get universal invoices
  app.get("/api/invoices/universal", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { createdBy, invoiceType, status, fromDate, toDate } = req.query;

      // Admin can see all, others can only see their own
      const targetCreatedBy = (role === 'admin') ? createdBy : userId;

      const invoices = await storage.getUniversalInvoices(organizationId, {
        createdBy: targetCreatedBy,
        invoiceType,
        status,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });

      res.json(invoices);
    } catch (error) {
      console.error("Error fetching universal invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Create universal invoice
  app.post("/api/invoices/universal", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      // Generate invoice number
      const invoiceNumber = await storage.generateInvoiceNumber(organizationId, req.body.invoiceType || 'custom');
      
      const invoiceData = {
        ...req.body,
        organizationId,
        createdBy: userId,
        invoiceNumber,
      };

      const invoice = await storage.createUniversalInvoice(invoiceData);

      // Add line items if provided
      if (req.body.lineItems && req.body.lineItems.length > 0) {
        const lineItemsData = req.body.lineItems.map((item: any) => ({
          ...item,
          organizationId,
          invoiceId: invoice.id,
        }));
        
        const lineItems = await storage.addInvoiceLineItems(lineItemsData);
        res.status(201).json({ ...invoice, lineItems });
      } else {
        res.status(201).json({ ...invoice, lineItems: [] });
      }
    } catch (error) {
      console.error("Error creating universal invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Update universal invoice
  app.patch("/api/invoices/universal/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;

      // Check ownership or admin
      const existingInvoices = await storage.getUniversalInvoices(organizationId, { createdBy: userId });
      const canEdit = role === 'admin' || existingInvoices.some(inv => inv.id === parseInt(id));

      if (!canEdit) {
        return res.status(403).json({ message: "Access denied" });
      }

      const invoice = await storage.updateUniversalInvoice(parseInt(id), req.body);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating universal invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  // Generate invoice number
  app.get("/api/invoices/generate-number", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { type } = req.query;

      const invoiceNumber = await storage.generateInvoiceNumber(organizationId, type || 'custom');
      res.json({ invoiceNumber });
    } catch (error) {
      console.error("Error generating invoice number:", error);
      res.status(500).json({ message: "Failed to generate invoice number" });
    }
  });

  // ===== PAYMENT CONFIRMATIONS ROUTES =====

  // Create payment confirmation
  app.post("/api/payments/confirmations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;

      const confirmationData = {
        ...req.body,
        organizationId,
        uploadedBy: userId,
      };

      const confirmation = await storage.createPaymentConfirmation(confirmationData);
      res.status(201).json(confirmation);
    } catch (error) {
      console.error("Error creating payment confirmation:", error);
      res.status(500).json({ message: "Failed to create payment confirmation" });
    }
  });

  // Get payment confirmations
  app.get("/api/payments/confirmations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { paymentType, referenceEntityType, referenceEntityId, confirmationStatus } = req.query;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const confirmations = await storage.getPaymentConfirmations(organizationId, {
        paymentType,
        referenceEntityType,
        referenceEntityId: referenceEntityId ? parseInt(referenceEntityId) : undefined,
        confirmationStatus,
      });

      res.json(confirmations);
    } catch (error) {
      console.error("Error fetching payment confirmations:", error);
      res.status(500).json({ message: "Failed to fetch payment confirmations" });
    }
  });

  // Confirm payment (admin only)
  app.patch("/api/payments/confirmations/:id/confirm", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const confirmation = await storage.confirmPayment(parseInt(id), userId);
      res.json(confirmation);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // ===== FINANCIAL ANALYTICS ROUTES =====

  // Get staff salary analytics (admin only)
  app.get("/api/analytics/staff-salaries", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getStaffSalaryAnalytics(organizationId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching staff salary analytics:", error);
      res.status(500).json({ message: "Failed to fetch salary analytics" });
    }
  });

  // Get commission analytics (admin only)
  app.get("/api/analytics/commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const analytics = await storage.getCommissionAnalytics(organizationId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching commission analytics:", error);
      res.status(500).json({ message: "Failed to fetch commission analytics" });
    }
  });

  // ===== LIVE BOOKING CALENDAR & AGENT SYSTEM API =====

  // Get booking calendar data
  app.get("/api/booking-calendar", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId, startDate, endDate, bookingStatus, bookingSource } = req.query;

      // Check access permissions
      if (!['admin', 'portfolio-manager', 'owner', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getBookingCalendar(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        bookingStatus: bookingStatus as string,
        bookingSource: bookingSource as string,
      });

      res.json(bookings);
    } catch (error) {
      console.error("Error fetching booking calendar:", error);
      res.status(500).json({ message: "Failed to fetch booking calendar" });
    }
  });

  // Create new booking entry
  app.post("/api/booking-calendar", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookingData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const booking = await storage.createBookingEntry(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get upcoming bookings for property
  app.get("/api/properties/:propertyId/upcoming-bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId } = req.params;
      const { days = 30 } = req.query;

      if (!['admin', 'portfolio-manager', 'owner', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bookings = await storage.getUpcomingBookings(organizationId, parseInt(propertyId), parseInt(days as string));
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching upcoming bookings:", error);
      res.status(500).json({ message: "Failed to fetch upcoming bookings" });
    }
  });

  // Get booking analytics
  app.get("/api/booking-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId } = req.query;

      if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getBookingAnalytics(organizationId, propertyId ? parseInt(propertyId as string) : undefined);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching booking analytics:", error);
      res.status(500).json({ message: "Failed to fetch booking analytics" });
    }
  });

  // ===== PROPERTY AVAILABILITY API =====

  // Get property availability
  app.get("/api/property-availability", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, startDate, endDate, availabilityType } = req.query;

      const availability = await storage.getPropertyAvailability(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        availabilityType: availabilityType as string,
      });

      res.json(availability);
    } catch (error) {
      console.error("Error fetching property availability:", error);
      res.status(500).json({ message: "Failed to fetch property availability" });
    }
  });

  // Create availability entry (block dates, maintenance, etc.)
  app.post("/api/property-availability", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const availabilityData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const availability = await storage.createPropertyAvailability(availabilityData);
      res.json(availability);
    } catch (error) {
      console.error("Error creating availability entry:", error);
      res.status(500).json({ message: "Failed to create availability entry" });
    }
  });

  // Check property availability for specific dates
  app.get("/api/properties/:propertyId/check-availability", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const { checkIn, checkOut } = req.query;

      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Check-in and check-out dates are required" });
      }

      const isAvailable = await storage.checkPropertyAvailability(parseInt(propertyId), checkIn as string, checkOut as string);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking property availability:", error);
      res.status(500).json({ message: "Failed to check property availability" });
    }
  });

  // ===== AGENT SEARCH SYSTEM API =====

  // Search properties for agents (retail agents access)
  app.get("/api/agent/search-properties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (role !== 'retail-agent') {
        return res.status(403).json({ message: "Retail agent access required" });
      }

      const {
        location, zone, minBedrooms, maxBedrooms, minPrice, maxPrice,
        amenities, checkIn, checkOut, maxGuests
      } = req.query;

      const filters = {
        location: location as string,
        zone: zone as string,
        minBedrooms: minBedrooms ? parseInt(minBedrooms as string) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms as string) : undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        amenities: amenities ? JSON.parse(amenities as string) : undefined,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        maxGuests: maxGuests ? parseInt(maxGuests as string) : undefined,
      };

      const properties = await storage.searchPropertiesForAgents(organizationId, filters);
      res.json(properties);
    } catch (error) {
      console.error("Error searching properties for agents:", error);
      res.status(500).json({ message: "Failed to search properties" });
    }
  });

  // Get/update agent search preferences
  app.get("/api/agent/search-preferences", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: agentId } = req.user;

      if (role !== 'retail-agent') {
        return res.status(403).json({ message: "Retail agent access required" });
      }

      const preferences = await storage.getAgentSearchPreferences(organizationId, agentId);
      res.json(preferences || {});
    } catch (error) {
      console.error("Error fetching agent preferences:", error);
      res.status(500).json({ message: "Failed to fetch agent preferences" });
    }
  });

  app.put("/api/agent/search-preferences", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: agentId } = req.user;

      if (role !== 'retail-agent') {
        return res.status(403).json({ message: "Retail agent access required" });
      }

      const preferences = await storage.updateAgentSearchPreferences(organizationId, agentId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating agent preferences:", error);
      res.status(500).json({ message: "Failed to update agent preferences" });
    }
  });

  // ===== AGENT BOOKING ENQUIRIES API =====

  // Create booking enquiry
  app.post("/api/agent/booking-enquiry", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: agentId } = req.user;

      if (role !== 'retail-agent') {
        return res.status(403).json({ message: "Retail agent access required" });
      }

      // Generate enquiry reference
      const enquiryReference = `ENQ-${Date.now()}-${agentId.slice(-4).toUpperCase()}`;

      const enquiryData = {
        ...req.body,
        organizationId,
        agentId,
        enquiryReference,
        commissionRate: "10.00", // Standard 10% commission
      };

      // Calculate commission
      if (enquiryData.quotedPrice) {
        enquiryData.calculatedCommission = (parseFloat(enquiryData.quotedPrice) * 0.10).toString();
      }

      const enquiry = await storage.createBookingEnquiry(enquiryData);
      res.json(enquiry);
    } catch (error) {
      console.error("Error creating booking enquiry:", error);
      res.status(500).json({ message: "Failed to create booking enquiry" });
    }
  });

  // Get agent's booking enquiries
  app.get("/api/agent/booking-enquiries", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: agentId } = req.user;

      if (role !== 'retail-agent') {
        return res.status(403).json({ message: "Retail agent access required" });
      }

      const { status, propertyId } = req.query;

      const enquiries = await storage.getAgentBookingEnquiries(organizationId, {
        agentId,
        enquiryStatus: status as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
      });

      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching booking enquiries:", error);
      res.status(500).json({ message: "Failed to fetch booking enquiries" });
    }
  });

  // Get all booking enquiries (admin/PM access)
  app.get("/api/booking-enquiries", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { agentId, propertyId, status } = req.query;

      const enquiries = await storage.getAgentBookingEnquiries(organizationId, {
        agentId: agentId as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        enquiryStatus: status as string,
      });

      res.json(enquiries);
    } catch (error) {
      console.error("Error fetching booking enquiries:", error);
      res.status(500).json({ message: "Failed to fetch booking enquiries" });
    }
  });

  // Update enquiry status (admin/PM access)
  app.put("/api/booking-enquiries/:id/status", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;
      const { status } = req.body;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const enquiry = await storage.updateEnquiryStatus(parseInt(id), status, userId);
      res.json(enquiry);
    } catch (error) {
      console.error("Error updating enquiry status:", error);
      res.status(500).json({ message: "Failed to update enquiry status" });
    }
  });

  // Convert enquiry to booking (admin/PM access)
  app.post("/api/booking-enquiries/:id/convert", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const bookingData = {
        ...req.body,
        organizationId,
        createdBy: userId,
        agentCommissionApplicable: true,
        retailAgentId: req.body.retailAgentId,
        agentCommissionAmount: req.body.calculatedCommission,
      };

      const result = await storage.convertEnquiryToBooking(parseInt(id), bookingData);
      res.json(result);
    } catch (error) {
      console.error("Error converting enquiry to booking:", error);
      res.status(500).json({ message: "Failed to convert enquiry to booking" });
    }
  });

  // ===== STAFF CLOCK ENTRIES API (GPS TRACKING) =====

  // Get staff clock entries with filtering
  app.get("/api/staff-clock-entries", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { staffId, workDate, status, propertyId, taskId } = req.query;

      // Staff can only view their own entries, admin/PM can view all
      const filterStaffId = role === 'staff' ? userId : staffId;

      const entries = await storage.getStaffClockEntries(organizationId, {
        staffId: filterStaffId,
        workDate,
        status,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        taskId: taskId ? parseInt(taskId) : undefined,
      });

      res.json(entries);
    } catch (error) {
      console.error("Error fetching staff clock entries:", error);
      res.status(500).json({ message: "Failed to fetch clock entries" });
    }
  });

  // Get active clock entry for current staff member
  app.get("/api/staff-clock-entries/active", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: staffId } = req.user;

      const activeEntry = await storage.getActiveStaffClockEntry(organizationId, staffId);
      res.json(activeEntry || null);
    } catch (error) {
      console.error("Error fetching active clock entry:", error);
      res.status(500).json({ message: "Failed to fetch active clock entry" });
    }
  });

  // Get today's clock entries for current staff member
  app.get("/api/staff-clock-entries/today", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: staffId } = req.user;

      const todayEntries = await storage.getTodayClockEntries(organizationId, staffId);
      res.json(todayEntries);
    } catch (error) {
      console.error("Error fetching today's clock entries:", error);
      res.status(500).json({ message: "Failed to fetch today's entries" });
    }
  });

  // Clock in (create new clock entry)
  app.post("/api/staff-clock-entries/clock-in", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: staffId } = req.user;
      const { taskDescription, propertyId, taskId, gpsLocation, locationAccuracy } = req.body;

      // Check if staff is already clocked in
      const activeEntry = await storage.getActiveStaffClockEntry(organizationId, staffId);
      if (activeEntry) {
        return res.status(400).json({ 
          message: "You are already clocked in. Please clock out first.",
          activeEntry 
        });
      }

      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      const today = new Date().toISOString().split('T')[0];

      const clockEntry = await storage.createStaffClockEntry({
        organizationId,
        staffId,
        taskId: taskId || null,
        propertyId: propertyId || null,
        taskDescription,
        clockInTime: currentTime,
        workDate: today,
        gpsLocationIn: gpsLocation,
        locationAccuracy: locationAccuracy ? parseFloat(locationAccuracy) : null,
        status: 'active',
      });

      res.json({ 
        message: "Successfully clocked in",
        entry: clockEntry 
      });
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  // Clock out (update existing clock entry)
  app.post("/api/staff-clock-entries/clock-out", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: staffId } = req.user;
      const { gpsLocation, photoEvidence } = req.body;

      // Get active clock entry
      const activeEntry = await storage.getActiveStaffClockEntry(organizationId, staffId);
      if (!activeEntry) {
        return res.status(400).json({ 
          message: "No active clock entry found. Please clock in first." 
        });
      }

      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      // Calculate work hours
      const clockInTime = activeEntry.clockInTime;
      const [inHours, inMinutes] = clockInTime.split(':').map(Number);
      const [outHours, outMinutes] = currentTime.split(':').map(Number);
      
      const clockInMinutes = inHours * 60 + inMinutes;
      const clockOutMinutes = outHours * 60 + outMinutes;
      const totalMinutes = clockOutMinutes - clockInMinutes;
      const totalHours = totalMinutes / 60;

      // Check for overtime (standard hours: 8:00-18:00, overtime after 20:00)
      const standardEndTime = 18 * 60; // 18:00 in minutes
      const overtimeStartTime = 20 * 60; // 20:00 in minutes
      
      let overtimeHours = 0;
      if (clockOutMinutes > overtimeStartTime) {
        overtimeHours = (clockOutMinutes - overtimeStartTime) / 60;
      }

      const updatedEntry = await storage.clockOutStaffEntry(
        activeEntry.id,
        currentTime,
        gpsLocation,
        photoEvidence,
        totalHours,
        overtimeHours
      );

      res.json({ 
        message: "Successfully clocked out",
        entry: updatedEntry,
        totalHours: totalHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
      });
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Approve overtime for clock entry (admin/PM only)
  app.post("/api/staff-clock-entries/:entryId/approve-overtime", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: approvedBy } = req.user;
      const { entryId } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const approvedEntry = await storage.approveOvertimeClockEntry(
        parseInt(entryId),
        approvedBy
      );

      if (!approvedEntry) {
        return res.status(404).json({ message: "Clock entry not found" });
      }

      res.json({ 
        message: "Overtime approved successfully",
        entry: approvedEntry 
      });
    } catch (error) {
      console.error("Error approving overtime:", error);
      res.status(500).json({ message: "Failed to approve overtime" });
    }
  });

  // Get specific clock entry details
  app.get("/api/staff-clock-entries/:entryId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { entryId } = req.params;

      const entry = await storage.getStaffClockEntry(parseInt(entryId));
      
      if (!entry) {
        return res.status(404).json({ message: "Clock entry not found" });
      }

      // Staff can only view their own entries, admin/PM can view all
      if (role === 'staff' && entry.staffId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error fetching clock entry:", error);
      res.status(500).json({ message: "Failed to fetch clock entry" });
    }
  });

  // ===== AUTOMATED INVOICE CREATOR TOOL API =====

  // Invoice Templates Management
  app.get("/api/invoice-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const { templateType, isActive } = req.query;
      const filters: any = {};
      if (templateType) filters.templateType = templateType;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const templates = await storage.getInvoiceTemplates(organizationId, filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching invoice templates:", error);
      res.status(500).json({ message: "Failed to fetch invoice templates" });
    }
  });

  app.post("/api/invoice-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: createdBy } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const templateData = {
        ...req.body,
        organizationId,
      };

      const template = await storage.createInvoiceTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating invoice template:", error);
      res.status(500).json({ message: "Failed to create invoice template" });
    }
  });

  app.put("/api/invoice-templates/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const template = await storage.updateInvoiceTemplate(parseInt(id), req.body);
      if (!template) {
        return res.status(404).json({ message: "Invoice template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error updating invoice template:", error);
      res.status(500).json({ message: "Failed to update invoice template" });
    }
  });

  // Generated Invoices Management
  app.get("/api/generated-invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { status, paymentStatus, senderType, receiverType, startDate, endDate } = req.query;
      const filters: any = {};
      if (status) filters.status = status;
      if (paymentStatus) filters.paymentStatus = paymentStatus;
      if (senderType) filters.senderType = senderType;
      if (receiverType) filters.receiverType = receiverType;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const invoices = await storage.getGeneratedInvoices(organizationId, filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching generated invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/generated-invoices/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const invoice = await storage.getGeneratedInvoiceById(parseInt(id));
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Get line items and related data
      const lineItems = await storage.getInvoiceLineItems(invoice.id);
      const bookingLinks = await storage.getInvoiceBookingLinks(invoice.id);
      const serviceLinks = await storage.getInvoiceServiceLinks(invoice.id);

      res.json({
        ...invoice,
        lineItems,
        bookingLinks,
        serviceLinks,
      });
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      res.status(500).json({ message: "Failed to fetch invoice details" });
    }
  });

  // Generate Invoice API
  app.post("/api/generate-invoice", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: createdBy } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const {
        templateId,
        senderType,
        receiverType,
        senderId,
        receiverId,
        senderName,
        receiverName,
        senderEmail,
        receiverEmail,
        periodStart,
        periodEnd,
        propertyIds,
        includeBookings,
        includeAddons,
        includeCommissions,
        taxEnabled,
        taxRate,
        notes,
        dueDate,
      } = req.body;

      // Generate invoice number
      const invoiceNumber = await storage.generateInvoiceNumber(organizationId);
      const today = new Date().toISOString().split('T')[0];

      // Create base invoice
      const invoiceData = {
        organizationId,
        invoiceNumber,
        templateId: templateId || null,
        senderType,
        senderId,
        senderName,
        senderEmail,
        receiverType,
        receiverId,
        receiverName,
        receiverEmail,
        invoiceDate: today,
        dueDate: dueDate || today,
        periodStart,
        periodEnd,
        subtotal: "0",
        taxAmount: "0",
        totalAmount: "0",
        currency: "AUD",
        notes,
        createdBy,
      };

      const invoice = await storage.createGeneratedInvoice(invoiceData);
      let subtotal = 0;

      // Add booking revenue line items
      if (includeBookings) {
        const bookings = await storage.getBookingsForInvoice(organizationId, {
          propertyIds,
          startDate: periodStart,
          endDate: periodEnd,
          ownerId: receiverType === 'owner' ? receiverId : undefined,
        });

        for (const booking of bookings) {
          const amount = parseFloat(booking.totalAmount);
          
          // Add booking revenue line item
          await storage.addInvoiceLineItem({
            invoiceId: invoice.id,
            itemType: 'booking_revenue',
            description: `Booking Revenue - ${booking.guestName} (${booking.checkIn} to ${booking.checkOut})`,
            itemReference: booking.id.toString(),
            quantity: "1",
            unitPrice: amount.toString(),
            lineTotal: amount.toString(),
            category: 'revenue',
            subcategory: 'accommodation',
            sourceType: 'booking',
            sourceId: booking.id,
          });

          // Add booking link
          await storage.addInvoiceBookingLink({
            invoiceId: invoice.id,
            bookingId: booking.id,
            bookingRevenue: amount.toString(),
            managementCommission: (amount * 0.30).toString(),
            portfolioManagerCommission: (amount * 0.15).toString(),
            ownerPayout: (amount * 0.70).toString(),
            addonServicesTotal: "0",
          });

          subtotal += amount;

          // Add management commission if invoice is to owner
          if (receiverType === 'owner') {
            const commissionAmount = amount * 0.30;
            await storage.addInvoiceLineItem({
              invoiceId: invoice.id,
              itemType: 'commission',
              description: `Management Commission (30%) - ${booking.guestName}`,
              itemReference: booking.id.toString(),
              quantity: "1",
              unitPrice: (-commissionAmount).toString(),
              lineTotal: (-commissionAmount).toString(),
              category: 'commission',
              subcategory: 'management_fee',
              sourceType: 'booking',
              sourceId: booking.id,
            });

            subtotal -= commissionAmount;
          }
        }
      }

      // Add addon services
      if (includeAddons) {
        const addonServices = await storage.getAddonServicesForInvoice(organizationId, {
          propertyIds,
          startDate: periodStart,
          endDate: periodEnd,
          billingRoute: receiverType === 'owner' ? 'owner_billable' : undefined,
        });

        for (const service of addonServices) {
          const amount = parseFloat(service.totalAmount);
          
          await storage.addInvoiceLineItem({
            invoiceId: invoice.id,
            itemType: 'addon_service',
            description: `${service.serviceName} - ${service.guestName}`,
            itemReference: service.id.toString(),
            quantity: "1",
            unitPrice: amount.toString(),
            lineTotal: amount.toString(),
            category: 'service',
            subcategory: service.serviceName.toLowerCase().replace(/\s+/g, '_'),
            sourceType: 'addon_service',
            sourceId: service.id,
          });

          // Add service link
          await storage.addInvoiceServiceLink({
            invoiceId: invoice.id,
            serviceBookingId: service.id,
            serviceName: service.serviceName,
            serviceAmount: amount.toString(),
            billingRoute: service.billingRoute,
          });

          if (service.billingRoute === 'owner_billable') {
            subtotal += amount;
          } else if (service.billingRoute === 'company_expense') {
            subtotal -= amount;
          }
        }
      }

      // Add portfolio manager commissions
      if (includeCommissions && receiverType === 'portfolio_manager') {
        const commissionData = await storage.getCommissionDataForInvoice(organizationId, {
          portfolioManagerId: receiverId,
          startDate: periodStart,
          endDate: periodEnd,
          propertyIds,
        });

        for (const commission of commissionData) {
          const amount = commission.portfolioManagerShare;
          
          await storage.addInvoiceLineItem({
            invoiceId: invoice.id,
            itemType: 'commission',
            description: `Portfolio Manager Commission (50% of management) - ${commission.guestName}`,
            itemReference: commission.id.toString(),
            quantity: "1",
            unitPrice: amount.toString(),
            lineTotal: amount.toString(),
            category: 'commission',
            subcategory: 'portfolio_manager_share',
            sourceType: 'booking',
            sourceId: commission.id,
          });

          subtotal += amount;
        }
      }

      // Calculate tax if enabled
      let taxAmount = 0;
      if (taxEnabled && taxRate > 0) {
        taxAmount = subtotal * (parseFloat(taxRate) / 100);
        
        await storage.addInvoiceLineItem({
          invoiceId: invoice.id,
          itemType: 'tax',
          description: `Tax (${taxRate}%)`,
          quantity: "1",
          unitPrice: taxAmount.toString(),
          lineTotal: taxAmount.toString(),
          category: 'tax',
          isManualEntry: true,
        });
      }

      const totalAmount = subtotal + taxAmount;

      // Update invoice totals
      await storage.updateGeneratedInvoice(invoice.id, {
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        totalAmount: totalAmount.toString(),
        status: 'draft',
      });

      res.json({
        message: "Invoice generated successfully",
        invoice: {
          ...invoice,
          subtotal: subtotal.toString(),
          taxAmount: taxAmount.toString(),
          totalAmount: totalAmount.toString(),
        },
        invoiceNumber,
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Mark Invoice as Paid
  app.post("/api/generated-invoices/:id/mark-paid", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      const { paymentMethod, paymentReference, paymentDate } = req.body;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const invoice = await storage.markInvoiceAsPaid(parseInt(id), {
        paymentStatus: 'paid',
        paymentMethod,
        paymentReference,
        paymentDate,
      });

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json({
        message: "Invoice marked as paid successfully",
        invoice,
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ message: "Failed to mark invoice as paid" });
    }
  });

  // Update Invoice Line Item
  app.put("/api/invoice-line-items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const lineItem = await storage.updateInvoiceLineItem(parseInt(id), req.body);
      if (!lineItem) {
        return res.status(404).json({ message: "Line item not found" });
      }

      res.json(lineItem);
    } catch (error) {
      console.error("Error updating line item:", error);
      res.status(500).json({ message: "Failed to update line item" });
    }
  });

  // Add Manual Line Item
  app.post("/api/generated-invoices/:invoiceId/line-items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { invoiceId } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const lineItemData = {
        ...req.body,
        invoiceId: parseInt(invoiceId),
        isManualEntry: true,
      };

      const lineItem = await storage.addInvoiceLineItem(lineItemData);
      res.json(lineItem);
    } catch (error) {
      console.error("Error adding line item:", error);
      res.status(500).json({ message: "Failed to add line item" });
    }
  });

  // Delete Line Item
  app.delete("/api/invoice-line-items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const deleted = await storage.deleteInvoiceLineItem(parseInt(id));
      if (!deleted) {
        return res.status(404).json({ message: "Line item not found" });
      }

      res.json({ message: "Line item deleted successfully" });
    } catch (error) {
      console.error("Error deleting line item:", error);
      res.status(500).json({ message: "Failed to delete line item" });
    }
  });

  // Invoice Analytics
  app.get("/api/invoice-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const { startDate, endDate } = req.query;
      const dateRange = startDate && endDate ? { startDate, endDate } : undefined;

      const analytics = await storage.getInvoiceAnalytics(organizationId, dateRange);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching invoice analytics:", error);
      res.status(500).json({ message: "Failed to fetch invoice analytics" });
    }
  });

  // Get Booking Data for Invoice Preview
  app.get("/api/invoice-preview-data", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const { startDate, endDate, propertyIds, ownerId, portfolioManagerId } = req.query;
      
      const bookings = await storage.getBookingsForInvoice(organizationId, {
        startDate,
        endDate,
        propertyIds: propertyIds ? propertyIds.split(',').map(Number) : undefined,
        ownerId,
        portfolioManagerId,
      });

      const addonServices = await storage.getAddonServicesForInvoice(organizationId, {
        startDate,
        endDate,
        propertyIds: propertyIds ? propertyIds.split(',').map(Number) : undefined,
      });

      // Calculate totals
      const bookingTotal = bookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);
      const addonTotal = addonServices.reduce((sum, service) => sum + parseFloat(service.totalAmount), 0);

      res.json({
        bookings,
        addonServices,
        totals: {
          bookingRevenue: bookingTotal,
          addonServices: addonTotal,
          managementCommission: bookingTotal * 0.30,
          portfolioManagerCommission: bookingTotal * 0.15,
          ownerPayout: bookingTotal * 0.70,
        },
      });
    } catch (error) {
      console.error("Error fetching invoice preview data:", error);
      res.status(500).json({ message: "Failed to fetch preview data" });
    }
  });

  // ===== PROPERTY SEARCH INDEX MANAGEMENT API =====

  // Update property search index (admin/PM access)
  app.put("/api/properties/:propertyId/search-index", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const indexData = {
        ...req.body,
        organizationId,
      };

      const searchIndex = await storage.updatePropertySearchIndex(parseInt(propertyId), indexData);
      res.json(searchIndex);
    } catch (error) {
      console.error("Error updating property search index:", error);
      res.status(500).json({ message: "Failed to update property search index" });
    }
  });

  // ===== BOOKING PLATFORM SYNC API =====

  // Get platform sync configurations (admin only)
  app.get("/api/booking-platform-sync", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const syncs = await storage.getBookingPlatformSyncs(organizationId);
      res.json(syncs);
    } catch (error) {
      console.error("Error fetching platform syncs:", error);
      res.status(500).json({ message: "Failed to fetch platform syncs" });
    }
  });

  // Update platform sync configuration (admin only)
  app.put("/api/booking-platform-sync", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const syncData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const sync = await storage.updateBookingPlatformSync(organizationId, syncData);
      res.json(sync);
    } catch (error) {
      console.error("Error updating platform sync:", error);
      res.status(500).json({ message: "Failed to update platform sync" });
    }
  });

  // ===== OCCUPANCY ANALYTICS API =====

  // Get occupancy analytics
  app.get("/api/occupancy-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId, periodType, startDate, endDate } = req.query;

      if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const analytics = await storage.getOccupancyAnalytics(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        periodType: periodType as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching occupancy analytics:", error);
      res.status(500).json({ message: "Failed to fetch occupancy analytics" });
    }
  });

  // ===== GUEST PORTAL INTERFACE API =====

  // Guest Portal Authentication - Create session with booking token
  app.post("/api/guest/portal/auth", async (req, res) => {
    try {
      const { bookingReference, guestEmail, checkInDate } = req.body;
      
      // Find booking by reference and guest email
      const booking = await storage.getBookingByReferenceAndEmail(bookingReference, guestEmail);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found or email mismatch" });
      }

      // Generate secure access token
      const accessToken = `gpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create guest portal session with 30 days after checkout expiry
      const checkOutDate = new Date(booking.checkOut);
      const expiresAt = new Date(checkOutDate);
      expiresAt.setDate(expiresAt.getDate() + 30);

      const session = await storage.createGuestPortalSession({
        organizationId: booking.organizationId,
        bookingId: booking.id,
        guestEmail,
        accessToken,
        propertyId: booking.propertyId,
        checkInDate: new Date(checkInDate),
        checkOutDate,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        expiresAt,
      });

      res.json({ 
        accessToken, 
        session: {
          id: session.id,
          propertyId: session.propertyId,
          checkInDate: session.checkInDate,
          checkOutDate: session.checkOutDate,
          guestName: session.guestName
        }
      });
    } catch (error) {
      console.error("Error creating guest portal session:", error);
      res.status(500).json({ message: "Failed to create guest session" });
    }
  });

  // Guest Portal Middleware - Validate access token
  const guestPortalAuth = async (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ message: "Access token required" });
      }

      const session = await storage.getGuestPortalSession(token);
      
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired access token" });
      }

      // Update last accessed time
      await storage.updateGuestPortalSessionActivity(token);
      
      req.guestSession = session;
      next();
    } catch (error) {
      console.error("Guest portal auth error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  };

  // Get guest booking overview
  app.get("/api/guest/booking-overview", guestPortalAuth, async (req: any, res) => {
    try {
      const overview = await storage.getGuestBookingOverview(req.guestSession.id);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching booking overview:", error);
      res.status(500).json({ message: "Failed to fetch booking overview" });
    }
  });

  // Get guest activity timeline
  app.get("/api/guest/activity-timeline", guestPortalAuth, async (req: any, res) => {
    try {
      const timeline = await storage.getGuestActivityTimeline(req.guestSession.id);
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching activity timeline:", error);
      res.status(500).json({ message: "Failed to fetch activity timeline" });
    }
  });

  // Guest Chat - Get messages
  app.get("/api/guest/chat/messages", guestPortalAuth, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const messages = await storage.getGuestChatMessages(
        req.guestSession.id, 
        limit ? parseInt(limit as string) : 50
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Guest Chat - Send message with AI processing
  app.post("/api/guest/chat/send", guestPortalAuth, async (req: any, res) => {
    try {
      const { messageContent } = req.body;
      
      if (!messageContent || messageContent.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Create guest message
      const guestMessage = await storage.createGuestChatMessage({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        messageType: 'guest_message',
        senderType: 'guest',
        messageContent: messageContent.trim(),
        messageThreadId: `thread_${req.guestSession.id}_${Date.now()}`,
      });

      // Process with AI for issue detection
      const aiResult = await storage.processGuestMessageWithAI(guestMessage.id);
      
      // Create AI response message
      const aiResponse = await storage.createGuestChatMessage({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        messageType: 'ai_response',
        senderType: 'ai',
        messageContent: aiResult.aiResponse || "Thank you for your message. Our team will respond shortly.",
        messageThreadId: guestMessage.messageThreadId,
      });

      res.json({
        guestMessage,
        aiResponse,
        detectedIssue: aiResult.detectedIssue,
        severity: aiResult.severity
      });
    } catch (error) {
      console.error("Error sending chat message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Get AI FAQ responses
  app.get("/api/guest/faq", guestPortalAuth, async (req: any, res) => {
    try {
      const faqs = await storage.getGuestAiFaqResponses(
        req.guestSession.organizationId,
        req.guestSession.propertyId
      );
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching FAQ responses:", error);
      res.status(500).json({ message: "Failed to fetch FAQ responses" });
    }
  });

  // Get available add-on services
  app.get("/api/guest/addon-services", guestPortalAuth, async (req: any, res) => {
    try {
      const services = await storage.getAvailableAddonServices(
        req.guestSession.organizationId,
        req.guestSession.propertyId
      );
      res.json(services);
    } catch (error) {
      console.error("Error fetching add-on services:", error);
      res.status(500).json({ message: "Failed to fetch add-on services" });
    }
  });

  // Request add-on service
  app.post("/api/guest/addon-services/request", guestPortalAuth, async (req: any, res) => {
    try {
      const {
        serviceId,
        serviceName,
        serviceType,
        requestedDate,
        requestedTime,
        duration,
        guestCount,
        unitPrice,
        quantity,
        totalCost,
        chargeAssignment,
        assignmentReason,
        specialRequests,
        guestNotes
      } = req.body;

      const serviceRequest = await storage.createGuestAddonServiceRequest({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        serviceId,
        serviceName,
        serviceType,
        requestedDate: new Date(requestedDate),
        requestedTime,
        duration,
        guestCount: guestCount || 1,
        unitPrice,
        quantity: quantity || 1,
        totalCost,
        chargeAssignment: chargeAssignment || 'guest',
        assignmentReason,
        specialRequests,
        guestNotes,
      });

      // Create activity timeline entry
      await storage.createGuestActivityRecord({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        activityType: 'addon_booking',
        title: `${serviceName} Request`,
        description: `Requested ${serviceName} for ${new Date(requestedDate).toDateString()}`,
        status: 'pending',
        requestedAt: new Date(),
        estimatedCost: totalCost,
        chargeAssignment: chargeAssignment || 'guest',
      });

      res.json(serviceRequest);
    } catch (error) {
      console.error("Error requesting add-on service:", error);
      res.status(500).json({ message: "Failed to request add-on service" });
    }
  });

  // Get guest's add-on service requests
  app.get("/api/guest/addon-services/requests", guestPortalAuth, async (req: any, res) => {
    try {
      const requests = await storage.getGuestAddonServiceRequests(req.guestSession.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  // Get property local information (maps, recommendations)
  app.get("/api/guest/local-info", guestPortalAuth, async (req: any, res) => {
    try {
      const { locationType } = req.query;
      const localInfo = await storage.getGuestPropertyLocalInfo(
        req.guestSession.propertyId,
        locationType as string
      );
      res.json(localInfo);
    } catch (error) {
      console.error("Error fetching local info:", error);
      res.status(500).json({ message: "Failed to fetch local information" });
    }
  });

  // Submit maintenance report
  app.post("/api/guest/maintenance/report", guestPortalAuth, async (req: any, res) => {
    try {
      const {
        issueType,
        issueTitle,
        issueDescription,
        locationInProperty,
        severityLevel,
        reportImages,
        reportVideos
      } = req.body;

      const report = await storage.createGuestMaintenanceReport({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        propertyId: req.guestSession.propertyId,
        issueType,
        issueTitle,
        issueDescription,
        locationInProperty,
        severityLevel: severityLevel || 'medium',
        reportImages,
        reportVideos,
        reportedAt: new Date(),
      });

      // Create activity timeline entry
      await storage.createGuestActivityRecord({
        organizationId: req.guestSession.organizationId,
        guestSessionId: req.guestSession.id,
        bookingId: req.guestSession.bookingId,
        activityType: 'maintenance_request',
        title: `Maintenance Report: ${issueTitle}`,
        description: `Reported ${issueType} issue in ${locationInProperty}`,
        status: 'pending',
        requestedAt: new Date(),
      });

      res.json(report);
    } catch (error) {
      console.error("Error submitting maintenance report:", error);
      res.status(500).json({ message: "Failed to submit maintenance report" });
    }
  });

  // Get guest's maintenance reports
  app.get("/api/guest/maintenance/reports", guestPortalAuth, async (req: any, res) => {
    try {
      const reports = await storage.getGuestMaintenanceReports(req.guestSession.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching maintenance reports:", error);
      res.status(500).json({ message: "Failed to fetch maintenance reports" });
    }
  });

  // Get guest session info
  app.get("/api/guest/session", guestPortalAuth, async (req: any, res) => {
    try {
      const { password, accessToken, ...sessionInfo } = req.guestSession;
      res.json(sessionInfo);
    } catch (error) {
      console.error("Error fetching session info:", error);
      res.status(500).json({ message: "Failed to fetch session info" });
    }
  });

  // Finance Engine Routes
  app.get("/api/finance/owner-balances", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const balances = await storage.getOwnerBalances(organizationId);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching owner balances:", error);
      res.status(500).json({ message: "Failed to fetch owner balances" });
    }
  });

  app.get("/api/finance/payout-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const payouts = await storage.getOwnerPayoutRequests(organizationId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  app.post("/api/finance/request-payout", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const userId = req.user?.id;
      
      const payoutData = {
        organizationId,
        ownerId: userId,
        amount: parseFloat(req.body.amount),
        transferMethod: req.body.transferMethod,
        requestNotes: req.body.requestNotes,
        status: "pending"
      };

      const payout = await storage.createOwnerPayoutRequest(payoutData);
      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  app.post("/api/finance/payout-requests/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      
      const updateData: any = {};
      if (action === 'approve') {
        updateData.status = 'approved';
        updateData.approvedAt = new Date();
        updateData.approvedBy = req.user?.id;
      } else if (action === 'reject') {
        updateData.status = 'rejected';
      }

      const payout = await storage.updateOwnerPayoutRequest(parseInt(id), updateData);
      res.json(payout);
    } catch (error) {
      console.error("Error updating payout request:", error);
      res.status(500).json({ message: "Failed to update payout request" });
    }
  });

  app.get("/api/finance/charge-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const charges = await storage.getOwnerChargeRequests(organizationId);
      res.json(charges);
    } catch (error) {
      console.error("Error fetching charge requests:", error);
      res.status(500).json({ message: "Failed to fetch charge requests" });
    }
  });

  app.post("/api/finance/create-charge", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const chargedBy = req.user?.id;
      
      const chargeData = {
        organizationId,
        ownerId: req.body.ownerId,
        chargedBy,
        amount: parseFloat(req.body.amount),
        reason: req.body.reason,
        description: req.body.description,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        status: "pending"
      };

      const charge = await storage.createOwnerChargeRequest(chargeData);
      res.json(charge);
    } catch (error) {
      console.error("Error creating charge request:", error);
      res.status(500).json({ message: "Failed to create charge request" });
    }
  });

  app.get("/api/finance/utility-accounts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const accounts = await storage.getUtilityAccounts(organizationId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching utility accounts:", error);
      res.status(500).json({ message: "Failed to fetch utility accounts" });
    }
  });

  app.post("/api/finance/utility-accounts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      
      const accountData = {
        organizationId,
        propertyId: parseInt(req.body.propertyId),
        utilityType: req.body.utilityType,
        providerName: req.body.providerName,
        accountNumber: req.body.accountNumber,
        expectedBillDate: parseInt(req.body.expectedBillDate),
        averageMonthlyAmount: req.body.averageMonthlyAmount ? parseFloat(req.body.averageMonthlyAmount) : null,
        autoRemindersEnabled: true,
        isActive: true
      };

      const account = await storage.createUtilityAccount(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating utility account:", error);
      res.status(500).json({ message: "Failed to create utility account" });
    }
  });

  app.get("/api/finance/recurring-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const services = await storage.getRecurringServices(organizationId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching recurring services:", error);
      res.status(500).json({ message: "Failed to fetch recurring services" });
    }
  });

  app.post("/api/finance/recurring-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      
      const serviceData = {
        organizationId,
        propertyId: parseInt(req.body.propertyId),
        serviceName: req.body.serviceName,
        serviceCategory: req.body.serviceCategory,
        monthlyRate: parseFloat(req.body.monthlyRate),
        chargeAssignment: req.body.chargeAssignment,
        startDate: new Date(req.body.startDate),
        serviceFrequency: "monthly",
        isActive: true
      };

      const service = await storage.createRecurringService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating recurring service:", error);
      res.status(500).json({ message: "Failed to create recurring service" });
    }
  });

  app.get("/api/users/:role", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const { role } = req.params;
      
      if (role === 'owner') {
        const owners = await storage.getOwnersForSelection(organizationId);
        res.json(owners);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Enhanced Maintenance Task System Routes
  app.get("/api/task-checklists", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const checklists = await storage.getTaskChecklists(organizationId);
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching task checklists:", error);
      res.status(500).json({ message: "Failed to fetch task checklists" });
    }
  });

  app.get("/api/property-guides", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const guides = await storage.getPropertyGuides(organizationId);
      res.json(guides);
    } catch (error) {
      console.error("Error fetching property guides:", error);
      res.status(500).json({ message: "Failed to fetch property guides" });
    }
  });

  app.get("/api/ai-task-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const suggestions = await storage.getAiTaskSuggestions(organizationId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI task suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI task suggestions" });
    }
  });

  app.post("/api/tasks/:id/start", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const task = await storage.startTask(parseInt(id), userId);
      res.json(task);
    } catch (error) {
      console.error("Error starting task:", error);
      res.status(500).json({ message: "Failed to start task" });
    }
  });

  app.post("/api/tasks/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { completionNotes, evidencePhotos, issuesFound } = req.body;
      const userId = req.user?.id;
      
      const task = await storage.completeTask(parseInt(id), {
        completionNotes,
        evidencePhotos: evidencePhotos || [],
        issuesFound: issuesFound || [],
        completedBy: userId
      });
      
      res.json(task);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.post("/api/ai-suggestions/:id/accept", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const result = await storage.acceptAiSuggestion(parseInt(id), userId);
      res.json(result);
    } catch (error) {
      console.error("Error accepting AI suggestion:", error);
      res.status(500).json({ message: "Failed to accept AI suggestion" });
    }
  });

  app.post("/api/tasks/export-pdf", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { month } = req.body;
      const organizationId = req.user?.organizationId || "default-org";
      
      // Generate PDF export (mock implementation)
      const result = await storage.exportTasksPdf(organizationId, month);
      res.json({ message: "PDF export initiated", exportId: result.id });
    } catch (error) {
      console.error("Error exporting tasks PDF:", error);
      res.status(500).json({ message: "Failed to export tasks PDF" });
    }
  });

  // ==================== ENHANCED FINANCE ENGINE ====================

  // Owner Balance Tracker endpoints
  app.get("/api/finance/owner-balance/:ownerId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { ownerId } = req.params;
      const { propertyId } = req.query;
      const organizationId = req.user?.organizationId || "default-org";

      const balance = await storage.getOwnerBalanceTracker(
        organizationId, 
        ownerId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(balance || { message: "No balance tracker found" });
    } catch (error) {
      console.error("Error fetching owner balance:", error);
      res.status(500).json({ message: "Failed to fetch owner balance" });
    }
  });

  app.post("/api/finance/owner-balance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const balanceData = { ...req.body, organizationId };

      const balance = await storage.createOwnerBalanceTracker(balanceData);
      res.status(201).json(balance);
    } catch (error) {
      console.error("Error creating owner balance tracker:", error);
      res.status(500).json({ message: "Failed to create owner balance tracker" });
    }
  });

  app.patch("/api/finance/owner-balance/:ownerId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { ownerId } = req.params;
      const organizationId = req.user?.organizationId || "default-org";

      const balance = await storage.updateOwnerBalanceTracker(organizationId, ownerId, req.body);
      res.json(balance);
    } catch (error) {
      console.error("Error updating owner balance:", error);
      res.status(500).json({ message: "Failed to update owner balance" });
    }
  });

  // Owner Financial Summary endpoint
  app.get("/api/finance/owner-summary/:ownerId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { ownerId } = req.params;
      const organizationId = req.user?.organizationId || "default-org";

      const summary = await storage.getOwnerFinancialSummary(organizationId, ownerId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching owner financial summary:", error);
      res.status(500).json({ message: "Failed to fetch owner financial summary" });
    }
  });

  // Payout Routing Rules endpoints
  app.get("/api/finance/payout-routing-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.query;
      const organizationId = req.user?.organizationId || "default-org";

      const rules = await storage.getPayoutRoutingRules(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(rules);
    } catch (error) {
      console.error("Error fetching payout routing rules:", error);
      res.status(500).json({ message: "Failed to fetch payout routing rules" });
    }
  });

  app.post("/api/finance/payout-routing-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      // Only admin and portfolio managers can create routing rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const ruleData = { 
        ...req.body, 
        organizationId,
        createdBy: user.id 
      };

      const rule = await storage.createPayoutRoutingRule(ruleData);
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating payout routing rule:", error);
      res.status(500).json({ message: "Failed to create payout routing rule" });
    }
  });

  app.patch("/api/finance/payout-routing-rules/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { id } = req.params;
      
      // Only admin and portfolio managers can update routing rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const rule = await storage.updatePayoutRoutingRule(parseInt(id), req.body);
      res.json(rule);
    } catch (error) {
      console.error("Error updating payout routing rule:", error);
      res.status(500).json({ message: "Failed to update payout routing rule" });
    }
  });

  // Platform Payout Breakdown endpoint
  app.get("/api/finance/payout-breakdown/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const organizationId = req.user?.organizationId || "default-org";

      const breakdown = await storage.getPlatformPayoutBreakdown(organizationId, parseInt(propertyId));
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching payout breakdown:", error);
      res.status(500).json({ message: "Failed to fetch payout breakdown" });
    }
  });

  // Utility Bill Processing endpoints
  app.get("/api/finance/utility-bill-processing", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { utilityBillId, processingStatus } = req.query;
      const organizationId = req.user?.organizationId || "default-org";

      const processing = await storage.getUtilityBillProcessing(organizationId, {
        utilityBillId: utilityBillId ? parseInt(utilityBillId) : undefined,
        processingStatus
      });
      res.json(processing);
    } catch (error) {
      console.error("Error fetching utility bill processing:", error);
      res.status(500).json({ message: "Failed to fetch utility bill processing" });
    }
  });

  app.post("/api/finance/process-utility-bill/:billId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { billId } = req.params;
      const { routingDecision, notes } = req.body;
      const user = req.user;

      // Only admin, portfolio managers, and staff can process bills
      if (!['admin', 'portfolio-manager', 'staff'].includes(user?.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const result = await storage.processUtilityBillWithRouting(
        parseInt(billId), 
        routingDecision, 
        user.id,
        notes
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error processing utility bill:", error);
      res.status(500).json({ message: "Failed to process utility bill" });
    }
  });

  // Enhanced Finance Transaction Logs endpoints
  app.get("/api/finance/transaction-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { transactionType, relatedTableName, processedBy, fromDate, toDate } = req.query;
      const organizationId = req.user?.organizationId || "default-org";

      const logs = await storage.getEnhancedFinanceTransactionLogs(organizationId, {
        transactionType,
        relatedTableName,
        processedBy,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      });
      res.json(logs);
    } catch (error) {
      console.error("Error fetching transaction logs:", error);
      res.status(500).json({ message: "Failed to fetch transaction logs" });
    }
  });

  app.post("/api/finance/transaction-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";

      const logData = { 
        ...req.body, 
        organizationId,
        processedBy: user.id 
      };

      const log = await storage.createEnhancedFinanceTransactionLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating transaction log:", error);
      res.status(500).json({ message: "Failed to create transaction log" });
    }
  });

  // ===== TASK CHECKLIST & PROOF SYSTEM API ROUTES =====

  // Get task checklists
  app.get("/api/task-checklists", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, taskType } = req.query;
      
      const checklists = await storage.getTaskChecklists(organizationId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        taskType: taskType || undefined,
      });
      
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching task checklists:", error);
      res.status(500).json({ message: "Failed to fetch task checklists" });
    }
  });

  // Create task checklist
  app.post("/api/task-checklists", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const checklistData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const checklist = await storage.createTaskChecklist(checklistData);
      res.status(201).json(checklist);
    } catch (error) {
      console.error("Error creating task checklist:", error);
      res.status(500).json({ message: "Failed to create task checklist" });
    }
  });

  // Get property guides
  app.get("/api/property-guides", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, taskCategory } = req.query;
      
      const guides = await storage.getPropertyGuides(organizationId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        taskCategory: taskCategory || undefined,
      });
      
      res.json(guides);
    } catch (error) {
      console.error("Error fetching property guides:", error);
      res.status(500).json({ message: "Failed to fetch property guides" });
    }
  });

  // Create property guide
  app.post("/api/property-guides", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const guideData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const guide = await storage.createPropertyGuide(guideData);
      res.status(201).json(guide);
    } catch (error) {
      console.error("Error creating property guide:", error);
      res.status(500).json({ message: "Failed to create property guide" });
    }
  });

  // Get task completions
  app.get("/api/task-completions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, taskId } = req.query;
      
      const completions = await storage.getTaskCompletions(organizationId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        taskId: taskId ? parseInt(taskId) : undefined,
      });
      
      res.json(completions);
    } catch (error) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ message: "Failed to fetch task completions" });
    }
  });

  // Get monthly exports
  app.get("/api/monthly-exports", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, exportMonth } = req.query;
      
      const exports = await storage.getMonthlyExports(organizationId, {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        exportMonth: exportMonth || undefined,
      });
      
      res.json(exports);
    } catch (error) {
      console.error("Error fetching monthly exports:", error);
      res.status(500).json({ message: "Failed to fetch monthly exports" });
    }
  });

  // Create monthly export
  app.post("/api/monthly-exports", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const exportData = {
        ...req.body,
        organizationId,
        exportedBy: userId,
      };

      const exportLog = await storage.createMonthlyExport(exportData);
      res.status(201).json(exportLog);
    } catch (error) {
      console.error("Error creating monthly export:", error);
      res.status(500).json({ message: "Failed to create monthly export" });
    }
  });

  // === AI-TRIGGERED TASK SYSTEM API ROUTES ===
  
  // Enhanced AI Suggestions
  app.get('/api/enhanced-ai-suggestions', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { propertyId, status, urgencyLevel } = req.query;
      
      const filters = {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        status: status as string,
        urgencyLevel: urgencyLevel as string,
      };
      
      const suggestions = await storage.getEnhancedAiSuggestions(organizationId, filters);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      res.status(500).json({ message: 'Failed to fetch AI suggestions' });
    }
  });

  app.post('/api/enhanced-ai-suggestions', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const suggestionData = {
        ...req.body,
        organizationId,
      };
      
      const suggestion = await storage.createEnhancedAiSuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating AI suggestion:', error);
      res.status(500).json({ message: 'Failed to create AI suggestion' });
    }
  });

  app.post('/api/enhanced-ai-suggestions/:id/accept', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const userData = req.user as any;
      const { taskTitle, taskDescription, assignedTo, priority } = req.body;
      
      // Create a new task from the suggestion
      const task = await storage.createTask({
        organizationId: getTenantContext(req).organizationId,
        title: taskTitle,
        description: taskDescription,
        status: 'pending',
        priority: priority || 'medium',
        assignedTo,
        propertyId: req.body.propertyId,
        department: req.body.department || 'general',
      });
      
      // Mark suggestion as accepted
      await storage.acceptAiSuggestion(suggestionId, userData.claims.sub, task.id);
      
      // Create timeline event
      await storage.createTimelineEvent({
        organizationId: getTenantContext(req).organizationId,
        propertyId: req.body.propertyId,
        eventType: 'suggestion',
        title: '🤖 AI Suggestion Accepted',
        description: `AI suggestion "${taskTitle}" was accepted and converted to a task.`,
        emoji: '🤖',
        linkedId: task.id,
        linkedType: 'task',
        createdBy: userData.claims.sub,
        createdByRole: userData.role || 'admin',
      });
      
      res.json({ success: true, taskId: task.id });
    } catch (error) {
      console.error('Error accepting AI suggestion:', error);
      res.status(500).json({ message: 'Failed to accept AI suggestion' });
    }
  });

  app.post('/api/enhanced-ai-suggestions/:id/reject', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const userData = req.user as any;
      
      await storage.rejectAiSuggestion(suggestionId, userData.claims.sub);
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting AI suggestion:', error);
      res.status(500).json({ message: 'Failed to reject AI suggestion' });
    }
  });

  // Property Timeline
  app.get('/api/property-timeline/:propertyId', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const timeline = await storage.getPropertyTimeline(organizationId, propertyId, limit);
      res.json(timeline);
    } catch (error) {
      console.error('Error fetching property timeline:', error);
      res.status(500).json({ message: 'Failed to fetch property timeline' });
    }
  });

  app.post('/api/property-timeline', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const eventData = {
        ...req.body,
        organizationId,
        createdBy: userData.claims.sub,
        createdByRole: userData.role || 'admin',
      };
      
      const event = await storage.createTimelineEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating timeline event:', error);
      res.status(500).json({ message: 'Failed to create timeline event' });
    }
  });

  // Smart Notifications
  app.get('/api/smart-notifications', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const notifications = await storage.getSmartNotifications(organizationId, userData.claims.sub);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching smart notifications:', error);
      res.status(500).json({ message: 'Failed to fetch smart notifications' });
    }
  });

  app.post('/api/smart-notifications/:id/read', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  // Fast Action Suggestions
  app.get('/api/fast-action-suggestions', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      
      const suggestions = await storage.getFastActionSuggestions(organizationId, propertyId);
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching fast action suggestions:', error);
      res.status(500).json({ message: 'Failed to fetch fast action suggestions' });
    }
  });

  app.post('/api/fast-action-suggestions', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const userData = req.user as any;
      
      const suggestionData = {
        ...req.body,
        organizationId,
        suggestedBy: userData.claims.sub,
        suggestedByRole: userData.role || 'admin',
      };
      
      const suggestion = await storage.createFastActionSuggestion(suggestionData);
      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating fast action suggestion:', error);
      res.status(500).json({ message: 'Failed to create fast action suggestion' });
    }
  });

  app.post('/api/fast-action-suggestions/:id/approve', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const actionId = parseInt(req.params.id);
      const userData = req.user as any;
      
      await storage.approveFastAction(actionId, userData.claims.sub);
      res.json({ success: true });
    } catch (error) {
      console.error('Error approving fast action:', error);
      res.status(500).json({ message: 'Failed to approve fast action' });
    }
  });

  app.post('/api/fast-action-suggestions/:id/reject', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const actionId = parseInt(req.params.id);
      const userData = req.user as any;
      const { reason } = req.body;
      
      await storage.rejectFastAction(actionId, userData.claims.sub, reason);
      res.json({ success: true });
    } catch (error) {
      console.error('Error rejecting fast action:', error);
      res.status(500).json({ message: 'Failed to reject fast action' });
    }
  });

  // AI Processing Endpoints
  app.post('/api/ai/process-review-feedback', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { bookingId, reviewText } = req.body;
      
      if (!reviewText || reviewText.trim().length === 0) {
        return res.status(400).json({ message: 'Review text is required' });
      }
      
      const suggestions = await storage.processGuestReviewFeedback(organizationId, bookingId, reviewText);
      
      // Create smart notifications for each suggestion
      for (const suggestion of suggestions) {
        await storage.createSmartNotification({
          organizationId,
          recipientId: 'admin@test.com', // Should route to appropriate admin/PM
          recipientRole: 'admin',
          notificationType: 'ai-suggestion',
          title: '🤖 New AI Task Suggestion',
          message: `AI detected potential issue: ${suggestion.suggestedTitle}`,
          priority: suggestion.urgencyLevel === 'high' ? 'high' : 'medium',
          sourceId: suggestion.id,
          sourceType: 'ai_suggestion',
          actionRequired: true,
          actionButtons: [
            { action: 'accept', label: 'Accept & Create Task', style: 'primary' },
            { action: 'reject', label: 'Dismiss', style: 'secondary' }
          ],
        });
      }
      
      res.json({ success: true, suggestions });
    } catch (error) {
      console.error('Error processing review feedback:', error);
      res.status(500).json({ message: 'Failed to process review feedback' });
    }
  });

  app.post('/api/ai/create-longstay-tasks', authenticatedTenantMiddleware, async (req, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { bookingId } = req.body;
      
      const suggestions = await storage.createLongStayCleaningTasks(organizationId, bookingId);
      res.json({ success: true, suggestions });
    } catch (error) {
      console.error('Error creating long-stay tasks:', error);
      res.status(500).json({ message: 'Failed to create long-stay tasks' });
    }
  });

  // ===== OWNER BALANCE & PAYMENT SYSTEM ROUTES =====

  // Get owner balance for specific property
  app.get("/api/owner-balance/:propertyId", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can access their own balance
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const organizationId = user.organizationId;
      const ownerId = user.id;
      const propertyId = parseInt(req.params.propertyId);

      const balance = await storage.getOwnerBalanceByProperty(organizationId, ownerId, propertyId);
      res.json(balance);
    } catch (error) {
      console.error("Error fetching owner balance:", error);
      res.status(500).json({ message: "Failed to fetch owner balance" });
    }
  });

  // Get all owner balances
  app.get("/api/owner-balances", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can access their own balances
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const organizationId = user.organizationId;
      const ownerId = user.id;

      const balances = await storage.getAllOwnerBalances(organizationId, ownerId);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching owner balances:", error);
      res.status(500).json({ message: "Failed to fetch owner balances" });
    }
  });

  // Calculate live balance for property
  app.post("/api/owner-balance/calculate", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can calculate their own balance
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const organizationId = user.organizationId;
      const ownerId = user.id;
      const { propertyId, period } = req.body;

      const balance = await storage.calculateOwnerBalance(
        organizationId, 
        ownerId, 
        propertyId, 
        { start: new Date(period.start), end: new Date(period.end) }
      );

      // Update the balance tracker
      await storage.updateOwnerBalance({
        organizationId,
        ownerId,
        propertyId,
        ...balance,
        lastCalculatedAt: new Date(),
      });

      res.json(balance);
    } catch (error) {
      console.error("Error calculating owner balance:", error);
      res.status(500).json({ message: "Failed to calculate owner balance" });
    }
  });

  // Create payout request
  app.post("/api/owner-payout-request", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can create payout requests
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const organizationId = user.organizationId;
      const ownerId = user.id;
      const { propertyId, requestedAmount, paymentMethod, paymentDetails, notes } = req.body;

      const payoutRequest = await storage.createOwnerPayoutRequest({
        organizationId,
        ownerId,
        propertyId,
        requestedAmount,
        paymentMethod,
        paymentDetails,
        notes,
        requestStatus: 'pending',
        requestedAt: new Date(),
      });

      // Create notification for admin/PM
      await storage.createNotification({
        organizationId,
        userId: 'admin@test.com', // Should route to appropriate admin/PM
        type: 'payout_request',
        title: 'New Payout Request',
        message: `Owner ${user.username} requested ${requestedAmount} payout`,
        priority: 'medium',
        isRead: false,
      });

      res.json(payoutRequest);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Get payout requests (owners see their own, admin/PM see all)
  app.get("/api/owner-payout-requests", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId;
      let ownerId = undefined;

      // Owners can only see their own requests
      if (user.role === 'owner') {
        ownerId = user.id;
      } else if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Owner, admin, or portfolio manager role required." });
      }

      const requests = await storage.getOwnerPayoutRequests(organizationId, ownerId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // Approve/reject payout request (admin/PM only)
  app.put("/api/owner-payout-request/:id/status", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can update payout status
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or portfolio manager role required." });
      }

      const requestId = parseInt(req.params.id);
      const { status, notes } = req.body;

      const updated = await storage.updatePayoutRequestStatus(requestId, {
        requestStatus: status,
        approvedBy: status === 'approved' ? user.id : null,
        approvedAt: status === 'approved' ? new Date() : null,
        rejectedBy: status === 'rejected' ? user.id : null,
        rejectedAt: status === 'rejected' ? new Date() : null,
        adminNotes: notes,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating payout request status:", error);
      res.status(500).json({ message: "Failed to update payout request status" });
    }
  });

  // Upload payment slip (admin/PM only)
  app.put("/api/owner-payout-request/:id/payment-slip", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can upload payment slips
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or portfolio manager role required." });
      }

      const requestId = parseInt(req.params.id);
      const { paymentSlipUrl } = req.body;

      const updated = await storage.uploadPaymentSlip(requestId, paymentSlipUrl, user.id);

      // Create notification for owner
      await storage.createNotification({
        organizationId: user.organizationId,
        userId: updated.ownerId,
        type: 'payment_made',
        title: 'Payment Slip Uploaded',
        message: 'Your payout has been processed. Please confirm receipt.',
        priority: 'high',
        isRead: false,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error uploading payment slip:", error);
      res.status(500).json({ message: "Failed to upload payment slip" });
    }
  });

  // Confirm payment received (owner only)
  app.put("/api/owner-payout-request/:id/confirm", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can confirm their payments
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const requestId = parseInt(req.params.id);
      const { notes } = req.body;

      const updated = await storage.confirmPaymentReceived(requestId, user.id, notes);

      // Log the payment completion
      await storage.createPaymentLog({
        organizationId: user.organizationId,
        ownerId: user.id,
        propertyId: updated.propertyId,
        payoutRequestId: requestId,
        amount: updated.requestedAmount,
        paymentType: 'payout',
        paymentMethod: updated.paymentMethod,
        transactionReference: `PAYOUT-${requestId}`,
        processedBy: updated.paidBy,
        processedAt: new Date(),
        paymentSlipUrl: updated.paymentSlipUrl,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Get payment history
  app.get("/api/owner-payment-history", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only owners can access their payment history
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied. Owner role required." });
      }

      const organizationId = user.organizationId;
      const ownerId = user.id;
      const { propertyId } = req.query;

      const history = await storage.getOwnerPaymentHistory(
        organizationId, 
        ownerId, 
        propertyId ? parseInt(propertyId as string) : undefined
      );
      res.json(history);
    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Get/Update property payout settings
  app.get("/api/property-payout-settings/:propertyId", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin, PM, and property owners can access payout settings
      if (user.role !== 'admin' && user.role !== 'portfolio-manager' && user.role !== 'owner') {
        return res.status(403).json({ message: "Access denied." });
      }

      const organizationId = user.organizationId;
      const propertyId = parseInt(req.params.propertyId);

      const settings = await storage.getPropertyPayoutSettings(organizationId, propertyId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching property payout settings:", error);
      res.status(500).json({ message: "Failed to fetch property payout settings" });
    }
  });

  app.put("/api/property-payout-settings/:propertyId", async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Only admin and portfolio managers can update payout settings
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied. Admin or portfolio manager role required." });
      }

      const organizationId = user.organizationId;
      const propertyId = parseInt(req.params.propertyId);
      const { payoutFrequency, minimumPayoutAmount, autoPayoutEnabled, payoutDay } = req.body;

      const settings = await storage.updatePropertyPayoutSettings({
        organizationId,
        propertyId,
        payoutFrequency,
        minimumPayoutAmount,
        autoPayoutEnabled,
        payoutDay,
        updatedAt: new Date(),
      });

      res.json(settings);
    } catch (error) {
      console.error("Error updating property payout settings:", error);
      res.status(500).json({ message: "Failed to update property payout settings" });
    }
  });

  // === COMPREHENSIVE INVOICE GENERATOR SYSTEM ===
  
  // Get all invoices
  app.get("/api/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "demo-org";
      const invoices = await storage.getInvoices(organizationId);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Create new invoice with line items
  app.post("/api/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "demo-org";
      const createdBy = req.user?.id || req.user?.sub || "demo-user";
      
      const { lineItems, ...invoiceData } = req.body;
      
      // Calculate totals
      const subtotal = lineItems.reduce((sum: number, item: any) => {
        return sum + (parseFloat(item.quantity || "0") * parseFloat(item.unitPrice || "0"));
      }, 0);
      
      const taxRate = parseFloat(invoiceData.taxRate || "0") / 100;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      const invoice = await storage.createInvoice({
        ...invoiceData,
        organizationId,
        createdBy,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      }, lineItems || []);
      
      res.json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  // Send invoice via email
  app.post("/api/invoices/:id/send", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "demo-org";
      const invoiceId = parseInt(req.params.id);
      
      const invoice = await storage.getInvoice(invoiceId, organizationId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Update invoice status to sent
      await storage.updateInvoice(invoiceId, organizationId, { status: "sent" });

      // Create delivery log entry
      await storage.createInvoiceDeliveryLog({
        invoiceId,
        recipientEmail: req.body.recipientEmail || invoice.toName + "@example.com",
        deliveryProvider: "sendgrid",
        deliveryStatus: "delivered", // Simulate successful delivery
        metadata: { subject: `Invoice ${invoice.invoiceNumber}`, from: "billing@hostpilotpro.com" },
      });

      res.json({ message: "Invoice sent successfully" });
    } catch (error) {
      console.error("Error sending invoice:", error);
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });

  // Delete invoice (draft only)
  app.delete("/api/invoices/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "demo-org";
      const invoiceId = parseInt(req.params.id);
      
      const invoice = await storage.getInvoice(invoiceId, organizationId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (invoice.status !== "draft") {
        return res.status(400).json({ message: "Only draft invoices can be deleted" });
      }
      
      await storage.deleteInvoice(invoiceId, organizationId);
      res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Get invoice templates
  app.get("/api/invoice-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      // Return demo templates for now
      const templates = [
        {
          id: 1,
          name: "Commission Invoice",
          description: "Standard commission invoice template",
          template: "rental_commission",
          defaultItems: [
            { description: "Booking Commission", quantity: "1", unitPrice: "150.00" }
          ]
        },
        {
          id: 2,
          name: "Service Fee",
          description: "Service fee invoice template",
          template: "service_fee",
          defaultItems: [
            { description: "Management Service", quantity: "1", unitPrice: "100.00" }
          ]
        }
      ];
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get delivery logs
  app.get("/api/invoice-delivery-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      // Return demo delivery logs for now
      const logs = [
        {
          id: 1,
          invoiceNumber: "INV-001",
          recipientEmail: "owner@example.com",
          deliveryProvider: "sendgrid",
          deliveryStatus: "delivered",
          sentAt: new Date().toISOString(),
          openedAt: new Date().toISOString(),
          downloadedAt: new Date().toISOString()
        }
      ];
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching delivery logs:", error);
      res.status(500).json({ message: "Failed to fetch delivery logs" });
    }
  });

  // Get invoice analytics
  app.get("/api/invoice-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      // Return demo analytics for now
      const analytics = {
        totalInvoices: 25,
        totalAmount: "12450.00",
        pendingAmount: "3200.00",
        paidAmount: "9250.00"
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== UTILITY TRACKER API ENDPOINTS =====

  // Utility bills CRUD
  app.get("/api/utility-bills", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, type, status, dueDate } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;
      if (dueDate) filters.dueDate = dueDate as string;
      
      const bills = await storage.getUtilityBills(organizationId, filters);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      res.status(500).json({ message: "Failed to fetch utility bills" });
    }
  });

  app.post("/api/utility-bills", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const userData = req.user as any;
      
      const billData = {
        ...req.body,
        organizationId,
        uploadedBy: userData.id,
      };
      
      const bill = await storage.createUtilityBill(billData);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating utility bill:", error);
      res.status(500).json({ message: "Failed to create utility bill" });
    }
  });

  app.put("/api/utility-bills/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const bill = await storage.updateUtilityBill(billId, req.body);
      
      if (!bill) {
        return res.status(404).json({ message: "Utility bill not found" });
      }
      
      res.json(bill);
    } catch (error) {
      console.error("Error updating utility bill:", error);
      res.status(500).json({ message: "Failed to update utility bill" });
    }
  });

  app.delete("/api/utility-bills/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const success = await storage.deleteUtilityBill(billId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting utility bill:", error);
      res.status(500).json({ message: "Failed to delete utility bill" });
    }
  });

  // Utility bill upload with receipt
  app.post("/api/utility-bills/upload-receipt", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = req.body.billId;
      const receiptFile = req.body.receiptFile;
      const userData = req.user as any;
      
      // Update bill with receipt info
      const updatedBill = await storage.uploadUtilityBillReceipt(
        billId, 
        receiptFile, 
        userData.id
      );
      
      if (!updatedBill) {
        return res.status(404).json({ message: "Utility bill not found" });
      }
      
      res.json(updatedBill);
    } catch (error) {
      console.error("Error uploading utility bill receipt:", error);
      res.status(500).json({ message: "Failed to upload utility bill receipt" });
    }
  });

  // Property utility accounts CRUD
  app.get("/api/property-utility-accounts", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, type } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (type) filters.type = type as string;
      
      const accounts = await storage.getPropertyUtilityAccounts(organizationId, filters);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching property utility accounts:", error);
      res.status(500).json({ message: "Failed to fetch property utility accounts" });
    }
  });

  app.post("/api/property-utility-accounts", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      
      const accountData = {
        ...req.body,
        organizationId,
      };
      
      const account = await storage.createPropertyUtilityAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating property utility account:", error);
      res.status(500).json({ message: "Failed to create property utility account" });
    }
  });

  app.put("/api/property-utility-accounts/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const account = await storage.updatePropertyUtilityAccount(accountId, req.body);
      
      if (!account) {
        return res.status(404).json({ message: "Property utility account not found" });
      }
      
      res.json(account);
    } catch (error) {
      console.error("Error updating property utility account:", error);
      res.status(500).json({ message: "Failed to update property utility account" });
    }
  });

  app.delete("/api/property-utility-accounts/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const success = await storage.deletePropertyUtilityAccount(accountId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting property utility account:", error);
      res.status(500).json({ message: "Failed to delete property utility account" });
    }
  });

  // Utility bill reminders
  app.get("/api/utility-bill-reminders", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, type, isActive } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (type) filters.type = type as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      
      const reminders = await storage.getUtilityBillReminders(organizationId, filters);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching utility bill reminders:", error);
      res.status(500).json({ message: "Failed to fetch utility bill reminders" });
    }
  });

  app.post("/api/utility-bill-reminders", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      
      const reminderData = {
        ...req.body,
        organizationId,
      };
      
      const reminder = await storage.createUtilityBillReminder(reminderData);
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating utility bill reminder:", error);
      res.status(500).json({ message: "Failed to create utility bill reminder" });
    }
  });

  // Utility analytics
  app.get("/api/utility-analytics", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { period, propertyId } = req.query;
      
      const analytics = await storage.getUtilityAnalytics(
        organizationId,
        period as string || 'month',
        propertyId ? parseInt(propertyId as string) : undefined
      );
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching utility analytics:", error);
      res.status(500).json({ message: "Failed to fetch utility analytics" });
    }
  });

  // Utility providers (for dropdown data)
  app.get("/api/utility-providers", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { type, country } = req.query;
      
      const providers = await storage.getUtilityProviders(
        organizationId,
        type as string,
        country as string || 'TH'
      );
      
      res.json(providers);
    } catch (error) {
      console.error("Error fetching utility providers:", error);
      res.status(500).json({ message: "Failed to fetch utility providers" });
    }
  });

  // ==================== MEDIA LIBRARY & AGENT SHARING TOOLS ====================

  // Get property media files with optional property filter
  app.get("/api/media/files", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      const files = await storage.getPropertyMediaFiles(organizationId, propertyId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching media files:", error);
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });

  // Create new property media file
  app.post("/api/media/files", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const fileData = {
        ...req.body,
        organizationId,
        uploadedBy: req.user.id,
      };

      const file = await storage.createPropertyMediaFile(fileData);
      res.json(file);
    } catch (error) {
      console.error("Error creating media file:", error);
      res.status(500).json({ message: "Failed to create media file" });
    }
  });

  // Update property media file
  app.put("/api/media/files/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const updateData = req.body;

      // Add approval data if user is admin/PM
      if (["admin", "portfolio-manager"].includes(req.user.role) && updateData.isAgentApproved) {
        updateData.approvedBy = req.user.id;
        updateData.approvedAt = new Date();
      }

      const updated = await storage.updatePropertyMediaFile(fileId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating media file:", error);
      res.status(500).json({ message: "Failed to update media file" });
    }
  });

  // Delete property media file
  app.delete("/api/media/files/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const success = await storage.deletePropertyMediaFile(fileId);
      
      if (success) {
        res.json({ message: "Media file deleted successfully" });
      } else {
        res.status(404).json({ message: "Media file not found" });
      }
    } catch (error) {
      console.error("Error deleting media file:", error);
      res.status(500).json({ message: "Failed to delete media file" });
    }
  });

  // Get agent accessible media (for agents only)
  app.get("/api/media/agent-accessible", isDemoAuthenticated, async (req: any, res) => {
    try {
      if (!["referral-agent", "retail-agent"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const organizationId = req.user.organizationId;
      const files = await storage.getAgentAccessibleMedia(organizationId, req.user.id, req.user.role);
      
      // Log access for tracking
      for (const file of files) {
        await storage.logAgentMediaAccess({
          organizationId,
          mediaFileId: file.id,
          agentId: req.user.id,
          accessType: "view",
          agentRole: req.user.role,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          accessReason: "media_library_browse",
        });
      }

      res.json(files);
    } catch (error) {
      console.error("Error fetching agent accessible media:", error);
      res.status(500).json({ message: "Failed to fetch accessible media" });
    }
  });

  // Download/access specific media file (with analytics tracking)
  app.get("/api/media/access/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const accessType = req.query.type || "view"; // view, download, preview
      
      // Update analytics
      await storage.updateMediaUsageAnalytics(fileId, accessType);

      // Log agent access if user is an agent
      if (["referral-agent", "retail-agent"].includes(req.user.role)) {
        await storage.logAgentMediaAccess({
          organizationId: req.user.organizationId,
          mediaFileId: fileId,
          agentId: req.user.id,
          accessType,
          agentRole: req.user.role,
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          accessReason: req.query.reason || "media_access",
          clientReference: req.query.clientRef,
        });
      }

      res.json({ message: "Access logged successfully" });
    } catch (error) {
      console.error("Error logging media access:", error);
      res.status(500).json({ message: "Failed to log access" });
    }
  });

  // Get media folders
  app.get("/api/media/folders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      const folders = await storage.getMediaFolders(organizationId, propertyId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching media folders:", error);
      res.status(500).json({ message: "Failed to fetch media folders" });
    }
  });

  // Create media folder
  app.post("/api/media/folders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const folderData = {
        ...req.body,
        organizationId,
        createdBy: req.user.id,
      };

      const folder = await storage.createMediaFolder(folderData);
      res.json(folder);
    } catch (error) {
      console.error("Error creating media folder:", error);
      res.status(500).json({ message: "Failed to create media folder" });
    }
  });

  // Update media folder
  app.put("/api/media/folders/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const folderId = parseInt(req.params.id);
      const updateData = req.body;

      const updated = await storage.updateMediaFolder(folderId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating media folder:", error);
      res.status(500).json({ message: "Failed to update media folder" });
    }
  });

  // Get property media settings
  app.get("/api/media/settings/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = parseInt(req.params.propertyId);
      
      const settings = await storage.getPropertyMediaSettings(organizationId, propertyId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching media settings:", error);
      res.status(500).json({ message: "Failed to fetch media settings" });
    }
  });

  // Update property media settings
  app.put("/api/media/settings/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = parseInt(req.params.propertyId);
      const settingsData = req.body;

      const updated = await storage.updatePropertyMediaSettings(organizationId, propertyId, settingsData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating media settings:", error);
      res.status(500).json({ message: "Failed to update media settings" });
    }
  });

  // Get media usage analytics
  app.get("/api/media/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      const analytics = await storage.getMediaUsageAnalytics(organizationId, propertyId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching media analytics:", error);
      res.status(500).json({ message: "Failed to fetch media analytics" });
    }
  });

  // Get agent media access logs (admin/PM only)
  app.get("/api/media/access-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      if (!["admin", "portfolio-manager"].includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const organizationId = req.user.organizationId;
      const mediaFileId = req.query.mediaFileId ? parseInt(req.query.mediaFileId) : undefined;
      
      const logs = await storage.getAgentMediaAccessLogs(organizationId, mediaFileId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching access logs:", error);
      res.status(500).json({ message: "Failed to fetch access logs" });
    }
  });

  // Get AI media suggestions
  app.get("/api/media/ai-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      const suggestions = await storage.getAiMediaSuggestions(organizationId, propertyId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch AI suggestions" });
    }
  });

  // Update AI media suggestion status
  app.put("/api/media/ai-suggestions/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const updateData = {
        ...req.body,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      };

      const updated = await storage.updateAiMediaSuggestion(suggestionId, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating AI suggestion:", error);
      res.status(500).json({ message: "Failed to update AI suggestion" });
    }
  });

  // Get media library stats dashboard
  app.get("/api/media/stats", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const stats = await storage.getMediaLibraryStats(organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching media stats:", error);
      res.status(500).json({ message: "Failed to fetch media stats" });
    }
  });

  // ==================== ENHANCED UTILITY TRACKER ====================

  // Utility accounts endpoints
  app.get("/api/utility-accounts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const accounts = await storage.getUtilityAccounts(organizationId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching utility accounts:", error);
      res.status(500).json({ message: "Failed to fetch utility accounts" });
    }
  });

  app.post("/api/utility-accounts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const accountData = {
        ...req.body,
        organizationId,
        propertyId: parseInt(req.body.propertyId),
        billArrivalDay: parseInt(req.body.billArrivalDay),
      };
      
      const newAccount = await storage.createUtilityAccount(accountData);
      res.json(newAccount);
    } catch (error) {
      console.error("Error creating utility account:", error);
      res.status(500).json({ message: "Failed to create utility account" });
    }
  });

  // Utility bills endpoints  
  app.get("/api/utility-bills", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const { propertyId, status, utilityType } = req.query;
      
      const bills = await storage.getUtilityBills(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        status: status as string,
        utilityType: utilityType as string,
      });
      
      res.json(bills);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      res.status(500).json({ message: "Failed to fetch utility bills" });
    }
  });

  app.post("/api/utility-bills", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const { id: userId } = req.user;
      
      const billData = {
        ...req.body,
        organizationId,
        propertyId: parseInt(req.body.propertyId),
        amount: parseFloat(req.body.amount),
        status: "uploaded",
        uploadedBy: userId,
        uploadedAt: new Date(),
      };
      
      const newBill = await storage.createUtilityBill(billData);
      res.json(newBill);
    } catch (error) {
      console.error("Error uploading utility bill:", error);
      res.status(500).json({ message: "Failed to upload utility bill" });
    }
  });

  app.post("/api/utility-bills/:id/confirm-payment", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { paymentDate, paymentMethod, receiptNumber, notes } = req.body;
      
      const updatedBill = await storage.confirmUtilityBillPayment(parseInt(id), {
        paymentDate: new Date(paymentDate),
        paymentMethod,
        receiptNumber,
        notes,
        status: "paid",
      });
      
      if (!updatedBill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.json(updatedBill);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Utility reminders endpoint
  app.get("/api/utility-reminders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const reminders = await storage.getUtilityReminders(organizationId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching utility reminders:", error);
      res.status(500).json({ message: "Failed to fetch utility reminders" });
    }
  });

  // Utility statistics endpoint
  app.get("/api/utility-stats", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org-1";
      const stats = await storage.getUtilityStats(organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching utility stats:", error);
      res.status(500).json({ message: "Failed to fetch utility stats" });
    }
  });

  // ==================== PLATFORM-BASED REVENUE ROUTING RULES ====================

  // Platform routing rules endpoints
  app.get("/api/platform-routing-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const rules = await storage.getPlatformRoutingRules(organizationId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching platform routing rules:", error);
      res.status(500).json({ message: "Failed to fetch platform routing rules" });
    }
  });

  app.post("/api/platform-routing-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      // Only allow admin users to create platform rules
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can create platform routing rules" });
      }

      const ruleData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const newRule = await storage.createPlatformRoutingRule(ruleData);

      // Create audit log
      await storage.createRoutingAuditLog({
        organizationId,
        relatedType: 'platform_rule',
        relatedId: newRule.id,
        actionType: 'created',
        newValues: newRule,
        changeReason: 'Platform rule created',
        performedBy: userId,
      });

      res.json(newRule);
    } catch (error) {
      console.error("Error creating platform routing rule:", error);
      res.status(500).json({ message: "Failed to create platform routing rule" });
    }
  });

  app.put("/api/platform-routing-rules/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const { id } = req.params;
      
      // Only allow admin users to update platform rules
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can update platform routing rules" });
      }

      // Get the previous values for audit
      const previousRule = await storage.getPlatformRoutingRule(parseInt(id));
      if (!previousRule) {
        return res.status(404).json({ message: "Platform rule not found" });
      }

      const updatedRule = await storage.updatePlatformRoutingRule(parseInt(id), req.body);
      
      if (!updatedRule) {
        return res.status(404).json({ message: "Platform rule not found" });
      }

      // Create audit log
      await storage.createRoutingAuditLog({
        organizationId,
        relatedType: 'platform_rule',
        relatedId: updatedRule.id,
        actionType: 'updated',
        previousValues: previousRule,
        newValues: updatedRule,
        changeReason: 'Platform rule updated',
        performedBy: userId,
      });

      res.json(updatedRule);
    } catch (error) {
      console.error("Error updating platform routing rule:", error);
      res.status(500).json({ message: "Failed to update platform routing rule" });
    }
  });

  // Property platform rules endpoints
  app.get("/api/property-platform-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, platformRuleId } = req.query;
      
      const rules = await storage.getPropertyPlatformRules(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        platformRuleId: platformRuleId ? parseInt(platformRuleId as string) : undefined,
      });
      
      res.json(rules);
    } catch (error) {
      console.error("Error fetching property platform rules:", error);
      res.status(500).json({ message: "Failed to fetch property platform rules" });
    }
  });

  app.post("/api/property-platform-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      // Only allow admin users to create property rules
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can create property routing rules" });
      }

      const ruleData = {
        ...req.body,
        organizationId,
        setBy: userId,
        propertyId: parseInt(req.body.propertyId),
        platformRuleId: parseInt(req.body.platformRuleId),
      };

      const newRule = await storage.createPropertyPlatformRule(ruleData);

      // Create audit log
      await storage.createRoutingAuditLog({
        organizationId,
        relatedType: 'property_rule',
        relatedId: newRule.id,
        actionType: 'created',
        newValues: newRule,
        changeReason: 'Property-specific routing rule created',
        performedBy: userId,
      });

      res.json(newRule);
    } catch (error) {
      console.error("Error creating property platform rule:", error);
      res.status(500).json({ message: "Failed to create property platform rule" });
    }
  });

  // Booking platform routing endpoints
  app.get("/api/booking-platform-routing", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { bookingId, platformRuleId, routingStatus } = req.query;
      
      const routing = await storage.getBookingPlatformRouting(organizationId, {
        bookingId: bookingId ? parseInt(bookingId as string) : undefined,
        platformRuleId: platformRuleId ? parseInt(platformRuleId as string) : undefined,
        routingStatus: routingStatus as string,
      });
      
      res.json(routing);
    } catch (error) {
      console.error("Error fetching booking platform routing:", error);
      res.status(500).json({ message: "Failed to fetch booking platform routing" });
    }
  });

  app.post("/api/booking-platform-routing", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      // Only allow admin users to create booking overrides
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can create booking routing overrides" });
      }

      // Calculate routing amounts
      const { bookingId, platformRuleId, actualOwnerPercentage, actualManagementPercentage, overrideReason } = req.body;
      
      // Get booking details to calculate amounts
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const totalAmount = parseFloat(booking.totalAmount || '0');
      const platformRule = await storage.getPlatformRoutingRule(parseInt(platformRuleId));
      if (!platformRule) {
        return res.status(404).json({ message: "Platform rule not found" });
      }

      // Calculate amounts
      const ownerPercentage = parseFloat(actualOwnerPercentage);
      const managementPercentage = parseFloat(actualManagementPercentage);
      const platformFeePercentage = parseFloat(platformRule.platformFeePercentage || '0');
      
      const platformFeeAmount = totalAmount * (platformFeePercentage / 100);
      const netAmount = totalAmount - platformFeeAmount;
      const ownerAmount = netAmount * (ownerPercentage / 100);
      const managementAmount = netAmount * (managementPercentage / 100);

      const routingData = {
        organizationId,
        bookingId: parseInt(bookingId),
        platformRuleId: parseInt(platformRuleId),
        actualOwnerPercentage: ownerPercentage.toString(),
        actualManagementPercentage: managementPercentage.toString(),
        actualRoutingType: req.body.actualRoutingType,
        totalBookingAmount: totalAmount.toString(),
        ownerAmount: ownerAmount.toString(),
        managementAmount: managementAmount.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        overrideReason,
        isOverride: true,
        routingStatus: 'pending',
        createdBy: userId,
      };

      const newRouting = await storage.createBookingPlatformRouting(routingData);

      // Create audit log
      await storage.createRoutingAuditLog({
        organizationId,
        relatedType: 'booking_routing',
        relatedId: newRouting.id,
        actionType: 'override_applied',
        newValues: newRouting,
        changeReason: overrideReason,
        impactedBookings: 1,
        financialImpact: totalAmount.toString(),
        performedBy: userId,
      });

      res.json(newRouting);
    } catch (error) {
      console.error("Error creating booking platform routing:", error);
      res.status(500).json({ message: "Failed to create booking platform routing" });
    }
  });

  app.patch("/api/booking-platform-routing/:id/process", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const { id } = req.params;
      
      // Only allow admin users to process routing
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can process routing" });
      }

      const processed = await storage.processBookingRouting(parseInt(id), userId);
      
      if (!processed) {
        return res.status(404).json({ message: "Booking routing not found" });
      }

      // Create audit log
      await storage.createRoutingAuditLog({
        organizationId,
        relatedType: 'booking_routing',
        relatedId: processed.id,
        actionType: 'routing_processed',
        changeReason: 'Routing marked as processed',
        performedBy: userId,
      });

      res.json(processed);
    } catch (error) {
      console.error("Error processing booking routing:", error);
      res.status(500).json({ message: "Failed to process booking routing" });
    }
  });

  // Routing audit logs endpoint
  app.get("/api/routing-audit-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { relatedType, relatedId, actionType, performedBy, fromDate, toDate } = req.query;
      
      const logs = await storage.getRoutingAuditLogs(organizationId, {
        relatedType: relatedType as string,
        relatedId: relatedId ? parseInt(relatedId as string) : undefined,
        actionType: actionType as string,
        performedBy: performedBy as string,
        fromDate: fromDate ? new Date(fromDate as string) : undefined,
        toDate: toDate ? new Date(toDate as string) : undefined,
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching routing audit logs:", error);
      res.status(500).json({ message: "Failed to fetch routing audit logs" });
    }
  });

  // Utility endpoint to calculate routing for a booking
  app.post("/api/calculate-booking-routing", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { bookingId, platformRuleId, totalAmount, overrides } = req.body;
      
      const calculation = await storage.calculateBookingRouting(
        parseInt(bookingId),
        parseInt(platformRuleId),
        parseFloat(totalAmount),
        overrides
      );
      
      res.json(calculation);
    } catch (error) {
      console.error("Error calculating booking routing:", error);
      res.status(500).json({ message: "Failed to calculate booking routing" });
    }
  });

  // Get routing rules for a specific property
  app.get("/api/properties/:propertyId/routing-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      
      const rules = await storage.getRoutingRulesForProperty(parseInt(propertyId));
      
      res.json(rules);
    } catch (error) {
      console.error("Error fetching property routing rules:", error);
      res.status(500).json({ message: "Failed to fetch property routing rules" });
    }
  });

  // ===== INVENTORY & WELCOME PACK TRACKER ROUTES =====

  // Inventory Categories
  app.get("/api/inventory/categories", async (req, res) => {
    try {
      const categories = await storage.getInventoryCategories("demo-org");
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/inventory/categories", async (req, res) => {
    try {
      const data = { ...req.body, organizationId: "demo-org" };
      const category = await storage.createInventoryCategory(data);
      res.json(category);
    } catch (error) {
      console.error("Error creating inventory category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/inventory/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.updateInventoryCategory(id, req.body);
      res.json(category);
    } catch (error) {
      console.error("Error updating inventory category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/inventory/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryCategory(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting inventory category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Inventory Items
  app.get("/api/inventory/items", async (req, res) => {
    try {
      const { categoryId, isActive } = req.query;
      const filters: any = {};
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (isActive !== undefined) filters.isActive = isActive === "true";
      
      const items = await storage.getInventoryItems("demo-org", filters);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post("/api/inventory/items", async (req, res) => {
    try {
      const data = { ...req.body, organizationId: "demo-org" };
      const item = await storage.createInventoryItem(data);
      res.json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/inventory/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.updateInventoryItem(id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/inventory/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInventoryItem(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Property Welcome Pack Configs
  app.get("/api/inventory/property-configs/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const config = await storage.getPropertyWelcomePackConfig("demo-org", propertyId);
      res.json(config);
    } catch (error) {
      console.error("Error fetching property config:", error);
      res.status(500).json({ message: "Failed to fetch property config" });
    }
  });

  app.post("/api/inventory/property-configs", async (req, res) => {
    try {
      const data = { ...req.body, organizationId: "demo-org" };
      const config = await storage.createPropertyWelcomePackConfig(data);
      res.json(config);
    } catch (error) {
      console.error("Error creating property config:", error);
      res.status(500).json({ message: "Failed to create property config" });
    }
  });

  app.put("/api/inventory/property-configs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const config = await storage.updatePropertyWelcomePackConfig(id, req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating property config:", error);
      res.status(500).json({ message: "Failed to update property config" });
    }
  });

  // Inventory Usage Logs
  app.get("/api/inventory/usage-logs", async (req, res) => {
    try {
      const { propertyId, staffMemberId, startDate, endDate, billingRule, isProcessed } = req.query;
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (staffMemberId) filters.staffMemberId = staffMemberId as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (billingRule) filters.billingRule = billingRule as string;
      if (isProcessed !== undefined) filters.isProcessed = isProcessed === "true";
      
      const logs = await storage.getInventoryUsageLogs("demo-org", filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching usage logs:", error);
      res.status(500).json({ message: "Failed to fetch usage logs" });
    }
  });

  app.get("/api/inventory/usage-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.getInventoryUsageLog(id);
      if (!log) {
        return res.status(404).json({ message: "Usage log not found" });
      }
      
      // Get usage items for this log
      const items = await storage.getInventoryUsageItems(id);
      res.json({ ...log, items });
    } catch (error) {
      console.error("Error fetching usage log:", error);
      res.status(500).json({ message: "Failed to fetch usage log" });
    }
  });

  app.post("/api/inventory/usage-logs", async (req, res) => {
    try {
      // Calculate total pack cost based on property bedroom count and default rates
      const property = await storage.getProperty(req.body.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Get or create property config
      let config = await storage.getPropertyWelcomePackConfig("demo-org", req.body.propertyId);
      if (!config) {
        // Create default config
        config = await storage.createPropertyWelcomePackConfig({
          organizationId: "demo-org",
          propertyId: req.body.propertyId,
          oneBrCost: "300.00",
          twoBrCost: "350.00",
          threePlusBrCost: "400.00",
          defaultBillingRule: "owner",
        });
      }

      // Calculate pack cost based on bedrooms
      let packCost = 300; // Default 1BR cost
      if (property.bedrooms >= 3) {
        packCost = parseFloat(config.threePlusBrCost);
      } else if (property.bedrooms === 2) {
        packCost = parseFloat(config.twoBrCost);
      } else {
        packCost = parseFloat(config.oneBrCost);
      }

      const data = {
        ...req.body,
        organizationId: "demo-org",
        totalPackCost: packCost.toString(),
        staffMemberId: "staff@test.com", // Demo staff member
      };
      
      const log = await storage.createInventoryUsageLog(data);

      // Create default usage items based on property type
      const categories = await storage.getInventoryCategories("demo-org");
      const items = await storage.getInventoryItems("demo-org");
      
      const usageItems = items.map((item: any) => ({
        organizationId: "demo-org",
        usageLogId: log.id,
        inventoryItemId: item.id,
        quantityUsed: item.defaultQuantityPerBedroom * property.bedrooms,
        unitCost: item.costPerUnit,
        totalCost: (parseFloat(item.costPerUnit) * item.defaultQuantityPerBedroom * property.bedrooms).toString(),
      }));

      if (usageItems.length > 0) {
        await storage.createInventoryUsageItems(usageItems);
      }

      res.json(log);
    } catch (error) {
      console.error("Error creating usage log:", error);
      res.status(500).json({ message: "Failed to create usage log" });
    }
  });

  app.put("/api/inventory/usage-logs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.updateInventoryUsageLog(id, req.body);
      res.json(log);
    } catch (error) {
      console.error("Error updating usage log:", error);
      res.status(500).json({ message: "Failed to update usage log" });
    }
  });

  app.post("/api/inventory/usage-logs/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.processInventoryUsageLog(id, "admin@test.com");
      res.json(log);
    } catch (error) {
      console.error("Error processing usage log:", error);
      res.status(500).json({ message: "Failed to process usage log" });
    }
  });

  // Stock Levels
  app.get("/api/inventory/stock-levels", async (req, res) => {
    try {
      const { isLowStock, inventoryItemId } = req.query;
      const filters: any = {};
      if (isLowStock !== undefined) filters.isLowStock = isLowStock === "true";
      if (inventoryItemId) filters.inventoryItemId = parseInt(inventoryItemId as string);
      
      const stockLevels = await storage.getInventoryStockLevels("demo-org", filters);
      res.json(stockLevels);
    } catch (error) {
      console.error("Error fetching stock levels:", error);
      res.status(500).json({ message: "Failed to fetch stock levels" });
    }
  });

  app.put("/api/inventory/stock-levels/:inventoryItemId", async (req, res) => {
    try {
      const inventoryItemId = parseInt(req.params.inventoryItemId);
      const data = { ...req.body, organizationId: "demo-org" };
      const stockLevel = await storage.updateInventoryStockLevel(inventoryItemId, data);
      res.json(stockLevel);
    } catch (error) {
      console.error("Error updating stock level:", error);
      res.status(500).json({ message: "Failed to update stock level" });
    }
  });

  // Billing Summaries
  app.get("/api/inventory/billing-summaries", async (req, res) => {
    try {
      const { propertyId, monthYear, isProcessed } = req.query;
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (monthYear) filters.monthYear = monthYear as string;
      if (isProcessed !== undefined) filters.isProcessed = isProcessed === "true";
      
      const summaries = await storage.getWelcomePackBillingSummaries("demo-org", filters);
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching billing summaries:", error);
      res.status(500).json({ message: "Failed to fetch billing summaries" });
    }
  });

  app.post("/api/inventory/billing-summaries", async (req, res) => {
    try {
      const data = { ...req.body, organizationId: "demo-org" };
      const summary = await storage.createWelcomePackBillingSummary(data);
      res.json(summary);
    } catch (error) {
      console.error("Error creating billing summary:", error);
      res.status(500).json({ message: "Failed to create billing summary" });
    }
  });

  app.put("/api/inventory/billing-summaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const summary = await storage.updateWelcomePackBillingSummary(id, req.body);
      res.json(summary);
    } catch (error) {
      console.error("Error updating billing summary:", error);
      res.status(500).json({ message: "Failed to update billing summary" });
    }
  });

  // Analytics & Reports
  app.get("/api/inventory/analytics", async (req, res) => {
    try {
      const { propertyId, startDate, endDate, period } = req.query;
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (period) filters.period = period as string;
      
      const analytics = await storage.getInventoryUsageAnalytics("demo-org", filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get("/api/inventory/reports/usage", async (req, res) => {
    try {
      const { propertyId, staffMemberId, startDate, endDate, billingRule } = req.query;
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (staffMemberId) filters.staffMemberId = staffMemberId as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (billingRule) filters.billingRule = billingRule as string;
      
      const reportData = await storage.getInventoryUsageReportData("demo-org", filters);
      res.json(reportData);
    } catch (error) {
      console.error("Error fetching usage report:", error);
      res.status(500).json({ message: "Failed to fetch usage report" });
    }
  });

  // ===== TASK COMPLETION PHOTO PROOF & PDF ARCHIVE SYSTEM API ENDPOINTS =====

  // Upload task completion photo
  app.post("/api/tasks/:taskId/photos", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const taskId = parseInt(req.params.taskId);
      const { photoUrl, description, category } = req.body;

      if (!photoUrl) {
        return res.status(400).json({ message: "Photo URL is required" });
      }

      const photoData = {
        organizationId,
        taskId,
        photoUrl,
        description: description || '',
        category: category || 'general',
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      const photo = await storage.createTaskCompletionPhoto(photoData);
      res.status(201).json(photo);
    } catch (error) {
      console.error("Error uploading task photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Get task completion photos
  app.get("/api/tasks/:taskId/photos", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const taskId = parseInt(req.params.taskId);

      const photos = await storage.getTaskCompletionPhotos(organizationId, taskId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching task photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete task completion photo
  app.delete("/api/tasks/:taskId/photos/:photoId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const photoId = parseInt(req.params.photoId);

      const deleted = await storage.deleteTaskCompletionPhoto(organizationId, photoId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }

      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting task photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Add task completion note
  app.post("/api/tasks/:taskId/notes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const taskId = parseInt(req.params.taskId);
      const { noteText, noteType } = req.body;

      if (!noteText) {
        return res.status(400).json({ message: "Note text is required" });
      }

      const noteData = {
        organizationId,
        taskId,
        noteText,
        noteType: noteType || 'general',
        addedBy: userId,
        addedAt: new Date(),
      };

      const note = await storage.createTaskCompletionNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error adding task note:", error);
      res.status(500).json({ message: "Failed to add note" });
    }
  });

  // Get task completion notes
  app.get("/api/tasks/:taskId/notes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const taskId = parseInt(req.params.taskId);

      const notes = await storage.getTaskCompletionNotes(organizationId, taskId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching task notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  // Add task completion expense
  app.post("/api/tasks/:taskId/expenses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const taskId = parseInt(req.params.taskId);
      const { description, amount, category, receiptUrl, vendor } = req.body;

      if (!description || !amount) {
        return res.status(400).json({ message: "Description and amount are required" });
      }

      const expenseData = {
        organizationId,
        taskId,
        description,
        amount: parseFloat(amount),
        category: category || 'general',
        receiptUrl,
        vendor,
        addedBy: userId,
        addedAt: new Date(),
      };

      const expense = await storage.createTaskCompletionExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error adding task expense:", error);
      res.status(500).json({ message: "Failed to add expense" });
    }
  });

  // Get task completion expenses
  app.get("/api/tasks/:taskId/expenses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const taskId = parseInt(req.params.taskId);

      const expenses = await storage.getTaskCompletionExpenses(organizationId, taskId);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching task expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Delete task completion expense
  app.delete("/api/tasks/:taskId/expenses/:expenseId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const expenseId = parseInt(req.params.expenseId);

      const deleted = await storage.deleteTaskCompletionExpense(organizationId, expenseId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting task expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Submit task for approval (Staff only)
  app.post("/api/tasks/:taskId/submit-for-approval", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const taskId = parseInt(req.params.taskId);

      // Only staff can submit tasks for approval
      if (role !== 'staff') {
        return res.status(403).json({ message: "Only staff members can submit tasks for approval" });
      }

      const approval = await storage.submitTaskForApproval(taskId, userId, organizationId);
      res.json(approval);
    } catch (error) {
      console.error("Error submitting task for approval:", error);
      res.status(500).json({ message: "Failed to submit task for approval" });
    }
  });

  // Get pending task approvals (PM/Admin only)
  app.get("/api/task-approvals/pending", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Only PM and admin can view pending approvals
      if (role !== 'portfolio-manager' && role !== 'admin') {
        return res.status(403).json({ message: "Only portfolio managers and admins can view task approvals" });
      }

      const pendingApprovals = await storage.getPendingTaskApprovals(organizationId);
      res.json(pendingApprovals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Approve task (PM/Admin only)
  app.post("/api/tasks/:taskId/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const taskId = parseInt(req.params.taskId);
      const { reviewNotes } = req.body;

      // Only PM and admin can approve tasks
      if (role !== 'portfolio-manager' && role !== 'admin') {
        return res.status(403).json({ message: "Only portfolio managers and admins can approve tasks" });
      }

      const approval = await storage.approveTask(organizationId, taskId, userId, reviewNotes);
      res.json(approval);
    } catch (error) {
      console.error("Error approving task:", error);
      res.status(500).json({ message: "Failed to approve task" });
    }
  });

  // Request task redo (PM/Admin only)
  app.post("/api/tasks/:taskId/request-redo", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const taskId = parseInt(req.params.taskId);
      const { reviewNotes } = req.body;

      // Only PM and admin can request redo
      if (role !== 'portfolio-manager' && role !== 'admin') {
        return res.status(403).json({ message: "Only portfolio managers and admins can request task redo" });
      }

      if (!reviewNotes) {
        return res.status(400).json({ message: "Review notes are required for redo requests" });
      }

      const approval = await storage.requestTaskRedo(organizationId, taskId, userId, reviewNotes);
      res.json(approval);
    } catch (error) {
      console.error("Error requesting task redo:", error);
      res.status(500).json({ message: "Failed to request task redo" });
    }
  });

  // Get task with completion details
  app.get("/api/tasks/:taskId/completion-details", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const taskId = parseInt(req.params.taskId);

      const taskDetails = await storage.getTaskWithCompletionDetails(organizationId, taskId);
      
      if (!taskDetails) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(taskDetails);
    } catch (error) {
      console.error("Error fetching task completion details:", error);
      res.status(500).json({ message: "Failed to fetch task details" });
    }
  });

  // Get tasks ready for archive (Admin only)
  app.get("/api/tasks/ready-for-archive", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Only admin can view tasks ready for archive
      if (role !== 'admin') {
        return res.status(403).json({ message: "Only admins can view tasks ready for archive" });
      }

      const tasks = await storage.getTasksReadyForArchive(organizationId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks ready for archive:", error);
      res.status(500).json({ message: "Failed to fetch tasks ready for archive" });
    }
  });

  // Generate PDF archive (Admin only)
  app.post("/api/tasks/generate-pdf-archive", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { taskIds, archiveTitle, archiveDescription } = req.body;

      // Only admin can generate PDF archives
      if (role !== 'admin') {
        return res.status(403).json({ message: "Only admins can generate PDF archives" });
      }

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({ message: "Task IDs array is required" });
      }

      // For demo purposes, we'll simulate PDF generation
      const archiveData = {
        organizationId,
        title: archiveTitle || `Task Archive ${new Date().toISOString().split('T')[0]}`,
        description: archiveDescription || 'Automated 30-day task archive',
        taskCount: taskIds.length,
        generatedBy: userId,
        generatedAt: new Date(),
        archiveStatus: 'completed',
        pdfUrl: `https://demo-storage.com/archives/${Date.now()}.pdf`, // Demo URL
        taskIds: taskIds,
      };

      const archive = await storage.generateTaskPdfArchive(archiveData);

      // Mark tasks as archived
      await storage.markTasksAsArchived(taskIds, archive.id, organizationId);

      // Simulate deleting photos after PDF generation (in production, this would happen after successful upload to Google Drive)
      setTimeout(async () => {
        await storage.deleteArchivedTaskPhotos(taskIds, organizationId);
      }, 5000); // 5-second delay for demo

      res.json(archive);
    } catch (error) {
      console.error("Error generating PDF archive:", error);
      res.status(500).json({ message: "Failed to generate PDF archive" });
    }
  });

  // Get PDF archives
  app.get("/api/task-pdf-archives", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId } = req.query;

      const archives = await storage.getTaskPdfArchives(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(archives);
    } catch (error) {
      console.error("Error fetching PDF archives:", error);
      res.status(500).json({ message: "Failed to fetch PDF archives" });
    }
  });

  // ===== STAFF OVERHOURS & EMERGENCY TASK TRACKER API =====

  // Get staff work hours configuration (Admin/PM only)
  app.get("/api/staff-overhours/work-hours", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { staffId } = req.query;
      const workHours = await storage.getStaffWorkHours(organizationId, staffId);
      res.json(workHours);
    } catch (error) {
      console.error("Error fetching staff work hours:", error);
      res.status(500).json({ message: "Failed to fetch staff work hours" });
    }
  });

  // Create or update staff work hours (Admin/PM only)
  app.post("/api/staff-overhours/work-hours", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const workHoursData = { ...req.body, organizationId };
      const workHours = await storage.createStaffWorkHours(workHoursData);
      res.status(201).json(workHours);
    } catch (error) {
      console.error("Error creating staff work hours:", error);
      res.status(500).json({ message: "Failed to create staff work hours" });
    }
  });

  // Start task timer (Staff only)
  app.post("/api/staff-overhours/start-timer", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, userId } = req.user;
      
      if (role !== 'staff') {
        return res.status(403).json({ message: "Access denied. Staff role required." });
      }

      const timerData = {
        ...req.body,
        organizationId,
        staffId: userId,
        startTime: new Date(),
      };

      const timer = await storage.startTaskTimer(timerData);
      res.status(201).json(timer);
    } catch (error) {
      console.error("Error starting task timer:", error);
      res.status(500).json({ message: "Failed to start task timer" });
    }
  });

  // End task timer (Staff only)
  app.patch("/api/staff-overhours/end-timer/:trackingId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { trackingId } = req.params;
      const { taskNotes } = req.body;
      
      if (role !== 'staff') {
        return res.status(403).json({ message: "Access denied. Staff role required." });
      }

      const updatedTimer = await storage.endTaskTimer(
        parseInt(trackingId),
        new Date(),
        taskNotes
      );

      if (!updatedTimer) {
        return res.status(404).json({ message: "Timer not found" });
      }

      res.json(updatedTimer);
    } catch (error) {
      console.error("Error ending task timer:", error);
      res.status(500).json({ message: "Failed to end task timer" });
    }
  });

  // Mark task as emergency (Admin/PM only)
  app.patch("/api/staff-overhours/mark-emergency/:trackingId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, firstName, lastName } = req.user;
      const { trackingId } = req.params;
      const { emergencyReason } = req.body;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const markedBy = `${firstName} ${lastName}`;
      const updatedTimer = await storage.markTaskAsEmergency(
        parseInt(trackingId),
        emergencyReason,
        markedBy
      );

      if (!updatedTimer) {
        return res.status(404).json({ message: "Timer not found" });
      }

      res.json(updatedTimer);
    } catch (error) {
      console.error("Error marking task as emergency:", error);
      res.status(500).json({ message: "Failed to mark task as emergency" });
    }
  });

  // Get task time tracking records
  app.get("/api/staff-overhours/time-tracking", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, userId } = req.user;
      
      const filters: any = {};
      
      // Staff can only see their own records
      if (role === 'staff') {
        filters.staffId = userId;
      } else if (['admin', 'portfolio-manager'].includes(role)) {
        // Admin/PM can filter by staff member
        if (req.query.staffId) {
          filters.staffId = req.query.staffId;
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      // Apply other filters
      if (req.query.taskId) filters.taskId = parseInt(req.query.taskId);
      if (req.query.status) filters.status = req.query.status;
      if (req.query.fromDate) filters.fromDate = new Date(req.query.fromDate);
      if (req.query.toDate) filters.toDate = new Date(req.query.toDate);
      if (req.query.isOutsideNormalHours !== undefined) {
        filters.isOutsideNormalHours = req.query.isOutsideNormalHours === 'true';
      }
      if (req.query.isEmergencyTask !== undefined) {
        filters.isEmergencyTask = req.query.isEmergencyTask === 'true';
      }

      const timeRecords = await storage.getTaskTimeTracking(organizationId, filters);
      res.json(timeRecords);
    } catch (error) {
      console.error("Error fetching time tracking records:", error);
      res.status(500).json({ message: "Failed to fetch time tracking records" });
    }
  });

  // Get overtime hours summary
  app.get("/api/staff-overhours/overtime-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, userId } = req.user;
      
      const filters: any = {};
      
      // Staff can only see their own summary
      if (role === 'staff') {
        filters.staffId = userId;
      } else if (['admin', 'portfolio-manager'].includes(role)) {
        // Admin/PM can filter by staff member
        if (req.query.staffId) {
          filters.staffId = req.query.staffId;
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (req.query.monthYear) filters.monthYear = req.query.monthYear;
      if (req.query.status) filters.status = req.query.status;

      const summary = await storage.getOvertimeHoursSummary(organizationId, filters);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching overtime summary:", error);
      res.status(500).json({ message: "Failed to fetch overtime summary" });
    }
  });

  // Approve overtime hours (Admin/PM only)
  app.patch("/api/staff-overhours/approve-overtime/:summaryId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, firstName, lastName } = req.user;
      const { summaryId } = req.params;
      const { approvedMinutes } = req.body;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const approvedBy = `${firstName} ${lastName}`;
      const updatedSummary = await storage.approveOvertimeHours(
        parseInt(summaryId),
        approvedBy,
        approvedMinutes
      );

      if (!updatedSummary) {
        return res.status(404).json({ message: "Overtime summary not found" });
      }

      res.json(updatedSummary);
    } catch (error) {
      console.error("Error approving overtime hours:", error);
      res.status(500).json({ message: "Failed to approve overtime hours" });
    }
  });

  // Get staff commission bonuses
  app.get("/api/staff-overhours/commission-bonuses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, userId } = req.user;
      
      const filters: any = {};
      
      // Staff can only see their own bonuses
      if (role === 'staff') {
        filters.staffId = userId;
      } else if (['admin', 'portfolio-manager'].includes(role)) {
        // Admin/PM can filter by staff member
        if (req.query.staffId) {
          filters.staffId = req.query.staffId;
        }
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (req.query.monthYear) filters.monthYear = req.query.monthYear;
      if (req.query.bonusType) filters.bonusType = req.query.bonusType;
      if (req.query.status) filters.status = req.query.status;

      const bonuses = await storage.getStaffCommissionBonuses(organizationId, filters);
      res.json(bonuses);
    } catch (error) {
      console.error("Error fetching commission bonuses:", error);
      res.status(500).json({ message: "Failed to fetch commission bonuses" });
    }
  });

  // Award staff commission bonus (Admin/PM only)
  app.post("/api/staff-overhours/commission-bonuses", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, firstName, lastName } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const awardedBy = `${firstName} ${lastName}`;
      const bonusData = {
        ...req.body,
        organizationId,
        awardedBy,
      };

      const bonus = await storage.createStaffCommissionBonus(bonusData);
      res.status(201).json(bonus);
    } catch (error) {
      console.error("Error creating commission bonus:", error);
      res.status(500).json({ message: "Failed to create commission bonus" });
    }
  });

  // Get emergency task reasons
  app.get("/api/staff-overhours/emergency-reasons", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const reasons = await storage.getEmergencyTaskReasons(organizationId);
      res.json(reasons);
    } catch (error) {
      console.error("Error fetching emergency task reasons:", error);
      res.status(500).json({ message: "Failed to fetch emergency task reasons" });
    }
  });

  // Create emergency task reason (Admin only)
  app.post("/api/staff-overhours/emergency-reasons", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const reasonData = { ...req.body, organizationId };
      const reason = await storage.createEmergencyTaskReason(reasonData);
      res.status(201).json(reason);
    } catch (error) {
      console.error("Error creating emergency task reason:", error);
      res.status(500).json({ message: "Failed to create emergency task reason" });
    }
  });

  // Get staff overtime analytics (Admin/PM only)
  app.get("/api/staff-overhours/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { staffId, fromDate, toDate } = req.query;
      
      const analytics = await storage.getStaffOvertimeAnalytics(
        organizationId,
        staffId,
        fromDate ? new Date(fromDate) : undefined,
        toDate ? new Date(toDate) : undefined
      );
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching overtime analytics:", error);
      res.status(500).json({ message: "Failed to fetch overtime analytics" });
    }
  });

  // ===== TASK ATTACHMENTS & PROPERTY NOTES API ENDPOINTS =====

  // Task attachments routes
  app.get("/api/tasks/:taskId/attachments", isDemoAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const attachments = await storage.getTaskAttachments(taskId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching task attachments:", error);
      res.status(500).json({ message: "Failed to fetch task attachments" });
    }
  });

  app.post("/api/tasks/:taskId/attachments", isDemoAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const user = req.user;
      
      const attachmentData = {
        ...req.body,
        taskId,
        organizationId: user.organizationId,
        uploadedBy: user.id,
        uploadedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const attachment = await storage.createTaskAttachment(attachmentData);
      res.json(attachment);
    } catch (error) {
      console.error("Error creating task attachment:", error);
      res.status(500).json({ message: "Failed to create task attachment" });
    }
  });

  app.put("/api/task-attachments/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attachment = await storage.updateTaskAttachment(id, req.body);
      res.json(attachment);
    } catch (error) {
      console.error("Error updating task attachment:", error);
      res.status(500).json({ message: "Failed to update task attachment" });
    }
  });

  app.delete("/api/task-attachments/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTaskAttachment(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting task attachment:", error);
      res.status(500).json({ message: "Failed to delete task attachment" });
    }
  });

  // Property notes routes
  app.get("/api/properties/:propertyId/notes", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const { noteType, isPinned, department } = req.query;
      
      const filters: any = {};
      if (noteType) filters.noteType = noteType as string;
      if (isPinned !== undefined) filters.isPinned = isPinned === 'true';
      if (department) filters.department = department as string;
      
      const notes = await storage.getPropertyNotes(propertyId, filters);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching property notes:", error);
      res.status(500).json({ message: "Failed to fetch property notes" });
    }
  });

  app.post("/api/properties/:propertyId/notes", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const user = req.user;
      
      const noteData = {
        ...req.body,
        propertyId,
        organizationId: user.organizationId,
        createdBy: user.id,
        createdByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const note = await storage.createPropertyNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Error creating property note:", error);
      res.status(500).json({ message: "Failed to create property note" });
    }
  });

  app.put("/api/property-notes/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const updateData = {
        ...req.body,
        lastModifiedBy: user.id,
        lastModifiedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const note = await storage.updatePropertyNote(id, updateData);
      res.json(note);
    } catch (error) {
      console.error("Error updating property note:", error);
      res.status(500).json({ message: "Failed to update property note" });
    }
  });

  app.delete("/api/property-notes/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePropertyNote(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting property note:", error);
      res.status(500).json({ message: "Failed to delete property note" });
    }
  });

  // Property attachments routes
  app.get("/api/properties/:propertyId/attachments", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const { category, department } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (department) filters.department = department as string;
      
      const attachments = await storage.getPropertyAttachments(propertyId, filters);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching property attachments:", error);
      res.status(500).json({ message: "Failed to fetch property attachments" });
    }
  });

  app.post("/api/properties/:propertyId/attachments", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const user = req.user;
      
      const attachmentData = {
        ...req.body,
        propertyId,
        organizationId: user.organizationId,
        uploadedBy: user.id,
        uploadedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const attachment = await storage.createPropertyAttachment(attachmentData);
      res.json(attachment);
    } catch (error) {
      console.error("Error creating property attachment:", error);
      res.status(500).json({ message: "Failed to create property attachment" });
    }
  });

  app.put("/api/property-attachments/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const attachment = await storage.updatePropertyAttachment(id, req.body);
      res.json(attachment);
    } catch (error) {
      console.error("Error updating property attachment:", error);
      res.status(500).json({ message: "Failed to update property attachment" });
    }
  });

  app.delete("/api/property-attachments/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePropertyAttachment(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting property attachment:", error);
      res.status(500).json({ message: "Failed to delete property attachment" });
    }
  });

  // Task guide templates routes
  app.get("/api/task-guide-templates", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { category, guideType } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (guideType) filters.guideType = guideType as string;
      
      const templates = await storage.getTaskGuideTemplates(user.organizationId, filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching task guide templates:", error);
      res.status(500).json({ message: "Failed to fetch task guide templates" });
    }
  });

  app.post("/api/task-guide-templates", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      const templateData = {
        ...req.body,
        organizationId: user.organizationId,
        createdBy: user.id,
        createdByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const template = await storage.createTaskGuideTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating task guide template:", error);
      res.status(500).json({ message: "Failed to create task guide template" });
    }
  });

  app.put("/api/task-guide-templates/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      const updateData = {
        ...req.body,
        lastModifiedBy: user.id,
        lastModifiedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const template = await storage.updateTaskGuideTemplate(id, updateData);
      res.json(template);
    } catch (error) {
      console.error("Error updating task guide template:", error);
      res.status(500).json({ message: "Failed to update task guide template" });
    }
  });

  app.delete("/api/task-guide-templates/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTaskGuideTemplate(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting task guide template:", error);
      res.status(500).json({ message: "Failed to delete task guide template" });
    }
  });

  // Attachment access logging
  app.post("/api/attachment-access-log", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      
      const logData = {
        ...req.body,
        organizationId: user.organizationId,
        accessedBy: user.id,
        accessedByName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email || 'Unknown User',
      };
      
      const log = await storage.logAttachmentAccess(logData);
      res.json(log);
    } catch (error) {
      console.error("Error logging attachment access:", error);
      res.status(500).json({ message: "Failed to log attachment access" });
    }
  });

  app.get("/api/attachment-access-logs", isDemoAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const { attachmentId, attachmentType, accessedBy } = req.query;
      
      const filters: any = {};
      if (attachmentId) filters.attachmentId = parseInt(attachmentId as string);
      if (attachmentType) filters.attachmentType = attachmentType as string;
      if (accessedBy) filters.accessedBy = accessedBy as string;
      
      const logs = await storage.getAttachmentAccessLogs(user.organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching attachment access logs:", error);
      res.status(500).json({ message: "Failed to fetch attachment access logs" });
    }
  });

  // ===== ADD-ON SERVICES BOOKING ENGINE ROUTES =====

  // Service Categories
  app.get("/api/addon-services/categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const categories = await storage.getServiceCategories(user.organizationId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  app.post("/api/addon-services/categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const categoryData = { ...req.body, organizationId: user.organizationId };
      const category = await storage.createServiceCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating service category:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });

  app.put("/api/addon-services/categories/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const category = await storage.updateServiceCategory(id, updates);
      res.json(category);
    } catch (error) {
      console.error("Error updating service category:", error);
      res.status(500).json({ message: "Failed to update service category" });
    }
  });

  app.delete("/api/addon-services/categories/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteServiceCategory(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting service category:", error);
      res.status(500).json({ message: "Failed to delete service category" });
    }
  });

  // Add-on Services
  app.get("/api/addon-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { categoryId, isActive } = req.query;
      
      const filters: any = {};
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const services = await storage.getAddonServices(user.organizationId, filters);
      res.json(services);
    } catch (error) {
      console.error("Error fetching addon services:", error);
      res.status(500).json({ message: "Failed to fetch addon services" });
    }
  });

  app.get("/api/addon-services/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getAddonService(id);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(service);
    } catch (error) {
      console.error("Error fetching addon service:", error);
      res.status(500).json({ message: "Failed to fetch addon service" });
    }
  });

  app.post("/api/addon-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const serviceData = { ...req.body, organizationId: user.organizationId };
      const service = await storage.createAddonService(serviceData);
      res.json(service);
    } catch (error) {
      console.error("Error creating addon service:", error);
      res.status(500).json({ message: "Failed to create addon service" });
    }
  });

  app.put("/api/addon-services/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const service = await storage.updateAddonService(id, updates);
      res.json(service);
    } catch (error) {
      console.error("Error updating addon service:", error);
      res.status(500).json({ message: "Failed to update addon service" });
    }
  });

  app.delete("/api/addon-services/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteAddonService(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting addon service:", error);
      res.status(500).json({ message: "Failed to delete addon service" });
    }
  });

  // Service Bookings
  app.get("/api/addon-services/bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const { propertyId, status, paymentRoute } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (status) filters.status = status as string;
      if (paymentRoute) filters.paymentRoute = paymentRoute as string;

      const bookings = await storage.getServiceBookings(user.organizationId, filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  app.get("/api/addon-services/bookings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getServiceBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching service booking:", error);
      res.status(500).json({ message: "Failed to fetch service booking" });
    }
  });

  app.post("/api/addon-services/bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const bookingData = { 
        ...req.body, 
        organizationId: user.organizationId,
        createdBy: user.id
      };
      
      const booking = await storage.createServiceBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  app.put("/api/addon-services/bookings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const id = parseInt(req.params.id);
      const updates = { ...req.body, updatedBy: user.id };
      
      const booking = await storage.updateServiceBooking(id, updates);
      res.json(booking);
    } catch (error) {
      console.error("Error updating service booking:", error);
      res.status(500).json({ message: "Failed to update service booking" });
    }
  });

  app.delete("/api/addon-services/bookings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const id = parseInt(req.params.id);
      const success = await storage.deleteServiceBooking(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting service booking:", error);
      res.status(500).json({ message: "Failed to delete service booking" });
    }
  });

  // Property Service Pricing
  app.get("/api/addon-services/pricing/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const { serviceId } = req.query;
      
      const pricing = await storage.getPropertyServicePricing(
        propertyId, 
        serviceId ? parseInt(serviceId as string) : undefined
      );
      res.json(pricing);
    } catch (error) {
      console.error("Error fetching property service pricing:", error);
      res.status(500).json({ message: "Failed to fetch property service pricing" });
    }
  });

  app.post("/api/addon-services/pricing", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const pricingData = { ...req.body, organizationId: user.organizationId };
      const pricing = await storage.createPropertyServicePricing(pricingData);
      res.json(pricing);
    } catch (error) {
      console.error("Error creating property service pricing:", error);
      res.status(500).json({ message: "Failed to create property service pricing" });
    }
  });

  // Service Availability
  app.get("/api/addon-services/availability/:serviceId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const serviceId = parseInt(req.params.serviceId);
      const availability = await storage.getServiceAvailability(serviceId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching service availability:", error);
      res.status(500).json({ message: "Failed to fetch service availability" });
    }
  });

  app.post("/api/addon-services/availability", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!['admin', 'portfolio-manager'].includes(user.role)) {
        return res.status(403).json({ message: "Unauthorized: Admin/PM access required" });
      }

      const availabilityData = { ...req.body, organizationId: user.organizationId };
      const availability = await storage.createServiceAvailability(availabilityData);
      res.json(availability);
    } catch (error) {
      console.error("Error creating service availability:", error);
      res.status(500).json({ message: "Failed to create service availability" });
    }
  });

  // ===== STAFF CLOCK-IN & OVERTIME TRACKER API =====

  // Clock in
  app.post("/api/staff/clock-in", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      // Check if already clocked in
      const activeClock = await storage.getActiveClock(organizationId, userId);
      if (activeClock) {
        return res.status(400).json({ message: "Already clocked in" });
      }

      const clockData = {
        organizationId,
        userId,
        clockInTime: new Date(),
        clockType: req.body.clockType || 'workday',
        propertyId: req.body.propertyId ? parseInt(req.body.propertyId) : null,
        taskId: req.body.taskId ? parseInt(req.body.taskId) : null,
        clockInNotes: req.body.clockInNotes,
        isEmergencyVisit: req.body.isEmergencyVisit || false,
        isAfterHours: req.body.isAfterHours || false,
        gpsLocation: req.body.gpsLocation,
      };

      const clock = await storage.clockIn(clockData);

      // Create audit log
      await storage.createStaffClockAuditLog({
        organizationId,
        actionType: 'clock_in',
        performedBy: userId,
        affectedUserId: userId,
        clockRecordId: clock.id,
        actionDetails: JSON.stringify({
          clockType: clockData.clockType,
          isEmergency: clockData.isEmergencyVisit,
          isAfterHours: clockData.isAfterHours,
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(clock);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  // Clock out
  app.post("/api/staff/clock-out", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const { clockOutNotes } = req.body;

      const clock = await storage.clockOut(organizationId, userId, clockOutNotes);
      
      if (!clock) {
        return res.status(400).json({ message: "No active clock session found" });
      }

      // Create audit log
      await storage.createStaffClockAuditLog({
        organizationId,
        actionType: 'clock_out',
        performedBy: userId,
        affectedUserId: userId,
        clockRecordId: clock.id,
        actionDetails: JSON.stringify({
          duration: clock.clockOutTime && clock.clockInTime ? 
            (new Date(clock.clockOutTime).getTime() - new Date(clock.clockInTime).getTime()) / (1000 * 60 * 60) : 0,
          notes: clockOutNotes,
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(clock);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Get active clock session
  app.get("/api/staff/active-clock", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (role !== 'staff') {
        return res.status(403).json({ message: "Staff access required" });
      }

      const activeClock = await storage.getActiveClock(organizationId, userId);
      res.json(activeClock || null);
    } catch (error) {
      console.error("Error fetching active clock:", error);
      res.status(500).json({ message: "Failed to fetch active clock" });
    }
  });

  // Get staff clock history
  app.get("/api/staff/clock-history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['staff', 'admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { startDate, endDate, clockType, targetUserId } = req.query;

      // Staff can only view their own history, admin/PM can view others
      const filterUserId = role === 'staff' ? userId : (targetUserId as string || userId);

      const history = await storage.getStaffClockHistory(organizationId, {
        userId: filterUserId,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        clockType: clockType as string,
      });

      res.json(history);
    } catch (error) {
      console.error("Error fetching clock history:", error);
      res.status(500).json({ message: "Failed to fetch clock history" });
    }
  });

  // Get staff clock settings
  app.get("/api/staff/clock-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const settings = await storage.getStaffClockSettings(organizationId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching clock settings:", error);
      res.status(500).json({ message: "Failed to fetch clock settings" });
    }
  });

  // Update staff clock settings
  app.put("/api/staff/clock-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const settings = await storage.updateStaffClockSettings(organizationId, req.body);

      // Create audit log
      await storage.createStaffClockAuditLog({
        organizationId,
        actionType: 'settings_update',
        performedBy: userId,
        affectedUserId: 'system',
        actionDetails: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(settings);
    } catch (error) {
      console.error("Error updating clock settings:", error);
      res.status(500).json({ message: "Failed to update clock settings" });
    }
  });

  // Get staff time summaries
  app.get("/api/staff/time-summaries", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['staff', 'admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { periodType, periodStart, periodEnd, targetUserId } = req.query;

      // Staff can only view their own summaries, admin/PM can view others
      const filterUserId = role === 'staff' ? userId : (targetUserId as string || userId);

      const summaries = await storage.getStaffTimeSummaries(organizationId, {
        userId: filterUserId,
        periodType: periodType as string,
        periodStart: periodStart ? new Date(periodStart as string) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd as string) : undefined,
      });

      res.json(summaries);
    } catch (error) {
      console.error("Error fetching time summaries:", error);
      res.status(500).json({ message: "Failed to fetch time summaries" });
    }
  });

  // Calculate overtime for period
  app.get("/api/staff/overtime-calculation", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['staff', 'admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { startDate, endDate, targetUserId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      // Staff can only view their own calculations, admin/PM can view others
      const filterUserId = role === 'staff' ? userId : (targetUserId as string || userId);

      const calculation = await storage.calculateOvertimeForPeriod(
        organizationId,
        filterUserId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(calculation);
    } catch (error) {
      console.error("Error calculating overtime:", error);
      res.status(500).json({ message: "Failed to calculate overtime" });
    }
  });

  // Generate staff time report (admin/PM only)
  app.get("/api/staff/time-report", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const { startDate, endDate, format, userId: targetUserId } = req.query;

      const report = await storage.generateStaffTimeReport(organizationId, {
        userId: targetUserId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        format: format as 'weekly' | 'monthly',
      });

      res.json(report);
    } catch (error) {
      console.error("Error generating time report:", error);
      res.status(500).json({ message: "Failed to generate time report" });
    }
  });

  // Export time report as CSV (admin/PM only)
  app.get("/api/staff/time-report/export", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or Portfolio Manager access required" });
      }

      const { startDate, endDate, format, userId: targetUserId } = req.query;

      const report = await storage.generateStaffTimeReport(organizationId, {
        userId: targetUserId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        format: format as 'weekly' | 'monthly',
      });

      // Convert to CSV format
      let csvContent = 'User ID,User Name,Regular Hours,Overtime Hours,Total Hours,Emergency Visits,After Hours Total,Estimated Pay\n';
      
      report.staffReports.forEach(staff => {
        csvContent += `${staff.userId},${staff.userName},${staff.regularHours},${staff.overtimeHours},${staff.totalHours},${staff.emergencyVisits},${staff.afterHoursTotal},${staff.estimatedPay}\n`;
      });

      csvContent += `\nTotals:,,${report.totalRegularHours},${report.totalOvertimeHours},,,,${report.totalEstimatedPay}\n`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="staff-time-report-${report.reportPeriod}.csv"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting time report:", error);
      res.status(500).json({ message: "Failed to export time report" });
    }
  });

  // Get audit logs (admin only)
  app.get("/api/staff/clock-audit-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { actionType, performedBy, affectedUserId, startDate, endDate } = req.query;

      const logs = await storage.getStaffClockAuditLogs(organizationId, {
        actionType: actionType as string,
        performedBy: performedBy as string,
        affectedUserId: affectedUserId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Manual clock override (admin only)
  app.post("/api/staff/manual-override", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: adminUserId } = req.user;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { userId, action, clockData, reason } = req.body;

      let result;
      if (action === 'force_clock_out') {
        result = await storage.clockOut(organizationId, userId, `Admin override: ${reason}`);
      } else if (action === 'manual_clock_in') {
        result = await storage.clockIn({
          organizationId,
          userId,
          clockInTime: new Date(clockData.clockInTime),
          clockType: clockData.clockType || 'workday',
          propertyId: clockData.propertyId,
          taskId: clockData.taskId,
          clockInNotes: `Admin manual entry: ${reason}`,
          isEmergencyVisit: clockData.isEmergencyVisit || false,
          isAfterHours: clockData.isAfterHours || false,
        });
      }

      // Create audit log
      await storage.createStaffClockAuditLog({
        organizationId,
        actionType: 'manual_override',
        performedBy: adminUserId,
        affectedUserId: userId,
        clockRecordId: result?.id,
        actionDetails: JSON.stringify({
          action,
          reason,
          originalData: clockData,
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ success: true, result, message: `Override completed: ${action}` });
    } catch (error) {
      console.error("Error performing manual override:", error);
      res.status(500).json({ message: "Failed to perform manual override" });
    }
  });

  // ==================== MAINTENANCE SUGGESTIONS & APPROVAL FLOW ====================

  // Maintenance suggestions CRUD operations
  app.get("/api/maintenance-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, status, submittedBy } = req.query;
      
      const suggestions = await storage.getMaintenanceSuggestions(organizationId, {
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        status: status as string,
        submittedBy: submittedBy as string,
      });
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching maintenance suggestions:", error);
      res.status(500).json({ message: "Failed to fetch maintenance suggestions" });
    }
  });

  app.get("/api/maintenance-suggestions/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const suggestion = await storage.getMaintenanceSuggestion(id);
      
      if (!suggestion) {
        return res.status(404).json({ message: "Maintenance suggestion not found" });
      }
      
      res.json(suggestion);
    } catch (error) {
      console.error("Error fetching maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to fetch maintenance suggestion" });
    }
  });

  app.post("/api/maintenance-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Only admin and PM can create suggestions
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admin and portfolio managers can create maintenance suggestions" });
      }

      const suggestion = await storage.createMaintenanceSuggestion({
        organizationId,
        submittedBy: user.id,
        submittedByRole: user.role,
        ...req.body,
      });

      // Create timeline entry
      await storage.createMaintenanceTimelineEntry({
        organizationId,
        suggestionId: suggestion.id,
        actionType: 'created',
        actionBy: user.id,
        actionByRole: user.role,
        description: `Maintenance suggestion created: ${req.body.title}`,
      });

      res.json(suggestion);
    } catch (error) {
      console.error("Error creating maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to create maintenance suggestion" });
    }
  });

  app.put("/api/maintenance-suggestions/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only admin and PM can update suggestions
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Only admin and portfolio managers can update maintenance suggestions" });
      }

      const updated = await storage.updateMaintenanceSuggestion(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Maintenance suggestion not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to update maintenance suggestion" });
    }
  });

  app.delete("/api/maintenance-suggestions/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      
      // Only admin can delete suggestions
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Only admin can delete maintenance suggestions" });
      }

      const success = await storage.deleteMaintenanceSuggestion(id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to delete maintenance suggestion" });
    }
  });

  // Owner approval workflow
  app.post("/api/maintenance-suggestions/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { comments } = req.body;
      
      // Only owners can approve suggestions
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can approve maintenance suggestions" });
      }

      const approved = await storage.approveMaintenanceSuggestion(id, user.id, comments);
      
      if (!approved) {
        return res.status(404).json({ message: "Maintenance suggestion not found" });
      }

      // Create timeline entry
      await storage.createMaintenanceTimelineEntry({
        organizationId: "demo-org",
        suggestionId: id,
        actionType: 'approved',
        actionBy: user.id,
        actionByRole: user.role,
        description: `Owner approved maintenance suggestion${comments ? ': ' + comments : ''}`,
      });

      // TODO: Auto-create task if approved
      
      res.json(approved);
    } catch (error) {
      console.error("Error approving maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to approve maintenance suggestion" });
    }
  });

  app.post("/api/maintenance-suggestions/:id/decline", isDemoAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user;
      const { comments } = req.body;
      
      // Only owners can decline suggestions
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Only owners can decline maintenance suggestions" });
      }

      const declined = await storage.declineMaintenanceSuggestion(id, user.id, comments);
      
      if (!declined) {
        return res.status(404).json({ message: "Maintenance suggestion not found" });
      }

      // Create timeline entry
      await storage.createMaintenanceTimelineEntry({
        organizationId: "demo-org",
        suggestionId: id,
        actionType: 'declined',
        actionBy: user.id,
        actionByRole: user.role,
        description: `Owner declined maintenance suggestion${comments ? ': ' + comments : ''}`,
      });

      res.json(declined);
    } catch (error) {
      console.error("Error declining maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to decline maintenance suggestion" });
    }
  });

  // Owner-specific endpoints for dashboard
  app.get("/api/owner/maintenance-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const suggestions = await storage.getOwnerMaintenanceSuggestions(organizationId, user.id);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching owner maintenance suggestions:", error);
      res.status(500).json({ message: "Failed to fetch owner maintenance suggestions" });
    }
  });

  app.get("/api/owner/pending-approvals", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (user.role !== 'owner') {
        return res.status(403).json({ message: "Owner access required" });
      }

      const pending = await storage.getPendingOwnerApprovals(organizationId, user.id);
      res.json(pending);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Approval logs
  app.get("/api/maintenance-approval-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const { suggestionId } = req.query;
      
      const logs = await storage.getMaintenanceApprovalLogs(
        organizationId,
        suggestionId ? parseInt(suggestionId as string) : undefined
      );
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching approval logs:", error);
      res.status(500).json({ message: "Failed to fetch approval logs" });
    }
  });

  // Settings management
  app.get("/api/maintenance-suggestion-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const settings = await storage.getMaintenanceSuggestionSettings(organizationId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/maintenance-suggestion-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Only admin can update settings
      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Only admin can update settings" });
      }

      const settings = await storage.updateMaintenanceSuggestionSettings(organizationId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // ===== ADD-ON SERVICES ENGINE API ENDPOINTS =====

  // Service categories
  app.get("/api/addon-service-categories", isDemoAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getAddonServiceCategories("default");
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  app.post("/api/addon-service-categories", isDemoAuthenticated, async (req, res) => {
    try {
      const category = await storage.createAddonServiceCategory({
        ...req.body,
        organizationId: "default",
      });
      res.json(category);
    } catch (error: any) {
      console.error("Error creating service category:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });

  // Service catalog
  app.get("/api/addon-service-catalog", isDemoAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      const filters: any = {};
      if (category && category !== "all") {
        filters.category = category as string;
      }
      
      const services = await storage.getAddonServiceCatalog("default", filters);
      res.json(services);
    } catch (error: any) {
      console.error("Error fetching service catalog:", error);
      res.status(500).json({ message: "Failed to fetch service catalog" });
    }
  });

  app.post("/api/addon-service-catalog", isDemoAuthenticated, async (req, res) => {
    try {
      const service = await storage.createAddonServiceCatalogItem({
        ...req.body,
        organizationId: "default",
      });
      res.json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/addon-service-catalog/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.updateAddonServiceCatalogItem(id, req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  // Service bookings
  app.get("/api/addon-service-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const { status, billingRule, category, dateFrom, dateTo, propertyId } = req.query;
      const filters: any = {};
      
      if (status && status !== "all") filters.status = status as string;
      if (billingRule && billingRule !== "all") filters.billingRule = billingRule as string;
      if (category && category !== "all") filters.category = category as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      
      const bookings = await storage.getAddonServiceBookings("default", filters);
      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  app.post("/api/addon-service-bookings", isDemoAuthenticated, async (req, res) => {
    try {
      const booking = await storage.createAddonServiceBooking({
        ...req.body,
        organizationId: "default",
      });
      
      // Create commission record if there's a commission amount
      if (booking.commissionAmount && parseFloat(booking.commissionAmount) > 0) {
        await storage.createAddonServiceCommission({
          organizationId: "default",
          bookingId: booking.id,
          serviceId: booking.serviceId,
          category: req.body.category || "general",
          staffId: booking.bookedBy,
          commissionAmount: booking.commissionAmount,
          commissionRate: req.body.commissionRate || "15.00",
          paymentStatus: "pending",
          notes: `Commission for booking #${booking.id}`,
        });
      }
      
      res.json(booking);
    } catch (error: any) {
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  app.put("/api/addon-service-bookings/:id/confirm", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.confirmAddonServiceBooking(id, req.body.confirmedBy);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      console.error("Error confirming booking:", error);
      res.status(500).json({ message: "Failed to confirm booking" });
    }
  });

  app.put("/api/addon-service-bookings/:id/complete", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.completeAddonServiceBooking(id, new Date(req.body.completedAt), req.body.notes);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error: any) {
      console.error("Error completing booking:", error);
      res.status(500).json({ message: "Failed to complete booking" });
    }
  });

  // Service commissions
  app.get("/api/addon-service-commissions", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, category, paymentStatus, dateFrom, dateTo } = req.query;
      const filters: any = {};
      
      if (staffId) filters.staffId = staffId as string;
      if (category) filters.category = category as string;
      if (paymentStatus) filters.paymentStatus = paymentStatus as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      
      const commissions = await storage.getAddonServiceCommissions("default", filters);
      res.json(commissions);
    } catch (error: any) {
      console.error("Error fetching service commissions:", error);
      res.status(500).json({ message: "Failed to fetch service commissions" });
    }
  });

  app.put("/api/addon-service-commissions/:id/pay", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const commission = await storage.processCommissionPayment(id, new Date(), req.body.paymentMethod || "bank_transfer");
      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }
      res.json(commission);
    } catch (error: any) {
      console.error("Error processing commission payment:", error);
      res.status(500).json({ message: "Failed to process commission payment" });
    }
  });

  // Service reports
  app.get("/api/addon-service-reports", isDemoAuthenticated, async (req, res) => {
    try {
      const { reportMonth, category } = req.query;
      const filters: any = {};
      
      if (reportMonth) filters.reportMonth = reportMonth as string;
      if (category) filters.category = category as string;
      
      const reports = await storage.getAddonServiceReports("default", filters);
      res.json(reports);
    } catch (error: any) {
      console.error("Error fetching service reports:", error);
      res.status(500).json({ message: "Failed to fetch service reports" });
    }
  });

  app.post("/api/addon-service-reports/generate", isDemoAuthenticated, async (req, res) => {
    try {
      const { reportMonth } = req.body;
      const reports = await storage.generateMonthlyServiceReport("default", reportMonth);
      res.json(reports);
    } catch (error: any) {
      console.error("Error generating service report:", error);
      res.status(500).json({ message: "Failed to generate service report" });
    }
  });

  // Service summary analytics
  app.get("/api/addon-service-summary", isDemoAuthenticated, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const summary = await storage.getServiceCategorySummary(
        "default", 
        startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        endDate as string || new Date().toISOString().split('T')[0]
      );
      res.json(summary);
    } catch (error: any) {
      console.error("Error fetching service summary:", error);
      res.status(500).json({ message: "Failed to fetch service summary" });
    }
  });

  // Billing rules
  app.get("/api/addon-billing-rules", isDemoAuthenticated, async (req, res) => {
    try {
      const { category, isActive } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (isActive !== undefined) filters.isActive = isActive === "true";
      
      const rules = await storage.getAddonBillingRules("default", filters);
      res.json(rules);
    } catch (error: any) {
      console.error("Error fetching billing rules:", error);
      res.status(500).json({ message: "Failed to fetch billing rules" });
    }
  });

  app.post("/api/addon-billing-rules", isDemoAuthenticated, async (req, res) => {
    try {
      const rule = await storage.createAddonBillingRule({
        ...req.body,
        organizationId: "default",
      });
      res.json(rule);
    } catch (error: any) {
      console.error("Error creating billing rule:", error);
      res.status(500).json({ message: "Failed to create billing rule" });
    }
  });

  app.put("/api/addon-billing-rules/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.updateAddonBillingRule(id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "Billing rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      console.error("Error updating billing rule:", error);
      res.status(500).json({ message: "Failed to update billing rule" });
    }
  });

  // ===== STAFF ADVANCE SALARY & OVERTIME TRACKER API ENDPOINTS =====

  // Staff overtime sessions
  app.get("/api/staff-overtime-sessions", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, status, dateFrom, dateTo, isEmergency, isAfterHours } = req.query;
      const filters: any = {};
      
      if (staffId) filters.staffId = staffId as string;
      if (status) filters.status = status as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (isEmergency !== undefined) filters.isEmergency = isEmergency === "true";
      if (isAfterHours !== undefined) filters.isAfterHours = isAfterHours === "true";
      
      const sessions = await storage.getStaffOvertimeSessions("default", filters);
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching overtime sessions:", error);
      res.status(500).json({ message: "Failed to fetch overtime sessions" });
    }
  });

  app.post("/api/staff-overtime-sessions", isDemoAuthenticated, async (req, res) => {
    try {
      const session = await storage.createStaffOvertimeSession(req.body);
      res.json(session);
    } catch (error: any) {
      console.error("Error creating overtime session:", error);
      res.status(500).json({ message: "Failed to create overtime session" });
    }
  });

  app.put("/api/staff-overtime-sessions/:id/clock-out", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateStaffOvertimeSession(id, {
        clockOutTime: new Date(req.body.clockOutTime),
      });
      if (!session) {
        return res.status(404).json({ message: "Overtime session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.put("/api/staff-overtime-sessions/:id/approve", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy, compensationType, compensationAmount, adminNotes } = req.body;
      const session = await storage.approveOvertimeSession(
        id, 
        approvedBy, 
        compensationType, 
        compensationAmount, 
        adminNotes
      );
      if (!session) {
        return res.status(404).json({ message: "Overtime session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error("Error approving overtime session:", error);
      res.status(500).json({ message: "Failed to approve overtime session" });
    }
  });

  // Staff advance requests
  app.get("/api/staff-advance-requests", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, status, dateFrom, dateTo, urgencyLevel } = req.query;
      const filters: any = {};
      
      if (staffId) filters.staffId = staffId as string;
      if (status) filters.status = status as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;
      if (urgencyLevel) filters.urgencyLevel = urgencyLevel as string;
      
      const requests = await storage.getStaffAdvanceRequests("default", filters);
      res.json(requests);
    } catch (error: any) {
      console.error("Error fetching advance requests:", error);
      res.status(500).json({ message: "Failed to fetch advance requests" });
    }
  });

  app.post("/api/staff-advance-requests", isDemoAuthenticated, async (req, res) => {
    try {
      const request = await storage.createStaffAdvanceRequest(req.body);
      res.json(request);
    } catch (error: any) {
      console.error("Error creating advance request:", error);
      res.status(500).json({ message: "Failed to create advance request" });
    }
  });

  app.put("/api/staff-advance-requests/:id/approve", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { approvedBy, paymentMethod, deductionStartMonth, adminNotes } = req.body;
      const request = await storage.approveAdvanceRequest(
        id, 
        approvedBy, 
        paymentMethod, 
        deductionStartMonth, 
        adminNotes
      );
      if (!request) {
        return res.status(404).json({ message: "Advance request not found" });
      }
      res.json(request);
    } catch (error: any) {
      console.error("Error approving advance request:", error);
      res.status(500).json({ message: "Failed to approve advance request" });
    }
  });

  app.put("/api/staff-advance-requests/:id/reject", isDemoAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reviewedBy, rejectionReason } = req.body;
      const request = await storage.rejectAdvanceRequest(id, reviewedBy, rejectionReason);
      if (!request) {
        return res.status(404).json({ message: "Advance request not found" });
      }
      res.json(request);
    } catch (error: any) {
      console.error("Error rejecting advance request:", error);
      res.status(500).json({ message: "Failed to reject advance request" });
    }
  });

  // Staff salary deductions
  app.get("/api/staff-salary-deductions", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, deductionMonth, deductionType } = req.query;
      const filters: any = {};
      
      if (staffId) filters.staffId = staffId as string;
      if (deductionMonth) filters.deductionMonth = deductionMonth as string;
      if (deductionType) filters.deductionType = deductionType as string;
      
      const deductions = await storage.getStaffSalaryDeductions("default", filters);
      res.json(deductions);
    } catch (error: any) {
      console.error("Error fetching salary deductions:", error);
      res.status(500).json({ message: "Failed to fetch salary deductions" });
    }
  });

  app.post("/api/staff-salary-deductions", isDemoAuthenticated, async (req, res) => {
    try {
      const deduction = await storage.createStaffSalaryDeduction(req.body);
      res.json(deduction);
    } catch (error: any) {
      console.error("Error creating salary deduction:", error);
      res.status(500).json({ message: "Failed to create salary deduction" });
    }
  });

  // Staff compensation time
  app.get("/api/staff-compensation-time", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, isExpired } = req.query;
      const filters: any = {};
      
      if (staffId) filters.staffId = staffId as string;
      if (isExpired !== undefined) filters.isExpired = isExpired === "true";
      
      const compensationTime = await storage.getStaffCompensationTime("default", filters);
      res.json(compensationTime);
    } catch (error: any) {
      console.error("Error fetching compensation time:", error);
      res.status(500).json({ message: "Failed to fetch compensation time" });
    }
  });

  app.post("/api/staff-compensation-time", isDemoAuthenticated, async (req, res) => {
    try {
      const compensationTime = await storage.createStaffCompensationTime(req.body);
      res.json(compensationTime);
    } catch (error: any) {
      console.error("Error creating compensation time:", error);
      res.status(500).json({ message: "Failed to create compensation time" });
    }
  });

  // Staff monthly summary
  app.get("/api/staff-monthly-summary", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, month } = req.query;
      if (!staffId || !month) {
        return res.status(400).json({ message: "staffId and month are required" });
      }
      
      const summary = await storage.getStaffMonthlySummary("default", staffId as string, month as string);
      if (!summary) {
        return res.status(404).json({ message: "Monthly summary not found" });
      }
      res.json(summary);
    } catch (error: any) {
      console.error("Error fetching monthly summary:", error);
      res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
  });

  app.post("/api/staff-monthly-summary", isDemoAuthenticated, async (req, res) => {
    try {
      const summary = await storage.createStaffMonthlySummary(req.body);
      res.json(summary);
    } catch (error: any) {
      console.error("Error creating monthly summary:", error);
      res.status(500).json({ message: "Failed to create monthly summary" });
    }
  });

  // Staff notification settings
  app.get("/api/staff-notification-settings", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId } = req.query;
      if (!staffId) {
        return res.status(400).json({ message: "staffId is required" });
      }
      
      const settings = await storage.getStaffNotificationSettings("default", staffId as string);
      if (!settings) {
        return res.status(404).json({ message: "Notification settings not found" });
      }
      res.json(settings);
    } catch (error: any) {
      console.error("Error fetching notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.put("/api/staff-notification-settings", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId } = req.body;
      if (!staffId) {
        return res.status(400).json({ message: "staffId is required" });
      }
      
      const settings = await storage.updateStaffNotificationSettings("default", staffId, req.body);
      res.json(settings);
    } catch (error: any) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Generate monthly report
  app.post("/api/staff-monthly-report", isDemoAuthenticated, async (req, res) => {
    try {
      const { staffId, month } = req.body;
      if (!staffId || !month) {
        return res.status(400).json({ message: "staffId and month are required" });
      }
      
      const result = await storage.generateStaffMonthlyReport("default", staffId, month);
      res.json(result);
    } catch (error: any) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ message: "Failed to generate monthly report" });
    }
  });

  // ===== STAFF PROFILE & PAYROLL LOGGING API ROUTES =====

  // Get all staff profiles (admin/PM only)
  app.get("/api/staff-profiles", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== 'admin' && user.role !== 'portfolio-manager')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const organizationId = user.organizationId || "default-org";
      const { department, isActive } = req.query;
      
      const filters: any = {};
      if (department) filters.department = department;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const profiles = await storage.getStaffProfiles(organizationId, filters);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching staff profiles:", error);
      res.status(500).json({ message: "Failed to fetch staff profiles" });
    }
  });

  // Get single staff profile
  app.get("/api/staff-profiles/:staffId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId } = req.params;

      // Staff can only view their own profile, admin/PM can view any
      if (user.role === 'staff' && user.id !== staffId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const profile = await storage.getStaffProfile(organizationId, staffId);
      if (!profile) {
        return res.status(404).json({ message: "Staff profile not found" });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching staff profile:", error);
      res.status(500).json({ message: "Failed to fetch staff profile" });
    }
  });

  // Create staff profile (admin/PM only)
  app.post("/api/staff-profiles", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== 'admin' && user.role !== 'portfolio-manager')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const organizationId = user.organizationId || "default-org";
      const profileData = {
        ...req.body,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const profile = await storage.createStaffProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating staff profile:", error);
      res.status(500).json({ message: "Failed to create staff profile" });
    }
  });

  // Get monthly payroll records
  app.get("/api/payroll-records", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, payrollPeriod, status } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (payrollPeriod) filters.payrollPeriod = payrollPeriod;
      if (status) filters.status = status;

      // Staff can only view their own records
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const records = await storage.getMonthlyPayrollRecords(organizationId, filters);
      res.json(records);
    } catch (error) {
      console.error("Error fetching payroll records:", error);
      res.status(500).json({ message: "Failed to fetch payroll records" });
    }
  });

  // Create monthly payroll record (admin/PM only)
  app.post("/api/payroll-records", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user || (user.role !== 'admin' && user.role !== 'portfolio-manager')) {
        return res.status(403).json({ message: "Access denied" });
      }

      const organizationId = user.organizationId || "default-org";
      const recordData = {
        ...req.body,
        organizationId,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const record = await storage.createMonthlyPayrollRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating payroll record:", error);
      res.status(500).json({ message: "Failed to create payroll record" });
    }
  });

  // Get task performance logs
  app.get("/api/task-performance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, taskId, propertyId } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (taskId) filters.taskId = parseInt(taskId as string);
      if (propertyId) filters.propertyId = parseInt(propertyId as string);

      // Staff can only view their own performance logs
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const logs = await storage.getTaskPerformanceLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching task performance logs:", error);
      res.status(500).json({ message: "Failed to fetch task performance logs" });
    }
  });

  // Get attendance records
  app.get("/api/attendance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, workDate, status } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (workDate) filters.workDate = workDate;
      if (status) filters.status = status;

      // Staff can only view their own attendance
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const records = await storage.getAttendanceRecords(organizationId, filters);
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Create attendance record (clock in/out)
  app.post("/api/attendance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const recordData = {
        ...req.body,
        organizationId,
        staffId: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const record = await storage.createAttendanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating attendance record:", error);
      res.status(500).json({ message: "Failed to create attendance record" });
    }
  });

  // Get leave requests
  app.get("/api/leave-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, status } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (status) filters.status = status;

      // Staff can only view their own leave requests
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const requests = await storage.getLeaveRequests(organizationId, filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // Create leave request
  app.post("/api/leave-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const requestData = {
        ...req.body,
        organizationId,
        staffId: user.id,
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const request = await storage.createLeaveRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  // Get staff commissions
  app.get("/api/staff-commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, payrollPeriod, isPaid } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (payrollPeriod) filters.payrollPeriod = payrollPeriod;
      if (isPaid !== undefined) filters.isPaid = isPaid === 'true';

      // Staff can only view their own commissions
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const commissions = await storage.getStaffCommissions(organizationId, filters);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching staff commissions:", error);
      res.status(500).json({ message: "Failed to fetch staff commissions" });
    }
  });

  // Get pay slips
  app.get("/api/pay-slips", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const organizationId = user.organizationId || "default-org";
      const { staffId, period, status } = req.query;
      
      const filters: any = {};
      if (staffId) filters.staffId = staffId;
      if (period) filters.period = period;
      if (status) filters.status = status;

      // Staff can only view their own pay slips
      if (user.role === 'staff') {
        filters.staffId = user.id;
      }

      const paySlips = await storage.getPaySlips(organizationId, filters);
      res.json(paySlips);
    } catch (error) {
      console.error("Error fetching pay slips:", error);
      res.status(500).json({ message: "Failed to fetch pay slips" });
    }
  });

  // ===== COMMUNICATION SYSTEM ROUTES =====
  
  // Internal Chat Routes

  // Get communication channels
  app.get("/api/communication/channels", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const channels = await storage.getCommunicationChannels(organizationId, userId);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching communication channels:", error);
      res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // Create communication channel (Admin/PM)
  app.post("/api/communication/channels", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { name, description, isPrivate, memberIds } = req.body;
      
      const channelData = {
        organizationId,
        name,
        description,
        isPrivate: isPrivate || false,
        createdBy: userId,
      };

      const channel = await storage.createCommunicationChannel(channelData, memberIds);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating communication channel:", error);
      res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // Get messages for a channel
  app.get("/api/communication/channels/:channelId/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const { channelId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const messages = await storage.getChannelMessages(organizationId, parseInt(channelId), userId, parseInt(limit), parseInt(offset));
      res.json(messages);
    } catch (error) {
      console.error("Error fetching channel messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message to channel
  app.post("/api/communication/channels/:channelId/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const { channelId } = req.params;
      const { content, messageType, attachmentUrl } = req.body;

      const messageData = {
        organizationId,
        channelId: parseInt(channelId),
        senderId: userId,
        content,
        messageType: messageType || 'text',
        attachmentUrl,
      };

      const message = await storage.createInternalMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Owner-PM Communication Routes

  // Get owner-PM conversations
  app.get("/api/communication/owner-pm", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const conversations = await storage.getOwnerPmCommunications(organizationId, userId, role);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching owner-PM communications:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Send owner-PM message
  app.post("/api/communication/owner-pm", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { receiverId, subject, message, priority, attachmentUrl } = req.body;

      const communicationData = {
        organizationId,
        senderId: userId,
        receiverId,
        subject,
        message,
        priority: priority || 'medium',
        senderType: role,
        receiverType: role === 'owner' ? 'portfolio-manager' : 'owner',
        attachmentUrl,
      };

      const communication = await storage.createOwnerPmCommunication(communicationData);
      res.status(201).json(communication);
    } catch (error) {
      console.error("Error sending owner-PM message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Guest Smart Requests Routes

  // Get guest smart requests
  app.get("/api/communication/guest-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { status, priority, propertyId } = req.query;
      
      const filters = {
        status: status,
        priority: priority,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
      };

      const requests = await storage.getGuestSmartRequests(organizationId, filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching guest smart requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Create guest smart request (Guest Portal)
  app.post("/api/communication/guest-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { guestName, guestEmail, propertyId, requestType, subject, description, priority, urgencyLevel } = req.body;

      const requestData = {
        organizationId,
        guestName,
        guestEmail,
        propertyId,
        requestType,
        subject,
        description,
        priority: priority || 'medium',
        urgencyLevel: urgencyLevel || 'normal',
      };

      const request = await storage.createGuestSmartRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating guest smart request:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  // Update guest smart request status (Staff/PM/Admin)
  app.put("/api/communication/guest-requests/:requestId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { requestId } = req.params;
      const { status, response, assignedTo } = req.body;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updateData = {
        status,
        response,
        assignedTo,
        processedBy: userId,
        processedAt: new Date(),
      };

      const request = await storage.updateGuestSmartRequest(organizationId, parseInt(requestId), updateData);
      res.json(request);
    } catch (error) {
      console.error("Error updating guest smart request:", error);
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  // Communication Configuration Routes

  // Get smart request configuration
  app.get("/api/communication/config", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const config = await storage.getSmartRequestConfig(organizationId);
      res.json(config);
    } catch (error) {
      console.error("Error fetching smart request config:", error);
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  // Update smart request configuration (Admin/PM)
  app.put("/api/communication/config", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { autoResponseEnabled, responseTimeHours, escalationRules, requestCategories } = req.body;
      
      const configData = {
        organizationId,
        autoResponseEnabled,
        responseTimeHours,
        escalationRules,
        requestCategories,
      };

      const config = await storage.updateSmartRequestConfig(configData);
      res.json(config);
    } catch (error) {
      console.error("Error updating smart request config:", error);
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Communication Analytics Routes

  // Get communication analytics
  app.get("/api/communication/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { period = '30d' } = req.query;
      const analytics = await storage.getCommunicationAnalytics(organizationId, period);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching communication analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ===== PROPERTY ACCESS MANAGEMENT API ROUTES =====

  // Get property access credentials
  app.get("/api/property-access/credentials", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId } = req.query;
      
      const credentials = await storage.getPropertyAccessCredentials(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching property access credentials:", error);
      res.status(500).json({ message: "Failed to fetch property access credentials" });
    }
  });

  // Get filtered property access credentials based on user role
  app.get("/api/property-access/credentials/filtered", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const userRole = req.user?.role || 'staff';
      const userId = req.user?.id || '';
      const { propertyId } = req.query;
      
      const credentials = await storage.getFilteredAccessCredentials(
        organizationId, 
        userRole,
        userId,
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(credentials);
    } catch (error) {
      console.error("Error fetching filtered property access credentials:", error);
      res.status(500).json({ message: "Failed to fetch filtered property access credentials" });
    }
  });

  // Get single property access credential
  app.get("/api/property-access/credentials/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const credential = await storage.getPropertyAccessCredential(parseInt(id));
      
      if (!credential) {
        return res.status(404).json({ message: "Property access credential not found" });
      }
      
      res.json(credential);
    } catch (error) {
      console.error("Error fetching property access credential:", error);
      res.status(500).json({ message: "Failed to fetch property access credential" });
    }
  });

  // Create property access credential
  app.post("/api/property-access/credentials", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const userId = req.user?.id || '';
      
      const credentialData = {
        ...req.body,
        organizationId,
        createdBy: userId,
        updatedBy: userId
      };
      
      const newCredential = await storage.createPropertyAccessCredential(credentialData);
      
      // Log the creation
      await storage.createAccessChangeLog({
        credentialId: newCredential.id,
        changeType: 'created',
        changedBy: userId,
        oldValue: null,
        newValue: JSON.stringify(credentialData),
        changeReason: 'Initial creation'
      });
      
      res.status(201).json(newCredential);
    } catch (error) {
      console.error("Error creating property access credential:", error);
      res.status(500).json({ message: "Failed to create property access credential" });
    }
  });

  // Update property access credential
  app.put("/api/property-access/credentials/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';
      
      // Get the old credential for logging
      const oldCredential = await storage.getPropertyAccessCredential(parseInt(id));
      if (!oldCredential) {
        return res.status(404).json({ message: "Property access credential not found" });
      }
      
      const updatedCredential = await storage.updatePropertyAccessCredential(
        parseInt(id), 
        { ...req.body, updatedBy: userId }
      );
      
      if (!updatedCredential) {
        return res.status(404).json({ message: "Property access credential not found" });
      }
      
      // Log the update
      await storage.createAccessChangeLog({
        credentialId: parseInt(id),
        changeType: 'updated',
        changedBy: userId,
        oldValue: JSON.stringify(oldCredential),
        newValue: JSON.stringify(updatedCredential),
        changeReason: req.body.changeReason || 'Manual update'
      });
      
      res.json(updatedCredential);
    } catch (error) {
      console.error("Error updating property access credential:", error);
      res.status(500).json({ message: "Failed to update property access credential" });
    }
  });

  // Delete property access credential
  app.delete("/api/property-access/credentials/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';
      
      // Get the credential for logging
      const credential = await storage.getPropertyAccessCredential(parseInt(id));
      if (!credential) {
        return res.status(404).json({ message: "Property access credential not found" });
      }
      
      const deleted = await storage.deletePropertyAccessCredential(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Property access credential not found" });
      }
      
      // Log the deletion
      await storage.createAccessChangeLog({
        credentialId: parseInt(id),
        changeType: 'deleted',
        changedBy: userId,
        oldValue: JSON.stringify(credential),
        newValue: null,
        changeReason: 'Manual deletion'
      });
      
      res.json({ message: "Property access credential deleted successfully" });
    } catch (error) {
      console.error("Error deleting property access credential:", error);
      res.status(500).json({ message: "Failed to delete property access credential" });
    }
  });

  // Get property access photos
  app.get("/api/property-access/credentials/:id/photos", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const photos = await storage.getPropertyAccessPhotos(parseInt(id));
      res.json(photos);
    } catch (error) {
      console.error("Error fetching property access photos:", error);
      res.status(500).json({ message: "Failed to fetch property access photos" });
    }
  });

  // Create property access photo
  app.post("/api/property-access/credentials/:id/photos", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || '';
      
      const photoData = {
        ...req.body,
        credentialId: parseInt(id),
        uploadedBy: userId
      };
      
      const newPhoto = await storage.createPropertyAccessPhoto(photoData);
      res.status(201).json(newPhoto);
    } catch (error) {
      console.error("Error creating property access photo:", error);
      res.status(500).json({ message: "Failed to create property access photo" });
    }
  });

  // Delete property access photo
  app.delete("/api/property-access/photos/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePropertyAccessPhoto(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Property access photo not found" });
      }
      
      res.json({ message: "Property access photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting property access photo:", error);
      res.status(500).json({ message: "Failed to delete property access photo" });
    }
  });

  // Get access change log
  app.get("/api/property-access/credentials/:id/changelog", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const changeLog = await storage.getAccessChangeLog(parseInt(id));
      res.json(changeLog);
    } catch (error) {
      console.error("Error fetching access change log:", error);
      res.status(500).json({ message: "Failed to fetch access change log" });
    }
  });

  // Get guest access sessions
  app.get("/api/property-access/guest-sessions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { bookingId, credentialId, guestEmail } = req.query;
      
      const filters: any = {};
      if (bookingId) filters.bookingId = parseInt(bookingId);
      if (credentialId) filters.credentialId = parseInt(credentialId);
      if (guestEmail) filters.guestEmail = guestEmail;
      
      const sessions = await storage.getGuestAccessSessions(organizationId, filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching guest access sessions:", error);
      res.status(500).json({ message: "Failed to fetch guest access sessions" });
    }
  });

  // Create guest access session
  app.post("/api/property-access/guest-sessions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const userId = req.user?.id || '';
      
      // Generate access token
      const accessToken = await storage.generateGuestAccessToken(
        req.body.bookingId,
        req.body.credentialId
      );
      
      const sessionData = {
        ...req.body,
        organizationId,
        accessToken,
        grantedBy: userId
      };
      
      const newSession = await storage.createGuestAccessSession(sessionData);
      res.status(201).json(newSession);
    } catch (error) {
      console.error("Error creating guest access session:", error);
      res.status(500).json({ message: "Failed to create guest access session" });
    }
  });

  // Revoke guest access session
  app.patch("/api/property-access/guest-sessions/:id/revoke", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id || '';
      
      const revokedSession = await storage.revokeGuestAccessSession(
        parseInt(id),
        userId,
        reason || 'Manual revocation'
      );
      
      if (!revokedSession) {
        return res.status(404).json({ message: "Guest access session not found" });
      }
      
      res.json(revokedSession);
    } catch (error) {
      console.error("Error revoking guest access session:", error);
      res.status(500).json({ message: "Failed to revoke guest access session" });
    }
  });

  // Validate guest access token
  app.post("/api/property-access/validate-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }
      
      const validation = await storage.validateGuestAccessToken(token);
      res.json(validation);
    } catch (error) {
      console.error("Error validating guest access token:", error);
      res.status(500).json({ message: "Failed to validate guest access token" });
    }
  });

  // Get code rotation schedules
  app.get("/api/property-access/rotation-schedules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId, dueForRotation } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (dueForRotation === 'true') filters.dueForRotation = true;
      
      const schedules = await storage.getCodeRotationSchedules(organizationId, filters);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching code rotation schedules:", error);
      res.status(500).json({ message: "Failed to fetch code rotation schedules" });
    }
  });

  // Create code rotation schedule
  app.post("/api/property-access/rotation-schedules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const userId = req.user?.id || '';
      
      const scheduleData = {
        ...req.body,
        organizationId,
        createdBy: userId
      };
      
      const newSchedule = await storage.createCodeRotationSchedule(scheduleData);
      res.status(201).json(newSchedule);
    } catch (error) {
      console.error("Error creating code rotation schedule:", error);
      res.status(500).json({ message: "Failed to create code rotation schedule" });
    }
  });

  // Update code rotation schedule
  app.put("/api/property-access/rotation-schedules/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updatedSchedule = await storage.updateCodeRotationSchedule(parseInt(id), req.body);
      
      if (!updatedSchedule) {
        return res.status(404).json({ message: "Code rotation schedule not found" });
      }
      
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating code rotation schedule:", error);
      res.status(500).json({ message: "Failed to update code rotation schedule" });
    }
  });

  // Get due rotation reminders
  app.get("/api/property-access/due-reminders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const dueReminders = await storage.getDueRotationReminders(organizationId);
      res.json(dueReminders);
    } catch (error) {
      console.error("Error fetching due rotation reminders:", error);
      res.status(500).json({ message: "Failed to fetch due rotation reminders" });
    }
  });

  // Mark rotation reminder as sent
  app.patch("/api/property-access/rotation-schedules/:id/mark-sent", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const marked = await storage.markRotationReminderSent(parseInt(id));
      
      if (!marked) {
        return res.status(404).json({ message: "Code rotation schedule not found" });
      }
      
      res.json({ message: "Rotation reminder marked as sent" });
    } catch (error) {
      console.error("Error marking rotation reminder as sent:", error);
      res.status(500).json({ message: "Failed to mark rotation reminder as sent" });
    }
  });

  // ===== AUTO-SCHEDULING & RECURRING TASKS ROUTES =====

  // Task Scheduling Rules Routes
  app.get("/api/task-scheduling-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      const rules = await storage.getTaskSchedulingRules(organizationId, propertyId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching task scheduling rules:", error);
      res.status(500).json({ message: "Failed to fetch task scheduling rules" });
    }
  });

  app.get("/api/task-scheduling-rules/:ruleId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const ruleId = parseInt(req.params.ruleId);
      
      const rule = await storage.getTaskSchedulingRule(organizationId, ruleId);
      if (!rule) {
        return res.status(404).json({ message: "Task scheduling rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      console.error("Error fetching task scheduling rule:", error);
      res.status(500).json({ message: "Failed to fetch task scheduling rule" });
    }
  });

  app.post("/api/task-scheduling-rules", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const user = req.user;
      
      // Only admin and portfolio-manager can create rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to create task scheduling rules" });
      }

      const ruleData = {
        ...req.body,
        organizationId,
        createdBy: user.id
      };
      
      const newRule = await storage.createTaskSchedulingRule(ruleData);
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating task scheduling rule:", error);
      res.status(500).json({ message: "Failed to create task scheduling rule" });
    }
  });

  app.put("/api/task-scheduling-rules/:ruleId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const ruleId = parseInt(req.params.ruleId);
      const user = req.user;
      
      // Only admin and portfolio-manager can update rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to update task scheduling rules" });
      }
      
      const updatedRule = await storage.updateTaskSchedulingRule(organizationId, ruleId, req.body);
      res.json(updatedRule);
    } catch (error) {
      console.error("Error updating task scheduling rule:", error);
      res.status(500).json({ message: "Failed to update task scheduling rule" });
    }
  });

  app.delete("/api/task-scheduling-rules/:ruleId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const ruleId = parseInt(req.params.ruleId);
      const user = req.user;
      
      // Only admin and portfolio-manager can delete rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to delete task scheduling rules" });
      }
      
      await storage.deleteTaskSchedulingRule(organizationId, ruleId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task scheduling rule:", error);
      res.status(500).json({ message: "Failed to delete task scheduling rule" });
    }
  });

  app.patch("/api/task-scheduling-rules/:ruleId/toggle", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const ruleId = parseInt(req.params.ruleId);
      const { isActive } = req.body;
      const user = req.user;
      
      // Only admin and portfolio-manager can toggle rules
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to toggle task scheduling rules" });
      }
      
      const updatedRule = await storage.toggleTaskSchedulingRule(organizationId, ruleId, isActive);
      res.json(updatedRule);
    } catch (error) {
      console.error("Error toggling task scheduling rule:", error);
      res.status(500).json({ message: "Failed to toggle task scheduling rule" });
    }
  });

  // Recurring Tasks Routes
  app.get("/api/recurring-tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const user = req.user;
      
      const filters: any = {};
      
      // Add query filters
      if (req.query.propertyId) filters.propertyId = parseInt(req.query.propertyId);
      if (req.query.department) filters.department = req.query.department;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.dateFrom) filters.dateFrom = req.query.dateFrom;
      if (req.query.dateTo) filters.dateTo = req.query.dateTo;
      
      // Staff can only see tasks assigned to them
      if (user?.role === 'staff') {
        filters.assignedTo = user.id;
      }
      
      const tasks = await storage.getRecurringTasks(organizationId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching recurring tasks:", error);
      res.status(500).json({ message: "Failed to fetch recurring tasks" });
    }
  });

  app.get("/api/recurring-tasks/:taskId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const taskId = parseInt(req.params.taskId);
      
      const task = await storage.getRecurringTask(organizationId, taskId);
      if (!task) {
        return res.status(404).json({ message: "Recurring task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching recurring task:", error);
      res.status(500).json({ message: "Failed to fetch recurring task" });
    }
  });

  app.put("/api/recurring-tasks/:taskId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const taskId = parseInt(req.params.taskId);
      
      const updatedTask = await storage.updateRecurringTask(organizationId, taskId, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating recurring task:", error);
      res.status(500).json({ message: "Failed to update recurring task" });
    }
  });

  app.post("/api/recurring-tasks/:taskId/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const taskId = parseInt(req.params.taskId);
      const completionData = req.body;
      
      const completedTask = await storage.completeRecurringTask(organizationId, taskId, completionData);
      res.json(completedTask);
    } catch (error) {
      console.error("Error completing recurring task:", error);
      res.status(500).json({ message: "Failed to complete recurring task" });
    }
  });

  app.post("/api/recurring-tasks/:taskId/skip", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const taskId = parseInt(req.params.taskId);
      const { skipReason } = req.body;
      
      const skippedTask = await storage.skipRecurringTask(organizationId, taskId, skipReason);
      res.json(skippedTask);
    } catch (error) {
      console.error("Error skipping recurring task:", error);
      res.status(500).json({ message: "Failed to skip recurring task" });
    }
  });

  // Task Generation Routes
  app.post("/api/generate-recurring-tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const { targetDate } = req.body;
      const user = req.user;
      
      // Only admin and portfolio-manager can trigger task generation
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to generate tasks" });
      }
      
      const log = await storage.generateRecurringTasks(organizationId, targetDate);
      res.json(log);
    } catch (error) {
      console.error("Error generating recurring tasks:", error);
      res.status(500).json({ message: "Failed to generate recurring tasks" });
    }
  });

  app.get("/api/task-generation-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      
      const logs = await storage.getTaskGenerationLogs(organizationId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching task generation logs:", error);
      res.status(500).json({ message: "Failed to fetch task generation logs" });
    }
  });

  // Analytics Routes
  app.get("/api/recurring-task-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      const department = req.query.department as string;
      const year = req.query.year ? parseInt(req.query.year) : undefined;
      const month = req.query.month ? parseInt(req.query.month) : undefined;
      
      const analytics = await storage.getRecurringTaskAnalytics(organizationId, propertyId, department, year, month);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching recurring task analytics:", error);
      res.status(500).json({ message: "Failed to fetch recurring task analytics" });
    }
  });

  app.post("/api/recurring-task-analytics/update", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const user = req.user;
      
      // Only admin and portfolio-manager can update analytics
      if (user?.role !== 'admin' && user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Insufficient permissions to update analytics" });
      }
      
      await storage.updateRecurringTaskAnalytics(organizationId);
      res.json({ message: "Analytics updated successfully" });
    } catch (error) {
      console.error("Error updating recurring task analytics:", error);
      res.status(500).json({ message: "Failed to update recurring task analytics" });
    }
  });

  // Alerts Routes
  app.get("/api/task-scheduling-alerts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      
      const filters: any = {};
      if (req.query.severity) filters.severity = req.query.severity;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.propertyId) filters.propertyId = parseInt(req.query.propertyId);
      
      const alerts = await storage.getTaskSchedulingAlerts(organizationId, filters);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching task scheduling alerts:", error);
      res.status(500).json({ message: "Failed to fetch task scheduling alerts" });
    }
  });

  app.post("/api/task-scheduling-alerts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      
      const alertData = {
        ...req.body,
        organizationId
      };
      
      const newAlert = await storage.createTaskSchedulingAlert(alertData);
      res.status(201).json(newAlert);
    } catch (error) {
      console.error("Error creating task scheduling alert:", error);
      res.status(500).json({ message: "Failed to create task scheduling alert" });
    }
  });

  app.patch("/api/task-scheduling-alerts/:alertId/acknowledge", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "default-org";
      const alertId = parseInt(req.params.alertId);
      const user = req.user;
      
      const acknowledgedAlert = await storage.acknowledgeTaskSchedulingAlert(organizationId, alertId, user.id);
      res.json(acknowledgedAlert);
    } catch (error) {
      console.error("Error acknowledging task scheduling alert:", error);
      res.status(500).json({ message: "Failed to acknowledge task scheduling alert" });
    }
  });

  // ===== GUEST CHECKOUT SURVEY API ROUTES =====

  // Get guest checkout surveys
  app.get("/api/guest-checkout-surveys", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { guestId, propertyId, surveyType, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (guestId) filters.guestId = guestId as string;
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (surveyType) filters.surveyType = surveyType as string;
      if (startDate && endDate) {
        filters.dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string)
        };
      }
      
      const surveys = await storage.getGuestCheckoutSurveys(organizationId, filters);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching guest checkout surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  // Get guest checkout survey by ID
  app.get("/api/guest-checkout-surveys/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const survey = await storage.getGuestCheckoutSurvey(parseInt(req.params.id));
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error fetching guest checkout survey:", error);
      res.status(500).json({ message: "Failed to fetch survey" });
    }
  });

  // Create new guest checkout survey (public route for guests)
  app.post("/api/guest-checkout-surveys", async (req, res) => {
    try {
      const surveyData = {
        ...req.body,
        organizationId: req.body.organizationId || "default",
      };

      // Validate required fields
      if (!surveyData.guestId) {
        return res.status(400).json({ message: "Guest ID is required" });
      }

      const survey = await storage.createGuestCheckoutSurvey(surveyData);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating guest checkout survey:", error);
      res.status(500).json({ message: "Failed to create survey" });
    }
  });

  // Update guest checkout survey (admin only)
  app.put("/api/guest-checkout-surveys/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateGuestCheckoutSurvey(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating guest checkout survey:", error);
      res.status(500).json({ message: "Failed to update survey" });
    }
  });

  // Review guest survey (admin/PM only)
  app.post("/api/guest-checkout-surveys/:id/review", isDemoAuthenticated, async (req, res) => {
    try {
      const { adminNotes } = req.body;
      const updated = await storage.reviewGuestSurvey(
        parseInt(req.params.id),
        req.user.id,
        adminNotes
      );
      if (!updated) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error reviewing guest survey:", error);
      res.status(500).json({ message: "Failed to review survey" });
    }
  });

  // Get survey settings
  app.get("/api/survey-settings", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId } = req.query;
      
      const settings = await storage.getSurveySettings(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined
      );
      res.json(settings);
    } catch (error) {
      console.error("Error fetching survey settings:", error);
      res.status(500).json({ message: "Failed to fetch survey settings" });
    }
  });

  // Create or update survey settings
  app.post("/api/survey-settings", isDemoAuthenticated, async (req, res) => {
    try {
      const settingsData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };
      
      const settings = await storage.createSurveySettings(settingsData);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating survey settings:", error);
      res.status(500).json({ message: "Failed to create survey settings" });
    }
  });

  // Get survey alerts
  app.get("/api/survey-alerts", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { severity, resolved, alertType } = req.query;
      
      const filters: any = {};
      if (severity) filters.severity = severity as string;
      if (resolved !== undefined) filters.resolved = resolved === 'true';
      if (alertType) filters.alertType = alertType as string;
      
      const alerts = await storage.getSurveyAlerts(organizationId, filters);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching survey alerts:", error);
      res.status(500).json({ message: "Failed to fetch survey alerts" });
    }
  });

  // Resolve survey alert
  app.post("/api/survey-alerts/:id/resolve", isDemoAuthenticated, async (req, res) => {
    try {
      const { resolutionNotes } = req.body;
      const updated = await storage.resolveSurveyAlert(
        parseInt(req.params.id),
        req.user.id,
        resolutionNotes
      );
      if (!updated) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error resolving survey alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Get survey analytics
  app.get("/api/survey-analytics", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId, period } = req.query;
      
      const analytics = await storage.getSurveyAnalytics(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        period as string
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching survey analytics:", error);
      res.status(500).json({ message: "Failed to fetch survey analytics" });
    }
  });

  // Generate survey analytics (admin only)
  app.post("/api/survey-analytics/generate", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId } = req.body;
      
      await storage.generateSurveyAnalytics(organizationId, propertyId);
      res.json({ message: "Analytics generated successfully" });
    } catch (error) {
      console.error("Error generating survey analytics:", error);
      res.status(500).json({ message: "Failed to generate analytics" });
    }
  });

  // Get demo survey data (for testing)
  app.get("/api/guest-checkout-surveys/demo", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = req.user.organizationId;
      const demoData = await storage.getGuestSurveyDemoData(organizationId);
      res.json(demoData);
    } catch (error) {
      console.error("Error fetching demo survey data:", error);
      res.status(500).json({ message: "Failed to fetch demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// ===== AI PROCESSING HELPER FUNCTIONS =====

// AI processing function for guest issue reports
async function processGuestIssueForAI(issueReport: any) {
  try {
    const { category, description, urgency } = issueReport;
    
    // Keyword-based AI simulation for auto-task creation
    const keywords = {
      maintenance: ['broken', 'not working', 'repair', 'fix', 'damaged'],
      cleaning: ['dirty', 'stain', 'clean', 'messy', 'smell'],
      pool: ['pool', 'chlorine', 'water', 'filter', 'pump'],
      ac: ['ac', 'air conditioning', 'hot', 'cold', 'temperature'],
      wifi: ['wifi', 'internet', 'connection', 'network']
    };
    
    const lowerDescription = description.toLowerCase();
    let matchedCategory = category;
    let confidence = 0.7;
    
    // Check for keyword matches to improve category assignment
    for (const [cat, catKeywords] of Object.entries(keywords)) {
      const matches = catKeywords.filter(keyword => lowerDescription.includes(keyword));
      if (matches.length > 0) {
        matchedCategory = cat;
        confidence = Math.min(0.95, 0.7 + (matches.length * 0.1));
        break;
      }
    }
    
    // Determine department assignment
    const departmentMap = {
      maintenance: 'maintenance',
      cleaning: 'cleaning',
      pool: 'pool',
      ac: 'maintenance',
      wifi: 'maintenance',
      amenities: 'maintenance'
    };
    
    const department = departmentMap[matchedCategory] || 'general';
    
    // Create auto-task if confidence is high enough
    if (confidence >= 0.75) {
      const autoTask = {
        id: Date.now(),
        title: `Guest Issue: ${category}`,
        description: `Auto-generated from guest report: ${description}`,
        category: matchedCategory,
        department,
        priority: urgency === 'urgent' ? 'high' : urgency === 'high' ? 'medium' : 'low',
        status: 'pending',
        assignedTo: 'auto-assignment',
        source: 'guest_ai_processing',
        confidence,
        createdAt: new Date().toISOString()
      };
      
      return {
        taskCreated: true,
        task: autoTask,
        confidence,
        matchedCategory,
        department,
        aiProcessingTime: 150 // milliseconds
      };
    }
    
    return {
      taskCreated: false,
      confidence,
      matchedCategory,
      department,
      reason: 'Confidence too low for auto-task creation',
      aiProcessingTime: 100
    };
    
  } catch (error) {
    console.error('AI processing error:', error);
    return {
      taskCreated: false,
      error: 'AI processing failed',
      aiProcessingTime: 50
    };
  }

  // ===== STAFF ADVANCE & OVERTIME TRACKING API ROUTES =====

  // Staff Advance Request Routes
  app.get("/api/staff-advance-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      const { staffId, status, reviewedBy } = req.query;
      const filters: any = {};
      
      // Role-based filtering
      if (user.role === 'staff') {
        filters.staffId = user.id; // Staff can only see their own requests
      } else if (staffId) {
        filters.staffId = staffId;
      }
      
      if (status) filters.status = status;
      if (reviewedBy) filters.reviewedBy = reviewedBy;

      const requests = await storage.getStaffAdvanceRequests(organizationId, filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching advance requests:", error);
      res.status(500).json({ message: "Failed to fetch advance requests" });
    }
  });

  app.get("/api/staff-advance-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      
      const request = await storage.getStaffAdvanceRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Advance request not found" });
      }

      // Security check: staff can only view their own requests
      if (user.role === 'staff' && request.staffId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(request);
    } catch (error) {
      console.error("Error fetching advance request:", error);
      res.status(500).json({ message: "Failed to fetch advance request" });
    }
  });

  app.post("/api/staff-advance-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      const requestData = {
        ...req.body,
        organizationId,
        staffId: user.role === 'staff' ? user.id : req.body.staffId,
      };

      const newRequest = await storage.createStaffAdvanceRequest(requestData);
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating advance request:", error);
      res.status(500).json({ message: "Failed to create advance request" });
    }
  });

  app.put("/api/staff-advance-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      
      // Only admin/PM can update requests (for approval/rejection)
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateStaffAdvanceRequest(requestId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Advance request not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating advance request:", error);
      res.status(500).json({ message: "Failed to update advance request" });
    }
  });

  app.post("/api/staff-advance-requests/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { reviewNotes, paidAmount } = req.body;
      const approved = await storage.approveStaffAdvanceRequest(
        requestId,
        user.id,
        reviewNotes,
        paidAmount
      );

      if (!approved) {
        return res.status(404).json({ message: "Advance request not found" });
      }

      res.json(approved);
    } catch (error) {
      console.error("Error approving advance request:", error);
      res.status(500).json({ message: "Failed to approve advance request" });
    }
  });

  app.post("/api/staff-advance-requests/:id/reject", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const requestId = parseInt(req.params.id);
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { reviewNotes } = req.body;
      const rejected = await storage.rejectStaffAdvanceRequest(
        requestId,
        user.id,
        reviewNotes
      );

      if (!rejected) {
        return res.status(404).json({ message: "Advance request not found" });
      }

      res.json(rejected);
    } catch (error) {
      console.error("Error rejecting advance request:", error);
      res.status(500).json({ message: "Failed to reject advance request" });
    }
  });

  // Staff Overtime Log Routes
  app.get("/api/staff-overtime-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      const { staffId, status, workDate, propertyId } = req.query;
      const filters: any = {};
      
      // Role-based filtering
      if (user.role === 'staff') {
        filters.staffId = user.id; // Staff can only see their own logs
      } else if (staffId) {
        filters.staffId = staffId;
      }
      
      if (status) filters.status = status;
      if (workDate) filters.workDate = workDate;
      if (propertyId) filters.propertyId = parseInt(propertyId);

      const logs = await storage.getStaffOvertimeLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching overtime logs:", error);
      res.status(500).json({ message: "Failed to fetch overtime logs" });
    }
  });

  app.get("/api/staff-overtime-logs/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const logId = parseInt(req.params.id);
      
      const log = await storage.getStaffOvertimeLog(logId);
      if (!log) {
        return res.status(404).json({ message: "Overtime log not found" });
      }

      // Security check: staff can only view their own logs
      if (user.role === 'staff' && log.staffId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(log);
    } catch (error) {
      console.error("Error fetching overtime log:", error);
      res.status(500).json({ message: "Failed to fetch overtime log" });
    }
  });

  app.post("/api/staff-overtime-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      const logData = {
        ...req.body,
        organizationId,
        staffId: user.role === 'staff' ? user.id : req.body.staffId,
      };

      const newLog = await storage.createStaffOvertimeLog(logData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error creating overtime log:", error);
      res.status(500).json({ message: "Failed to create overtime log" });
    }
  });

  app.put("/api/staff-overtime-logs/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const logId = parseInt(req.params.id);
      
      // Only admin/PM can update logs (for approval/rejection)
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateStaffOvertimeLog(logId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Overtime log not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating overtime log:", error);
      res.status(500).json({ message: "Failed to update overtime log" });
    }
  });

  app.post("/api/staff-overtime-logs/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const logId = parseInt(req.params.id);
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { compensationType, compensationAmount, timeOffHours, approvalNotes } = req.body;
      const approved = await storage.approveStaffOvertimeLog(
        logId,
        user.id,
        compensationType,
        compensationAmount,
        timeOffHours,
        approvalNotes
      );

      if (!approved) {
        return res.status(404).json({ message: "Overtime log not found" });
      }

      res.json(approved);
    } catch (error) {
      console.error("Error approving overtime log:", error);
      res.status(500).json({ message: "Failed to approve overtime log" });
    }
  });

  app.post("/api/staff-overtime-logs/:id/reject", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const logId = parseInt(req.params.id);
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const { approvalNotes } = req.body;
      const rejected = await storage.rejectStaffOvertimeLog(
        logId,
        user.id,
        approvalNotes
      );

      if (!rejected) {
        return res.status(404).json({ message: "Overtime log not found" });
      }

      res.json(rejected);
    } catch (error) {
      console.error("Error rejecting overtime log:", error);
      res.status(500).json({ message: "Failed to reject overtime log" });
    }
  });

  // Staff Overtime Settings Routes
  app.get("/api/staff-overtime-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      const { staffId } = req.query;
      
      const settings = await storage.getStaffOvertimeSettings(organizationId, staffId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching overtime settings:", error);
      res.status(500).json({ message: "Failed to fetch overtime settings" });
    }
  });

  app.post("/api/staff-overtime-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const settingsData = {
        ...req.body,
        organizationId,
      };

      const newSettings = await storage.createStaffOvertimeSettings(settingsData);
      res.status(201).json(newSettings);
    } catch (error) {
      console.error("Error creating overtime settings:", error);
      res.status(500).json({ message: "Failed to create overtime settings" });
    }
  });

  app.put("/api/staff-overtime-settings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const settingsId = parseInt(req.params.id);
      
      if (user.role !== 'admin' && user.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updated = await storage.updateStaffOvertimeSettings(settingsId, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Overtime settings not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating overtime settings:", error);
      res.status(500).json({ message: "Failed to update overtime settings" });
    }
  });

  // Staff Monthly Summary Routes
  app.get("/api/staff-monthly-summary/:staffId/:period", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      const { staffId, period } = req.params;
      
      // Security check: staff can only view their own summary
      if (user.role === 'staff' && staffId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const summary = await storage.getStaffMonthlySummary(organizationId, staffId, period);
      if (!summary) {
        // Auto-calculate if summary doesn't exist
        const [year, month] = period.split('-').map(Number);
        const calculated = await storage.calculateStaffMonthlySummary(organizationId, staffId, year, month);
        res.json(calculated);
      } else {
        res.json(summary);
      }
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
      res.status(500).json({ message: "Failed to fetch monthly summary" });
    }
  });

  app.post("/api/staff-monthly-summary/calculate", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      const { staffId, year, month } = req.body;
      
      // Security check: staff can only calculate their own summary
      if (user.role === 'staff' && staffId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const summary = await storage.calculateStaffMonthlySummary(organizationId, staffId, year, month);
      res.json(summary);
    } catch (error) {
      console.error("Error calculating monthly summary:", error);
      res.status(500).json({ message: "Failed to calculate monthly summary" });
    }
  });

  // Dashboard Analytics Routes
  app.get("/api/staff-advance-overview", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      const { staffId } = req.query;
      
      // Security check: staff can only view their own overview
      const targetStaffId = user.role === 'staff' ? user.id : staffId;

      const overview = await storage.getStaffAdvanceOverview(organizationId, targetStaffId);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching advance overview:", error);
      res.status(500).json({ message: "Failed to fetch advance overview" });
    }
  });

  app.get("/api/staff-overtime-overview", isDemoAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const organizationId = user?.organizationId || "default-org";
      const { staffId } = req.query;
      
      // Security check: staff can only view their own overview
      const targetStaffId = user.role === 'staff' ? user.id : staffId;

      const overview = await storage.getStaffOvertimeOverview(organizationId, targetStaffId);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching overtime overview:", error);
      res.status(500).json({ message: "Failed to fetch overtime overview" });
    }
  });

  // ===== MULTI-CURRENCY FINANCE + QUICKBOOKS INTEGRATION =====

  // Currency exchange rates endpoints
  app.get("/api/currency-exchange-rates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { fromCurrency, toCurrency, rateDate } = req.query;
      
      const rates = await storage.getCurrencyExchangeRates(organizationId, {
        fromCurrency,
        toCurrency,
        rateDate
      });
      res.json(rates);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.post("/api/currency-exchange-rates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const rate = await storage.createCurrencyExchangeRate({
        ...req.body,
        organizationId,
        updatedBy: userId
      });
      res.json(rate);
    } catch (error) {
      console.error("Error creating exchange rate:", error);
      res.status(500).json({ message: "Failed to create exchange rate" });
    }
  });

  app.put("/api/currency-exchange-rates/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: userId } = req.user;
      const { id } = req.params;
      
      const rate = await storage.updateCurrencyExchangeRate(parseInt(id), {
        ...req.body,
        updatedBy: userId
      });
      res.json(rate);
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      res.status(500).json({ message: "Failed to update exchange rate" });
    }
  });

  app.delete("/api/currency-exchange-rates/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteCurrencyExchangeRate(parseInt(id));
      res.json({ success });
    } catch (error) {
      console.error("Error deleting exchange rate:", error);
      res.status(500).json({ message: "Failed to delete exchange rate" });
    }
  });

  // Multi-currency finances endpoints
  app.get("/api/multi-currency-finances", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId, ownerId, category, fromDate, toDate, currency } = req.query;

      let filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (ownerId) filters.ownerId = ownerId;
      if (category) filters.category = category;
      if (currency) filters.currency = currency;
      if (fromDate) filters.fromDate = new Date(fromDate);
      if (toDate) filters.toDate = new Date(toDate);

      // Role-based filtering
      if (role === 'owner') {
        filters.ownerId = userId;
      }

      const finances = await storage.getMultiCurrencyFinances(organizationId, filters);
      res.json(finances);
    } catch (error) {
      console.error("Error fetching finances:", error);
      res.status(500).json({ message: "Failed to fetch finances" });
    }
  });

  app.post("/api/multi-currency-finances", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const finance = await storage.createMultiCurrencyFinance({
        ...req.body,
        organizationId,
        processedBy: userId
      });
      res.json(finance);
    } catch (error) {
      console.error("Error creating finance record:", error);
      res.status(500).json({ message: "Failed to create finance record" });
    }
  });

  app.put("/api/multi-currency-finances/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id: userId } = req.user;
      const { id } = req.params;
      
      const finance = await storage.updateMultiCurrencyFinance(parseInt(id), {
        ...req.body,
        processedBy: userId
      });
      res.json(finance);
    } catch (error) {
      console.error("Error updating finance record:", error);
      res.status(500).json({ message: "Failed to update finance record" });
    }
  });

  app.delete("/api/multi-currency-finances/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteMultiCurrencyFinance(parseInt(id));
      res.json({ success });
    } catch (error) {
      console.error("Error deleting finance record:", error);
      res.status(500).json({ message: "Failed to delete finance record" });
    }
  });

  // Currency conversion endpoint
  app.post("/api/convert-currency", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { amount, fromCurrency, toCurrency, exchangeRateId } = req.body;
      
      const result = await storage.convertCurrency(amount, fromCurrency, toCurrency, exchangeRateId);
      res.json(result);
    } catch (error) {
      console.error("Error converting currency:", error);
      res.status(500).json({ message: "Failed to convert currency" });
    }
  });

  // QuickBooks integration endpoints
  app.get("/api/quickbooks-integration", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      
      const integration = await storage.getQuickbooksIntegration(organizationId);
      res.json(integration);
    } catch (error) {
      console.error("Error fetching QuickBooks integration:", error);
      res.status(500).json({ message: "Failed to fetch QuickBooks integration" });
    }
  });

  app.post("/api/quickbooks-integration", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const integration = await storage.createQuickbooksIntegration({
        ...req.body,
        organizationId
      });
      res.json(integration);
    } catch (error) {
      console.error("Error creating QuickBooks integration:", error);
      res.status(500).json({ message: "Failed to create QuickBooks integration" });
    }
  });

  app.put("/api/quickbooks-integration", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const integration = await storage.updateQuickbooksIntegration(organizationId, req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error updating QuickBooks integration:", error);
      res.status(500).json({ message: "Failed to update QuickBooks integration" });
    }
  });

  app.delete("/api/quickbooks-integration", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      
      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const success = await storage.deleteQuickbooksIntegration(organizationId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting QuickBooks integration:", error);
      res.status(500).json({ message: "Failed to delete QuickBooks integration" });
    }
  });

  // Property finance settings endpoints
  app.get("/api/property-finance-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId, ownerId } = req.query;

      let filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (ownerId) filters.ownerId = ownerId;

      // Role-based filtering
      if (role === 'owner') {
        filters.ownerId = userId;
      }

      const settings = await storage.getPropertyFinanceSettings(organizationId, filters);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching property finance settings:", error);
      res.status(500).json({ message: "Failed to fetch property finance settings" });
    }
  });

  app.post("/api/property-finance-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      
      const settings = await storage.createPropertyFinanceSettings({
        ...req.body,
        organizationId
      });
      res.json(settings);
    } catch (error) {
      console.error("Error creating property finance settings:", error);
      res.status(500).json({ message: "Failed to create property finance settings" });
    }
  });

  app.put("/api/property-finance-settings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const settings = await storage.updatePropertyFinanceSettings(parseInt(id), req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating property finance settings:", error);
      res.status(500).json({ message: "Failed to update property finance settings" });
    }
  });

  // Finance export endpoints
  app.get("/api/finance-export-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { exportType, dateRange, status } = req.query;

      let filters: any = {};
      if (exportType) filters.exportType = exportType;
      if (dateRange) filters.dateRange = dateRange;
      if (status) filters.status = status;
      
      // Role-based filtering
      if (role !== 'admin' && role !== 'portfolio-manager') {
        filters.requestedBy = userId;
      }

      const logs = await storage.getFinanceExportLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching export logs:", error);
      res.status(500).json({ message: "Failed to fetch export logs" });
    }
  });

  app.post("/api/finance-export", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const result = await storage.exportFinancialData(organizationId, {
        ...req.body,
        requestedBy: userId
      });
      res.json(result);
    } catch (error) {
      console.error("Error exporting financial data:", error);
      res.status(500).json({ message: "Failed to export financial data" });
    }
  });

  // Finance report templates endpoints
  app.get("/api/finance-report-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { templateType, isDefault } = req.query;

      let filters: any = {};
      if (templateType) filters.templateType = templateType;
      if (isDefault !== undefined) filters.isDefault = isDefault === 'true';

      const templates = await storage.getFinanceReportTemplates(organizationId, filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching report templates:", error);
      res.status(500).json({ message: "Failed to fetch report templates" });
    }
  });

  app.post("/api/finance-report-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      
      const template = await storage.createFinanceReportTemplate({
        ...req.body,
        organizationId,
        createdBy: userId
      });
      res.json(template);
    } catch (error) {
      console.error("Error creating report template:", error);
      res.status(500).json({ message: "Failed to create report template" });
    }
  });

  // Financial reporting endpoint
  app.post("/api/financial-report", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const filters = req.body;

      // Role-based filtering
      if (role === 'owner') {
        filters.ownerIds = [userId];
      }

      const report = await storage.generateFinancialReport(organizationId, filters);
      res.json(report);
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  // Occupancy rates endpoints
  app.get("/api/occupancy-rates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, periodType, periodValue } = req.query;

      let filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (periodType) filters.periodType = periodType;
      if (periodValue) filters.periodValue = periodValue;

      const rates = await storage.getOccupancyRates(organizationId, filters);
      res.json(rates);
    } catch (error) {
      console.error("Error fetching occupancy rates:", error);
      res.status(500).json({ message: "Failed to fetch occupancy rates" });
    }
  });

  app.post("/api/occupancy-rates/calculate", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId, periodType, periodValue } = req.body;
      
      const rate = await storage.calculateOccupancyRate(propertyId, periodType, periodValue);
      res.json(rate);
    } catch (error) {
      console.error("Error calculating occupancy rate:", error);
      res.status(500).json({ message: "Failed to calculate occupancy rate" });
    }
  });

  // ===== OWNER INVOICING & PAYOUT SYSTEM API ROUTES =====

  // ===== OWNER BALANCE MANAGEMENT =====

  // Get owner balance
  app.get("/api/owner-balance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { propertyId, month, year } = req.query;

      // Check role permissions
      if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Owners can only see their own balance
      const ownerId = role === 'owner' ? userId : req.query.ownerId;
      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID is required" });
      }

      const balance = await storage.getOwnerBalance(
        organizationId,
        ownerId,
        propertyId ? parseInt(propertyId) : undefined,
        month ? parseInt(month) : undefined,
        year ? parseInt(year) : undefined
      );

      res.json(balance);
    } catch (error) {
      console.error("Error fetching owner balance:", error);
      res.status(500).json({ message: "Failed to fetch owner balance" });
    }
  });

  // Calculate/update owner balance
  app.post("/api/owner-balance/calculate", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { ownerId, propertyId } = req.body;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can calculate balances" });
      }

      const balance = await storage.calculateOwnerBalance(
        organizationId,
        ownerId,
        propertyId
      );

      res.json(balance);
    } catch (error) {
      console.error("Error calculating owner balance:", error);
      res.status(500).json({ message: "Failed to calculate owner balance" });
    }
  });

  // ===== OWNER PAYOUT REQUESTS =====

  // Get owner payout requests
  app.get("/api/owner-payout-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { status, propertyId } = req.query;

      let filters: any = {};
      if (status) filters.status = status;
      if (propertyId) filters.propertyId = parseInt(propertyId);

      // Owners can only see their own requests
      if (role === 'owner') {
        filters.ownerId = userId;
      } else if (req.query.ownerId) {
        filters.ownerId = req.query.ownerId;
      }

      const requests = await storage.getOwnerPayoutRequests(organizationId, filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  // Create payout request
  app.post("/api/owner-payout-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;

      // Check role permissions
      if (!['owner'].includes(role)) {
        return res.status(403).json({ message: "Only owners can create payout requests" });
      }

      const requestData = {
        ...req.body,
        organizationId,
        ownerId: userId,
      };

      const request = await storage.createOwnerPayoutRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Update payout request status
  app.put("/api/owner-payout-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { id } = req.params;
      const { status, ...updateData } = req.body;

      // Check role permissions for status changes
      if (status === 'approved' && !['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can approve requests" });
      }

      const updatedRequest = await storage.updatePayoutRequestStatus(
        parseInt(id),
        status,
        {
          ...updateData,
          reviewedBy: ['admin', 'portfolio-manager'].includes(role) ? userId : undefined,
          reviewedAt: ['admin', 'portfolio-manager'].includes(role) ? new Date() : undefined,
          approvedBy: status === 'approved' ? userId : undefined,
          approvedAt: status === 'approved' ? new Date() : undefined,
        }
      );

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating payout request:", error);
      res.status(500).json({ message: "Failed to update payout request" });
    }
  });

  // ===== OWNER INVOICE MANAGEMENT =====

  // Get owner invoices
  app.get("/api/owner-invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { status, propertyId, invoiceType } = req.query;

      let filters: any = {};
      if (status) filters.status = status;
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (invoiceType) filters.invoiceType = invoiceType;

      // Owners can only see invoices involving them
      if (role === 'owner') {
        filters.toPartyId = userId; // Only invoices sent to this owner
      } else if (req.query.fromPartyId) {
        filters.fromPartyId = req.query.fromPartyId;
      } else if (req.query.toPartyId) {
        filters.toPartyId = req.query.toPartyId;
      }

      const invoices = await storage.getOwnerInvoices(organizationId, filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching owner invoices:", error);
      res.status(500).json({ message: "Failed to fetch owner invoices" });
    }
  });

  // Create owner invoice
  app.post("/api/owner-invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can create invoices" });
      }

      const invoiceData = {
        ...req.body,
        organizationId,
        generatedBy: userId,
      };

      const invoice = await storage.createOwnerInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      console.error("Error creating owner invoice:", error);
      res.status(500).json({ message: "Failed to create owner invoice" });
    }
  });

  // Get invoice line items
  app.get("/api/owner-invoices/:id/line-items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const lineItems = await storage.getOwnerInvoiceLineItems(parseInt(id));
      res.json(lineItems);
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      res.status(500).json({ message: "Failed to fetch invoice line items" });
    }
  });

  // Add line item to invoice
  app.post("/api/owner-invoices/:id/line-items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { id } = req.params;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can add line items" });
      }

      const lineItemData = {
        ...req.body,
        organizationId,
        invoiceId: parseInt(id),
      };

      const lineItem = await storage.addOwnerInvoiceLineItem(lineItemData);
      res.json(lineItem);
    } catch (error) {
      console.error("Error adding invoice line item:", error);
      res.status(500).json({ message: "Failed to add invoice line item" });
    }
  });

  // ===== AUTO-INVOICE GENERATION =====

  // Generate invoice from booking data
  app.post("/api/owner-invoices/generate-from-bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { ownerId, propertyId, periodStart, periodEnd } = req.body;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can generate invoices" });
      }

      const invoice = await storage.generateInvoiceFromBookings(
        organizationId,
        ownerId,
        propertyId,
        periodStart,
        periodEnd,
        userId
      );

      res.json(invoice);
    } catch (error) {
      console.error("Error generating invoice from bookings:", error);
      res.status(500).json({ message: "Failed to generate invoice from bookings" });
    }
  });

  // ===== PORTFOLIO MANAGER COMMISSIONS =====

  // Get PM commissions
  app.get("/api/portfolio-manager-commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { propertyId, month, year, status } = req.query;

      let filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (month) filters.month = parseInt(month);
      if (year) filters.year = parseInt(year);
      if (status) filters.status = status;

      // Portfolio managers can only see their own commissions
      if (role === 'portfolio-manager') {
        filters.portfolioManagerId = userId;
      } else if (req.query.portfolioManagerId) {
        filters.portfolioManagerId = req.query.portfolioManagerId;
      }

      const commissions = await storage.getPortfolioManagerCommissions(organizationId, filters);
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching PM commissions:", error);
      res.status(500).json({ message: "Failed to fetch PM commissions" });
    }
  });

  // Update PM commission
  app.post("/api/portfolio-manager-commissions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can update commissions" });
      }

      const commissionData = {
        ...req.body,
        organizationId,
      };

      const commission = await storage.updatePortfolioManagerCommission(commissionData);
      res.json(commission);
    } catch (error) {
      console.error("Error updating PM commission:", error);
      res.status(500).json({ message: "Failed to update PM commission" });
    }
  });

  // ===== SERVICE CHARGE CONFIGURATIONS =====

  // Get service charge configs
  app.get("/api/service-charge-configs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { serviceName, serviceCategory, propertyId, isActive } = req.query;

      let filters: any = {};
      if (serviceName) filters.serviceName = serviceName;
      if (serviceCategory) filters.serviceCategory = serviceCategory;
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const configs = await storage.getServiceChargeConfigs(organizationId, filters);
      res.json(configs);
    } catch (error) {
      console.error("Error fetching service charge configs:", error);
      res.status(500).json({ message: "Failed to fetch service charge configs" });
    }
  });

  // Update service charge config
  app.post("/api/service-charge-configs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can update service charge configs" });
      }

      const configData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const config = await storage.updateServiceChargeConfig(configData);
      res.json(config);
    } catch (error) {
      console.error("Error updating service charge config:", error);
      res.status(500).json({ message: "Failed to update service charge config" });
    }
  });

  // ===== FINANCIAL SUMMARY REPORTS =====

  // Get financial summary reports
  app.get("/api/financial-summary-reports", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { reportType, month, year } = req.query;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can view financial reports" });
      }

      let filters: any = {};
      if (reportType) filters.reportType = reportType;
      if (month) filters.month = parseInt(month);
      if (year) filters.year = parseInt(year);

      const reports = await storage.getFinancialSummaryReports(organizationId, filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching financial summary reports:", error);
      res.status(500).json({ message: "Failed to fetch financial summary reports" });
    }
  });

  // Generate monthly financial summary
  app.post("/api/financial-summary-reports/generate", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { month, year } = req.body;

      // Check role permissions
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Only admin and portfolio managers can generate financial reports" });
      }

      const report = await storage.generateMonthlyFinancialSummary(
        organizationId,
        month,
        year,
        userId
      );

      res.json(report);
    } catch (error) {
      console.error("Error generating financial summary:", error);
      res.status(500).json({ message: "Failed to generate financial summary" });
    }
  });

  // ===== OWNER INVOICING DASHBOARD ANALYTICS =====

  // Get owner invoicing analytics
  app.get("/api/owner-invoicing/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { ownerId, propertyId, period } = req.query;

      // Check role permissions and ownership
      let targetOwnerId = ownerId;
      if (role === 'owner') {
        targetOwnerId = userId; // Owners can only see their own analytics
      }

      // Calculate analytics based on the period
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Get current balance
      const balance = await storage.getOwnerBalance(
        organizationId,
        targetOwnerId,
        propertyId ? parseInt(propertyId) : undefined,
        currentMonth,
        currentYear
      );

      // Get recent payout requests
      const payoutRequests = await storage.getOwnerPayoutRequests(organizationId, {
        ownerId: targetOwnerId,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
      });

      // Get recent invoices
      const invoices = await storage.getOwnerInvoices(organizationId, {
        toPartyId: targetOwnerId,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
      });

      const analytics = {
        currentBalance: balance,
        totalPayoutRequests: payoutRequests.length,
        pendingPayoutRequests: payoutRequests.filter(r => r.status === 'pending').length,
        completedPayoutRequests: payoutRequests.filter(r => r.status === 'completed').length,
        totalInvoices: invoices.length,
        unpaidInvoices: invoices.filter(i => i.status === 'sent').length,
        paidInvoices: invoices.filter(i => i.status === 'paid').length,
        recentPayoutRequests: payoutRequests.slice(0, 5),
        recentInvoices: invoices.slice(0, 5),
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching owner invoicing analytics:", error);
      res.status(500).json({ message: "Failed to fetch owner invoicing analytics" });
    }
  });

  // ===== OWNER STATEMENT EXPORTS =====

  // Get owner statement exports
  app.get("/api/owner-statement-exports", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      
      // Only owners can request their own statements, admin/PM can view all
      const ownerId = role === 'owner' ? userId : req.query.ownerId;
      
      const exports = await storage.getOwnerStatementExports(organizationId, ownerId);
      res.json(exports);
    } catch (error) {
      console.error("Error fetching owner statement exports:", error);
      res.status(500).json({ message: "Failed to fetch statement exports" });
    }
  });

  // Create owner statement export
  app.post("/api/owner-statement-exports", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const {
        exportType,
        dateRangeType,
        startDate,
        endDate,
        propertyIds,
        includeNotes,
        includeServiceLogs,
        includeBranding
      } = req.body;

      // Validate required fields
      if (!exportType || !dateRangeType || !startDate || !endDate || !propertyIds?.length) {
        return res.status(400).json({ message: "Missing required export parameters" });
      }

      // Only owners can export their own statements, admin/PM can export for any owner
      const ownerId = role === 'owner' ? userId : req.body.ownerId;
      
      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID is required" });
      }

      // Calculate totals
      const totals = await storage.calculateStatementTotals(
        organizationId,
        propertyIds,
        startDate,
        endDate
      );

      // Generate filename
      const properties = await storage.getProperties(organizationId, { ownerId });
      const propertyNames = properties
        .filter(p => propertyIds.includes(p.id))
        .map(p => p.name)
        .join('_');
      
      const dateStr = dateRangeType === 'month' 
        ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '')
        : `${new Date(startDate).toISOString().split('T')[0]}_to_${new Date(endDate).toISOString().split('T')[0]}`;
      
      const fileName = `OwnerStatement_${propertyNames}_${dateStr}.${exportType}`;

      // Create export record
      const exportData = {
        organizationId,
        ownerId,
        exportType,
        dateRangeType,
        startDate,
        endDate,
        propertyIds: JSON.stringify(propertyIds),
        includeNotes: includeNotes || false,
        includeServiceLogs: includeServiceLogs || false,
        includeBranding: includeBranding !== false,
        fileName,
        totalEarnings: totals.totalEarnings.toString(),
        totalExpenses: totals.totalExpenses.toString(),
        managementCommission: totals.managementCommission.toString(),
        netBalance: totals.netBalance.toString(),
        status: 'generating'
      };

      const statementExport = await storage.createOwnerStatementExport(exportData);

      // Start async generation process (in real implementation, this would be a background job)
      // For demo purposes, we'll simulate immediate completion
      setTimeout(async () => {
        try {
          await storage.updateOwnerStatementExport(statementExport.id, {
            status: 'completed',
            fileUrl: `/api/owner-statement-exports/${statementExport.id}/download`,
            fileSize: Math.floor(Math.random() * 1000000) + 50000 // Simulate file size
          });
        } catch (error) {
          console.error("Error updating statement export:", error);
          await storage.updateOwnerStatementExport(statementExport.id, {
            status: 'failed',
            errorMessage: error.message
          });
        }
      }, 2000);

      res.json({ 
        message: "Statement export started", 
        exportId: statementExport.id,
        export: statementExport 
      });
    } catch (error) {
      console.error("Error creating owner statement export:", error);
      res.status(500).json({ message: "Failed to create statement export" });
    }
  });

  // Get statement export details
  app.get("/api/owner-statement-exports/:exportId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { exportId } = req.params;

      const exports = await storage.getOwnerStatementExports(organizationId);
      const exportRecord = exports.find(e => e.id === parseInt(exportId));

      if (!exportRecord) {
        return res.status(404).json({ message: "Export not found" });
      }

      // Check ownership
      if (role === 'owner' && exportRecord.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(exportRecord);
    } catch (error) {
      console.error("Error fetching statement export:", error);
      res.status(500).json({ message: "Failed to fetch statement export" });
    }
  });

  // Download statement export
  app.get("/api/owner-statement-exports/:exportId/download", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { exportId } = req.params;

      const exports = await storage.getOwnerStatementExports(organizationId);
      const exportRecord = exports.find(e => e.id === parseInt(exportId));

      if (!exportRecord) {
        return res.status(404).json({ message: "Export not found" });
      }

      // Check ownership
      if (role === 'owner' && exportRecord.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (exportRecord.status !== 'completed') {
        return res.status(400).json({ message: "Export not ready for download" });
      }

      // Get statement data
      const propertyIds = JSON.parse(exportRecord.propertyIds);
      const statementData = await storage.getOwnerStatementData(
        organizationId,
        exportRecord.ownerId,
        propertyIds,
        exportRecord.startDate,
        exportRecord.endDate
      );

      if (exportRecord.exportType === 'csv') {
        // Generate CSV
        const csvData = generateCSVStatement(statementData, exportRecord);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${exportRecord.fileName}"`);
        res.send(csvData);
      } else {
        // For PDF, return statement data for frontend PDF generation
        res.json({
          exportRecord,
          statementData,
          downloadUrl: `/api/owner-statement-exports/${exportId}/pdf`
        });
      }
    } catch (error) {
      console.error("Error downloading statement export:", error);
      res.status(500).json({ message: "Failed to download statement export" });
    }
  });

  // Generate PDF statement data
  app.get("/api/owner-statement-exports/:exportId/pdf-data", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId, role } = req.user;
      const { exportId } = req.params;

      const exports = await storage.getOwnerStatementExports(organizationId);
      const exportRecord = exports.find(e => e.id === parseInt(exportId));

      if (!exportRecord) {
        return res.status(404).json({ message: "Export not found" });
      }

      // Check ownership
      if (role === 'owner' && exportRecord.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get complete statement data
      const propertyIds = JSON.parse(exportRecord.propertyIds);
      const statementData = await storage.getOwnerStatementData(
        organizationId,
        exportRecord.ownerId,
        propertyIds,
        exportRecord.startDate,
        exportRecord.endDate
      );

      // Get organization settings for branding
      const organization = await storage.getOrganization(organizationId);

      res.json({
        exportRecord,
        statementData,
        organization,
        totals: {
          totalEarnings: parseFloat(exportRecord.totalEarnings),
          totalExpenses: parseFloat(exportRecord.totalExpenses),
          managementCommission: parseFloat(exportRecord.managementCommission),
          netBalance: parseFloat(exportRecord.netBalance)
        }
      });
    } catch (error) {
      console.error("Error fetching PDF statement data:", error);
      res.status(500).json({ message: "Failed to fetch statement data" });
    }
  });

  // Helper function to generate CSV
  function generateCSVStatement(statementData: any, exportRecord: any) {
    const { earnings, expenses, addonExpenses, commissions, propertyDetails } = statementData;
    
    let csv = `Owner Financial Statement\n`;
    csv += `Period: ${exportRecord.startDate} to ${exportRecord.endDate}\n`;
    csv += `Properties: ${propertyDetails.map(p => p.name).join(', ')}\n\n`;
    
    // Earnings section
    csv += `EARNINGS\n`;
    csv += `Date,Property,Platform,Guest Name,Check In,Check Out,Amount,Currency\n`;
    earnings.forEach((earning: any) => {
      const property = propertyDetails.find(p => p.id === earning.propertyId);
      csv += `${earning.checkIn},${property?.name || 'Unknown'},${earning.platform},${earning.guestName},${earning.checkIn},${earning.checkOut},${earning.amount},${earning.currency}\n`;
    });
    
    csv += `\nEXPENSES\n`;
    csv += `Date,Property,Category,Description,Amount\n`;
    expenses.forEach((expense: any) => {
      const property = propertyDetails.find(p => p.id === expense.propertyId);
      csv += `${expense.date},${property?.name || 'Unknown'},${expense.category},${expense.description},${expense.amount}\n`;
    });
    
    // Add-on services
    csv += `\nADD-ON SERVICES\n`;
    csv += `Date,Property,Service,Guest Name,Amount,Currency\n`;
    addonExpenses.forEach((addon: any) => {
      const property = propertyDetails.find(p => p.id === addon.propertyId);
      csv += `${addon.serviceDate},${property?.name || 'Unknown'},${addon.serviceName},${addon.guestName},${addon.amount},${addon.currency}\n`;
    });
    
    // Commissions
    csv += `\nMANAGEMENT COMMISSION\n`;
    csv += `Date,Property,Description,Amount\n`;
    commissions.forEach((commission: any) => {
      const property = propertyDetails.find(p => p.id === commission.propertyId);
      csv += `${commission.date},${property?.name || 'Unknown'},${commission.description},${commission.amount}\n`;
    });
    
    // Summary
    csv += `\nSUMMARY\n`;
    csv += `Total Earnings,${exportRecord.totalEarnings}\n`;
    csv += `Total Expenses,${exportRecord.totalExpenses}\n`;
    csv += `Management Commission,${exportRecord.managementCommission}\n`;
    csv += `Net Balance,${exportRecord.netBalance}\n`;
    
    return csv;
  }

  // ===== AUDIT TRAIL & ADMIN OVERRIDE API ROUTES =====

  // Admin middleware to check admin permissions
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Portfolio Manager middleware
  const requirePortfolioManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any;
    if (!user || (!['admin', 'portfolio-manager'].includes(user.role))) {
      return res.status(403).json({ message: "Portfolio Manager or Admin access required" });
    }
    next();
  };

  // Audit Trail Routes
  app.get("/api/admin/audit-trail", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const {
        userId,
        entityType,
        entityId,
        actionType,
        dateFrom,
        dateTo,
        severity
      } = req.query;

      const auditLogs = await storage.getAuditTrail(user.organizationId, {
        userId: userId as string,
        entityType: entityType as string,
        entityId: entityId as string,
        actionType: actionType as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        severity: severity as string
      });

      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      res.status(500).json({ message: "Failed to fetch audit trail" });
    }
  });

  app.get("/api/admin/audit-trail/entity/:entityType/:entityId", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { entityType, entityId } = req.params;

      const history = await storage.getEntityChangeHistory(
        user.organizationId,
        entityType,
        entityId
      );

      res.json(history);
    } catch (error) {
      console.error("Error fetching entity change history:", error);
      res.status(500).json({ message: "Failed to fetch entity change history" });
    }
  });

  // Admin Permission Management
  app.get("/api/admin/permissions", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { userId, entityType } = req.query;

      const permissions = await storage.getAdminPermissions(
        user.organizationId,
        userId as string,
        entityType as string
      );

      res.json(permissions);
    } catch (error) {
      console.error("Error fetching admin permissions:", error);
      res.status(500).json({ message: "Failed to fetch admin permissions" });
    }
  });

  app.post("/api/admin/permissions", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const permissionData = {
        ...req.body,
        organizationId: user.organizationId,
        grantedBy: user.id
      };

      const permission = await storage.createAdminPermission(permissionData);

      // Log the admin action
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: 'create',
        entityType: 'admin_permission',
        entityId: permission.id.toString(),
        entityDescription: `Admin permission granted to ${permissionData.userId}`,
        newValues: permissionData,
        severity: 'high'
      });

      res.json(permission);
    } catch (error) {
      console.error("Error creating admin permission:", error);
      res.status(500).json({ message: "Failed to create admin permission" });
    }
  });

  // User Impersonation Routes
  app.post("/api/admin/impersonate", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { targetUserId, targetUserRole, reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason for impersonation is required" });
      }

      const sessionToken = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const impersonationSession = await storage.createImpersonationSession({
        organizationId: user.organizationId,
        adminUserId: user.id,
        targetUserId,
        targetUserRole,
        sessionToken,
        reason,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });

      // Log the impersonation start
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: 'impersonate',
        entityType: 'user',
        entityId: targetUserId,
        entityDescription: `Started impersonating user ${targetUserId}`,
        changeReason: reason,
        severity: 'critical',
        isOverride: true
      });

      res.json({ sessionToken, message: "Impersonation session started" });
    } catch (error) {
      console.error("Error starting impersonation:", error);
      res.status(500).json({ message: "Failed to start impersonation" });
    }
  });

  app.post("/api/admin/impersonate/end", requireAdmin, async (req, res) => {
    try {
      const { sessionToken } = req.body;
      const user = req.user as any;

      await storage.endImpersonationSession(sessionToken);

      // Log the impersonation end
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: 'end_impersonate',
        entityType: 'user',
        entityId: sessionToken,
        entityDescription: `Ended impersonation session`,
        severity: 'high'
      });

      res.json({ message: "Impersonation session ended" });
    } catch (error) {
      console.error("Error ending impersonation:", error);
      res.status(500).json({ message: "Failed to end impersonation" });
    }
  });

  app.get("/api/admin/impersonation-history", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { adminUserId, targetUserId } = req.query;

      const history = await storage.getImpersonationHistory(
        user.organizationId,
        adminUserId as string,
        targetUserId as string
      );

      res.json(history);
    } catch (error) {
      console.error("Error fetching impersonation history:", error);
      res.status(500).json({ message: "Failed to fetch impersonation history" });
    }
  });

  // Balance Override Routes
  app.post("/api/admin/balance-override", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const {
        targetUserId,
        targetUserRole,
        overrideType,
        entityType,
        entityId,
        previousValue,
        newValue,
        reason
      } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason for balance override is required" });
      }

      const adjustmentAmount = parseFloat(newValue) - parseFloat(previousValue);

      const override = await storage.createBalanceOverride({
        organizationId: user.organizationId,
        targetUserId,
        targetUserRole,
        adminUserId: user.id,
        adminUserName: user.email || user.username || 'Admin',
        overrideType,
        entityType,
        entityId,
        previousValue,
        newValue,
        adjustmentAmount: adjustmentAmount.toString(),
        reason
      });

      // Log the balance override
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: 'balance_override',
        entityType,
        entityId: entityId || targetUserId,
        entityDescription: `Balance override for ${targetUserRole} ${targetUserId}`,
        oldValues: { value: previousValue },
        newValues: { value: newValue },
        changeReason: reason,
        severity: 'critical',
        isOverride: true
      });

      res.json(override);
    } catch (error) {
      console.error("Error creating balance override:", error);
      res.status(500).json({ message: "Failed to create balance override" });
    }
  });

  app.get("/api/admin/balance-override-history", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const {
        targetUserId,
        adminUserId,
        overrideType,
        entityType,
        dateFrom,
        dateTo
      } = req.query;

      const history = await storage.getBalanceOverrideHistory(user.organizationId, {
        targetUserId: targetUserId as string,
        adminUserId: adminUserId as string,
        overrideType: overrideType as string,
        entityType: entityType as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string
      });

      res.json(history);
    } catch (error) {
      console.error("Error fetching balance override history:", error);
      res.status(500).json({ message: "Failed to fetch balance override history" });
    }
  });

  // Portfolio Manager Assignment Routes
  app.get("/api/admin/pm-assignments", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { managerId, propertyId } = req.query;

      const assignments = await storage.getPMAssignments(
        user.organizationId,
        managerId as string,
        propertyId ? parseInt(propertyId as string) : undefined
      );

      res.json(assignments);
    } catch (error) {
      console.error("Error fetching PM assignments:", error);
      res.status(500).json({ message: "Failed to fetch PM assignments" });
    }
  });

  app.post("/api/admin/pm-assignments", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const assignmentData = {
        ...req.body,
        organizationId: user.organizationId,
        assignedBy: user.id
      };

      const assignment = await storage.createPMAssignment(assignmentData);

      // Log the PM assignment
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: 'create',
        entityType: 'pm_assignment',
        entityId: assignment.id.toString(),
        entityDescription: `Assigned PM ${assignmentData.managerId} to property ${assignmentData.propertyId}`,
        newValues: assignmentData,
        severity: 'medium'
      });

      res.json(assignment);
    } catch (error) {
      console.error("Error creating PM assignment:", error);
      res.status(500).json({ message: "Failed to create PM assignment" });
    }
  });

  app.get("/api/pm/portfolio-properties", requirePortfolioManagerOrAdmin, async (req, res) => {
    try {
      const user = req.user as any;

      // If admin, return all properties, otherwise return PM's assigned properties
      if (user.role === 'admin') {
        const properties = await storage.getPropertiesByOrganization(user.organizationId);
        res.json(properties.map(p => p.id));
      } else {
        const propertyIds = await storage.getPMPortfolioProperties(user.organizationId, user.id);
        res.json(propertyIds);
      }
    } catch (error) {
      console.error("Error fetching portfolio properties:", error);
      res.status(500).json({ message: "Failed to fetch portfolio properties" });
    }
  });

  // Admin override for any entity - generic endpoint with proper logging
  app.post("/api/admin/override/:entityType/:entityId", requireAdmin, async (req, res) => {
    try {
      const user = req.user as any;
      const { entityType, entityId } = req.params;
      const { action, data, reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Reason for override is required" });
      }

      // Log the admin override action
      await storage.logAdminAction({
        organizationId: user.organizationId,
        userId: user.id,
        userRole: user.role,
        userName: user.email || user.username || 'Admin',
        actionType: action,
        entityType,
        entityId,
        entityDescription: `Admin override ${action} on ${entityType} ${entityId}`,
        oldValues: data.oldValues,
        newValues: data.newValues,
        changeReason: reason,
        severity: 'high',
        isOverride: true
      });

      res.json({ message: "Admin override logged successfully" });
    } catch (error) {
      console.error("Error processing admin override:", error);
      res.status(500).json({ message: "Failed to process admin override" });
    }
  });

  // ===== DOCUMENT CENTER API ENDPOINTS =====

  // Get property documents
  app.get("/api/documents", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001"; // Demo organization
      const { propertyId, category, visibility, hasExpiration } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (category) filters.category = category;
      if (visibility) filters.visibility = visibility;
      if (hasExpiration !== undefined) filters.hasExpiration = hasExpiration === 'true';
      
      const documents = await storage.getPropertyDocuments(organizationId, filters);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get documents by property (with role-based access)
  app.get("/api/documents/property/:propertyId", demoAuthMiddleware, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userRole = req.user.role;
      
      const documents = await storage.getDocumentsByProperty(propertyId, userRole);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching property documents:", error);
      res.status(500).json({ message: "Failed to fetch property documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", demoAuthMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getPropertyDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Log document access
      await storage.createDocumentAccessLog({
        organizationId: "org_001",
        documentId: id,
        propertyId: document.propertyId,
        accessedBy: req.user.id,
        accessedByRole: req.user.role,
        actionType: 'view',
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Create new document
  app.post("/api/documents", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const userRole = req.user.role;
      
      // Only admin, portfolio-manager, and owner can upload documents
      if (!['admin', 'portfolio-manager', 'owner'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions to upload documents" });
      }
      
      const documentData = {
        ...req.body,
        organizationId,
        uploadedBy: req.user.id,
        uploadedByRole: userRole
      };
      
      const document = await storage.createPropertyDocument(documentData);
      
      // Log document upload
      await storage.createDocumentAccessLog({
        organizationId,
        documentId: document.id,
        propertyId: document.propertyId,
        accessedBy: req.user.id,
        accessedByRole: userRole,
        actionType: 'upload',
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update document
  app.put("/api/documents/:id", demoAuthMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user.role;
      
      // Get existing document to check permissions
      const existingDocument = await storage.getPropertyDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check permissions: admin/PM can edit all, owners can only edit their own
      if (userRole === 'owner' && existingDocument.uploadedBy !== req.user.id) {
        return res.status(403).json({ message: "Insufficient permissions to edit this document" });
      }
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions to edit documents" });
      }
      
      const document = await storage.updatePropertyDocument(id, req.body);
      
      // Log document update
      await storage.createDocumentAccessLog({
        organizationId: "org_001",
        documentId: id,
        propertyId: existingDocument.propertyId,
        accessedBy: req.user.id,
        accessedByRole: userRole,
        actionType: 'update',
        userAgent: req.headers['user-agent'] || '',
        ipAddress: req.ip || req.connection.remoteAddress || ''
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", demoAuthMiddleware, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userRole = req.user.role;
      
      // Get existing document to check permissions
      const existingDocument = await storage.getPropertyDocument(id);
      if (!existingDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Only admin and PM can delete documents
      if (!['admin', 'portfolio-manager'].includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions to delete documents" });
      }
      
      const success = await storage.deletePropertyDocument(id);
      
      if (success) {
        // Log document deletion
        await storage.createDocumentAccessLog({
          organizationId: "org_001",
          documentId: id,
          propertyId: existingDocument.propertyId,
          accessedBy: req.user.id,
          accessedByRole: userRole,
          actionType: 'delete',
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || req.connection.remoteAddress || ''
        });
        
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete document" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Get documents by category
  app.get("/api/documents/category/:category", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const category = req.params.category;
      
      const documents = await storage.getDocumentsByCategory(organizationId, category);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents by category:", error);
      res.status(500).json({ message: "Failed to fetch documents by category" });
    }
  });

  // Get expiring documents
  app.get("/api/documents/expiring", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const daysAhead = parseInt(req.query.daysAhead as string) || 30;
      
      // Only admin and PM can view expiring documents
      if (!['admin', 'portfolio-manager'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to view expiring documents" });
      }
      
      const documents = await storage.getExpiringDocuments(organizationId, daysAhead);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching expiring documents:", error);
      res.status(500).json({ message: "Failed to fetch expiring documents" });
    }
  });

  // Get document access logs
  app.get("/api/documents/access-logs", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { documentId, accessedBy, actionType } = req.query;
      
      // Only admin and PM can view access logs
      if (!['admin', 'portfolio-manager'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to view access logs" });
      }
      
      const filters: any = {};
      if (documentId) filters.documentId = parseInt(documentId as string);
      if (accessedBy) filters.accessedBy = accessedBy;
      if (actionType) filters.actionType = actionType;
      
      const logs = await storage.getDocumentAccessLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching access logs:", error);
      res.status(500).json({ message: "Failed to fetch access logs" });
    }
  });

  // Get document summary/analytics
  app.get("/api/documents/summary", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId as string) : undefined;
      
      const summary = await storage.getDocumentSummary(organizationId, propertyId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching document summary:", error);
      res.status(500).json({ message: "Failed to fetch document summary" });
    }
  });

  // Get document expiration alerts
  app.get("/api/documents/expiration-alerts", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { documentId, isProcessed } = req.query;
      
      // Only admin and PM can view expiration alerts
      if (!['admin', 'portfolio-manager'].includes(req.user.role)) {
        return res.status(403).json({ message: "Insufficient permissions to view expiration alerts" });
      }
      
      const filters: any = {};
      if (documentId) filters.documentId = parseInt(documentId as string);
      if (isProcessed !== undefined) filters.isProcessed = isProcessed === 'true';
      
      const alerts = await storage.getDocumentExpirationAlerts(organizationId, filters);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching expiration alerts:", error);
      res.status(500).json({ message: "Failed to fetch expiration alerts" });
    }
  });

  // Get document export history
  app.get("/api/documents/export-history", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { propertyId, exportedBy, status } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (exportedBy) filters.exportedBy = exportedBy;
      if (status) filters.status = status;
      
      const history = await storage.getDocumentExportHistory(organizationId, filters);
      res.json(history);
    } catch (error) {
      console.error("Error fetching export history:", error);
      res.status(500).json({ message: "Failed to fetch export history" });
    }
  });

  // ===== DAILY OPERATIONS DASHBOARD API ENDPOINTS =====

  // Get daily operations summary
  app.get("/api/daily-operations/summary/:date", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { date } = req.params;
      
      const summary = await storage.getDailyOperationsSummary(organizationId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching daily operations summary:", error);
      res.status(500).json({ message: "Failed to fetch daily operations summary" });
    }
  });

  // Get daily staff assignments
  app.get("/api/daily-operations/staff/:date", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { date } = req.params;
      
      const staffAssignments = await storage.getDailyStaffAssignments(organizationId, date);
      res.json(staffAssignments);
    } catch (error) {
      console.error("Error fetching staff assignments:", error);
      res.status(500).json({ message: "Failed to fetch staff assignments" });
    }
  });

  // Get daily property operations
  app.get("/api/daily-operations/properties/:date", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { date } = req.params;
      
      const propertyOps = await storage.getDailyPropertyOperationsWithDetails(organizationId, date);
      res.json(propertyOps);
    } catch (error) {
      console.error("Error fetching property operations:", error);
      res.status(500).json({ message: "Failed to fetch property operations" });
    }
  });

  // Get tasks for operations dashboard
  app.get("/api/daily-operations/tasks/:date", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { date } = req.params;
      
      const tasks = await storage.getOperationsDashboardTasks(organizationId, date);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching operations tasks:", error);
      res.status(500).json({ message: "Failed to fetch operations tasks" });
    }
  });

  // Update staff assignment
  app.put("/api/daily-operations/staff", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const assignmentData = req.body;
      
      const assignment = await storage.upsertDailyStaffAssignment({
        ...assignmentData,
        organizationId
      });
      
      res.json(assignment);
    } catch (error) {
      console.error("Error updating staff assignment:", error);
      res.status(500).json({ message: "Failed to update staff assignment" });
    }
  });

  // Refresh daily operations data
  app.post("/api/daily-operations/refresh/:date", demoAuthMiddleware, async (req: any, res) => {
    try {
      const organizationId = "org_001";
      const { date } = req.params;
      
      await storage.refreshDailyOperations(organizationId, date);
      
      // Return updated summary
      const summary = await storage.getDailyOperationsSummary(organizationId, date);
      res.json(summary);
    } catch (error) {
      console.error("Error refreshing daily operations:", error);
      res.status(500).json({ message: "Failed to refresh daily operations" });
    }
  });

  // Villa Samui Demo Data Seeding
  app.post("/api/seed-villa-samui-demo", async (req, res) => {
    try {
      await seedVillaSamuiDemo();
      res.json({ 
        message: "Villa Samui Breeze demo data seeded successfully!",
        details: [
          "Property: Villa Samui Breeze (3BR with pool & garden)",
          "Booking: John Doe, July 1-5, 2025 (4 nights, 32,000 THB)",
          "Check-in/out: Complete workflow with meter readings",
          "Add-on services: Airport pickup, chef, cleaning",
          "Financial transactions: All income/expense tracking",
          "Tasks: Cleaning, pool service, AI-triggered maintenance",
          "Guest feedback: AC complaint triggering maintenance alert",
          "Owner payout: 22,400 THB (70% share)",
          "PM commission: 4,800 THB for Adam",
          "Invoice & notifications: Complete financial flow"
        ]
      });
    } catch (error) {
      console.error("Error seeding Villa Samui demo:", error);
      res.status(500).json({ 
        message: "Failed to seed Villa Samui demo data",
        error: error.message 
      });
    }
  });

  // ===== PROPERTY UTILITIES & MAINTENANCE ENHANCED API ENDPOINTS =====

  // Property utility accounts enhanced endpoints
  app.get("/api/property-utilities-enhanced", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId } = req.query;
      
      const accounts = await storage.getPropertyUtilityAccountsEnhanced(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined
      );
      
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching enhanced utility accounts:", error);
      res.status(500).json({ message: "Failed to fetch enhanced utility accounts" });
    }
  });

  app.post("/api/property-utilities-enhanced", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const accountData = {
        ...req.body,
        organizationId,
        createdBy: username,
        updatedBy: username
      };
      
      const account = await storage.createPropertyUtilityAccountEnhanced(accountData);
      res.json(account);
    } catch (error) {
      console.error("Error creating enhanced utility account:", error);
      res.status(500).json({ message: "Failed to create enhanced utility account" });
    }
  });

  app.put("/api/property-utilities-enhanced/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const updateData = {
        ...req.body,
        updatedBy: username
      };
      
      const account = await storage.updatePropertyUtilityAccountEnhanced(accountId, updateData);
      res.json(account);
    } catch (error) {
      console.error("Error updating enhanced utility account:", error);
      res.status(500).json({ message: "Failed to update enhanced utility account" });
    }
  });

  app.delete("/api/property-utilities-enhanced/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const success = await storage.deletePropertyUtilityAccountEnhanced(accountId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting enhanced utility account:", error);
      res.status(500).json({ message: "Failed to delete enhanced utility account" });
    }
  });

  // Utility bill logs enhanced endpoints
  app.get("/api/utility-bills-enhanced", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, billingMonth, paymentStatus } = req.query;
      
      const bills = await storage.getUtilityBillLogsEnhanced(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        {
          billingMonth: billingMonth as string,
          paymentStatus: paymentStatus as string
        }
      );
      
      res.json(bills);
    } catch (error) {
      console.error("Error fetching enhanced utility bills:", error);
      res.status(500).json({ message: "Failed to fetch enhanced utility bills" });
    }
  });

  app.post("/api/utility-bills-enhanced", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const billData = {
        ...req.body,
        organizationId,
        createdBy: username,
        updatedBy: username
      };
      
      const bill = await storage.createUtilityBillLogEnhanced(billData);
      res.json(bill);
    } catch (error) {
      console.error("Error creating enhanced utility bill:", error);
      res.status(500).json({ message: "Failed to create enhanced utility bill" });
    }
  });

  app.put("/api/utility-bills-enhanced/:id", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const updateData = {
        ...req.body,
        updatedBy: username
      };
      
      const bill = await storage.updateUtilityBillLogEnhanced(billId, updateData);
      res.json(bill);
    } catch (error) {
      console.error("Error updating enhanced utility bill:", error);
      res.status(500).json({ message: "Failed to update enhanced utility bill" });
    }
  });

  app.put("/api/utility-bills-enhanced/:id/upload-scan", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      const { scanUrl, filename } = req.body;
      
      const bill = await storage.uploadBillScan(billId, scanUrl, filename, username);
      res.json(bill);
    } catch (error) {
      console.error("Error uploading bill scan:", error);
      res.status(500).json({ message: "Failed to upload bill scan" });
    }
  });

  app.put("/api/utility-bills-enhanced/:id/mark-paid", isDemoAuthenticated, async (req, res) => {
    try {
      const billId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      const { paidAmount, paidDate, paymentMethod } = req.body;
      
      const bill = await storage.markBillPaid(billId, paidAmount, paidDate, paymentMethod, username);
      res.json(bill);
    } catch (error) {
      console.error("Error marking bill as paid:", error);
      res.status(500).json({ message: "Failed to mark bill as paid" });
    }
  });

  // Utility AI reminders endpoints
  app.get("/api/utility-ai-reminders", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, status } = req.query;
      
      const reminders = await storage.getUtilityAiReminders(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        status as string
      );
      
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching utility AI reminders:", error);
      res.status(500).json({ message: "Failed to fetch utility AI reminders" });
    }
  });

  app.post("/api/utility-ai-reminders", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const reminderData = {
        ...req.body,
        organizationId,
        createdBy: username
      };
      
      const reminder = await storage.createUtilityAiReminder(reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error creating utility AI reminder:", error);
      res.status(500).json({ message: "Failed to create utility AI reminder" });
    }
  });

  app.put("/api/utility-ai-reminders/:id/acknowledge", isDemoAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const reminder = await storage.acknowledgeUtilityReminder(reminderId, username);
      res.json(reminder);
    } catch (error) {
      console.error("Error acknowledging utility reminder:", error);
      res.status(500).json({ message: "Failed to acknowledge utility reminder" });
    }
  });

  app.put("/api/utility-ai-reminders/:id/resolve", isDemoAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const reminder = await storage.resolveUtilityReminder(reminderId, username);
      res.json(reminder);
    } catch (error) {
      console.error("Error resolving utility reminder:", error);
      res.status(500).json({ message: "Failed to resolve utility reminder" });
    }
  });

  // Property maintenance history endpoints
  app.get("/api/property-maintenance-history", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, serviceType, fromDate, toDate } = req.query;
      
      const filters: any = {};
      if (serviceType) filters.serviceType = serviceType as string;
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);
      
      const history = await storage.getPropertyMaintenanceHistory(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        filters
      );
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      res.status(500).json({ message: "Failed to fetch maintenance history" });
    }
  });

  app.post("/api/property-maintenance-history", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const recordData = {
        ...req.body,
        organizationId,
        createdBy: username,
        updatedBy: username
      };
      
      const record = await storage.createPropertyMaintenanceHistory(recordData);
      res.json(record);
    } catch (error) {
      console.error("Error creating maintenance history record:", error);
      res.status(500).json({ message: "Failed to create maintenance history record" });
    }
  });

  // Maintenance service intervals endpoints
  app.get("/api/maintenance-service-intervals", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId } = req.query;
      
      const intervals = await storage.getMaintenanceServiceIntervals(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined
      );
      
      res.json(intervals);
    } catch (error) {
      console.error("Error fetching maintenance service intervals:", error);
      res.status(500).json({ message: "Failed to fetch maintenance service intervals" });
    }
  });

  app.post("/api/maintenance-service-intervals", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const intervalData = {
        ...req.body,
        organizationId,
        createdBy: username,
        updatedBy: username
      };
      
      const interval = await storage.createMaintenanceServiceInterval(intervalData);
      res.json(interval);
    } catch (error) {
      console.error("Error creating maintenance service interval:", error);
      res.status(500).json({ message: "Failed to create maintenance service interval" });
    }
  });

  // Maintenance AI suggestions endpoints
  app.get("/api/maintenance-ai-suggestions", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, status } = req.query;
      
      const suggestions = await storage.getMaintenanceAiSuggestions(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        status as string
      );
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching maintenance AI suggestions:", error);
      res.status(500).json({ message: "Failed to fetch maintenance AI suggestions" });
    }
  });

  app.post("/api/maintenance-ai-suggestions", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const suggestionData = {
        ...req.body,
        organizationId,
        createdBy: username
      };
      
      const suggestion = await storage.createMaintenanceAiSuggestion(suggestionData);
      res.json(suggestion);
    } catch (error) {
      console.error("Error creating maintenance AI suggestion:", error);
      res.status(500).json({ message: "Failed to create maintenance AI suggestion" });
    }
  });

  app.put("/api/maintenance-ai-suggestions/:id/review", isDemoAuthenticated, async (req, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      const { action, notes } = req.body;
      
      const suggestion = await storage.reviewMaintenanceSuggestion(suggestionId, username, action, notes);
      res.json(suggestion);
    } catch (error) {
      console.error("Error reviewing maintenance suggestion:", error);
      res.status(500).json({ message: "Failed to review maintenance suggestion" });
    }
  });

  // Property alerts endpoints
  app.get("/api/property-alerts", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId, alertType, status } = req.query;
      
      const alerts = await storage.getPropertyAlerts(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        alertType as string,
        status as string
      );
      
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching property alerts:", error);
      res.status(500).json({ message: "Failed to fetch property alerts" });
    }
  });

  app.post("/api/property-alerts", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { username } = req.user as { username: string };
      
      const alertData = {
        ...req.body,
        organizationId,
        createdBy: username
      };
      
      const alert = await storage.createPropertyAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating property alert:", error);
      res.status(500).json({ message: "Failed to create property alert" });
    }
  });

  app.put("/api/property-alerts/:id/acknowledge", isDemoAuthenticated, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const alert = await storage.acknowledgePropertyAlert(alertId, username);
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging property alert:", error);
      res.status(500).json({ message: "Failed to acknowledge property alert" });
    }
  });

  app.put("/api/property-alerts/:id/resolve", isDemoAuthenticated, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const alert = await storage.resolvePropertyAlert(alertId, username);
      res.json(alert);
    } catch (error) {
      console.error("Error resolving property alert:", error);
      res.status(500).json({ message: "Failed to resolve property alert" });
    }
  });

  app.put("/api/property-alerts/:id/dismiss", isDemoAuthenticated, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { username } = req.user as { username: string };
      
      const alert = await storage.dismissPropertyAlert(alertId, username);
      res.json(alert);
    } catch (error) {
      console.error("Error dismissing property alert:", error);
      res.status(500).json({ message: "Failed to dismiss property alert" });
    }
  });

  // Analytics and automation endpoints
  app.post("/api/utility-reminders/generate", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId } = req.body;
      
      const reminders = await storage.generateUtilityReminders(
        organizationId,
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(reminders);
    } catch (error) {
      console.error("Error generating utility reminders:", error);
      res.status(500).json({ message: "Failed to generate utility reminders" });
    }
  });

  app.post("/api/maintenance-suggestions/generate", isDemoAuthenticated, async (req, res) => {
    try {
      const organizationId = "demo-org";
      const { propertyId } = req.body;
      
      const suggestions = await storage.generateMaintenanceSuggestions(
        organizationId,
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating maintenance suggestions:", error);
      res.status(500).json({ message: "Failed to generate maintenance suggestions" });
    }
  });

  // ===== ENHANCED FINANCIAL CONTROLS API ENDPOINTS =====

  // Owner Balance Dashboard Routes
  app.get("/api/enhanced-financial-controls/owner-balances", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { ownerId, propertyId } = req.query;
      
      // Role-based access control
      if (user?.role === 'owner') {
        const balances = await storage.getEnhancedOwnerBalances(organizationId, user.id);
        res.json(balances);
      } else if (user?.role === 'admin' || user?.role === 'portfolio-manager') {
        const balances = await storage.getEnhancedOwnerBalances(
          organizationId, 
          ownerId as string, 
          propertyId ? parseInt(propertyId as string) : undefined
        );
        res.json(balances);
      } else {
        res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
    } catch (error) {
      console.error("Error fetching owner balances:", error);
      res.status(500).json({ message: "Failed to fetch owner balances" });
    }
  });

  app.get("/api/enhanced-financial-controls/owner-summary/:ownerId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const ownerId = req.params.ownerId;
      
      // Access control: owners can only view their own data
      if (user?.role === 'owner' && user.id !== ownerId) {
        return res.status(403).json({ message: "Access denied: Can only view own financial data" });
      }
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const summary = await storage.getOwnerFinancialSummary(organizationId, ownerId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching owner financial summary:", error);
      res.status(500).json({ message: "Failed to fetch owner financial summary" });
    }
  });

  // Owner Payout Request Routes
  app.get("/api/enhanced-financial-controls/payout-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { ownerId, status, startDate, endDate } = req.query;
      
      // Role-based filtering
      const requestOwnerId = user?.role === 'owner' ? user.id : (ownerId as string);
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const requests = await storage.getOwnerPayoutRequests(organizationId, requestOwnerId, {
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching payout requests:", error);
      res.status(500).json({ message: "Failed to fetch payout requests" });
    }
  });

  app.post("/api/enhanced-financial-controls/payout-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (user?.role !== 'owner') {
        return res.status(403).json({ message: "Access denied: Only owners can request payouts" });
      }
      
      const requestData = {
        ...req.body,
        organizationId,
        ownerId: user.id,
        requestedBy: user.id,
        requestedAt: new Date(),
        requestStatus: 'pending',
      };
      
      const newRequest = await storage.createOwnerPayoutRequest(requestData);
      res.json(newRequest);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Enhanced Invoice Tool Routes
  app.get("/api/enhanced-financial-controls/invoice-templates", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Only admin/PM can access invoice templates" });
      }
      
      const templates = await storage.getInvoiceTemplates(organizationId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching invoice templates:", error);
      res.status(500).json({ message: "Failed to fetch invoice templates" });
    }
  });

  app.get("/api/enhanced-financial-controls/invoices", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { status, senderType, recipientType, propertyId } = req.query;
      
      if (!['admin', 'portfolio-manager', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const invoices = await storage.getEnhancedInvoices(organizationId, {
        status: status as string,
        senderType: senderType as string,
        recipientType: recipientType as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
      });
      
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Portfolio Manager Earnings Routes
  app.get("/api/enhanced-financial-controls/pm-earnings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { pmId, earningsMonth, propertyId, payoutStatus } = req.query;
      
      // Role-based filtering
      const requestPmId = user?.role === 'portfolio-manager' ? user.id : (pmId as string);
      
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const earnings = await storage.getPortfolioManagerEarnings(organizationId, requestPmId, {
        earningsMonth: earningsMonth as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined,
        payoutStatus: payoutStatus as string,
      });
      
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching PM earnings:", error);
      res.status(500).json({ message: "Failed to fetch PM earnings" });
    }
  });

  app.get("/api/enhanced-financial-controls/pm-summary/:pmId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const pmId = req.params.pmId;
      
      // Access control: PMs can only view their own data
      if (user?.role === 'portfolio-manager' && user.id !== pmId) {
        return res.status(403).json({ message: "Access denied: Can only view own earnings data" });
      }
      
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const summary = await storage.getPortfolioManagerSummary(organizationId, pmId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching PM summary:", error);
      res.status(500).json({ message: "Failed to fetch PM summary" });
    }
  });

  // Staff Salary & Advance Request Routes
  app.get("/api/enhanced-financial-controls/staff-advance-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { staffId, requestStatus, urgencyLevel } = req.query;
      
      // Role-based filtering
      const requestStaffId = user?.role === 'staff' ? user.id : (staffId as string);
      
      if (!['admin', 'portfolio-manager', 'staff'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Insufficient permissions" });
      }
      
      const requests = await storage.getStaffAdvanceRequests(organizationId, requestStaffId, {
        requestStatus: requestStatus as string,
        urgencyLevel: urgencyLevel as string,
      });
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching staff advance requests:", error);
      res.status(500).json({ message: "Failed to fetch staff advance requests" });
    }
  });

  app.post("/api/enhanced-financial-controls/staff-advance-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (user?.role !== 'staff') {
        return res.status(403).json({ message: "Access denied: Only staff can request advances" });
      }
      
      const requestData = {
        ...req.body,
        organizationId,
        staffId: user.id,
        requestedBy: user.id,
        requestedAt: new Date(),
        requestStatus: 'pending',
      };
      
      const newRequest = await storage.createStaffAdvanceRequest(requestData);
      res.json(newRequest);
    } catch (error) {
      console.error("Error creating staff advance request:", error);
      res.status(500).json({ message: "Failed to create staff advance request" });
    }
  });

  // Balance Reset Control Routes (Admin Only)
  app.get("/api/enhanced-financial-controls/users-for-balance-reset", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied: Only admin can access balance reset controls" });
      }
      
      const users = await storage.getUsersForBalanceReset(organizationId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users for balance reset:", error);
      res.status(500).json({ message: "Failed to fetch users for balance reset" });
    }
  });

  app.post("/api/enhanced-financial-controls/reset-user-balance", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const { userId, reason } = req.body;
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied: Only admin can reset user balances" });
      }
      
      const result = await storage.resetUserBalance(organizationId, userId, user.id, reason);
      res.json(result);
    } catch (error) {
      console.error("Error resetting user balance:", error);
      res.status(500).json({ message: "Failed to reset user balance" });
    }
  });

  // Financial Controls Dashboard Route
  app.get("/api/enhanced-financial-controls/dashboard", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Only admin/PM can access financial controls dashboard" });
      }
      
      const dashboard = await storage.getFinancialControlsDashboard(organizationId);
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching financial controls dashboard:", error);
      res.status(500).json({ message: "Failed to fetch financial controls dashboard" });
    }
  });

  // ===== MAINTENANCE, UTILITIES & RENOVATION TRACKER API ENDPOINTS =====

  // Maintenance Issues Routes
  app.get("/api/maintenance-tracker/issues", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      // Role-based access control
      if (user?.role === 'owner') {
        // Owners can only see issues for their properties
        // In a real system, we'd filter by user properties
        const issues = await storage.getMaintenanceIssues(organizationId, propertyId);
        res.json(issues);
      } else if (['admin', 'portfolio-manager', 'staff'].includes(user?.role)) {
        const issues = await storage.getMaintenanceIssues(organizationId, propertyId);
        res.json(issues);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      console.error("Error fetching maintenance issues:", error);
      res.status(500).json({ message: "Failed to fetch maintenance issues" });
    }
  });

  app.post("/api/maintenance-tracker/issues", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Only allow creation for authenticated users
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const issueData = {
        organizationId,
        ...req.body,
      };
      
      const newIssue = await storage.createMaintenanceIssue(issueData);
      res.json(newIssue);
    } catch (error) {
      console.error("Error creating maintenance issue:", error);
      res.status(500).json({ message: "Failed to create maintenance issue" });
    }
  });

  // Service History Routes
  app.get("/api/maintenance-tracker/service-history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const serviceHistory = await storage.getPropertyServiceHistory(organizationId, propertyId);
      res.json(serviceHistory);
    } catch (error) {
      console.error("Error fetching service history:", error);
      res.status(500).json({ message: "Failed to fetch service history" });
    }
  });

  app.post("/api/maintenance-tracker/service-history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Only allow creation for admin, PM, and staff
      if (!['admin', 'portfolio-manager', 'staff'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const serviceData = {
        organizationId,
        ...req.body,
      };
      
      const newService = await storage.createPropertyServiceHistory(serviceData);
      res.json(newService);
    } catch (error) {
      console.error("Error creating service history:", error);
      res.status(500).json({ message: "Failed to create service history" });
    }
  });

  // AI Task Suggestions Routes
  app.get("/api/maintenance-tracker/task-suggestions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const suggestions = await storage.getMaintenanceTaskSuggestions(organizationId, propertyId);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching task suggestions:", error);
      res.status(500).json({ message: "Failed to fetch task suggestions" });
    }
  });

  app.post("/api/maintenance-tracker/task-suggestions/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const user = req.user;
      
      // Only admin and PM can approve suggestions
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Only admin/PM can approve suggestions" });
      }
      
      const result = await storage.approveSuggestion(suggestionId);
      res.json(result);
    } catch (error) {
      console.error("Error approving suggestion:", error);
      res.status(500).json({ message: "Failed to approve suggestion" });
    }
  });

  app.post("/api/maintenance-tracker/task-suggestions/:id/dismiss", isDemoAuthenticated, async (req: any, res) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const { reason } = req.body;
      const user = req.user;
      
      // Only admin and PM can dismiss suggestions
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Only admin/PM can dismiss suggestions" });
      }
      
      const result = await storage.dismissSuggestion(suggestionId, reason);
      res.json(result);
    } catch (error) {
      console.error("Error dismissing suggestion:", error);
      res.status(500).json({ message: "Failed to dismiss suggestion" });
    }
  });

  // Property Utilities Routes
  app.get("/api/maintenance-tracker/utilities", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const utilities = await storage.getPropertyUtilities(organizationId, propertyId);
      res.json(utilities);
    } catch (error) {
      console.error("Error fetching property utilities:", error);
      res.status(500).json({ message: "Failed to fetch property utilities" });
    }
  });

  app.post("/api/maintenance-tracker/utilities", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Only admin and PM can create utility accounts
      if (!['admin', 'portfolio-manager'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied: Only admin/PM can manage utility accounts" });
      }
      
      const utilityData = {
        organizationId,
        ...req.body,
      };
      
      const newUtility = await storage.createPropertyUtility(utilityData);
      res.json(newUtility);
    } catch (error) {
      console.error("Error creating property utility:", error);
      res.status(500).json({ message: "Failed to create property utility" });
    }
  });

  // Utility Bill History Routes
  app.get("/api/maintenance-tracker/utility-bills", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      const utilityId = req.query.utilityId ? parseInt(req.query.utilityId) : undefined;
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const bills = await storage.getUtilityBillHistory(organizationId, propertyId, utilityId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      res.status(500).json({ message: "Failed to fetch utility bills" });
    }
  });

  app.post("/api/maintenance-tracker/utility-bills", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      
      // Admin, PM, and staff can add bills
      if (!['admin', 'portfolio-manager', 'staff'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const billData = {
        organizationId,
        ...req.body,
      };
      
      const newBill = await storage.createUtilityBill(billData);
      res.json(newBill);
    } catch (error) {
      console.error("Error creating utility bill:", error);
      res.status(500).json({ message: "Failed to create utility bill" });
    }
  });

  // Utility Alerts Routes
  app.get("/api/maintenance-tracker/utility-alerts", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const alerts = await storage.getUtilityBillAlerts(organizationId, propertyId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching utility alerts:", error);
      res.status(500).json({ message: "Failed to fetch utility alerts" });
    }
  });

  // Property Info Summary Route
  app.get("/api/maintenance-tracker/property-info", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = "demo-org";
      const user = req.user;
      const propertyId = req.query.propertyId ? parseInt(req.query.propertyId) : undefined;
      
      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }
      
      // Role-based access control
      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const propertyInfo = await storage.getPropertyInfoSummary(organizationId, propertyId);
      res.json(propertyInfo);
    } catch (error) {
      console.error("Error fetching property info:", error);
      res.status(500).json({ message: "Failed to fetch property info" });
    }
  });

  // ===== GUEST CHECK-IN / CHECK-OUT TRACKER ROUTES =====

  // Property Electricity Settings
  app.get("/api/guest-checkin/property-settings/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const { organizationId } = req.user;
      
      const settings = await storage.getPropertyElectricitySettings(organizationId, parseInt(propertyId));
      res.json(settings);
    } catch (error) {
      console.error("Error fetching property electricity settings:", error);
      res.status(500).json({ message: "Failed to fetch property electricity settings" });
    }
  });

  app.post("/api/guest-checkin/property-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const settingsData = { ...req.body, organizationId };
      
      const settings = await storage.createPropertyElectricitySettings(settingsData);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating property electricity settings:", error);
      res.status(500).json({ message: "Failed to create property electricity settings" });
    }
  });

  app.patch("/api/guest-checkin/property-settings/:propertyId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      
      const settings = await storage.updatePropertyElectricitySettings(parseInt(propertyId), req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating property electricity settings:", error);
      res.status(500).json({ message: "Failed to update property electricity settings" });
    }
  });

  // Guest Check-Ins
  app.get("/api/guest-checkin/check-ins", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, status, assignedStaff } = req.query;
      
      const filters = { propertyId: propertyId ? parseInt(propertyId) : undefined, status, assignedStaff };
      const checkIns = await storage.getGuestCheckIns(organizationId, filters);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  app.get("/api/guest-checkin/check-ins/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      
      const checkIn = await storage.getGuestCheckInById(organizationId, parseInt(id));
      if (!checkIn) {
        return res.status(404).json({ message: "Check-in not found" });
      }
      res.json(checkIn);
    } catch (error) {
      console.error("Error fetching check-in:", error);
      res.status(500).json({ message: "Failed to fetch check-in" });
    }
  });

  app.post("/api/guest-checkin/check-ins", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const checkInData = { 
        ...req.body, 
        organizationId, 
        assignedStaff: req.body.assignedStaff || userId,
        staffName: req.body.staffName || req.user.name
      };
      
      const checkIn = await storage.createGuestCheckIn(checkInData);
      res.status(201).json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  app.patch("/api/guest-checkin/check-ins/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const checkIn = await storage.updateGuestCheckIn(parseInt(id), req.body);
      res.json(checkIn);
    } catch (error) {
      console.error("Error updating check-in:", error);
      res.status(500).json({ message: "Failed to update check-in" });
    }
  });

  app.post("/api/guest-checkin/check-ins/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      
      const checkIn = await storage.completeGuestCheckIn(parseInt(id), userId);
      res.json(checkIn);
    } catch (error) {
      console.error("Error completing check-in:", error);
      res.status(500).json({ message: "Failed to complete check-in" });
    }
  });

  // Guest Check-Outs
  app.get("/api/guest-checkin/check-outs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, status, assignedStaff } = req.query;
      
      const filters = { propertyId: propertyId ? parseInt(propertyId) : undefined, status, assignedStaff };
      const checkOuts = await storage.getGuestCheckOuts(organizationId, filters);
      res.json(checkOuts);
    } catch (error) {
      console.error("Error fetching check-outs:", error);
      res.status(500).json({ message: "Failed to fetch check-outs" });
    }
  });

  app.get("/api/guest-checkin/check-outs/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { organizationId } = req.user;
      
      const checkOut = await storage.getGuestCheckOutById(organizationId, parseInt(id));
      if (!checkOut) {
        return res.status(404).json({ message: "Check-out not found" });
      }
      res.json(checkOut);
    } catch (error) {
      console.error("Error fetching check-out:", error);
      res.status(500).json({ message: "Failed to fetch check-out" });
    }
  });

  app.post("/api/guest-checkin/check-outs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const checkOutData = { 
        ...req.body, 
        organizationId,
        assignedStaff: req.body.assignedStaff || userId,
        staffName: req.body.staffName || req.user.name
      };
      
      const checkOut = await storage.createGuestCheckOut(checkOutData);
      res.status(201).json(checkOut);
    } catch (error) {
      console.error("Error creating check-out:", error);
      res.status(500).json({ message: "Failed to create check-out" });
    }
  });

  app.patch("/api/guest-checkin/check-outs/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const checkOut = await storage.updateGuestCheckOut(parseInt(id), req.body);
      res.json(checkOut);
    } catch (error) {
      console.error("Error updating check-out:", error);
      res.status(500).json({ message: "Failed to update check-out" });
    }
  });

  app.post("/api/guest-checkin/check-outs/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      
      const checkOut = await storage.completeGuestCheckOut(parseInt(id), userId);
      res.json(checkOut);
    } catch (error) {
      console.error("Error completing check-out:", error);
      res.status(500).json({ message: "Failed to complete check-out" });
    }
  });

  app.post("/api/guest-checkin/check-outs/:id/process-refund", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { refundMethod, refundReceiptUrl } = req.body;
      
      const refundData = {
        refundMethod,
        refundReceiptUrl,
        processedBy: userId
      };
      
      const checkOut = await storage.processRefund(parseInt(id), refundData);
      res.json(checkOut);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: "Failed to process refund" });
    }
  });

  // Check-In/Out Tasks
  app.get("/api/guest-checkin/tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, assignedTo, taskType, status } = req.query;
      
      const filters = { 
        propertyId: propertyId ? parseInt(propertyId) : undefined, 
        assignedTo, 
        taskType, 
        status 
      };
      const tasks = await storage.getCheckInOutTasks(organizationId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching check-in/out tasks:", error);
      res.status(500).json({ message: "Failed to fetch check-in/out tasks" });
    }
  });

  app.post("/api/guest-checkin/tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, id: userId } = req.user;
      const taskData = { 
        ...req.body, 
        organizationId,
        assignedBy: userId
      };
      
      const task = await storage.createCheckInOutTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating check-in/out task:", error);
      res.status(500).json({ message: "Failed to create check-in/out task" });
    }
  });

  app.patch("/api/guest-checkin/tasks/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const task = await storage.updateCheckInOutTask(parseInt(id), req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating check-in/out task:", error);
      res.status(500).json({ message: "Failed to update check-in/out task" });
    }
  });

  // Check-In/Out History
  app.get("/api/guest-checkin/history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = req.user;
      const { propertyId, entryType } = req.query;
      
      const filters = { 
        propertyId: propertyId ? parseInt(propertyId) : undefined, 
        entryType 
      };
      const history = await storage.getCheckInOutHistory(organizationId, filters);
      res.json(history);
    } catch (error) {
      console.error("Error fetching check-in/out history:", error);
      res.status(500).json({ message: "Failed to fetch check-in/out history" });
    }
  });

  // Utility Calculations
  app.post("/api/guest-checkin/calculate-electricity", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { checkInReading, checkOutReading, ratePerKwh } = req.body;
      
      if (!checkInReading || !checkOutReading || !ratePerKwh) {
        return res.status(400).json({ message: "Missing required readings or rate" });
      }
      
      const calculation = await storage.calculateElectricityUsage(
        parseFloat(checkInReading), 
        parseFloat(checkOutReading), 
        parseFloat(ratePerKwh)
      );
      res.json(calculation);
    } catch (error) {
      console.error("Error calculating electricity usage:", error);
      res.status(500).json({ message: "Failed to calculate electricity usage" });
    }
  });

  app.post("/api/guest-checkin/calculate-refund", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { depositAmount, electricityCost, discounts, damageCosts } = req.body;
      
      if (depositAmount === undefined || electricityCost === undefined) {
        return res.status(400).json({ message: "Missing required refund calculation parameters" });
      }
      
      const refundAmount = await storage.calculateRefund(
        parseFloat(depositAmount), 
        parseFloat(electricityCost), 
        parseFloat(discounts || 0), 
        parseFloat(damageCosts || 0)
      );
      res.json({ refundAmount });
    } catch (error) {
      console.error("Error calculating refund:", error);
      res.status(500).json({ message: "Failed to calculate refund" });
    }
  });

  // ===== DOCUMENT CENTER & FILE VAULT ROUTES =====

  // Document management routes
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId, category, visibility, status, search } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (category) filters.category = category;
      if (visibility) filters.visibility = visibility;
      if (status) filters.status = status;
      if (search) filters.search = search;
      
      const documents = await storage.getPropertyDocuments(organizationId, filters);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const documentData = {
        ...req.body,
        organizationId: req.user.organizationId,
        uploadedBy: req.user.id,
        fileUrl: `/uploads/documents/${req.body.filename}`, // Simulated file upload
        fileSize: req.body.fileSize || 1024,
        mimeType: req.body.mimeType || 'application/pdf',
        checksumHash: 'simulated-hash-' + Date.now()
      };
      
      const document = await storage.createPropertyDocument(documentData);
      
      // Log upload
      await storage.logDocumentAccess({
        organizationId: req.user.organizationId,
        documentId: document.id,
        userId: req.user.id,
        actionType: 'upload',
        accessMethod: 'web',
        success: true
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Document summary and analytics
  app.get('/api/documents/summary', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { propertyId } = req.query;
      
      const summary = await storage.getDocumentSummary(
        organizationId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      res.json(summary);
    } catch (error) {
      console.error("Error fetching document summary:", error);
      res.status(500).json({ message: "Failed to fetch document summary" });
    }
  });

  // Expiring documents
  app.get('/api/documents/expiring', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const { days } = req.query;
      
      const expiringDocs = await storage.getExpiringDocuments(
        organizationId, 
        days ? parseInt(days) : 30
      );
      res.json(expiringDocs);
    } catch (error) {
      console.error("Error fetching expiring documents:", error);
      res.status(500).json({ message: "Failed to fetch expiring documents" });
    }
  });

  // Owner onboarding checklist routes
  app.get('/api/onboarding/checklist/:ownerId', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId;
      const ownerId = req.params.ownerId;
      const { propertyId } = req.query;
      
      const checklist = await storage.getOwnerOnboardingChecklist(
        organizationId, 
        ownerId, 
        propertyId ? parseInt(propertyId) : undefined
      );
      
      res.json(checklist);
    } catch (error) {
      console.error("Error fetching onboarding checklist:", error);
      res.status(500).json({ message: "Failed to fetch onboarding checklist" });
    }
  });

  app.post('/api/onboarding/checklist', isAuthenticated, async (req: any, res) => {
    try {
      const checklistData = {
        ...req.body,
        organizationId: req.user.organizationId,
      };
      
      const checklist = await storage.createOwnerOnboardingChecklist(checklistData);
      res.status(201).json(checklist);
    } catch (error) {
      console.error("Error creating onboarding checklist:", error);
      res.status(500).json({ message: "Failed to create onboarding checklist" });
    }
  });

  app.put('/api/onboarding/checklist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const checklist = await storage.updateOwnerOnboardingChecklist(id, updates);
      res.json(checklist);
    } catch (error) {
      console.error("Error updating onboarding checklist:", error);
      res.status(500).json({ message: "Failed to update onboarding checklist" });
    }
  });

  // ===== MAINTENANCE LOG, WARRANTY TRACKER & AI REPAIR CYCLE ALERTS API ROUTES =====

  // Maintenance Log Routes
  app.get('/api/maintenance-logs', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId, department, status, technicianAssigned, priority, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (department) filters.department = department as string;
      if (status) filters.status = status as string;
      if (technicianAssigned) filters.technicianAssigned = technicianAssigned as string;
      if (priority) filters.priority = priority as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const logs = await storage.getMaintenanceLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
      res.status(500).json({ message: 'Failed to fetch maintenance logs' });
    }
  });

  app.post('/api/maintenance-logs', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const userId = req.user?.id || 'demo-user';
      
      const logData = {
        ...req.body,
        organizationId,
        createdBy: userId
      };

      const newLog = await storage.createMaintenanceLog(logData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      res.status(500).json({ message: 'Failed to create maintenance log' });
    }
  });

  app.put('/api/maintenance-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedLog = await storage.updateMaintenanceLog(id, req.body);
      
      if (!updatedLog) {
        return res.status(404).json({ message: 'Maintenance log not found' });
      }
      
      res.json(updatedLog);
    } catch (error) {
      console.error('Error updating maintenance log:', error);
      res.status(500).json({ message: 'Failed to update maintenance log' });
    }
  });

  app.get('/api/maintenance-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const log = await storage.getMaintenanceLogById(id);
      
      if (!log) {
        return res.status(404).json({ message: 'Maintenance log not found' });
      }
      
      res.json(log);
    } catch (error) {
      console.error('Error fetching maintenance log:', error);
      res.status(500).json({ message: 'Failed to fetch maintenance log' });
    }
  });

  app.delete('/api/maintenance-logs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMaintenanceLog(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting maintenance log:', error);
      res.status(500).json({ message: 'Failed to delete maintenance log' });
    }
  });

  // Warranty Alerts Routes
  app.get('/api/warranty-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId, isActive, alertType } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (alertType) filters.alertType = alertType as string;

      const alerts = await storage.getWarrantyAlerts(organizationId, filters);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching warranty alerts:', error);
      res.status(500).json({ message: 'Failed to fetch warranty alerts' });
    }
  });

  app.put('/api/warranty-alerts/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 'demo-user';
      
      const updatedAlert = await storage.acknowledgeWarrantyAlert(id, userId);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: 'Warranty alert not found' });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      console.error('Error acknowledging warranty alert:', error);
      res.status(500).json({ message: 'Failed to acknowledge warranty alert' });
    }
  });

  // AI Service Cycle Predictions Routes
  app.get('/api/ai-service-predictions', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId, department, suggestionStatus } = req.query;
      
      const filters: any = {};
      if (propertyId) filters.propertyId = parseInt(propertyId as string);
      if (department) filters.department = department as string;
      if (suggestionStatus) filters.suggestionStatus = suggestionStatus as string;

      const predictions = await storage.getAiServicePredictions(organizationId, filters);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching AI service predictions:', error);
      res.status(500).json({ message: 'Failed to fetch AI service predictions' });
    }
  });

  app.put('/api/ai-service-predictions/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 'demo-user';
      const { suggestionStatus } = req.body;
      
      const updatedPrediction = await storage.reviewAiSuggestion(id, userId, suggestionStatus);
      
      if (!updatedPrediction) {
        return res.status(404).json({ message: 'AI service prediction not found' });
      }
      
      res.json(updatedPrediction);
    } catch (error) {
      console.error('Error reviewing AI suggestion:', error);
      res.status(500).json({ message: 'Failed to review AI suggestion' });
    }
  });

  app.put('/api/ai-service-predictions/:id/convert-to-task', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { taskId } = req.body;
      
      const updatedPrediction = await storage.convertAiSuggestionToTask(id, taskId);
      
      if (!updatedPrediction) {
        return res.status(404).json({ message: 'AI service prediction not found' });
      }
      
      res.json(updatedPrediction);
    } catch (error) {
      console.error('Error converting AI suggestion to task:', error);
      res.status(500).json({ message: 'Failed to convert AI suggestion to task' });
    }
  });

  // Maintenance Dashboard Analytics
  app.get('/api/maintenance-dashboard-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || 'default-org';
      const { propertyId } = req.query;
      
      const analytics = await storage.getMaintenanceDashboardAnalytics(
        organizationId, 
        propertyId ? parseInt(propertyId as string) : undefined
      );
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching maintenance dashboard analytics:', error);
      res.status(500).json({ message: 'Failed to fetch maintenance dashboard analytics' });
    }
  });

  // ===== SMART INVENTORY & SUPPLY CHAIN API ROUTES =====

  // Smart Inventory Items
  app.get("/api/smart-inventory/items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId } = req.query;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      let items;
      if (propertyId) {
        items = await storage.getSmartInventoryItemsByProperty(organizationId, parseInt(propertyId));
      } else {
        items = await storage.getSmartInventoryItems(organizationId);
      }
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching smart inventory items:", error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  });

  app.post("/api/smart-inventory/items", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const itemData = {
        ...req.body,
        organizationId,
      };

      const item = await storage.createSmartInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.patch("/api/smart-inventory/items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const updateData = {
        ...req.body,
        organizationId,
      };

      const item = await storage.updateSmartInventoryItem(parseInt(id), updateData);
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  app.delete("/api/smart-inventory/items/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;

      if (role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const success = await storage.deleteSmartInventoryItem(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Smart Suppliers
  app.get("/api/smart-inventory/suppliers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const suppliers = await storage.getSmartSuppliers(organizationId);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/smart-inventory/suppliers", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const supplierData = {
        ...req.body,
        organizationId,
      };

      const supplier = await storage.createSmartSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.patch("/api/smart-inventory/suppliers/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const updateData = {
        ...req.body,
        organizationId,
      };

      const supplier = await storage.updateSmartSupplier(parseInt(id), updateData);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  // Smart Purchase Orders
  app.get("/api/smart-inventory/purchase-orders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const orders = await storage.getSmartPurchaseOrders(organizationId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/smart-inventory/purchase-orders", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const orderData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const order = await storage.createSmartPurchaseOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.patch("/api/smart-inventory/purchase-orders/:id/status", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;
      const { status } = req.body;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const order = await storage.updateSmartPurchaseOrderStatus(parseInt(id), status);
      res.json(order);
    } catch (error) {
      console.error("Error updating purchase order status:", error);
      res.status(500).json({ message: "Failed to update purchase order status" });
    }
  });

  // Smart Stock Movements
  app.get("/api/smart-inventory/stock-movements", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const movements = await storage.getSmartStockMovements(organizationId, req.query);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.post("/api/smart-inventory/stock-movements", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const movementData = {
        ...req.body,
        organizationId,
        performedBy: userId,
      };

      const movement = await storage.createSmartStockMovement(movementData);
      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
      res.status(500).json({ message: "Failed to create stock movement" });
    }
  });

  // Smart Analytics
  app.get("/api/smart-inventory/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const analytics = await storage.getSmartInventoryAnalytics(organizationId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching inventory analytics:", error);
      res.status(500).json({ message: "Failed to fetch inventory analytics" });
    }
  });

  app.get("/api/smart-inventory/alerts/low-stock", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const alerts = await storage.getSmartLowStockAlerts(organizationId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
      res.status(500).json({ message: "Failed to fetch low stock alerts" });
    }
  });

  app.get("/api/smart-inventory/demand-forecast", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const forecast = await storage.getSmartDemandForecast(organizationId);
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching demand forecast:", error);
      res.status(500).json({ message: "Failed to fetch demand forecast" });
    }
  });

  // ==================== SERVICE MARKETPLACE & VENDOR BOOKING SYSTEM ROUTES ====================

  // Service Vendors Routes
  app.get("/api/service-vendors", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const vendors = await storage.getServiceVendors(organizationId);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching service vendors:", error);
      res.status(500).json({ message: "Failed to fetch service vendors" });
    }
  });

  app.post("/api/service-vendors", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const vendorData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const vendor = await storage.createServiceVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating service vendor:", error);
      res.status(500).json({ message: "Failed to create service vendor" });
    }
  });

  app.patch("/api/service-vendors/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const vendor = await storage.updateServiceVendor(parseInt(id), req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Service vendor not found" });
      }

      res.json(vendor);
    } catch (error) {
      console.error("Error updating service vendor:", error);
      res.status(500).json({ message: "Failed to update service vendor" });
    }
  });

  app.delete("/api/service-vendors/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const success = await storage.deleteServiceVendor(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Service vendor not found" });
      }

      res.json({ message: "Service vendor deleted successfully" });
    } catch (error) {
      console.error("Error deleting service vendor:", error);
      res.status(500).json({ message: "Failed to delete service vendor" });
    }
  });

  // Service Categories Routes
  app.get("/api/service-categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const categories = await storage.getServiceCategories(organizationId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ message: "Failed to fetch service categories" });
    }
  });

  app.post("/api/service-categories", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const categoryData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const category = await storage.createServiceCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating service category:", error);
      res.status(500).json({ message: "Failed to create service category" });
    }
  });

  // Marketplace Services Routes
  app.get("/api/marketplace-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { categoryId, vendorId } = req.query;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const services = await storage.getMarketplaceServices(
        organizationId,
        categoryId ? parseInt(categoryId as string) : undefined,
        vendorId ? parseInt(vendorId as string) : undefined
      );
      res.json(services);
    } catch (error) {
      console.error("Error fetching marketplace services:", error);
      res.status(500).json({ message: "Failed to fetch marketplace services" });
    }
  });

  app.post("/api/marketplace-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const serviceData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const service = await storage.createMarketplaceService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating marketplace service:", error);
      res.status(500).json({ message: "Failed to create marketplace service" });
    }
  });

  // Service Bookings Routes
  app.get("/api/service-bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { propertyId, status } = req.query;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const bookings = await storage.getServiceBookings(
        organizationId,
        propertyId ? parseInt(propertyId as string) : undefined,
        status as string
      );
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  app.post("/api/service-bookings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const bookingData = {
        ...req.body,
        organizationId,
        bookedBy: userId,
        status: 'pending',
      };

      const booking = await storage.createServiceBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  app.patch("/api/service-bookings/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const booking = await storage.approveServiceBooking(parseInt(id), userId);
      if (!booking) {
        return res.status(404).json({ message: "Service booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error approving service booking:", error);
      res.status(500).json({ message: "Failed to approve service booking" });
    }
  });

  app.patch("/api/service-bookings/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;
      const { notes, photos } = req.body;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const booking = await storage.completeServiceBooking(parseInt(id), userId, notes, photos);
      if (!booking) {
        return res.status(404).json({ message: "Service booking not found" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error completing service booking:", error);
      res.status(500).json({ message: "Failed to complete service booking" });
    }
  });

  // Service Reviews Routes
  app.get("/api/service-reviews", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { serviceId, vendorId } = req.query;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const reviews = await storage.getServiceReviews(
        organizationId,
        serviceId ? parseInt(serviceId as string) : undefined,
        vendorId ? parseInt(vendorId as string) : undefined
      );
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching service reviews:", error);
      res.status(500).json({ message: "Failed to fetch service reviews" });
    }
  });

  app.post("/api/service-reviews", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const reviewData = {
        ...req.body,
        organizationId,
        reviewedBy: userId,
      };

      const review = await storage.createServiceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating service review:", error);
      res.status(500).json({ message: "Failed to create service review" });
    }
  });

  // Service Analytics Routes
  app.get("/api/service-analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { periodType, periodStart, periodEnd } = req.query;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const analytics = await storage.getServiceAnalytics(
        organizationId,
        periodType as string,
        periodStart as string,
        periodEnd as string
      );
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching service analytics:", error);
      res.status(500).json({ message: "Failed to fetch service analytics" });
    }
  });

  app.get("/api/service-dashboard-stats", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const stats = await storage.getServiceDashboardStats(organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching service dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch service dashboard stats" });
    }
  });

  // ===== OWNER ONBOARDING SYSTEM API ENDPOINTS =====

  // Get all onboarding processes (admin/PM only)
  app.get("/api/owner-onboarding-processes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;
      const { ownerId, status, propertyId } = req.query;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const filters = {
        ownerId: ownerId as string,
        status: status as string,
        propertyId: propertyId ? parseInt(propertyId as string) : undefined
      };

      const processes = await storage.getOwnerOnboardingProcesses(organizationId, filters);
      res.json(processes);
    } catch (error) {
      console.error("Error fetching onboarding processes:", error);
      res.status(500).json({ message: "Failed to fetch onboarding processes" });
    }
  });

  // Get owner's onboarding process (owner access)
  app.get("/api/owner-onboarding-process", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      const filters = role === 'owner' ? { ownerId: userId } : {};
      const processes = await storage.getOwnerOnboardingProcesses(organizationId, filters);
      
      if (processes.length === 0) {
        return res.status(404).json({ message: "No onboarding process found" });
      }

      // Get the most recent process for the owner
      const process = processes[0];
      
      // Get step details
      const steps = await storage.getOnboardingStepDetails(organizationId, { processId: process.id });
      
      // Get progress
      const progress = await storage.getOnboardingProgress(process.id);

      res.json({
        process,
        steps,
        progress
      });
    } catch (error) {
      console.error("Error fetching onboarding process:", error);
      res.status(500).json({ message: "Failed to fetch onboarding process" });
    }
  });

  // Create new onboarding process
  app.post("/api/owner-onboarding-processes", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role } = req.user;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Admin or PM access required" });
      }

      const processData = {
        ...req.body,
        organizationId,
        status: 'pending' as const,
        currentStep: 'Owner Contact Info',
        overallProgress: 0
      };

      const process = await storage.createOwnerOnboardingProcess(processData);
      res.status(201).json(process);
    } catch (error) {
      console.error("Error creating onboarding process:", error);
      res.status(500).json({ message: "Failed to create onboarding process" });
    }
  });

  // Complete an onboarding step
  app.post("/api/onboarding-step/:processId/:stepNumber/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { processId, stepNumber } = req.params;
      const { organizationId, role, id: userId } = req.user;
      const { completionData } = req.body;

      // Check access permissions
      const process = await storage.getOwnerOnboardingProcess(parseInt(processId));
      if (!process) {
        return res.status(404).json({ message: "Onboarding process not found" });
      }

      // Owner can only complete their own steps, admin/PM can complete any
      if (role === 'owner' && process.ownerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      } else if (!['admin', 'portfolio-manager', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const completedStep = await storage.advanceOnboardingStep(
        parseInt(processId), 
        parseInt(stepNumber), 
        completionData
      );

      // Get updated progress
      const progress = await storage.getOnboardingProgress(parseInt(processId));

      res.json({
        step: completedStep,
        progress
      });
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      res.status(500).json({ message: "Failed to complete onboarding step" });
    }
  });

  // Get owner documents
  app.get("/api/owner-documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { ownerId, category, processId } = req.query;

      const filters: any = {};
      
      // Set filters based on role
      if (role === 'owner') {
        filters.ownerId = userId;
      } else if (['admin', 'portfolio-manager'].includes(role)) {
        if (ownerId) filters.ownerId = ownerId as string;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (category) filters.category = category as string;
      if (processId) filters.processId = parseInt(processId as string);

      const documents = await storage.getOwnerDocuments(organizationId, filters);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching owner documents:", error);
      res.status(500).json({ message: "Failed to fetch owner documents" });
    }
  });

  // Upload owner document
  app.post("/api/owner-documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;

      const documentData = {
        ...req.body,
        organizationId,
        uploadedBy: userId
      };

      // Owners can only upload to their own process
      if (role === 'owner') {
        documentData.ownerId = userId;
      } else if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const document = await storage.createOwnerDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading owner document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // ===== MAINTENANCE & SERVICE TRACKING API ENDPOINTS =====

  // Maintenance service logs routes
  app.get("/api/maintenance/logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId, assignedStaffId, status, priority, category, fromDate, toDate } = req.query;

      let filters: any = {};
      
      // Role-based access control
      if (role === 'staff') {
        filters.assignedStaffId = userId; // Staff can only see their assigned tasks
      } else if (role === 'owner') {
        // Owners can only see logs for their properties
        const ownedProperties = await storage.getPropertiesByOwner(userId);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (propertyId && propertyIds.includes(parseInt(propertyId as string))) {
          filters.propertyId = parseInt(propertyId as string);
        } else if (!propertyId) {
          filters.propertyId = propertyIds[0]; // Default to first property
        } else {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (['admin', 'portfolio-manager'].includes(role)) {
        // Admin and PM can see all logs, optionally filtered
        if (propertyId) filters.propertyId = parseInt(propertyId as string);
        if (assignedStaffId) filters.assignedStaffId = assignedStaffId as string;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;
      if (category) filters.category = category as string;
      if (fromDate) filters.fromDate = new Date(fromDate as string);
      if (toDate) filters.toDate = new Date(toDate as string);

      const logs = await storage.getMaintenanceServiceLogs(organizationId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching maintenance logs:", error);
      res.status(500).json({ message: "Failed to fetch maintenance logs" });
    }
  });

  app.post("/api/maintenance/logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId, firstName, lastName } = req.user;

      if (!['admin', 'portfolio-manager', 'staff', 'owner'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const logData = {
        ...req.body,
        organizationId,
        reportedBy: userId,
        reportedByName: `${firstName || ''} ${lastName || ''}`.trim(),
        status: 'open'
      };

      // Owners can only create logs for their properties
      if (role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(userId);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (!propertyIds.includes(logData.propertyId)) {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      }

      const log = await storage.createMaintenanceServiceLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating maintenance log:", error);
      res.status(500).json({ message: "Failed to create maintenance log" });
    }
  });

  app.post("/api/maintenance/logs/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId, firstName, lastName } = req.user;
      const logId = parseInt(req.params.id);

      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const existingLog = await storage.getMaintenanceServiceLog(logId);
      if (!existingLog) {
        return res.status(404).json({ message: "Maintenance log not found" });
      }

      // Staff can only complete their assigned tasks
      if (role === 'staff' && existingLog.assignedStaffId !== userId) {
        return res.status(403).json({ message: "Access denied to this maintenance log" });
      }

      const completionData = {
        ...req.body,
        completedBy: `${firstName || ''} ${lastName || ''}`.trim()
      };

      const log = await storage.completeMaintenanceServiceLog(logId, completionData);
      res.json(log);
    } catch (error) {
      console.error("Error completing maintenance log:", error);
      res.status(500).json({ message: "Failed to complete maintenance log" });
    }
  });

  // Warranty tracker routes
  app.get("/api/maintenance/warranties", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId, status, expiringWithinDays } = req.query;

      let filters: any = {};

      // Role-based access control
      if (role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(userId);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (propertyId && propertyIds.includes(parseInt(propertyId as string))) {
          filters.propertyId = parseInt(propertyId as string);
        } else if (!propertyId) {
          filters.propertyId = propertyIds[0]; // Default to first property
        } else {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (['admin', 'portfolio-manager', 'staff'].includes(role)) {
        if (propertyId) filters.propertyId = parseInt(propertyId as string);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (status) filters.status = status as string;
      if (expiringWithinDays) filters.expiringWithinDays = parseInt(expiringWithinDays as string);

      const warranties = await storage.getWarrantyTrackers(organizationId, filters);
      res.json(warranties);
    } catch (error) {
      console.error("Error fetching warranties:", error);
      res.status(500).json({ message: "Failed to fetch warranties" });
    }
  });

  // AI maintenance recommendations routes
  app.get("/api/maintenance/ai-recommendations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId, status, priority, minConfidence } = req.query;

      let filters: any = {};

      // Role-based access control
      if (role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(userId);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (propertyId && propertyIds.includes(parseInt(propertyId as string))) {
          filters.propertyId = parseInt(propertyId as string);
        } else if (!propertyId) {
          filters.propertyId = propertyIds[0]; // Default to first property
        } else {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (['admin', 'portfolio-manager', 'staff'].includes(role)) {
        if (propertyId) filters.propertyId = parseInt(propertyId as string);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;
      if (minConfidence) filters.minConfidence = parseFloat(minConfidence as string);

      const recommendations = await storage.getAiMaintenanceRecommendations(organizationId, filters);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching AI recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations" });
    }
  });

  app.post("/api/maintenance/ai-recommendations/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId, firstName, lastName } = req.user;
      const recommendationId = parseInt(req.params.id);
      const { reviewNotes } = req.body;

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const reviewedBy = `${firstName || ''} ${lastName || ''}`.trim();
      const recommendation = await storage.approveAiRecommendation(recommendationId, reviewedBy, reviewNotes);
      
      if (!recommendation) {
        return res.status(404).json({ message: "AI recommendation not found" });
      }

      res.json(recommendation);
    } catch (error) {
      console.error("Error approving AI recommendation:", error);
      res.status(500).json({ message: "Failed to approve AI recommendation" });
    }
  });

  app.post("/api/maintenance/ai-recommendations/:id/convert-to-task", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId, firstName, lastName } = req.user;
      const recommendationId = parseInt(req.params.id);

      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const convertedBy = `${firstName || ''} ${lastName || ''}`.trim();
      const result = await storage.convertAiRecommendationToTask(recommendationId, convertedBy);
      
      res.json(result);
    } catch (error) {
      console.error("Error converting AI recommendation to task:", error);
      res.status(500).json({ message: "Failed to convert AI recommendation to task" });
    }
  });

  // Maintenance analytics routes
  app.get("/api/maintenance/dashboard-summary", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId, role, id: userId } = req.user;
      const { propertyId } = req.query;

      let filters: any = {
        userRole: role,
        userId
      };

      // Role-based access control
      if (role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(userId);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (propertyId && propertyIds.includes(parseInt(propertyId as string))) {
          filters.propertyId = parseInt(propertyId as string);
        } else if (!propertyId) {
          filters.propertyId = propertyIds[0]; // Default to first property
        } else {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (['admin', 'portfolio-manager', 'staff'].includes(role)) {
        if (propertyId) filters.propertyId = parseInt(propertyId as string);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      const summary = await storage.getMaintenanceDashboardSummary(organizationId, filters);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching maintenance dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch maintenance dashboard summary" });
    }
  });

  // ===== OWNER ONBOARDING & UTILITY SETTINGS MODULE API ROUTES =====

  // Owner Onboarding Steps routes
  app.get("/api/owner-onboarding/steps", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { ownerId = req.user?.id } = req.query;
      
      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager' && req.user?.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const steps = await storage.getOwnerOnboardingSteps(organizationId, ownerId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching onboarding steps:", error);
      res.status(500).json({ message: "Failed to fetch onboarding steps" });
    }
  });

  app.get("/api/owner-onboarding/steps/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const step = await storage.getOwnerOnboardingStep(stepId);
      
      if (!step) {
        return res.status(404).json({ message: "Onboarding step not found" });
      }

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager' && req.user?.id !== step.ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(step);
    } catch (error) {
      console.error("Error fetching onboarding step:", error);
      res.status(500).json({ message: "Failed to fetch onboarding step" });
    }
  });

  app.put("/api/owner-onboarding/steps/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const updateData = req.body;

      // Role-based access control for updating steps
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedStep = await storage.updateOwnerOnboardingStep(stepId, updateData);
      if (!updatedStep) {
        return res.status(404).json({ message: "Onboarding step not found" });
      }

      res.json(updatedStep);
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      res.status(500).json({ message: "Failed to update onboarding step" });
    }
  });

  app.post("/api/owner-onboarding/steps/:id/complete", isDemoAuthenticated, async (req: any, res) => {
    try {
      const stepId = parseInt(req.params.id);
      const completedBy = req.user?.id;

      const completedStep = await storage.completeOnboardingStep(stepId, completedBy);
      if (!completedStep) {
        return res.status(404).json({ message: "Onboarding step not found" });
      }

      res.json(completedStep);
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      res.status(500).json({ message: "Failed to complete onboarding step" });
    }
  });

  // Property Utility Settings routes
  app.get("/api/properties/:propertyId/utility-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);

      // Role-based access control
      if (req.user?.role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(req.user.id);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (!propertyIds.includes(propertyId)) {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (!['admin', 'portfolio-manager', 'staff'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const settings = await storage.getOwnerPropertyUtilitySettings(organizationId, propertyId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching utility settings:", error);
      res.status(500).json({ message: "Failed to fetch utility settings" });
    }
  });

  app.post("/api/properties/:propertyId/utility-settings", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);
      const settingsData = { ...req.body, organizationId, propertyId };

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const newSettings = await storage.createOwnerPropertyUtilitySettings(settingsData);
      res.status(201).json(newSettings);
    } catch (error) {
      console.error("Error creating utility settings:", error);
      res.status(500).json({ message: "Failed to create utility settings" });
    }
  });

  app.put("/api/properties/:propertyId/utility-settings/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const settingsId = parseInt(req.params.id);
      const updateData = req.body;

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedSettings = await storage.updateOwnerPropertyUtilitySettings(settingsId, updateData);
      if (!updatedSettings) {
        return res.status(404).json({ message: "Utility settings not found" });
      }

      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating utility settings:", error);
      res.status(500).json({ message: "Failed to update utility settings" });
    }
  });

  // Property Maintenance History routes
  app.get("/api/properties/:propertyId/maintenance-history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);

      // Role-based access control
      if (req.user?.role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(req.user.id);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (!propertyIds.includes(propertyId)) {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (!['admin', 'portfolio-manager', 'staff'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const history = await storage.getOwnerPropertyMaintenanceHistory(organizationId, propertyId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching maintenance history:", error);
      res.status(500).json({ message: "Failed to fetch maintenance history" });
    }
  });

  app.post("/api/properties/:propertyId/maintenance-history", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);
      const historyData = { ...req.body, organizationId, propertyId };

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const newHistory = await storage.createOwnerPropertyMaintenanceHistory(historyData);
      res.status(201).json(newHistory);
    } catch (error) {
      console.error("Error creating maintenance history:", error);
      res.status(500).json({ message: "Failed to create maintenance history" });
    }
  });

  // Property Billing Logs routes
  app.get("/api/properties/:propertyId/billing-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);

      // Role-based access control
      if (req.user?.role === 'owner') {
        const ownedProperties = await storage.getPropertiesByOwner(req.user.id);
        const propertyIds = ownedProperties.map((p: any) => p.id);
        if (!propertyIds.includes(propertyId)) {
          return res.status(403).json({ message: "Access denied to this property" });
        }
      } else if (!['admin', 'portfolio-manager', 'staff'].includes(req.user?.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const logs = await storage.getPropertyBillingLogs(organizationId, propertyId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching billing logs:", error);
      res.status(500).json({ message: "Failed to fetch billing logs" });
    }
  });

  app.post("/api/properties/:propertyId/billing-logs", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const propertyId = parseInt(req.params.propertyId);
      const logData = { ...req.body, organizationId, propertyId };

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager') {
        return res.status(403).json({ message: "Access denied" });
      }

      const newLog = await storage.createPropertyBillingLog(logData);
      res.status(201).json(newLog);
    } catch (error) {
      console.error("Error creating billing log:", error);
      res.status(500).json({ message: "Failed to create billing log" });
    }
  });

  // Owner Onboarding Documents routes
  app.get("/api/owner-onboarding/documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { ownerId = req.user?.id } = req.query;

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager' && req.user?.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const documents = await storage.getOwnerOnboardingDocuments(organizationId, ownerId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching onboarding documents:", error);
      res.status(500).json({ message: "Failed to fetch onboarding documents" });
    }
  });

  app.post("/api/owner-onboarding/documents", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const documentData = { ...req.body, organizationId };

      const newDocument = await storage.createOwnerOnboardingDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error creating onboarding document:", error);
      res.status(500).json({ message: "Failed to create onboarding document" });
    }
  });

  app.put("/api/owner-onboarding/documents/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const updateData = req.body;

      const updatedDocument = await storage.updateOwnerOnboardingDocument(documentId, updateData);
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating onboarding document:", error);
      res.status(500).json({ message: "Failed to update onboarding document" });
    }
  });

  // Owner Service Selections routes
  app.get("/api/owner-onboarding/services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const { ownerId = req.user?.id } = req.query;

      // Role-based access control
      if (req.user?.role !== 'admin' && req.user?.role !== 'portfolio-manager' && req.user?.id !== ownerId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const services = await storage.getOwnerServiceSelections(organizationId, ownerId);
      res.json(services);
    } catch (error) {
      console.error("Error fetching service selections:", error);
      res.status(500).json({ message: "Failed to fetch service selections" });
    }
  });

  app.post("/api/owner-onboarding/services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { organizationId } = getTenantContext(req);
      const serviceData = { ...req.body, organizationId };

      const newService = await storage.createOwnerServiceSelection(serviceData);
      res.status(201).json(newService);
    } catch (error) {
      console.error("Error creating service selection:", error);
      res.status(500).json({ message: "Failed to create service selection" });
    }
  });

  app.put("/api/owner-onboarding/services/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const updateData = req.body;

      const updatedService = await storage.updateOwnerServiceSelection(serviceId, updateData);
      if (!updatedService) {
        return res.status(404).json({ message: "Service selection not found" });
      }

      res.json(updatedService);
    } catch (error) {
      console.error("Error updating service selection:", error);
      res.status(500).json({ message: "Failed to update service selection" });
    }
  });

  // ===== GUEST PORTAL SMART REQUESTS & AI CHAT API ROUTES =====

  // Guest Chat Conversations
  app.get("/api/guest-chat/conversations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { reservationId, guestId, propertyId, status } = req.query;
      const conversations = await storage.getGuestChatConversations("demo-org", {
        reservationId, guestId, propertyId: propertyId ? parseInt(propertyId) : undefined, status
      });
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching chat conversations:", error);
      res.status(500).json({ message: "Failed to fetch chat conversations" });
    }
  });

  app.get("/api/guest-chat/conversations/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getGuestChatConversation(conversationId);
      
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/guest-chat/conversations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const conversationData = {
        ...req.body,
        organizationId: "demo-org"
      };
      
      const conversation = await storage.createGuestChatConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Get or create conversation for a reservation
  app.post("/api/guest-chat/conversations/get-or-create", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { reservationId, guestId, propertyId } = req.body;
      const conversation = await storage.getOrCreateGuestConversation(reservationId, guestId, propertyId);
      res.json(conversation);
    } catch (error) {
      console.error("Error getting or creating conversation:", error);
      res.status(500).json({ message: "Failed to get or create conversation" });
    }
  });

  // Guest Chat Messages
  app.get("/api/guest-chat/conversations/:id/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { limit } = req.query;
      
      const messages = await storage.getGuestChatMessages("demo-org", conversationId, limit ? parseInt(limit) : undefined);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/guest-chat/messages", isDemoAuthenticated, async (req: any, res) => {
    try {
      const messageData = {
        ...req.body,
        organizationId: "demo-org"
      };
      
      const message = await storage.createGuestChatMessage(messageData);
      
      // Process message with AI if it's a guest message
      if (message.senderType === "guest") {
        const aiAnalysis = await storage.analyzeMessageForServiceIntent(message.messageContent, message.conversationId);
        
        // Create AI intent analysis record
        await storage.createAiChatIntentAnalysis({
          organizationId: "demo-org",
          messageId: message.id,
          detectedIntent: aiAnalysis.intent,
          confidenceScore: aiAnalysis.confidence,
          serviceCategory: aiAnalysis.serviceCategory,
          urgency: "normal",
          sentiment: "positive",
          extractedEntities: aiAnalysis.extractedEntities,
          suggestedActions: aiAnalysis.suggestedActions,
          aiModel: "gpt-4o",
          processingTime: 1000,
        });

        // Auto-generate service request if confidence is high enough
        if (aiAnalysis.confidence > 80 && aiAnalysis.intent === "service_request") {
          await storage.generateServiceRequestFromMessage(message.id, aiAnalysis.intent, aiAnalysis.serviceCategory || "general");
        }

        // Generate AI response
        const aiResponse = await storage.createGuestChatMessage({
          organizationId: "demo-org",
          conversationId: message.conversationId,
          messageType: "ai_response",
          senderType: "ai",
          senderId: null,
          messageContent: `I've received your request and ${aiAnalysis.confidence > 80 ? 'automatically created a service request' : 'forwarded it to our team'}. Someone will assist you shortly!`,
          aiProcessed: false,
          intentDetected: null,
          confidenceScore: null,
        });

        res.status(201).json({ message, aiResponse, analysis: aiAnalysis });
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  app.put("/api/guest-chat/messages/:id/read", isDemoAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const { readBy } = req.body;
      
      const message = await storage.markGuestChatMessageRead(messageId, readBy);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Guest Service Requests
  app.get("/api/guest-service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { reservationId, guestId, status, category, propertyId } = req.query;
      const requests = await storage.getGuestServiceRequests("demo-org", {
        reservationId, guestId, status, category, propertyId: propertyId ? parseInt(propertyId) : undefined
      });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ message: "Failed to fetch service requests" });
    }
  });

  app.get("/api/guest-service-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getGuestServiceRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  app.post("/api/guest-service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const requestData = {
        ...req.body,
        organizationId: "demo-org"
      };
      
      const request = await storage.createGuestServiceRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.put("/api/guest-service-requests/:id/approve", isDemoAuthenticated, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { approvedBy, estimatedCost, assignedDepartment } = req.body;
      
      const request = await storage.approveGuestServiceRequest(requestId, approvedBy, estimatedCost, assignedDepartment);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      // Create corresponding task
      await storage.createTaskFromServiceRequest(requestId);
      
      res.json(request);
    } catch (error) {
      console.error("Error approving service request:", error);
      res.status(500).json({ message: "Failed to approve service request" });
    }
  });

  app.put("/api/guest-service-requests/:id/decline", isDemoAuthenticated, async (req: any, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const { declinedBy, reason } = req.body;
      
      const request = await storage.declineGuestServiceRequest(requestId, declinedBy, reason);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error declining service request:", error);
      res.status(500).json({ message: "Failed to decline service request" });
    }
  });

  // Pre-arrival Information
  app.get("/api/guest-pre-arrival", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { reservationId, guestId, propertyId } = req.query;
      const info = await storage.getGuestPreArrivalInfo("demo-org", {
        reservationId, guestId, propertyId: propertyId ? parseInt(propertyId) : undefined
      });
      res.json(info);
    } catch (error) {
      console.error("Error fetching pre-arrival info:", error);
      res.status(500).json({ message: "Failed to fetch pre-arrival info" });
    }
  });

  app.get("/api/guest-pre-arrival/reservation/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { reservationId } = req.params;
      const info = await storage.getGuestPreArrivalInfoByReservation(reservationId);
      res.json(info);
    } catch (error) {
      console.error("Error fetching pre-arrival info by reservation:", error);
      res.status(500).json({ message: "Failed to fetch pre-arrival info" });
    }
  });

  app.post("/api/guest-pre-arrival", isDemoAuthenticated, async (req: any, res) => {
    try {
      const infoData = {
        ...req.body,
        organizationId: "demo-org"
      };
      
      const info = await storage.createGuestPreArrivalInfo(infoData);
      res.status(201).json(info);
    } catch (error) {
      console.error("Error creating pre-arrival info:", error);
      res.status(500).json({ message: "Failed to create pre-arrival info" });
    }
  });

  // Test AI message analysis endpoint
  app.post("/api/ai-analyze-message", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { messageText, conversationId } = req.body;
      const analysis = await storage.analyzeMessageForServiceIntent(messageText, conversationId);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing message:", error);
      res.status(500).json({ message: "Failed to analyze message" });
    }
  });

  // ===== GUEST ACTIVITY TRACKER & RECOMMENDATIONS AI ROUTES =====

  // Get property activity recommendations
  app.get("/api/guest-activity/recommendations", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const propertyId = parseInt(req.query.propertyId) || 1;
      const filters = {
        category: req.query.category,
        isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined,
        suitableFor: req.query.suitableFor ? req.query.suitableFor.split(',') : undefined
      };

      const recommendations = await storage.getPropertyActivityRecommendations(organizationId, propertyId, filters);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching activity recommendations:", error);
      res.status(500).json({ message: "Failed to fetch activity recommendations" });
    }
  });

  // Get personalized recommendations for a guest
  app.get("/api/guest-activity/recommendations/personalized", isDemoAuthenticated, async (req: any, res) => {
    try {
      const reservationId = req.query.reservationId as string;
      const guestId = req.query.guestId as string;
      const propertyId = parseInt(req.query.propertyId) || 1;

      if (!reservationId || !guestId) {
        return res.status(400).json({ message: "reservationId and guestId are required" });
      }

      const recommendations = await storage.getPersonalizedRecommendations(reservationId, guestId, propertyId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      res.status(500).json({ message: "Failed to fetch personalized recommendations" });
    }
  });

  // Get guest activity preferences
  app.get("/api/guest-activity/preferences/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const reservationId = req.params.reservationId;
      const preferences = await storage.getGuestActivityPreferences(reservationId);
      
      if (!preferences) {
        return res.status(404).json({ message: "Guest preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching guest preferences:", error);
      res.status(500).json({ message: "Failed to fetch guest preferences" });
    }
  });

  // Create guest activity preferences
  app.post("/api/guest-activity/preferences", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const preferencesData = {
        ...req.body,
        organizationId
      };

      const preferences = await storage.createGuestActivityPreferences(preferencesData);
      res.status(201).json(preferences);
    } catch (error) {
      console.error("Error creating guest preferences:", error);
      res.status(500).json({ message: "Failed to create guest preferences" });
    }
  });

  // Update guest activity preferences
  app.put("/api/guest-activity/preferences/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const reservationId = req.params.reservationId;
      const preferencesData = req.body;

      const preferences = await storage.updateGuestActivityPreferences(reservationId, preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating guest preferences:", error);
      res.status(500).json({ message: "Failed to update guest preferences" });
    }
  });

  // Create recommendation interaction
  app.post("/api/guest-activity/interactions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const interactionData = {
        ...req.body,
        organizationId
      };

      const interaction = await storage.createRecommendationInteraction(interactionData);
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error creating recommendation interaction:", error);
      res.status(500).json({ message: "Failed to create recommendation interaction" });
    }
  });

  // Get recommendation interactions
  app.get("/api/guest-activity/interactions", isDemoAuthenticated, async (req: any, res) => {
    try {
      const reservationId = req.query.reservationId as string;
      const filters = {
        recommendationId: req.query.recommendationId ? parseInt(req.query.recommendationId) : undefined,
        interactionType: req.query.interactionType
      };

      if (!reservationId) {
        return res.status(400).json({ message: "reservationId is required" });
      }

      const interactions = await storage.getRecommendationInteractions(reservationId, filters);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching recommendation interactions:", error);
      res.status(500).json({ message: "Failed to fetch recommendation interactions" });
    }
  });

  // Get recommendation analytics
  app.get("/api/guest-activity/analytics", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const propertyId = parseInt(req.query.propertyId) || 1;
      const filters = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        category: req.query.category
      };

      const analytics = await storage.getRecommendationAnalytics(organizationId, propertyId, filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching recommendation analytics:", error);
      res.status(500).json({ message: "Failed to fetch recommendation analytics" });
    }
  });

  // Admin routes for managing recommendations
  app.post("/api/admin/guest-activity/recommendations", requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const recommendationData = {
        ...req.body,
        organizationId
      };

      const recommendation = await storage.createPropertyActivityRecommendation(recommendationData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error("Error creating activity recommendation:", error);
      res.status(500).json({ message: "Failed to create activity recommendation" });
    }
  });

  app.put("/api/admin/guest-activity/recommendations/:id", requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const recommendationData = req.body;

      const recommendation = await storage.updatePropertyActivityRecommendation(id, recommendationData);
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating activity recommendation:", error);
      res.status(500).json({ message: "Failed to update activity recommendation" });
    }
  });

  app.delete("/api/admin/guest-activity/recommendations/:id", requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePropertyActivityRecommendation(id);
      
      if (success) {
        res.json({ message: "Activity recommendation deleted successfully" });
      } else {
        res.status(404).json({ message: "Activity recommendation not found" });
      }
    } catch (error) {
      console.error("Error deleting activity recommendation:", error);
      res.status(500).json({ message: "Failed to delete activity recommendation" });
    }
  });

  // ===== COMPREHENSIVE TASK SCHEDULING SYSTEM API ROUTES =====

  // Get scheduled tasks
  app.get("/api/tasks/scheduled", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const organizationId = "demo-org-1";
      
      const { 
        propertyId, 
        date, 
        startDate, 
        endDate, 
        reservationId, 
        status, 
        assignedRole, 
        guestVisible 
      } = req.query;

      const filters: any = { role };
      
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (date) filters.date = date;
      if (startDate && endDate) {
        filters.dateRange = { start: startDate, end: endDate };
      }
      if (reservationId) filters.reservationId = reservationId;
      if (status) filters.status = status;
      if (assignedRole) filters.assignedRole = assignedRole;
      if (guestVisible !== undefined) filters.guestVisible = guestVisible === 'true';

      const tasks = await storage.getScheduledTasks(organizationId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
      res.status(500).json({ message: "Failed to fetch scheduled tasks" });
    }
  });

  // Get single scheduled task
  app.get("/api/tasks/scheduled/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getScheduledTask(parseInt(id));
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create new scheduled task
  app.post("/api/tasks/scheduled", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const organizationId = "demo-org-1";

      // Check permissions
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const taskData = {
        ...req.body,
        organizationId,
        createdBy: userId,
      };

      const task = await storage.createScheduledTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update scheduled task
  app.put("/api/tasks/scheduled/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;

      // Check permissions
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = {
        ...req.body,
        updatedBy: userId,
      };

      const task = await storage.updateScheduledTask(parseInt(id), updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Update task status with evidence
  app.patch("/api/tasks/scheduled/:id/status", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role, id: userId } = req.user;
      const { id } = req.params;
      const { status, evidence, notes } = req.body;

      // Check permissions - staff can update their own tasks, admin/PM can update any
      if (!['admin', 'portfolio-manager', 'staff'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const task = await storage.updateTaskStatus(parseInt(id), status, userId, evidence);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  // Delete scheduled task
  app.delete("/api/tasks/scheduled/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.user;
      const { id } = req.params;

      // Check permissions - only admin/PM can delete tasks
      if (!['admin', 'portfolio-manager'].includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const success = await storage.deleteScheduledTask(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Get demo guest information
  app.get("/api/demo/guest/:reservationId", async (req: any, res) => {
    try {
      const { reservationId } = req.params;
      const guestInfo = await storage.getDemoGuestInfo(reservationId);
      
      if (!guestInfo) {
        return res.status(404).json({ message: "Guest information not found" });
      }
      
      res.json(guestInfo);
    } catch (error) {
      console.error("Error fetching guest info:", error);
      res.status(500).json({ message: "Failed to fetch guest information" });
    }
  });

  // Get demo property information
  app.get("/api/demo/property/:propertyId", async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const propertyInfo = await storage.getDemoPropertyInfo(parseInt(propertyId));
      
      if (!propertyInfo) {
        return res.status(404).json({ message: "Property information not found" });
      }
      
      res.json(propertyInfo);
    } catch (error) {
      console.error("Error fetching property info:", error);
      res.status(500).json({ message: "Failed to fetch property information" });
    }
  });

  // ===== COMPREHENSIVE TASK SCHEDULING API ENDPOINTS =====
  
  // Get scheduled tasks with comprehensive filtering
  app.get("/api/tasks/scheduled", isDemoAuthenticated, async (req: any, res) => {
    try {
      const organizationId = req.user?.organizationId || "default-org";
      const { 
        role, 
        assignedRole, 
        propertyId, 
        reservationId, 
        date, 
        startDate, 
        endDate, 
        status, 
        guestVisible 
      } = req.query;

      const filters: any = {};
      
      if (role) filters.role = role;
      if (assignedRole) filters.assignedRole = assignedRole;
      if (propertyId) filters.propertyId = parseInt(propertyId);
      if (reservationId) filters.reservationId = reservationId;
      if (date) filters.date = date;
      if (startDate && endDate) {
        filters.dateRange = { start: startDate, end: endDate };
      }
      if (status) filters.status = status;
      if (guestVisible !== undefined) filters.guestVisible = guestVisible === 'true';

      const tasks = await storage.getScheduledTasks(organizationId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching scheduled tasks:", error);
      res.status(500).json({ message: "Failed to fetch scheduled tasks" });
    }
  });

  // Get single scheduled task
  app.get("/api/tasks/scheduled/:taskId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const task = await storage.getScheduledTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching scheduled task:", error);
      res.status(500).json({ message: "Failed to fetch scheduled task" });
    }
  });

  // Update task status with evidence
  app.patch("/api/tasks/scheduled/:taskId/status", isDemoAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { status, evidence } = req.body;
      const userId = req.user.id;

      const updatedTask = await storage.updateTaskStatus(taskId, status, userId, evidence);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  // Get demo task schedule (legacy endpoint for compatibility)
  app.get("/api/demo/tasks", async (req: any, res) => {
    try {
      const { role, date, reservationId } = req.query;
      const tasks = await storage.getDemoTaskSchedule(
        role as string, 
        date as string, 
        reservationId as string
      );
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching demo tasks:", error);
      res.status(500).json({ message: "Failed to fetch demo tasks" });
    }
  });

  // ===== SYSTEM INTEGRITY CHECK API ENDPOINTS =====
  
  // Get latest system integrity report
  app.get("/api/admin/system-integrity-check", requireAdmin, async (req: any, res) => {
    try {
      const { SystemIntegrityScanner, integrityStorage } = await import('./systemIntegrityScanner');
      
      let report = integrityStorage.getLatestReport();
      
      // If no report exists, run a scan
      if (!report) {
        const scanner = new SystemIntegrityScanner();
        report = await scanner.runFullScan();
        integrityStorage.saveReport(report);
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching integrity report:", error);
      res.status(500).json({ message: "Failed to fetch integrity report" });
    }
  });

  // Run new system integrity scan
  app.post("/api/admin/system-integrity-check/scan", requireAdmin, async (req: any, res) => {
    try {
      const { SystemIntegrityScanner, integrityStorage } = await import('./systemIntegrityScanner');
      
      const scanner = new SystemIntegrityScanner();
      const report = await scanner.runFullScan();
      
      integrityStorage.saveReport(report);
      
      res.json({ 
        message: "Scan completed successfully", 
        scanId: report.scanId,
        totalIssues: report.totalIssues 
      });
    } catch (error) {
      console.error("Error running integrity scan:", error);
      res.status(500).json({ message: "Failed to run integrity scan" });
    }
  });

  // Update issue status (flag as resolved or send to developer)
  app.patch("/api/admin/system-integrity-check/issues/:issueId", requireAdmin, async (req: any, res) => {
    try {
      const { issueId } = req.params;
      const { status, notes } = req.body;
      
      const { integrityStorage } = await import('./systemIntegrityScanner');
      
      const updatedIssue = integrityStorage.updateIssue(issueId, {
        status,
        notes,
        ...(status === 'flagged_resolved' && { resolvedAt: new Date().toISOString() }),
        ...(status === 'sent_to_developer' && { sentToDeveloperAt: new Date().toISOString() })
      });
      
      if (!updatedIssue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      res.json({ 
        message: "Issue updated successfully", 
        issue: updatedIssue 
      });
    } catch (error) {
      console.error("Error updating issue:", error);
      res.status(500).json({ message: "Failed to update issue" });
    }
  });

  // Get specific issue details
  app.get("/api/admin/system-integrity-check/issues/:issueId", requireAdmin, async (req: any, res) => {
    try {
      const { issueId } = req.params;
      
      const { integrityStorage } = await import('./systemIntegrityScanner');
      
      const issue = integrityStorage.getIssue(issueId);
      
      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }
      
      res.json(issue);
    } catch (error) {
      console.error("Error fetching issue:", error);
      res.status(500).json({ message: "Failed to fetch issue" });
    }
  });

  // ===== CROSS-SYNCED TASK VISIBILITY API ROUTES =====

  // Helper to get organization and create storage instance
  const getCrossSyncStorage = (req: any) => {
    const organizationId = req.user?.organizationId || "demo-org";
    return new CrossSyncedTaskVisibilityStorage(organizationId);
  };

  // Guest Service Requests
  app.get("/api/cross-sync/guest-service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const {
        bookingId,
        reservationId,
        propertyId,
        status,
        requestType,
        assignedDepartment,
        isVisible
      } = req.query;

      const filters = {
        ...(bookingId && { bookingId: parseInt(bookingId) }),
        ...(reservationId && { reservationId }),
        ...(propertyId && { propertyId: parseInt(propertyId) }),
        ...(status && { status }),
        ...(requestType && { requestType }),
        ...(assignedDepartment && { assignedDepartment }),
        ...(isVisible !== undefined && { isVisible: isVisible === 'true' })
      };

      const requests = await crossSyncStorage.getGuestServiceRequests(filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching guest service requests:", error);
      res.status(500).json({ message: "Failed to fetch guest service requests" });
    }
  });

  app.get("/api/cross-sync/guest-service-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const requestId = parseInt(req.params.id);
      
      const request = await crossSyncStorage.getGuestServiceRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ message: "Failed to fetch service request" });
    }
  });

  app.post("/api/cross-sync/guest-service-requests", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      
      const validatedData = insertGuestServiceRequestSchema.parse({
        ...req.body,
        requestedBy: req.user?.id
      });

      const request = await crossSyncStorage.createGuestServiceRequest(validatedData);
      res.json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(500).json({ message: "Failed to create service request" });
    }
  });

  app.put("/api/cross-sync/guest-service-requests/:id", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const requestId = parseInt(req.params.id);
      
      const validatedData = insertGuestServiceRequestSchema.partial().parse(req.body);
      
      const updatedRequest = await crossSyncStorage.updateGuestServiceRequest(requestId, validatedData);
      if (!updatedRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(500).json({ message: "Failed to update service request" });
    }
  });

  // Guest Confirmed Services
  app.get("/api/cross-sync/guest-confirmed-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const {
        bookingId,
        reservationId,
        propertyId,
        serviceType,
        scheduledDate,
        isActive,
        isCompleted
      } = req.query;

      const filters = {
        ...(bookingId && { bookingId: parseInt(bookingId) }),
        ...(reservationId && { reservationId }),
        ...(propertyId && { propertyId: parseInt(propertyId) }),
        ...(serviceType && { serviceType }),
        ...(scheduledDate && { scheduledDate }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(isCompleted !== undefined && { isCompleted: isCompleted === 'true' })
      };

      const services = await crossSyncStorage.getGuestConfirmedServices(filters);
      res.json(services);
    } catch (error) {
      console.error("Error fetching confirmed services:", error);
      res.status(500).json({ message: "Failed to fetch confirmed services" });
    }
  });

  app.post("/api/cross-sync/guest-confirmed-services", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      
      const validatedData = insertGuestConfirmedServiceSchema.parse({
        ...req.body,
        confirmedBy: req.user?.id
      });

      const service = await crossSyncStorage.createGuestConfirmedService(validatedData);
      res.json(service);
    } catch (error) {
      console.error("Error creating confirmed service:", error);
      res.status(500).json({ message: "Failed to create confirmed service" });
    }
  });

  // Booking Linked Tasks
  app.get("/api/cross-sync/booking-linked-tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const {
        taskId,
        bookingId,
        reservationId,
        taskCategory,
        isGuestVisible,
        isServiceGenerated
      } = req.query;

      const filters = {
        ...(taskId && { taskId: parseInt(taskId) }),
        ...(bookingId && { bookingId: parseInt(bookingId) }),
        ...(reservationId && { reservationId }),
        ...(taskCategory && { taskCategory }),
        ...(isGuestVisible !== undefined && { isGuestVisible: isGuestVisible === 'true' }),
        ...(isServiceGenerated !== undefined && { isServiceGenerated: isServiceGenerated === 'true' })
      };

      const linkedTasks = await crossSyncStorage.getBookingLinkedTasks(filters);
      res.json(linkedTasks);
    } catch (error) {
      console.error("Error fetching booking linked tasks:", error);
      res.status(500).json({ message: "Failed to fetch booking linked tasks" });
    }
  });

  app.post("/api/cross-sync/booking-linked-tasks", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      
      const validatedData = insertBookingLinkedTaskSchema.parse(req.body);

      const linkedTask = await crossSyncStorage.createBookingLinkedTask(validatedData);
      res.json(linkedTask);
    } catch (error) {
      console.error("Error creating booking linked task:", error);
      res.status(500).json({ message: "Failed to create booking linked task" });
    }
  });

  // Cross-Synced Views
  app.get("/api/cross-sync/guest-visible-tasks/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const { reservationId } = req.params;
      
      const guestTasks = await crossSyncStorage.getGuestVisibleTasks(reservationId);
      res.json(guestTasks);
    } catch (error) {
      console.error("Error fetching guest visible tasks:", error);
      res.status(500).json({ message: "Failed to fetch guest visible tasks" });
    }
  });

  app.get("/api/cross-sync/staff-tasks/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const { reservationId } = req.params;
      const { staffRole } = req.query;
      
      const staffTasks = await crossSyncStorage.getStaffTasksForReservation(reservationId, staffRole);
      res.json(staffTasks);
    } catch (error) {
      console.error("Error fetching staff tasks:", error);
      res.status(500).json({ message: "Failed to fetch staff tasks" });
    }
  });

  // Service Request Processing
  app.post("/api/cross-sync/process-service-request/:requestId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const requestId = parseInt(req.params.requestId);
      const { action, ...data } = req.body;
      
      if (!['approve', 'reject', 'complete'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve', 'reject', or 'complete'" });
      }

      const result = await crossSyncStorage.processServiceRequest(requestId, action, {
        ...data,
        approvedBy: req.user?.id
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error processing service request:", error);
      res.status(500).json({ message: "Failed to process service request" });
    }
  });

  // Analytics and Reporting
  app.get("/api/cross-sync/reservation-summary/:reservationId", isDemoAuthenticated, async (req: any, res) => {
    try {
      const crossSyncStorage = getCrossSyncStorage(req);
      const { reservationId } = req.params;
      
      const summary = await crossSyncStorage.getReservationTaskSummary(reservationId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching reservation summary:", error);
      res.status(500).json({ message: "Failed to fetch reservation summary" });
    }
  });

  // ===== EXTENDED UTILITIES MANAGEMENT API ROUTES =====
  
  // Import ExtendedUtilitiesStorage
  const { ExtendedUtilitiesStorage } = await import("./extendedUtilitiesStorage");

  // Middleware for utilities access - Admin/PM full access, Owner limited access based on permissions
  const requireUtilitiesAccess = (req: any, res: any, next: any) => {
    const userRole = req.user?.role;
    if (!['admin', 'portfolio-manager', 'owner'].includes(userRole)) {
      return res.status(403).json({ message: "Utilities access not allowed for this role" });
    }
    next();
  };

  // Get all property utilities
  app.get("/api/extended-utilities/properties/:propertyId/utilities", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const propertyId = parseInt(req.params.propertyId);
      
      const utilities = await utilStorage.getPropertyUtilities(propertyId);
      res.json(utilities);
    } catch (error) {
      console.error("Error fetching property utilities:", error);
      res.status(500).json({ message: "Failed to fetch property utilities" });
    }
  });

  // Get all utilities (admin/PM only)
  app.get("/api/extended-utilities/utilities", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const utilities = await utilStorage.getPropertyUtilities();
      res.json(utilities);
    } catch (error) {
      console.error("Error fetching utilities:", error);
      res.status(500).json({ message: "Failed to fetch utilities" });
    }
  });

  // Create new utility
  app.post("/api/extended-utilities/utilities", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const utility = await utilStorage.createPropertyUtility(req.body);
      res.status(201).json(utility);
    } catch (error) {
      console.error("Error creating utility:", error);
      res.status(500).json({ message: "Failed to create utility" });
    }
  });

  // Update utility
  app.put("/api/extended-utilities/utilities/:id", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const utilityId = parseInt(req.params.id);
      
      // For owners, check if they have edit permissions
      if (req.user.role === 'owner') {
        const permissions = await utilStorage.getUtilityPermissions(utilityId, 'owner');
        const hasEditPermission = permissions.some(p => 
          p.canEditProviderInfo || p.canEditAccountNumber
        );
        
        if (!hasEditPermission) {
          return res.status(403).json({ message: "No edit permission for this utility" });
        }
      }
      
      const utility = await utilStorage.updatePropertyUtility(utilityId, req.body);
      if (!utility) {
        return res.status(404).json({ message: "Utility not found" });
      }
      
      res.json(utility);
    } catch (error) {
      console.error("Error updating utility:", error);
      res.status(500).json({ message: "Failed to update utility" });
    }
  });

  // Delete utility (admin only)
  app.delete("/api/extended-utilities/utilities/:id", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const utilityId = parseInt(req.params.id);
      
      const success = await utilStorage.deletePropertyUtility(utilityId);
      if (!success) {
        return res.status(404).json({ message: "Utility not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting utility:", error);
      res.status(500).json({ message: "Failed to delete utility" });
    }
  });

  // Get utility bills
  app.get("/api/extended-utilities/bills", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const filters: any = {};
      if (req.query.utilityMasterId) filters.utilityMasterId = parseInt(req.query.utilityMasterId as string);
      if (req.query.propertyId) filters.propertyId = parseInt(req.query.propertyId as string);
      if (req.query.billingMonth) filters.billingMonth = req.query.billingMonth as string;
      if (req.query.isPaid !== undefined) filters.isPaid = req.query.isPaid === 'true';
      if (req.query.isLate !== undefined) filters.isLate = req.query.isLate === 'true';
      if (req.query.monthsBack) filters.monthsBack = parseInt(req.query.monthsBack as string);
      
      const bills = await utilStorage.getUtilityBills(filters);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching utility bills:", error);
      res.status(500).json({ message: "Failed to fetch utility bills" });
    }
  });

  // Create utility bill
  app.post("/api/extended-utilities/bills", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const billData = {
        ...req.body,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
      };
      
      const bill = await utilStorage.createUtilityBill(billData);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating utility bill:", error);
      res.status(500).json({ message: "Failed to create utility bill" });
    }
  });

  // Update utility bill
  app.put("/api/extended-utilities/bills/:id", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const billId = parseInt(req.params.id);
      
      const bill = await utilStorage.updateUtilityBill(billId, req.body);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.json(bill);
    } catch (error) {
      console.error("Error updating utility bill:", error);
      res.status(500).json({ message: "Failed to update utility bill" });
    }
  });

  // Delete utility bill (admin only)
  app.delete("/api/extended-utilities/bills/:id", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const billId = parseInt(req.params.id);
      
      const success = await utilStorage.deleteUtilityBill(billId);
      if (!success) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting utility bill:", error);
      res.status(500).json({ message: "Failed to delete utility bill" });
    }
  });

  // Get utility permissions
  app.get("/api/extended-utilities/permissions/:utilityId", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const utilityId = parseInt(req.params.utilityId);
      const userRole = req.query.userRole as string;
      
      const permissions = await utilStorage.getUtilityPermissions(utilityId, userRole);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching utility permissions:", error);
      res.status(500).json({ message: "Failed to fetch utility permissions" });
    }
  });

  // Create/Update utility permissions (admin only)
  app.post("/api/extended-utilities/permissions", isDemoAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const permissionData = {
        ...req.body,
        setBy: req.user.id,
      };
      
      const permission = await utilStorage.createUtilityPermission(permissionData);
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error creating utility permission:", error);
      res.status(500).json({ message: "Failed to create utility permission" });
    }
  });

  // Get AI predictions
  app.get("/api/extended-utilities/ai-predictions", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const utilityMasterId = req.query.utilityMasterId ? parseInt(req.query.utilityMasterId as string) : undefined;
      const predictionType = req.query.predictionType as string;
      
      const predictions = await utilStorage.getUtilityAiPredictions(utilityMasterId, predictionType);
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching AI predictions:", error);
      res.status(500).json({ message: "Failed to fetch AI predictions" });
    }
  });

  // Generate AI prediction for a utility
  app.post("/api/extended-utilities/ai-predictions/generate/:utilityId", isDemoAuthenticated, requirePortfolioManagerOrAdmin, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const utilityId = parseInt(req.params.utilityId);
      
      const prediction = await utilStorage.generateArrivalPrediction(utilityId);
      
      // Save the prediction
      const savedPrediction = await utilStorage.createUtilityAiPrediction({
        utilityMasterId: utilityId,
        predictionType: 'arrival_date',
        predictedDate: prediction.predictedDate,
        confidenceScore: prediction.confidenceScore.toString(),
        basedOnMonths: 6,
        averageArrivalDay: prediction.averageArrivalDay,
        notes: prediction.notes,
      });
      
      res.json({
        ...savedPrediction,
        prediction,
      });
    } catch (error) {
      console.error("Error generating AI prediction:", error);
      res.status(500).json({ message: "Failed to generate AI prediction" });
    }
  });

  // Get utility notifications
  app.get("/api/extended-utilities/notifications", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const filters: any = {};
      if (req.query.recipientUserId) filters.recipientUserId = req.query.recipientUserId as string;
      if (req.query.recipientRole) filters.recipientRole = req.query.recipientRole as string;
      if (req.query.notificationType) filters.notificationType = req.query.notificationType as string;
      if (req.query.isRead !== undefined) filters.isRead = req.query.isRead === 'true';
      if (req.query.actionRequired !== undefined) filters.actionRequired = req.query.actionRequired === 'true';
      if (req.query.severity) filters.severity = req.query.severity as string;
      
      const notifications = await utilStorage.getUtilityNotifications(filters);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching utility notifications:", error);
      res.status(500).json({ message: "Failed to fetch utility notifications" });
    }
  });

  // Mark notification as read
  app.post("/api/extended-utilities/notifications/:id/read", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const notificationId = parseInt(req.params.id);
      
      const notification = await utilStorage.markNotificationAsRead(notificationId, req.user.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark notification action as taken
  app.post("/api/extended-utilities/notifications/:id/action", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      const notificationId = parseInt(req.params.id);
      const { actionNotes } = req.body;
      
      const notification = await utilStorage.markNotificationActionTaken(
        notificationId, 
        req.user.id, 
        actionNotes
      );
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json(notification);
    } catch (error) {
      console.error("Error marking action as taken:", error);
      res.status(500).json({ message: "Failed to mark action as taken" });
    }
  });

  // Get dashboard analytics
  app.get("/api/extended-utilities/analytics", isDemoAuthenticated, requireUtilitiesAccess, async (req: any, res) => {
    try {
      const organizationId = req.user.organizationId || "default-org";
      const utilStorage = new ExtendedUtilitiesStorage(organizationId);
      
      const analytics = await utilStorage.getDashboardAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching utilities analytics:", error);
      res.status(500).json({ message: "Failed to fetch utilities analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
