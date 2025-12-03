# HostPilotPro Multi-Tenant Deployment Guide

## Overview

HostPilotPro is designed with a modular, multi-tenant architecture that allows you to license the platform to multiple property management companies. Each organization operates in complete isolation with their own data, settings, and API integrations.

## Architecture Features

### 🏢 **Organization Isolation**
- **Separate Subdomains**: Each company gets their own subdomain (e.g., `acme.hostpilotpro.com`)
- **Data Isolation**: Complete database-level tenant separation using organization IDs
- **Custom Branding**: Each organization can customize their branding, colors, and logo
- **API Key Management**: Secure, encrypted storage of organization-specific API credentials

### 🔐 **Authentication & Security**
- **Domain-based Authentication**: Users authenticate via their organization's subdomain
- **Role-based Access Control**: Seven user roles with granular permissions
- **Encrypted API Storage**: All third-party API keys are encrypted at rest
- **Session Isolation**: User sessions are tied to specific organizations

### 🛠 **Modular Configuration**
- **Subscription Tiers**: Basic, Pro, Enterprise with different feature sets and limits
- **Feature Toggles**: Enable/disable features per organization
- **Custom Settings**: Currency, VAT rates, commission rules per organization
- **Integration Management**: Each org connects their own Hostaway, PEA, Stripe accounts

## Deployment Options

### Option 1: Single Database, Multi-Tenant (Recommended)
```
Database: Single PostgreSQL instance with organization_id isolation
Domains: *.hostpilotpro.com wildcard subdomain
Scaling: Horizontal scaling with load balancers
```

### Option 2: Separate Database Per Tenant
```
Database: One PostgreSQL instance per organization
Domains: Custom domains or subdomains
Scaling: Vertical scaling per tenant
```

### Option 3: Hybrid Approach
```
Database: Shared for small orgs, separate for enterprise
Domains: Mixed subdomain and custom domain support
Scaling: Flexible based on organization tier
```

## Environment Variables

### Core Configuration
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/hostpilotpro

# Authentication
SESSION_SECRET=your-secure-session-secret
REPLIT_DOMAINS=*.hostpilotpro.com,localhost

# Multi-tenant
API_KEY_ENCRYPTION_SECRET=your-encryption-key-for-api-storage
DEFAULT_ORGANIZATION=demo

