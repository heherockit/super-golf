'use client';

import { useEffect, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';

type OnboardingModalProps = {
  /** Controls visibility of the modal; true opens the wizard */
  open: boolean;

  /** Initial step index to start from (0-4) */
  initialStep?: number;

  /** User email to key local caches and messages */
  userEmail: string;

  /** Callback fired when onboarding finishes successfully */
  onFinished?: () => void;
};

type OnboardingData = {
  // Body & Physical Info
  heightCm?: number;
  weightKg?: number;
  wristToFloorCm?: number;
  gloveSize?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  age?: number;
  fitnessLevel?: 'Low' | 'Moderate' | 'High';
  flexibilityLevel?: 'Low' | 'Moderate' | 'High';

  // Swing Data & Equipment (encoded into equipment string for server persistence)
  driverSwingSpeedMph?: number;
  driverBallSpeedMph?: number;
  sixIronSwingSpeedMph?: number;
  sixIronBallSpeedMph?: number;
  driverCarryYds?: number;
  sevenIronCarryYds?: number;
  clubsBrandModel?: string;
  shaftFlex?: 'L' | 'A' | 'R' | 'S' | 'X';
  shaftMaterial?: 'Steel' | 'Graphite';
  gripType?: 'Cord' | 'Rubber' | 'Wrap';
  gripSize?: 'Undersize' | 'Standard' | 'Midsize' | 'Jumbo';
  ballBrandModel?: string;
  shotShape?: 'Draw' | 'Fade' | 'Straight' | 'Pull' | 'Push' | 'Hook' | 'Slice';
  commonMiss?: 'Hook' | 'Slice' | 'Pull' | 'Push' | 'Thin' | 'Fat' | 'Top' | 'Chunk';

  // Game & Scoring
  // New fields requested
  handicap?: number;
  avgScore18?: number;
  bestRecentRound?: number;
  lastTenScores?: string; // comma-separated list, e.g., "95, 92, 90"
  strengths?: string;
  weaknesses?: string;

  // Legacy metrics retained for dashboard charts
  avgScore?: number;
  fairwaysPct?: number; // 0-100
  girPct?: number;       // 0-100
  puttsPerRound?: number;
};

/**
 * Locks body scrolling when the modal is open to prevent background scroll.
 * Ensures accessibility by avoiding focus loss and accidental page movement.
 */
function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}

/**
 * Returns a clamped number between min and max.
 */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Parses a comma-separated scores string into a sanitized numeric array.
 * - Trims whitespace and filters non-numeric values
 * - Clamps each score to [60, 150]
 * - Limits to 10 entries
 */
function parseScoresInput(s: string | undefined): number[] {
  if (!s) return [];

  const parts = s
    .split(',')
    .map((x) => x.trim())
    .filter((x) => x.length > 0);

  const nums = parts
    .map((x) => Number(x))
    .filter((n) => !Number.isNaN(n))
    .map((n) => clamp(n, 60, 150));

  return nums.slice(0, 10);
}

/**
 * Builds a single-line equipment summary to persist within the existing profile schema.
 * Encodes key fields for later display and recommendation context.
 */
function buildEquipmentSummary(d: OnboardingData): string {
  const parts: string[] = [];

  if (d.clubsBrandModel) parts.push(`Clubs ${d.clubsBrandModel}`);

  if (d.shaftFlex || d.shaftMaterial) parts.push(`Shaft ${d.shaftFlex ?? ''} ${d.shaftMaterial ?? ''}`.trim());

  if (d.gripType || d.gripSize) parts.push(`Grip ${d.gripType ?? ''} ${d.gripSize ?? ''}`.trim());

  if (d.ballBrandModel) parts.push(`Ball ${d.ballBrandModel}`);

  if (d.driverSwingSpeedMph || d.driverBallSpeedMph)
    parts.push(`Driver SS ${d.driverSwingSpeedMph ?? 'n/a'} mph / BS ${d.driverBallSpeedMph ?? 'n/a'} mph`);

  if (d.sixIronSwingSpeedMph || d.sixIronBallSpeedMph)
    parts.push(`6i SS ${d.sixIronSwingSpeedMph ?? 'n/a'} mph / BS ${d.sixIronBallSpeedMph ?? 'n/a'} mph`);

  if (d.driverCarryYds) parts.push(`Driver carry ${d.driverCarryYds} yds`);

  if (d.sevenIronCarryYds) parts.push(`7i carry ${d.sevenIronCarryYds} yds`);

  if (d.shotShape) parts.push(`Shape ${d.shotShape}`);

  if (d.commonMiss) parts.push(`Miss ${d.commonMiss}`);

  return parts.join(' | ');
}

