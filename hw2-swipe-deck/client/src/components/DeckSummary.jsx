/**
 * Màn hình "hết thẻ" — tổng kết từ dữ liệu derived.
 * @param {{ total: number, score: number, stats: ReturnType<typeof import('../lib/score.js').computeStats> }} props
 */
export default function DeckSummary({ total, score, stats }) {
  if (total === 0) return <p className="summary__text">Chưa có hồ sơ nào để vuốt.</p>;
  return (
    <div className="summary">
      <h2 className="summary__title">Hết thẻ rồi!</h2>
      <p className="summary__text">
        Bạn đã xem hết {total} hồ sơ: {stats.LIKE} thích, {stats.SUPER} siêu thích, {stats.NOPE} bỏ qua.
      </p>
      <p className="summary__score">
        Tổng điểm: <strong>{score}</strong>
      </p>
      <p className="summary__text">Nhấn Hoàn tác (hoặc Backspace) để xem lại thẻ vừa vuốt.</p>
    </div>
  );
}
