import type { Request, Response, NextFunction } from "express";
import { saasStorage } from "./saas-storage";

// Extend Express Request type to include client information
declare global {
  namespace Express {
    interface Request {
      clientContext?: {
        organizationId: string;
        subdomain: string;
        schemaName: string;
        features: string[];
        status: string;
      };
    }
  }
}

export async function clientMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract subdomain from request
  const host = req.get('host');
  const subdomain = extractSubdomain(host);
  
  if (!subdomain || subdomain === 'www' || subdomain === 'hostpilotpro') {
    // Main site or no subdomain - skip tenant resolution
    return next();
  }

  try {
    // Look up tenant by subdomain
    const tenant = await saasStorage.getTenantBySubdomain(subdomain);
    
    if (!tenant) {
      return res.status(404).json({ 
        error: "Tenant not found",
        message: `No organization found for subdomain: ${subdomain}`
      });
    }

    if (tenant.status !== "active") {
      return res.status(503).json({
        error: "Service unavailable", 
        message: `Organization is currently ${tenant.status}`
      });
    }

    // Attach tenant context to request
    req.tenantContext = {
      organizationId: tenant.organizationId,
      subdomain: tenant.subdomain,
      schemaName: tenant.schemaName,
      features: tenant.features || [],
      status: tenant.status,
    };

    next();
    
  } catch (error) {
    console.error("Tenant middleware error:", error);
    res.status(500).json({
      error: "Tenant resolution failed",
      message: "Unable to resolve tenant context"
    });
  }
}

function extractSubdomain(host?: string): string | null {
  if (!host) return null;
  
  const parts = host.split('.');
  
  // For development (localhost:3000), return null
  if (parts.length < 3 || host.includes('localhost') || host.includes('127.0.0.1')) {
    return null;
  }
  
  // Extract subdomain (first part)
  return parts[0];
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantContext) {
    return res.status(400).json({
      error: "Tenant context required",
      message: "This endpoint requires a valid tenant context"
    });
  }
  next();
}

export function checkFeature(feature: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantContext) {
      return res.status(400).json({
        error: "Tenant context required"
      });
    }

    if (!req.tenantContext.features.includes(feature)) {
      return res.status(403).json({
        error: "Feature not available",
        message: `Your plan does not include: ${feature}`
      });
    }

    next();
  };
}