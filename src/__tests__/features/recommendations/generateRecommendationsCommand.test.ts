import { describe, expect, it, jest } from '@jest/globals';
import { GenerateRecommendationsCommand } from '@/features/recommendations/commands/GenerateRecommendationsCommand';
import type { IProfileRepository } from '@/features/user/repositories/ProfileRepository';

/**
 * Unit tests for GenerateRecommendationsCommand.
 */
describe('GenerateRecommendationsCommand', () => {
  it('produces recommendations based on profile', async () => {
    const repo: IProfileRepository = {
      findByUserId: jest.fn().mockResolvedValue({ handicap: 30 } as any),
      upsert: jest.fn(),
    };

    const cmd = new GenerateRecommendationsCommand(repo);

    const items = await cmd.execute('user@example.com');

    expect(items.length).toBeGreaterThan(0);
  });
});