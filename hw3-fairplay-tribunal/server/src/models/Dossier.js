import mongoose from 'mongoose';
import { PLAYER_IDS } from '../../../shared/appealRules.js';

/**
 * DOSSIER CONTRACT — hồ sơ kỷ luật (DỮ LIỆU GIẢ LẬP phục vụ bài tập).
 * @typedef {Object} Evidence
 * @property {'replay' | 'log' | 'report' | 'screenshot'} kind
 * @property {string} label
 * @property {string} ref              Mã tham chiếu nội bộ (không phải URL ngoài)
 *
 * @typedef {Object} Offense
 * @property {string} code
 * @property {string} title
 * @property {number} severity         1–5
 * @property {number} penaltyMatches   Số trận bị cấm thi đấu
 * @property {Evidence[]} evidence
 *
 * @typedef {Object} DossierDoc
 * @property {string} playerId         slug: 'himass' | 'tanvuu'
 * @property {string} displayName
 * @property {string} team
 * @property {string} role
 * @property {string} summary
 * @property {string} avatar
 * @property {Offense[]} offenses
 * @property {Date} verdictAt          Thời điểm ra phán quyết
 * @property {number} appealWindowHours  SLA kháng cáo tính từ verdictAt
 */
const evidenceSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['replay', 'log', 'report', 'screenshot'], required: true },
    label: { type: String, required: true, trim: true },
    ref: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const offenseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    severity: { type: Number, required: true, min: 1, max: 5 },
    penaltyMatches: { type: Number, required: true, min: 0 },
    evidence: { type: [evidenceSchema], default: [] },
  },
  { _id: false },
);

const dossierSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, enum: PLAYER_IDS, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    team: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    summary: { type: String, default: '', trim: true },
    avatar: { type: String, default: '', trim: true },
    offenses: { type: [offenseSchema], default: [] },
    verdictAt: { type: Date, required: true },
    appealWindowHours: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

export const Dossier = mongoose.models.Dossier || mongoose.model('Dossier', dossierSchema);

/**
 * slaDeadline = verdictAt + appealWindowHours.
 * @param {{ verdictAt: Date | string, appealWindowHours: number }} dossier
 * @returns {Date}
 */
export function slaDeadlineOf(dossier) {
  return new Date(new Date(dossier.verdictAt).getTime() + dossier.appealWindowHours * 3_600_000);
}

/** Bản ghi lean → DTO trả cho client (bỏ _id/__v, kèm slaDeadline ISO). */
export function toDossierDto(dossier) {
  const { _id, __v, ...rest } = dossier;
  return { ...rest, slaDeadline: slaDeadlineOf(dossier).toISOString() };
}
