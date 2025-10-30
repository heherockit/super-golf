import { describe, expect, it, jest } from '@jest/globals';
// Mock NextResponse to avoid importing Next.js server runtime in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (obj: any) => ({ json: async () => obj }),
  },
}));

/**
 * E2E-style test verifying recommendations route mapping to command.
 */
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { email: 'user@example.com' } }),
}));

jest.mock('../../lib/auth', () => ({ buildAuthOptions: () => ({}) }));

jest.mock('../../features/recommendations', () => ({
  createGenerateRecommendationsCommand: () => ({
    execute: jest.fn().mockResolvedValue([{ text: 'Practice fundamentals' }]),
  }),
}));

describe('api/recommendations GET', () => {
  it('returns recommendation strings', async () => {
    const { GET } = await import('@/app/api/recommendations/route');

    const res: any = await GET();

    const json = await res.json();

    expect(json.recommendations[0]).toContain('fundamentals');
  });
});