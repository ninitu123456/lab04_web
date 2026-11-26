import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    // Gọi /api/* từ client → chuyển tiếp sang Express (cổng 4000), không cần hardcode URL.
    proxy: { '/api': 'http://localhost:4000' },
  },
})