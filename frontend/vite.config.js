import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // 👈 Esto hace que las rutas sean relativas (funciona dentro de Docker)
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
    // CSRF token endpoint proxied to course-service
    '/api/csrf-token': {
      target: 'http://localhost:5003',
      changeOrigin: true
    },
    // course-service (Docker maps 5003 -> 3001)
    '/api/courses': {
      target: 'http://localhost:5003',
      changeOrigin: true
    },
    '/api/categories': {
      target: 'http://localhost:5003',
      changeOrigin: true
    },
    '/api/instructor': {
      target: 'http://localhost:5003',
      changeOrigin: true
    },
    '/api/enrollments': {
      target: 'http://localhost:5003',
      changeOrigin: true
    },
    '/api/evaluations': {
      target: 'http://localhost:5005',
      changeOrigin: true
    }
  }
}
}
)
