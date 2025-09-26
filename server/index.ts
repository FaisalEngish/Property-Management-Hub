import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAddonServicesData } from "./seedAddonServicesData";
import { seedInvoiceData } from "./seedInvoiceData";
import { seedServiceMarketplaceData } from "./seedServiceMarketplaceData";
import { seedOwnerOnboardingData } from "./seedOwnerOnboardingData";
import { setupDemoAuth } from "./demoAuth";
import mountIntegrationRoutes from "./routers/integrations-routes";
import mountPmsRoutes from "./routers/pms-routes";
// Smart Reminder System - Initialize automated cron jobs
import "./reminderCron";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
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
  const { registerBulkDeleteRoutes } = await import('./bulk-delete-api');
  registerBulkDeleteRoutes(app);
  
  // Register fast dashboard routes
  const { registerFastDashboardRoutes } = await import('./fast-dashboard-api');
  registerFastDashboardRoutes(app);
  
  // Register PMS integration routes
  mountIntegrationRoutes(app);
  mountPmsRoutes(app);

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
  const httpServer = app.listen(port, '0.0.0.0', () => {
    console.log("Server started");
  });

  // Graceful shutdown handling for production deployment
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
})();
