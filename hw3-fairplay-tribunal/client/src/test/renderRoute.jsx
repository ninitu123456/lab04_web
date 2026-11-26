import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../routes.jsx';

/**
 * Render toàn bộ cây route của app tại một URL bất kỳ (giống HW1).
 * @param {string} [path]
 */
export function renderRoute(path = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const user = userEvent.setup();
  const utils = render(<RouterProvider router={router} />);
  return { router, user, ...utils };
}
