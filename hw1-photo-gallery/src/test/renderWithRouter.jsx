import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

/**
 * Render một cây component bên trong MemoryRouter để test route + search params.
 * @param {import('react').ReactElement} ui
 * @param {{ route?: string }} [options]
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}