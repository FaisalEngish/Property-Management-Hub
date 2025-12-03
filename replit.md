# HostPilotPro - Hospitality Management Platform

## Overview
HostPilotPro is a multi-tenant property management platform for hospitality professionals, offering organization isolation, role-based access, and comprehensive management features including property, task, booking, and financial oversight. It features an AI bot, "Captain Cortex," for intelligent assistance. The platform is designed for scalable, multi-tenant deployment with separate company domains, encrypted API key storage, and subscription-based licensing, aiming to be a leader in hospitality technology.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform uses Radix UI primitives with shadcn/ui and Tailwind CSS for a modern, consistent design. It features a modular, hierarchical navigation system with role-based visibility, enhanced by visual indicators like role badges and color-coded access levels. The design prioritizes mobile responsiveness.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack React Query for state management, and Vite for building.
- **Backend**: Express.js with TypeScript, Replit Auth (OpenID Connect) for authentication, and `express-session` with PostgreSQL store for session management.
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations. All data tables include `organizationId` for tenant separation.
- **API Design**: RESTful endpoints with role-based authorization.
- **Multi-Tenant Architecture**: Supports separate company domains, encrypted API key storage per organization, and tenant-aware database queries.
- **Performance Optimization**: Multi-layer caching (in-memory, React Query), fast API endpoints, and lazy loading ensure instant navigation.
- **Real-Time Data Updates**: Centralized cache invalidation architecture with two key modules:
  - `client/src/lib/queryKeys.ts`: Centralized query key factory and invalidation helpers with `matchesQueryKeyPattern()` for matching parameterized queries like `['/api/finance/analytics', { propertyId: 66 }]`
  - `client/src/lib/cacheManager.ts`: Orchestrates cache invalidation with cross-module dependencies (e.g., task → finance + dashboard)
  - `resourceToCachePatterns` maps resource types to cache patterns including `/api/finance/analytics` for finance-affecting mutations
  - SSE real-time events via `server/realtime-events.ts` broadcast changes to connected clients
  - Finance Hub analytics queries auto-refresh when tasks/bookings/utilities are created/updated
- **AI Integration**: Custom OpenAI Assistant (`asst_OATIDMTgutnkdOJpTrQ9Mf7u`) for the Captain Cortex AI bot with real-time database-grounded Q&A. Cache is disabled for live data accuracy. API key sanitization ensures proper authentication. Staff data sourced exclusively from staff_members table (salary & staff management) for accurate counts and details.
- **Build & Deployment**: Custom esbuild script (`scripts/build-server.mjs`) with `packages: 'external'` configuration to properly handle ESM/CommonJS interop for production deployment. Resolves Express and body-parser module loading issues in ESM context. The build script includes an esbuild plugin that permanently excludes all Vite-related files (`server/vite.ts`, `vite.config.ts`) from the production bundle, preventing `ERR_MODULE_NOT_FOUND: Cannot find package 'vite'` errors on Render. Vite is only used at build-time for the frontend, never bundled into the server.

### Feature Specifications
- **Authentication**: Replit Auth with OIDC, persistent sessions, and seven distinct user roles with granular authorization.
- **Navigation**: Modular, hierarchical system with role-based visibility (Core, Property Management, Guest Services, Financial, Administration).
- **Property Management**: Full CRUD for properties, status tracking, owner assignment, appliances, insurance, and document management with expiry alerts.
- **Task Management**: Maintenance, cleaning, inspection tasks with priority, status workflow, assignment, property association, AI auto-assignment, attachments, and offline cache. Includes automatic finance integration for expense tracking. Context-aware task creation with auto-property selection when creating tasks from property-specific pages (UltraFastTasks with propertyId URL parameter, PropertyHub with selected property).
- **Booking System**: Guest management, calendar integration, financial tracking, property association, agent booking integration, secure guest ID verification, and pre-payment tracking with UI indicators and check-out validation. Local-only booking mode with skipHostawaySync flag for Hostaway properties (bypasses API sync for manual bookings/testing).
- **Financial Management**: Transaction types, revenue reporting, cost tracking, commission management, automated invoice creation, booking income rules, and an advanced finance engine.
- **Platform Administration**: Global settings, auto-billing, task automation, API credential management, audit trail, admin override, and SaaS management tools.
- **Guest Services**: Guest portal with smart requests (AI chat), AI utility alerts, guest departure surveys, and a streamlined check-out wizard.
- **Advanced Modules**: Smart Inventory & Supply Chain Tracker, Maintenance Log & Warranty Tracker, Auto-Scheduling Rules, Guest Check-In/Check-Out Tracker, Owner & Agent Dashboard Enhancements, Property Reviews Management, Staff Skills Certification, Property Investments, Task AI Scan Results, Shared Costs Management, Property Chat Messages, Dynamic Pricing Recommendations, Seasonal Forecasting, WhatsApp Bot Logging, Vendor Management, Security Deposits & Damage Management, Portfolio Health Scoring, and Sustainability Metrics Tracking.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database.
- **Deployment**: Railway CLI.
- **ORM**: Drizzle ORM.
- **State Management**: TanStack React Query.
- **UI Components**: Radix UI.
- **Authentication**: OpenID Connect (via Replit Auth).
- **Session Management**: `express-session`.
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS.
- **Language**: TypeScript.
- **AI**: OpenAI API.
- **Third-Party Integrations**:
    - **Lodgify**: Property management sync.
    - **Makcorps Hotel Pricing API**: Hotel pricing comparison.
    - **RentCast.io**: Property data enrichment and automated valuations (140M+ US properties).
    - Hostaway
    - Stripe
    - Twilio
    - PEA (as per API Connections management system).