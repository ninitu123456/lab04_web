import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';
import { createMockApi, createPendingFetch } from '../test/mockApi.js';
import { useProfiles } from './useProfiles.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useProfiles (GET /api/profiles + AbortController)', () => {
  it('starts loading, then exposes the data', async () => {
    const { fetchMock } = createMockApi();
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useProfiles());
    expect(result.current.loading).toBe(true);
    expect(result.current.profiles).toEqual([]);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.profiles).toEqual(FIXTURE_PROFILES);
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith('/api/profiles', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('reports a network error and can retry', async () => {
    const api = createMockApi({ fail: { profiles: true } });
    vi.stubGlobal('fetch', api.fetchMock);

    const { result } = renderHook(() => useProfiles());
    await waitFor(() => expect(result.current.error).toMatch(/failed to fetch/i));
    expect(result.current.loading).toBe(false);

    const healthy = createMockApi();
    vi.stubGlobal('fetch', healthy.fetchMock);
    act(() => result.current.retry());
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.profiles).toHaveLength(FIXTURE_PROFILES.length));
    expect(result.current.error).toBeNull();
  });

  it('aborts the request on unmount and never sets state afterwards', async () => {
    const pending = createPendingFetch();
    vi.stubGlobal('fetch', pending.fetchMock);
    const consoleError = vi.spyOn(console, 'error');

    const { result, unmount } = renderHook(() => useProfiles());
    expect(pending.signals).toHaveLength(1);
    unmount();

    expect(pending.signals[0].aborted).toBe(true);
    pending.resolveAll(FIXTURE_PROFILES); // phản hồi tới muộn sau khi đã hủy
    await new Promise((r) => setTimeout(r, 0));

    expect(result.current.loading).toBe(true);
    expect(result.current.profiles).toEqual([]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
