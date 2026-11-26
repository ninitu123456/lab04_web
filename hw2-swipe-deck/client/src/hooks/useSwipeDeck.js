import { useReducer } from 'react';
import { computeScore, computeStats } from '../lib/score.js';

/**
 * STATE DUY NHẤT: `history` — một LIFO stack các lần vuốt.
 * Mọi thứ khác (thẻ hiện tại, deck còn lại, điểm, thống kê) đều DẪN XUẤT trong render.
 * `lastEvent` chỉ để soạn câu thông báo aria-live (swipe hay undo), không dùng để tính toán.
 *
 * @typedef {import('../lib/score.js').HistoryEntry} HistoryEntry
 * @typedef {{ type: 'swipe' | 'undo', entry: HistoryEntry } | null} LastEvent
 * @typedef {{ history: HistoryEntry[], lastEvent: LastEvent }} DeckState
 */

/** @type {DeckState} */
const initialState = { history: [], lastEvent: null };

/**
 * @param {DeckState} state
 * @param {{ type: 'swipe', entry: HistoryEntry } | { type: 'undo' }} action
 * @returns {DeckState}
 */
export function deckReducer(state, action) {
  switch (action.type) {
    case 'swipe': {
      // Chặn vuốt trùng một hồ sơ (vd. 2 sự kiện tới trước khi render lại).
      if (state.history.some((e) => e.profileId === action.entry.profileId)) return state;
      return { history: [...state.history, action.entry], lastEvent: { type: 'swipe', entry: action.entry } };
    }
    case 'undo': {
      const entry = state.history.at(-1);
      if (!entry) return state;
      // LIFO: pop phần tử cuối → thẻ đó quay lại đầu deck.
      return { history: state.history.slice(0, -1), lastEvent: { type: 'undo', entry } };
    }
    default:
      return state;
  }
}

/**
 * @param {readonly import('../lib/deck.js').Profile[]} profiles
 */
export function useSwipeDeck(profiles) {
  const [state, dispatch] = useReducer(deckReducer, initialState);
  const { history, lastEvent } = state;

  // ---- Derived state (tính trong render) ----
  const swipedIds = new Set(history.map((entry) => entry.profileId));
  const remaining = profiles.filter((p) => !swipedIds.has(p._id));
  const current = remaining[0];
  const score = computeScore(history);
  const stats = computeStats(history);

  /**
   * Push một lần vuốt cho thẻ hiện tại.
   * @param {import('../lib/deck.js').Direction} direction
   * @returns {HistoryEntry | null}
   */
  const swipe = (direction) => {
    if (!current) return null;
    const entry = { id: crypto.randomUUID(), profileId: current._id, direction };
    dispatch({ type: 'swipe', entry });
    return entry;
  };

  /** Pop lần vuốt gần nhất (LIFO). @returns {HistoryEntry | null} */
  const undo = () => {
    const entry = history.at(-1) ?? null;
    if (entry) dispatch({ type: 'undo' });
    return entry;
  };

  return {
    history,
    lastEvent,
    remaining,
    current,
    score,
    stats,
    canUndo: history.length > 0,
    swipe,
    undo,
  };
}
