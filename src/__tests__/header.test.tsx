import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';

import Header from '@/components/Header';

/**
 * Validates header rendering across breakpoints and hamburger toggle semantics.
 */
describe('Header', () => {
  test('renders branding and primary navs', () => {
    render(<Header />);

    expect(screen.getByLabelText('Super Golf home')).toBeInTheDocument();

    const navs = screen.getAllByRole('navigation', { name: 'Primary' });

    expect(navs.length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Sign Up').length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Login').length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('Contact').length).toBeGreaterThanOrEqual(1);
  });

  test('hamburger toggles mobile menu aria-expanded', () => {
    render(<Header />);

    const button = screen.getByRole('button', { name: /toggle navigation/i });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(button, { key: 'Escape' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
