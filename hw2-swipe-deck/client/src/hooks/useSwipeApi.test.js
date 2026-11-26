import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';
import { createMockApi } from '../test/mockApi.js';
import { SESSION_STORAGE_KEY, getOrCreateSessionId, toHistory, useSwipeApi } from './useSwipeApi.js';
import { useSwipeDeck } from './useSwipeDeck.js';

const SESSION = 'session-abc';

function renderDeckWithApi() {
  return renderHook(() => {
    const deck = useSwipeDeck(FIXTURE_PROFILES);
    const api = useSwipeApi(deck, { profiles: FIXTURE_PROFILES, enabled: true });
    return { deck, api };
  });
}

beforeEach(() => {
  localStorage.setItem(SESSION_STORAGE_KEY, SESSION);
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('getOrCreateSessionId', () => {
  it('reuses the id stored in localStorage', () => {
    expect(getOrCreateSessionId()).toBe(SESSION);
  });

  it('creates and stores a new id when none exists', () => {
    localStorage.clear();
    const id = getOrCreateSessionId();
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBe(id);
  });

  it('falls back to an in-memory id when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(getOrCreateSessionId()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('toHistory', () => {
  it('drops unknown profiles and keeps only the latest swipe per profile', () => {
    const swipes = [
      { _id: 's1', profileId: 'f01', direction: 'NOPE' },
      { _id: 's2', profileId: 'ghost', direction: 'LIKE' },
      { _id: 's3', profileId: 'f02', direction: 'LIKE' },
      { _id: 's4', profileId: 'f01', direction: 'SUPER' },
    ];
    expect(toHistory(swipes, FIXTURE_PROFILES)).toEqual([
      { id: 's3', profileId: 'f02', direction: 'LIKE' },
      { id: 's4', profileId: 'f01', direction: 'SUPER' },
    ]);
  });
});

describe('useSwipeApi', () => {
  it('restores the session history from GET /api/swipes on load', async () => {
    const api = createMockApi({
      swipes: [
        { _id: 's1', sessionId: SESSION, profileId: 'f01', direction: 'LIKE' },
        { _id: 's2', sessionId: 'someone-else', profileId: 'f02', direction: 'NOPE' },
      ],
    });
    vi.stubGlobal('fetch', api.fetchMock);

    const { result } = renderDeckWithApi();
    expect(result.current.api.restoring).toBe(true);
    await waitFor(() => expect(result.current.api.restoring).toBe(false));

    expect(api.fetchMock).toHaveBeenCalledWith(`/api/swipes?sessionId=${SESSION}`, expect.anything());
    expect(result.current.deck.history).toEqual([{ id: 's1', profileId: 'f01', direction: 'LIKE' }]);
    expect(result.current.deck.current._id).toBe('f02');
    expect(result.current.deck.score).toBe(10);
  });

  it('swipe updates the UI optimistically and POSTs the correct payload', async () => {
    const api = createMockApi();
    vi.stubGlobal('fetch', api.fetchMock);
    const { result } = renderDeckWithApi();
    await waitFor(() => expect(result.current.api.restoring).toBe(false));

    act(() => result.current.api.swipe('SUPER'));
    expect(result.current.deck.current._id).toBe('f02'); // ngay lập tức, chưa chờ server

    await waitFor(() => expect(api.db.swipes).toHaveLength(1));
    expect(api.writes()).toEqual([['POST', '/api/swipe', { sessionId: SESSION, profileId: 'f01', direction: 'SUPER' }]]);
  });

  it('undo DELETEs the server copy of the last swipe (even if POST was still in flight)', async () => {
    const api = createMockApi();
    vi.stubGlobal('fetch', api.fetchMock);
    const { result } = renderDeckWithApi();
    await waitFor(() => expect(result.current.api.restoring).toBe(false));

    act(() => result.current.api.swipe('LIKE'));
    act(() => result.current.api.undo());
    expect(result.current.deck.current._id).toBe('f01');

    await waitFor(() => expect(api.writes().map(([m, url]) => [m, url])).toEqual([
      ['POST', '/api/swipe'],
      ['DELETE', '/api/swipe/s1'],
    ]));
    await waitFor(() => expect(api.db.swipes).toHaveLength(0));
    expect(result.current.api.syncError).toBeNull();
  });

  it('rolls back a swipe and shows an error when POST fails', async () => {
    const api = createMockApi({ fail: { post: true } });
    vi.stubGlobal('fetch', api.fetchMock);
    const { result } = renderDeckWithApi();
    await waitFor(() => expect(result.current.api.restoring).toBe(false));

    act(() => result.current.api.swipe('LIKE'));
    expect(result.current.deck.history).toHaveLength(1);

    await waitFor(() => expect(result.current.api.syncError).toMatch(/không lưu được/i));
    expect(result.current.deck.history).toHaveLength(0);
    expect(result.current.deck.current._id).toBe('f01');
  });

  it('rolls back an undo and shows an error when DELETE fails', async () => {
    const api = createMockApi({
      swipes: [{ _id: 's9', sessionId: SESSION, profileId: 'f01', direction: 'NOPE' }],
      fail: { delete: true },
    });
    vi.stubGlobal('fetch', api.fetchMock);
    const { result } = renderDeckWithApi();
    await waitFor(() => expect(result.current.api.restoring).toBe(false));

    act(() => result.current.api.undo());
    expect(result.current.deck.history).toHaveLength(0);

    await waitFor(() => expect(result.current.api.syncError).toMatch(/không hoàn tác được/i));
    expect(result.current.deck.history).toEqual([{ id: 's9', profileId: 'f01', direction: 'NOPE' }]);
  });

  it('keeps working (with an alert) when the history cannot be restored', async () => {
    const api = createMockApi({ fail: { swipes: true } });
    vi.stubGlobal('fetch', api.fetchMock);
    const { result } = renderDeckWithApi();
    await waitFor(() => expect(result.current.api.restoring).toBe(false));
    expect(result.current.api.syncError).toMatch(/không khôi phục được/i);
    expect(result.current.deck.current._id).toBe('f01');
  });

  it('aborts in-flight requests on unmount', async () => {
    const api = createMockApi();
    vi.stubGlobal('fetch', api.fetchMock);
    const { unmount } = renderDeckWithApi();
    const [, init] = api.fetchMock.mock.calls[0];
    unmount();
    expect(init.signal.aborted).toBe(true);
  });
});
