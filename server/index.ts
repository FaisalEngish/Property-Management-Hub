import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { serveStatic, log } from "./static";
import { seedAddonServicesData } from "./seedAddonServicesData";
import { seedInvoiceData } from "./seedInvoiceData";
import { seedServiceMarketplaceData } from "./seedServiceMarketplaceData";
import { seedOwnerOnboardingData } from "./seedOwnerOnboardingData";
import { setupDemoAuth } from "./demoAuth";
import { seedProductionAdmin } from "./seedProductionAdmin";
import mountIntegrationRoutes from "./routers/integrations-routes";
import mountPmsRoutes from "./routers/pms-routes";
import { bookingRevenueRouter } from "./routes/booking-revenue-routes";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Graceful startup handling
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  });
  // Seed add-on services data (commented out until tables are created)
  // await seedAddonServicesData();

  // Seed invoice data (commented out until tables are created)
  // await seedInvoiceData();

  // Temporarily disable seeding to isolate database connection issues
  console.log("Skipping seeding during debugging...");

  // Seed Owner Onboarding data (temporarily disabled due to schema mismatch)
  // await seedOwnerOnboardingData();

  // Setup demo authentication FIRST (before any routes)
  // This ensures all routes have access to session middleware
  await setupDemoAuth(app);
  console.log("✅ Demo authentication middleware initialized");

  // Seed production admin user (creates admin@test.com if not exists)
  await seedProductionAdmin();

  // Register booking-revenue router AFTER session middleware
  app.use("/api/booking-revenue", bookingRevenueRouter);
  console.log("[INIT] Booking revenue routes mounted ✅");

  const server = await registerRoutes(app);

  // Register bulk delete routes
  const { registerBulkDeleteRoutes } = await import("./bulk-delete-api");
  registerBulkDeleteRoutes(app);

  // Register Utility Bills routes FIRST (before other routes to avoid conflicts)
  const utilityBillsRouter = (await import("./utility-bills-routes")).default;
  app.use("/api/utility-bills", utilityBillsRouter);
  console.log("[INIT] Utility bills routes mounted ✅");

  // Register comprehensive Utility routes (accounts, bills, alerts, analytics)
  const utilityRouter = (await import("./utility-routes")).default;
  app.use("/api/utility", utilityRouter);
  console.log("[INIT] Comprehensive utility routes mounted ✅");

  // Register fast dashboard routes
  const { registerFastDashboardRoutes } = await import("./fast-dashboard-api");
  registerFastDashboardRoutes(app);

  // Register PMS integration routes
  mountIntegrationRoutes(app);
  mountPmsRoutes(app);

  // Register Achievements routes
  const { setupAchievementRoutes } = await import("./achievement-routes");
  setupAchievementRoutes(app);
  console.log("[INIT] Achievement routes mounted ✅");

  // Register Property Document routes using Express Router (isolated from routes.ts errors)
  const { propertyDocRouter } = await import("./property-document-routes");
  app.use("/api/property-documents", propertyDocRouter);
  console.log("[INIT] Alternate property-document-routes mounted ✅");

  // Register Property Image upload routes
  const propertyImageRouter = (await import("./property-image-routes")).default;
  app.use("/api/property-images", propertyImageRouter);
  console.log("[INIT] Property image routes mounted ✅");

  // Register Service Booking routes
  const { serviceBookingRouter } = await import("./service-booking-routes");
  app.use("/api/service-bookings", serviceBookingRouter);
  console.log("[INIT] Service booking routes mounted ✅");

  // Register Lodgify API routes
  const lodgifyRouter = (await import("./lodgify-routes")).default;
  app.use("/api", lodgifyRouter);
  console.log("[INIT] Lodgify API routes mounted ✅");

  // Register Makcorps API routes
  const makcorpsRouter = (await import("./makcorps-routes")).default;
  app.use("/api", makcorpsRouter);
  console.log("[INIT] Makcorps API routes mounted ✅");

  // Register RentCast API routes
  // TODO: rentcast-routes.ts file is missing - need to create or remove this integration
  // const rentcastRouter = (await import("./rentcast-routes")).default;
  // app.use("/api/rentcast", rentcastRouter);
  // console.log("[INIT] RentCast API routes mounted ✅");

  // Register Hostaway API routes
  const hostawayRouter = (await import("./hostaway-routes")).default;
  app.use("/api/hostaway", hostawayRouter);
  console.log("[INIT] Hostaway API routes mounted ✅");

  // Register Daily Operations Dashboard routes
  const dailyOperationsRouter = (await import("./daily-operations-routes"))
    .default;
  app.use("/api/daily-operations", dailyOperationsRouter);
  console.log("[INIT] Daily Operations Dashboard routes mounted ✅");

  // Register Portfolio Manager Dashboard routes
  const { registerPMDashboardRoutes } = await import(
    "./portfolio/pm-dashboard-routes"
  );
  registerPMDashboardRoutes(app);
  console.log("[INIT] Portfolio Manager Dashboard routes mounted ✅");

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  console.log("[INIT] Static uploads directory mounted ✅");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const isProduction = process.env.NODE_ENV === "production";
  if (!isProduction) {
    // Dynamic import to avoid loading Vite in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT) || 5000;
  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.log("Server started");
  });

  // Graceful shutdown handling for production deployment
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    httpServer.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, shutting down gracefully");
    httpServer.close(() => {
      console.log("Process terminated");
      process.exit(0);
    });
  });
})();
