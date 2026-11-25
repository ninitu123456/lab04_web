import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../../data/photos.js';
import { renderRoute } from '../../test/renderRoute.jsx';

const byId = (id) => PHOTOS.find((p) => p.id === id);

describe('Lightbox deep link (?photoId=) with native <dialog>', () => {
  it('opens the dialog directly from a deep link', async () => {
    renderRoute('/gallery?photoId=p03');
    const dialog = await screen.findByRole('dialog', { name: byId('p03').title });

    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('img', { name: byId('p03').alt })).toBeInTheDocument();
  });

  it('keeps the category filter when both params are in the URL', async () => {
    renderRoute('/gallery?category=nature&photoId=p08');
    const dialog = await screen.findByRole('dialog', { name: byId('p08').title });
    expect(dialog).toHaveAttribute('open');

    const grid = screen.getByRole('list', { name: /danh sách ảnh/i, hidden: true });
    expect(within(grid).getAllByRole('listitem', { hidden: true })).toHaveLength(
      PHOTOS.filter((p) => p.category === 'nature').length,
    );
  });

  it('shows photo metadata as a semantic definition list', async () => {
    renderRoute('/gallery?photoId=p10');
    const dialog = await screen.findByRole('dialog', { name: byId('p10').title });
    const terms = within(dialog).getAllByRole('term').map((el) => el.textContent);
    expect(terms).toEqual(expect.arrayContaining(['Danh mục', 'Địa điểm', 'Ngày chụp']));
    expect(within(dialog).getByText(byId('p10').location)).toBeInTheDocument();
  });

  it('clicking a photo card writes photoId to the URL and preserves category', async () => {
    const { router, user } = renderRoute('/gallery?category=tech');
    const card = await screen.findByRole('link', {
      name: new RegExp(`xem ảnh lớn: ${byId('p10').title}`, 'i'),
    });

    await user.click(card);

    const params = new URLSearchParams(router.state.location.search);
    expect(params.get('category')).toBe('tech');
    expect(params.get('photoId')).toBe('p10');
    expect(await screen.findByRole('dialog', { name: byId('p10').title })).toHaveAttribute('open');
  });

  it('close button removes photoId from the URL but keeps category', async () => {
    const { router, user } = renderRoute('/gallery?category=tech&photoId=p11');
    const dialog = await screen.findByRole('dialog', { name: byId('p11').title });

    await user.click(within(dialog).getByRole('button', { name: /đóng/i }));

    await waitFor(() => expect(router.state.location.search).toBe('?category=tech'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('native close (Esc key path) also syncs back to the URL', async () => {
    const { router } = renderRoute('/gallery?photoId=p01');
    const dialog = await screen.findByRole('dialog', { name: byId('p01').title });

    // Esc trên <dialog> thật → trình duyệt gọi close() → bắn sự kiện "close".
    dialog.close();

    await waitFor(() => expect(router.state.location.search).toBe(''));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});