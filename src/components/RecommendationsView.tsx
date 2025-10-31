'use client';

import { useEffect, useMemo, useState, memo } from 'react';

type Props = {
  /** Current user email for local cache keying */
  userEmail: string;
};

/**
 * Structured recommendations shape returned by the POST recommendations API
 * and cached locally under `recs_structured_{email}`.
 */
type StructuredRecommendations = {
  equipment: {
    driver: { head?: string; loft?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    iron: { head?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    wedges: { heads?: string; grind?: string; lie?: string; shaftSteel?: string; shaftGraphite?: string };
    grip: { size?: string; type?: string };
    ball: { type?: string; softness?: string };
    putter: { head?: string; length?: string; lie?: string };
  };
  gameImprovements: {
    plan: { longGame: string[]; shortGame: string[]; putting: string[] };
    extras: { trainingAids: string[]; apps: string[]; enjoymentUpgrades: string[] };
  };
  scoring: {
    handicapCalculation: { estimate: number; method: string; notes: string[] };
  };
};

/**
 * Returns scoring metrics saved during onboarding if present.
 */
function getScoring(email: string) {
  try {
    const s = window.localStorage.getItem(`onboarding_scoring_${email}`);

    return s ? (JSON.parse(s) as { fairwaysPct?: number; girPct?: number; puttsPerRound?: number; avgScore?: number }) : {};
  } catch {
    return {};
  }
}

/**
 * Retrieves structured recommendations JSON from localStorage when available.
 * Performs a minimal validation of the expected shape before returning it.
 */
function getStructuredRecommendations(email: string): StructuredRecommendations | null {
  try {
    const raw = window.localStorage.getItem(`recs_structured_${email}`);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as StructuredRecommendations;

    if (!parsed?.equipment || !parsed?.gameImprovements || !parsed?.scoring) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * refreshStructuredRecommendations
 *
 * Rehydrates the structured recommendations from localStorage for the provided
 * email and updates the component state via the supplied setter. This is used
 * when the onboarding analysis completes and an update event is dispatched.
 */
function refreshStructuredRecommendations(
  email: string,
  setter: (value: StructuredRecommendations | null) => void
) {
  try {
    const s = getStructuredRecommendations(email);

    setter(s);
  } catch {
    // ignore rehydrate errors
  }
}

/**
 * Recommendations content with Equipment, Game Improvement, and Scoring Analysis sections.
 * Uses accessible details/summary elements for collapsible panels and simple charts.
 */
export default function RecommendationsView({ userEmail }: Props) {

  const scoring = useMemo(() => getScoring(userEmail), [userEmail]);

  const [structured, setStructured] = useState<StructuredRecommendations | null>(null);

  const priorities = useMemo(() => computePriorities(structured), [structured]);

  useEffect(() => {
    let active = true;

    // Hydrate structured recommendations from local cache
    try {
      const s = getStructuredRecommendations(userEmail);

      if (active && s) setStructured(s);
    } catch {
      console.error('Failed to hydrate structured recommendations from local cache.');
    }

    return () => {
      active = false;
    };
  }, [userEmail]);

  // Listen for onboarding analysis completion and refresh structured data.
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ email: string }>).detail;

      if (!detail?.email) return;

      if (detail.email === userEmail) {
        refreshStructuredRecommendations(userEmail, setStructured);
      }
    };

    window.addEventListener('recs_structured_updated', onUpdated);

    return () => window.removeEventListener('recs_structured_updated', onUpdated);
  }, [userEmail]);

  return (
    <div className="mt-6 space-y-6">
      {/* Equipment Section */}
      <details className="rounded-lg border bg-white p-4" open>
        <summary className="cursor-pointer select-none text-lg font-semibold text-emerald">Equipment</summary>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-emerald/5 p-3">
            <h3 className="font-medium text-emerald">Driver</h3>
            <p className="text-gray-700">
              {structured ? (
                <span>
                  {structured.equipment.driver.head ?? 'Optimized head'}, loft {structured.equipment.driver.loft ?? 'n/a'}, lie {structured.equipment.driver.lie ?? 'std'},
                  shaft: {structured.equipment.driver.shaftGraphite ?? structured.equipment.driver.shaftSteel ?? 'fit to swing'}
                </span>
              ) : (
                'Optimized loft and shaft flex for launch.'
              )}
            </p>
          </div>
          <div className="rounded-md bg-emerald/5 p-3">
            <h3 className="font-medium text-emerald">Irons</h3>
            <p className="text-gray-700">
              {structured ? (
                <span>
                  {structured.equipment.iron.head ?? 'Cavity-back'}, lie {structured.equipment.iron.lie ?? 'std'},
                  shafts: {structured.equipment.iron.shaftSteel ?? structured.equipment.iron.shaftGraphite ?? 'fit to tempo'}
                </span>
              ) : (
                'Set makeup tuned for forgiveness or control.'
              )}
            </p>
          </div>
          <div className="rounded-md bg-emerald/5 p-3">
            <h3 className="font-medium text-emerald">Wedges & Grip</h3>
            <p className="text-gray-700">
              {structured ? (
                <span>
                  Wedges: {structured.equipment.wedges.heads ?? 'gapped set'}, grind {structured.equipment.wedges.grind ?? 'match turf'},
                  grip: {structured.equipment.grip.type ?? 'Rubber'} ({structured.equipment.grip.size ?? 'Standard'})
                </span>
              ) : (
                'Gapping and grip style to match swing tempo.'
              )}
            </p>
          </div>
          <div className="rounded-md bg-emerald/5 p-3">
            <h3 className="font-medium text-emerald">Ball & Putter</h3>
            <p className="text-gray-700">
              {structured ? (
                <span>
                  Ball: {structured.equipment.ball.type ?? 'Tour or Mid-compression'} ({structured.equipment.ball.softness ?? 'feel'}),
                  Putter: {structured.equipment.putter.head ?? 'Mallet'} length {structured.equipment.putter.length ?? '33–35"'} lie {structured.equipment.putter.lie ?? 'std'}
                </span>
              ) : (
                'Feel and roll consistency for scoring.'
              )}
            </p>
          </div>
        </div>
      </details>

      {/* Top Priorities Section */}
      {structured && priorities.length > 0 && (
        <details className="rounded-lg border bg-white p-4" open>
          <summary className="cursor-pointer select-none text-lg font-semibold text-emerald">Top Priorities</summary>
          <ul className="mt-3 list-decimal pl-5 text-gray-700">
            {priorities.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>
      )}

      {/* Game Improvement Section */}
      <details className="rounded-lg border bg-white p-4" open>
        <summary className="cursor-pointer select-none text-lg font-semibold text-emerald">Game Improvement</summary>
        {structured ? (
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <h4 className="font-medium text-emerald">Long Game</h4>
              <ul className="mt-2 list-disc pl-5 text-gray-700">
                {structured.gameImprovements.plan.longGame.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald">Short Game</h4>
              <ul className="mt-2 list-disc pl-5 text-gray-700">
                {structured.gameImprovements.plan.shortGame.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald">Putting</h4>
              <ul className="mt-2 list-disc pl-5 text-gray-700">
                {structured.gameImprovements.plan.putting.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-3">
              <h4 className="font-medium text-emerald">Extras</h4>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <h5 className="text-gray-800">Training Aids</h5>
                  <ul className="mt-1 list-disc pl-5 text-gray-700">
                    {structured.gameImprovements.extras.trainingAids.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-gray-800">Apps</h5>
                  <ul className="mt-1 list-disc pl-5 text-gray-700">
                    {structured.gameImprovements.extras.apps.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-gray-800">Enjoyment Upgrades</h5>
                  <ul className="mt-1 list-disc pl-5 text-gray-700">
                    {structured.gameImprovements.extras.enjoymentUpgrades.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 text-gray-700">No structured recommendations yet. Complete onboarding and analysis to get personalized advice.</div>
        )}
      </details>

      {/* Scoring Analysis Section */}
      <details className="rounded-lg border bg-white p-4" open>
        <summary className="cursor-pointer select-none text-lg font-semibold text-emerald">Scoring Analysis</summary>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <ChartMemo label="Fairways" pct={scoring.fairwaysPct ?? 0} />
          <ChartMemo label="GIR" pct={scoring.girPct ?? 0} />
          <ChartMemo label="Putts" pct={Math.max(0, Math.min(100, ((scoring.puttsPerRound ?? 36) - 18) / (45 - 18) * 100))} />
        </div>
        {structured && (
          <div className="mt-6 rounded-md bg-emerald/5 p-4">
            <h4 className="font-medium text-emerald">Handicap Estimate</h4>
            <p className="mt-1 text-gray-700">Estimate: {structured.scoring.handicapCalculation.estimate}</p>
            <p className="text-gray-700">Method: {structured.scoring.handicapCalculation.method}</p>
            <ul className="mt-2 list-disc pl-5 text-gray-700">
              {structured.scoring.handicapCalculation.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </details>
    </div>
  );
}

/**
 * Simple percentage bar chart for a metric. Memoized to avoid unnecessary re-renders.
 */
function Chart({ label, pct }: { label: string; pct: number }) {
  const width = Math.max(0, Math.min(100, Math.round(pct)));

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-800">{label}</span>
        <span className="text-sm text-gray-600">{width}%</span>
      </div>
      <div className="mt-2 h-3 w-full rounded bg-gray-200">
        <div className="h-full rounded bg-emerald transition-all duration-300" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

const ChartMemo = memo(Chart);

/**
 * Derives a short prioritized list from structured recommendations.
 * Uses the order of items in each plan as a proxy for importance.
 */
function computePriorities(structured: StructuredRecommendations | null): string[] {
  if (!structured) return [];

  const { plan, extras } = structured.gameImprovements;

  const candidates = [
    ...plan.longGame.slice(0, 2),
    ...plan.shortGame.slice(0, 2),
    ...plan.putting.slice(0, 1),
    ...extras.trainingAids.slice(0, 1),
  ];

  const seen = new Set<string>();

  const unique: string[] = [];

  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);

      unique.push(c);
    }
  }

  return unique.slice(0, 5);
}