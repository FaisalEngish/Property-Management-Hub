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
- **Task Management**: Maintenance, cleaning, inspection tasks with priority, status workflow, assignment, property association, AI auto-assignment, attachments, and offline cache.
- **Booking System**: Guest management, calendar integration, financial tracking, property association, agent booking integration, and secure guest ID verification.
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
- **Third-Party Integrations**: Hostaway, Stripe, Twilio, PEA (as per API Connections management system).