'use client';

import dynamic from 'next/dynamic';

import { useState } from 'react';

// Dynamic imports with explicit prop typings and relative paths to ensure TypeScript resolution
const OnboardingModal = dynamic<{ open: boolean; initialStep: number; userEmail: string; onFinished: () => void }>(
  () => import('../../components/OnboardingModal').then((m) => m.default),
  { ssr: false }
);

const RecommendationsView = dynamic<{ userEmail: string }>(
  () => import('../../components/RecommendationsView').then((m) => m.default),
  { ssr: false }
);

type Props = {
  /** Display name for greeting */
  userName: string;

  /** Current user email for caching and API calls */
  userEmail: string;

  /** Whether onboarding is completed server-side */
  onboardingCompleted: boolean;

  /** Current onboarding step index (0-4) */
  onboardingStep: number;
};

/**
 * Client-side dashboard shell. Implements two-column layout with persistent navigation,
 * triggers modal onboarding on first login, and renders the recommendations content.
 */
export default function DashboardClient({ userName, userEmail, onboardingCompleted, onboardingStep }: Props) {
  const [nav, setNav] = useState<'Recommendations' | 'Upcoming' | 'Stats'>('Recommendations');

  const [openModal, setOpenModal] = useState(!onboardingCompleted);

  /**
   * Closes the onboarding modal after completion and ensures Recommendations tab is selected.
   */
  function handleFinished() {
    setOpenModal(false);

    setNav('Recommendations');
  }

  /**
   * Accessible label for selected nav item.
   */
  function isSelected(label: string) {
    return nav === label;
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-emerald">Welcome, {userName}</h1>

      {/* Two-column responsive layout. Minimum width target via lg breakpoint. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Left Navigation Column */}
        <nav aria-label="Dashboard" className="rounded-xl border bg-white p-4 shadow-sm">
          <ul className="space-y-2">
            <li>
              <button
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors ${isSelected('Recommendations') ? 'bg-emerald/10 text-emerald' : 'text-gray-800 hover:bg-emerald/5'}`}
                aria-current={isSelected('Recommendations') ? 'page' : undefined}
                onClick={() => setNav('Recommendations')}
              >
                <span aria-hidden>🎯</span>
                <span className="font-medium">Recommendations</span>
              </button>
            </li>
            <li>
              <button className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-left text-gray-500" title="Coming soon">
                <span aria-hidden>📅</span>
                <span className="font-medium">Upcoming</span>
              </button>
            </li>
            <li>
              <button className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-left text-gray-500" title="Coming soon">
                <span aria-hidden>📈</span>
                <span className="font-medium">Stats</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Right Content Column */}
        <section className="min-h-[420px] rounded-xl border bg-white p-6 shadow-sm">
          {nav === 'Recommendations' && (
            <div>
              <h2 className="text-2xl font-semibold text-emerald">Recommendations</h2>
              <RecommendationsView userEmail={userEmail} />
            </div>
          )}
          {nav !== 'Recommendations' && (
            <div className="text-gray-600">This section will be available soon.</div>
          )}
        </section>
      </div>

      <OnboardingModal open={openModal} initialStep={onboardingStep} userEmail={userEmail} onFinished={handleFinished} />
    </div>
  );
}