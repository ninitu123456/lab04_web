/**
 * Skeleton fallback cho <Suspense> khi route chunk đang tải.
 * - variant "grid" (mặc định): khớp trang Thư viện (tiêu đề, hàng chip, lưới ảnh 3:2).
 * - variant "text": khớp trang văn bản ngắn (Giới thiệu) — tiêu đề + vài dòng,
 *   tránh skeleton cao hơn nội dung thật làm footer dịch lên (CLS).
 * - aria-busy="true" + aria-live="polite" → screen reader biết nội dung đang tải.
 * @param {{ cards?: number, variant?: 'grid' | 'text' }} props
 */
export default function PageSkeleton({ cards = 8, variant = 'grid' }) {
  return (
    <div className="skeleton" role="status" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">Đang tải nội dung…</span>
      <div className="skeleton__title" aria-hidden="true" />
      {variant === 'text' ? (
        <div aria-hidden="true">
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i} className="skeleton__line skeleton__line--text" />
          ))}
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
