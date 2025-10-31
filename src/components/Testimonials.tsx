'use client';

import { useEffect, useState } from 'react';

import Testimonial from './Testimonial';

import type { TestimonialItem } from '@/features/testimonials/types';

type SortBy = 'date' | 'rating';

type SortOrder = 'asc' | 'desc';

/**
 * Testimonials renders a fixed 4-column, grid-only layout for testimonials.
 * The grid maintains exactly four columns with horizontal scrolling on smaller screens,
 * and includes filtering and sorting controls. Carousel functionality has been fully removed.
 */
export default function Testimonials() {
  const [items, setItems] = useState<TestimonialItem[]>([]);

  const [sort, setSort] = useState<SortBy>('date');

  const [order, setOrder] = useState<SortOrder>('desc');

  const [minRating, setMinRating] = useState<number>(1);

  /**
   * Fetches testimonials from the API with current filters/sort.
   * Uses AbortController to avoid updating state when requests are canceled.
   */
  async function fetchTestimonials(signal?: AbortSignal) {
    const params = new URLSearchParams({ sort, order, minRating: String(minRating), page: '1', pageSize: '100' });

    const res = await fetch(`/api/testimonials?${params.toString()}`, { cache: 'no-store', signal }).catch(() => null);

    const json = await res?.json().catch(() => ({ items: [] }));

    const list: TestimonialItem[] = json?.items ?? [];

    setItems(list);
  }

  useEffect(() => {
    const ac = new AbortController();

    fetchTestimonials(ac.signal);

    return () => ac.abort();
  }, [sort, order, minRating]);

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-semibold text-emerald">Testimonials</h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortBy)} className="rounded-md border px-2 py-1 focus:border-emerald focus:ring-emerald">
                <option value="date">Date</option>
                <option value="rating">Rating</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Order</span>
              <select value={order} onChange={(e) => setOrder(e.target.value as SortOrder)} className="rounded-md border px-2 py-1 focus:border-emerald focus:ring-emerald">
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Min Rating</span>
              <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="rounded-md border px-2 py-1 focus:border-emerald focus:ring-emerald">
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Fixed 4-column grid with horizontal scrolling on small screens to preserve readability */}
        <div className="overflow-x-auto pb-2" aria-label="Testimonials grid - 4 columns">
          <div className="grid grid-cols-[repeat(4,minmax(260px,1fr))] gap-6 sm:grid-cols-[repeat(4,minmax(280px,1fr))] lg:grid-cols-[repeat(4,minmax(300px,1fr))]">
            {items.map((t) => (
              <div key={t.id} className="h-full">
                <Testimonial name={t.userName} avatarUrl={t.avatarUrl} rating={t.rating} feedback={t.feedback} role={t.role} date={t.submittedAt} />
              </div>
            ))}
          </div>
        </div>

        {/* Submission form removed per requirement; grid-only display */}
      </div>
    </section>
  );
}