import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderRoute } from './test/renderRoute.jsx';

describe('App smoke test', () => {
  it('renders the home page heading at "/"', async () => {
    renderRoute('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /uit evidence gallery/i }),
    ).toBeInTheDocument();
  });
});