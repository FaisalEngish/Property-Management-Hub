#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Verifies all deployment requirements are met
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

console.log('🔍 Validating deployment readiness...\n');

const checks = [
  {
    name: 'Production server exists',
    check: () => fs.existsSync('dist/index.js'),
    fix: 'Run: npm run build'
  },
  {
    name: 'Production package.json exists',
    check: () => fs.existsSync('dist/package.json'),
    fix: 'Run: npm run build'
  },
  {
    name: 'Fallback HTML exists',
    check: () => fs.existsSync('dist/public/index.html'),
    fix: 'Run: npm run build'
  },
  {
    name: 'Server uses CommonJS format',
    check: () => {
      if (!fs.existsSync('dist/index.js')) return false;
      const content = fs.readFileSync('dist/index.js', 'utf8');
      return content.includes('module.exports') && content.includes('require(');
    },
    fix: 'Rebuild with: npm run build'
  },
  {
    name: 'Server binds to correct host/port',
    check: () => {
      if (!fs.existsSync('dist/index.js')) return false;
      const content = fs.readFileSync('dist/index.js', 'utf8');
      return content.includes('0.0.0.0') && content.includes('process.env.PORT');
    },
    fix: 'Rebuild with: npm run build'
  },
  {
    name: 'Health check endpoint exists',
    check: () => {
      if (!fs.existsSync('dist/index.js')) return false;
      const content = fs.readFileSync('dist/index.js', 'utf8');
      return content.includes('/api/health');
    },
    fix: 'Rebuild with: npm run build'
  },
  {
    name: 'Graceful shutdown handling',
    check: () => {
      if (!fs.existsSync('dist/index.js')) return false;
      const content = fs.readFileSync('dist/index.js', 'utf8');
      return content.includes('SIGTERM') && content.includes('SIGINT');
    },
    fix: 'Rebuild with: npm run build'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  if (!passed) {
    console.log(`   Fix: ${fix}`);
    allPassed = false;
  }
});

console.log('\n📊 Additional Information:');

// Check file sizes
if (fs.existsSync('dist/index.js')) {
  const serverSize = fs.statSync('dist/index.js').size;
  console.log(`📦 Server bundle size: ${(serverSize / 1024).toFixed(1)} KB`);
}

if (fs.existsSync('dist/public/index.html')) {
  const htmlSize = fs.statSync('dist/public/index.html').size;
  console.log(`🌐 Fallback HTML size: ${(htmlSize / 1024).toFixed(1)} KB`);
}

// Test server startup (quick validation)
if (allPassed) {
  console.log('\n🧪 Testing server startup...');
  
  const testServer = spawn('node', ['dist/index.js'], {
    env: { ...process.env, PORT: '5002', NODE_ENV: 'production' },
    stdio: 'pipe'
  });

  let output = '';
  testServer.stdout.on('data', (data) => {
    output += data.toString();
  });

  testServer.stderr.on('data', (data) => {
    output += data.toString();
  });

  setTimeout(() => {
    testServer.kill('SIGTERM');
    
    if (output.includes('HostPilotPro server running')) {
      console.log('✅ Server startup test passed');
    } else {
      console.log('❌ Server startup test failed');
      console.log('Output:', output);
      allPassed = false;
    }

    // Final result
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 All deployment checks passed!');
      console.log('🚀 Ready to deploy with: npm start');
      console.log('\n📋 Deployment Commands:');
      console.log('  - Development: npm run dev');
      console.log('  - Build: npm run build');
      console.log('  - Production: npm start');
      console.log('  - Health Check: curl http://localhost:5000/api/health');
    } else {
      console.log('❌ Some deployment checks failed.');
      console.log('Please fix the issues above and run validation again.');
      process.exit(1);
    }
  }, 3000);
} else {
  console.log('\n' + '='.repeat(50));
  console.log('❌ Deployment validation failed.');
  console.log('Please fix the issues above and run validation again.');
  process.exit(1);
}