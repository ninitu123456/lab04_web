import { useEffect, useId, useRef } from 'react';
import { CATEGORIES } from '../../data/photos.js';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' });

/**
 * Lightbox dùng <dialog> gốc của HTML5.
 * - Mở/đóng được ĐIỀU KHIỂN bởi prop `photo` (dẫn xuất từ ?photoId= trên URL).
 * - useEffect ở đây chỉ để đồng bộ với DOM API bên ngoài React (showModal/close) — hợp lệ.
 * - Mọi đường đóng (nút Đóng, phím Esc, click backdrop) đều đi qua sự kiện "close"
 *   → onClose() → xoá photoId khỏi URL.
 *
 * Điều hướng: nút Trước/Sau + phím ← → (chỉ trong danh sách đang lọc).
 *
 * @param {{
 *   photo: import('../../data/photos.js').Photo | undefined,
 *   onClose: () => void,
 *   onNavigate?: (photoId: string) => void,
 *   prevId?: string,
 *   nextId?: string,
 *   position?: { index: number, total: number },
 * }} props
 */
export default function Lightbox({ photo, onClose, onNavigate, prevId, nextId, position }) {
  const dialogRef = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const titleId = useId();
  const isOpen = Boolean(photo);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  /** Click vào vùng backdrop (chính phần tử <dialog>, không phải nội dung) → đóng. */
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft' && prevId) {
      event.preventDefault();
      onNavigate?.(prevId);
    } else if (event.key === 'ArrowRight' && nextId) {
      event.preventDefault();
      onNavigate?.(nextId);
    }
  };

  const categoryLabel = CATEGORIES.find((c) => c.id === photo?.category)?.label;

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      {photo && (
        <div className="lightbox__body">
          <header className="lightbox__header">
            <h2 id={titleId} className="lightbox__title">
              {photo.title}
            </h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Đóng"
              onClick={() => dialogRef.current?.close()}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </header>

          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="lightbox__img"
          />

          <div className="lightbox__nav">
            <button
              type="button"
              className="icon-button"
              aria-label="Ảnh trước"
              disabled={!prevId}
              onClick={() => prevId && onNavigate?.(prevId)}
            >
              <span aria-hidden="true">←</span>
            </button>
            {position && (
              <p className="lightbox__position" aria-live="polite">
                Ảnh {position.index} / {position.total}
              </p>
            )}
            <button
              type="button"
              className="icon-button"
              aria-label="Ảnh sau"
              disabled={!nextId}
              onClick={() => nextId && onNavigate?.(nextId)}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="lightbox__desc">{photo.description}</p>

          <dl className="meta-list">
            <dt>Danh mục</dt>
            <dd>{categoryLabel}</dd>
            <dt>Địa điểm</dt>
            <dd>{photo.location}</dd>
            <dt>Ngày chụp</dt>
            <dd>
              <time dateTime={photo.takenAt}>{dateFormatter.format(new Date(photo.takenAt))}</time>
            </dd>
          </dl>
        </div>
      )}
    </dialog>
  );
}