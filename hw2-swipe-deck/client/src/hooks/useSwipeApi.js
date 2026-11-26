import { useEffect, useRef, useState } from 'react';

export const SESSION_STORAGE_KEY = 'hw2.sessionId';

/**
 * sessionId ẩn danh, lưu trong localStorage để reload vẫn giữ lịch sử.
 * localStorage có thể ném lỗi (chế độ riêng tư, bị chặn) → bọc try/catch, fallback id trong bộ nhớ.
 * @returns {string}
 */
export function getOrCreateSessionId() {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) return saved;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Lịch sử từ server → undo stack: bỏ swipe của hồ sơ không còn tồn tại, mỗi hồ sơ giữ lần vuốt MỚI NHẤT.
 * @param {Array<{ _id: string, profileId: string, direction: import('../lib/deck.js').Direction }>} swipes  cũ → mới
 * @param {readonly import('../lib/deck.js').Profile[]} profiles
 * @returns {import('../lib/score.js').HistoryEntry[]}
 */
export function toHistory(swipes, profiles) {
  const known = new Set(profiles.map((p) => p._id));
  const latest = new Map();
  for (const s of swipes) {
    if (!known.has(s.profileId)) continue;
    latest.delete(s.profileId); // đưa về cuối → giữ đúng thứ tự thời gian của lần vuốt mới nhất
    latest.set(s.profileId, { id: s._id, profileId: s.profileId, direction: s.direction });
  }
  return [...latest.values()];
}

async function requestJson(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/**
 * Đồng bộ undo stack với Express API — optimistic update + rollback.
 * - Khi tải: GET /api/swipes?sessionId=… → deck.restore().
 * - swipe: cập nhật UI ngay, POST /api/swipe; lỗi → deck.remove() + thông báo role="alert".
 * - undo:  cập nhật UI ngay, DELETE /api/swipe/:id; lỗi → deck.reinsert() + thông báo.
 * Mọi promise đều được bắt lỗi (không có unhandled rejection); request bị hủy khi unmount.
 *
 * @param {ReturnType<typeof import('./useSwipeDeck.js').useSwipeDeck>} deck
 * @param {{ profiles: readonly import('../lib/deck.js').Profile[], enabled: boolean }} options
 */
export function useSwipeApi(deck, { profiles, enabled }) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [restoring, setRestoring] = useState(true);
  const [syncError, setSyncError] = useState(/** @type {string | null} */ (null));

  /** id phía client → Promise<_id trên server | null>. Undo chờ POST xong mới DELETE được. */
  const serverIds = useRef(new Map());
  /** Controller của vòng đời component — abort mọi POST/DELETE đang chạy khi unmount. */
  const lifetime = useRef(/** @type {AbortController | null} */ (null));

  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    return () => controller.abort();
  }, []);

  // Khôi phục lịch sử một lần khi danh sách hồ sơ đã sẵn sàng.
  const { restore } = deck;
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const swipes = await requestJson(`/api/swipes?sessionId=${encodeURIComponent(sessionId)}`, { signal });
        if (signal.aborted) return;
        const history = toHistory(swipes, profiles);
        serverIds.current = new Map(history.map((e) => [e.id, Promise.resolve(e.id)]));
        restore(history);
      } catch {
        if (signal.aborted) return;
        setSyncError('Không khôi phục được lịch sử vuốt từ máy chủ. Bạn vẫn có thể tiếp tục.');
      } finally {
        if (!signal.aborted) setRestoring(false);
      }
    }

    load();
    return () => controller.abort();
  }, [enabled, sessionId, profiles, restore]);

  const isAlive = () => lifetime.current !== null && !lifetime.current.signal.aborted;

  /** @param {import('../lib/deck.js').Direction} direction */
  const swipe = (direction) => {
    const entry = deck.swipe(direction);
    if (!entry) return;
    setSyncError(null);
    const saved = requestJson('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, profileId: entry.profileId, direction: entry.direction }),
      signal: lifetime.current?.signal,
    })
      .then((doc) => doc._id)
      .catch(() => {
        if (!isAlive()) return null;
        deck.remove(entry.id); // rollback optimistic swipe
        serverIds.current.delete(entry.id);
        setSyncError('Không lưu được lượt vuốt — thẻ đã được trả lại. Vui lòng thử lại.');
        return null;
      });
    serverIds.current.set(entry.id, saved);
  };

  const undo = () => {
    const entry = deck.undo();
    if (!entry) return;
    setSyncError(null);
    const pending = serverIds.current.get(entry.id) ?? Promise.resolve(null);
    pending
      .then(async (serverId) => {
        if (!serverId) return; // POST đã thất bại & đã rollback → không có gì để xoá
        const res = await fetch(`/api/swipe/${encodeURIComponent(serverId)}`, {
          method: 'DELETE',
          signal: lifetime.current?.signal,
        });
        // 404 = đã bị xoá trước đó → coi như thành công.
        if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
        serverIds.current.delete(entry.id);
      })
      .catch(() => {
        if (!isAlive()) return;
        deck.reinsert(entry); // rollback optimistic undo
        setSyncError('Không hoàn tác được trên máy chủ — lượt vuốt đã được giữ lại.');
      });
  };

  return {
    sessionId,
    restoring: enabled && restoring,
    syncError,
    dismissError: () => setSyncError(null),
    swipe,
    undo,
  };
}
