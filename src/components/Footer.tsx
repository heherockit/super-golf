/**
 * Premium footer with contact information.
 */
export default function Footer() {
  return (
    <footer className="bg-emerald text-white">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <p className="font-medium">© {new Date().getFullYear()} Super Golf Advising</p>
        <div className="text-white/90">
          Contact:{' '}
          <a href="mailto:contact@supergolf.app" className="underline">
            contact@supergolf.app
          </a>
        </div>
      </div>
    </footer>
  );
}
