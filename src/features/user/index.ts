import { InMemoryUserRepository } from './repositories/InMemoryUserRepository';
import { InMemoryProfileRepository } from './repositories/InMemoryProfileRepository';
import { GetUserProfileCommand } from './commands/GetUserProfileCommand';
import { UpsertUserProfileCommand } from './commands/UpsertUserProfileCommand';

/**
 * Builds a GetUserProfileCommand with Prisma repository dependencies.
 */
export function createGetUserProfileCommand() {
  const profiles = new InMemoryProfileRepository();

  return new GetUserProfileCommand(profiles);
}

/**
 * Builds an UpsertUserProfileCommand with Prisma repository dependencies.
 */
export function createUpsertUserProfileCommand() {
  const profiles = new InMemoryProfileRepository();

  return new UpsertUserProfileCommand(profiles);
}

/**
 * Exposes a factory to create a user repository for cross-feature use.
 */
export function createUserRepository() {
  return new InMemoryUserRepository();
}