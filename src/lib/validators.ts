import { z } from 'zod';

/**
 * Zod schema for user registration input validation.
 */
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Zod schema for onboarding profile data validation.
 */
export const profileSchema = z.object({
  handicap: z.number().int().min(0).max(54).optional(),
  goals: z.string().min(2).max(500).optional(),
  equipment: z.string().min(2).max(500).optional(),
  playFrequency: z.string().min(2).max(100).optional(),
  onboardingStep: z.number().int().min(0).max(5).optional(),
  onboardingCompleted: z.boolean().optional(),
});
