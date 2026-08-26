"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { Button, Card, Input, cn } from "@/components/ui";
import { t, type Locale } from "@/lib/i18n";

interface Question {
  fact: string;
  question: string;
  whyWeAsk: string;
  options?: { value: string; label: string }[];
  input?: "text" | "date";
}

interface AskResponse {
  kind: "clarify" | "checklist" | "unrecognised";
  eventId?: string;
  eventTitle?: string;
  questions?: Question[];
  message?: string;
}

export function AskFlow({
  initialQuery = "",
  autoStart = false,
  locale = "en",
}: {
  initialQuery?: string;
  autoStart?: boolean;
  locale?: Locale;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [phase, setPhase] = useState<"input" | "clarify" | "generating" | "unrecognised">("input");
  const [loading, setLoading] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const started = useRef(false);

  async function handleResponse(data: AskResponse) {
    if (data.kind === "checklist" && data.eventId) {
      setPhase("generating");
      router.push(`/event/${data.eventId}`);
      return;
    }
    if (data.kind === "clarify" && data.eventId) {
      setEventId(data.eventId);
      setEventTitle(data.eventTitle ?? null);
      setQuestions(data.questions ?? []);
      setAnswers({});
      setPhase("clarify");
      return;
    }
    setMessage(data.message ?? "Something went wrong. Please try again.");
    setPhase("unrecognised");
  }

  async function submitQuery(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await handleResponse((await res.json()) as AskResponse);
    } catch {
      setMessage("We couldn't process your question right now. Please try again in a moment.");
      setPhase("unrecognised");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (autoStart && initialQuery && !started.current) {
      started.current = true;
      void submitQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitAnswers() {
    if (!eventId || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, answers }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await handleResponse((await res.json()) as AskResponse);
    } catch {
      setMessage("We couldn't process your answers right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const allAnswered = questions.every((q) => (answers[q.fact] ?? "") !== "");

  if (phase === "generating") {
    return (
      <Card className="mx-auto max-w-xl p-8 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-soft" />
        <p className="mt-4 text-sm text-ink-soft">{t(locale, "ask.generating")}</p>
      </Card>
    );
  }

  if (phase === "clarify") {
    return (
      <Card className="mx-auto max-w-xl p-6 sm:p-8 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
          {eventTitle ?? "One moment"}
        </p>
        <h2 className="mt-1 text-lg font-semibold">
          {questions.length === 1 ? t(locale, "ask.oneMoreDetail") : t(locale, "ask.fewDetails")}
        </h2>
        <div className="mt-6 space-y-6">
          {questions.map((q) => (
            <div key={q.fact}>
              <p className="text-sm font-medium">{q.question}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{q.whyWeAsk}</p>
              {q.options ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [q.fact]: opt.value }))}
                      className={cn(
                        "rounded-xl border px-3.5 py-2 text-sm transition-colors cursor-pointer",
                        answers[q.fact] === opt.value
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-card hover:border-ink/30",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-3">
                  <Input
                    type={q.input === "date" ? "date" : "text"}
                    value={answers[q.fact] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.fact]: e.target.value }))}
                    placeholder={q.input === "date" ? undefined : t(locale, "ask.typeAnswer")}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm text-ink-soft hover:text-ink transition-colors cursor-pointer"
            onClick={() => setPhase("input")}
          >
            {t(locale, "ask.startOver")}
          </button>
          <Button onClick={submitAnswers} disabled={!allAnswered || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t(locale, "ask.continue")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-xl text-left">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitQuery(query);
        }}
      >
        <div className="rounded-2xl border border-line bg-card p-2 shadow-sm focus-within:border-ink/40 focus-within:ring-2 focus-within:ring-ink/10 transition">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submitQuery(query);
              }
            }}
            rows={2}
            placeholder={t(locale, "ask.placeholder")}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-ink-soft/50"
            aria-label="What's happening?"
          />
          <div className="flex items-center justify-between px-3 pb-1.5">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-ink-soft/70">
              <CornerDownLeft className="h-3 w-3" />
              {t(locale, "ask.enterToSend")}
            </span>
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t(locale, "ask.submit")}
            </Button>
          </div>
        </div>
      </form>
      {phase === "unrecognised" && message && (
        <Card className="mt-4 border-amber-ink/20 bg-amber-soft p-4 text-sm text-amber-ink">
          {message}
        </Card>
      )}
    </div>
  );
}
