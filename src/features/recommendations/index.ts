import { InMemoryProfileRepository } from '@/features/user/repositories/InMemoryProfileRepository';

import { GenerateStructuredRecommendationsCommand } from './commands/GenerateStructuredRecommendationsCommand';

import { OpenAiRepository } from './repositories/OpenAiRepository';

/**
 * Builds a GenerateStructuredRecommendationsCommand wired to OpenAiRepository.
 */
export function createGenerateStructuredRecommendationsCommand() {
  const ai = new OpenAiRepository(process.env.OPENAI_API_KEY);

  return new GenerateStructuredRecommendationsCommand(ai);
}