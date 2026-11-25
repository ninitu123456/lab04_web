import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';
import { renderWithRouter } from './test/renderWithRouter.jsx';

describe('App smoke test', () => {
  it('renders the gallery heading', () => {
    renderWithRouter(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /uit evidence gallery/i }),
    ).toBeInTheDocument();
  });
});