import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function Footer() {
  const locale = await getLocale();
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">Dumonda</p>
          <p className="mt-1 max-w-md text-sm text-ink-soft">{t(locale, "footer.tagline")}</p>
        </div>
        <div className="flex flex-col gap-4">
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            <Link href="/how-it-works" className="hover:text-ink transition-colors">{t(locale, "nav.howItWorks")}</Link>
            <Link href="/life-events" className="hover:text-ink transition-colors">{t(locale, "nav.lifeEvents")}</Link>
            <Link href="/sources" className="hover:text-ink transition-colors">{t(locale, "nav.sources")}</Link>
            <Link href="/guides" className="hover:text-ink transition-colors">Guides</Link>
            <Link href="/settings" className="hover:text-ink transition-colors">{t(locale, "footer.privacy")}</Link>
          </nav>
          <LocaleSwitcher current={locale} />
        </div>
      </div>
    </footer>
  );
}
