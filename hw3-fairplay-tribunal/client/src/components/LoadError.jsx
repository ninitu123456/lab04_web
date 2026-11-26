/**
 * Lỗi tải dữ liệu — role="alert" + nút thử lại thật (không phải link).
 * @param {{ message: string, onRetry: () => void }} props
 */
export default function LoadError({ message, onRetry }) {
  return (
    <div className="load-error" role="alert">
      <p>Không tải được dữ liệu ({message}).</p>
      <button type="button" className="button" onClick={onRetry}>
        Thử lại
      </button>
    </div>
  );
}
