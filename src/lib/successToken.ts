import crypto from 'crypto';

/**
 * Signs and verifies short-lived success tokens used to gate access to the signup success page.
 * Tokens are HMAC-SHA256 signatures over a compact payload containing email and timestamp.
 */
export type SuccessTokenPayload = {
  email: string;
  ts: number;
};

/**
 * Returns the secret used for signing. Prefers `SIGNUP_SUCCESS_SECRET`, falls back to `NEXTAUTH_SECRET`.
 */
function getSecret(): string {
  const secret = process.env.SIGNUP_SUCCESS_SECRET || process.env.NEXTAUTH_SECRET || '';

  if (!secret) {
    // Use a dev-only fallback to avoid breaking local environments without secrets.
    // In production, ensure one of the secrets is set.
    return 'dev-fallback-secret-change-me';
  }

  return secret;
}

/**
 * Creates a base64-encoded token combining the payload and HMAC signature.
 * The token format is: base64(JSON(payload)) + "." + hex(HMAC(payloadJson))
 */
export function signSuccessToken(payload: SuccessTokenPayload): string {
  const secret = getSecret();

  const payloadJson = JSON.stringify(payload);

  const hmac = crypto.createHmac('sha256', secret);

  hmac.update(payloadJson);

  const signature = hmac.digest('hex');

  const encoded = Buffer.from(payloadJson, 'utf8').toString('base64url');

  return `${encoded}.${signature}`;
}

/**
 * Verifies a token and returns the decoded payload if valid and within maxAgeSec.
 * Returns null when the token is invalid or expired.
 */
export function verifySuccessToken(token: string, maxAgeSec: number): SuccessTokenPayload | null {
  try {
    const secret = getSecret();

    const [encoded, signature] = token.split('.');

    if (!encoded || !signature) return null;

    const payloadJson = Buffer.from(encoded, 'base64url').toString('utf8');

    const expected = crypto.createHmac('sha256', secret).update(payloadJson).digest('hex');

    if (expected !== signature) return null;

    const payload = JSON.parse(payloadJson) as SuccessTokenPayload;

    const ageSec = Math.floor(Date.now() / 1000) - payload.ts;

    if (ageSec < 0 || ageSec > maxAgeSec) return null;

    return payload;
  } catch {
    return null;
  }
}