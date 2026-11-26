import mongoose from 'mongoose';
import { APPEAL_REASONS, LIMITS, PLAYER_IDS } from '../../../shared/appealRules.js';

/**
 * APPEAL — các field của AppealInput TRỪ confirmEmail / acceptTerms (chỉ dùng để validate).
 * Schema dùng chung hằng số với shared/appealRules.js → không lệch contract.
 */
const appealSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, enum: PLAYER_IDS, index: true },
    appellantName: {
      type: String,
      required: true,
      trim: true,
      minlength: LIMITS.appellantName.min,
      maxlength: LIMITS.appellantName.max,
    },
    email: { type: String, required: true, trim: true, lowercase: true },
    reason: { type: String, required: true, enum: APPEAL_REASONS.map((r) => r.value) },
    statement: {
      type: String,
      required: true,
      trim: true,
      minlength: LIMITS.statement.min,
      maxlength: LIMITS.statement.max,
    },
    evidenceUrl: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true },
);

export const Appeal = mongoose.models.Appeal || mongoose.model('Appeal', appealSchema);
