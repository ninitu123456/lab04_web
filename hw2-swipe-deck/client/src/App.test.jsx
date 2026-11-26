import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';
import { FIXTURE_PROFILES } from './data/fixtureProfiles.js';

describe('App with fixture deck', () => {
  it('advances to the next card after a swipe and announces it', async () => {
    const user = userEvent.setup();
    render(<App profiles={FIXTURE_PROFILES} />);
    expect(screen.getByRole('article', { name: 'Trần Mây Lững' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^thích/i }));

    expect(screen.getByRole('article', { name: 'Lê Gió Thoảng' })).toBeInTheDocument();
    expect(screen.getByText('Thích: Trần Mây Lững.')).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByText(`Còn ${FIXTURE_PROFILES.length - 1} thẻ`)).toBeInTheDocument();
  });
});
