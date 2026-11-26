import { useEffect, useState } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Tách số ms còn lại thành ngày/giờ/phút/giây. Hàm thuần.
 * @param {number} ms
 */
export function splitDuration(ms) {
  const safe = Math.max(0, Math.floor(ms));
  return {
    days: Math.floor(safe / DAY),
    hours: Math.floor((safe % DAY) / HOUR),
    minutes: Math.floor((safe % HOUR) / MINUTE),
    seconds: Math.floor((safe % MINUTE) / SECOND),
  };
}

/**
 * ZERO-DRIFT SLA COUNTDOWN
 *
 *   remainingMs = max(0, deadline − (now + offset)),   now = Date.now() đọc lại ở MỖI tick
 *
 * - KHÔNG BAO GIỜ cộng dồn tick (không `remaining -= 1000`): khi tab bị ẩn, trình duyệt throttle setInterval
 *   (≥ 1s, có khi 1 phút) → đếm tick sẽ chậm dần (drift). Đọc lại đồng hồ tuyệt đối thì tick trễ chỉ làm UI
 *   cập nhật trễ, con số luôn đúng.
 * - `setInterval` chỉ để KÍCH HOẠT render: callback chụp lại Date.now() (không trừ dần); dừng khi đã hết hạn.
 *   (Date.now() được đọc trong callback/initializer chứ không trong thân render → giữ render thuần — rule react/purity.)
 * - `visibilitychange` → tab hiện lại: gọi `onResync()` (đồng bộ lại offset với server) + đọc lại đồng hồ ngay.
 * - Cleanup: clearInterval + removeEventListener.
 *
 * @param {string | number | Date} deadline  ISO string / epoch ms / Date
 * @param {{ offset?: number, onResync?: () => void, tickMs?: number }} [options]
 * @returns {{ remainingMs: number, days: number, hours: number, minutes: number, seconds: number, isExpired: boolean }}
 */
export function useAppealSlaTimer(deadline, { offset = 0, onResync, tickMs = SECOND } = {}) {
  /** Ảnh chụp đồng hồ thiết bị tại lần tick gần nhất — luôn là giá trị TUYỆT ĐỐI, không cộng dồn. */
  const [now, setNow] = useState(() => Date.now());

  const deadlineMs = deadline instanceof Date ? deadline.getTime() : typeof deadline === 'number' ? deadline : Date.parse(deadline);
  // Deadline không hợp lệ (NaN) → coi như đã hết hạn (an toàn: không cho gửi).
  const remainingMs = Number.isFinite(deadlineMs) ? Math.max(0, deadlineMs - (now + offset)) : 0;
  const isExpired = remainingMs <= 0;

  useEffect(() => {
    if (isExpired) return undefined; // hết hạn → không cần render lại nữa
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs, isExpired]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      onResync?.();
      setNow(Date.now()); // cập nhật ngay, không chờ tick kế tiếp
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [onResync]);

  return { remainingMs, ...splitDuration(remainingMs), isExpired };
}
