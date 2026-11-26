import { useCallback, useEffect, useState } from 'react';

/**
 * Độ lệch đồng hồ thiết bị so với server: offset = serverNow − (t0 + t1) / 2.
 * Lấy điểm giữa của request (t0 = lúc gửi, t1 = lúc nhận) để bù độ trễ mạng một chiều (giả định đối xứng).
 * Thời điểm "đúng" theo server ≈ Date.now() + offset.
 *
 * - GET /api/time với AbortController; guard `signal.aborted` → không setState sau unmount.
 * - `resync()` ổn định (useCallback) → an toàn khi đưa vào dependency của effect khác.
 * - Lỗi mạng: giữ offset cũ (hoặc 0) và báo `error` — đồng hồ vẫn chạy theo thiết bị.
 *
 * @returns {{ offset: number, synced: boolean, error: string | null, resync: () => void }}
 */
export function useServerClockOffset() {
  const [offset, setOffset] = useState(0);
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [round, setRound] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function sync() {
      try {
        const t0 = Date.now();
        const res = await fetch('/api/time', { signal, cache: 'no-store' });
        const t1 = Date.now();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { now } = await res.json();
        if (signal.aborted) return;
        if (!Number.isFinite(now)) throw new Error('Phản hồi /api/time không hợp lệ');
        setOffset(Math.round(now - (t0 + t1) / 2));
        setSynced(true);
        setError(null);
      } catch (err) {
        if (signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    sync();
    return () => controller.abort();
  }, [round]);

  const resync = useCallback(() => setRound((n) => n + 1), []);

  return { offset, synced, error, resync };
}
