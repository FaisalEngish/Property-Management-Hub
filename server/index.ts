import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { setupVite, serveStatic, log } from "./vite";
import { seedAddonServicesData } from "./seedAddonServicesData";
import { seedInvoiceData } from "./seedInvoiceData";
import { seedServiceMarketplaceData } from "./seedServiceMarketplaceData";
import { seedOwnerOnboardingData } from "./seedOwnerOnboardingData";
import { setupDemoAuth } from "./demoAuth";
import mountIntegrationRoutes from "./routers/integrations-routes";
import mountPmsRoutes from "./routers/pms-routes";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req, res, next) => {
  console.log(">>REQ", req.method, req.originalUrl);
  console.log(" Authorization:", req.headers.authorization);
  if (req.cookies) console.log(" Cookies:", req.cookies);

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

  const server = await registerRoutes(app);

  // Register bulk delete routes
  const { registerBulkDeleteRoutes } = await import("./bulk-delete-api");
  registerBulkDeleteRoutes(app);

  // Register Utility Bills routes FIRST (before other routes to avoid conflicts)
  const utilityBillsRouter = (await import("./utility-bills-routes")).default;
  app.use("/api/utility-bills", utilityBillsRouter);
  console.log("[INIT] Utility bills routes mounted ✅");

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
  const rentcastRouter = (await import("./rentcast-routes")).default;
  app.use("/api/rentcast", rentcastRouter);
  console.log("[INIT] RentCast API routes mounted ✅");

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
