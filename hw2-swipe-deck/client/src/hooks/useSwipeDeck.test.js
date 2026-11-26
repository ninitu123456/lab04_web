import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';
import { deckReducer, useSwipeDeck } from './useSwipeDeck.js';

const entry = (profileId, direction = 'LIKE') => ({ id: `id-${profileId}`, profileId, direction });

describe('deckReducer', () => {
  it('swipe pushes onto the stack and ignores a duplicate profile', () => {
    let state = deckReducer({ history: [], lastEvent: null }, { type: 'swipe', entry: entry('f01') });
    state = deckReducer(state, { type: 'swipe', entry: entry('f01', 'NOPE') });
    expect(state.history).toEqual([entry('f01')]);
  });

  it('undo pops the LAST entry (LIFO) without mutating the previous state', () => {
    const start = { history: [entry('f01'), entry('f02')], lastEvent: null };
    const next = deckReducer(start, { type: 'undo' });
    expect(next.history).toEqual([entry('f01')]);
    expect(next.lastEvent).toEqual({ type: 'undo', entry: entry('f02') });
    expect(start.history).toHaveLength(2);
  });

  it('undo on an empty stack is a no-op', () => {
    const start = { history: [], lastEvent: null };
    expect(deckReducer(start, { type: 'undo' })).toBe(start);
  });
});

describe('useSwipeDeck', () => {
  it('derives current card, remaining deck and score from history only', () => {
    const { result } = renderHook(() => useSwipeDeck(FIXTURE_PROFILES));
    expect(result.current.current._id).toBe('f01');
    expect(result.current.score).toBe(0);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.swipe('LIKE'));
    act(() => result.current.swipe('NOPE'));
    act(() => result.current.swipe('SUPER'));

    expect(result.current.history.map((e) => [e.profileId, e.direction])).toEqual([
      ['f01', 'LIKE'],
      ['f02', 'NOPE'],
      ['f03', 'SUPER'],
    ]);
    expect(result.current.current._id).toBe('f04');
    expect(result.current.score).toBe(10 - 5 + 20);
    expect(result.current.stats).toEqual({ LIKE: 1, NOPE: 1, SUPER: 1, total: 3 });
  });

  it('swipe 3 times then undo 2 times → cards return in reverse order', () => {
    const { result } = renderHook(() => useSwipeDeck(FIXTURE_PROFILES));
    act(() => result.current.swipe('LIKE'));
    act(() => result.current.swipe('NOPE'));
    act(() => result.current.swipe('SUPER'));

    let undone;
    act(() => {
      undone = result.current.undo();
    });
    expect(undone.profileId).toBe('f03');
    expect(result.current.current._id).toBe('f03');
    expect(result.current.score).toBe(5);

    act(() => {
      undone = result.current.undo();
    });
    expect(undone.profileId).toBe('f02');
    expect(result.current.current._id).toBe('f02');
    expect(result.current.score).toBe(10);
    expect(result.current.remaining.map((p) => p._id)).toEqual(['f02', 'f03', 'f04']);
  });

  it('swipe returns null when the deck is empty', () => {
    const { result } = renderHook(() => useSwipeDeck([]));
    let created;
    act(() => {
      created = result.current.swipe('LIKE');
    });
    expect(created).toBeNull();
    expect(result.current.history).toEqual([]);
  });
});
