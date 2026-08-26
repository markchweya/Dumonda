import Link from "next/link";
import { getSession } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export async function Nav() {
  let signedIn = false;
  let isAdmin = false;
  try {
    const session = await getSession();
    signedIn = !!session?.userId;
    isAdmin = session?.role === "admin";
  } catch {
    // rendering must not fail if the db is cold
  }
  const locale = await getLocale();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Dumonda
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/how-it-works"
            className="hidden sm:block rounded-lg px-3 py-2 text-ink-soft hover:text-ink hover:bg-stone-100 transition-colors"
          >
            {t(locale, "nav.howItWorks")}
          </Link>
          <Link
            href="/life-events"
            className="hidden sm:block rounded-lg px-3 py-2 text-ink-soft hover:text-ink hover:bg-stone-100 transition-colors"
          >
            {t(locale, "nav.lifeEvents")}
          </Link>
          <Link
            href="/sources"
            className="hidden sm:block rounded-lg px-3 py-2 text-ink-soft hover:text-ink hover:bg-stone-100 transition-colors"
          >
            {t(locale, "nav.sources")}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-ink-soft hover:text-ink hover:bg-stone-100 transition-colors"
            >
              Admin
            </Link>
          )}
          {signedIn ? (
            <Link
              href="/dashboard"
              className="ml-2 rounded-xl bg-ink px-4 py-2 font-medium text-paper hover:bg-black transition-colors"
            >
              {t(locale, "nav.myDumonda")}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="ml-2 rounded-xl bg-ink px-4 py-2 font-medium text-paper hover:bg-black transition-colors"
            >
              {t(locale, "nav.signIn")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
