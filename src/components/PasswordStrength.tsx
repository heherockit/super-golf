'use client';

import { useEffect, useState } from 'react';

/**
 * Displays password strength using lazy-loaded zxcvbn scoring.
 */
export default function PasswordStrength({ password }: { password: string }) {
  const [score, setScore] = useState<number | null>(null);

  /**
   * Computes strength score when password changes via dynamic import.
   */
  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!password) {
        setScore(null);

        return;
      }

      const { default: zxcvbn } = await import('zxcvbn');

      const res = zxcvbn(password);

      if (mounted) setScore(res.score);
    }

    run();

    return () => {
      mounted = false;
    };
  }, [password]);

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div aria-live="polite">
      {score !== null && (
        <p className="text-sm font-medium">
          Strength: <span className="text-emerald">{labels[score]}</span>
        </p>
      )}
    </div>
  );
}
