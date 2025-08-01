# HostPilotPro - Property Management Platform

A comprehensive, multi-tenant property management platform designed for hospitality professionals. Built with React, TypeScript, and Express.js.

## Features

- **Multi-tenant Architecture** with organization isolation
- **Property Management** with full CRUD operations
- **Task Management** with AI-powered automation
- **Booking System** with calendar integration
- **Financial Management** with commission tracking
- **AI Integration** via Captain Cortex assistant
- **Real-time Features** via Supabase integration
- **Role-based Access Control** (7 user roles)

## Tech Stack

- **Frontend**: React 18, TypeScript, Wouter, TanStack Query
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Radix UI, Tailwind CSS, shadcn/ui
- **Authentication**: OpenID Connect (Replit Auth)
- **AI**: OpenAI GPT-4o integration
- **Deployment**: Railway, Replit Deployments

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Database Setup
```bash
npm run db:push
```

### Production Deployment

#### Railway
```bash
./railway-deploy.sh
```

#### Replit
Click the "Deploy" button in Replit interface

## Environment Variables

Required environment variables:
```
DATABASE_URL=your_postgresql_url
OPENAI_API_KEY=your_openai_key
SESSION_SECRET=your_session_secret
SUPABASE_URL=your_supabase_url (optional)
SUPABASE_ANON_KEY=your_supabase_key (optional)
```

## Project Structure

```
├── client/                 # React frontend
├── server/                 # Express backend
├── shared/                 # Shared schemas and types
├── railway.json           # Railway deployment config
├── railway-deploy.sh      # One-click Railway deployment
└── DEPLOYMENT_OPTIONS.md  # Deployment guide
```

## Documentation

- [Railway Deployment](RAILWAY_DEPLOYMENT.md)
- [Deployment Options](DEPLOYMENT_OPTIONS.md)
- [Project Architecture](replit.md)

## License

MIT License - Built for the hospitality industry

## Current Status

✅ 23+ properties managed
✅ Full multi-tenant functionality
✅ AI-powered task automation
✅ Railway deployment ready
✅ Supabase integration configured