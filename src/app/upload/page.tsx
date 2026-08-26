import { DocumentUpload } from "@/components/document-upload";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "What does this letter mean?" };

export default async function UploadPage() {
  const locale = await getLocale();
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-ink-soft">
          Beta
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {t(locale, "upload.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{t(locale, "upload.sub")}</p>
      </div>
      <div className="mt-8">
        <DocumentUpload />
      </div>
    </div>
  );
}
