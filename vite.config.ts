import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: '/DEDALUS2/',  
  plugins: [react()],
  server: { port: 5173, open: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./app/src', import.meta.url))
    }
  }
})
