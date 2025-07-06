import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedAddonServicesData } from "./seedAddonServicesData";
import { seedInvoiceData } from "./seedInvoiceData";
import { seedServiceMarketplaceData } from "./seedServiceMarketplaceData";
import { seedOwnerOnboardingData } from "./seedOwnerOnboardingData";

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
  
  // Seed Service Marketplace data (temporarily disabled to fix schema mismatch)
  await seedServiceMarketplaceData();
  
  // Seed Owner Onboarding data (temporarily disabled due to schema mismatch)
  // await seedOwnerOnboardingData();
  
  const server = await registerRoutes(app);

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

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });

  // Graceful shutdown handling for production deployment
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully');
    server.close(() => {
      log('Process terminated');
      process.exit(0);
    });
  });
})();
