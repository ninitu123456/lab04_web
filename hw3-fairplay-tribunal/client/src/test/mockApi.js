import { validateAppeal } from '@shared/appealRules.js';
import { vi } from 'vitest';
import { buildSeedDossiers } from '../../../server/scripts/dossiers.data.js';

const HOUR = 3_600_000;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

/**
 * Fixture = CHÍNH dữ liệu seed của server, chuyển sang DTO giống GET /api/dossiers/:id.
 * @param {number} [now]
 */
export function buildDossierFixtures(now = Date.now()) {
  return buildSeedDossiers(now).map((d) => ({
    ...d,
    verdictAt: d.verdictAt.toISOString(),
    slaDeadline: new Date(d.verdictAt.getTime() + d.appealWindowHours * HOUR).toISOString(),
  }));
}

/**
 * fetch giả lập Express API HW3 trong bộ nhớ — tôn trọng AbortSignal giống fetch thật.
 * @param {{
 *   dossiers?: ReturnType<typeof buildDossierFixtures>,
 *   serverNow?: () => number,
 *   fail?: Partial<Record<'list' | 'detail' | 'time' | 'post', boolean>>,
 *   postResponse?: (body: object) => Response | undefined,
 * }} [options]
 */
export function createMockApi({ dossiers = buildDossierFixtures(), serverNow = () => Date.now(), fail = {}, postResponse } = {}) {
  const appeals = [];

  const fetchMock = vi.fn(async (url, init = {}) => {
    if (init.signal?.aborted) throw abortError();
    const { pathname } = new URL(url, 'http://localhost');
    const method = init.method ?? 'GET';

    if (method === 'GET' && pathname === '/api/dossiers') {
      if (fail.list) throw new TypeError('Failed to fetch');
      return json(dossiers.map(({ offenses, ...d }) => ({ ...d, offenseCount: offenses.length })));
    }
    const detail = pathname.match(/^\/api\/dossiers\/([^/]+)$/);
    if (method === 'GET' && detail) {
      if (fail.detail) return json({ error: 'boom' }, 500);
      const found = dossiers.find((d) => d.playerId === decodeURIComponent(detail[1]).toLowerCase());
      return found ? json(found) : json({ error: 'dossier not found' }, 404);
    }
    if (method === 'GET' && pathname === '/api/time') {
      if (fail.time) throw new TypeError('Failed to fetch');
      return json({ now: serverNow() });
    }
    if (method === 'POST' && pathname === '/api/appeals') {
      const body = JSON.parse(init.body);
      const custom = postResponse?.(body);
      if (custom) return custom;
      if (fail.post) throw new TypeError('Failed to fetch');
      const errors = validateAppeal(body);
      if (Object.keys(errors).length) return json({ errors }, 400);
      const { confirmEmail: _confirmEmail, acceptTerms: _acceptTerms, ...rest } = body; // server không lưu 2 field này
      const doc = { _id: `a${appeals.length + 1}`, ...rest, status: 'pending', createdAt: new Date(serverNow()).toISOString() };
      appeals.push(doc);
      return json(doc, 201);
    }
    return json({ error: 'Not found' }, 404);
  });

  return { fetchMock, appeals };
}
