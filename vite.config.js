import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3430,
    open: true,
  },
  build: {
    // Production build optimizations
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Generate sourcemaps for debugging production issues
    sourcemap: true,
    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          react: ['react', 'react-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          icons: ['lucide-react'],
        },
      },
    },
    // Warn on chunks larger than 500kb
    chunkSizeWarningLimit: 500,
  },
});
