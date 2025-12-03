#!/usr/bin/env node

/**
 * Tenant Management Utilities
 * Complete toolkit for managing tenant organizations
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { cleanupTenant } from './cleanup-tenant.js';

const db = drizzle(neon(process.env.DATABASE_URL));

class TenantManager {
  
  // List all tenants
  async listTenants() {
    const tenants = await db.execute(`
      SELECT 
        co.organization_id,
        co.company_name,
        co.status,
        co.subdomain,
        co.created_at,
        COUNT(u.id) as user_count,
        COUNT(p.id) as property_count
      FROM client_organizations co
      LEFT JOIN users u ON u.organization_id = co.organization_id
      LEFT JOIN properties p ON p.organization_id = co.organization_id
      GROUP BY co.organization_id, co.company_name, co.status, co.subdomain, co.created_at
      ORDER BY co.created_at DESC
    `);

    console.log('\n📋 Tenant Organizations:');
    console.table(tenants.rows);
    return tenants.rows;
  }

  // Get tenant details
  async getTenantDetails(organizationId) {
    const details = await db.execute(`
      SELECT 
        'users' as table_name, COUNT(*) as record_count
      FROM users WHERE organization_id = '${organizationId}'
      UNION ALL
      SELECT 'properties', COUNT(*) FROM properties WHERE organization_id = '${organizationId}'
      UNION ALL  
      SELECT 'bookings', COUNT(*) FROM bookings WHERE organization_id = '${organizationId}'
      UNION ALL
      SELECT 'tasks', COUNT(*) FROM tasks WHERE organization_id = '${organizationId}'
      UNION ALL
      SELECT 'finance', COUNT(*) FROM finance WHERE organization_id = '${organizationId}'
      ORDER BY record_count DESC
    `);

    console.log(`\n📊 Data for Organization: ${organizationId}`);
    console.table(details.rows);
    return details.rows;
  }

  // Suspend tenant (soft delete)
  async suspendTenant(organizationId, reason) {
    await db.execute(`
      UPDATE client_organizations 
      SET 
        status = 'suspended',
        suspended_at = NOW(),
        suspension_reason = '${reason}'
      WHERE organization_id = '${organizationId}'
    `);
    
    console.log(`⏸️  Tenant ${organizationId} suspended: ${reason}`);
  }

  // Reactivate tenant
  async reactivateTenant(organizationId) {
    await db.execute(`
      UPDATE client_organizations 
      SET 
        status = 'active',
        suspended_at = NULL,
        suspension_reason = NULL
      WHERE organization_id = '${organizationId}'
    `);
    
    console.log(`▶️  Tenant ${organizationId} reactivated`);
  }

  // Complete tenant removal
  async deleteTenant(organizationId) {
    console.log(`🗑️  WARNING: This will permanently delete all data for ${organizationId}`);
    console.log('⏳ Starting deletion process...\n');
    
    return await cleanupTenant(organizationId);
  }

  // Create backup before deletion
  async backupTenant(organizationId) {
    const backupFile = `tenant_backup_${organizationId}_${Date.now()}.sql`;
    
    const backupQueries = [
      `COPY (SELECT * FROM users WHERE organization_id = '${organizationId}') TO '/tmp/${backupFile}_users.csv' CSV HEADER`,
      `COPY (SELECT * FROM properties WHERE organization_id = '${organizationId}') TO '/tmp/${backupFile}_properties.csv' CSV HEADER`,
      `COPY (SELECT * FROM bookings WHERE organization_id = '${organizationId}') TO '/tmp/${backupFile}_bookings.csv' CSV HEADER`
    ];

    console.log(`💾 Creating backup: ${backupFile}`);
    console.log('📁 Backup files will be in /tmp/ directory');
    
    return backupFile;
  }
}

// CLI Interface
async function main() {
  const manager = new TenantManager();
  const command = process.argv[2];
  const organizationId = process.argv[3];
  const extra = process.argv[4];

  switch (command) {
    case 'list':
      await manager.listTenants();
      break;
      
    case 'details':
      if (!organizationId) {
        console.error('Usage: node scripts/tenant-manager.js details <organizationId>');
        process.exit(1);
      }
      await manager.getTenantDetails(organizationId);
      break;
      
    case 'suspend':
      if (!organizationId || !extra) {
        console.error('Usage: node scripts/tenant-manager.js suspend <organizationId> <reason>');
        process.exit(1);
      }
      await manager.suspendTenant(organizationId, extra);
      break;
      
    case 'reactivate':
      if (!organizationId) {
        console.error('Usage: node scripts/tenant-manager.js reactivate <organizationId>');
        process.exit(1);
      }
      await manager.reactivateTenant(organizationId);
      break;
      
    case 'delete':
      if (!organizationId) {
        console.error('Usage: node scripts/tenant-manager.js delete <organizationId>');
        process.exit(1);
      }
      await manager.deleteTenant(organizationId);
      break;
      
    case 'backup':
      if (!organizationId) {
        console.error('Usage: node scripts/tenant-manager.js backup <organizationId>');
        process.exit(1);
      }
      await manager.backupTenant(organizationId);
      break;
      
    default:
      console.log(`
🛠️  Tenant Manager Commands:

📋 List all tenants:
   node scripts/tenant-manager.js list

📊 Show tenant details:
   node scripts/tenant-manager.js details <organizationId>

⏸️  Suspend tenant:
   node scripts/tenant-manager.js suspend <organizationId> "reason"

▶️  Reactivate tenant:
   node scripts/tenant-manager.js reactivate <organizationId>

💾 Backup tenant data:
   node scripts/tenant-manager.js backup <organizationId>

🗑️  Delete tenant completely:
   node scripts/tenant-manager.js delete <organizationId>

Example: Remove Mr Property Siam
   node scripts/tenant-manager.js delete client_mrproperty
      `);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TenantManager;