import { Router } from 'express';
import { Profile } from '../models/Profile.js';

export const profilesRouter = Router();

/** GET /api/profiles — toàn bộ deck, theo thứ tự tạo. `.lean()` trả object thuần (nhanh, không có document method). */
profilesRouter.get('/profiles', async (_req, res) => {
  const profiles = await Profile.find().sort({ createdAt: 1, _id: 1 }).lean();
  res.json(profiles);
});
