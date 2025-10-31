import { describe, expect, it } from '@jest/globals';

import { signSuccessToken, verifySuccessToken } from '@/lib/successToken';

/**
 * Verifies HMAC-signed success token generation and validation logic.
 */
describe('success token', () => {
  it('verifies valid token within max age', () => {
    const now = Math.floor(Date.now() / 1000);

    const token = signSuccessToken({ email: 'user@example.com', ts: now });

    const payload = verifySuccessToken(token, 600);

    expect(payload?.email).toBe('user@example.com');
  });

  it('rejects expired token', () => {
    const past = Math.floor(Date.now() / 1000) - 10000;

    const token = signSuccessToken({ email: 'user@example.com', ts: past });

    const payload = verifySuccessToken(token, 60);

    expect(payload).toBeNull();
  });

  it('rejects tampered token', () => {
    const now = Math.floor(Date.now() / 1000);

    const token = signSuccessToken({ email: 'user@example.com', ts: now });

    const [encoded, sig] = token.split('.');

    const originalJson = Buffer.from(encoded, 'base64url').toString('utf8');

    const modified = JSON.parse(originalJson);

    modified.email = 'attacker@example.com';

    const tamperedEncoded = Buffer.from(JSON.stringify(modified), 'utf8').toString('base64url');

    const tampered = `${tamperedEncoded}.${sig}`;

    const payload = verifySuccessToken(tampered, 600);

    expect(payload).toBeNull();
  });
});