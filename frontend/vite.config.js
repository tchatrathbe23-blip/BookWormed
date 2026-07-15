import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendUrl =
  process.env.VITE_API_URL || 'https://bookwormed-backend.onrender.com'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
