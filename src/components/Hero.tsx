import Link from 'next/link';

/**
 * Hero section with gradient background, premium CTA, and visual.
 */
export default function Hero() {
  return (
    <header className="gradient-emerald text-white">
      <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-6 py-20 md:grid-cols-2">
        <div className="animate-fadeIn">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Premium Golf Advising
          </h1>
          <p className="mt-4 font-medium text-white/90">
            Personalized strategies, equipment guidance, and practice plans to unlock your best
            game.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="ease-std inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-black transition-transform duration-std hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="ease-std inline-block rounded-lg border border-white px-6 py-3 font-semibold transition-colors duration-std hover:bg-white hover:text-emerald"
            >
              Login
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="flex h-64 items-center justify-center rounded-xl bg-white/10 shadow-lg backdrop-blur md:h-80"
        >
          <div className="text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-white/20" />
            <p className="mt-4 text-white/80">Elegant visuals optimized for performance</p>
          </div>
        </div>
      </div>
    </header>
  );
}
