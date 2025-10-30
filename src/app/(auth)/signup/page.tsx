'use client';

import dynamic from 'next/dynamic';

import { useState } from 'react';

import Link from 'next/link';

const PasswordStrength = dynamic(() => import('@/components/PasswordStrength'));

/**
 * Signup page with real-time validation and password strength meter.
 */
export default function SignupPage() {
  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Handles user registration via API with validation.
   */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    setSuccess(null);

    if (!name || !email || password.length < 8) {
      setError('Please fill all fields; password must be at least 8 characters.');

      return;
    }

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const msg = await res.text();

      setError(msg || 'Registration failed.');

      return;
    }

    setSuccess('Registration successful. You can now log in.');
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-3xl font-semibold text-emerald">Sign Up</h1>
      <form className="mt-6 max-w-md space-y-4" onSubmit={handleSignup}>
        <label className="block">
          <span className="font-medium text-gray-700">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
            required
          />
        </label>

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
            aria-describedby="passwordStrengthHelp"
          />
          <span id="passwordStrengthHelp" className="text-sm text-gray-500">
            Strong passwords include letters, numbers, and symbols.
          </span>
        </label>

        <PasswordStrength password={password} />

        {error && (
          <p className="text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald" role="status">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform hover:scale-105"
        >
          Create Account
        </button>
        <p className="text-gray-700">
          Have an account?{' '}
          <Link href="/login" className="text-emerald underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
