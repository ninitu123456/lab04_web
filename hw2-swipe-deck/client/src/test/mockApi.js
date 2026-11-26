import { vi } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

/**
 * fetch giả lập Express API trong bộ nhớ — tôn trọng AbortSignal giống fetch thật.
 * @param {{
 *   profiles?: readonly object[],
 *   swipes?: Array<{ _id: string, sessionId: string, profileId: string, direction: string }>,
 *   fail?: Partial<Record<'profiles' | 'swipes' | 'post' | 'delete', boolean>>,
 * }} [options]
 */
export function createMockApi({ profiles = FIXTURE_PROFILES, swipes = [], fail = {} } = {}) {
  const db = { swipes: [...swipes] };
  let nextId = 1;

  const fetchMock = vi.fn(async (url, init = {}) => {
    if (init.signal?.aborted) throw abortError();
    const { pathname, searchParams } = new URL(url, 'http://localhost');
    const method = init.method ?? 'GET';

    if (method === 'GET' && pathname === '/api/profiles') {
      if (fail.profiles) throw new TypeError('Failed to fetch');
      return json(profiles);
    }
    if (method === 'GET' && pathname === '/api/swipes') {
      if (fail.swipes) return json({ error: 'boom' }, 500);
      return json(db.swipes.filter((s) => s.sessionId === searchParams.get('sessionId')));
    }
    if (method === 'POST' && pathname === '/api/swipe') {
      if (fail.post) return json({ error: 'boom' }, 500);
      const doc = { _id: `s${nextId++}`, ...JSON.parse(init.body) };
      db.swipes.push(doc);
      return json(doc, 201);
    }
    const del = pathname.match(/^\/api\/swipe\/(.+)$/);
    if (method === 'DELETE' && del) {
      if (fail.delete) return json({ error: 'boom' }, 500);
      const before = db.swipes.length;
      db.swipes = db.swipes.filter((s) => s._id !== del[1]);
      return db.swipes.length < before ? new Response(null, { status: 204 }) : json({ error: 'swipe not found' }, 404);
    }
    return json({ error: 'Not found' }, 404);
  });

  /** Các lời gọi có method khác GET, dạng [method, path, body]. */
  const writes = () =>
    fetchMock.mock.calls
      .filter(([, init]) => init?.method && init.method !== 'GET')
      .map(([url, init]) => [init.method, url, init.body ? JSON.parse(init.body) : undefined]);

  return { fetchMock, db, writes };
}

/**
 * fetch treo cho tới khi bị abort — dùng để kiểm tra unmount giữa chừng.
 * @returns {{ fetchMock: import('vitest').Mock, signals: AbortSignal[], resolveAll: (body: unknown) => void }}
 */
export function createPendingFetch() {
  const signals = [];
  const resolvers = [];
  const fetchMock = vi.fn(
    (_url, init = {}) =>
      new Promise((resolve, reject) => {
        signals.push(init.signal);
        resolvers.push(resolve);
        init.signal?.addEventListener('abort', () => reject(abortError()));
      }),
  );
  return { fetchMock, signals, resolveAll: (body) => resolvers.forEach((r) => r(json(body))) };
}
