import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build (studio convention): everything inlined into one HTML
// that runs from file:// with no server. Output: dist-single/index.html,
// copied to plastic-platoon.html at the repo root by `npm run build:single`.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    target: 'es2022',
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
});
