/**
 * Displays a horizontal progress indicator for wizard steps.
 */
export default function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((s, i) => (
        <li key={s} className="flex-1">
          <div
            className={`h-2 ${i <= current ? 'bg-gold' : 'bg-gray-200'} rounded-full`}
            aria-hidden="true"
          />
          <p
            className={`mt-2 text-sm ${i === current ? 'font-semibold text-emerald' : 'text-gray-600'}`}
          >
            {s}
          </p>
        </li>
      ))}
    </ol>
  );
}
