import { ProfileModel } from '../models/Profile';
import { getProfilesStore } from './InMemoryStore';

/**
 * In-memory implementation of the profile repository using a process-local array.
 * Intended for development/testing without a database.
 */
export interface IProfileRepository {
  /** Finds a profile by userId (email) or returns null. */
  findByUserId(userId: string): Promise<ProfileModel | null>;

  /** Upserts profile for given userId with provided data. */
  upsert(userId: string, data: Partial<ProfileModel>): Promise<ProfileModel>;
}

/**
 * InMemoryProfileRepository stores profiles in a local array for quick prototyping.
 */
export class InMemoryProfileRepository implements IProfileRepository {
  private profiles: ProfileModel[] = getProfilesStore();

  /**
   * Finds a profile by userId from the in-memory store.
   */
  async findByUserId(userId: string): Promise<ProfileModel | null> {
    const p = this.profiles.find((x) => x.userId === userId);

    return p ?? null;
  }

  /**
   * Upserts a profile for the given userId.
   */
  async upsert(userId: string, data: Partial<ProfileModel>): Promise<ProfileModel> {
    const existing = this.profiles.find((x) => x.userId === userId);

    if (existing) {
      Object.assign(existing, data);

      return existing;
    }

    const id = `p_${Math.random().toString(36).slice(2)}`;

    const model = new ProfileModel(
      id,
      userId,
      data.handicap ?? null,
      data.goals ?? null,
      data.equipment ?? null,
      data.playFrequency ?? null,
      data.onboardingCompleted ?? false,
      data.onboardingStep ?? 0
    );

    this.profiles.push(model);

    return model;
  }
}