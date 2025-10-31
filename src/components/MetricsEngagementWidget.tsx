'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { trackEvent } from '@/lib/tracking';

type Metrics = {
  activeUsers: number;
  tournamentsWon: number;
  improvementRate: number; // percentage 0-100
  averageRating: number; // e.g., 4.5
  ratingTrend: number[]; // recent ratings for sparkline
  updatedAt: number; // epoch seconds
};

/**
 * MetricsEngagementWidget displays key user metrics with accessible visuals and real-time updates.
 * It also includes a promotional banner encouraging sign up for non-registered users.
 */
export default function MetricsEngagementWidget() {
  const [metrics, setMetrics] = useState<Metrics>({
    activeUsers: 0,
    tournamentsWon: 0,
    improvementRate: 0,
    averageRating: 0,
    ratingTrend: [],
    updatedAt: Math.floor(Date.now() / 1000),
  });

  const intervalRef = useRef<number | null>(null);

  /**
   * Fetches metrics from the server and updates state, swallowing errors.
   */
  async function fetchMetrics(signal?: AbortSignal) {
    try {
      const res = await fetch('/api/metrics', { signal });

      if (!res.ok) return;

      const json = (await res.json()) as Metrics;

      setMetrics(json);
    } catch {
      // ignore errors for non-blocking UX
    }
  }

  /**
   * Initializes real-time polling with cleanup on unmount.
   */
  useEffect(() => {
    const ac = new AbortController();

    fetchMetrics(ac.signal);

    intervalRef.current = window.setInterval(() => fetchMetrics(ac.signal), 8000);

    return () => {
      ac.abort();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);

        intervalRef.current = null;
      }
    };
  }, []);

  /**
   * Computes sparkline points for the rating trend.
   */
  const sparkPath = useMemo(() => {
    const data = metrics.ratingTrend.length ? metrics.ratingTrend : [0, 0, 0, 0, 0];

    const width = 120;

    const height = 40;

    const min = Math.min(...data);

    const max = Math.max(...data);

    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;

      const y = height - ((d - min) / range) * height;

      return `${x},${y}`;
    });

    return { width, height, points: points.join(' ') };
  }, [metrics.ratingTrend]);

  const updatedLabel = useMemo(() => {
    const date = new Date(metrics.updatedAt * 1000);

    return `Last updated ${date.toLocaleTimeString()}`;
  }, [metrics.updatedAt]);

  /**
   * Handles promo CTA clicks and sends a non-blocking tracking event.
   */
  function onPromoClick() {
    trackEvent('promo_signup_click', { source: 'metrics_widget' });
  }

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-emerald">Your Metrics</h2>
          <span className="text-sm text-gray-600" role="status" aria-live="polite">
            {updatedLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Users */}
          <div className="rounded-xl border p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-emerald">Active Users</h3>
            </div>
            <p className="mt-3 text-4xl font-bold text-gray-900" aria-live="polite" aria-label="Active users count">
              {metrics.activeUsers.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-600">Live right now</p>
            <div className="mt-4 text-xs text-gray-500" title="This number updates every few seconds">Realtime indicator</div>
          </div>

          {/* Tournaments Won */}
          <div className="rounded-xl border p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md">
            <h3 className="text-lg font-semibold text-emerald">Tournaments Won</h3>
            <p className="mt-3 text-4xl font-bold text-gray-900" aria-label="Total tournaments won">
              {metrics.tournamentsWon}
            </p>
            <div className="mt-2 flex flex-wrap gap-1" aria-label="Achievement badges">
              {Array.from({ length: Math.min(metrics.tournamentsWon, 6) }).map((_, i) => (
                <span key={i} className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald/10" title="Victory badge" aria-hidden="true">🏆</span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-600">Celebrate your victories</p>
          </div>

          {/* Improvement Rate */}
          <div className="rounded-xl border p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md">
            <h3 className="text-lg font-semibold text-emerald">Improvement Rate</h3>
            <div className="mt-3 h-3 w-full rounded-full bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={metrics.improvementRate} aria-label="Improvement rate">
              <div className="h-3 rounded-full bg-emerald transition-[width]" style={{ width: `${metrics.improvementRate}%` }} />
            </div>
            <p className="mt-2 text-gray-800">
              <span className="font-semibold text-emerald">{metrics.improvementRate}%</span> over recent sessions
            </p>
            <p className="mt-1 text-sm text-gray-600">Hover for details</p>
          </div>

          {/* Average Rating + Trend */}
          <div className="rounded-xl border p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md">
            <h3 className="text-lg font-semibold text-emerald">Average Rating</h3>
            <p className="mt-3 text-4xl font-bold text-gray-900" aria-label="Average rating">
              {metrics.averageRating.toFixed(1)}
            </p>
            <div className="mt-4" role="img" aria-label="Recent rating trend">
              <svg width={sparkPath.width} height={sparkPath.height} className="text-emerald">
                <polyline
                  points={sparkPath.points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <p className="mt-1 text-sm text-gray-600">Trend over time</p>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="mt-10 rounded-2xl border bg-emerald/5 p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-emerald">Unlock the full experience</p>
              <p className="mt-1 text-gray-800">Sign up to save progress, earn badges, and receive personalized coaching.</p>
            </div>
            <Link
              href="/signup"
              onClick={onPromoClick}
              className="rounded-lg bg-emerald px-5 py-2 font-semibold text-white transition-transform hover:scale-105"
              aria-label="Sign up to unlock benefits"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}