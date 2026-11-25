import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../../data/photos.js';
import { renderRoute } from '../../test/renderRoute.jsx';

/** Lấy danh sách thẻ ảnh trong lưới (đợi route lazy render xong). */
async function getPhotoItems() {
  const list = await screen.findByRole('list', { name: /danh sách ảnh/i });
  return within(list).queryAllByRole('listitem');
}

describe('Layout & navigation (React Router v7)', () => {
  it('renders primary navigation with NavLink active state', async () => {
    renderRoute('/gallery');
    const nav = await screen.findByRole('navigation', { name: /điều hướng chính/i });
    const galleryLink = within(nav).getByRole('link', { name: /thư viện/i });
    expect(galleryLink).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: /trang chủ/i })).not.toHaveAttribute(
      'aria-current',
    );
  });
});

describe('URL-driven category filter (useSearchParams)', () => {
  it('shows every photo when no category is in the URL', async () => {
    renderRoute('/gallery');
    expect(await getPhotoItems()).toHaveLength(PHOTOS.length);
    expect(screen.getByRole('status')).toHaveTextContent(`${PHOTOS.length} ảnh`);
  });

  it('deep link ?category=nature shows only nature photos', async () => {
    renderRoute('/gallery?category=nature');
    const items = await getPhotoItems();
    const expected = PHOTOS.filter((p) => p.category === 'nature');
    expect(items).toHaveLength(expected.length);
    for (const p of expected) {
      expect(screen.getByRole('img', { name: p.alt })).toBeInTheDocument();
    }
    const filters = screen.getByRole('navigation', { name: /lọc theo danh mục/i });
    expect(within(filters).getByRole('link', { name: /thiên nhiên/i })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('clicking a category writes it to the URL and re-filters', async () => {
    const { router, user } = renderRoute('/gallery');
    await getPhotoItems();
    const filters = screen.getByRole('navigation', { name: /lọc theo danh mục/i });

    await user.click(within(filters).getByRole('link', { name: /công nghệ/i }));

    expect(router.state.location.search).toBe('?category=tech');
    expect(await getPhotoItems()).toHaveLength(
      PHOTOS.filter((p) => p.category === 'tech').length,
    );

    await user.click(within(filters).getByRole('link', { name: /tất cả/i }));
    expect(router.state.location.search).toBe('');
    expect(await getPhotoItems()).toHaveLength(PHOTOS.length);
  });

  it('unknown category shows an accessible empty state', async () => {
    renderRoute('/gallery?category=khong-ton-tai');
    expect(await getPhotoItems()).toHaveLength(0);
    expect(screen.getByRole('status')).toHaveTextContent(/không tìm thấy danh mục/i);
  });
});