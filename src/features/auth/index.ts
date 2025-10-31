import { PasswordCrypto } from './models/PasswordCrypto';

import { VerifyCredentialsCommand } from './commands/VerifyCredentialsCommand';

import { createUserRepository } from '@/features/user';

/**
 * Builds a VerifyCredentialsCommand with Prisma user repository and bcrypt crypto.
 */
export function createVerifyCredentialsCommand() {
  const users = createUserRepository();

  const crypto = new PasswordCrypto();

  return new VerifyCredentialsCommand(users, crypto);
}