import { describe, expect, it } from '@jest/globals';

import { RegisterUserCommand } from '@/features/register/commands/RegisterUserCommand';

import type { IUserRepository } from '@/features/user/repositories/UserRepository';

import { PasswordCrypto } from '@/features/auth/models/PasswordCrypto';

/**
 * Unit tests for RegisterUserCommand.
 */
describe('RegisterUserCommand', () => {
  class MockRepo implements IUserRepository {
    created: any | null = null;
    constructor(private existing: any | null) {}
    async findByEmail(email: string) {
      return this.existing && this.existing.email === email ? this.existing : null;
    }
    async create(data: { name: string; email: string; passwordHash: string }) {
      this.created = data;

      return {
        id: 'new',
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      } as any;
    }
  }

  class MockCrypto extends PasswordCrypto {
    async hash(password: string) {
      return `hashed(${password})`;
    }
  }

  it('creates new user with hashed password', async () => {
    const users = new MockRepo(null);

    const crypto = new MockCrypto();

    const cmd = new RegisterUserCommand(users, crypto);

    await cmd.execute({ name: 'A', email: 'a@example.com', password: 'password123' });

    expect(users.created?.passwordHash).toMatch(/^hashed\(/);
  });

  it('throws conflict when email exists', async () => {
    const users = new MockRepo({ id: '1', email: 'a@example.com', passwordHash: 'x' });

    const crypto = new MockCrypto();

    const cmd = new RegisterUserCommand(users, crypto);

    await expect(
      cmd.execute({ name: 'A', email: 'a@example.com', password: 'password123' })
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});