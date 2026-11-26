import { Router } from 'express';
import mongoose from 'mongoose';
import { PLAYER_IDS, isValid, normalizeAppeal, validateAppeal } from '../../../shared/appealRules.js';
import { Appeal } from '../models/Appeal.js';
import { Dossier, slaDeadlineOf } from '../models/Dossier.js';

export const appealsRouter = Router();

/**
 * POST /api/appeals
 * - Chạy CHÍNH validateAppeal() mà client dùng → 400 { errors: { field: message } } (parity).
 * - Hồ sơ chưa có trong DB → 404; quá hạn SLA → 409; hợp lệ → 201 bản ghi.
 */
appealsRouter.post('/appeals', async (req, res) => {
  try {
    const errors = validateAppeal(req.body);
    if (!isValid(errors)) {
      res.status(400).json({ errors });
      return;
    }
    const data = normalizeAppeal(req.body);

    const dossier = await Dossier.findOne({ playerId: data.playerId }).select('verdictAt appealWindowHours').lean();
    if (!dossier) {
      res.status(404).json({ error: 'dossier not found' });
      return;
    }
    const slaDeadline = slaDeadlineOf(dossier);
    if (Date.now() > slaDeadline.getTime()) {
      res.status(409).json({ error: 'Đã hết hạn kháng cáo (SLA).', slaDeadline: slaDeadline.toISOString() });
      return;
    }

    const appeal = await Appeal.create(data);
    res.status(201).json(appeal.toJSON());
  } catch (err) {
    // Lưới an toàn: nếu schema chặt hơn rule chung → vẫn trả 400 cùng shape { errors }.
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.fromEntries(Object.entries(err.errors).map(([field, e]) => [field, e.message]));
      res.status(400).json({ errors });
      return;
    }
    throw err; // lỗi hệ thống → error handler tập trung (500)
  }
});

/** GET /api/appeals?playerId= — kháng cáo của một hồ sơ, mới nhất trước (ẩn email người gửi). */
appealsRouter.get('/appeals', async (req, res) => {
  const playerId = typeof req.query.playerId === 'string' ? req.query.playerId.trim().toLowerCase() : '';
  if (!PLAYER_IDS.includes(playerId)) {
    res.status(400).json({ error: `playerId query must be one of ${PLAYER_IDS.join(', ')}` });
    return;
  }
  const appeals = await Appeal.find({ playerId }).select('-email').sort({ createdAt: -1, _id: -1 }).lean();
  res.json(appeals);
});
