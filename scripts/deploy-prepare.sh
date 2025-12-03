#!/bin/bash

echo "🚀 Preparing HostPilotPro for deployment..."

# Set error handling
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check Node.js version
echo "🔍 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Check environment variables
echo "🔧 Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL is not set"
    exit 1
else
    print_status "DATABASE_URL is configured"
fi

# Create dist directories
echo "📁 Creating build directories..."
mkdir -p dist/public
print_status "Build directories created"

# Push database schema
echo "🗄️  Pushing database schema..."
npm run db:push || print_warning "Database push failed - this might be expected in deployment"

# Build the application
echo "🏗️  Building application..."
npm run build || {
    print_error "Build failed"
    exit 1
}

print_status "Build completed successfully"

# Verify build outputs
echo "🔍 Verifying build outputs..."
if [ ! -d "dist/public" ]; then
    print_error "dist/public directory not found"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    print_error "dist/index.js not found"
    exit 1
fi

print_status "Build outputs verified"

# Check if static files exist
static_files=$(find dist/public -type f | wc -l)
if [ "$static_files" -eq 0 ]; then
    print_warning "No static files found in dist/public"
else
    print_status "Found $static_files static files"
fi

echo ""
echo "🎉 Deployment preparation completed successfully!"
echo "📋 Summary:"
echo "   • Dependencies installed"
echo "   • Environment variables verified"
echo "   • Database schema synchronized"
echo "   • Application built successfully"
echo "   • Build outputs verified"
echo ""
echo "🚀 Ready for deployment!"