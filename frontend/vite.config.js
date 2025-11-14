import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
const sentryEnabled = process.env.SENTRY_ORG && process.env.SENTRY_PROJECT && process.env.SENTRY_AUTH_TOKEN

export default defineConfig({
  base: './',
  plugins: [
    react(),
    ...(sentryEnabled
      ? [
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
            include: ['./dist'],
            setCommits: {
              auto: true
            }
          })
        ]
      : [])
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    sourcemap: true
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
