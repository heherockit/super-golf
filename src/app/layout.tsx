import '@/styles/globals.css';

import { Inter, Playfair_Display } from 'next/font/google';

import type { ReactNode } from 'react';

import AuthProvider from '@/components/AuthProvider';

import PageTransition from '@/components/PageTransition';

import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Super Golf Advising',
  description: 'Premium golf advising service with personalized recommendations',
};

/**
 * Root layout providing fonts and session context.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-gray-900">
        <AuthProvider>
          <main className="gradient-emerald text-white">
            <div className="min-h-screen bg-white/95">
              <Header />
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
