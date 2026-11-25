import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../../data/photos.js';
import { renderRoute } from '../../test/renderRoute.jsx';

describe('404 route & invalid deep links', () => {
  it('unknown path renders the 404 page inside the layout', async () => {
    renderRoute('/khong-co-trang-nay');
    expect(
      await screen.findByRole('heading', { level: 1, name: /404/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('/khong-co-trang-nay')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /điều hướng chính/i })).toBeInTheDocument();
  });

  it('invalid photoId shows an alert and does not open the dialog', async () => {
    renderRoute('/gallery?photoId=zzz');
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/không tìm thấy ảnh “zzz”/i);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // Lưới vẫn hiển thị đầy đủ — lỗi chỉ ảnh hưởng phần lightbox.
    const list = screen.getByRole('list', { name: /danh sách ảnh/i });
    expect(within(list).getAllByRole('listitem')).toHaveLength(PHOTOS.length);
  });

  it('recovery link removes the bad photoId but keeps category', async () => {
    const { router, user } = renderRoute('/gallery?category=nature&photoId=zzz');
    const alert = await screen.findByRole('alert');

    await user.click(within(alert).getByRole('link', { name: /bỏ qua/i }));

    expect(router.state.location.search).toBe('?category=nature');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});