/**
 * Multi-Tenant Database Isolation System
 * Each organization gets completely isolated data access
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";

interface TenantDbConfig {
  organizationId: string;
  companyName: string;
  dbUrl?: string; // Optional: separate database per tenant
  schemaPrefix?: string; // Optional: schema-based isolation
}

export class MultiTenantDatabase {
  private tenantDatabases: Map<string, any> = new Map();
  private masterDb: any;

  constructor() {
    this.masterDb = drizzle(neon(process.env.DATABASE_URL!));
  }

  /**
   * Strategy 1: Single Database with Organization ID Filtering (Current)
   * - All tenants share same database
   * - Every query filtered by organizationId
   * - Cost-effective for small to medium scale
   */
  getTenantConnection(organizationId: string) {
    if (!this.tenantDatabases.has(organizationId)) {
      // Create tenant-aware database wrapper
      const tenantDb = new TenantAwareDatabase(this.masterDb, organizationId);
      this.tenantDatabases.set(organizationId, tenantDb);
    }
    return this.tenantDatabases.get(organizationId);
  }

  /**
   * Strategy 2: Separate Schema Per Tenant (Future Enhancement)
   * - Each tenant gets own schema: mrproperty_schema, acme_schema
   * - Complete data isolation within same database
   * - Better security and organization
   */
  async createTenantSchema(organizationId: string) {
    const schemaName = `tenant_${organizationId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const createSchemaQueries = [
      `CREATE SCHEMA IF NOT EXISTS ${schemaName}`,
      `GRANT ALL ON SCHEMA ${schemaName} TO current_user`,
      
      // Create all tables in tenant schema
      `CREATE TABLE ${schemaName}.users AS SELECT * FROM users WHERE 1=0`,
      `CREATE TABLE ${schemaName}.properties AS SELECT * FROM properties WHERE 1=0`,
      `CREATE TABLE ${schemaName}.bookings AS SELECT * FROM bookings WHERE 1=0`,
      `CREATE TABLE ${schemaName}.tasks AS SELECT * FROM tasks WHERE 1=0`,
      `CREATE TABLE ${schemaName}.finance AS SELECT * FROM finance WHERE 1=0`,
      
      // Add indexes and constraints
      `ALTER TABLE ${schemaName}.users ADD PRIMARY KEY (id)`,
      `ALTER TABLE ${schemaName}.properties ADD PRIMARY KEY (id)`,
      `ALTER TABLE ${schemaName}.bookings ADD PRIMARY KEY (id)`,
    ];

    for (const query of createSchemaQueries) {
      try {
        await this.masterDb.execute(query);
        console.log(`✅ Schema created: ${schemaName}`);
      } catch (error) {
        console.log(`⚠️ Schema creation warning: ${error.message}`);
      }
    }

    return schemaName;
  }

  /**
   * Strategy 3: Separate Database Per Tenant (Enterprise)
   * - Each tenant gets completely separate database
   * - Ultimate isolation and security
   * - Higher cost but maximum scalability
   */
  async createTenantDatabase(organizationId: string, config: TenantDbConfig) {
    if (config.dbUrl) {
      // Use separate database URL for this tenant
      const tenantDb = drizzle(neon(config.dbUrl));
      
      // Run full schema migration for new database
      await this.migrateTenantDatabase(tenantDb);
      
      this.tenantDatabases.set(organizationId, tenantDb);
      return tenantDb;
    }
    
    // Fallback to strategy 1 (single database)
    return this.getTenantConnection(organizationId);
  }

  /**
   * Run complete database migration for new tenant
   */
  async migrateTenantDatabase(tenantDb: any) {
    const migrationQueries = [
      // Core tables
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        organization_id TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        max_guests INTEGER,
        nightly_rate DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      `CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        organization_id TEXT NOT NULL,
        property_id INTEGER REFERENCES properties(id),
        guest_name TEXT NOT NULL,
        guest_email TEXT,
        check_in_date DATE,
        check_out_date DATE,
        total_amount DECIMAL(10,2),
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT NOW()
      )`,
      
      // Add indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id)`,
      `CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id)`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_org ON bookings(organization_id)`,
    ];

    for (const query of migrationQueries) {
      await tenantDb.execute(query);
    }

    console.log('✅ Tenant database migration completed');
  }

  /**
   * Delete tenant database/schema completely
   */
  async deleteTenantData(organizationId: string, strategy: 'soft' | 'hard' = 'soft') {
    if (strategy === 'soft') {
      // Mark as deleted but keep data
      await this.masterDb.execute(`
        UPDATE client_organizations 
        SET status = 'deleted', deleted_at = NOW() 
        WHERE organization_id = '${organizationId}'
      `);
    } else {
      // Hard delete - remove all data
      const schemaName = `tenant_${organizationId.replace(/[^a-zA-Z0-9]/g, '_')}`;
      await this.masterDb.execute(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
      
      // Remove from single database if using strategy 1
      const deleteQueries = [
        `DELETE FROM users WHERE organization_id = '${organizationId}'`,
        `DELETE FROM properties WHERE organization_id = '${organizationId}'`,
        `DELETE FROM bookings WHERE organization_id = '${organizationId}'`,
        `DELETE FROM tasks WHERE organization_id = '${organizationId}'`,
        `DELETE FROM finance WHERE organization_id = '${organizationId}'`,
      ];

      for (const query of deleteQueries) {
        await this.masterDb.execute(query);
      }
    }
    
    // Remove from memory cache
    this.tenantDatabases.delete(organizationId);
    console.log(`🗑️ Tenant ${organizationId} data deleted (${strategy})`);
  }
}

/**
 * Tenant-Aware Database Wrapper
 * Automatically adds organizationId filter to all queries
 */
class TenantAwareDatabase {
  constructor(private db: any, private organizationId: string) {}

  // Automatically filter all selects by organizationId
  select() {
    return {
      from: (table: any) => ({
        where: (condition?: any) => {
          const orgFilter = eq(table.organizationId, this.organizationId);
          const finalCondition = condition ? and(orgFilter, condition) : orgFilter;
          return this.db.select().from(table).where(finalCondition);
        }
      })
    };
  }

  // Automatically add organizationId to all inserts
  insert(table: any) {
    return {
      values: (data: any) => {
        const dataWithOrg = Array.isArray(data) 
          ? data.map(item => ({ ...item, organizationId: this.organizationId }))
          : { ...data, organizationId: this.organizationId };
        
        return this.db.insert(table).values(dataWithOrg);
      }
    };
  }

  // Filter updates by organizationId
  update(table: any) {
    return {
      set: (data: any) => ({
        where: (condition: any) => {
          const orgFilter = eq(table.organizationId, this.organizationId);
          const finalCondition = and(orgFilter, condition);
          return this.db.update(table).set(data).where(finalCondition);
        }
      })
    };
  }

  // Filter deletes by organizationId  
  delete(table: any) {
    return {
      where: (condition: any) => {
        const orgFilter = eq(table.organizationId, this.organizationId);
        const finalCondition = and(orgFilter, condition);
        return this.db.delete(table).where(finalCondition);
      }
    };
  }
}

export const multiTenantDb = new MultiTenantDatabase();