import { RegisterUserCommand } from './commands/RegisterUserCommand';
import { PasswordCrypto } from '@/features/auth/models/PasswordCrypto';
import { createUserRepository } from '@/features/user';

/**
 * Builds a RegisterUserCommand with Prisma user repository and bcrypt crypto.
 */
export function createRegisterUserCommand() {
  const users = createUserRepository();

  const crypto = new PasswordCrypto();

  return new RegisterUserCommand(users, crypto);
}