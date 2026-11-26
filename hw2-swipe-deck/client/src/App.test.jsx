import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';
import { FIXTURE_PROFILES } from './data/fixtureProfiles.js';

/** Tên trên thẻ đang ở đầu deck. */
const currentName = () => screen.getByRole('article').querySelector('h2').textContent;

describe('App — LIFO undo stack & derived score', () => {
  it('advances to the next card after a swipe and announces it with the score', async () => {
    const user = userEvent.setup();
    render(<App profiles={FIXTURE_PROFILES} />);
    expect(currentName()).toBe('Trần Mây Lững');

    await user.click(screen.getByRole('button', { name: /^thích/i }));

    expect(currentName()).toBe('Lê Gió Thoảng');
    expect(screen.getByTestId('announcer')).toHaveTextContent('Thích: Trần Mây Lững. Điểm hiện tại: 10.');
    expect(screen.getByTestId('announcer')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByTestId('score')).toHaveTextContent('10');
  });

  it('swipe ×3 then Backspace ×2 restores cards in reverse order and updates the score', async () => {
    const user = userEvent.setup();
    render(<App profiles={FIXTURE_PROFILES} />);
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
  });

  it('undo button is disabled while the stack is empty', () => {
    render(<App profiles={FIXTURE_PROFILES} />);
    expect(screen.getByRole('button', { name: /^hoàn tác/i })).toBeDisabled();
  });

  it('shows a summary when the deck runs out, and undo brings the last card back', async () => {
    const user = userEvent.setup();
    render(<App profiles={FIXTURE_PROFILES} />);
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
