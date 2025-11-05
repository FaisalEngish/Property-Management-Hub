# HostPilotPro - Hospitality Management Platform

## Overview
HostPilotPro is a comprehensive, multi-tenant property management platform designed for licensing to hospitality professionals. It offers complete organization isolation, role-based access control, property management, task tracking, booking systems, and financial oversight with source attribution. The platform includes an AI bot, "Captain Cortex AI bot," providing intelligent assistance. It is built for scalable multi-tenant deployment with separate company domains, encrypted API key storage, and subscription-based licensing, aiming for a significant presence in the hospitality tech market.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform utilizes Radix UI primitives with shadcn/ui for a modern design system, styled with Tailwind CSS for consistent theming. A modular, hierarchical navigation system with role-based visibility ensures an intuitive user experience. Visual indicators like role badges, icons, and color-coded access levels enhance usability. Design prioritizes mobile responsiveness.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, and Vite for building.
- **Backend**: Express.js with TypeScript, Replit Auth for authentication (OpenID Connect), and express-session with PostgreSQL store for session management.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations. All data tables include `organizationId` for tenant separation.
- **API Design**: RESTful endpoints with role-based authorization.
- **Multi-Tenant Architecture**: Supports separate company domains, encrypted API key storage per organization, and tenant-aware database queries.
- **Performance Optimization**: Multi-layer caching (in-memory, React Query), fast API endpoints, and lazy loading for modules ensure instant navigation.
- **Real-Time Data Updates**: Centralized query key management system (`client/src/lib/queryKeys.ts`) ensures consistent cache invalidation across all modules. Query keys include URL parameters for property-specific filtering (e.g., `/api/bookings/with-source?propertyId=7`, `/api/finance/analytics?propertyId=7`). Predicate-based invalidation helpers (`invalidateFinanceQueries`, `invalidatePropertyQueries`, `invalidateBookingQueries`) automatically match and refresh both base and parameterized query caches when mutations occur, ensuring real-time updates across global and property-specific views without manual cache management.
- **AI Integration**: Custom OpenAI Assistant (`asst_OATIDMTgutnkdOJpTrQ9Mf7u`) for the Captain Cortex AI bot with real-time database-grounded Q&A. **Cache disabled (TTL=0)** to ensure live data matching dashboard numbers. Comprehensive statistics calculated from ALL data before limiting context, providing accurate totals for tasks, bookings, finances, and utilities.

### Feature Specifications
- **Authentication**: Replit Auth with OIDC, persistent sessions, and seven distinct user roles with granular authorization.
- **Navigation**: Modular, hierarchical system with role-based visibility (Core, Property Management, Guest Services, Financial, Administration).
- **Property Management**: Full CRUD for properties, status tracking, owner assignment, appliances, insurance, and document management with expiry alerts.
- **Task Management**: Maintenance, cleaning, inspection tasks with priority, status workflow, assignment, property association, AI auto-assignment, attachments, and offline cache. **Automatic Finance Integration**: When a task is completed with an `actualCost` or `estimatedCost`, the system automatically creates a corresponding expense record in the Finance Hub with the task title as description, evidence photos as attachments, and links the finance record back to the task using `financeRecordId` for bi-directional tracking. Comprehensive cache invalidation ensures real-time updates across Finance Hub Recent Transactions and analytics dashboards.
- **Booking System**: Guest management, calendar integration, financial tracking, property association, agent booking integration, and secure guest ID verification. **Pre-Payment Tracking**: Bookings can be paid (fully or partially) before check-in. Special UI indicators show pre-paid status with badges and alerts. Finance Hub counts paid bookings in revenue regardless of check-in status. Check-out validation prevents checking out guests with outstanding payments, displaying toast notifications requiring payment clearance before proceeding.
- **Financial Management**: Transaction types, revenue reporting, cost tracking, commission management, automated invoice creation, booking income rules, and an advanced finance engine.
- **Platform Administration**: Global settings, auto-billing, task automation, API credential management, audit trail, admin override, and SaaS management tools.
- **Guest Services**: Guest portal with smart requests (AI chat), AI utility alerts, guest departure surveys, and a streamlined check-out wizard.
- **Advanced Modules**: Includes Smart Inventory & Supply Chain Tracker, Maintenance Log & Warranty Tracker, Auto-Scheduling Rules, Guest Check-In/Check-Out Tracker, Maintenance/Utilities/Renovation Tracker, Owner & Agent Dashboard Enhancements, Property Reviews Management, Staff Skills Certification, Property Investments, Task AI Scan Results, Shared Costs Management, Property Chat Messages, Dynamic Pricing Recommendations, Seasonal Forecasting, WhatsApp Bot Logging, Vendor Management, Security Deposits & Damage Management, Portfolio Health Scoring, and Sustainability Metrics Tracking.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database (primary), Supabase client integration (secondary).
- **Deployment**: Railway CLI integration.
- **ORM**: Drizzle ORM.
- **State Management**: TanStack React Query.
- **UI Components**: Radix UI.
- **Authentication**: OpenID Connect (via Replit Auth).
- **Session Management**: `express-session`.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS.
- **Language**: TypeScript.
- **AI**: OpenAI API.
- **Third-Party Integrations**: **Lodgify** (property management sync - ACTIVE), Hostaway, Stripe, Twilio, PEA (as per API Connections management system).

