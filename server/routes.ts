import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated as prodAuth } from "./replitAuth";
import { setupDemoAuth, isDemoAuthenticated } from "./demoAuth";
import { authenticatedTenantMiddleware, getTenantContext } from "./multiTenant";
import { insertPropertySchema, insertTaskSchema, insertBookingSchema, insertFinanceSchema, insertPlatformSettingSchema, insertAddonServiceSchema, insertAddonBookingSchema, insertUtilityBillSchema, insertPropertyUtilityAccountSchema, insertUtilityBillReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup demo authentication (for development/testing)
  await setupDemoAuth(app);
  
  // Also setup production auth (fallback)
  await setupAuth(app);

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

  // Inventory routes
  app.get("/api/inventory/:propertyId", isDemoAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const inventory = await storage.getInventoryByProperty(propertyId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
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

  const httpServer = createServer(app);
  return httpServer;
}
