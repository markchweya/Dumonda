import Link from "next/link";
import { AskFlow } from "@/components/ask-flow";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "What's happening?" };

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const locale = await getLocale();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t(locale, "ask.title")}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t(locale, "ask.sub")}</p>
      <div className="mt-8">
        <AskFlow initialQuery={q ?? ""} autoStart={!!q} locale={locale} />
      </div>
      <p className="mt-6 text-sm text-ink-soft">
        {t(locale, "ask.uploadHint")}{" "}
        <Link href="/upload" className="font-medium text-ink underline underline-offset-4">
          {t(locale, "ask.uploadLink")}
        </Link>{" "}
        {t(locale, "ask.uploadHintEnd")}
      </p>
    </div>
  );
}
