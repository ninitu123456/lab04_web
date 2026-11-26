import cors from 'cors';
import express from 'express';
import { profilesRouter } from './routes/profiles.js';
import { swipesRouter } from './routes/swipes.js';

/**
 * Tạo Express app (KHÔNG listen, KHÔNG kết nối DB) → test được bằng supertest.
 * @param {{ clientOrigin: string }} options
 */
export function createApp({ clientOrigin }) {
  const app = express();

  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api', profilesRouter);
  app.use('/api', swipesRouter);

  // 404 cho mọi route /api không tồn tại
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler tập trung — Express 5 tự chuyển lỗi từ async handler vào đây.
  app.use((err, _req, res, _next) => {
    // JSON body hỏng (express.json) → 400, không log như lỗi hệ thống.
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
    console.error(err);
    res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' });
  });

  return app;
}