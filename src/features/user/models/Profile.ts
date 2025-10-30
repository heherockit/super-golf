/**
 * Domain model representing a user profile and onboarding state.
 */
export class ProfileModel {
  constructor(
    public id: string,
    public userId: string,
    public handicap: number | null,
    public goals: string | null,
    public equipment: string | null,
    public playFrequency: string | null,
    public onboardingCompleted: boolean,
    public onboardingStep: number
  ) {}

  /**
   * Maps a Prisma profile record to the domain model.
   */
  static fromPrisma(p: {
    id: string;
    userId: string;
    handicap: number | null;
    goals: string | null;
    equipment: string | null;
    playFrequency: string | null;
    onboardingCompleted: boolean;
    onboardingStep: number;
  }): ProfileModel {
    return new ProfileModel(
      p.id,
      p.userId,
      p.handicap,
      p.goals,
      p.equipment,
      p.playFrequency,
      p.onboardingCompleted,
      p.onboardingStep
    );
  }
}