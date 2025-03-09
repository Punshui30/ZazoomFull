import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      external: ['winston'], // Ensure winston is not bundled
    },
    outDir: 'dist',
    sourcemap: true, // Helps debugging if needed
  },
  resolve: {
    alias: {
      '@': '/src', // Allows `@/components/...` imports instead of relative paths
    },
  },
});
