import type { TestimonialItem } from './types';

/**
 * Process-local in-memory store seeded with realistic testimonials.
 * Intended for development/testing without a persistent database.
 */
const store: TestimonialItem[] = [
  {
    id: 't1',
    userName: 'Ava Johnson',
    avatarUrl: undefined,
    rating: 5,
    feedback: 'Improved my consistency and finally broke 80! The drills are spot on.',
    role: 'Weekend golfer',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 't2',
    userName: 'Liam Chen',
    avatarUrl: undefined,
    rating: 4,
    feedback: 'Great analytics — dispersion charts helped me club down confidently.',
    role: 'Mid-handicap',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 't3',
    userName: 'Sophia Reyes',
    avatarUrl: undefined,
    rating: 5,
    feedback: 'Short game matrix is a game-changer. My up-and-down rate soared.',
    role: 'Scratch golfer',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 't4',
    userName: 'Noah Patel',
    avatarUrl: undefined,
    rating: 3,
    feedback: 'Helpful fundamentals. Would love more left-handed specific drills.',
    role: 'High-handicap',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
];

/**
 * Returns the singleton in-memory testimonials array.
 */
export function getTestimonialsStore(): TestimonialItem[] {
  return store;
}