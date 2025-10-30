/**
 * Generates simple recommendations based on user handicap and goals.
 */
export function generateRecommendations(input: {
  handicap?: number;
  goals?: string;
  equipment?: string;
  playFrequency?: string;
}) {
  const recs: string[] = [];

  const h = input.handicap ?? 20;

  if (h <= 10) {
    recs.push('Focus on course management and precision wedges.');
  } else if (h <= 20) {
    recs.push('Practice consistency: mid-irons and putting drills.');
  } else {
    recs.push('Build fundamentals: driver tempo, short game basics.');
  }

  if ((input.goals || '').toLowerCase().includes('distance')) {
    recs.push('Add speed training twice weekly with supervised drills.');
  }

  if ((input.equipment || '').toLowerCase().includes('blade')) {
    recs.push('Consider cavity-back irons for forgiveness during improvement.');
  }

  return recs;
}
