import mongoose from 'mongoose';

/** Ba hướng vuốt hợp lệ — dùng chung cho schema và validate request. */
export const SWIPE_DIRECTIONS = Object.freeze(['LIKE', 'NOPE', 'SUPER']);

/**
 * SWIPE CONTRACT — một lần vuốt của một phiên (session) ẩn danh.
 * @typedef {Object} SwipeDoc
 * @property {string} sessionId
 * @property {import('mongoose').Types.ObjectId} profileId
 * @property {'LIKE' | 'NOPE' | 'SUPER'} direction
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const swipeSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true, trim: true, maxlength: 100 },
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    direction: { type: String, required: true, enum: SWIPE_DIRECTIONS },
  },
  { timestamps: true },
);

export const Swipe = mongoose.models.Swipe || mongoose.model('Swipe', swipeSchema);
