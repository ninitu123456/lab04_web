/**
 * Đọc & kiểm tra biến môi trường MỘT lần khi khởi động.
 * Không bao giờ hardcode connection string trong source (slide 5, slide 29 — AI hallucination #03).
 * @param {NodeJS.ProcessEnv} env
 */
export function loadConfig(env = process.env) {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI missing — copy .env.example thành .env và điền giá trị.');
  }
  return {
    mongodbUri: env.MONGODB_URI,
    port: Number(env.PORT) || 4000,
    clientOrigin: env.CLIENT_ORIGIN || 'http://localhost:5173',
  };
}