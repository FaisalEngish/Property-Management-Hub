#!/bin/bash

echo "🚀 Railway Deployment Setup for HostPilotPro"
echo "=============================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Login to Railway (if not already logged in)"
railway login

echo "📂 Initialize Railway project"
railway link || railway create

echo "🗄️  Add PostgreSQL database"
echo "   Go to Railway dashboard and add PostgreSQL service"
echo "   Railway will provide DATABASE_URL automatically"

echo "⚙️  Required Environment Variables:"
echo "   Add these in Railway dashboard > Variables:"
echo "   - DATABASE_URL (auto-provided by PostgreSQL service)"
echo "   - SESSION_SECRET=your_secure_session_secret"
echo "   - NODE_ENV=production"
echo "   - OPENAI_API_KEY=your_openai_key"
echo "   - SUPABASE_URL=your_supabase_url"
echo "   - SUPABASE_ANON_KEY=your_supabase_anon_key"
echo "   - SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key"

echo "🚀 Deploy to Railway"
railway up

echo "✅ Deployment complete!"
echo "   Check Railway dashboard for deployment status"
echo "   Your app will be available at: https://[project-name].railway.app"