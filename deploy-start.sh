#!/bin/bash
set -e

echo "🔨 Building frontend with Vite..."
vite build

echo "🔨 Building backend server..."
node scripts/build-server.mjs

echo "🚀 Starting production server..."
exec node dist/index.js
