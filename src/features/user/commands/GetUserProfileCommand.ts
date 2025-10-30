import type { IProfileRepository } from '../repositories/ProfileRepository';

/**
 * Retrieves a user's profile given their userId (email).
 */
export class GetUserProfileCommand {
  constructor(private profiles: IProfileRepository) {}

  /**
   * Executes retrieval of the profile for the given userId.
   */
  async execute(userId: string) {
    return this.profiles.findByUserId(userId);
  }
}