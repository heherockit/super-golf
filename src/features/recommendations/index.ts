import { GenerateRecommendationsCommand } from './commands/GenerateRecommendationsCommand';
import { InMemoryProfileRepository } from '@/features/user/repositories/InMemoryProfileRepository';

/**
 * Builds a GenerateRecommendationsCommand with Prisma profile repository.
 */
export function createGenerateRecommendationsCommand() {
  const profiles = new InMemoryProfileRepository();

  return new GenerateRecommendationsCommand(profiles);
}