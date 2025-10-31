import { NextResponse } from 'next/server';

/**
 * Accepts client-side tracking events and responds quickly without heavy processing.
 */
export async function POST(req: Request) {
  try {
    // Read and discard to allow minimal validation in the future.
    await req.text();

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}