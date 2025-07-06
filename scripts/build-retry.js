#!/usr/bin/env node

/**
 * Build Retry Script
 * Handles build timeouts by implementing retry logic and memory optimization
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 300000; // 5 minutes

console.log('🔨 Starting optimized build process...');

async function runBuild(attempt = 1) {
  return new Promise((resolve, reject) => {
    console.log(`Attempt ${attempt}/${MAX_RETRIES}`);
    
    // Clean previous build artifacts
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
      console.log('🧹 Cleaned previous build');
    }

    // Start build process with optimized settings
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
        VITE_BUILD_TIMEOUT: '300000'
      }
    });

    const timer = setTimeout(() => {
      console.log(`⏰ Build timeout after ${TIMEOUT_MS}ms on attempt ${attempt}`);
      buildProcess.kill('SIGTERM');
      
      if (attempt < MAX_RETRIES) {
        console.log(`🔄 Retrying build (${attempt + 1}/${MAX_RETRIES})...`);
        setTimeout(() => {
          runBuild(attempt + 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(new Error('Build failed after maximum retries'));
      }
    }, TIMEOUT_MS);

    buildProcess.on('exit', (code) => {
      clearTimeout(timer);
      
      if (code === 0) {
        console.log('✅ Build completed successfully');
        
        // Run deployment preparation
        const prepareProcess = spawn('node', ['scripts/prepare-deployment.js'], {
          stdio: 'inherit'
        });
        
        prepareProcess.on('exit', (prepareCode) => {
          if (prepareCode === 0) {
            console.log('🎉 Build and deployment preparation complete!');
            resolve();
          } else {
            reject(new Error('Deployment preparation failed'));
          }
        });
      } else if (attempt < MAX_RETRIES) {
        console.log(`❌ Build failed with code ${code}, retrying...`);
        setTimeout(() => {
          runBuild(attempt + 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(new Error(`Build failed with code ${code} after ${MAX_RETRIES} attempts`));
      }
    });

    buildProcess.on('error', (error) => {
      clearTimeout(timer);
      console.error('❌ Build process error:', error.message);
      
      if (attempt < MAX_RETRIES) {
        setTimeout(() => {
          runBuild(attempt + 1).then(resolve).catch(reject);
        }, 2000);
      } else {
        reject(error);
      }
    });
  });
}

runBuild()
  .then(() => {
    console.log('🚀 Ready for deployment!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Build process failed:', error.message);
    process.exit(1);
  });