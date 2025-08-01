import { saasStorage } from "./saas-storage";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NewClientOrganization, NewClientDeployment, SignupRequest } from "../shared/saas-schema";

export class SaasProvisioner {
  async provisionTenantEnvironment(
    signupRequest: SignupRequest, 
    approvedBy: string,
    hostawayApiKey?: string
  ): Promise<string> {
    try {
      // Generate unique identifiers
      const organizationId = await saasStorage.generateOrganizationId();
      const subdomain = await saasStorage.generateSubdomain(signupRequest.companyName);
      const schemaName = `tenant_${organizationId.replace('client_', '')}`;
      
      // Create deployment record
      const deployment = await saasStorage.createTenantDeployment({
        organizationId,
        deploymentStatus: "provisioning",
        databaseStatus: "creating",
        seedDataStatus: "pending",
        deploymentLogs: [`Starting provisioning for ${signupRequest.companyName}`],
      });

      // Create tenant organization record
      const tenant: NewTenantOrganization = {
        organizationId,
        companyName: signupRequest.companyName,
        subdomain,
        databaseUrl: process.env.DATABASE_URL!, // Same DB, different schema
        schemaName,
        planType: this.determinePlanType(signupRequest.propertyCount || 5),
        status: "active",
        activatedAt: new Date(),
        maxProperties: this.getMaxProperties(signupRequest.propertyCount || 5),
        maxUsers: this.getMaxUsers(signupRequest.propertyCount || 5),
        features: this.getFeatures(signupRequest.requestedFeatures || []),
        contactEmail: signupRequest.email,
        billingEmail: signupRequest.email,
      };

      await saasStorage.createTenantOrganization(tenant);

      // Update deployment status
      await saasStorage.updateTenantDeployment(deployment.id, {
        databaseStatus: "migrating",
        deploymentLogs: [
          ...deployment.deploymentLogs!,
          `Created organization: ${organizationId}`,
          `Assigned subdomain: ${subdomain}.hostpilotpro.com`,
        ],
      });

      // Create schema and tables
      await this.createTenantSchema(schemaName);
      
      await saasStorage.updateTenantDeployment(deployment.id, {
        databaseStatus: "ready",
        seedDataStatus: "seeding",
        deploymentLogs: [
          ...deployment.deploymentLogs!,
          `Created database schema: ${schemaName}`,
          `Migrated all tables successfully`,
        ],
      });

      // Seed initial data
      await this.seedTenantData(schemaName, signupRequest, organizationId);

      // Store API keys if provided
      if (hostawayApiKey) {
        await saasStorage.setTenantApiKey(organizationId, "hostaway", "api_key", hostawayApiKey);
      }

      // Mark deployment as complete
      await saasStorage.updateTenantDeployment(deployment.id, {
        deploymentStatus: "ready",
        seedDataStatus: "completed",
        environmentUrl: `https://${subdomain}.hostpilotpro.com`,
        completedAt: new Date(),
        deploymentLogs: [
          ...deployment.deploymentLogs!,
          `Seeded initial data for ${signupRequest.companyName}`,
          `Environment ready at: ${subdomain}.hostpilotpro.com`,
          `Deployment completed successfully`,
        ],
      });

      // Log the action
      await saasStorage.logSaasAction({
        action: "tenant_provisioned",
        organizationId,
        performedBy: approvedBy,
        details: {
          companyName: signupRequest.companyName,
          subdomain,
          schemaName,
          features: tenant.features,
          planType: tenant.planType,
        },
      });

      return organizationId;

    } catch (error) {
      console.error("Provisioning failed:", error);
      
      // Log the failure
      await saasStorage.logSaasAction({
        action: "provisioning_failed",
        organizationId: organizationId || "unknown",
        performedBy: approvedBy,
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          companyName: signupRequest.companyName,
        },
      });

      throw new Error(`Failed to provision environment: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    const db = drizzle(neon(process.env.DATABASE_URL!));
    
    // Create schema
    await db.execute(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // Create all necessary tables in the new schema
    // This is a simplified version - in production, you'd run all your migrations
    const tables = [
      `CREATE TABLE ${schemaName}.users (
        id TEXT PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT '${schemaName}',
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE ${schemaName}.properties (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT '${schemaName}',
        name TEXT NOT NULL,
        address TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        max_guests INTEGER,
        price_per_night INTEGER,
        status TEXT DEFAULT 'active',
        owner_id TEXT,
        portfolio_manager_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE ${schemaName}.tasks (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT '${schemaName}',
        title TEXT NOT NULL,
        description TEXT,
        assigned_to_id TEXT,
        property_id INTEGER,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE ${schemaName}.bookings (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL DEFAULT '${schemaName}',
        property_id INTEGER NOT NULL,
        guest_name TEXT NOT NULL,
        guest_email TEXT,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        total_amount INTEGER,
        status TEXT DEFAULT 'confirmed',
        guests INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
    ];

    for (const tableSQL of tables) {
      await db.execute(tableSQL);
    }
  }

  private async seedTenantData(
    schemaName: string, 
    signupRequest: SignupRequest, 
    organizationId: string
  ): Promise<void> {
    const db = drizzle(neon(process.env.DATABASE_URL!));
    
    // Create admin user
    await db.execute(`
      INSERT INTO ${schemaName}.users (id, organization_id, email, name, role)
      VALUES ('admin-${organizationId}', '${organizationId}', '${signupRequest.email}', '${signupRequest.contactName}', 'admin')
    `);

    // Create sample properties if needed
    if (signupRequest.propertyCount && signupRequest.propertyCount > 0) {
      for (let i = 1; i <= Math.min(signupRequest.propertyCount, 3); i++) {
        await db.execute(`
          INSERT INTO ${schemaName}.properties (organization_id, name, address, bedrooms, bathrooms, max_guests, price_per_night, owner_id)
          VALUES ('${organizationId}', 'Property ${i}', 'Location ${i}', ${2 + i}, ${1 + i}, ${4 + i * 2}, ${5000 + i * 2000}, 'admin-${organizationId}')
        `);
      }
    }

    // Create welcome task
    await db.execute(`
      INSERT INTO ${schemaName}.tasks (organization_id, title, description, assigned_to_id, priority, status)
      VALUES ('${organizationId}', 'Welcome to HostPilotPro!', 'Complete your onboarding and explore the platform features.', 'admin-${organizationId}', 'high', 'pending')
    `);
  }

  private determinePlanType(propertyCount: number): string {
    if (propertyCount <= 5) return "basic";
    if (propertyCount <= 15) return "pro";
    return "enterprise";
  }

  private getMaxProperties(propertyCount: number): number {
    const planType = this.determinePlanType(propertyCount);
    switch (planType) {
      case "basic": return 5;
      case "pro": return 20;
      case "enterprise": return 100;
      default: return 5;
    }
  }

  private getMaxUsers(propertyCount: number): number {
    const planType = this.determinePlanType(propertyCount);
    switch (planType) {
      case "basic": return 5;
      case "pro": return 15;
      case "enterprise": return 50;
      default: return 5;
    }
  }

  private getFeatures(requestedFeatures: string[]): string[] {
    const baseFeatures = ["property_management", "task_tracking", "booking_calendar"];
    const allFeatures = [
      ...baseFeatures,
      "financial_reporting",
      "api_integrations", 
      "advanced_analytics",
      "multi_language",
      "white_label",
    ];
    
    return [...baseFeatures, ...requestedFeatures.filter(f => allFeatures.includes(f))];
  }
}

export const saasProvisioner = new SaasProvisioner();