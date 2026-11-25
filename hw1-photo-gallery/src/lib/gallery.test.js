import { describe, expect, it } from 'vitest';
import { CATEGORIES, PHOTOS } from '../data/photos.js';
import {
  filterPhotos,
  findPhotoById,
  getAdjacentPhotoId,
  isValidCategory,
} from './gallery.js';

describe('data contract', () => {
  it('every photo has a unique id', () => {
    const ids = PHOTOS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every photo belongs to a known category and has alt + dimensions', () => {
    for (const p of PHOTOS) {
      expect(isValidCategory(p.category)).toBe(true);
      expect(p.alt.length).toBeGreaterThan(0);
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    }
  });

  it('every category has at least one photo', () => {
    for (const c of CATEGORIES) {
      expect(filterPhotos(PHOTOS, c.id).length).toBeGreaterThan(0);
    }
  });
});

describe('filterPhotos', () => {
  it('returns all photos when no category', () => {
    expect(filterPhotos(PHOTOS, null)).toHaveLength(PHOTOS.length);
  });

  it('returns only matching photos for a valid category', () => {
    const result = filterPhotos(PHOTOS, 'nature');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === 'nature')).toBe(true);
  });

  it('returns empty list for an unknown category', () => {
    expect(filterPhotos(PHOTOS, 'does-not-exist')).toEqual([]);
  });
});

describe('findPhotoById', () => {
  it('finds an existing photo', () => {
    expect(findPhotoById(PHOTOS, 'p03')?.title).toBe('Biên bản niêm phong');
  });

  it('returns undefined for missing or empty id', () => {
    expect(findPhotoById(PHOTOS, 'nope')).toBeUndefined();
    expect(findPhotoById(PHOTOS, null)).toBeUndefined();
  });
});

describe('getAdjacentPhotoId', () => {
  const list = filterPhotos(PHOTOS, 'evidence'); // p01, p02, p03

  it('moves forward and backward', () => {
    expect(getAdjacentPhotoId(list, 'p01', 1)).toBe('p02');
    expect(getAdjacentPhotoId(list, 'p02', -1)).toBe('p01');
  });

  it('wraps around at both ends', () => {
    expect(getAdjacentPhotoId(list, 'p03', 1)).toBe('p01');
    expect(getAdjacentPhotoId(list, 'p01', -1)).toBe('p03');
  });

  it('returns undefined when current id is not in list', () => {
    expect(getAdjacentPhotoId(list, 'p10', 1)).toBeUndefined();
  });
});