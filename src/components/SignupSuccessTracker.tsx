'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/lib/tracking';

/**
 * Client-side tracker for signup success and CTA clicks.
 * Sends a one-time success event on mount and tracks Sign In CTA clicks.
 */
export default function SignupSuccessTracker({ email }: { email: string }) {
  /**
   * Tracks a one-time signup success when the success page mounts.
   */
  useEffect(() => {
    trackEvent('signup_success', { email });
  }, [email]);

  /**
   * Tracks clicks on the Sign In CTA without blocking navigation.
   */
  useEffect(() => {
    const el = document.getElementById('signinCta');

    if (!el) return;

    function onClick() {
      trackEvent('signup_signin_click', { email });
    }

    el.addEventListener('click', onClick, { passive: true });

    return () => {
      el.removeEventListener('click', onClick);
    };
  }, [email]);

  return null;
}