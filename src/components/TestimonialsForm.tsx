'use client';

import { useState } from 'react';

/**
 * Submission form for adding a new testimonial.
 * Validates basic fields and posts to /api/testimonials, calling onSubmitted with the result.
 */
export default function TestimonialsForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [userName, setUserName] = useState('');

  const [avatarUrl, setAvatarUrl] = useState('');

  const [rating, setRating] = useState(5);

  const [role, setRole] = useState('');

  const [feedback, setFeedback] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * Handles form submission and posts testimonial to the API.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (!userName.trim() || !feedback.trim() || rating < 1 || rating > 5) {
      setError('Please provide a name, feedback, and a rating between 1 and 5.');

      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, avatarUrl: avatarUrl || undefined, rating, feedback, role: role || undefined }),
        cache: 'no-store',
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || 'Submission failed');
      }

      // Reset the form and notify parent to refresh list
      setUserName('');

      setAvatarUrl('');

      setRating(5);

      setRole('');

      setFeedback('');

      onSubmitted();
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border p-6">
      <h3 className="text-lg font-semibold text-emerald">Share your experience</h3>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <label className="block">
        <span className="text-sm text-gray-700">Name</span>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="Your name"
          required
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Avatar URL (optional)</span>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="https://example.com/avatar.jpg"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Rating</span>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-full rounded-md border px-3 py-2"
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Role (optional)</span>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          placeholder="e.g., Mid-handicap"
        />
      </label>

      <label className="block">
        <span className="text-sm text-gray-700">Feedback</span>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2"
          rows={4}
          placeholder="Tell us what helped you most"
          required
        />
      </label>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={loading} className="rounded-md bg-emerald px-4 py-2 text-white shadow-sm hover:bg-emerald/90">
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}