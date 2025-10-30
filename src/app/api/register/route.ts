import { NextResponse } from 'next/server';
import { createRegisterUserCommand } from '@/features/register';

/**
 * Handles user registration with secure password hashing.
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();

    const register = createRegisterUserCommand();

    await register.execute(json);

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Attempt to map known errors to HTTP status codes
    const code = (err as any)?.code as string | undefined;

    if (code === 'VALIDATION_ERROR') return new NextResponse('Invalid input', { status: 400 });

    if (code === 'CONFLICT') return new NextResponse('Email already registered', { status: 409 });

    return new NextResponse('Server error', { status: 500 });
  }
}
