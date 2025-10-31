import { z } from 'zod';

import type { IProfileRepository } from '../repositories/ProfileRepository';

/**
 * Validates and upserts a user's profile data.
 */
export class UpsertUserProfileCommand {
  constructor(private profiles: IProfileRepository) {}

  /**
   * Executes upsert with validation for the provided userId and data.
   */
  async execute(userId: string, data: unknown) {
    const schema = z.object({
      handicap: z.number().int().min(0).max(54).nullable().optional(),
      goals: z.string().max(500).nullable().optional(),
      equipment: z.string().max(500).nullable().optional(),
      playFrequency: z.string().max(100).nullable().optional(),
      onboardingCompleted: z.boolean().default(false).optional(),
      onboardingStep: z.number().int().min(0).default(0).optional(),
    });

    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      const err = new Error('Invalid input');

      (err as any).code = 'VALIDATION_ERROR';

      throw err;
    }

    return this.profiles.upsert(userId, parsed.data);
  }
}