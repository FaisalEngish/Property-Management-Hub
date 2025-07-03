# HostPilotPro - Hospitality Management Platform

## Overview

HostPilotPro is a comprehensive, multi-tenant property management platform designed for licensing to hospitality professionals. It features complete organization isolation, role-based access control, property management, task tracking, booking systems, and financial oversight with source attribution. The application uses a modern full-stack architecture with React frontend, Express backend, PostgreSQL database with Drizzle ORM, and integrates with Replit's authentication system. The platform is built for scalable multi-tenant deployment with separate company domains, encrypted API key storage, and subscription-based licensing.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **UI Components**: Radix UI primitives with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: express-session with PostgreSQL store
- **Database**: PostgreSQL with Drizzle ORM
- **API Design**: RESTful endpoints with role-based authorization

### Data Storage Solutions
- **Primary Database**: Neon PostgreSQL serverless database with multi-tenant architecture
- **Organization Isolation**: All data tables include organizationId for complete tenant separation
- **ORM**: Drizzle ORM for type-safe database operations with tenant-aware queries
- **Session Storage**: PostgreSQL table with organization-specific session isolation
- **API Key Storage**: Encrypted credential storage per organization
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Persistent sessions stored in PostgreSQL
- **Role-Based Access**: Seven user roles (admin, portfolio-manager, owner, staff, retail-agent, referral-agent, guest)
- **Authorization**: Route-level and component-level access control

### Modular Navigation System
- **Architecture**: Hierarchical module-based navigation with role-based visibility
- **Modules**: Core, Property Management, Guest Services, Financial, Administration
- **Features**: Collapsible sidebar, role-specific menu items, mobile-responsive design
- **Scalability**: Easily extensible for new modules and user roles
- **Visual Indicators**: Role badges, icons, and color-coded access levels

### Property Management
- **CRUD Operations**: Full property lifecycle management
- **Property Attributes**: Name, address, bedrooms, bathrooms, capacity, pricing
- **Status Tracking**: Active, inactive, maintenance states
- **Owner Assignment**: Properties linked to specific users

### Task Management
- **Task Types**: Maintenance, cleaning, inspection, and custom types
- **Priority System**: High, medium, low priority levels
- **Status Workflow**: Pending → In Progress → Completed
- **Assignment**: Tasks assigned to specific users
- **Property Association**: Tasks linked to specific properties

### Booking System
- **Guest Management**: Contact information and preferences
- **Calendar Integration**: Visual booking calendar with availability
- **Financial Tracking**: Total amounts and payment status
- **Property Association**: Bookings linked to specific properties

### Financial Management
- **Transaction Types**: Income, expense, commission tracking
- **Revenue Reporting**: Monthly and YTD summaries
- **Cost Tracking**: Property-specific expense monitoring
- **Commission Management**: Agent commission calculations

### Platform Administration
- **Global Settings**: Admin-only configuration panel for platform defaults
- **Currency & VAT**: Default currency, tax rates, and display symbols
- **Commission Rules**: Automated commission rates for retail and referral agents
- **Auto-billing**: Toggles for add-on services and utility tracking automation
- **Task Automation**: Reminder systems and cleanup cycles
- **API Integration**: Secure credential management for Hostaway, PEA, and other services

## Data Flow

1. **Authentication Flow**: User authenticates via Replit → Session created → Role determined → Route access granted
2. **Property Operations**: Frontend requests → Express middleware auth check → Database query via Drizzle → Response with filtered data based on role
3. **Task Management**: Create/update requests → Validation → Database persistence → Real-time UI updates via React Query
4. **Booking Process**: Form submission → Validation → Availability check → Database creation → Calendar refresh

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **openid-client**: Authentication integration
- **express-session**: Session management

### Development Tools
- **TypeScript**: Type safety across full stack
- **Vite**: Frontend build and development
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Replit Auth integration

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Assets**: Served by Express in production
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Replit Integration
- **Runtime Error Overlay**: Development error handling
- **Cartographer Plugin**: Replit development tools integration
- **Development Banner**: Replit environment detection

## Multi-Tenant Architecture

