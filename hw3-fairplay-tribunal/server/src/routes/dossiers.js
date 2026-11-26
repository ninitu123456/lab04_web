import { Router } from 'express';
import { Dossier, toDossierDto } from '../models/Dossier.js';

export const dossiersRouter = Router();

/** GET /api/dossiers — danh sách tóm tắt (không kèm chi tiết vi phạm/bằng chứng). */
dossiersRouter.get('/dossiers', async (_req, res) => {
  const dossiers = await Dossier.find()
    .select('playerId displayName team role summary avatar verdictAt appealWindowHours offenses.code')
    .sort({ playerId: 1 })
    .lean();
  res.json(dossiers.map(({ offenses, ...d }) => ({ ...toDossierDto(d), offenseCount: offenses.length })));
});

/** GET /api/dossiers/:playerId — chi tiết; 404 nếu không có. */
dossiersRouter.get('/dossiers/:playerId', async (req, res) => {
  const dossier = await Dossier.findOne({ playerId: String(req.params.playerId).toLowerCase() }).lean();
  if (!dossier) {
    res.status(404).json({ error: 'dossier not found' });
    return;
  }
  res.json(toDossierDto(dossier));
});

/** GET /api/time — đồng hồ server (epoch ms) để client tính offset cho SLA countdown. */
dossiersRouter.get('/time', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ now: Date.now() });
});
