# HostPilotPro - Hospitality Management Platform

## Overview
HostPilotPro is a comprehensive, multi-tenant property management platform designed for licensing to hospitality professionals. It offers complete organization isolation, role-based access control, property management, task tracking, booking systems, and financial oversight with source attribution. The platform includes "Captain Cortex AI bot" - The Smart Co-Pilot for Property Management by HostPilotPro, providing intelligent assistance. It is built for scalable multi-tenant deployment with separate company domains, encrypted API key storage, and subscription-based licensing, aiming for a significant presence in the hospitality tech market.

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
- **AI Integration**: Custom OpenAI Assistant (`asst_OATIDMTgutnkdOJpTrQ9Mf7u`) for the Captain Cortex AI bot, with intelligent fallback and response caching.

### Feature Specifications
- **Authentication**: Replit Auth with OIDC, persistent sessions, and seven distinct user roles (admin, portfolio-manager, owner, staff, retail-agent, referral-agent, guest) with granular authorization.
- **Navigation**: Modular, hierarchical system with role-based visibility (Core, Property Management, Guest Services, Financial, Administration).
- **Property Management**: Full CRUD for properties, status tracking, and owner assignment. Includes features like property appliances management, insurance tracking, and property documents system with expiry alerts.
- **Task Management**: Maintenance, cleaning, inspection tasks with priority, status workflow, assignment, and property association. Includes AI auto-assignment, task attachments, and a comprehensive offline cache system.
- **Booking System**: Guest management, calendar integration, financial tracking, and property association. Enhanced with agent booking integration and a secure guest ID verification system (OCR).
- **Financial Management**: Transaction types (income, expense, commission), revenue reporting, cost tracking, and commission management. Features include an automated invoice creator, booking income rules with commission structures, and a finance engine for advanced management.
- **Platform Administration**: Global settings (currency, VAT, commission rules), auto-billing toggles, task automation, and API credential management. Includes audit trail, admin override controls, and SaaS management tools (signup, tenant provisioning).
- **Guest Services**: Guest portal with smart requests (AI chat), AI utility alerts, guest departure surveys, and a streamlined check-out wizard.
- **Advanced Modules**:
    - **Smart Inventory & Supply Chain Tracker**: Property-specific inventory, supplier coordination, automated purchase orders, and AI-powered demand forecasting.
    - **Maintenance Log, Warranty Tracker & AI Repair Cycle Alerts**: Comprehensive job tracking, warranty monitoring, and AI-powered service cycle predictions.
    - **Auto-Scheduling Rules & Recurring Task Generator**: Automated task scheduling based on rules, recurring task generation, and analytics.
    - **Guest Check-In / Check-Out Tracker**: Automated workflows for guest arrival/departure, passport documentation, and electricity meter readings (OCR).
    - **Maintenance, Utilities & Renovation Tracker**: Management of maintenance issues, utility accounts, bill tracking, and AI-driven suggestions.
    - **Owner Dashboard Enhancement Suite**: Onboarding wizard, document upload, property settings, maintenance module, and task history.
    - **Agent Dashboards**: Live booking engines, commission tracking, and marketing tools for retail and referral agents.
    - **Property Reviews Management System**: Aggregation of guest reviews with AI sentiment analysis and summary generation.
    - **Staff Skills Certification System**: Tracking of staff qualifications and certification expiry.
    - **Property Investments System**: Tracking capital investments and ROI management.
    - **Task AI Scan Results System**: Automated photo analysis for quality control in task completion.
    - **Shared Costs Management System**: Splitting building-level costs across properties/owners.
    - **Property Chat Messages System**: Multi-language communication with automatic translation.
    - **Dynamic Pricing Recommendations System**: AI-powered rate optimization based on market sources.
    - **Seasonal Forecasting System**: AI-powered occupancy and rate predictions based on seasonality.
    - **WhatsApp Bot Logging System**: Analytics for user interaction and command usage.
    - **Vendor Management & Supply Ordering System**: Managing vendors and procurement lifecycle.
    - **Security Deposits & Damage Management System**: Tracking deposits, documenting damages, and automating deductions.
    - **Portfolio Health Scoring System**: Holistic property performance monitoring with weighted scoring factors.
    - **Sustainability Metrics Tracking System**: Environmental monitoring, carbon footprint management, and recommendations.

## External Dependencies
- **Database**: Neon PostgreSQL serverless database (primary).
- **Real-time Features**: Supabase client integration (secondary).
- **Deployment**: Railway CLI integration for production deployment.
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

## Recent Changes
- **Database Integration**: Successfully integrated Supabase client alongside Neon primary database
- **Railway Deployment**: Added comprehensive Railway deployment configuration with CLI tools
- **Multi-Platform Setup**: Dual database approach (Neon primary + Supabase for enhanced features)
- **Production Ready**: Railway configuration optimized for production deployment