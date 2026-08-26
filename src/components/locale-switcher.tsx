"use client";

import { useRouter } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/components/ui";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();

  function setLocale(locale: Locale) {
    document.cookie = `dumonda_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          onClick={() => setLocale(l.code)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-medium uppercase transition-colors cursor-pointer",
            l.code === current ? "bg-ink text-paper" : "text-ink-soft hover:bg-stone-100 hover:text-ink",
          )}
          title={l.label}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
