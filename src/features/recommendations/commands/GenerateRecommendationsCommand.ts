import type { IProfileRepository } from '@/features/user/repositories/ProfileRepository';
import { generateRecommendations } from '@/lib/recommendations';
import { RecommendationModel } from '../models/Recommendation';

/**
 * Generates recommendations for the current user based on their profile.
 */
export class GenerateRecommendationsCommand {
  constructor(private profiles: IProfileRepository) {}

  /**
   * Executes recommendation generation using profile data.
   */
  async execute(userId: string): Promise<RecommendationModel[]> {
    const profile = await this.profiles.findByUserId(userId);

    const recs = generateRecommendations({
      handicap: profile?.handicap ?? undefined,
      goals: profile?.goals ?? undefined,
      equipment: profile?.equipment ?? undefined,
      playFrequency: profile?.playFrequency ?? undefined,
    });

    return recs.map((text) => new RecommendationModel(text));
  }
}