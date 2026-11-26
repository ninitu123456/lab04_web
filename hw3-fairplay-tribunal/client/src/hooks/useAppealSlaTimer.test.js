import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { splitDuration, useAppealSlaTimer } from './useAppealSlaTimer.js';

const T0 = new Date('2026-11-26T08:00:00.000Z').getTime();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/** Giả lập trạng thái hiển thị của tab rồi bắn sự kiện visibilitychange. */
function setVisibility(state) {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
});

describe('splitDuration', () => {
  it('breaks milliseconds into d/h/m/s and clamps negatives', () => {
    expect(splitDuration(2 * 24 * HOUR + 3 * HOUR + 4 * MINUTE + 5 * SECOND + 999)).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
    expect(splitDuration(-5)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('useAppealSlaTimer — zero drift', () => {
  it('computes remaining time from the absolute clock (deadline − now)', () => {
    const { result } = renderHook(() => useAppealSlaTimer(new Date(T0 + HOUR).toISOString()));
    expect(result.current.remainingMs).toBe(HOUR);
    expect(result.current).toMatchObject({ days: 0, hours: 1, minutes: 0, seconds: 0, isExpired: false });
  });

  it('(a) system clock jumps 10 minutes while only ONE tick fires → remaining drops by exactly 10 minutes', () => {
    const { result } = renderHook(() => useAppealSlaTimer(T0 + HOUR));
    // Tab bị ẩn / máy ngủ: đồng hồ hệ thống trôi 9:59 mà không có tick nào chạy...
    vi.setSystemTime(T0 + 10 * MINUTE - SECOND);
    // ...rồi chỉ MỘT tick 1s được chạy (advanceTimersByTime cũng đẩy đồng hồ thêm 1s).
    act(() => vi.advanceTimersByTime(SECOND));

    expect(Date.now()).toBe(T0 + 10 * MINUTE);
    expect(result.current.remainingMs).toBe(HOUR - 10 * MINUTE); // cộng dồn tick sẽ ra HOUR − 1s
    expect(result.current.minutes).toBe(50);
  });

  it('a normal tick re-renders with the new absolute value', () => {
    const { result } = renderHook(() => useAppealSlaTimer(T0 + MINUTE));
    act(() => vi.advanceTimersByTime(3 * SECOND));
    expect(result.current.remainingMs).toBe(57 * SECOND);
    expect(result.current.seconds).toBe(57);
  });

  it('applies the server clock offset (server ahead by 5 minutes)', () => {
    const { result } = renderHook(() => useAppealSlaTimer(T0 + HOUR, { offset: 5 * MINUTE }));
    expect(result.current.remainingMs).toBe(55 * MINUTE);
  });

  it('(b) visibilitychange → visible calls onResync and refreshes immediately; hidden does not', () => {
    const onResync = vi.fn();
    const { result } = renderHook(() => useAppealSlaTimer(T0 + HOUR, { onResync }));

    setVisibility('hidden');
    expect(onResync).not.toHaveBeenCalled();

    vi.setSystemTime(T0 + 20 * MINUTE); // quay lại sau 20 phút, chưa có tick nào
    act(() => setVisibility('visible'));
    expect(onResync).toHaveBeenCalledOnce();
    expect(result.current.remainingMs).toBe(40 * MINUTE);
  });

  it('(c) unmount clears the interval and removes the visibilitychange listener', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const onResync = vi.fn();
    const { unmount } = renderHook(() => useAppealSlaTimer(T0 + HOUR, { onResync }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    setVisibility('visible');
    expect(onResync).not.toHaveBeenCalled();
  });

  it('(d) past the deadline → isExpired = true and remaining = 0 (no negative values)', () => {
    const { result } = renderHook(() => useAppealSlaTimer(T0 - MINUTE));
    expect(result.current).toMatchObject({ remainingMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
    expect(vi.getTimerCount()).toBe(0); // hết hạn → không giữ interval
  });

  it('crosses the deadline while ticking → expires and stops the interval', () => {
    const { result } = renderHook(() => useAppealSlaTimer(T0 + 2 * SECOND));
    act(() => vi.advanceTimersByTime(3 * SECOND));
    expect(result.current.isExpired).toBe(true);
    expect(result.current.remainingMs).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('treats an invalid deadline as expired (fail safe)', () => {
    const { result } = renderHook(() => useAppealSlaTimer('not-a-date'));
    expect(result.current.isExpired).toBe(true);
  });
});
