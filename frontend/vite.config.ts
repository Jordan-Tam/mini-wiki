import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      "/chat": {
        target: 'ws://localhost:3000', // Your backend WS server address
        ws: true, // Enable WebSocket proxying
        changeOrigin: true, // Needed for many backend servers
      },
    }
  }
})
