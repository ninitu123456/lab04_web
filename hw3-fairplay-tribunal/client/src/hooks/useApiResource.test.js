import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useApiResource } from './useApiResource.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useApiResource (AbortController)', () => {
  it('aborts the request on unmount and never sets state afterwards', async () => {
    let signal;
    let resolve;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url, init) => {
        signal = init.signal;
        return new Promise((r) => {
          resolve = r;
        });
      }),
    );
    const consoleError = vi.spyOn(console, 'error');

    const { result, unmount } = renderHook(() => useApiResource('/api/dossiers'));
    expect(result.current.loading).toBe(true);
    unmount();
    expect(signal.aborted).toBe(true);

    resolve(new Response('[]', { status: 200 }));
    await new Promise((r) => setTimeout(r, 0));
    expect(result.current.loading).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('aborts the previous request when the URL changes (no race)', async () => {
    const signals = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, init) => {
        signals.push(init.signal);
        return new Response(JSON.stringify({ url }), { status: 200 });
      }),
    );
    const { result, rerender } = renderHook(({ url }) => useApiResource(url), { initialProps: { url: '/a' } });
    rerender({ url: '/b' });
    expect(signals[0].aborted).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual({ url: '/b' }));
  });

  it('reports 404 as notFound (not as an error)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 404 })));
    const { result } = renderHook(() => useApiResource('/api/dossiers/x'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ notFound: true, error: null, data: null });
  });
});
