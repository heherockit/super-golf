import { generateRecommendations } from '@/lib/recommendations';

/**
 * Ensures recommendations vary by handicap and goals.
 */
test('recommendations include fundamentals for high handicap', () => {
  const recs = generateRecommendations({ handicap: 30 });

  expect(recs.some((r) => r.toLowerCase().includes('fundamentals'))).toBe(true);
});

test('distance goal adds speed training tip', () => {
  const recs = generateRecommendations({ goals: 'Increase distance' });

  expect(recs.some((r) => r.toLowerCase().includes('speed'))).toBe(true);
});
