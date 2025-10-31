'use client';

import { useEffect, useMemo, useState } from 'react';

import { trackEvent } from '@/lib/tracking';

/**
 * Interactive engagement component for the home page.
 * Provides a responsive, accessible UI with inputs and real-time feedback.
 * Captures user intent and sends a non-blocking tracking event on submit.
 */
export default function EngagementWidget() {
  const [name, setName] = useState('');

  const [focus, setFocus] = useState<'Driving' | 'Approach' | 'Putting'>('Driving');

  const [intensity, setIntensity] = useState<number>(50);

  const [submitted, setSubmitted] = useState(false);

  /**
   * Computes a practice tip based on selected focus and intensity.
   */
  function computeTip(f: typeof focus, i: number) {
    const level = i < 33 ? 'light' : i < 67 ? 'moderate' : 'intense';

    if (f === 'Driving') return `Prioritize tempo and balance with ${level} sessions.`;

    if (f === 'Approach') return `Dial wedges to 80% with ${level} reps for consistency.`;

    return `Sharpen short game using ${level} drills and ladder putting.`;
  }

  /**
   * Memoized tip to avoid unnecessary recomputation.
   */
  const tip = useMemo(() => computeTip(focus, intensity), [focus, intensity]);

  /**
   * Handles submission, provides real-time feedback, and sends a tracking event.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitted(true);

    trackEvent('home_engagement_submit', { name, focus, intensity });

    // Reset feedback after a short delay without blocking UI
    setTimeout(() => setSubmitted(false), 2000);
  }

  /**
   * Keyboard support: allow arrow keys to adjust the slider when focused.
   */
  function onSliderKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowLeft') setIntensity((v) => Math.max(0, v - 5));

    if (e.key === 'ArrowRight') setIntensity((v) => Math.min(100, v + 5));
  }

  /**
   * Announce changes politely for screen readers.
   */
  useEffect(() => {
    // No-op: Presence of an aria-live region below ensures announcements.
  }, [name, focus, intensity]);

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-semibold text-emerald">Practice Tuner</h3>
        <p className="mt-2 text-gray-700">Fine-tune a quick practice plan and get a tailored tip.</p>

        <form className="mt-6" onSubmit={handleSubmit} aria-label="Practice tuner form">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="engageName" className="font-medium text-gray-800">
                Your name
              </label>
              <input
                id="engageName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald"
                aria-describedby="nameHelp"
              />
              <p id="nameHelp" className="mt-1 text-sm text-gray-500">
                Optional: we’ll personalize your tip.
              </p>
            </div>

            <fieldset aria-label="Practice focus" className="sm:col-span-1">
              <legend className="font-medium text-gray-800">Focus</legend>
              <div role="radiogroup" className="mt-2 flex items-center gap-2">
                {(['Driving', 'Approach', 'Putting'] as const).map((opt) => (
                  <label key={opt} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50">
                    <input
                      type="radio"
                      name="focus"
                      value={opt}
                      checked={focus === opt}
                      onChange={() => setFocus(opt)}
                      aria-checked={focus === opt}
                      className="accent-emerald"
                    />
                    <span className="text-gray-800">{opt}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-6">
            <label htmlFor="engageIntensity" className="font-medium text-gray-800">
              Practice intensity
            </label>
            <input
              id="engageIntensity"
              type="range"
              min={0}
              max={100}
              step={1}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              onKeyDown={onSliderKeyDown}
              aria-label="Practice intensity slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={intensity}
              className="mt-2 w-full accent-emerald"
            />
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>Light</span>
              <span>Moderate</span>
              <span>Intense</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-emerald px-5 py-2 font-semibold text-white transition-transform hover:scale-105"
              aria-label="Get practice tip"
            >
              Get Tip
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');

                setFocus('Driving');

                setIntensity(50);
              }}
              className="rounded-lg border px-5 py-2 font-semibold text-gray-900 hover:bg-gray-50"
              aria-label="Reset inputs"
            >
              Reset
            </button>
            {submitted && (
              <span className="text-sm font-medium text-emerald" role="status" aria-live="polite">
                Tip generated!
              </span>
            )}
          </div>

          <div
            className="mt-6 rounded-lg border bg-gray-50 p-4"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="text-sm text-gray-700">
              {name ? (
                <span>
                  Hello, <span className="font-semibold text-emerald">{name}</span>.
                </span>
              ) : (
                <span>Welcome golfer.</span>
              )}
            </p>
            <p className="mt-2 text-gray-800">
              Focus: <span className="font-medium text-emerald">{focus}</span>. Intensity: {intensity}.
            </p>
            <p className="mt-2 font-medium text-gray-900">Tip: {tip}</p>
          </div>
        </form>
      </div>
    </section>
  );
}