'use client';

import { useEffect, useRef, useState } from 'react';

type TestimonialProps = {
  /** Customer full name to display alongside avatar */
  name: string;

  /** Optional avatar image URL. If omitted, an initial-based avatar is shown */
  avatarUrl?: string;

  /** Rating from 0 to 5 (supports half values) */
  rating: number;

  /** The feedback text provided by the customer */
  feedback: string;

  /** Optional role or short descriptor (e.g., "Scratch golfer") */
  role?: string;

  /** Optional submission date string (ISO). Shows in header if provided */
  date?: string;
};

/**
 * useInView observes an element and returns true when it enters the viewport.
 * Provides a simple trigger for appear-in animations.
 */
function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);

  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);

      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);

          observer.disconnect();
        }
      });
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, inView } as const;
}

/**
 * Renders star icons for the given rating value with accessible labeling.
 */
function RatingStars({ rating }: { rating: number }) {
  const max = 5;

  const fullStars = Math.floor(rating);

  const hasHalf = rating - fullStars >= 0.5;

  const emptyStars = max - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center" aria-label={`Rating: ${rating} out of 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className="text-emerald" aria-hidden="true">★</span>
      ))}
      {hasHalf && <span className="text-emerald" aria-hidden="true">☆</span>}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className="text-gray-300" aria-hidden="true">★</span>
      ))}
      <span className="ml-2 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

/**
 * Testimonial displays a customer avatar, name, rating, and feedback text
 * with smooth appear-in animation and responsive layout.
 */
export default function Testimonial({ name, avatarUrl, rating, feedback, role, date }: TestimonialProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '0px 0px -10% 0px' });

  return (
    <section
      ref={ref}
      className={`h-full rounded-2xl border bg-white p-6 shadow-sm transition-all duration-500 ease-out hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:ring-offset-1 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      role="article"
      aria-labelledby="testimonialTitle"
      aria-label={`Testimonial from ${name}`}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <figure className="flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${name} avatar`}
              className="h-12 w-12 rounded-full ring-1 ring-emerald/20"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald ring-1 ring-emerald/20"
              aria-label={`${name} avatar`}
            >
              {name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
          )}

          <figcaption>
            <h3 id="testimonialTitle" className="text-lg font-semibold text-emerald">
              {name}
            </h3>
            {role && <p className="text-sm text-gray-600">{role}</p>}
            {date && (
              <time className="text-xs text-gray-500" dateTime={new Date(date).toISOString()}>
                {new Date(date).toLocaleDateString()}
              </time>
            )}
          </figcaption>
        </figure>

        <div className="flex-1">
          <RatingStars rating={rating} />

          <p className="mt-3 text-gray-800">
            {feedback}
          </p>
        </div>
      </div>
    </section>
  );
}