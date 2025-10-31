import { render, screen } from '@testing-library/react';

import Testimonials from '@/components/Testimonials';

/**
 * Mocks fetch to return a configurable set of testimonial items.
 */
function mockFetch(items: Array<{ id: string; userName: string; avatarUrl?: string; rating: number; feedback: string; role?: string; submittedAt: string }>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).fetch = jest.fn().mockResolvedValue({
    json: async () => ({ items }),
  });
}

describe('Testimonials grid (fixed 4 columns)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders items in a 4-column grid with overflow-x on small widths', async () => {
    const items = Array.from({ length: 8 }).map((_, i) => ({
      id: `t${i + 1}`,
      userName: `User ${i + 1}`,
      avatarUrl: undefined,
      rating: 4,
      feedback: 'Solid experience with the platform and great insights.',
      role: 'Golfer',
      submittedAt: new Date().toISOString(),
    }));

    mockFetch(items);

    render(<Testimonials />);

    const articles = await screen.findAllByRole('article');

    expect(articles.length).toBe(items.length);

    const gridWrapper = screen.getByLabelText('Testimonials grid - 4 columns');

    expect(gridWrapper).toHaveClass('overflow-x-auto');

    const grid = gridWrapper.querySelector('.grid');

    expect(grid?.className).toContain('grid-cols-[repeat(4,minmax(260px,1fr))]');
  });

  it('keeps feedback readable for long text', async () => {
    const longText = 'This is an extensively detailed testimonial that spans multiple sentences to ensure readability across different screen sizes without truncation or clipping issues.';

    const items = [
      {
        id: 'tLong',
        userName: 'Long Writer',
        avatarUrl: undefined,
        rating: 5,
        feedback: longText,
        role: 'Reviewer',
        submittedAt: new Date().toISOString(),
      },
    ];

    mockFetch(items);

    render(<Testimonials />);

    expect(await screen.findByText(/extensively detailed testimonial/i)).toBeInTheDocument();
  });

  it('handles large numbers of testimonials without crashing', async () => {
    const items = Array.from({ length: 50 }).map((_, i) => ({
      id: `t${i + 1}`,
      userName: `User ${i + 1}`,
      avatarUrl: undefined,
      rating: 3 + ((i % 3) as number),
      feedback: 'Consistent performance across many cards.',
      role: 'Golfer',
      submittedAt: new Date().toISOString(),
    }));

    mockFetch(items);

    render(<Testimonials />);

    const articles = await screen.findAllByRole('article');

    expect(articles.length).toBe(50);
  });
});