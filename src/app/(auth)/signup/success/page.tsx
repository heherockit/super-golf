import { redirect } from 'next/navigation';

import Link from 'next/link';

import { verifySuccessToken } from '@/lib/successToken';

import SignupSuccessTracker from '../../../../components/SignupSuccessTracker';

/**
 * Signup success page with gated access via token, branding, and CTA.
 * Validates token server-side to prevent direct access, and renders a responsive confirmation.
 */
export default async function SignupSuccessPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) {
  const t = typeof searchParams.t === 'string' ? searchParams.t : Array.isArray(searchParams.t) ? searchParams.t[0] : undefined;

  const payload = t ? verifySuccessToken(t, 600) : null;

  if (!payload) {
    redirect('/signup?reason=invalid_success');
  }

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10">
          <span aria-hidden="true" className="text-3xl">✅</span>
        </div>
        <h1 className="text-3xl font-semibold text-emerald">Welcome to Super Golf!</h1>
        <p className="mt-3 text-gray-700">
          Thanks for registering{payload?.email ? `, ${payload.email}` : ''}. Your account is ready.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            id="signinCta"
            className="rounded-lg bg-emerald px-6 py-2 font-semibold text-white transition-transform hover:scale-105"
          >
            Sign In
          </Link>
          <Link href="/" className="rounded-lg border px-6 py-2 font-semibold text-gray-900 hover:bg-gray-50">
            Back to Home
          </Link>
        </div>
      </div>

      <SignupSuccessTracker email={payload.email} />
    </div>
  );
}