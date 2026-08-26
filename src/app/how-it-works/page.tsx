import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = { title: "How it works" };

const STEPS = [
  {
    title: "You describe what happened",
    text: "In plain language, in English, German, French or Italian. “I moved from Zürich to Basel” is enough — you never need to know which office is responsible or what the procedure is called.",
  },
  {
    title: "Dumonda understands the event",
    text: "Your sentence is converted into a structured life event. Dumonda then checks which details genuinely change the answer — your canton, your permit, whether you own a car — and asks only about those.",
  },
  {
    title: "A rules engine decides what applies",
    text: "Obligations are not invented by an AI model. A deterministic rules layer, maintained against official sources, selects what applies at federal, cantonal and municipal level for your situation.",
  },
  {
    title: "Every claim is traceable",
    text: "Each task links to the official source it is based on — the authority, the page, when it was last checked. If we can't verify something from an approved source, we say so instead of guessing.",
  },
  {
    title: "You follow one checklist",
    text: "Deadlines are calculated only when a verified rule defines them. You tick things off, mark what doesn't apply, and your dashboard keeps everything in one place.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">How Dumonda works</h1>
      <p className="mt-3 text-ink-soft">
        Dumonda is a life-navigation assistant for Switzerland — not a chatbot
        that improvises answers.
      </p>
      <div className="mt-8 space-y-4">
        {STEPS.map((s, i) => (
          <Card key={s.title} className="flex gap-4 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.text}</p>
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-8 border-amber-ink/20 bg-amber-soft p-5 text-sm leading-relaxed text-amber-ink">
        Dumonda provides information and navigation. It is not an authority and
        does not issue official decisions or legal advice. For binding answers
        — especially on immigration, taxes, fines and benefits — the
        responsible authority is always the final word.
      </Card>
      <div className="mt-8">
        <Link
          href="/ask"
          className="rounded-xl bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-black transition-colors"
        >
          Try it now
        </Link>
      </div>
    </div>
  );
}
