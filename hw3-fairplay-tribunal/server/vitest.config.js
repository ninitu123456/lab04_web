import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

// Chỉ chuyển MONGODB_URI_TEST (nếu có trong .env / biến môi trường) vào test.
// Không có → test dùng mongodb-memory-server. KHÔNG bao giờ dùng MONGODB_URI (DB thật) cho test.
const { MONGODB_URI_TEST } = { ...loadEnv('test', process.cwd(), ''), ...process.env };

export default defineConfig({
  test: {
    environment: 'node',
    env: MONGODB_URI_TEST ? { MONGODB_URI_TEST } : {},
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
