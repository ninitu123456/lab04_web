import { useEffect, useState } from 'react';

/**
 * GET JSON với AbortController (slide 26) — dùng cho useDossier / useDossierList.
 * - Mỗi lần `url` (hoặc lượt thử lại) đổi → effect tạo controller mới; cleanup abort() request cũ.
 * - try/catch/finally đều kiểm tra `signal.aborted` → không setState sau unmount, không race khi đổi URL.
 * - `loading` là DẪN XUẤT: kết quả hiện có thuộc URL khác URL đang yêu cầu → đang tải.
 *
 * @template T
 * @param {string} url
 * @returns {{ data: T | null, loading: boolean, error: string | null, notFound: boolean, retry: () => void }}
 */
export function useApiResource(url) {
  const [result, setResult] = useState(
    /** @type {{ url: string | null, data: T | null, error: string | null, notFound: boolean }} */ ({
      url: null,
      data: null,
      error: null,
      notFound: false,
    }),
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      const next = { url, data: null, error: null, notFound: false };
      try {
        const res = await fetch(url, { signal });
        if (res.status === 404) {
          next.notFound = true;
          return;
        }
        if (!res.ok) throw new Error(`Máy chủ trả về lỗi ${res.status}`);
        next.data = await res.json();
      } catch (err) {
        if (signal.aborted) return; // do chính mình hủy (unmount / đổi URL)
        next.error = err instanceof Error ? err.message : String(err);
      } finally {
        if (!signal.aborted) setResult(next);
      }
    }

    load();
    return () => controller.abort();
  }, [url, attempt]);

  const loading = result.url !== url;
  /** Thử lại: đánh dấu kết quả cũ là "không thuộc URL nào" ngay trong event handler → loading = true. */
  const retry = () => {
    setResult((r) => ({ ...r, url: null }));
    setAttempt((n) => n + 1);
  };

  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? null : result.error,
    notFound: !loading && result.notFound,
    retry,
  };
}
