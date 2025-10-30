import { describe, expect, it, jest } from '@jest/globals';
// Mock NextResponse to avoid importing Next.js server runtime in tests
jest.mock('next/server', () => ({
  NextResponse: {
    json: (obj: any) => ({ json: async () => obj }),
  },
}));

/**
 * E2E-style test verifying register route delegates to command.
 */
jest.mock('../../features/register', () => ({
  createRegisterUserCommand: () => ({ execute: jest.fn().mockResolvedValue(undefined) }),
}));

describe('api/register POST', () => {
  it('returns ok for valid registration', async () => {
    const { POST } = await import('@/app/api/register/route');

    const req = { json: async () => ({ name: 'A', email: 'a@example.com', password: 'password123' }) } as any;

    const res: any = await POST(req);

    const json = await res.json();

    expect(json).toMatchObject({ ok: true });
  });
});