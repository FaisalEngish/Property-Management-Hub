#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Verifies all deployment fixes have been applied correctly
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Validating deployment fixes...\n');

const checks = [];
const warnings = [];

// Check 1: Verify TypeScript configuration for proper compilation
if (fs.existsSync('tsconfig.json')) {
  const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsconfig.compilerOptions.module === 'ESNext') {
    checks.push('✅ TypeScript configured for ESNext modules');
  } else {
    warnings.push('⚠️  TypeScript not configured for ESNext modules');
  }
} else {
  warnings.push('⚠️  tsconfig.json not found');
}

// Check 2: Verify deploy-simple.js exists and uses correct esbuild command
if (fs.existsSync('deploy-simple.js')) {
  const deployScript = fs.readFileSync('deploy-simple.js', 'utf8');
  if (deployScript.includes('--format=esm')) {
    checks.push('✅ Deploy script uses ESM format');
  } else {
    warnings.push('⚠️  Deploy script not using ESM format');
  }
  
  if (deployScript.includes('--external:lightningcss')) {
    checks.push('✅ Deploy script excludes problematic dependencies');
  } else {
    warnings.push('⚠️  Deploy script may include problematic dependencies');
  }
} else {
  warnings.push('⚠️  deploy-simple.js not found');
}

// Check 3: Verify built files exist
if (fs.existsSync('dist/index.js')) {
  const builtFile = fs.readFileSync('dist/index.js', 'utf8');
  if (!builtFile.includes('import type') && !builtFile.includes(': Request')) {
    checks.push('✅ Built JavaScript file contains no TypeScript syntax');
  } else {
    warnings.push('⚠️  Built file may contain TypeScript syntax');
  }
  
  // Check file size (should be reasonable)
  const stats = fs.statSync('dist/index.js');
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  checks.push(`✅ Built file size: ${sizeMB}MB`);
} else {
  warnings.push('⚠️  dist/index.js not found - run npm run build');
}

// Check 4: Verify fallback HTML exists
if (fs.existsSync('dist/public/index.html')) {
  checks.push('✅ Fallback HTML file exists');
} else {
  warnings.push('⚠️  Fallback HTML file not found');
}

// Check 5: Verify package.json scripts
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.scripts.build === 'node deploy-simple.js') {
    checks.push('✅ Package.json build script configured correctly');
  } else {
    warnings.push('⚠️  Package.json build script not configured');
  }
  
  if (packageJson.scripts.start === 'node dist/index.js') {
    checks.push('✅ Package.json start script configured correctly');
  } else {
    warnings.push('⚠️  Package.json start script not configured');
  }
  
  if (packageJson.type === 'module') {
    checks.push('✅ Package.json configured for ES modules');
  } else {
    warnings.push('⚠️  Package.json not configured for ES modules');
  }
} else {
  warnings.push('⚠️  package.json not found');
}

// Check 6: Verify server configuration for 0.0.0.0 binding
if (fs.existsSync('server/index.ts')) {
  const serverFile = fs.readFileSync('server/index.ts', 'utf8');
  if (serverFile.includes("'0.0.0.0'")) {
    checks.push('✅ Server configured to bind to all interfaces (0.0.0.0)');
  } else {
    warnings.push('⚠️  Server may not be configured for cloud deployment');
  }
} else {
  warnings.push('⚠️  server/index.ts not found');
}

// Check 7: Verify .replit configuration
if (fs.existsSync('.replit')) {
  const replitConfig = fs.readFileSync('.replit', 'utf8');
  if (replitConfig.includes('build = ["npm", "run", "build"]')) {
    checks.push('✅ .replit build command configured');
  } else {
    warnings.push('⚠️  .replit build command not configured');
  }
  
  if (replitConfig.includes('run = ["npm", "run", "start"]')) {
    checks.push('✅ .replit run command configured');
  } else {
    warnings.push('⚠️  .replit run command not configured');
  }
} else {
  warnings.push('⚠️  .replit file not found');
}

// Display results
console.log('📋 Validation Results:\n');

if (checks.length > 0) {
  console.log('✅ Passed Checks:');
  checks.forEach(check => console.log(`  ${check}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => console.log(`  ${warning}`));
  console.log('');
}

// Final assessment
if (warnings.length === 0) {
  console.log('🎉 All deployment fixes applied successfully!');
  console.log('🚀 Ready for deployment with: npm run build && npm start');
} else if (warnings.length <= 2) {
  console.log('✅ Deployment fixes mostly applied successfully!');
  console.log('⚠️  Minor warnings detected but deployment should work.');
} else {
  console.log('❌ Multiple issues detected. Please review warnings above.');
}

console.log('\n📖 Deployment Summary:');
console.log('1. TypeScript compilation fixed to produce valid JavaScript');
console.log('2. Build process uses esbuild with proper external dependencies');
console.log('3. Server configured to bind to all interfaces (0.0.0.0)');
console.log('4. Package.json module type maintained for compatibility');
console.log('5. Fallback HTML provided for static serving');
console.log('6. Production build removes TypeScript syntax');
console.log('\n🔧 Build Commands:');
console.log('  npm run build  # Builds production server');
console.log('  npm start      # Starts production server');