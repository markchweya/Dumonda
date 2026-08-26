import Link from "next/link";
import { EVENT_CATEGORIES, EVENT_TYPES } from "@/lib/events/taxonomy";
import { Card } from "@/components/ui";

export const metadata = { title: "Life events" };

const CATEGORY_LABEL: Record<string, string> = {
  HOUSING: "Housing & moving",
  FAMILY: "Family",
  WORK: "Work",
  EDUCATION: "Education",
  TRANSPORT: "Transport",
  IMMIGRATION: "Immigration",
  BUSINESS: "Business",
  LEGAL_ADMIN: "Legal & administration",
  INSURANCE: "Insurance",
  DOCUMENTS: "Documents",
  TAX: "Tax",
};

export default function LifeEventsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Life events</h1>
      <p className="mt-3 max-w-xl text-ink-soft">
        Situations Dumonda understands today. The catalogue grows continuously —
        if yours is missing, ask anyway and we&apos;ll record it.
      </p>
      {EVENT_CATEGORIES.map((cat) => {
        const items = EVENT_TYPES.filter((e) => e.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-10">
            <h2 className="text-base font-semibold">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {items.map((e) => (
                <Link key={e.id} href={`/ask?q=${encodeURIComponent(e.description)}`}>
                  <Card className="h-full p-4 transition-all hover:border-ink/25 hover:shadow-sm">
                    <p className="text-sm font-medium">{e.title}</p>
                    <p className="mt-1 text-xs text-ink-soft">{e.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
