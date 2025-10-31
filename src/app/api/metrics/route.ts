import { NextResponse } from 'next/server';

/**
 * Returns lightweight metrics for the engagement widget.
 * In production, replace with real queries from your datastore.
 */
export async function GET() {
  const now = Math.floor(Date.now() / 1000);

  // Synthetic demo data; replace as needed.
  const ratingTrend = [4.0, 4.2, 4.1, 4.3, 4.5, 4.6, 4.7];

  const payload = {
    activeUsers: 128,
    tournamentsWon: 5,
    improvementRate: 62,
    averageRating: 4.6,
    ratingTrend,
    updatedAt: now,
  };

  return NextResponse.json(payload);
}