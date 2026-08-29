import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build runs from GitHub Pages subpaths unchanged.
  base: './',
  build: { target: 'es2022' },
  server: { host: '127.0.0.1', port: 5173 },
});
