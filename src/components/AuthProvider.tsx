'use client';

import { SessionProvider } from 'next-auth/react';

import type { ReactNode } from 'react';

/**
 * Wraps the app with NextAuth SessionProvider to enable client-side session access.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
