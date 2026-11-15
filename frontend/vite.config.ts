import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load non-VITE_ vars too. API_KEY is read here in Node only and is never
  // exposed to the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.BACKEND_URL ?? 'http://localhost:3000',
          changeOrigin: true,
          // The backend scopes the refresh cookie to /auth/refresh; the browser
          // sees the API under /api, so rewrite the cookie path to match.
          cookiePathRewrite: { '/auth/refresh': '/api/auth/refresh' },
          headers: env.API_KEY ? { 'x-api-key': env.API_KEY } : undefined,
        },
        '/uploads': {
          target: env.BACKEND_URL ?? 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
