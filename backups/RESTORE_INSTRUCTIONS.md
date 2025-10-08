# HostPilotPro System Restore Instructions

## Backup Date: October 8, 2025 05:29:44 UTC

### What's Backed Up:
✅ All 28 Properties  
✅ All 33 User Accounts (with encrypted passwords)  
✅ All 12 Bookings  
✅ All 2,043 Finance Records  
✅ All 50 Tasks  
✅ Complete Database Schema (138 tables)

---

## Method 1: Replit Rollback (RECOMMENDED - EASIEST)

**This is the fastest and safest way to restore everything:**

1. Click on your Repl menu (top left)
2. Select "History" or "View Checkpoints"
3. Choose a checkpoint from before the issue occurred
4. Click "Restore" - Done! Everything is back.

**What gets restored:**
- ✅ All code files
- ✅ Complete database
- ✅ All configurations
- ✅ Environment variables

---

## Method 2: Manual Database Restore (If Needed)

### Prerequisites:
- Access to Replit SQL Database
- Database connection credentials

### Step 1: Restore Properties
```sql
-- Clear existing data (CAUTION!)
TRUNCATE properties CASCADE;

-- Import from CSV
\copy properties FROM 'backups/properties_backup_20251008.csv' WITH CSV HEADER;
```

### Step 2: Restore Users
```sql
TRUNCATE users CASCADE;
\copy users FROM 'backups/users_backup_20251008.csv' WITH CSV HEADER;
```

### Step 3: Verify Restoration
```sql
SELECT COUNT(*) FROM properties; -- Should show 28
SELECT COUNT(*) FROM users;      -- Should show 33
SELECT COUNT(*) FROM bookings;   -- Should show 12
SELECT COUNT(*) FROM finances;   -- Should show 2043
```

---

## Method 3: Full System Restore from Backup Files

### Files Included in Backup:
- `properties_backup_20251008.csv` - All properties
- `users_backup_20251008.csv` - All user accounts
- `backup_summary.txt` - Backup statistics
- `backup_timestamp.txt` - Backup time
- `RESTORE_INSTRUCTIONS.md` - This file

### Restoration Command:
```bash
# From /backups directory
psql $DATABASE_URL -c "\copy properties FROM 'properties_backup_20251008.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\copy users FROM 'users_backup_20251008.csv' WITH CSV HEADER;"
```

---

## Emergency Contact:
If you need help restoring:
1. Use Replit Rollback (Method 1)
2. Contact Replit Support for database help
3. Check Replit Documentation: https://docs.replit.com

---

## Data Integrity Notes:
- All passwords are bcrypt-hashed (secure)
- Foreign key relationships preserved
- Organization isolation maintained
- All timestamps in UTC

**Last Updated:** October 8, 2025
