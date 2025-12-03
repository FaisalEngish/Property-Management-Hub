# Mr Property Siam - SaaS Setup Guide

## Step 1: Create Company Account
```bash
# Use the signup system to create Mr Property Siam
curl -X POST http://localhost:5000/api/saas/signup-request \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Mr Property Siam",
    "contactName": "Your Name",
    "email": "admin@mrpropertysiam.com",
    "phone": "+66 123 456 789",
    "country": "Thailand",
    "businessType": "vacation_rental",
    "propertyCount": "10-50",
    "features": ["booking_management", "financial_reports", "maintenance_tracking"],
    "hostawayApiKey": "your-hostaway-key",
    "message": "First production client - villa management in Koh Samui"
  }'
```

## Step 2: Admin Approval
1. Login as admin in your current system
2. Go to /admin/saas-management  
3. Approve the Mr Property Siam request
4. System will auto-create isolated database

## Step 3: Configure API Keys
- Hostaway: For property/booking sync
- Stripe: For payment processing
- OpenAI: For AI features
- Thai utility providers: For bill management

## Step 4: Data Migration
1. Import villa properties from Hostaway
2. Historical booking data
3. Staff accounts and permissions
4. Financial records

## Error Fixing Process:
1. See error in console → Fix code → Test immediately
2. Database issues → Use SQL tool → Verify data
3. API problems → Check credentials → Test endpoints
4. Frontend bugs → Browser console → Fix component