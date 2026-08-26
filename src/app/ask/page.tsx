import Link from "next/link";
import { AskFlow } from "@/components/ask-flow";

export const metadata = { title: "What's happening?" };

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        What&apos;s happening?
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        Describe your situation in your own words. We&apos;ll only ask
        follow-ups that change the answer.
      </p>
      <div className="mt-8">
        <AskFlow initialQuery={q ?? ""} autoStart={!!q} />
      </div>
      <p className="mt-6 text-sm text-ink-soft">
        Got an official letter instead?{" "}
        <Link href="/upload" className="font-medium text-ink underline underline-offset-4">
          Upload it
        </Link>{" "}
        and we&apos;ll work out what it is.
      </p>
    </div>
  );
}