### Organization Isolation
- **Separate Domains**: Each company operates on their own subdomain (e.g., `acme.hostpilotpro.com`)
- **Complete Data Separation**: All tables include `organizationId` for tenant isolation
- **Custom Branding**: Organizations can customize logos, colors, and company settings
- **Subscription Tiers**: Basic, Pro, Enterprise with different limits and features

### API Key Management  
- **Encrypted Storage**: All third-party API keys stored encrypted per organization
- **Supported Providers**: Hostaway, Stripe, Twilio, PEA, and other integrations
- **Secure Access**: Automatic encryption/decryption with audit logging
- **Easy Rotation**: Simple API key management and rotation

### Deployment Ready
- **Multi-Tenant Middleware**: Automatic organization detection from domain
- **Tenant-Aware Queries**: All database operations respect organization boundaries
- **Organization Seeder**: CLI tools to create new organizations and admin users
- **Licensing Framework**: Ready for subscription-based licensing model

## Changelog
- July 03, 2025. Enhanced Staff Salary, Overtime & Emergency Tracker module with advance request and overtime management features: Expanded existing 4-tab interface to 7-tab comprehensive system (Overview, Advance Requests, Overtime Tracker, Clock In/Out, Settings, Emergency Tasks, Payroll), implemented complete advance salary request workflow with admin approval system (approve/reject/pending status), built sophisticated overtime tracking with compensation options (overtime pay or compensatory time off), added role-based access controls (staff can request, admin/PM can approve), comprehensive notification system for pending approvals, complete audit trail for all requests and approvals, mock backend API with realistic data for testing advance requests, overtime compensation tracking, and approval workflows. Features include transparent request history, status badges, admin approval buttons, automatic deduction from next salary cycle for approved advances, overtime hour validation, emergency task bonus integration, and complete staff transparency tools. System provides comprehensive salary management with request workflows, approval processes, and financial tracking for enhanced staff satisfaction and administrative control.
- July 03, 2025. Implemented comprehensive Booking Income Rules, Routing & Commission Structure module with property-based OTA management: Built complete 5-tab frontend interface (Payout Rules with property-specific commission splits across platforms, Booking Income with revenue tracking and payout processing, Owner Balances with withdrawal request management, Commission Payouts for retail/referral agents, Analytics with platform performance metrics), comprehensive mock data system for property payout rules (Airbnb, VRBO, Booking.com, Direct bookings with customizable owner/management splits), booking income records with platform-specific routing and automated commission calculations, owner balance requests with approval workflows, agent commission payouts with performance tracking, and platform analytics with distribution insights, advanced rule management with platform-specific percentage splits (e.g., Airbnb 70/30 owner/management, VRBO 100% management), automated booking income processing with Stripe fee calculations and payout status tracking, comprehensive owner balance management with full/partial withdrawal requests and approval workflows, complete commission tracking for retail and referral agents with performance metrics, sophisticated analytics dashboard with total booking income, platform distribution percentages, and key performance indicators. Features include property-specific rule configuration, automated income routing based on booking platform, real-time balance calculations, commission pre-calculation per quote, comprehensive audit trails for all financial transactions, and role-based access control (admin/PM can manage rules, owners can view balances). Module provides complete transparency for booking income distribution, automated commission calculations, streamlined payout workflows, and comprehensive financial analytics for property management operations. Route accessible at `/booking-income-rules` with sidebar navigation integration under Financial module for admin and portfolio-manager roles.
- July 03, 2025. Implemented comprehensive Task Attachments & Property-Specific Notes module for enhanced staff guidance and training: Built complete database schema with task_attachments, property_notes, property_attachments, task_guide_templates, and attachment_access_logs tables supporting visual guides, manuals, property-specific instructions, and access tracking, extended storage layer with comprehensive CRUD operations for all attachment types with filtering, sorting, and access logging capabilities, developed complete API endpoints for task attachments, property notes, property attachments, guide templates, and access logging with role-based security, created comprehensive 4-tab frontend interface (📋 Overview with quick stats and benefits display, 📎 Task Attachments with visual guide management and preview capabilities, 📝 Property Notes with pinned notes, priority levels, and department filtering, ⚙️ Management with template system and analytics placeholders), implemented advanced attachment system supporting images, PDFs, videos, and documents with categories (guide, reference, safety, procedure) and department tagging, sophisticated property notes system with note types (appliance, fragile, preference, warning, instruction), priority levels (low, medium, high, critical), pinned notes functionality, department applicability, and visibility controls, comprehensive preview system with lightbox modals for images and iframe support for PDFs, complete access logging and audit trail for attachment usage tracking. Features include file type icons, real-time filtering, drag-and-drop interface feel, role-based permissions (admin/PM can upload, staff can view), and comprehensive search/filter capabilities. Module provides staff with visual guides during task execution, reduces human error through step-by-step instructions, enables easier staff training with comprehensive documentation, and improves owner service quality through preference tracking. Route accessible at `/task-attachments-notes` with complete sidebar navigation integration under Property Management module for admin, portfolio-manager, and staff roles.
- July 03, 2025. Implemented comprehensive Agent Dashboards for both Retail and Referral agents with live booking engines, commission tracking, and marketing tools: Built advanced Retail Agent Dashboard with 3-tab interface (🔍 Live Booking Engine with Hostaway API integration and advanced filtering by date range, bedrooms, amenities, price range, 📄 Villa Descriptions & Media with synced property information, amenities, rules, and Google Drive/media link access, 💰 Finance & Commissions with commission logs, payout requests, and admin-approved payment tracking), sophisticated Referral Agent Dashboard with 3-tab interface (🏠 Assigned Villas with monthly/yearly performance tracking, occupancy rates, guest review averages, 10% commission cuts from management revenue, 💼 Commission Tracking with month-by-month logs, downloadable statements, payment status tracking, 🔔 Notifications with real-time updates for new reviews, bookings, commission payments, and performance improvements), marketing access features with unbranded photos, fact sheets, affiliate URL generation, and lead tracking capabilities. Features live Hostaway integration for property availability and booking quotes, commission pre-calculation per quote, complete transparency for both agent types with performance motivation tools, notifications system with 30-second refresh intervals, marketing material access for referral agents, and comprehensive payout workflows with admin approval processes. System includes role-based access control, real-time data synchronization, and complete agent resource management.
- July 03, 2025. Implemented comprehensive Owner Dashboard with complete earnings analytics, balance management, AI suggestions, and timeline feeds: Built sophisticated 4-tab interface (📊 Earnings Overview with selectable periods and platform revenue splits, 🧾 Balance & Withdrawals with property-specific breakdowns and payout request workflows, 💡 AI Suggestions from guest review analysis with prioritized recommendations, 📋 Timeline Activity Feed with Facebook-style property logs), comprehensive earnings analytics with average nightly rates, total earnings by period, occupancy trends, and platform split visualization (Airbnb, VRBO, Booking.com, Direct, Marriott via Hostaway API), advanced balance management with live-updated property balances, detailed expense breakdowns (management, utilities, maintenance, add-ons, welcome packs), payout request system with PM/Admin notifications and receipt confirmation workflow, AI-powered guest review analysis extracting improvement suggestions for maintenance, amenities, experience, safety, and communication with estimated costs and impact ratings, comprehensive timeline activity feed with guest check-ins/outs, housekeeping status, maintenance reports, garden/pool updates, staff notes with photo attachments, and task linking. Features role-based access control for owners only, period filtering (this week/month/year/custom), property-specific views, activity type filtering, and complete transparency tools to build trust and reduce manual communication. Includes payout workflow (owner request → PM/Admin alert → receipt upload → owner confirmation → timeline logging) and comprehensive financial transparency with platform revenue tracking and expense attribution.
- July 03, 2025. Completely reimplemented comprehensive Enhanced Maintenance & Task System based on detailed specifications: Built advanced task management with comprehensive department tagging (🧹 Cleaning, 🔧 Maintenance, 🏊 Pool, 🏝 Garden, 🗂 General), enhanced task types (🔁 Recurring, 🧠 AI-Suggested, 📅 Booking-based, ✍️ Manual, 🚨 Emergency), comprehensive status workflow (Pending → In Progress → Pending Review → Completed → Archived), enhanced task flow with proof photos, evidence tracking, issue reporting, expense logging, and completion notes, advanced filtering and search capabilities (department, status, property, keyword search), comprehensive 5-tab interface (Tasks with smart cards, Checklists with safety notes and required tools, Property Guides with attachments and detailed instructions, AI Suggestions with confidence scoring and automatic task creation, Archive with PDF export and statistics), complete task lifecycle management (start task, add expenses, upload proof photos, complete with evidence, manager review and approval), property-specific guides with special equipment instructions (e.g., meat aging machine, water-from-air units), AI-powered task suggestions based on guest feedback with trigger source tracking, comprehensive archiving system with automated 30-day archival and monthly PDF export capabilities, detailed expense tracking with receipt management and category organization, enhanced checklist system with safety notes, required tools, and estimated completion times, role-based access control (admin/PM manage tasks, staff execute tasks, owners view timeline), task timeline for owner visibility with emoji-based activity tracking. System includes complete proof-of-service documentation, smart accountability features, and departmental visibility for comprehensive task management and accountability.
- July 03, 2025. Implemented comprehensive Enhanced Finance Engine with advanced financial management capabilities: Built complete database schema with owner balance trackers, payout routing rules, utility bill processing, and enhanced finance transaction logs tables, extended storage layer with comprehensive methods for balance management, payout routing automation, utility bill processing workflows, and transaction logging, created complete backend API endpoints with role-based access control (admin/PM can manage finances, staff can process bills, owners have view access), developed comprehensive 5-tab frontend interface (Owner Balances with individual selection and tracking, Payout Routing with automated split calculations, Utility Processing with bill routing decisions, Transaction Logs with full audit trail, Analytics with system health monitoring), implemented complete CRUD operations for balance trackers and routing rules with form dialogs, utility bill processing workflow with routing decisions (owner charge vs company expense), real-time balance calculation and display with colorized metrics, comprehensive transaction logging for all financial activities, system health monitoring and analytics dashboard. Route accessible at `/finance-engine` with demo authentication middleware and role-based feature access for scalable financial management across the platform.
- July 03, 2025. Implemented comprehensive Enhanced Maintenance & Task System with departments, proof photos, AI suggestions, and activity logs: Built advanced 5-tab interface (Tasks with department filtering, Checklists with default templates, Property Guides with detailed instructions, AI Suggestions with automatic task creation, Archive with PDF export capabilities), database schema enhancement for task checklists, property guides, AI task suggestions, task expenses, and archived tasks, comprehensive backend API endpoints for task lifecycle management (start, complete, accept AI suggestions, export PDF), mock storage layer with detailed checklists for cleaning/pool/garden departments, property-specific maintenance guides with safety notes and attachments, AI-powered task suggestions based on guest feedback and usage patterns, complete frontend with department icons, priority badges, status tracking, evidence photo display, checklist progress, and task detail dialogs. Enhanced task workflow includes proof photo uploads, issue tagging, completion notes, and comprehensive audit trails. System features role-based access, automated PDF monthly reports, and seamless integration with existing task management infrastructure. Route added at `/maintenance-task-system` with full authentication middleware support.
- July 02, 2025. Completed AdminBalanceResetCard deployment across all eligible user dashboards: Successfully integrated reusable AdminBalanceResetCard component across OwnerDashboard (financial overview), PortfolioManagerDashboard, ReferralAgentDashboard (commissions tab), and RetailAgentBooking (commission tracker). Component features admin-only visibility controls, confirmation dialogs, audit logging, role-based configuration for all eligible user types (Owner, Portfolio Manager, Retail Agent, Referral Agent), automatic balance calculation integration, and proper query invalidation for real-time data updates. Provides comprehensive individual user profile balance management with secure admin permissions and complete audit trail integration across the entire platform.
- July 02, 2025. Added logout functionality to Staff Dashboard and Retail Agent Dashboard: Implemented logout buttons in both dashboard headers with proper styling and functionality, allowing users to properly exit their sessions via `/api/auth/demo-logout` endpoint. Both dashboards now feature prominent logout buttons alongside their existing UI elements for complete user session management.
- July 02, 2025. Implemented comprehensive Admin Finance Reset Control Module: Built secure admin-only balance reset system with complete audit logging capabilities, database schema with balanceResetAudit table for full traceability, user filtering by role (Owner, Portfolio Manager, Referral Agent, Retail Agent), balance calculation based on pending payouts and commissions, comprehensive storage layer with getUsersForBalanceReset, getUserBalanceSummary, resetUserBalance, and getBalanceResetAuditLog methods, secure backend API with admin role verification middleware, complete frontend interface with user selection, balance confirmation, and audit log viewing, integrated into sidebar navigation under Administration module with Shield icon and route `/admin/finance-reset`. Features include automatic balance calculation, confirmation dialogs with warnings, complete audit trail with admin username and timestamps, and secure role-based access control for admin users only.
- July 02, 2025. Implemented comprehensive Referral Agent Dashboard Module: Built complete referral agent commission tracking system with 6-tab dashboard interface (Overview, Properties, Commissions, Analytics, Agent Tools, Program Rules), comprehensive database integration with existing propertyReferrals, referralEarnings, agentPayouts tables, complete API endpoints for properties, earnings, payouts, program rules, and analytics, property referral tracking with commission calculation and performance metrics, monthly/yearly earning filters with occupancy and review score tracking, payout request management with approval workflow, agent tools for fact sheets and media library access, program rules display with terms and conditions. Extended storage layer with methods for getReferralAgentProperties, getReferralEarnings, getReferralCommissionSummary, getReferralPayouts, getReferralProgramRules, getPropertyPerformanceAnalytics. Integrated into sidebar navigation with UserPlus icon and route `/referral-agent` for referral-agent role. Features comprehensive commission tracking, property performance analytics, and agent resource management.
- July 02, 2025. Implemented comprehensive Property Media Library Module: Built complete media management system with database schema (propertyMedia, propertyInternalNotes, agentMediaAccess tables), comprehensive frontend with role-based tabs (Agent Media Library for agents, Upload Panel and Approval Queue for admin/PM, Internal Notes for all), media upload functionality with approval workflow, agent access tracking, property notes with visibility controls, and lightbox preview dialogs. Extended storage layer with media CRUD operations, approval management, and access logging. Integrated into sidebar navigation under Guest Services with Camera icon and route `/agent-media-library`. Features include media type filtering, property search, tag management, file size tracking, and comprehensive security controls for agent-approved content.
- July 02, 2025. Implemented comprehensive Recurring Services & Bills Management System: Built advanced property management service tracking with comprehensive database schema (recurringServices, recurringServiceBills, billReminders, servicePerformance tables), automated billing cycles and reminder system, service provider management with contract tracking, bill payment processing with multiple routing options (company expense/owner charge), performance analytics with quality ratings and cost effectiveness metrics, complete 4-tab frontend interface (Services, Bills & Payments, Reminders, Performance), and role-based access for admin, portfolio-manager, and staff users. Extended storage layer with analytics dashboard, overdue bill tracking, and automated reminder generation.
- July 02, 2025. Implemented comprehensive Referral Agent & Retail Agent Module: Built complete agent commission system with Referral Agent Dashboard (property assignments, monthly earnings from 10% management fees, occupancy tracking, review scores, payout requests, PDF statements), Retail Agent Booking Engine (live Hostaway API integration, advanced property filtering, commission calculation, booking form with guest details), and Agent Finance Log (commission tracking, payout management, payment receipts). Extended database schema with propertyReferrals, agentBookings, agentPayouts, referralEarnings, and propertyAgents tables. Created role-based navigation for referral-agent and retail-agent users with dedicated dashboards.
- July 02, 2025. Implemented Smart Utility Tracking & Billing Automation Module: Created comprehensive utility management system with property utility account tracking (electricity, water, internet, gas provider details), automated bill reminder system (4-day overdue notifications), bill upload & receipt management, owner/company billing assignment, and historical expense tracking. Extended database schema with propertyUtilityAccounts, enhanced utilityBills, and utilityBillReminders tables. Built complete storage layer with automated reminder generation, expense analytics, and upload management. Created comprehensive frontend with 4-tab interface (Utility Accounts, Bill Management, Upload Receipt, Historical Logs) and integrated into sidebar navigation.
- July 02, 2025. Implemented comprehensive Financial & Invoice Toolkit module: Built complete 4-tab financial management system with Staff Salary Viewer showing monthly salary and bonus breakdowns, Portfolio Manager Earnings dashboard with rental revenue totals and commission splits, Universal Invoice Tool for creating invoices between any parties with templates (booking commission, maintenance charge, portfolio commission, service fee, expense reimbursement), and Financial Dashboard placeholder. Extended database schema with staffSalaries, commissionEarnings, invoices, invoiceLineItems, and portfolioAssignments tables. Added comprehensive storage layer with CRUD operations, API endpoints for all financial operations, and automatic invoice number generation. Integrated into sidebar navigation and routing for admin, portfolio-manager, and staff access levels.
- July 02, 2025. Implemented comprehensive notification system: Built NotificationDropdown component with real-time updates and unread count badge, integrated notification API endpoints for CRUD operations, added notification triggers for task assignments and payout approvals, enhanced TopBar with notification dropdown, created database-backed notification storage with proper organization isolation. System supports different notification types (task assignments, booking updates, payout actions, maintenance approvals) with priority levels and automatic 30-second refresh intervals.
- July 02, 2025. Implemented comprehensive staff task management system with photo evidence: Enhanced database schema with task_history table for complete audit trail, added new task fields (evidence_photos, issues_found, completion_notes, skip_reason, reschedule_reason), created enhanced storage layer with methods for completeTask, skipTask, rescheduleTask, startTask, built comprehensive API endpoints for task workflow management, and developed complete StaffTasks.tsx frontend with photo upload, issue tagging, task history tracking, and role-based task access control.
- July 02, 2025. Implemented comprehensive owner balance dashboard and payout request system: Created owner_payouts database table with complete workflow tracking (pending→approved→paid→completed), added full storage layer with CRUD operations, built API endpoints for payout management, and created complete frontend interface with balance overview, payout request form, approval workflow, and transaction history tracking.
- July 02, 2025. Implemented complete welcome pack inventory system: Database tables (welcome_pack_items, welcome_pack_templates, welcome_pack_usage), storage layer with CRUD operations, API endpoints, and frontend management interface with tabs for inventory items, property templates, and usage history. Includes automated checkout cost logging and low stock alerts.
- July 02, 2025. Implemented comprehensive multi-tenant architecture for licensing: organization isolation, encrypted API key storage, subdomain-based tenant detection, subscription tiers, and deployment-ready infrastructure for scaling to multiple property management companies.
- July 02, 2025. Enhanced financial tracking with comprehensive source attribution: Guest Payment, Owner Charge, Company Expense, Complimentary (Owner Gift, Company Gift). All records now include processedBy user tracking, reference numbers, and full traceability.
- July 02, 2025. Added comprehensive global Admin Settings panel with platform defaults (currency, VAT, commission rules), auto-billing toggles, task automation settings, and API credential management (Hostaway, PEA)
- July 02, 2025. Added modular navigation system with role-based access control and collapsible sidebar
- July 02, 2025. Enhanced navigation with Services and Payouts pages, department tagging for tasks
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

