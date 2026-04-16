import { defineConfig } from 'vite';

export default defineConfig({
  base: '/kings-evolution-island/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 3000,
    open: true,
  },
});
