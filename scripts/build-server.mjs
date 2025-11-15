import * as esbuild from 'esbuild';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  await esbuild.build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    packages: 'external',
    define: {
      'import.meta.dirname': '__dirname',
    },
    banner: {
      js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
      `.trim(),
    },
  });

  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
