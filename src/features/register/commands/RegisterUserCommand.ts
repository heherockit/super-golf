import { z } from 'zod';

import type { IUserRepository } from '@/features/user/repositories/UserRepository';

import { PasswordCrypto } from '@/features/auth/models/PasswordCrypto';

/**
 * Registers a new user with secure password hashing.
 */
export class RegisterUserCommand {
  constructor(private users: IUserRepository, private crypto: PasswordCrypto) {}

  /**
   * Executes the registration workflow including validation and uniqueness checks.
   */
  async execute(input: unknown): Promise<void> {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    });

    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      const err = new Error('Invalid input');

      (err as any).code = 'VALIDATION_ERROR';

      throw err;
    }

    const { name, email, password } = parsed.data;

    const existing = await this.users.findByEmail(email);

    if (existing) {
      const err = new Error('Email already registered');

      (err as any).code = 'CONFLICT';

      throw err;
    }

    const passwordHash = await this.crypto.hash(password);

    await this.users.create({ name, email, passwordHash });
  }
}