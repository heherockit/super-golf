import { describe, it, expect, beforeEach } from '@jest/globals';
import { createRegisterUserCommand } from '@/features/register';
import { createVerifyCredentialsCommand } from '@/features/auth';

/**
 * Integration test covering registration then credentials login using in-memory repositories.
 */
describe('In-memory registration → credentials login', () => {
  beforeEach(() => {
    // Reset shared in-memory stores between tests
    (globalThis as any).__SUPER_GOLF_STORE__ = { users: [], profiles: [] };
  });

  it('registers a user and logs in with correct password', async () => {
    const register = createRegisterUserCommand();

    await register.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: 'correct12',
    });

    const verify = createVerifyCredentialsCommand();

    const identity = await verify.execute({
      email: 'user@example.com',
      password: 'correct12',
    });

    expect(identity).toBeTruthy();
    expect(identity).toMatchObject({ email: 'user@example.com' });
  });

  it('fails login with wrong password', async () => {
    const register = createRegisterUserCommand();

    await register.execute({
      name: 'Test User',
      email: 'user@example.com',
      password: 'correct12',
    });

    const verify = createVerifyCredentialsCommand();

    const identity = await verify.execute({
      email: 'user@example.com',
      password: 'wrongpass',
    });

    expect(identity).toBeNull();
  });
});