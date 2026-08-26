import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Dumonda</p>
          <p className="mt-1 max-w-md text-sm text-ink-soft">
            Your guide through life in Switzerland. Built from verified official
            sources. Dumonda provides information and navigation, not official
            decisions or legal advice.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <Link href="/how-it-works" className="hover:text-ink transition-colors">How it works</Link>
          <Link href="/life-events" className="hover:text-ink transition-colors">Life events</Link>
          <Link href="/sources" className="hover:text-ink transition-colors">Sources</Link>
          <Link href="/settings" className="hover:text-ink transition-colors">Privacy &amp; data</Link>
        </nav>
      </div>
    </footer>
  );
}
