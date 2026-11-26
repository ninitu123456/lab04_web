import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useServerClockOffset } from './useServerClockOffset.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const timeResponse = (now) => new Response(JSON.stringify({ now }), { status: 200 });

describe('useServerClockOffset', () => {
  it('offset = serverNow − midpoint(t0, t1), compensating for network latency', async () => {
    // Đồng hồ thiết bị: t0 = 1000, t1 = 1200 (request mất 200ms). Server trả now = 61_100.
    const clock = [1000, 1200];
    vi.spyOn(Date, 'now').mockImplementation(() => clock.shift() ?? 1200);
    vi.stubGlobal('fetch', vi.fn(async () => timeResponse(61_100)));

    const { result } = renderHook(() => useServerClockOffset());
    await waitFor(() => expect(result.current.synced).toBe(true));
    expect(result.current.offset).toBe(61_100 - 1100); // = 60_000
    expect(fetch).toHaveBeenCalledWith('/api/time', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('resync() fetches /api/time again and updates the offset', async () => {
    let serverNow = Date.now() + 5_000;
    vi.stubGlobal('fetch', vi.fn(async () => timeResponse(serverNow)));
    const { result } = renderHook(() => useServerClockOffset());
    await waitFor(() => expect(result.current.synced).toBe(true));
    expect(Math.abs(result.current.offset - 5_000)).toBeLessThan(200);

    serverNow = Date.now() + 90_000;
    act(() => result.current.resync());
    await waitFor(() => expect(Math.abs(result.current.offset - 90_000)).toBeLessThan(200));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('keeps offset 0 and reports an error when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    const { result } = renderHook(() => useServerClockOffset());
    await waitFor(() => expect(result.current.error).toMatch(/failed to fetch/i));
    expect(result.current).toMatchObject({ offset: 0, synced: false });
  });

  it('aborts on unmount without setting state', async () => {
    let signal;
    vi.stubGlobal(
      'fetch',
      vi.fn((_u, init) => {
        signal = init.signal;
        return new Promise(() => {});
      }),
    );
    const consoleError = vi.spyOn(console, 'error');
    const { unmount } = renderHook(() => useServerClockOffset());
    unmount();
    expect(signal.aborted).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });
});
