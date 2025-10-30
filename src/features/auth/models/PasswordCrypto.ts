import { compare, hash } from 'bcryptjs';

/**
 * Provides hashing and verification for passwords.
 */
export class PasswordCrypto {
  /**
   * Hashes a plain password with bcrypt.
   */
  async hash(password: string): Promise<string> {
    return hash(password, 10);
  }

  /**
   * Compares a plain password against a stored hash.
   */
  async compare(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}