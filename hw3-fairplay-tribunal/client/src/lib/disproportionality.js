/**
 * DISPROPORTIONALITY CONTRACT — hàm THUẦN, không phụ thuộc React.
 *
 * Với mỗi vi phạm:
 *   expected = severity × PENALTY_PER_SEVERITY      (mức phạt "chuẩn", đơn vị: trận)
 *   ratio    = penaltyMatches / expected
 *   flag     = 'disproportionate' nếu ratio > 1.5   (phạt nặng hơn chuẩn)
 *              'lenient'          nếu ratio < 0.67  (phạt nhẹ hơn chuẩn)
 *              'proportionate'    còn lại
 *
 * Hệ số chuẩn là GIẢ ĐỊNH phục vụ bài tập (không phải quy định thật của giải nào).
 *
 * @typedef {'disproportionate' | 'proportionate' | 'lenient'} ProportionFlag
 * @typedef {{ code: string, title: string, severity: number, penaltyMatches: number }} OffenseLike
 * @typedef {OffenseLike & { expected: number, ratio: number, flag: ProportionFlag }} MatrixRow
 */

/** Số trận cấm "chuẩn" cho mỗi điểm nghiêm trọng (1–5). */
export const PENALTY_PER_SEVERITY = 2;

export const THRESHOLDS = Object.freeze({ disproportionate: 1.5, lenient: 0.67 });

/** Nhãn + biểu tượng — không chỉ dùng màu để biểu thị (WCAG 1.4.1). */
export const FLAG_META = Object.freeze({
  disproportionate: Object.freeze({ icon: '▲', label: 'Không tương xứng (nặng hơn chuẩn)' }),
  proportionate: Object.freeze({ icon: '●', label: 'Tương xứng' }),
  lenient: Object.freeze({ icon: '▼', label: 'Nhẹ hơn chuẩn' }),
});

/** @param {number} ratio @returns {ProportionFlag} */
export function flagFor(ratio) {
  if (ratio > THRESHOLDS.disproportionate) return 'disproportionate';
  if (ratio < THRESHOLDS.lenient) return 'lenient';
  return 'proportionate';
}

/**
 * @param {readonly OffenseLike[]} offenses
 * @param {{ perSeverity?: number }} [options]
 * @returns {{
 *   rows: MatrixRow[],
 *   totals: { expected: number, actual: number, ratio: number, flag: ProportionFlag },
 *   counts: Record<ProportionFlag, number>,
 * }}
 */
export function computeDisproportionality(offenses, { perSeverity = PENALTY_PER_SEVERITY } = {}) {
  const rows = offenses.map((offense) => {
    const expected = offense.severity * perSeverity;
    const ratio = expected > 0 ? offense.penaltyMatches / expected : 0;
    return { ...offense, expected, ratio, flag: flagFor(ratio) };
  });

  const expected = rows.reduce((sum, r) => sum + r.expected, 0);
  const actual = rows.reduce((sum, r) => sum + r.penaltyMatches, 0);
  const ratio = expected > 0 ? actual / expected : 0;

  const counts = { disproportionate: 0, proportionate: 0, lenient: 0 };
  for (const r of rows) counts[r.flag] += 1;

  return { rows, totals: { expected, actual, ratio, flag: flagFor(ratio) }, counts };
}
