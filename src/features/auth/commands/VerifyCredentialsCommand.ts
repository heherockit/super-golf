import { z } from 'zod';
import type { IUserRepository } from '@/features/user/repositories/UserRepository';
import { PasswordCrypto } from '../models/PasswordCrypto';

/**
 * Verifies user credentials and returns a minimal identity if valid.
 */
export class VerifyCredentialsCommand {
  constructor(private users: IUserRepository, private crypto: PasswordCrypto) {}

  /**
   * Executes credential verification. Returns identity object or null.
   */
  async execute(input: unknown): Promise<
    | { id: string; name: string; email: string; image?: string | null }
    | null
  > {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const parsed = schema.safeParse(input);

    if (!parsed.success) return null;

    const { email, password } = parsed.data;

    const user = await this.users.findByEmail(email);

    if (!user || !user.passwordHash) return null;

    const valid = await this.crypto.compare(password, user.passwordHash);

    if (!valid) return null;

    return {
      id: user.id,
      name: user.name ?? '',
      email: user.email,
      image: user.image ?? null,
    };
  }
}