// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: '/https://huuthong1976.github.io/frontend/',
  build: { outDir: 'dist' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  },
  optimizeDeps: { entries: ['index.html'] }
});
