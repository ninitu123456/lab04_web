/**
 * Fallback cho <Suspense> / trạng thái đang tải — aria-busy + aria-live để screen reader biết.
 * @param {{ label?: string, lines?: number }} props
 */
export default function PageSkeleton({ label = 'Đang tải nội dung…', lines = 4 }) {
  return (
    <div className="skeleton" role="status" aria-busy="true" aria-live="polite">
      <span className="visually-hidden">{label}</span>
      <div className="skeleton__title" aria-hidden="true" />
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton__line" aria-hidden="true" />
      ))}
    </div>
  );
}
