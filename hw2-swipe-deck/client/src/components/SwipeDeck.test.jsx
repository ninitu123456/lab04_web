import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FIXTURE_PROFILES } from '../data/fixtureProfiles.js';
import SwipeDeck from './SwipeDeck.jsx';

function setup(props = {}) {
  const onSwipe = vi.fn();
  const user = userEvent.setup();
  render(
    <SwipeDeck profile={FIXTURE_PROFILES[0]} remaining={FIXTURE_PROFILES.length} onSwipe={onSwipe} {...props} />,
  );
  return { onSwipe, user, deck: screen.getByRole('region', { name: /bộ thẻ hồ sơ/i }), stage: screen.getByTestId('deck-stage') };
}

/** Mô phỏng kéo: pointerdown tại (0,0) → pointermove → pointerup tại (dx,dy). */
function drag(el, dx, dy) {
  fireEvent.pointerDown(el, { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: 'mouse' });
  fireEvent.pointerMove(el, { pointerId: 1, clientX: dx / 2, clientY: dy / 2, pointerType: 'mouse' });
  fireEvent.pointerUp(el, { pointerId: 1, clientX: dx, clientY: dy, pointerType: 'mouse' });
}

describe('SwipeCard rendering', () => {
  it('renders the profile as an article with image alt and a <dl>', () => {
    setup();
    const card = screen.getByRole('article', { name: 'Trần Mây Lững' });
    expect(card).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /ảnh đại diện minh hoạ của trần mây lững/i })).toHaveAttribute('width', '400');
    expect(screen.getByText('Tuổi').tagName).toBe('DT');
    expect(screen.getByText('24').tagName).toBe('DD');
  });
});

describe('SwipeDeck keyboard listener', () => {
  it.each([
    ['{ArrowLeft}', 'NOPE'],
    ['{ArrowRight}', 'LIKE'],
    ['{ArrowUp}', 'SUPER'],
  ])('%s calls onSwipe(%s)', async (key, direction) => {
    const { onSwipe, user, deck } = setup();
    deck.focus();
    await user.keyboard(key);
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith(direction);
  });

  it('ignores unrelated keys', async () => {
    const { onSwipe, user, deck } = setup();
    deck.focus();
    await user.keyboard('{ArrowDown}a{Enter}');
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('deck region is focusable and describes the shortcuts', () => {
    const { deck } = setup();
    expect(deck).toHaveAttribute('tabindex', '0');
    expect(deck).toHaveAccessibleDescription(/← bỏ qua/i);
  });
});

describe('SwipeDeck buttons', () => {
  it.each([
    [/^bỏ qua/i, 'NOPE'],
    [/^siêu thích/i, 'SUPER'],
    [/^thích/i, 'LIKE'],
  ])('button %s calls onSwipe(%s)', async (name, direction) => {
    const { onSwipe, user } = setup();
    await user.click(screen.getByRole('button', { name }));
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith(direction);
  });

  it('disables swipe buttons when there is no card, and undo when nothing to undo', () => {
    setup({ profile: undefined, remaining: 0 });
    for (const name of [/^bỏ qua/i, /^siêu thích/i, /^thích/i, /^hoàn tác/i]) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
    expect(screen.getByText(/hết thẻ/i)).toBeInTheDocument();
  });
});

describe('SwipeDeck pointer listener', () => {
  it.each([
    [80, 0, 'LIKE'],
    [-80, 0, 'NOPE'],
    [0, -80, 'SUPER'],
  ])('drag (%i, %i) beyond 50px calls onSwipe(%s)', (dx, dy, direction) => {
    const { onSwipe, stage } = setup();
    drag(stage, dx, dy);
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith(direction);
  });

  it('drag feedback: sets translate + a valid rotate angle while dragging, resets on release', () => {
    const { stage } = setup();
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: 'mouse' });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 80, clientY: 10, pointerType: 'mouse' });
    expect(stage.style.getPropertyValue('--drag-x')).toBe('80px');
    expect(stage.style.getPropertyValue('--drag-rot')).toBe('4deg'); // góc, không phải px
    expect(stage).toHaveAttribute('data-dragging', 'true');
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 80, clientY: 10, pointerType: 'mouse' });
    expect(stage.style.getPropertyValue('--drag-rot')).toBe('0deg');
    expect(stage).toHaveAttribute('data-dragging', 'false');
  });

  it('drag shorter than 50px does not swipe', () => {
    const { onSwipe, stage } = setup();
    drag(stage, 40, -30);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('pointerup without a pointerdown does not crash or swipe (slide 31 bug)', () => {
    const { onSwipe, stage } = setup();
    expect(() => fireEvent.pointerUp(stage, { pointerId: 1, clientX: 200, clientY: 0 })).not.toThrow();
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('pointer drag does nothing when the deck is empty', () => {
    const { onSwipe, stage } = setup({ profile: undefined, remaining: 0 });
    drag(stage, 120, 0);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('pointercancel aborts the drag', () => {
    const { onSwipe, stage } = setup();
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 0, clientY: 0, button: 0, pointerType: 'mouse' });
    fireEvent.pointerCancel(stage, { pointerId: 1 });
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 200, clientY: 0 });
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
