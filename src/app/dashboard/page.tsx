import { getServerSession } from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

import { prisma } from '@/lib/prisma';

import dynamic from 'next/dynamic';

import { redirect } from 'next/navigation';

const DashboardClient = dynamic(() => import('./DashboardClient'));

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
    <DashboardClient
      userName={user?.name ?? (session.user?.email ?? 'User')}
      userEmail={session.user?.email ?? ''}
      onboardingCompleted={Boolean(user?.profile?.onboardingCompleted)}
      onboardingStep={user?.profile?.onboardingStep ?? 0}
    />
  );
}
