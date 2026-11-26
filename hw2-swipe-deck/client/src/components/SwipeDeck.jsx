import { useId, useRef } from 'react';
import { DIRECTIONS, directionFromDelta, directionFromKey } from '../lib/deck.js';
import SwipeCard from './SwipeCard.jsx';

/** Phần tử nhập liệu — Backspace phải giữ hành vi xoá chữ. */
function isTextInput(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * Deck vuốt thẻ — DUAL listener:
 * - Bàn phím: gắn trên vùng deck `tabIndex={0}`: ← NOPE, → LIKE, ↑ SUPER, Backspace = hoàn tác.
 * - Pointer (chuột/cảm ứng/bút): kéo |dx| > 50px trái/phải, dy < −50px lên.
 * - 4 nút thật (Bỏ qua / Siêu thích / Thích / Hoàn tác) cho người không dùng được 2 cách trên.
 *
 * Sửa 2 lỗi của slide 31:
 * (a) pointerup không có pointerdown trước đó → startPos null → crash: guard null.
 * (b) useState cho startPos → re-render mỗi lần chạm: dùng useRef (không re-render).
 *
 * @param {{
 *   profile: import('../lib/deck.js').Profile | undefined,
 *   remaining: number,
 *   onSwipe: (direction: import('../lib/deck.js').Direction) => void,
 *   onUndo?: () => void,
 *   canUndo?: boolean,
 *   emptyState?: import('react').ReactNode,
 * }} props
 */
export default function SwipeDeck({ profile, remaining, onSwipe, onUndo, canUndo = false, emptyState = 'Hết thẻ rồi!' }) {
  const hintId = useId();
  /** Điểm bắt đầu kéo — ref vì không ảnh hưởng tới UI render (chỉ dùng khi tính delta). */
  const startRef = useRef(/** @type {{ x: number, y: number, pointerId: number } | null} */ (null));
  const cardRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const hasCard = Boolean(profile);

  /** Cập nhật vị trí kéo bằng CSS variable — không qua state, không re-render. */
  const setDrag = (dx, dy) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', `${dx}px`);
    el.style.setProperty('--drag-y', `${dy}px`);
    el.style.setProperty('--drag-rot', `${dx / 20}deg`); // nghiêng theo hướng kéo (đơn vị góc hợp lệ)
    el.dataset.dragging = dx || dy ? 'true' : 'false';
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Backspace') {
      if (isTextInput(event.target)) return; // để người dùng xoá chữ bình thường
      event.preventDefault(); // tránh trình duyệt điều hướng lùi / hành vi mặc định
      if (canUndo) onUndo?.();
      return;
    }
    const direction = directionFromKey(event.key);
    if (!direction) return;
    event.preventDefault(); // ← → ↑ không cuộn trang
    if (hasCard) onSwipe(direction);
  };

  const handlePointerDown = (event) => {
    if (!hasCard || (event.pointerType === 'mouse' && event.button !== 0)) return;
    startRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    // Tiếp tục nhận pointermove/up kể cả khi con trỏ ra khỏi thẻ.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const start = startRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setDrag(event.clientX - start.x, event.clientY - start.y);
  };

  const handlePointerUp = (event) => {
    const start = startRef.current;
    startRef.current = null;
    setDrag(0, 0);
    if (!start || start.pointerId !== event.pointerId) return; // guard (a)
    const direction = directionFromDelta(event.clientX - start.x, event.clientY - start.y);
    if (direction && hasCard) onSwipe(direction);
  };

  const handlePointerCancel = () => {
    startRef.current = null;
    setDrag(0, 0);
  };

  return (
    <section
      className="deck"
      tabIndex={0}
      aria-label="Bộ thẻ hồ sơ"
      aria-describedby={hintId}
      onKeyDown={handleKeyDown}
    >
      <p id={hintId} className="deck__hint">
        Phím tắt: ← Bỏ qua · → Thích · ↑ Siêu thích · Backspace Hoàn tác. Hoặc kéo thẻ sang trái / phải / lên.
      </p>

      <div
        ref={cardRef}
        className="deck__stage"
        data-testid="deck-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {profile ? (
          <div key={profile._id} className="deck__card">
            <SwipeCard profile={profile} />
          </div>
        ) : (
          <div className="deck__empty">{emptyState}</div>
        )}
      </div>

      <p className="deck__count">Còn {remaining} thẻ</p>

      <div className="deck__actions">
        <button
          type="button"
          className="action action--nope"
          aria-label="Bỏ qua (phím mũi tên trái)"
          disabled={!hasCard}
          onClick={() => onSwipe(DIRECTIONS.NOPE)}
        >
          <span aria-hidden="true">✕</span> Bỏ qua
        </button>
        <button
          type="button"
          className="action action--super"
          aria-label="Siêu thích (phím mũi tên lên)"
          disabled={!hasCard}
          onClick={() => onSwipe(DIRECTIONS.SUPER)}
        >
          <span aria-hidden="true">★</span> Siêu thích
        </button>
        <button
          type="button"
          className="action action--like"
          aria-label="Thích (phím mũi tên phải)"
          disabled={!hasCard}
          onClick={() => onSwipe(DIRECTIONS.LIKE)}
        >
          <span aria-hidden="true">♥</span> Thích
        </button>
        <button
          type="button"
          className="action action--undo"
          aria-label="Hoàn tác lần vuốt gần nhất (phím Backspace)"
          disabled={!canUndo || !onUndo}
          onClick={() => onUndo?.()}
        >
          <span aria-hidden="true">↺</span> Hoàn tác
        </button>
      </div>
    </section>
  );
}
