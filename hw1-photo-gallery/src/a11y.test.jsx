import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from './test/renderRoute.jsx';

describe('Accessibility (WCAG 2.2 AA)', () => {
  it('provides a skip link to the main landmark (2.4.1 Bypass Blocks)', async () => {
    renderRoute('/');
    const skip = await screen.findByRole('link', { name: /bỏ qua tới nội dung chính/i });
    expect(skip).toHaveAttribute('href', '#main-content');
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('sets a descriptive document title per route (2.4.2 Page Titled)', async () => {
    renderRoute('/about');
    await screen.findByRole('heading', { level: 1, name: /giới thiệu/i });
    await waitFor(() => expect(document.title).toBe('Giới thiệu · UIT Evidence Gallery'));
  });

  it('title reflects the URL state of the gallery', async () => {
    renderRoute('/gallery?category=nature&photoId=p08');
    await screen.findByRole('dialog', { name: /mặt hồ/i });
    await waitFor(() =>
      expect(document.title).toBe('Mặt hồ · Thiên nhiên · Thư viện ảnh · UIT Evidence Gallery'),
    );
  });

  it('moves focus to <main> after client-side route change', async () => {
    const { user } = renderRoute('/');
    const nav = await screen.findByRole('navigation', { name: /điều hướng chính/i });

    await user.click(within(nav).getByRole('link', { name: /giới thiệu/i }));

    await screen.findByRole('heading', { level: 1, name: /giới thiệu/i });
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('every icon-only button in the lightbox has an accessible name', async () => {
    renderRoute('/gallery?photoId=p01');
    const dialog = await screen.findByRole('dialog');
    for (const button of within(dialog).getAllByRole('button')) {
      expect(button).toHaveAccessibleName();
    }
  });
});