/**
 * Saves incremental onboarding progress to the server profile endpoint.
 * Only persists supported fields in the existing profile schema.
 */
async function persistProfile(step: number, completed: boolean, d: OnboardingData) {
  const payload = {
    onboardingStep: step,
    onboardingCompleted: completed,
    equipment: buildEquipmentSummary(d),
    goals: undefined,
    // Optional placeholders for legacy fields
    playFrequency: undefined,
    handicap: d.handicap ?? undefined,
  } as const;

  const res = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  return res?.status ?? 0;
}



/**
 * Posts the full onboarding wizard payload to the recommendations API to generate
 * structured recommendations using OpenAI (or fallback). Caches the JSON locally.
 */
async function postStructuredRecommendations(email: string, payload: OnboardingData): Promise<void> {
  try {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null);

    const json = await res?.json().catch(() => null);

    const recommendations = json?.recommendations;

    if (recommendations && typeof window !== 'undefined') {
      const key = `recs_structured_${email}`;

      window.localStorage.setItem(key, JSON.stringify(recommendations));

      // Dispatch a window-level event to notify listeners that structured
      // recommendations have been updated for this email.
      try {
        const event = new CustomEvent('recs_structured_updated', { detail: { email } });

        window.dispatchEvent(event);
      } catch {
        // ignore environments without CustomEvent support
      }
    }
  } catch {
    // ignore errors
  }
}

/**
 * Modal onboarding wizard with 5-step carousel and smooth transitions.
 * Implements validation, a blocking analysis phase, and session-timeout handling.
 */
