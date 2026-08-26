import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Guides",
  description:
    "Practical guides to Swiss life events — moving, having a baby, losing a job, starting a business, permit renewal — built from official sources.",
};

export default function GuidesIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Guides</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Curated entry points into the most common Swiss life events. Every
        guide is generated from the same rules and official sources as the
        product itself — for your personal version, just tell Dumonda what
        happened.
      </p>
      <div className="mt-8 space-y-3">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/${g.slug}`} className="block">
            <Card className="p-5 transition-all hover:border-ink/25 hover:shadow-sm">
              <p className="font-medium">{g.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{g.metaDescription}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
