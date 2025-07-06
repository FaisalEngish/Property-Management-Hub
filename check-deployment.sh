#!/bin/bash
echo "🔍 Checking deployment readiness..."

# Check if build directory exists
if [ ! -d "dist" ]; then
  echo "❌ Build directory not found. Run 'npm run build:full' first."
  exit 1
fi

# Check if static files exist
if [ ! -f "dist/public/index.html" ]; then
  echo "❌ Frontend build not found. Check build process."
  exit 1
fi

# Check if server bundle exists
if [ ! -f "dist/index.js" ]; then
  echo "❌ Server bundle not found. Check server build process."
  exit 1
fi

echo "✅ Deployment files ready!"
echo "📋 To deploy:"
echo "1. Ensure environment variables are set"
echo "2. Run 'npm run start' to test production build"
echo "3. Use Replit deploy button"

# Test server start
echo "🚀 Testing server start..."
timeout 10s npm run start || echo "⚠️  Server test failed - check logs"
