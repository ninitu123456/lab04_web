import mongoose from 'mongoose';

/**
 * PROFILE CONTRACT — một thẻ trong deck (nhân vật hư cấu).
 * @typedef {Object} ProfileDoc
 * @property {string} name
 * @property {number} age          18–99
 * @property {string} bio
 * @property {string[]} interests
 * @property {string} avatar       Đường dẫn/URL ảnh SVG
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    age: { type: Number, required: true, min: 18, max: 99 },
    bio: { type: String, default: '', trim: true, maxlength: 280 },
    interests: { type: [String], default: [] },
    avatar: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
