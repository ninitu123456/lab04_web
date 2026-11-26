import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { FIXTURE_PROFILES } from './data/fixtureProfiles.js';
import { SESSION_STORAGE_KEY } from './hooks/useSwipeApi.js';
import { createMockApi } from './test/mockApi.js';

const SESSION = 'session-app';

/** Tên trên thẻ đang ở đầu deck. */
const currentName = () => screen.getByRole('article').querySelector('h2').textContent;

/** Render App với API giả lập, chờ qua trạng thái loading. */
async function renderApp(options) {
  const api = createMockApi(options);
  vi.stubGlobal('fetch', api.fetchMock);
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('article');
  return { api, user };
}

beforeEach(() => {
  localStorage.setItem(SESSION_STORAGE_KEY, SESSION);
});

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('App — loading & errors', () => {
  it('shows an aria-busy skeleton while loading', async () => {
    vi.stubGlobal('fetch', createMockApi().fetchMock);
    render(<App />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    await screen.findByRole('article');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an alert with a retry button when profiles cannot be loaded', async () => {
    vi.stubGlobal('fetch', createMockApi({ fail: { profiles: true } }).fetchMock);
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/không tải được danh sách hồ sơ/i);

    vi.stubGlobal('fetch', createMockApi().fetchMock);
    await user.click(screen.getByRole('button', { name: /thử lại/i }));
    expect(await screen.findByRole('article')).toBeInTheDocument();
  });

  it('shows a dismissible alert and returns the card when a swipe cannot be saved', async () => {
    const { user } = await renderApp({ fail: { post: true } });
    await user.click(screen.getByRole('button', { name: /^thích/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/không lưu được lượt vuốt/i);
    expect(currentName()).toBe('Trần Mây Lững');

    await user.click(screen.getByRole('button', { name: /đóng thông báo lỗi/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('App — LIFO undo stack & derived score', () => {
  it('advances to the next card after a swipe and announces it with the score', async () => {
    const { user } = await renderApp();
    expect(currentName()).toBe('Trần Mây Lững');

    await user.click(screen.getByRole('button', { name: /^thích/i }));

    expect(currentName()).toBe('Lê Gió Thoảng');
    expect(screen.getByTestId('announcer')).toHaveTextContent('Thích: Trần Mây Lững. Điểm hiện tại: 10.');
    expect(screen.getByTestId('announcer')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByTestId('score')).toHaveTextContent('10');
  });

  it('swipe ×3 then Backspace ×2 restores cards in reverse order, updates score and the server', async () => {
    const { api, user } = await renderApp();
    const deck = screen.getByRole('region', { name: /bộ thẻ hồ sơ/i });
    deck.focus();

    await user.keyboard('{ArrowRight}{ArrowLeft}{ArrowUp}'); // LIKE f01, NOPE f02, SUPER f03
    expect(currentName()).toBe('Võ Sương Sớm');
    expect(screen.getByTestId('score')).toHaveTextContent('25');

    fireEvent.keyDown(deck, { key: 'Backspace' });
    expect(currentName()).toBe('Phạm Nắng Muộn');
    expect(screen.getByTestId('score')).toHaveTextContent('5');
    expect(screen.getByTestId('announcer')).toHaveTextContent(
      'Đã hoàn tác: Phạm Nắng Muộn quay lại đầu bộ thẻ. Điểm hiện tại: 5.',
    );

    fireEvent.keyDown(deck, { key: 'Backspace' });
    expect(currentName()).toBe('Lê Gió Thoảng');
    expect(screen.getByTestId('score')).toHaveTextContent('10');
    expect(screen.getByText('Còn 3 thẻ')).toBeInTheDocument();

    await waitFor(() => expect(api.db.swipes.map((s) => s.profileId)).toEqual(['f01']));
  });

  it('restores history after a reload (same sessionId)', async () => {
    await renderApp({
      swipes: [
        { _id: 's1', sessionId: SESSION, profileId: 'f01', direction: 'LIKE' },
        { _id: 's2', sessionId: SESSION, profileId: 'f02', direction: 'SUPER' },
      ],
    });
    expect(currentName()).toBe('Phạm Nắng Muộn');
    expect(screen.getByTestId('score')).toHaveTextContent('30');
    expect(screen.getByRole('button', { name: /^hoàn tác/i })).toBeEnabled();
  });

  it('undo button is disabled while the stack is empty', async () => {
    await renderApp();
    expect(screen.getByRole('button', { name: /^hoàn tác/i })).toBeDisabled();
  });

  it('shows a summary when the deck runs out, and undo brings the last card back', async () => {
    const { user } = await renderApp();
    for (let i = 0; i < FIXTURE_PROFILES.length; i += 1) {
      await user.click(screen.getByRole('button', { name: /^bỏ qua/i }));
    }
    expect(screen.getByRole('heading', { name: /hết thẻ/i })).toBeInTheDocument();
    expect(screen.getByText(/đã xem hết 4 hồ sơ: 0 thích, 0 siêu thích, 4 bỏ qua/i)).toBeInTheDocument();
    expect(screen.getByTestId('score')).toHaveTextContent('-20');

    await user.click(screen.getByRole('button', { name: /^hoàn tác/i }));
    expect(currentName()).toBe('Võ Sương Sớm');
  });
});