## Required Features Status

### ✓ Implemented Features
- Role-based login and dashboards (Admin, PM, Staff, Owner, Guest, Retail & Referral Agents)
- Property management with CRUD operations and status tracking
- Task system with filtering and status updates
- Financial dashboard with revenue, commission, and expense tracking
- Booking calendar with visual availability display
- User authentication with Replit Auth integration
- Responsive UI with role-based navigation

### → In Progress Features
- Department tagging for task system
- Recurring task scheduling
- Billing tracker for recurring services and utilities
- Add-on service booking interface (cleaning, massages, etc.)
- Owner payout dashboard + expense tracking improvements
- API-connected booking calendar for agents and guests

### 📋 Later Development (Future Versions)
- Property-linked media library with agent access
- AI triggers for guest feedback auto-task creation
- Welcome pack inventory and stock usage tracking (basic inventory exists)
- Real-time finance summary with category splits
- Hostaway API integration for live booking data
- Smart task automation based on guest reviews/messages
- **Google Sheets Transition & QuickBooks Integration Module**: Phase out Google Sheets dependency while maintaining all financial reporting benefits, with optional QuickBooks sync for external accounting and Excel/PDF export capabilities
- **Expense Approval Workflow & Repair Suggestion System**: Multi-role expense suggestion system with image uploads, approval workflows, notification system, and transparent expense tracking for maintenance, inventory, improvements, and service upgrades