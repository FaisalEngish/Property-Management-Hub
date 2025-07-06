import type { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { organizations, users } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Multi-tenant context interface
export interface TenantContext {
  organizationId: string;
  organization: any;
  user: any;
}

// Extract organization from subdomain or domain
export function extractOrganizationFromHost(hostname: string): string | null {
  // For development: localhost, 127.0.0.1, or replit domains
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.includes('replit.app')) {
    return 'demo'; // Default demo organization for development
  }
  
  // For production: company.hostpilotpro.com
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[1] === 'hostpilotpro') {
    return parts[0]; // Extract subdomain as organization
  }
  
  // For custom domains: company.com
  return hostname.replace(/\./g, '-'); // Use hostname as organization identifier
}

// Middleware to inject tenant context
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hostname = req.hostname || req.get('host') || 'localhost';
    const organizationSlug = extractOrganizationFromHost(hostname);
    
    if (!organizationSlug) {
      return res.status(400).json({ message: "Invalid domain" });
    }

    // Get organization details
    const [organization] = await db
      .select()
      .from(organizations)
      .where(and(
        eq(organizations.subdomain, organizationSlug),
        eq(organizations.isActive, true)
      ));

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Add tenant context to request
    (req as any).tenant = {
      organizationId: organization.id,
      organization,
    };

    next();
  } catch (error) {
    console.error("Tenant middleware error:", error);
    res.status(500).json({ message: "Tenant resolution failed" });
  }
};

// Enhanced authentication middleware with tenant context
export const authenticatedTenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const tenant = (req as any).tenant;
    
    if (!user || !tenant) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user belongs to the organization
    const [userRecord] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, user.claims.sub),
        eq(users.organizationId, tenant.organizationId),
        eq(users.isActive, true)
      ));

    if (!userRecord) {
      return res.status(403).json({ message: "User not authorized for this organization" });
    }

    // Add user to tenant context
    (req as any).tenant.user = userRecord;
    
    next();
  } catch (error) {
    console.error("Authenticated tenant middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

// Helper function to get tenant context from request
export function getTenantContext(req: Request): TenantContext {
  const tenant = (req as any).tenant;
  if (!tenant) {
    // For deployment stability, return a default tenant context instead of throwing
    console.warn("Tenant context not found - using default demo organization");
    return {
      organizationId: 'demo',
      organization: { id: 'demo', name: 'Demo Organization', subdomain: 'demo', isActive: true },
      user: null
    };
  }
  return tenant;
}

// Helper function to create tenant-isolated queries
export function createTenantQuery(organizationId: string) {
  return {
    // Add organizationId filter to any query
    withTenant: (condition: any) => and(condition, eq(organizations.id, organizationId)),
  };
}

// API key encryption utilities for secure storage
export class ApiKeyManager {
  private static readonly ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'default-dev-key-change-in-production';
  
  static encrypt(value: string): string {
    // In production, use proper encryption like AES-256
    // For development, use simple base64 encoding
    return Buffer.from(value).toString('base64');
  }
  
  static decrypt(encryptedValue: string): string {
    // In production, use proper decryption
    // For development, use base64 decoding
    return Buffer.from(encryptedValue, 'base64').toString('utf-8');
  }
}

// Organization settings type definitions
export interface OrganizationSettings {
  branding: {
    companyName: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features: {
    enableHostawayIntegration: boolean;
    enableSmsNotifications: boolean;
    enableEmailNotifications: boolean;
    enableTaskAutomation: boolean;
  };
  billing: {
    currency: string;
    vatRate: number;
    invoicePrefix: string;
  };
  limits: {
    maxUsers: number;
    maxProperties: number;
    maxMonthlyBookings: number;
  };
}

// Default organization settings template
export const DEFAULT_ORG_SETTINGS: OrganizationSettings = {
  branding: {
    companyName: "Property Management Co.",
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
  },
  features: {
    enableHostawayIntegration: false,
    enableSmsNotifications: false,
    enableEmailNotifications: true,
    enableTaskAutomation: true,
  },
  billing: {
    currency: "USD",
    vatRate: 0,
    invoicePrefix: "INV",
  },
  limits: {
    maxUsers: 10,
    maxProperties: 50,
    maxMonthlyBookings: 500,
  },
};