'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';

/**
 * Responsive site header with branding, primary navigation, and an accessible hamburger menu.
 */
export default function Header() {
  const [open, setOpen] = useState(false);

  /**
   * Toggles the mobile menu open/closed state.
   */
  function toggleMenu() {
    setOpen((o) => !o);
  }

  /**
   * Closes the menu when Escape is pressed for accessibility.
   */
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') setOpen(false);
  }

  /**
   * Ensure the menu closes on route changes to avoid stale open state.
   */
  useEffect(() => {
    const handler = () => setOpen(false);

    window.addEventListener('popstate', handler);

    return () => window.removeEventListener('popstate', handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald/20 bg-white/95 backdrop-blur">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Branding */}
          <Link href="/" className="flex items-center gap-2" aria-label="Super Golf home">
            <span className="inline-block h-8 w-8 rounded-full bg-emerald" aria-hidden="true" />
            <span className="font-semibold text-emerald">Super Golf</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="font-medium text-gray-700 transition-colors hover:text-emerald"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="font-medium text-gray-700 transition-colors hover:text-emerald"
            >
              Dashboard
            </Link>
            <Link
              href="/signup"
              className="font-medium text-gray-700 transition-colors hover:text-emerald"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="font-medium text-gray-700 transition-colors hover:text-emerald"
            >
              Login
            </Link>
            <Link
              href="#contact"
              className="font-medium text-gray-700 transition-colors hover:text-emerald"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={open}
              aria-controls="primary-navigation"
              onClick={toggleMenu}
              onKeyDown={handleKeyDown}
              className="inline-flex items-center justify-center rounded-md p-2 text-emerald transition-colors hover:bg-emerald/10"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={`${open ? 'block' : 'hidden'} md:hidden`}
        >
          <ul className="space-y-1 py-2">
            <li>
              <Link
                href="/"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-emerald/10 hover:text-emerald"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-emerald/10 hover:text-emerald"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-emerald/10 hover:text-emerald"
              >
                Sign Up
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-emerald/10 hover:text-emerald"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="#contact"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-emerald/10 hover:text-emerald"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
