import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/api/courses': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/categories': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/instructor': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})