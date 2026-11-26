import { useMemo } from 'react';
import { FLAG_META, PENALTY_PER_SEVERITY, THRESHOLDS, computeDisproportionality } from '../lib/disproportionality.js';

const ratioFormat = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Ô đánh giá: biểu tượng + chữ (không chỉ dựa vào màu — WCAG 1.4.1). */
function FlagCell({ flag }) {
  const meta = FLAG_META[flag];
  return (
    <span className={`flag flag--${flag}`}>
      <span aria-hidden="true">{meta.icon}</span> {meta.label}
    </span>
  );
}

/**
 * Ma trận so sánh mức phạt với mức vi phạm — DERIVED STATE:
 * useMemo tính lại chỉ khi danh sách vi phạm đổi; không useState/useEffect.
 * @param {{ offenses: readonly import('../hooks/useDossier.js').Offense[], playerName: string }} props
 */
export default function DisproportionalityMatrix({ offenses, playerName }) {
  const { rows, totals, counts } = useMemo(() => computeDisproportionality(offenses), [offenses]);

  return (
    <div className="matrix">
      <div className="table-scroll" role="region" aria-labelledby="matrix-caption" tabIndex={0}>
        <table className="matrix__table">
          <caption id="matrix-caption">
            Ma trận tương xứng giữa mức vi phạm và mức phạt — hồ sơ {playerName}
          </caption>
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Vi phạm</th>
              <th scope="col">Mức độ (1–5)</th>
              <th scope="col">Phạt thực tế (trận)</th>
              <th scope="col">Phạt chuẩn (trận)</th>
              <th scope="col">Tỉ lệ thực tế / chuẩn</th>
              <th scope="col">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} data-flag={row.flag}>
                <th scope="row">{row.code}</th>
                <td>{row.title}</td>
                <td className="num">{row.severity}</td>
                <td className="num">{row.penaltyMatches}</td>
                <td className="num">{row.expected}</td>
                <td className="num">{ratioFormat.format(row.ratio)}</td>
                <td>
                  <FlagCell flag={row.flag} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr data-flag={totals.flag}>
              <th scope="row" colSpan={3}>
                Tổng cộng
              </th>
              <td className="num">{totals.actual}</td>
              <td className="num">{totals.expected}</td>
              <td className="num">{ratioFormat.format(totals.ratio)}</td>
              <td>
                <FlagCell flag={totals.flag} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="matrix__summary">
        {counts.disproportionate} vi phạm bị phạt nặng hơn chuẩn · {counts.proportionate} tương xứng · {counts.lenient}{' '}
        nhẹ hơn chuẩn.
      </p>
      <p className="matrix__legend">
        Cách tính (giả định phục vụ bài tập): phạt chuẩn = mức độ × {PENALTY_PER_SEVERITY} trận. Tỉ lệ &gt;{' '}
        {ratioFormat.format(THRESHOLDS.disproportionate)} là không tương xứng; &lt;{' '}
        {ratioFormat.format(THRESHOLDS.lenient)} là nhẹ hơn chuẩn.
      </p>
    </div>
  );
}
