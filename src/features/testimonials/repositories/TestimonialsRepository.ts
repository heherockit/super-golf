import type { ListParams, TestimonialItem } from '../types';

import { getTestimonialsStore } from '../InMemoryStore';

import { prisma } from '@/lib/prisma';

/**
 * Abstraction for testimonials persistence.
 */
export interface ITestimonialsRepository {
  /** Lists testimonials with optional filtering/sorting/pagination */
  list(params?: ListParams): Promise<{ items: TestimonialItem[]; total: number }>;

  /** Creates a new testimonial entry */
  create(input: Omit<TestimonialItem, 'id' | 'submittedAt'>): Promise<TestimonialItem>;
}

/**
 * In-memory implementation using a process-local array.
 */
export class InMemoryTestimonialsRepository implements ITestimonialsRepository {
  private store = getTestimonialsStore();

  /** Lists testimonials from the in-memory store */
  async list(params?: ListParams) {
    const { sort = 'date', order = 'desc', minRating = 1, page = 1, pageSize = 10 } = params || {};

    const filtered = this.store.filter((t) => t.rating >= minRating);

    const sorted = filtered.sort((a, b) => {
      if (sort === 'rating') {
        return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }

      const ad = new Date(a.submittedAt).getTime();

      const bd = new Date(b.submittedAt).getTime();

      return order === 'asc' ? ad - bd : bd - ad;
    });

    const total = sorted.length;

    const start = (page - 1) * pageSize;

    const items = sorted.slice(start, start + pageSize);

    return { items, total };
  }

  /** Creates a testimonial in memory */
  async create(input: Omit<TestimonialItem, 'id' | 'submittedAt'>) {
    const id = `t_${Math.random().toString(36).slice(2)}`;

    const item: TestimonialItem = { ...input, id, submittedAt: new Date().toISOString() };

    this.store.push(item);

    return item;
  }
}

/**
 * Prisma-backed implementation when database is available.
 * If the table is not yet migrated, callers should catch errors and fallback.
 */
export class PrismaTestimonialsRepository implements ITestimonialsRepository {
  /** Lists testimonials via Prisma with basic filters */
  async list(params?: ListParams) {
    const { sort = 'date', order = 'desc', minRating = 1, page = 1, pageSize = 10 } = params || {};

    const orderBy = sort === 'rating' ? { rating: order } : { submittedAt: order };

    const where = { rating: { gte: minRating } } as any;

    // Use dynamic access to avoid TypeScript errors when Prisma Client types
    // are not yet generated for the Testimonial model
    const client: any = prisma;

    const testimonial = client.testimonial;

    const [items, total] = await Promise.all([
      testimonial.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      testimonial.count({ where }),
    ]);

    // Map Prisma items to shared type, ensuring ISO string dates
    const mapped: TestimonialItem[] = items.map((t: any) => ({
      id: t.id,
      userName: t.userName,
      avatarUrl: t.avatarUrl ?? undefined,
      rating: t.rating,
      feedback: t.feedback,
      role: t.role ?? undefined,
      submittedAt: t.submittedAt.toISOString(),
    }));

    return { items: mapped, total };
  }

  /** Creates a testimonial via Prisma */
  async create(input: Omit<TestimonialItem, 'id' | 'submittedAt'>) {
    // Use dynamic access to avoid TypeScript errors before Prisma generation
    const client: any = prisma;

    const testimonial = client.testimonial;

    const created = await testimonial.create({ data: input as any });

    return {
      id: created.id,
      userName: created.userName,
      avatarUrl: created.avatarUrl ?? undefined,
      rating: created.rating,
      feedback: created.feedback,
      role: created.role ?? undefined,
      submittedAt: created.submittedAt.toISOString(),
    };
  }
}

/**
 * Factory that prefers Prisma if available, otherwise falls back to in-memory.
 */
export function createTestimonialsRepository(): ITestimonialsRepository {
  // Basic detection: if prisma has Testimonial delegate, use it; otherwise fallback
  const hasPrisma = Boolean((prisma as any).testimonial);

  if (hasPrisma) {
    return new PrismaTestimonialsRepository();
  }

  return new InMemoryTestimonialsRepository();
}