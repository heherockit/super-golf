'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { usePathname } from 'next/navigation';

import type { ReactNode } from 'react';

/**
 * Wraps children with an animated presence to provide elegant page transitions.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
