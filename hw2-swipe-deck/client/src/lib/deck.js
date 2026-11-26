/**
 * DECK CONTRACT — hàm thuần, không phụ thuộc React (test đơn vị dễ dàng).
 *
 * @typedef {'LIKE' | 'NOPE' | 'SUPER'} Direction
 *
 * @typedef {Object} Profile           (khớp GET /api/profiles)
 * @property {string} _id
 * @property {string} name
 * @property {number} age
 * @property {string} bio
 * @property {string[]} interests
 * @property {string} avatar
 */

/** @type {Readonly<{ LIKE: 'LIKE', NOPE: 'NOPE', SUPER: 'SUPER' }>} */
export const DIRECTIONS = Object.freeze({ LIKE: 'LIKE', NOPE: 'NOPE', SUPER: 'SUPER' });

/** Nhãn tiếng Việt cho thông báo / nút. */
export const DIRECTION_LABELS = Object.freeze({
  LIKE: 'Thích',
  NOPE: 'Bỏ qua',
  SUPER: 'Siêu thích',
});

/** Ngưỡng kéo (px) để tính là một lần vuốt. */
export const SWIPE_THRESHOLD = 50;

const KEY_TO_DIRECTION = Object.freeze({
  ArrowLeft: DIRECTIONS.NOPE,
  ArrowRight: DIRECTIONS.LIKE,
  ArrowUp: DIRECTIONS.SUPER,
});

/**
 * Phím → hướng vuốt. ArrowLeft = NOPE, ArrowRight = LIKE, ArrowUp = SUPER; phím khác → null.
 * @param {string} key  KeyboardEvent.key
 * @returns {Direction | null}
 */
export function directionFromKey(key) {
  return Object.hasOwn(KEY_TO_DIRECTION, key) ? KEY_TO_DIRECTION[key] : null;
}

/**
 * Độ dời con trỏ (pointerup − pointerdown) → hướng vuốt.
 * - Kéo lên (dy < −threshold) và trục dọc trội hơn → SUPER
 * - dx > threshold → LIKE; dx < −threshold → NOPE
 * - Còn lại (chạm nhẹ / kéo ngắn) → null
 * @param {number} dx
 * @param {number} dy
 * @param {number} [threshold]
 * @returns {Direction | null}
 */
export function directionFromDelta(dx, dy, threshold = SWIPE_THRESHOLD) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (dy < -threshold && Math.abs(dy) >= Math.abs(dx)) return DIRECTIONS.SUPER;
  if (dx > threshold) return DIRECTIONS.LIKE;
  if (dx < -threshold) return DIRECTIONS.NOPE;
  return null;
}
