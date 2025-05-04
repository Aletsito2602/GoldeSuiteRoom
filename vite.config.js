import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true
    },
    server: {
      port: 3000,
      open: true
    },
    define: {
      'process.env': env
    }
  }
})
