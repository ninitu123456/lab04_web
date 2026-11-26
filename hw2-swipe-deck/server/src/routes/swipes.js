import { Router } from 'express';
import mongoose from 'mongoose';
import { Profile } from '../models/Profile.js';
import { SWIPE_DIRECTIONS, Swipe } from '../models/Swipe.js';

export const swipesRouter = Router();

const { isValidObjectId } = mongoose;

/** Lỗi 400 có thông điệp an toàn để trả cho client. */
class BadRequest extends Error {
  status = 400;
}

/**
 * Kiểm tra payload POST /api/swipe. Trả về dữ liệu đã chuẩn hoá hoặc throw BadRequest.
 * @param {unknown} body
 */
function parseSwipeBody(body) {
  const { sessionId, profileId, direction } = /** @type {Record<string, unknown>} */ (body ?? {});
  if (typeof sessionId !== 'string' || !sessionId.trim()) throw new BadRequest('sessionId is required');
  if (typeof profileId !== 'string' || !profileId) throw new BadRequest('profileId is required');
  if (!isValidObjectId(profileId)) throw new BadRequest('profileId is not a valid ObjectId');
  if (!SWIPE_DIRECTIONS.includes(/** @type {string} */ (direction))) {
    throw new BadRequest(`direction must be one of ${SWIPE_DIRECTIONS.join(', ')}`);
  }
  return { sessionId: sessionId.trim(), profileId, direction };
}

/** POST /api/swipe — ghi một lần vuốt. 201 + document; 400 khi dữ liệu không hợp lệ. */
swipesRouter.post('/swipe', async (req, res) => {
  try {
    const data = parseSwipeBody(req.body);
    const exists = await Profile.exists({ _id: data.profileId });
    if (!exists) throw new BadRequest('profile not found');
    const swipe = await Swipe.create(data);
    res.status(201).json(swipe.toJSON());
  } catch (err) {
    if (err instanceof BadRequest || err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err; // lỗi hệ thống (DB down, ...) → error handler tập trung (500)
  }
});

/** GET /api/swipes?sessionId=… — lịch sử của phiên, cũ → mới (client dựng lại undo stack). */
swipesRouter.get('/swipes', async (req, res) => {
  const { sessionId } = req.query;
  if (typeof sessionId !== 'string' || !sessionId.trim()) {
    res.status(400).json({ error: 'sessionId query is required' });
    return;
  }
  const swipes = await Swipe.find({ sessionId: sessionId.trim() }).sort({ createdAt: 1, _id: 1 }).lean();
  res.json(swipes);
});

/** DELETE /api/swipe/:id — xoá một lần vuốt (undo). 204; 404 nếu id sai hoặc không tồn tại. */
swipesRouter.delete('/swipe/:id', async (req, res) => {
  const { id } = req.params;
  const deleted = isValidObjectId(id) ? await Swipe.findByIdAndDelete(id).lean() : null;
  if (!deleted) {
    res.status(404).json({ error: 'swipe not found' });
    return;
  }
  res.status(204).end();
});
