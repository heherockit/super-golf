import { NextResponse } from 'next/server';

import { createTestimonialsRepository } from '@/features/testimonials/repositories/TestimonialsRepository';

import type { ListParams } from '@/features/testimonials/types';

/**
 * GET /api/testimonials
 * Lists testimonials with optional query parameters for sorting, filtering, and pagination.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);

  const sortParam = url.searchParams.get('sort') as ListParams['sort'];

  const orderParam = url.searchParams.get('order') as ListParams['order'];

  const minRatingParam = url.searchParams.get('minRating');

  const pageParam = url.searchParams.get('page');

  const pageSizeParam = url.searchParams.get('pageSize');

  const repo = createTestimonialsRepository();

  const params: ListParams = {
    sort: sortParam ?? 'date',
    order: orderParam ?? 'desc',
    minRating: minRatingParam ? Math.max(1, Math.min(5, Number(minRatingParam))) : 1,
    page: pageParam ? Math.max(1, Number(pageParam)) : 1,
    pageSize: pageSizeParam ? Math.max(1, Math.min(50, Number(pageSizeParam))) : 10,
  };

  try {
    const { items, total } = await repo.list(params);

    return NextResponse.json({ items, total, ...params });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list testimonials' }, { status: 500 });
  }
}

/**
 * POST /api/testimonials
 * Creates a new testimonial from JSON body.
 */
export async function POST(req: Request) {
  const repo = createTestimonialsRepository();

  try {
    const body = await req.json();

    const userName = String(body.userName ?? '').trim();

    const avatarUrl = body.avatarUrl ? String(body.avatarUrl) : undefined;

    const rating = Number(body.rating ?? 0);

    const feedback = String(body.feedback ?? '').trim();

    const role = body.role ? String(body.role) : undefined;

    if (!userName || !feedback || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const created = await repo.create({ userName, avatarUrl, rating, feedback, role });

    return NextResponse.json({ item: created });
  } catch (_err) {
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}