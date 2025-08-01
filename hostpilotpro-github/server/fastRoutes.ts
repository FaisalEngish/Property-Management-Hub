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
}