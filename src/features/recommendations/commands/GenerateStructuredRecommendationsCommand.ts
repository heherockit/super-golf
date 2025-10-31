import { OpenAiRepository, type StructuredRecommendations, type WizardPayload } from '../repositories/OpenAiRepository';

/**
 * Command that delegates structured recommendation generation to OpenAiRepository.
 * Accepts the full onboarding wizard payload and returns a JSON object designed
 * for downstream UI rendering and storage.
 */
export class GenerateStructuredRecommendationsCommand {
  constructor(private ai: OpenAiRepository) {}

  /**
   * Executes generation using the provided payload.
   */
  async execute(payload: WizardPayload): Promise<StructuredRecommendations> {
    return this.ai.generate(payload);
  }
}