import * as esbuild from 'esbuild';

try {
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    packages: 'external',
  });

  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
