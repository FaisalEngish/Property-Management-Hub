#!/bin/bash

# Quick Mr Property Siam Deletion Script
# Usage: ./scripts/quick-delete-mrproperty.sh

echo "🗑️  Quick Mr Property Siam Deletion"
echo "=================================="

# Get the signup request ID
SIGNUP_ID=$(psql $DATABASE_URL -t -c "SELECT id FROM signup_requests WHERE company_name = 'Mr Property Siam' ORDER BY submitted_at DESC LIMIT 1;" | xargs)

if [ -z "$SIGNUP_ID" ]; then
    echo "❌ No Mr Property Siam signup found"
    exit 1
fi

echo "📋 Found signup request: $SIGNUP_ID"
echo "⏳ Starting deletion process..."

# Delete from all related tables
psql $DATABASE_URL << EOF
-- Delete signup request and audit logs
DELETE FROM saas_audit_log WHERE details::text LIKE '%$SIGNUP_ID%';
DELETE FROM signup_requests WHERE id = '$SIGNUP_ID';

-- If they had been approved and had organization data, delete that too
DELETE FROM client_api_keys WHERE organization_id LIKE '%mrproperty%';
DELETE FROM client_deployments WHERE organization_id LIKE '%mrproperty%';
DELETE FROM client_organizations WHERE company_name = 'Mr Property Siam';

-- Delete any application data if they had been provisioned
DELETE FROM users WHERE organization_id LIKE '%mrproperty%';
DELETE FROM properties WHERE organization_id LIKE '%mrproperty%';
DELETE FROM bookings WHERE organization_id LIKE '%mrproperty%';
DELETE FROM tasks WHERE organization_id LIKE '%mrproperty%';
DELETE FROM finance WHERE organization_id LIKE '%mrproperty%';

EOF

echo "✅ Mr Property Siam completely deleted!"
echo "🔍 Verification - remaining signups:"

psql $DATABASE_URL -c "SELECT company_name, status, submitted_at FROM signup_requests ORDER BY submitted_at DESC;"

echo ""
echo "✨ Clean slate ready for new Mr Property Siam signup!"