import { defineConfig } from 'vite';

// base './' è necessario perché Capacitor carica l'app da file:// sul dispositivo
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600
  },
  server: {
    host: true,
    port: 5173
  }
});
