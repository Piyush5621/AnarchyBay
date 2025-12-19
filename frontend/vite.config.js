import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Allow ngrok hosts dynamically - matches any ngrok subdomain
    allowedHosts: [
      // Allow localhost for local development
      'localhost',
      '127.0.0.1',
      // Allow any ngrok host (matches *.ngrok-free.app and *.ngrok.app)
      /\.ngrok(?:-free)?\.app$/,
      // Allow specific ngrok host if set via environment variable
      ...(process.env.VITE_NGROK_HOST ? [process.env.VITE_NGROK_HOST] : []),
    ],
    // Configure HMR to use secure websocket when using ngrok
    hmr: process.env.VITE_NGROK_HOST ? {
      protocol: 'wss',
      host: process.env.VITE_NGROK_HOST,
      port: 443,
    } : undefined,
  },
})
