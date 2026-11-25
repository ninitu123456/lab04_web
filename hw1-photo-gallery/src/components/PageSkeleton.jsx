/**
 * Skeleton fallback cho <Suspense> khi route chunk đang tải.
 * - Kích thước khớp với trang thật (tiêu đề, hàng chip, lưới ảnh 3:2) → CLS = 0.
 * - aria-busy="true" + aria-live="polite" → screen reader biết nội dung đang tải.
 * @param {{ cards?: number }} props
 */
export default function PageSkeleton({ cards = 8 }) {
  return (
    <div className="skeleton" role="status" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Đang tải nội dung…</span>
      <div className="skeleton__title" aria-hidden="true" />
      <div className="skeleton__chips" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className="skeleton__chip" />
        ))}
      </div>
      <ul className="photo-grid" aria-hidden="true">
        {Array.from({ length: cards }, (_, i) => (
          <li key={i} className="skeleton__card">
            <span className="skeleton__img" />
            <span className="skeleton__line" />
            <span className="skeleton__line skeleton__line--short" />
          </li>
        ))}
      </ul>
    </div>
  );
}