import * as esbuild from 'esbuild';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

try {
  // Check if vite is installed, if not install build dependencies
  // This handles production environments like Render where devDependencies aren't installed
  const viteExists = fs.existsSync(path.join('node_modules', 'vite'));
  const reactPluginExists = fs.existsSync(path.join('node_modules', '@vitejs', 'plugin-react'));
  
  if (!viteExists || !reactPluginExists) {
    console.log('📦 Installing build dependencies (vite, plugins)...');
    // Use --production=false to ensure packages install even in production NODE_ENV
    // Install all Vite-related dependencies needed for the build
    execSync('npm install vite @vitejs/plugin-react @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer --production=false --no-save', { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' }
    });
  }

  // Step 1: Build the frontend with Vite
  console.log('📦 Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');

  // Step 2: Build the server with esbuild
  console.log('📦 Building server with esbuild...');
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    packages: 'external',
    // Exclude vite-related files from the bundle - they should NEVER be in production
    external: ['./vite', './vite.js', './vite.ts', '../vite.config', '../vite.config.ts'],
    plugins: [{
      name: 'exclude-vite',
      setup(build) {
        // Intercept any import of vite.ts or vite.config.ts and make it a no-op
        build.onResolve({ filter: /vite\.ts$|vite\.config\.ts$|vite\.config$/ }, args => {
          return { path: args.path, external: true };
        });
      }
    }]
  });

  console.log('✅ Server build completed successfully');
  console.log('🚀 Full build completed! Run "npm start" to start the production server.');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
