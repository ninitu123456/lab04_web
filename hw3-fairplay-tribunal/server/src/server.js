import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { connectDb, disconnectDb } from './db.js';

const config = loadConfig();
await connectDb(config.mongodbUri);

const app = createApp(config);
const server = app.listen(config.port, () => {
  console.log(`[api] listening on http://localhost:${config.port}`);
});

// Tắt êm: đóng HTTP server rồi đóng kết nối DB.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  });
}