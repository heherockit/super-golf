import { describe, it, jest } from '@jest/globals';

import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';

// Mock tracking to assert non-blocking event capture
jest.mock('@/lib/tracking', () => ({
  trackEvent: jest.fn(),
}));

/**
 * Unit tests for the home engagement widget covering inputs and feedback.
 */
describe('EngagementWidget', () => {
  it('renders and updates feedback in real-time', async () => {
    const { default: EngagementWidget } = await import('@/components/EngagementWidget');

    render(<EngagementWidget />);

    // Initial feedback should be generic
    expect(screen.getByText(/Welcome golfer/i)).toBeInTheDocument();

    // Type a name
    const nameInput = screen.getByLabelText(/Your name/i);

    fireEvent.change(nameInput, { target: { value: 'Sam' } });

    const helloEl = screen.getByText(/Hello,/i);

    expect(helloEl).toHaveTextContent(/Hello,\s+Sam\./i);

    // Adjust intensity slider
    const slider = screen.getByLabelText(/Practice intensity slider/i);

    fireEvent.change(slider, { target: { value: '80' } });

    expect(screen.getByText(/Intensity: 80/i)).toBeInTheDocument();

    // Select a focus option
    const putting = screen.getByRole('radio', { name: /Putting/i });

    fireEvent.click(putting);

    const focusEl = screen.getByText(/Focus:/i);

    expect(focusEl).toHaveTextContent(/Focus:\s+Putting/i);
  });

  it('submits, shows feedback, and tracks event', async () => {
    const { default: EngagementWidget } = await import('@/components/EngagementWidget');

    const { trackEvent } = await import('@/lib/tracking');

    render(<EngagementWidget />);

    fireEvent.change(screen.getByLabelText(/Your name/i), { target: { value: 'Ava' } });

    fireEvent.click(screen.getByRole('radio', { name: /Approach/i }));

    // Move slider via keyboard to ensure accessibility
    const slider = screen.getByLabelText(/Practice intensity slider/i);

    slider.focus();

    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    fireEvent.click(screen.getByRole('button', { name: /Get practice tip/i }));

    // Feedback appears
    expect(screen.getByText(/Tip generated!/i)).toBeInTheDocument();

    // Tracking invoked with expected payload
    expect(trackEvent).toHaveBeenCalledWith('home_engagement_submit', expect.objectContaining({
      name: 'Ava',
      focus: 'Approach',
    }));
  });
});