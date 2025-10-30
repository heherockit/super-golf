'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';

import ProgressSteps from '@/components/ProgressSteps';

type StepData = {
  handicap?: number;
  playFrequency?: string;
  goals?: string;
  equipment?: string;
};

/**
 * Multi-step onboarding wizard to capture profile data.
 */
export default function OnboardingWizard({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(initialStep);

  const [data, setData] = useState<StepData>({});

  const steps = ['Basics', 'Play Style', 'Goals', 'Equipment'];

  /**
   * Persists current onboarding progress to the server API.
   */
  async function saveProgress(payload: Partial<StepData>, completed = false) {
    const body = { ...data, ...payload, onboardingStep: step, onboardingCompleted: completed };

    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  /**
   * Advances to the next step and saves progress.
   */
  async function next() {
    await saveProgress({}, false);

    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  /**
   * Returns to the previous step.
   */
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  /**
   * Finalizes onboarding and marks as completed.
   */
  async function finish() {
    await saveProgress({}, true);
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <ProgressSteps steps={steps} current={step} />
      <motion.div
        key={step}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="mt-6 space-y-4"
      >
        {step === 0 && (
          <div>
            <label className="block">
              <span className="font-medium text-gray-700">Handicap</span>
              <input
                type="number"
                min={0}
                max={54}
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
                onChange={(e) => setData({ ...data, handicap: Number(e.target.value) })}
              />
            </label>
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="block">
              <span className="font-medium text-gray-700">Play Frequency</span>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
                onChange={(e) => setData({ ...data, playFrequency: e.target.value })}
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div>
            <label className="block">
              <span className="font-medium text-gray-700">Goals</span>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
                onChange={(e) => setData({ ...data, goals: e.target.value })}
              />
            </label>
          </div>
        )}
        {step === 3 && (
          <div>
            <label className="block">
              <span className="font-medium text-gray-700">Equipment</span>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-emerald focus:ring-emerald"
                onChange={(e) => setData({ ...data, equipment: e.target.value })}
              />
            </label>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <button
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
            onClick={prev}
            disabled={step === 0}
          >
            Back
          </button>
          {step < steps.length - 1 ? (
            <button
              className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform hover:scale-105"
              onClick={next}
            >
              Next
            </button>
          ) : (
            <button
              className="rounded-lg bg-gold px-4 py-2 font-semibold text-black transition-transform hover:scale-105"
              onClick={finish}
            >
              Finish
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
