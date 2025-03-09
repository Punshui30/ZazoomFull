import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Ensure external modules like `winston` are not bundled
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['winston'], // This prevents Vite from bundling Winston
    },
  },
});
