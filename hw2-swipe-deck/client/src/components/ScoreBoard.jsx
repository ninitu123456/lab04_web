import { useId } from 'react';

/**
 * Bảng điểm — chỉ HIỂN THỊ giá trị derived truyền vào (không tự giữ state).
 * @param {{ score: number, stats: ReturnType<typeof import('../lib/score.js').computeStats> }} props
 */
export default function ScoreBoard({ score, stats }) {
  const titleId = useId();
  return (
    <section className="scoreboard" aria-labelledby={titleId}>
      <h2 id={titleId} className="visually-hidden">
        Bảng điểm
      </h2>
      <dl className="scoreboard__list">
        <div className="scoreboard__item scoreboard__item--score">
          <dt>Điểm</dt>
          <dd data-testid="score">{score}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Thích</dt>
          <dd>{stats.LIKE}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Siêu thích</dt>
          <dd>{stats.SUPER}</dd>
        </div>
        <div className="scoreboard__item">
          <dt>Bỏ qua</dt>
          <dd>{stats.NOPE}</dd>
        </div>
      </dl>
    </section>
  );
}
