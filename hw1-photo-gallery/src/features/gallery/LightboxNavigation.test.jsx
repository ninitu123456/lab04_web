import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../../data/photos.js';
import { renderRoute } from '../../test/renderRoute.jsx';

const byId = (id) => PHOTOS.find((p) => p.id === id);
const params = (router) => new URLSearchParams(router.state.location.search);

describe('Lightbox navigation & focus management', () => {
  it('next button moves within the filtered list and keeps category', async () => {
    const { router, user } = renderRoute('/gallery?category=nature&photoId=p08');
    const dialog = await screen.findByRole('dialog', { name: byId('p08').title });
    expect(within(dialog).getByText('Ảnh 2 / 3')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: /ảnh sau/i }));

    expect(params(router).get('photoId')).toBe('p09');
    expect(params(router).get('category')).toBe('nature');
    expect(await screen.findByRole('dialog', { name: byId('p09').title })).toBeInTheDocument();
  });

  it('ArrowLeft / ArrowRight keys navigate and wrap around', async () => {
    const { router } = renderRoute('/gallery?category=nature&photoId=p07');
    const dialog = await screen.findByRole('dialog', { name: byId('p07').title });

    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    await waitFor(() => expect(params(router).get('photoId')).toBe('p09'));

    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    await waitFor(() => expect(params(router).get('photoId')).toBe('p07'));
  });

  it('returns focus to the matching photo card after closing', async () => {
    const { user } = renderRoute('/gallery?category=tech&photoId=p10');
    const dialog = await screen.findByRole('dialog', { name: byId('p10').title });

    await user.click(within(dialog).getByRole('button', { name: /ảnh sau/i }));
    const next = await screen.findByRole('dialog', { name: byId('p11').title });
    await user.click(within(next).getByRole('button', { name: /đóng/i }));

    await waitFor(() =>
      expect(screen.getByRole('link', { name: /xem ảnh lớn: phòng máy chủ/i })).toHaveFocus(),
    );
  });
});