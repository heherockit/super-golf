import { NextResponse } from 'next/server';

import { getServerSession } from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

import { createGenerateRecommendationsCommand } from '@/features/recommendations';

/**
 * Provides personalized recommendations derived from profile data.
 */
export async function GET() {
  const session = await getServerSession(buildAuthOptions());

  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const email = session.user?.email as string;

  const generate = createGenerateRecommendationsCommand();

  const items = await generate.execute(email);

  return NextResponse.json({ recommendations: items.map((i) => i.text) });
}
