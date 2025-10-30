import { describe, expect, it, jest } from '@jest/globals';
// Mock NextResponse to avoid importing Next.js server runtime in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (obj: any) => ({ json: async () => obj }),
  },
}));

/**
 * E2E-style tests verifying user route mapping to commands.
 */
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { email: 'user@example.com' } }),
}));

jest.mock('../../lib/auth', () => ({ buildAuthOptions: () => ({}) }));

jest.mock('../../features/user', () => ({
  createGetUserProfileCommand: () => ({ execute: jest.fn().mockResolvedValue({ userId: 'user@example.com' }) }),
  createUpsertUserProfileCommand: () => ({ execute: jest.fn().mockResolvedValue({ userId: 'user@example.com', handicap: 12 }) }),
}));

describe('api/user GET and POST', () => {
  it('GET returns profile', async () => {
    const { GET } = await import('@/app/api/user/route');

    const res: any = await GET();

    const json = await res.json();

    expect(json.profile.userId).toBe('user@example.com');
  });

  it('POST upserts profile', async () => {
    const { POST } = await import('@/app/api/user/route');

    const req = { json: async () => ({ handicap: 12 }) } as any;

    const res: any = await POST(req);

    const json = await res.json();

    expect(json.profile.handicap).toBe(12);
  });
});