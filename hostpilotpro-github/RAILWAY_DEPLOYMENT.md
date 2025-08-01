# Railway Deployment Guide for HostPilotPro

## Quick Railway Setup

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub account
- Create new project

### 2. Database Setup
```bash
# Add PostgreSQL service in Railway dashboard
# Railway will provide DATABASE_URL automatically
```

### 3. Environment Variables
Add these in Railway dashboard:
```
DATABASE_URL=<provided_by_railway_postgres>
SESSION_SECRET=your_secure_session_secret
NODE_ENV=production
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=https://gxetpnsgfysaoyrqcphs.supabase.co  
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 4. Deploy Options

#### Option A: Connect GitHub Repository
1. Connect your GitHub repo to Railway
2. Railway will auto-deploy on push
3. Database migrations run automatically

#### Option B: Railway CLI
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### 5. Production Optimizations
```json
// package.json scripts for Railway
{
  "scripts": {
    "build": "npm run db:push && vite build",
    "start": "NODE_ENV=production tsx server/index.ts",
    "dev": "tsx server/index.ts"
  }
}
```

## Why Railway?
- **Faster than Vercel** for full-stack apps
- **Cheaper than Heroku** with better performance  
- **Built-in PostgreSQL** (no need for separate Neon/Supabase)
- **Automatic SSL** and custom domains
- **Real-time logs** and monitoring
- **Team collaboration** features

## Deployment Options

### Option 1: Easy Script Deployment
```bash
./railway-deploy.sh
```

### Option 2: Manual CLI Steps
```bash
# Install Railway CLI (already done)
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Deploy
railway up
```

### Option 3: GitHub Integration
1. Push code to GitHub
2. Connect repository in Railway dashboard
3. Auto-deploy on every commit

## Migration Strategy
1. **Current**: Neon (database) + Replit (development)
2. **With Railway**: Railway (database + deployment) + Replit (development)  
3. **Hybrid**: Keep Neon/Supabase + Deploy to Railway

## Cost Comparison
- **Railway**: $5/month for hobby plan (includes PostgreSQL)
- **Neon + Replit**: Free tier, paid tiers start at $9/month
- **Supabase**: Free tier, pro starts at $25/month
- **Railway benefit**: Single platform for database + deployment