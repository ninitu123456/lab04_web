import { describe, expect, it } from 'vitest';
import { SCORE_WEIGHTS, computeScore, computeStats } from './score.js';

const h = (...directions) => directions.map((direction, i) => ({ id: String(i), profileId: `p${i}`, direction }));

describe('SCORE_WEIGHTS', () => {
  it('follows the slide contract (LIKE +10, NOPE −5) plus the SUPER +20 extension', () => {
    expect(SCORE_WEIGHTS).toEqual({ LIKE: 10, NOPE: -5, SUPER: 20 });
    expect(Object.isFrozen(SCORE_WEIGHTS)).toBe(true);
  });
});

describe('computeScore', () => {
  it('is 0 for an empty history', () => {
    expect(computeScore([])).toBe(0);
  });

  it('only NOPE swipes give a negative score', () => {
    expect(computeScore(h('NOPE', 'NOPE', 'NOPE'))).toBe(-15);
  });

  it('is asymmetric: one LIKE outweighs one NOPE', () => {
    expect(computeScore(h('LIKE', 'NOPE'))).toBe(5);
  });

  it('sums a mixed history', () => {
    expect(computeScore(h('LIKE', 'SUPER', 'NOPE', 'LIKE'))).toBe(10 + 20 - 5 + 10);
  });

  it('treats unknown directions as "the rest" (−5) per the slide contract', () => {
    expect(computeScore(h('MAYBE'))).toBe(-5);
  });

  it('does not mutate the history', () => {
    const history = Object.freeze(h('LIKE'));
    expect(() => computeScore(history)).not.toThrow();
  });
});

describe('computeStats', () => {
  it('counts each direction', () => {
    expect(computeStats(h('LIKE', 'NOPE', 'SUPER', 'LIKE'))).toEqual({ LIKE: 2, NOPE: 1, SUPER: 1, total: 4 });
  });

  it('is all zeros for an empty history', () => {
    expect(computeStats([])).toEqual({ LIKE: 0, NOPE: 0, SUPER: 0, total: 0 });
  });
});