export default function OnboardingModal({ open, initialStep = 0, userEmail, onFinished }: OnboardingModalProps) {
  const [step, setStep] = useState<number>(initialStep);

  const [data, setData] = useState<OnboardingData>({});

  const [analyzing, setAnalyzing] = useState(false);

  const [progress, setProgress] = useState(0);

  const [sessionExpired, setSessionExpired] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Prevent background page scrolling while the modal is open.
  useBodyScrollLock(open);

  /**
   * Traps focus within the modal when open for accessibility.
   */
  useEffect(() => {
    if (!open) return;

    const root = overlayRef.current;

    if (!root) return;

    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const first = focusables[0];

    const last = focusables[focusables.length - 1];

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last?.focus();

          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first?.focus();

          e.preventDefault();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);

    first?.focus();

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  /**
   * Validates the current step's inputs and returns a boolean.
   */
  function validateStep(s: number): boolean {
    setError(null);

    if (s === 1) {
      if (!data.heightCm || !data.weightKg) {
        setError('Please fill out all fields for Body & Physical Info.');

        return false;
      }

      if (data.heightCm < 120 || data.heightCm > 230 || data.weightKg < 40 || data.weightKg > 200) {
        setError('Height or weight appears out of range.');

        return false;
      }
    }

    if (s === 2) {
      const required = [
        data.driverSwingSpeedMph,
        data.driverBallSpeedMph,
        data.sixIronSwingSpeedMph,
        data.sixIronBallSpeedMph,
        data.driverCarryYds,
        data.sevenIronCarryYds,
        data.shaftFlex,
        data.shaftMaterial,
        data.gripType,
        data.gripSize,
        data.ballBrandModel,
      ];

      if (required.some((v) => v == null || v === '')) {
        setError('Please complete swing speeds, carry distances, shaft, grip, and ball details.');

        return false;
      }

      if (
        (data.driverSwingSpeedMph! < 60 || data.driverSwingSpeedMph! > 140) ||
        (data.driverBallSpeedMph! < 80 || data.driverBallSpeedMph! > 220) ||
        (data.sixIronSwingSpeedMph! < 50 || data.sixIronSwingSpeedMph! > 120) ||
        (data.sixIronBallSpeedMph! < 70 || data.sixIronBallSpeedMph! > 180) ||
        (data.driverCarryYds! < 140 || data.driverCarryYds! > 360) ||
        (data.sevenIronCarryYds! < 90 || data.sevenIronCarryYds! > 200)
      ) {
        setError('One or more values appear outside expected ranges.');

        return false;
      }
    }

    if (s === 3) {
      const scores = parseScoresInput(data.lastTenScores);

      const hasScores = scores.length > 0;

      const hasHandicap = data.handicap != null && data.handicap >= 0 && data.handicap <= 54;

      const hasAvg18 = data.avgScore18 != null;

      if (!hasHandicap && !hasAvg18 && !hasScores) {
        setError('Provide handicap, average 18-hole score, or last 10 scores.');

        return false;
      }

      if (data.avgScore18 != null && (data.avgScore18 < 60 || data.avgScore18 > 150)) {
        setError('Average 18-hole score appears out of range.');

        return false;
      }

      if (data.bestRecentRound != null && (data.bestRecentRound < 60 || data.bestRecentRound > 150)) {
        setError('Best recent round appears out of range.');

        return false;
      }

      if (data.lastTenScores && !hasScores) {
        setError('Enter up to 10 scores separated by commas (60–150).');

        return false;
      }
    }

    return true;
  }

  /**
   * Advances to the next step with validation and persists progress server-side.
   */
  async function next() {
    const s = step;

    if (!validateStep(s)) return;

    const status = await persistProfile(s, false, data);

    if (status === 401) {
      setSessionExpired(true);

      return;
    }

    setStep((x) => Math.min(x + 1, 4));
  }

  /**
   * Goes back to the previous step.
   */
  async function prev() {
    setStep((x) => Math.max(x - 1, 0));

    const status = await persistProfile(step - 1, false, data);

    if (status === 401) setSessionExpired(true);
  }

  /**
   * Begins the analysis phase: disables navigation, shows progress, calls API,
   * and marks onboarding completed upon success.
   */
  async function beginAnalysis() {
    if (!validateStep(3)) return;

    setAnalyzing(true);

    setProgress(5);

    setStep(4);

    // Simulated progress while waiting for recommendations
    const id = setInterval(() => setProgress((p) => (p < 70 ? p + 5 : p)), 300);

    const statusBefore = await persistProfile(4, false, data);

    if (statusBefore === 401) {
      clearInterval(id);

      setSessionExpired(true);

      setAnalyzing(false);

      setStep(3);

      return;
    }

    // Send full wizard payload to structured recommendations API (POST)
    await postStructuredRecommendations(userEmail, data);

    // Persist scoring metrics locally to power charts on the dashboard.
    try {
      if (typeof window !== 'undefined') {
        const key = `onboarding_scoring_${userEmail}`;

        const derivedAvg =
          data.avgScore18 ?? (() => {
            const arr = parseScoresInput(data.lastTenScores);

            return arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;
          })();

        const payload = {
          avgScore: derivedAvg ?? data.avgScore,
          fairwaysPct: data.fairwaysPct,
          girPct: data.girPct,
          puttsPerRound: data.puttsPerRound,
        };

        window.localStorage.setItem(key, JSON.stringify(payload));
      }
    } catch {
      // ignore local cache errors
    }

    clearInterval(id);

    setProgress(100);

    const statusAfter = await persistProfile(4, true, data);

    if (statusAfter === 401) {
      setSessionExpired(true);

      setAnalyzing(false);

      setStep(3);

      return;
    }

    setTimeout(() => {
      setAnalyzing(false);

      onFinished?.();
    }, 500);
  }

  /**
   * Renders the content panel for the current step.
   */
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald">Welcome</h2>
            <p className="text-gray-700">Let’s personalize your experience. We’ll capture a few details about your swing and equipment, then analyze your game to generate tailored recommendations.</p>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Five quick steps with smooth transitions</li>
              <li>Accessible forms and clear validation</li>
              <li>Fast analysis with progress indicators</li>
            </ul>
            <div className="flex justify-end">
              <button className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform duration-300 hover:scale-105" onClick={next}>
                Get Started
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <h2 className="col-span-1 text-2xl font-semibold text-emerald sm:col-span-2">Body & Physical Information</h2>
            <label className="block">
              <span className="font-medium text-gray-800">Height (cm)</span>
              <input type="number" min={120} max={230} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.heightCm ?? ''} onChange={(e) => setData({ ...data, heightCm: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Weight (kg)</span>
              <input type="number" min={40} max={200} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.weightKg ?? ''} onChange={(e) => setData({ ...data, weightKg: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Wrist to Floor (cm)</span>
              <input type="number" min={30} max={110} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.wristToFloorCm ?? ''} onChange={(e) => setData({ ...data, wristToFloorCm: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Glove Size</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.gloveSize ?? ''} onChange={(e) => setData({ ...data, gloveSize: e.target.value as OnboardingData['gloveSize'] })}>
                <option value="">Select…</option>
                {(['XS','S','M','L','XL'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Age</span>
              <input type="number" min={10} max={100} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.age ?? ''} onChange={(e) => setData({ ...data, age: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Fitness Level</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.fitnessLevel ?? ''} onChange={(e) => setData({ ...data, fitnessLevel: e.target.value as OnboardingData['fitnessLevel'] })}>
                <option value="">Select…</option>
                {(['Low','Moderate','High'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Flexibility/Mobility Level</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.flexibilityLevel ?? ''} onChange={(e) => setData({ ...data, flexibilityLevel: e.target.value as OnboardingData['flexibilityLevel'] })}>
                <option value="">Select…</option>
                {(['Low','Moderate','High'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <h2 className="col-span-1 text-2xl font-semibold text-emerald sm:col-span-2">Swing Data & Equipment</h2>

            <label className="block">
              <span className="font-medium text-gray-800">Driver Swing Speed (mph)</span>
              <input type="number" min={60} max={140} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.driverSwingSpeedMph ?? ''} onChange={(e) => setData({ ...data, driverSwingSpeedMph: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Driver Ball Speed (mph)</span>
              <input type="number" min={80} max={220} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.driverBallSpeedMph ?? ''} onChange={(e) => setData({ ...data, driverBallSpeedMph: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">6-iron Swing Speed (mph)</span>
              <input type="number" min={50} max={120} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.sixIronSwingSpeedMph ?? ''} onChange={(e) => setData({ ...data, sixIronSwingSpeedMph: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">6-iron Ball Speed (mph)</span>
              <input type="number" min={70} max={180} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.sixIronBallSpeedMph ?? ''} onChange={(e) => setData({ ...data, sixIronBallSpeedMph: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Typical Driver Carry (yds)</span>
              <input type="number" min={140} max={360} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.driverCarryYds ?? ''} onChange={(e) => setData({ ...data, driverCarryYds: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Typical 7-iron Carry (yds)</span>
              <input type="number" min={90} max={200} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.sevenIronCarryYds ?? ''} onChange={(e) => setData({ ...data, sevenIronCarryYds: Number(e.target.value) })} />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-medium text-gray-800">Current Clubs (brand/model)</span>
              <input type="text" className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" placeholder="e.g., Titleist T200 / TaylorMade Stealth" value={data.clubsBrandModel ?? ''} onChange={(e) => setData({ ...data, clubsBrandModel: e.target.value })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Shaft Flex</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.shaftFlex ?? ''} onChange={(e) => setData({ ...data, shaftFlex: e.target.value as OnboardingData['shaftFlex'] })}>
                <option value="">Select…</option>
                {(['L','A','R','S','X'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Shaft Material</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.shaftMaterial ?? ''} onChange={(e) => setData({ ...data, shaftMaterial: e.target.value as OnboardingData['shaftMaterial'] })}>
                <option value="">Select…</option>
                {(['Steel','Graphite'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Grip Type</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.gripType ?? ''} onChange={(e) => setData({ ...data, gripType: e.target.value as OnboardingData['gripType'] })}>
                <option value="">Select…</option>
                {(['Cord','Rubber','Wrap'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Grip Size</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.gripSize ?? ''} onChange={(e) => setData({ ...data, gripSize: e.target.value as OnboardingData['gripSize'] })}>
                <option value="">Select…</option>
                {(['Undersize','Standard','Midsize','Jumbo'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block sm:col-span-2">
              <span className="font-medium text-gray-800">Ball Type (brand/model)</span>
              <input type="text" className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" placeholder="e.g., Titleist Pro V1 / Srixon Q-Star" value={data.ballBrandModel ?? ''} onChange={(e) => setData({ ...data, ballBrandModel: e.target.value })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Shot Shape Tendencies</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.shotShape ?? ''} onChange={(e) => setData({ ...data, shotShape: e.target.value as OnboardingData['shotShape'] })}>
                <option value="">Select…</option>
                {(['Draw','Fade','Straight','Pull','Push','Hook','Slice'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Common Miss</span>
              <select className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.commonMiss ?? ''} onChange={(e) => setData({ ...data, commonMiss: e.target.value as OnboardingData['commonMiss'] })}>
                <option value="">Select…</option>
                {(['Hook','Slice','Pull','Push','Thin','Fat','Top','Chunk'] as const).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <h2 className="col-span-1 text-2xl font-semibold text-emerald sm:col-span-2">Game & Scoring</h2>
            <label className="block">
              <span className="font-medium text-gray-800">Current Handicap</span>
              <input type="number" min={0} max={54} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.handicap ?? ''} onChange={(e) => setData({ ...data, handicap: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Average 18-Hole Score</span>
              <input type="number" min={60} max={150} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.avgScore18 ?? ''} onChange={(e) => setData({ ...data, avgScore18: Number(e.target.value) })} />
            </label>

            <label className="block">
              <span className="font-medium text-gray-800">Best Recent Round</span>
              <input type="number" min={60} max={150} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" value={data.bestRecentRound ?? ''} onChange={(e) => setData({ ...data, bestRecentRound: Number(e.target.value) })} />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-medium text-gray-800">Most Recent 10 Rounds</span>
              <textarea rows={3} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" placeholder="e.g., 95, 92, 90, 88, 93, 96, 91, 89, 94, 90" value={data.lastTenScores ?? ''} onChange={(e) => setData({ ...data, lastTenScores: e.target.value })} />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-medium text-gray-800">Biggest Strengths</span>
              <textarea rows={3} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" placeholder="e.g., Driving accuracy, short-game touch" value={data.strengths ?? ''} onChange={(e) => setData({ ...data, strengths: e.target.value })} />
            </label>

            <label className="block sm:col-span-2">
              <span className="font-medium text-gray-800">Biggest Weaknesses</span>
              <textarea rows={3} className="mt-1 w-full rounded-md border-gray-300 text-gray-900 focus:border-emerald focus:ring-emerald" placeholder="e.g., Long-iron consistency, pressure putting" value={data.weaknesses ?? ''} onChange={(e) => setData({ ...data, weaknesses: e.target.value })} />
            </label>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-emerald">Analyzing your data…</h2>
            <p className="text-gray-700" aria-live="polite">We’re generating personalized recommendations. This usually takes a few seconds.</p>
            <div className="relative h-3 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-full rounded bg-emerald transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            {/* Removed textual preview panel */}
          </div>
        );

      default:
        return null;
    }
  }

  const canGoBack = !analyzing && step > 0 && step < 4;

  const canGoNext = !analyzing && step > 0 && step < 3;

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label="Onboarding wizard"
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-xl backdrop-saturate-150 sm:pt-20"
        >
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="w-full rounded-2xl bg-white shadow-xl transition-[margin,padding,width,height] duration-300 ease-in-out md:min-h-[50vh] lg:min-h-[56vh]"
            >
             <div className="flex items-center justify-between border-b px-6 py-4">
               <h2 className="text-xl font-semibold text-emerald">Getting Started</h2>
               <span className="text-sm text-gray-600">Step {step + 1} of 5</span>
             </div>
             <div className="px-6 py-4">
              {error && (
                <p role="alert" className="mb-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>
              )}
              {sessionExpired && (
                <div className="mb-3 rounded-md bg-amber-50 p-2 text-sm text-amber-800">
                  Session expired. Please <button className="underline" onClick={() => { window.location.href = '/login'; }}>log in</button> again.
                </div>
              )}
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {renderStep()}
              </motion.div>
            </div>
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <button className="rounded-lg border px-4 py-2 font-semibold text-gray-900 transition-colors duration-300 hover:bg-gray-50 disabled:opacity-50" onClick={prev} disabled={!canGoBack}>Back</button>

                {canGoNext && (
                  <button className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform duration-300 hover:scale-105" onClick={next}>Next</button>
                )}
              </div>
              {step === 3 && !analyzing && (
                <button className="rounded-lg bg-gold px-4 py-2 font-semibold text-black transition-transform duration-300 hover:scale-105" onClick={beginAnalysis}>
                  Submit & Analyze
                </button>
              )}
              {step === 4 && (
                <button className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white transition-transform duration-300 hover:scale-105" disabled>
                  Analyzing…
                </button>
              )}
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}