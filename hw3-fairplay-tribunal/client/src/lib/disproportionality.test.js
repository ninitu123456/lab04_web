import { describe, expect, it } from 'vitest';
import { PENALTY_PER_SEVERITY, THRESHOLDS, computeDisproportionality, flagFor } from './disproportionality.js';

const offense = (severity, penaltyMatches, code = `C${severity}-${penaltyMatches}`) => ({
  code,
  title: code,
  severity,
  penaltyMatches,
});

describe('flagFor', () => {
  it('uses strict thresholds 1.5 / 0.67', () => {
    expect(THRESHOLDS).toEqual({ disproportionate: 1.5, lenient: 0.67 });
    expect(flagFor(1.51)).toBe('disproportionate');
    expect(flagFor(1.5)).toBe('proportionate');
    expect(flagFor(1)).toBe('proportionate');
    expect(flagFor(0.67)).toBe('proportionate');
    expect(flagFor(0.66)).toBe('lenient');
  });
});

describe('computeDisproportionality', () => {
  it('computes expected = severity × coefficient and ratio per offense', () => {
    const { rows } = computeDisproportionality([offense(2, 8), offense(1, 2), offense(3, 3)]);
    expect(PENALTY_PER_SEVERITY).toBe(2);
    expect(rows.map((r) => [r.expected, r.ratio, r.flag])).toEqual([
      [4, 2, 'disproportionate'],
      [2, 1, 'proportionate'],
      [6, 0.5, 'lenient'],
    ]);
  });

  it('keeps the original offense fields and does not mutate input', () => {
    const input = Object.freeze([Object.freeze(offense(4, 10, 'TV-01'))]);
    const { rows } = computeDisproportionality(input);
    expect(rows[0]).toMatchObject({ code: 'TV-01', severity: 4, penaltyMatches: 10, expected: 8, ratio: 1.25 });
  });

  it('aggregates totals and counts by flag', () => {
    const { totals, counts } = computeDisproportionality([offense(2, 8), offense(1, 2), offense(3, 3)]);
    expect(totals).toEqual({ expected: 12, actual: 13, ratio: 13 / 12, flag: 'proportionate' });
    expect(counts).toEqual({ disproportionate: 1, proportionate: 1, lenient: 1 });
  });

  it('supports a custom coefficient', () => {
    const { rows } = computeDisproportionality([offense(2, 8)], { perSeverity: 4 });
    expect(rows[0]).toMatchObject({ expected: 8, ratio: 1, flag: 'proportionate' });
  });

  it('handles an empty dossier', () => {
    expect(computeDisproportionality([])).toEqual({
      rows: [],
      totals: { expected: 0, actual: 0, ratio: 0, flag: 'lenient' },
      counts: { disproportionate: 0, proportionate: 0, lenient: 0 },
    });
  });
});
