'use client';

/**
 * Lightweight tracking utility for client-side events.
 * Uses sendBeacon when available to avoid blocking navigation.
 */
export function trackEvent(event: string, payload?: Record<string, unknown>) {
  try {
    const body = JSON.stringify({ event, payload, ts: Date.now() });

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });

      navigator.sendBeacon('/api/track', blob);

      return;
    }

    // Fallback: non-blocking fetch
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => void 0);
  } catch {
    // Intentionally swallow errors to avoid disrupting UX
  }
}