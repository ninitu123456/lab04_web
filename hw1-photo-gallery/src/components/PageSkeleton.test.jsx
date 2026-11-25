import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageSkeleton from './PageSkeleton.jsx';

describe('PageSkeleton (Suspense fallback)', () => {
  it('announces loading state accessibly', () => {
    render(<PageSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent(/đang tải/i);
  });

  it('renders the requested number of placeholder cards', () => {
    const { container } = render(<PageSkeleton cards={4} />);
    expect(container.querySelectorAll('.skeleton__card')).toHaveLength(4);
  });
});