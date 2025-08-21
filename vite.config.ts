import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';
import { readFileSync } from 'fs'
import { resolve } from 'path'

// 读取package.json获取版本号
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const version = packageJson.version
const buildTime = new Date().toISOString()

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(buildTime),
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  plugins: [
    react(),
    tsconfigPaths()
  ],
})
