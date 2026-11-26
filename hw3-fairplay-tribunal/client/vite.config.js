/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const sharedDir = fileURLToPath(new URL('../shared', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // import { validateAppeal } from '@shared/appealRules.js' — cùng file với server (validation parity)
    alias: { '@shared': sharedDir },
  },
  server: {
    port: 5174,
    strictPort: true,
    // Cổng khác HW2 (5173/4000) để chạy song song không đụng nhau.
    proxy: { '/api': 'http://localhost:4001' },
    // Cho phép dev server phục vụ file ngoài thư mục client (../shared).
    fs: { allow: ['.', sharedDir] },
  },
  preview: { port: 4174, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
    restoreMocks: true,
  },
})
