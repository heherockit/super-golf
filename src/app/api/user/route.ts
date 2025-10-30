import { getServerSession } from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

import { NextResponse } from 'next/server';
import { createGetUserProfileCommand, createUpsertUserProfileCommand } from '@/features/user';

/**
 * Returns current user profile data.
 */
export async function GET() {
  const session = await getServerSession(buildAuthOptions());

  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const userId = session.user?.email as string;

  const getProfile = createGetUserProfileCommand();

  const profile = await getProfile.execute(userId);

  return NextResponse.json({ profile });
}

/**
 * Updates current user profile/onboarding data.
 */
export async function POST(req: Request) {
  const session = await getServerSession(buildAuthOptions());

  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const userId = session.user?.email as string;

  const json = await req.json();

  const upsert = createUpsertUserProfileCommand();

  try {
    const updated = await upsert.execute(userId, json);

    return NextResponse.json({ profile: updated });
  } catch (err) {
    const code = (err as any)?.code as string | undefined;

    if (code === 'VALIDATION_ERROR') return new NextResponse('Invalid input', { status: 400 });

    return new NextResponse('Server error', { status: 500 });
  }
}
