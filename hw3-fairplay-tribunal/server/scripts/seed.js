/**
 * Seed 2 hồ sơ giả lập: `npm run seed` (đọc MONGODB_URI từ .env qua --env-file).
 * Idempotent: xoá dossiers cũ rồi insertMany lại (verdictAt tính theo thời điểm seed).
 * Kháng cáo (appeals) được GIỮ NGUYÊN — chúng tham chiếu playerId (slug ổn định), không phải _id.
 */
import { loadConfig } from '../src/config.js';
import { connectDb, disconnectDb } from '../src/db.js';
import { Dossier, slaDeadlineOf } from '../src/models/Dossier.js';
import { buildSeedDossiers } from './dossiers.data.js';

const config = loadConfig();
await connectDb(config.mongodbUri);
try {
  const { deletedCount } = await Dossier.deleteMany({});
  const inserted = await Dossier.insertMany(buildSeedDossiers());
  await Dossier.syncIndexes(); // đảm bảo unique index của playerId tồn tại
  console.log(`[seed] removed ${deletedCount} dossiers → inserted ${inserted.length}`);
  for (const d of inserted) console.log(`  - ${d.playerId}: SLA deadline ${slaDeadlineOf(d).toISOString()}`);
} finally {
  await disconnectDb();
}
