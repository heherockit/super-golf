import { createVerifyCredentialsCommand } from '@/features/auth';

import GoogleProvider from 'next-auth/providers/google';

import CredentialsProvider from 'next-auth/providers/credentials';

import type { NextAuthOptions } from 'next-auth';

import { z } from 'zod';

/**
 * Builds NextAuth configuration with Credentials and optional Google provider.
 */
export function buildAuthOptions(): NextAuthOptions {
  const providers: NextAuthOptions['providers'] = [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const verify = createVerifyCredentialsCommand();

        // Delegate validation and verification to command layer
        const identity = await verify.execute(credentials);

        return identity;
      },
    }),
  ];

  // Conditionally add Google provider if env is available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  }

  return {
    providers,
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
    },
    jwt: {
      maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
      /**
       * Attaches user id to JWT token for future session reads.
       */
      async jwt({ token, user }) {
        if (user) token.email = user.email;

        return token;
      },
      /**
       * Projects JWT token fields into the session object.
       */
      async session({ session, token }) {
        session.user!.email = token.email as string;

        return session;
      },
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}