## Lodgify API Integration
**Status**: ACTIVE & TESTED  
**API Base URL**: `https://api.lodgify.com`  
**Authentication**: X-ApiKey header (stored per organization in database)

### Multi-Tenant Credential Management
- API keys stored in `organizationApiKeys` table per organization
- Service loads credentials from database using `getLodgifyApiKey(organizationId)`
- Fallback to `LODGIFY_API_KEY` environment variable for testing/development
- Per-organization credential caching prevents cross-tenant leakage
- Clear error messages when API key not configured

### Service Module
- **Location**: `server/lodgify-service.ts`
- **Class**: `LodgifyService` - Multi-tenant service with per-org API key management
- **Methods**:
  - `testConnection()` - Validates API key and connection
  - `getProperties()` - Fetches all properties from Lodgify
  - `getProperty(id)` - Fetches single property details
  - `getBookings(includeTransactions, page, size)` - Fetches bookings with payment data
  - `getBooking(id)` - Fetches single booking details
  - `createBooking(data)` - Creates new booking in Lodgify
  - `getPaymentLink(bookingId)` - Generates payment link for guests
  - `getCalendar(propertyId, startDate, endDate)` - Fetches availability calendar

### API Routes
- **Location**: `server/lodgify-routes.ts`
- **Endpoints**:
  - `GET /api/lodgify/test-connection` - Test API connectivity
  - `GET /api/lodgify/fetch-properties` - Fetch properties from Lodgify
  - `POST /api/lodgify/sync-properties` - Sync properties to local database
  - `GET /api/lodgify/fetch-bookings` - Fetch bookings from Lodgify
  - `POST /api/lodgify/sync-bookings` - Sync bookings with payment data to local database
  - `GET /api/lodgify/sync-status` - Get sync statistics and last sync time

### Data Mapping
**Properties Sync**:
- Maps Lodgify properties to local `properties` table
- Tracks external ID for bidirectional sync
- Updates: name, address, bedrooms, bathrooms, maxGuests, description, currency
- Status: Creates new properties or updates existing ones based on external ID

**Bookings Sync**:
- Maps Lodgify bookings to local `bookings` table  
- Includes transaction data for payment tracking
- Calculates `paymentStatus` (unpaid/partial/paid) from transaction totals
- Maps booking statuses: cancelled, confirmed, pending
- Links to properties via external ID matching
- Syncs: guest info, check-in/out dates, amounts, currency, platform source

### UI Integration
- **Page**: `client/src/pages/admin/ApiConnections.tsx`
- **Features**: Lodgify appears first in predefined services list
- **Actions**: Test connection, fetch data, sync to database, view sync status
- **Sync Metrics**: Shows total properties/bookings and synced counts

### Testing Results
- ✅ Connection test: SUCCESSFUL (Found 1 property)
- ✅ Properties fetch: SUCCESSFUL (Villa Siam Smart Home)
- ✅ Properties sync: SUCCESSFUL (1 created)
- ✅ Bookings endpoint: WORKING (API v2 with transactions support)

### Future Enhancements
- Automated sync scheduler (cron job)
- Webhook receiver for real-time updates
- Finance data sync from booking transactions
- Two-way sync (push local changes to Lodgify)