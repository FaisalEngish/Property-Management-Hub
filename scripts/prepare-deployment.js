#!/usr/bin/env node

/**
 * Deployment Preparation Script
 * Fixes the static file path mismatch for successful deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Preparing deployment...');

// Create server/public directory if it doesn't exist
const serverPublicPath = path.join(projectRoot, 'server', 'public');
const distPublicPath = path.join(projectRoot, 'dist', 'public');

// Ensure server/public directory exists
if (!fs.existsSync(serverPublicPath)) {
  fs.mkdirSync(serverPublicPath, { recursive: true });
  console.log('✅ Created server/public directory');
}

// Check if dist/public exists (from build)
if (fs.existsSync(distPublicPath)) {
  console.log('✅ Found dist/public from build');
  
  // Copy files from dist/public to server/public
  try {
    copyDir(distPublicPath, serverPublicPath);
    console.log('✅ Copied build files to server/public');
  } catch (error) {
    console.error('❌ Error copying files:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠️  dist/public not found - build may not have completed');
}

// Create basic HTML fallback if needed
const indexHtmlPath = path.join(serverPublicPath, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HostPilotPro</title>
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
            <div style="text-align: center;">
                <h1>HostPilotPro</h1>
                <p>Application is starting...</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  
  fs.writeFileSync(indexHtmlPath, fallbackHtml.trim());
  console.log('✅ Created fallback index.html');
}

console.log('🎉 Deployment preparation complete!');

/**
 * Recursively copy directory contents
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}