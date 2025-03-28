import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext', // Ensure latest JS features are supported
    cssMinify: true,
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
