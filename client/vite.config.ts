import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Use different server URLs based on environment
  const getServerUrl = () => {
    if (mode === 'development') {
      return env.VITE_SERVER_URL || "http://localhost:8000"
    }
    return env.VITE_SERVER_URL || "https://2-m.vercel.app"
  }

  return {
    plugins: [react()],
    define: {
      __SERVER_URL__: JSON.stringify(getServerUrl())
    },
    server: {
      port: 5173,
      host: true, // Allow external connections
      cors: true,
      // Add proxy for API calls in development
      proxy: mode === 'development' ? {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      } : undefined
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
          }
        }
      }
    }
  }
})