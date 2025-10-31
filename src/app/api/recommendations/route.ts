import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

import { createGenerateStructuredRecommendationsCommand } from '@/features/recommendations';

/**
 * Method not allowed for recommendations. Use POST with a JSON body.
 * This endpoint now enforces body-driven requests to avoid implicit data sourcing.
 */
export async function GET() {
  return new NextResponse('Method Not Allowed. Use POST with JSON body.', { status: 405 });
}

/**
 * Handles recommendation generation via POST, reading the JSON payload from the request body.
 *
 * Input:
 * - Either a full onboarding wizard payload (preferred), or a minimal object that may include
 *   fields like `handicap`, `playFrequency`, `goals`, `equipment`, and an optional `type`.
 *
 * Output:
 * - `{ recommendations: <structured JSON> }` on success.
 *
 * Security:
 * - Requires an authenticated session.
 * - Validates that the request body is JSON and an object.
 */
export async function POST(req: Request) {
  const session = await getServerSession(buildAuthOptions());

  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const payload = await req.json().catch(() => null);

  if (!payload || typeof payload !== 'object') {
    return new NextResponse('Bad Request: JSON object required', { status: 400 });
  }

  const command = createGenerateStructuredRecommendationsCommand();

  try {
    const json = await command.execute(payload);

    return NextResponse.json({ recommendations: json });
  } catch (err) {
    return new NextResponse('Failed to generate recommendations', { status: 500 });
  }
}
