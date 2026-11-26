import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockApi } from './test/mockApi.js';
import { renderRoute } from './test/renderRoute.jsx';

let api;

beforeEach(() => {
  api = createMockApi();
  vi.stubGlobal('fetch', api.fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Tribunal portal (/)', () => {
  it('lists both dossiers with links to /dossier/:playerId and the disclaimer', async () => {
    renderRoute('/');
    const list = await screen.findByRole('list', { name: /danh sách hồ sơ/i });
    expect(within(list).getByRole('link', { name: 'Himass' })).toHaveAttribute('href', '/dossier/himass');
    expect(within(list).getByRole('link', { name: 'TanVuu' })).toHaveAttribute('href', '/dossier/tanvuu');
    expect(screen.getAllByText(/dữ liệu giả lập phục vụ bài tập/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(document.title).toBe('Cổng Tribunal · Fair-Play Appeal Tribunal'));
  });

  it('shows a skip link to <main>', async () => {
    renderRoute('/');
    expect(screen.getByRole('link', { name: /bỏ qua tới nội dung chính/i })).toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
    await screen.findByRole('list', { name: /danh sách hồ sơ/i });
  });

  it('shows an alert with retry when the list cannot load', async () => {
    vi.stubGlobal('fetch', createMockApi({ fail: { list: true } }).fetchMock);
    const { user } = renderRoute('/');
    expect(await screen.findByRole('alert')).toHaveTextContent(/không tải được dữ liệu/i);
    vi.stubGlobal('fetch', api.fetchMock);
    await user.click(screen.getByRole('button', { name: /thử lại/i }));
    expect(await screen.findByRole('list', { name: /danh sách hồ sơ/i })).toBeInTheDocument();
  });
});

describe('Dynamic dossier route /dossier/:playerId', () => {
  it('renders the Himass overview with offenses and evidence', async () => {
    renderRoute('/dossier/himass');
    expect(await screen.findByRole('heading', { level: 1, name: 'Himass' })).toBeInTheDocument();
    // Tab con cũng là lazy chunk → chờ Suspense resolve.
    expect(await screen.findByRole('heading', { name: /HM-01/ })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /bằng chứng cho HM-01/i })).toHaveTextContent('LOG-A12-2209');
    expect(api.fetchMock).toHaveBeenCalledWith('/api/dossiers/himass', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('deep link /dossier/tanvuu/matrix renders the matrix tab directly, tab marked aria-current', async () => {
    renderRoute('/dossier/tanvuu/matrix');
    const table = await screen.findByRole('table', { name: /ma trận tương xứng.*tanvuu/i });
    expect(within(table).getByRole('rowheader', { name: 'TV-02' })).toBeInTheDocument();
    const tabs = screen.getByRole('navigation', { name: /mục trong hồ sơ tanvuu/i });
    expect(within(tabs).getByRole('link', { name: /ma trận/i })).toHaveAttribute('aria-current', 'page');
    expect(within(tabs).getByRole('link', { name: /tổng quan/i })).not.toHaveAttribute('aria-current');
    await waitFor(() =>
      expect(document.title).toBe('Ma trận tương xứng · Hồ sơ TanVuu · Fair-Play Appeal Tribunal'),
    );
  });

  it('deep link /dossier/himass/matrix flags each offense with text, not only colour', async () => {
    renderRoute('/dossier/himass/matrix');
    const table = await screen.findByRole('table');
    const row = (code) => within(table).getByRole('rowheader', { name: code }).closest('tr');
    expect(row('HM-01')).toHaveTextContent(/không tương xứng/i);
    expect(row('HM-02')).toHaveTextContent(/tương xứng/i);
    expect(row('HM-03')).toHaveTextContent(/nhẹ hơn chuẩn/i);
    expect(within(table).getAllByRole('columnheader').map((th) => th.getAttribute('scope'))).toEqual(
      Array(7).fill('col'),
    );
  });

  it('switching tabs keeps the dossier and updates aria-current', async () => {
    const { user } = renderRoute('/dossier/himass');
    const tabs = await screen.findByRole('navigation', { name: /mục trong hồ sơ himass/i });
    expect(within(tabs).getByRole('link', { name: /tổng quan/i })).toHaveAttribute('aria-current', 'page');
    await user.click(within(tabs).getByRole('link', { name: /ma trận/i }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(within(tabs).getByRole('link', { name: /ma trận/i })).toHaveAttribute('aria-current', 'page');
  });

  it('unknown playerId renders the 404 boundary without calling the API', async () => {
    renderRoute('/dossier/khong-co');
    expect(await screen.findByRole('heading', { level: 1, name: /không tìm thấy hồ sơ/i })).toBeInTheDocument();
    expect(screen.getByText(/"khong-co"/)).toBeInTheDocument();
    expect(api.fetchMock).not.toHaveBeenCalledWith(expect.stringContaining('/api/dossiers/'), expect.anything());
  });

  it('a known slug that the server does not have (404) also renders the boundary', async () => {
    vi.stubGlobal('fetch', createMockApi({ dossiers: [] }).fetchMock);
    renderRoute('/dossier/himass/matrix');
    expect(await screen.findByRole('heading', { level: 1, name: /không tìm thấy hồ sơ/i })).toBeInTheDocument();
  });

  it('unknown top-level path renders the generic 404', async () => {
    renderRoute('/khong-co-trang-nay');
    expect(await screen.findByRole('heading', { level: 1, name: /không tìm thấy trang/i })).toBeInTheDocument();
  });

  it('moves focus to <main> when navigating to another page', async () => {
    const { user } = renderRoute('/');
    const nav = screen.getByRole('navigation', { name: /điều hướng chính/i });
    await user.click(within(nav).getByRole('link', { name: /hồ sơ tanvuu/i }));
    await screen.findByRole('heading', { level: 1, name: 'TanVuu' });
    expect(screen.getByRole('main')).toHaveFocus();
  });
});
