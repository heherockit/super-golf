'use client';

import { signIn } from 'next-auth/react';

import { useState } from 'react';

import Link from 'next/link';

/**
 * Login page with real-time validation and social login.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  /**
   * Handles credentials login with basic client-side validation.
   */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (!email || !password || password.length < 8) {
      setError('Please enter a valid email and password (≥ 8 chars).');

      return;
    }

    const res = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: '/dashboard',
    });

    if (res?.error) setError('Invalid credentials.');
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-emerald">Login</h1>
      <form className="mt-6 max-w-md space-y-4" onSubmit={handleLogin}>
        <label className="block">
          <span className="font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
            required
          />
        </label>

        <label className="block">
          <span className="font-medium text-gray-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
            required
            aria-describedby="passwordHelp"
          />
          <span id="passwordHelp" className="text-sm text-gray-500">
            Minimum 8 characters.
          </span>
        </label>

        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform hover:scale-105"
        >
          Login
        </button>

        <button
          type="button"
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          Continue with Google
        </button>

        <p className="text-gray-700">
          No account?{' '}
          <Link href="/signup" className="text-emerald underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
