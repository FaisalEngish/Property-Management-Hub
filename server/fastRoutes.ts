import { Express } from "express";
import { sendCachedOrFetch } from "./performanceOptimizer";
import { storage } from "./storage";

export function registerFastRoutes(app: Express) {
  // Ultra-fast properties endpoint with aggressive caching
  app.get("/api/properties/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `properties-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      () => storage.getProperties(organizationId),
      res,
      15 // 15 minute cache
    );
  });

  // Ultra-fast tasks endpoint
  app.get("/api/tasks/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `tasks-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      () => storage.getTasks(organizationId),
      res,
      5 // 5 minute cache
    );
  });

  // Ultra-fast bookings endpoint
  app.get("/api/bookings/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `bookings-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      () => storage.getBookings(organizationId),
      res,
      10 // 10 minute cache
    );
  });

  // Ultra-fast dashboard stats
  app.get("/api/dashboard/stats/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `dashboard-stats-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      async () => {
        const [properties, tasks, bookings] = await Promise.all([
          storage.getProperties(organizationId),
          storage.getTasks(organizationId),
          storage.getBookings(organizationId)
        ]);

        return {
          totalProperties: properties.length,
          activeBookings: bookings.filter(b => b.status === 'confirmed').length,
          pendingTasks: tasks.filter(t => t.status === 'pending').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        };
      },
      res,
      30 // 30 minute cache for dashboard
    );
  });

  // Ultra-fast hub navigation endpoints for instant page switching
  app.get("/api/hub/dashboard/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `hub-dashboard-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      async () => {
        // Return minimal data needed for dashboard hub
        return {
          success: true,
          timestamp: Date.now(),
          hubType: 'dashboard'
        };
      },
      res,
      60 // 1 hour cache for hub navigation
    );
  });

  app.get("/api/hub/property/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `hub-property-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      async () => {
        return {
          success: true,
          timestamp: Date.now(),
          hubType: 'property'
        };
      },
      res,
      60 // 1 hour cache
    );
  });

  app.get("/api/hub/finance/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `hub-finance-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      async () => {
        return {
          success: true,
          timestamp: Date.now(),
          hubType: 'finance'
        };
      },
      res,
      60 // 1 hour cache
    );
  });

  app.get("/api/hub/system/fast", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `hub-system-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      async () => {
        return {
          success: true,
          timestamp: Date.now(),
          hubType: 'system'
        };
      },
      res,
      60 // 1 hour cache
    );
  });

  // Live alerts for upgraded admin dashboard
  app.get("/api/dashboard/live-alerts", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `live-alerts-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      () => storage.getLiveAlerts(organizationId),
      res,
      2 // 2 minute cache for alerts
    );
  });

  // KPI metrics for upgraded admin dashboard
  app.get("/api/dashboard/kpi-metrics", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    const cacheKey = `kpi-metrics-${organizationId}`;
    
    return sendCachedOrFetch(
      cacheKey,
      () => storage.getKPIMetrics(organizationId),
      res,
      5 // 5 minute cache for KPIs
    );
  });

  // System Hub endpoint - system information and health status
  app.get("/api/system", async (req: any, res) => {
    const organizationId = req.user?.organizationId || "default-org";
    
    try {
      // Get all properties without source filter, then filter by org
      const [allProperties, users, settings, finances, tasks, bookings] = await Promise.all([
        storage.getProperties(),  // No filter - get all, then filter by org
        storage.getUsers({ organizationId }),
        storage.getPlatformSettings(organizationId),
        storage.getFinances({ organizationId }),
        storage.getTasks().then(t => t.filter(task => task.organizationId === organizationId)),
        storage.getBookings(organizationId)
      ]);
      
      // Filter properties by organization
      const properties = allProperties.filter((p: any) => p.organizationId === organizationId);
      
      // Get Hostaway-sourced data counts
      const hostawayProperties = properties.filter((p: any) => p.source === 'HOSTAWAY');
      const hostawayBookings = bookings.filter((b: any) => b.source === 'HOSTAWAY');

      const systemInfo = {
        version: "2.0 Enterprise FIXED",
        lastUpdated: new Date().toISOString(),
        status: "online",
        health: {
          database: "healthy",
          api: "operational",
          cache: "active"
        },
        modules: {
          properties: { active: true, count: properties.length },
          users: { active: true, count: users.length },
          finance: { active: true, count: finances.length },
          tasks: { active: true, count: tasks.length },
          bookings: { active: true, count: bookings.length }
        },
        hostaway: {
          properties: hostawayProperties.length,
          bookings: hostawayBookings.length,
          isConnected: !!process.env.HOSTAWAY_API_KEY
        },
        apiConfigs: {
          hasStripe: settings.some((s: any) => s.settingKey === 'api.stripe_secret_key'),
          hasHostaway: settings.some((s: any) => s.settingKey === 'api.hostaway_api_key'),
          hasOpenAI: settings.some((s: any) => s.settingKey === 'api.openai_api_key'),
          hasTwilio: settings.some((s: any) => s.settingKey === 'api.twilio_account_sid')
        },
        organization: {
          id: organizationId,
          name: organizationId === "default-org" ? "HostPilotPro" : organizationId
        }
      };

      res.json(systemInfo);
    } catch (error) {
      console.error("Error fetching system info:", error);
      res.status(500).json({ 
        error: "Failed to fetch system information",
        version: "2.0 Enterprise",
        status: "error"
      });
    }
  });
}