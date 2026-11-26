import mongoose from 'mongoose';

/**
 * DB cho test API — KHÔNG đụng DB thật `hw3`.
 * - Mặc định: mongodb-memory-server (mongod tạm trong RAM).
 * - Fallback: nếu đặt MONGODB_URI_TEST (vd. mongodb://127.0.0.1:27017/hw3_test) thì dùng DB đó
 *   (cho máy không tải được binary mongod). DB test bị drop sau khi chạy xong.
 */
let memoryServer;

export async function startTestDb() {
  let uri = process.env.MONGODB_URI_TEST;
  if (!uri) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('hw3_test');
  }
  // Chốt an toàn: dropDatabase() ở cuối test → chỉ chấp nhận DB có tên kết thúc bằng _test.
  const dbName = new URL(uri).pathname.slice(1);
  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to run API tests against "${dbName}" — test DB name must end with _test`);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function clearTestDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
}

export async function stopTestDb() {
  if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await memoryServer?.stop();
}
