import { describe, expect, it } from '@jest/globals';
import { VerifyCredentialsCommand } from '@/features/auth/commands/VerifyCredentialsCommand';
import type { IUserRepository } from '@/features/user/repositories/UserRepository';
import { PasswordCrypto } from '@/features/auth/models/PasswordCrypto';

/**
 * Unit tests for VerifyCredentialsCommand.
 */
describe('VerifyCredentialsCommand', () => {
  class MockRepo implements IUserRepository {
    constructor(private user: any | null) {}

    async findByEmail(email: string) {
      return this.user && this.user.email === email ? this.user : null;
    }

    async create() {
      throw new Error('not implemented');
    }
  }

  class MockCrypto extends PasswordCrypto {
    async compare(password: string, hash: string) {
      return password === 'correct12' && hash === 'hashed';
    }
  }

  it('returns identity for valid credentials', async () => {
    const users = new MockRepo({
      id: 'u1',
      name: 'Test',
      email: 'user@example.com',
      passwordHash: 'hashed',
    });

    const crypto = new MockCrypto();

    const cmd = new VerifyCredentialsCommand(users, crypto);

    const identity = await cmd.execute({ email: 'user@example.com', password: 'correct12' });

    expect(identity).toMatchObject({ id: 'u1', email: 'user@example.com' });
  });

  it('returns null for invalid input', async () => {
    const users = new MockRepo(null);

    const crypto = new MockCrypto();

    const cmd = new VerifyCredentialsCommand(users, crypto);

    const identity = await cmd.execute({ email: 'bad', password: 'short' });

    expect(identity).toBeNull();
  });
});