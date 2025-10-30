import { getServerSession } from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import dynamic from 'next/dynamic';

import { redirect } from 'next/navigation';

const OnboardingWizard = dynamic(() => import('@/components/OnboardingWizard'));

/**
 * Dashboard page that greets the user and shows onboarding wizard and progress.
 */
export default async function DashboardPage() {
  const session = await getServerSession(buildAuthOptions());

  if (!session) redirect('/login');

  const userId = session.user?.email as string;

  const user = await prisma.user.findUnique({
    where: { email: userId },
    include: { profile: true },
  });

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-emerald">
        Welcome, {user?.name ?? session.user?.email}
      </h1>
      {!user?.profile?.onboardingCompleted && (
        <div className="mt-6">
          <OnboardingWizard initialStep={user?.profile?.onboardingStep ?? 0} />
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold text-emerald">Recommendations</h2>
        <Recommendations />
      </section>
    </div>
  );
}

/**
 * Server component for fetching and displaying current recommendations.
 */
async function Recommendations() {
  const res = await fetch(`${process.env.NEXTAUTH_URL ?? ''}/api/recommendations`, {
    headers: { Cookie: '' },
    cache: 'no-store',
  }).catch(() => null);

  const data = await res?.json().catch(() => ({ recommendations: [] }));

  const items: string[] = data?.recommendations ?? [];

  return (
    <ul className="mt-4 list-disc pl-5 text-gray-700">
      {items.length === 0 ? (
        <li>No recommendations yet. Complete onboarding to get personalized tips.</li>
      ) : (
        items.map((r) => <li key={r}>{r}</li>)
      )}
    </ul>
  );
}
