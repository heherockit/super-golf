import { describe, expect, it, jest } from '@jest/globals';

import { UpsertUserProfileCommand } from '@/features/user/commands/UpsertUserProfileCommand';

import type { IProfileRepository } from '@/features/user/repositories/ProfileRepository';

/**
 * Unit tests for UpsertUserProfileCommand.
 */
describe('UpsertUserProfileCommand', () => {
  it('throws validation error for bad input', async () => {
    const repo: IProfileRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn(),
    };

    const cmd = new UpsertUserProfileCommand(repo);

    await expect(cmd.execute('user@example.com', { handicap: -1 })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    } as any);
  });

  it('upserts with valid data', async () => {
    const repo: IProfileRepository = {
      findByUserId: jest.fn(),
      upsert: jest.fn().mockResolvedValue({ userId: 'user@example.com' } as any),
    };

    const cmd = new UpsertUserProfileCommand(repo);

    const res = await cmd.execute('user@example.com', {
      handicap: 12,
      goals: 'Improve accuracy',
      onboardingCompleted: true,
      onboardingStep: 4,
    });

    expect(res).toBeTruthy();

    expect((repo.upsert as any).mock.calls[0][0]).toBe('user@example.com');
  });
});