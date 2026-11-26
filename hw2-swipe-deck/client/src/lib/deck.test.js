import { describe, expect, it } from 'vitest';
import { DIRECTIONS, directionFromDelta, directionFromKey } from './deck.js';

describe('directionFromKey', () => {
  it.each([
    ['ArrowLeft', 'NOPE'],
    ['ArrowRight', 'LIKE'],
    ['ArrowUp', 'SUPER'],
  ])('%s → %s', (key, expected) => {
    expect(directionFromKey(key)).toBe(expected);
  });

  it.each(['ArrowDown', 'Enter', 'a', 'Backspace', 'toString', ''])('returns null for %j', (key) => {
    expect(directionFromKey(key)).toBeNull();
  });
});

describe('directionFromDelta', () => {
  it('drag right past threshold → LIKE', () => {
    expect(directionFromDelta(51, 0)).toBe(DIRECTIONS.LIKE);
  });

  it('drag left past threshold → NOPE', () => {
    expect(directionFromDelta(-80, 10)).toBe(DIRECTIONS.NOPE);
  });

  it('drag up past threshold → SUPER', () => {
    expect(directionFromDelta(10, -60)).toBe(DIRECTIONS.SUPER);
  });

  it('diagonal drag uses the dominant axis', () => {
    expect(directionFromDelta(120, -60)).toBe(DIRECTIONS.LIKE);
    expect(directionFromDelta(-60, -120)).toBe(DIRECTIONS.SUPER);
  });

  it('exactly at or below the threshold is not a swipe', () => {
    expect(directionFromDelta(50, 0)).toBeNull();
    expect(directionFromDelta(-50, -50)).toBeNull();
    expect(directionFromDelta(0, 200)).toBeNull(); // kéo xuống không có hành động
  });

  it('respects a custom threshold and rejects non-numbers', () => {
    expect(directionFromDelta(30, 0, 20)).toBe(DIRECTIONS.LIKE);
    expect(directionFromDelta(Number.NaN, 0)).toBeNull();
  });
});
