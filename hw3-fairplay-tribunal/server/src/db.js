import mongoose from 'mongoose';

/**
 * Mongoose 8: chỉ cần URI — các flag useNewUrlParser / useUnifiedTopology đã bị gỡ (slide 32).
 * @param {string} uri
 */
export async function connectDb(uri) {
  mongoose.set('strictQuery', true);
  // Báo lỗi sau 5s nếu MongoDB chưa chạy (mặc định 30s).
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`[db] connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDb() {
  await mongoose.disconnect();
}