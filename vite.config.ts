import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        //target: 'https://localhost:7288',
        target: 'http://localhost:5252',
        changeOrigin: true,
        secure: false, // Self-signed SSL sertifikası için
      },
      '/chathub': {
        //target: 'https://localhost:7288',
        target: 'http://localhost:5252',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket desteği (SignalR)
      },
    },
  },
})
