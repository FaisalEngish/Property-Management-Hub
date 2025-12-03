# Multi-Tenant Database Isolation Guide

## ✅ Easy Mr Property Siam Deletion 

### Option 1: Soft Delete (Recommended for Testing)
```bash
# Suspend temporarily
node scripts/tenant-manager.js suspend client_mrproperty "Testing not ready"

# Reactivate when ready  
node scripts/tenant-manager.js reactivate client_mrproperty
```

### Option 2: Hard Delete (Complete Removal)
```bash
# Backup first (safety)
node scripts/tenant-manager.js backup client_mrproperty

# Complete deletion
node scripts/tenant-manager.js delete client_mrproperty
```

### Current Status Check
```bash
# List all tenants
node scripts/tenant-manager.js list

# Show Mr Property Siam details
node scripts/tenant-manager.js details client_mrproperty
```

## 🏢 Database Isolation Strategies

### Strategy 1: Organization ID Filtering (Current - ✅ Ready)
- **How**: Every table has `organization_id` column
- **Isolation**: Automatic filtering in all queries
- **Cost**: Low (single database)
- **Security**: Good (application-level)
- **Scale**: Up to 100+ tenants

```sql
-- Every query automatically filtered:
SELECT * FROM properties WHERE organization_id = 'client_mrproperty';
SELECT * FROM bookings WHERE organization_id = 'client_acme';
```

### Strategy 2: Schema Per Tenant (Available - 🚧 Enhanced)
- **How**: Each tenant gets own database schema
- **Isolation**: Database-level separation 
- **Cost**: Medium (single database, multiple schemas)
- **Security**: Excellent (database-level)
- **Scale**: Up to 1000+ tenants

```sql
-- Mr Property Siam data:
SELECT * FROM mrproperty_schema.properties;

-- ACME Company data:  
SELECT * FROM acme_schema.properties;
```

### Strategy 3: Database Per Tenant (Available - 🔒 Enterprise)
- **How**: Completely separate databases
- **Isolation**: Maximum (separate infrastructure)
- **Cost**: High (multiple database instances)
- **Security**: Ultimate (complete separation)
- **Scale**: Unlimited

```bash
# Mr Property Siam database
DATABASE_URL_MRPROPERTY=postgresql://...

# ACME Company database  
DATABASE_URL_ACME=postgresql://...
```

## 🛠️ Implementation Support

### For Mr Property Siam Testing
1. **Current setup perfect** - Strategy 1 active
2. **Easy deletion** - Scripts ready for cleanup
3. **Data isolation** - Automatic organization filtering
4. **Backup/restore** - Complete tenant management

### When Ready to Scale
1. **Upgrade to Strategy 2** - Schema-based isolation
2. **Enterprise Strategy 3** - Separate databases
3. **Domain routing** - `mrproperty.hostpilotpro.com`
4. **API key isolation** - Per-tenant encrypted storage

## 🎯 Mr Property Siam Next Steps

1. **Approve signup** → Go to `/admin/saas-management`
2. **Configure APIs** → Hostaway, Stripe integration
3. **Import properties** → Their 25+ villas
4. **Test workflows** → Real booking scenarios
5. **If not ready** → `node scripts/tenant-manager.js delete client_mrproperty`

**Your multi-tenant system is production-ready with complete deletion safety!**