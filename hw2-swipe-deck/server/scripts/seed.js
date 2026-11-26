/**
 * Seed deck: `npm run seed` (đọc MONGODB_URI từ .env qua --env-file).
 * Idempotent: xoá profiles cũ rồi insertMany lại. Swipes cũ cũng bị xoá vì
 * chúng tham chiếu _id của profiles cũ (tránh lịch sử mồ côi).
 */
import { loadConfig } from '../src/config.js';
import { connectDb, disconnectDb } from '../src/db.js';
import { Profile } from '../src/models/Profile.js';
import { Swipe } from '../src/models/Swipe.js';
import { SEED_PROFILES } from './profiles.data.js';

const config = loadConfig();
await connectDb(config.mongodbUri);
try {
  const { deletedCount: oldSwipes } = await Swipe.deleteMany({});
  const { deletedCount: oldProfiles } = await Profile.deleteMany({});
  // ordered: true + tạo tuần tự → _id tăng dần đúng thứ tự mảng (deck giữ thứ tự ổn định).
  const inserted = await Profile.insertMany(SEED_PROFILES, { ordered: true });
  console.log(`[seed] removed ${oldProfiles} profiles, ${oldSwipes} swipes → inserted ${inserted.length} profiles`);
} finally {
  await disconnectDb();
}
