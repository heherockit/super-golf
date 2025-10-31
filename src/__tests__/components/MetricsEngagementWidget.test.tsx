import { describe, it, jest } from '@jest/globals';

import '@testing-library/jest-dom';

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

jest.mock('@/lib/tracking', () => ({
  trackEvent: jest.fn(),
}));

/**
 * Creates a typed fetch mock that returns an object with ok/json.
 */
function makeOkJsonFetchMock(payload: any) {
  return jest.fn((_input?: any, _init?: any) =>
    Promise.resolve({ ok: true, json: async () => payload } as any)
  );
}

/**
 * Unit tests for metrics engagement widget verifying rendering, updates, and CTA tracking.
 */
describe('MetricsEngagementWidget', () => {
  it('renders metrics and updates from API', async () => {
    const { default: MetricsEngagementWidget } = await import('@/components/MetricsEngagementWidget');

    // Typed fetch mock returning a proper Response
    const mockPayload = {
      activeUsers: 128,
      tournamentsWon: 5,
      improvementRate: 62,
      averageRating: 4.6,
      ratingTrend: [4.0, 4.2, 4.1, 4.3, 4.5],
      updatedAt: Math.floor(Date.now() / 1000),
    };

    const mockFetch = makeOkJsonFetchMock(mockPayload);

    globalThis.fetch = mockFetch as unknown as typeof fetch;

    jest.useFakeTimers();

    render(<MetricsEngagementWidget />);

    // Strict mode may abort the first fetch; advance timers to trigger polling
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });

    // Ensure fetch was called at least once
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Flush pending microtasks from fetch/json before assertions
    await act(async () => {
      await Promise.resolve();

      await Promise.resolve();
    });

    // Wait for fetch-driven state update
    await waitFor(() => {
      expect(screen.getByLabelText(/Active users count/i)).toHaveTextContent('128');

      expect(screen.getByLabelText(/Total tournaments won/i)).toHaveTextContent('5');

      expect(screen.getByLabelText(/Improvement rate/i)).toHaveAttribute('aria-valuenow', '62');

      expect(screen.getByLabelText(/Average rating/i)).toHaveTextContent('4.6');
    });

    // Trigger polling interval
    await act(async () => {
      jest.advanceTimersByTime(8000);
    });

    await waitFor(() => {
      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    jest.useRealTimers();
  });

  it('tracks promo CTA clicks', async () => {
    const { default: MetricsEngagementWidget } = await import('@/components/MetricsEngagementWidget');

    const { trackEvent } = await import('@/lib/tracking');

    // Ensure fetch is defined for component mount with a typed mock
    const mockPayload = {
      activeUsers: 120,
      tournamentsWon: 4,
      improvementRate: 55,
      averageRating: 4.4,
      ratingTrend: [4.0, 4.2, 4.1, 4.3, 4.4],
      updatedAt: Math.floor(Date.now() / 1000),
    };

    const mockFetch = makeOkJsonFetchMock(mockPayload);

    globalThis.fetch = mockFetch as unknown as typeof fetch;

    render(<MetricsEngagementWidget />);

    const cta = screen.getByRole('link', { name: /Sign up to unlock benefits/i });

    fireEvent.click(cta);

    expect(trackEvent).toHaveBeenCalledWith('promo_signup_click', expect.objectContaining({ source: 'metrics_widget' }));
  });
});