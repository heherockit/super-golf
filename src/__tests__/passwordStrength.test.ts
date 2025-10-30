import { describe, expect, it } from '@jest/globals';

/**
 * Verifies zxcvbn scoring returns expected range.
 */
describe('password strength', () => {
  it('scores predictable short password low', async () => {
    const { default: zxcvbn } = await import('zxcvbn');

    const res = zxcvbn('12345');

    expect(res.score).toBeLessThanOrEqual(1);
  });
});
