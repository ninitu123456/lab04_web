import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../../data/photos.js';
import PhotoGrid, { PRIORITY_COUNT } from './PhotoGrid.jsx';

function renderGrid() {
  render(
    <MemoryRouter initialEntries={['/gallery']}>
      <PhotoGrid photos={PHOTOS} />
    </MemoryRouter>,
  );
  return screen.getAllByRole('img');
}

describe('PhotoGrid image loading strategy', () => {
  it(`loads the first ${PRIORITY_COUNT} images eagerly with high fetch priority`, () => {
    const images = renderGrid();
    images.slice(0, PRIORITY_COUNT).forEach((img) => {
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('fetchpriority', 'high');
    });
  });

  it('lazy-loads the remaining images', () => {
    const images = renderGrid();
    expect(images.length).toBeGreaterThan(PRIORITY_COUNT);
    images.slice(PRIORITY_COUNT).forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
      expect(img).not.toHaveAttribute('fetchpriority', 'high');
    });
  });

  it('gives every image explicit width and height (CLS = 0)', () => {
    renderGrid().forEach((img) => {
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
      expect(img).toHaveAttribute('decoding', 'async');
    });
  });
});
