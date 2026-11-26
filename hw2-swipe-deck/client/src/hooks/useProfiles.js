import { useEffect, useState } from 'react';

/** Mảng rỗng dùng chung — tránh tạo mảng mới mỗi render khi chưa có dữ liệu. */
const EMPTY = Object.freeze([]);

/**
 * GET /api/profiles với AbortController (slide 26):
 * - effect tạo controller, cleanup gọi abort() → hủy request khi unmount / StrictMode remount;
 * - try/catch/finally đều kiểm tra `signal.aborted` trước khi setState → không setState sau unmount;
 * - KHÔNG dùng cờ `didCancel`.
 *
 * @returns {{
 *   profiles: readonly import('../lib/deck.js').Profile[],
 *   loading: boolean,
 *   error: string | null,
 *   retry: () => void,
 * }}
 */
export function useProfiles() {
  const [profiles, setProfiles] = useState(/** @type {readonly import('../lib/deck.js').Profile[]} */ (EMPTY));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const res = await fetch('/api/profiles', { signal });
        if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
        const data = await res.json();
        if (signal.aborted) return;
        setProfiles(data);
      } catch (err) {
        if (signal.aborted) return; // AbortError do chính mình hủy → bỏ qua
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [attempt]);

  /** Thử lại: đặt trạng thái loading trong event handler (không phải trong effect) rồi kích hoạt effect. */
  const retry = () => {
    setError(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  return { profiles, loading, error, retry };
}
