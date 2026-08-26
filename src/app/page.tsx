import Link from "next/link";
import {
  Baby,
  Briefcase,
  Car,
  FileWarning,
  GraduationCap,
  Home as HomeIcon,
  Hourglass,
  PlaneTakeoff,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { AskFlow } from "@/components/ask-flow";
import { Card } from "@/components/ui";

const SITUATIONS = [
  {
    icon: HomeIcon,
    title: "Moving",
    description: "I've moved or I'm planning to move.",
    query: "I'm moving to another canton",
  },
  {
    icon: Baby,
    title: "New baby",
    description: "I've recently had a child.",
    query: "I recently had a baby",
  },
  {
    icon: Briefcase,
    title: "Job change",
    description: "I lost, started or changed a job.",
    query: "I lost my job",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "I finished school or I'm starting something new.",
    query: "I just finished high school",
  },
  {
    icon: FileWarning,
    title: "Fine or official letter",
    description: "I received something I don't understand.",
    query: "I received a fine",
  },
  {
    icon: Hourglass,
    title: "Expiring soon",
    description: "A permit, card, subscription or document is expiring.",
    query: "My residence permit is expiring",
  },
  {
    icon: Rocket,
    title: "Starting a business",
    description: "I want to become self-employed or create a company.",
    query: "I want to start a business",
  },
  {
    icon: PlaneTakeoff,
    title: "Leaving Switzerland",
    description: "I'm moving abroad.",
    query: "I'm leaving Switzerland",
  },
  {
    icon: Car,
    title: "Vehicle",
    description: "I bought a car or need to sort out transport.",
    query: "I bought a car",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Life changes. Dumonda knows what comes next.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-ink-soft sm:text-lg">
          Tell us what&apos;s happening and get a personalised Swiss checklist with
          deadlines, documents and verified official sources.
        </p>
        <div className="mt-10">
          <AskFlow />
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-ink-soft">
          <ShieldCheck className="h-3.5 w-3.5 text-verified" />
          Built from verified Swiss sources
        </p>
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2 text-sm">
          {["I moved to another canton", "I just had a baby", "I lost my job", "My permit is expiring", "I got a fine"].map(
            (example) => (
              <Link
                key={example}
                href={`/ask?q=${encodeURIComponent(example)}`}
                className="rounded-full border border-line bg-card px-3.5 py-1.5 text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
              >
                {example}
              </Link>
            ),
          )}
        </div>
      </section>

      {/* Popular situations */}
      <section className="border-t border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold tracking-tight">Popular situations</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATIONS.map((s) => (
              <Link key={s.title} href={`/ask?q=${encodeURIComponent(s.query)}`}>
                <Card className="group h-full p-5 transition-all hover:border-ink/25 hover:shadow-sm">
                  <s.icon className="h-5 w-5 text-ink-soft transition-colors group-hover:text-ink" />
                  <p className="mt-3 font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight">How Dumonda works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Tell us what happened",
              text: "In your own words. No government terminology required.",
            },
            {
              step: "2",
              title: "Dumonda works out what applies",
              text: "Based on your situation and where you live — federal, cantonal and municipal.",
            },
            {
              step: "3",
              title: "Follow your checklist",
              text: "Deadlines, documents and official services in one place.",
            },
          ].map((item) => (
            <Card key={item.step} className="p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
                {item.step}
              </span>
              <p className="mt-4 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{item.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Answers you can verify</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                Every administrative step Dumonda shows you is traceable to an
                official source — the Confederation, your canton, your
                municipality or the official service provider. You can open the
                source behind any recommendation, see which authority it comes
                from and when it was last checked. When we can&apos;t verify
                something, we say so instead of guessing.
              </p>
              <Link
                href="/sources"
                className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-ink-soft"
              >
                Browse the source registry
              </Link>
            </div>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Register with your new municipality</p>
                <span className="rounded-full bg-verified-soft px-2.5 py-0.5 text-xs font-medium text-verified">
                  Verified source
                </span>
              </div>
              <div className="mt-3 border-t border-line pt-3 text-xs text-ink-soft">
                <p>ch.ch — Confederation, cantons and communes</p>
                <p className="mt-1">Within 14 days of moving in</p>
                <p className="mt-1">Last checked: shown on every task</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
