import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';
import SwipeDeck from './SwipeDeck.jsx';

function setup(props = {}) {
  const onUndo = vi.fn();
  const user = userEvent.setup();
  render(
    <SwipeDeck
      profile={FIXTURE_PROFILES[0]}
      remaining={FIXTURE_PROFILES.length}
      onSwipe={vi.fn()}
      onUndo={onUndo}
      {...props}
    />,
  );
  return { onUndo, user, deck: screen.getByRole('region', { name: /bộ thẻ hồ sơ/i }) };
}

describe('SwipeDeck Backspace undo', () => {
  it('Backspace calls onUndo and prevents the browser default', () => {
    const { onUndo, deck } = setup({ canUndo: true });
    const notCancelled = fireEvent.keyDown(deck, { key: 'Backspace' });
    expect(onUndo).toHaveBeenCalledOnce();
    expect(notCancelled).toBe(false); // preventDefault() đã được gọi
  });

  it('Backspace does nothing when there is nothing to undo', () => {
    const { onUndo, deck } = setup({ canUndo: false });
    fireEvent.keyDown(deck, { key: 'Backspace' });
    expect(onUndo).not.toHaveBeenCalled();
  });

  it('Backspace inside a text field keeps its default behaviour', () => {
    const { onUndo, deck } = setup({ canUndo: true });
    const input = document.createElement('input');
    deck.append(input);
    const notCancelled = fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onUndo).not.toHaveBeenCalled();
    expect(notCancelled).toBe(true);
  });

  it('undo button calls onUndo only when canUndo is true', async () => {
    const { onUndo, user } = setup({ canUndo: true });
    await user.click(screen.getByRole('button', { name: /^hoàn tác/i }));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it('shows the custom empty state when there is no card', () => {
    setup({ profile: undefined, remaining: 0, emptyState: <p>Tổng kết</p> });
    expect(screen.getByText('Tổng kết')).toBeInTheDocument();
  });
});
