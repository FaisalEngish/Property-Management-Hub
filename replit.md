# HostPilotPro - Hospitality Management Platform

## Overview

HostPilotPro is a comprehensive property management platform designed for hospitality professionals. It features role-based access control, property management, task tracking, booking systems, and financial oversight. The application uses a modern full-stack architecture with React frontend, Express backend, PostgreSQL database with Drizzle ORM, and integrates with Replit's authentication system.

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
- **Primary Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL table for session persistence
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
- **Provider**: Replit Auth with OIDC
- **Session Management**: Persistent sessions stored in PostgreSQL
- **Role-Based Access**: Seven user roles (admin, portfolio-manager, owner, staff, retail-agent, referral-agent, guest)
- **Authorization**: Route-level and component-level access control

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

## Changelog
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