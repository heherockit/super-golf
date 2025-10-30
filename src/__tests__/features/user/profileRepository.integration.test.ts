/**
 * Integration-ish tests for repository-model mapping using mocked Prisma client.
 * Place mock before importing the repository to ensure it takes effect.
 */
jest.mock('@/lib/prisma', () => {
  return {
    prisma: {
      profile: {
        /**
         * Mocked findUnique returning a sample profile object.
         */
        findUnique: async (_args?: unknown) => ({
          id: 'p1',
          userId: 'user@example.com',
          handicap: 10,
          goals: 'Lower scores',
          equipment: null,
          playFrequency: 'Weekly',
          onboardingCompleted: true,
          onboardingStep: 4,
        }),
        /**
         * Mocked upsert returning an updated profile object.
         */
        upsert: async (_args?: unknown) => ({
          id: 'p1',
          userId: 'user@example.com',
          handicap: 12,
          goals: 'Improve accuracy',
          equipment: 'Standard',
          playFrequency: 'Weekly',
          onboardingCompleted: true,
          onboardingStep: 4,
        }),
      },
    },
  };
});

import { describe, expect, it, jest } from '@jest/globals';
// Import the repository after mocking prisma to ensure mock is applied
const { PrismaProfileRepository } = require('@/features/user/repositories/ProfileRepository');

describe('PrismaProfileRepository', () => {
  it('finds and maps profile', async () => {
    const repo = new PrismaProfileRepository();

    const p = await repo.findByUserId('user@example.com');

    expect(p?.userId).toBe('user@example.com');
    expect(p?.onboardingCompleted).toBe(true);
  });

  it('upserts profile', async () => {
    const repo = new PrismaProfileRepository();

    const p = await repo.upsert('user@example.com', { handicap: 12 });

    expect(p.handicap).toBe(12);
  });
});