# Email (for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@hostpilotpro.com
SMTP_PASS=smtp-password
```

### Organization-Specific Environment
Each organization can have their own environment overrides:
```bash
# These are stored encrypted in the database per organization
HOSTAWAY_API_KEY=org-specific-hostaway-key
STRIPE_SECRET_KEY=org-specific-stripe-key
TWILIO_ACCOUNT_SID=org-specific-twilio-sid
PEA_API_TOKEN=org-specific-pea-token
```

## Database Schema

### Organization Structure
```sql
-- Core organization table
organizations (
  id VARCHAR PRIMARY KEY,           -- UUID or slug
  name VARCHAR NOT NULL,            -- "Acme Property Management"
  domain VARCHAR UNIQUE,            -- "acme.hostpilotpro.com"
  subdomain VARCHAR UNIQUE,         -- "acme"
  subscription_tier VARCHAR,        -- "basic", "pro", "enterprise"
  max_users INTEGER DEFAULT 10,
  max_properties INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  settings JSONB,                   -- Custom org settings
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Encrypted API key storage
organization_api_keys (
  id SERIAL PRIMARY KEY,
  organization_id VARCHAR REFERENCES organizations(id),
  provider VARCHAR NOT NULL,        -- "hostaway", "stripe", "twilio"
  key_name VARCHAR NOT NULL,        -- "api_key", "secret_key"
  encrypted_value TEXT NOT NULL,    -- Encrypted credential
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP,
  created_at TIMESTAMP
);
```

### Tenant Isolation
Every core table includes `organization_id` for complete data isolation:
- `users.organization_id`
- `properties.organization_id`
- `bookings.organization_id`
- `tasks.organization_id`
- `finances.organization_id`

## Setup Process

### 1. Initial Deployment
```bash
# Clone and setup
git clone <repository>
cd hostpilotpro
npm install

# Database setup
npm run db:push

# Seed demo organization
npm run seed:demo-org
```

### 2. Create New Organization
```bash
# Via API or admin interface
POST /api/admin/organizations
{
  "id": "acme",
  "name": "Acme Property Management",
  "subdomain": "acme",
  "domain": "acme.hostpilotpro.com",
  "subscriptionTier": "pro",
  "settings": {
    "branding": {
      "companyName": "Acme Property Management",
      "primaryColor": "#2563eb"
    },
    "features": {
      "enableHostawayIntegration": true,
      "enableSmsNotifications": true
    }
  }
}
```

### 3. DNS Configuration
```
# For subdomain setup
*.hostpilotpro.com CNAME your-server.com

# For custom domains (Enterprise)
acme.com CNAME your-server.com
```

### 4. Organization Onboarding
1. **Create Organization**: Set up company profile and branding
2. **Add API Keys**: Securely store Hostaway, Stripe, Twilio credentials
3. **Configure Settings**: Currency, VAT, commission rules
4. **Create Admin User**: First user with admin role
5. **Import Properties**: Sync from Hostaway or manual entry
6. **Setup Team**: Invite staff, owners, agents with appropriate roles

## Subscription Management

### Tier Limits
```typescript
interface SubscriptionLimits {
  basic: {
    maxUsers: 5,
    maxProperties: 20,
    monthlyBookings: 100,
    features: ["core", "basic-reporting"]
  },
  pro: {
    maxUsers: 20,
    maxProperties: 100,
    monthlyBookings: 500,
    features: ["core", "advanced-reporting", "api-integrations"]
  },
  enterprise: {
    maxUsers: 100,
    maxProperties: 500,
    monthlyBookings: 2000,
    features: ["core", "advanced-reporting", "api-integrations", "custom-branding", "priority-support"]
  }
}
```

### Billing Integration
- **Stripe Integration**: Automated subscription billing
- **Usage Tracking**: Monitor property count, user count, API calls
- **Upgrade/Downgrade**: Seamless tier transitions
- **Trial Management**: 30-day free trials for new organizations

## API Key Management

### Security Features
- **Encryption at Rest**: All API keys encrypted using AES-256
- **Access Logging**: Track when API keys are accessed
- **Rotation Support**: Easy API key rotation
- **Permission Scoping**: Granular permissions per API key

### Supported Integrations
- **Hostaway**: Property and booking synchronization
- **Stripe**: Payment processing and subscription management
- **Twilio**: SMS notifications and alerts
- **PEA (Property Express Australia)**: Regional property management
- **Zapier**: Workflow automation (Enterprise)

## Monitoring & Analytics

### Organization Metrics
- **Usage Statistics**: Properties, users, bookings per organization
- **Performance Metrics**: Response times, error rates per tenant
- **Financial Tracking**: Revenue per organization, subscription health
- **Feature Adoption**: Which features are used by each organization

### Health Monitoring
- **Database Performance**: Query performance per organization
- **API Rate Limiting**: Prevent abuse while allowing growth
- **Error Tracking**: Organization-specific error monitoring
- **Uptime Monitoring**: SLA tracking per subscription tier

## Licensing Model

### Revenue Streams
1. **Monthly Subscriptions**: Tiered pricing based on features and limits
2. **API Usage Fees**: Premium charges for high-volume API usage
3. **Custom Integrations**: One-time setup fees for custom integrations
4. **Support Packages**: Premium support tiers for enterprise customers

### White Label Options
- **Custom Domains**: Enterprise customers can use their own domains
- **Complete Branding**: Remove HostPilotPro branding for white label
- **Custom Features**: Develop organization-specific features
- **Data Export**: Full data portability for enterprise customers

## Scaling Considerations

### Database Scaling
- **Read Replicas**: Separate read replicas for reporting queries
- **Sharding**: Partition large organizations to separate databases
- **Archiving**: Move old data to cheaper storage tiers

### Application Scaling
- **Load Balancing**: Distribute traffic across multiple app instances
- **Caching**: Redis for session storage and frequently accessed data
- **CDN**: Static asset delivery via CloudFront or similar
- **Background Jobs**: Separate queue workers for heavy processing

## Security Compliance

### Data Protection
- **GDPR Compliance**: Right to deletion, data portability
- **SOC 2 Type II**: Security and availability controls
- **Data Encryption**: At rest and in transit
- **Audit Logging**: Complete audit trail for compliance

### Access Controls
- **Multi-Factor Authentication**: Required for admin users
- **IP Whitelisting**: Restrict access by IP address
- **Session Management**: Secure session handling
- **API Rate Limiting**: Prevent abuse and DoS attacks

## Migration Support

### Data Migration
- **Bulk Import Tools**: CSV, Excel, API imports
- **Hostaway Sync**: Automatic property and booking synchronization
- **Legacy System Migration**: Custom migration scripts
- **Data Validation**: Ensure data integrity during migration

### Training & Support
- **Onboarding Documentation**: Step-by-step setup guides
- **Video Training**: Role-specific training materials
- **Live Training Sessions**: Personalized training for enterprise customers
- **24/7 Support**: Premium support for enterprise subscriptions

This architecture ensures each property management company operates independently while sharing the same robust, scalable platform infrastructure.