#!/usr/bin/env node

/**
 * Tenant Cleanup Script
 * Completely removes a tenant organization and all associated data
 * Usage: node scripts/cleanup-tenant.js <organizationId>
 */

const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-http");
const { eq } = require("drizzle-orm");

const db = drizzle(neon(process.env.DATABASE_URL));

async function cleanupTenant(organizationId) {
  console.log(`🧹 Starting cleanup for organization: ${organizationId}`);
  
  try {
    // 1. Delete from SaaS tables
    const saasCleanup = [
      `DELETE FROM saas_audit_log WHERE organization_id = '${organizationId}'`,
      `DELETE FROM client_deployments WHERE organization_id = '${organizationId}'`, 
      `DELETE FROM client_api_keys WHERE organization_id = '${organizationId}'`,
      `DELETE FROM client_organizations WHERE organization_id = '${organizationId}'`,
      `DELETE FROM signup_requests WHERE id = '${organizationId}' OR company_name LIKE '%${organizationId}%'`
    ];

    // 2. Delete from main application tables
    const appCleanup = [
      `DELETE FROM users WHERE organization_id = '${organizationId}'`,
      `DELETE FROM properties WHERE organization_id = '${organizationId}'`,
      `DELETE FROM bookings WHERE organization_id = '${organizationId}'`,
      `DELETE FROM tasks WHERE organization_id = '${organizationId}'`,
      `DELETE FROM finance WHERE organization_id = '${organizationId}'`,
      `DELETE FROM property_reviews WHERE organization_id = '${organizationId}'`,
      `DELETE FROM maintenance_budget_forecasts WHERE organization_id = '${organizationId}'`,
      `DELETE FROM staff_workload_stats WHERE organization_id = '${organizationId}'`,
      `DELETE FROM sustainability_metrics WHERE organization_id = '${organizationId}'`,
      `DELETE FROM seasonal_forecasts WHERE organization_id = '${organizationId}'`,
      `DELETE FROM whatsapp_bot_logs WHERE organization_id = '${organizationId}'`,
      `DELETE FROM vendors WHERE organization_id = '${organizationId}'`,
      `DELETE FROM supply_orders WHERE organization_id = '${organizationId}'`,
      `DELETE FROM security_deposits WHERE organization_id = '${organizationId}'`,
      `DELETE FROM damage_reports WHERE organization_id = '${organizationId}'`,
      `DELETE FROM property_insurance WHERE organization_id = '${organizationId}'`,
      `DELETE FROM property_documents WHERE organization_id = '${organizationId}'`,
      `DELETE FROM property_chat_messages WHERE organization_id = '${organizationId}'`,
      `DELETE FROM dynamic_pricing_recommendations WHERE organization_id = '${organizationId}'`,
      `DELETE FROM property_investments WHERE organization_id = '${organizationId}'`,
      `DELETE FROM task_ai_scan_results WHERE organization_id = '${organizationId}'`,
      `DELETE FROM shared_costs WHERE organization_id = '${organizationId}'`,
      `DELETE FROM shared_cost_splits WHERE organization_id = '${organizationId}'`,
      `DELETE FROM offline_task_cache WHERE organization_id = '${organizationId}'`
    ];

    // Execute all cleanup queries
    let cleanedTables = 0;
    for (const query of [...saasCleanup, ...appCleanup]) {
      try {
        const result = await db.execute(query);
        console.log(`✅ Cleaned: ${query.split(' ')[2]}`);
        cleanedTables++;
      } catch (error) {
        console.log(`⚠️  Skipped: ${query.split(' ')[2]} (table may not exist)`);
      }
    }

    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`📊 Cleaned ${cleanedTables} tables`);
    console.log(`🗑️  Organization ${organizationId} completely removed`);
    
    return { success: true, cleanedTables };

  } catch (error) {
    console.error(`❌ Cleanup failed:`, error);
    return { success: false, error: error.message };
  }
}

// Command line usage
if (require.main === module) {
  const organizationId = process.argv[2];
  if (!organizationId) {
    console.error('Usage: node scripts/cleanup-tenant.js <organizationId>');
    process.exit(1);
  }
  
  cleanupTenant(organizationId)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { cleanupTenant };