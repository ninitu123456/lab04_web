/**
 * ASYMMETRIC SCORE CONTRACT — tính THUẦN từ `history` (derived state, không useState/useEffect).
 *
 * Contract slide 20: LIKE = +10, mọi hướng còn lại = −5.
 * MỞ RỘNG (không có trong slide, do sinh viên thêm): SUPER = +20.
 *
 * @typedef {Object} HistoryEntry
 * @property {string} id                 id phía client (hoặc _id của Swipe khi khôi phục từ server)
 * @property {string} profileId
 * @property {import('./deck.js').Direction} direction
 */

/** Trọng số điểm theo hướng vuốt. */
export const SCORE_WEIGHTS = Object.freeze({
  LIKE: 10,
  NOPE: -5,
  SUPER: 20, // phần mở rộng
});

/** "Còn lại −5" theo contract slide — áp dụng cho hướng không có trong SCORE_WEIGHTS. */
const DEFAULT_WEIGHT = -5;

/**
 * Tổng điểm = reduce trên lịch sử.
 * @param {readonly Pick<HistoryEntry, 'direction'>[]} history
 * @returns {number}
 */
export function computeScore(history) {
  return history.reduce(
    (sum, entry) => sum + (Object.hasOwn(SCORE_WEIGHTS, entry.direction) ? SCORE_WEIGHTS[entry.direction] : DEFAULT_WEIGHT),
    0,
  );
}

/**
 * Thống kê số lần mỗi hướng (cũng là derived).
 * @param {readonly Pick<HistoryEntry, 'direction'>[]} history
 * @returns {{ LIKE: number, NOPE: number, SUPER: number, total: number }}
 */
export function computeStats(history) {
  return history.reduce(
    (stats, { direction }) => {
      if (Object.hasOwn(stats, direction) && direction !== 'total') stats[direction] += 1;
      stats.total += 1;
      return stats;
    },
    { LIKE: 0, NOPE: 0, SUPER: 0, total: 0 },
  );
}
