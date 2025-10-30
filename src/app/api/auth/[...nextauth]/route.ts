import NextAuth from 'next-auth';

import { buildAuthOptions } from '@/lib/auth';

/**
 * NextAuth route handler enabling sessions and providers.
 */
const handler = NextAuth(buildAuthOptions());

export { handler as GET, handler as POST };
