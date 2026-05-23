import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const base = process.env.NODE_ENV === 'production' ? '/arjs-intro/' : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
