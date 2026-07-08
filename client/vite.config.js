import { defineConfig } from 'vite'
import react            from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    hmr: {
      protocol: 'ws',
      host:     'localhost',
      port:     5173
    },
    proxy: {
      // Only used in development
      '/api': {
        target:       'http://localhost:5000',
        changeOrigin: true,
        secure:       false,
      }
    }
  },
  build: {
    outDir:    'dist',
    sourcemap: false,
    // Reduce bundle size warnings
    chunkSizeWarningLimit: 1600
  }
})