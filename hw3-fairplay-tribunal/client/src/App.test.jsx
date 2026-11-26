import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

describe('App scaffold', () => {
  it('renders the tribunal heading, the simulated-data disclaimer and reads the shared contract', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: /fair-play appeal tribunal/i })).toBeInTheDocument();
    expect(screen.getByText(/dữ liệu giả lập phục vụ bài tập/i)).toBeInTheDocument();
    expect(screen.getByText(/4 loại lý do/)).toBeInTheDocument();
  });
});
