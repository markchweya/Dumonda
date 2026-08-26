"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CalendarClock, FileUp, Loader2, Trash2, Wallet } from "lucide-react";
import { Card, cn } from "@/components/ui";

interface FoundDate {
  raw: string;
  iso: string;
  context: "payment_deadline" | "objection_period" | "date";
}

interface Analysis {
  authorityMatch: { id: string; name: string; officialDomain: string } | null;
  authorityHints: string[];
  dates: FoundDate[];
  amountsChf: string[];
  suggestedEventType: string | null;
  suggestedEventTitle: string | null;
  suggestedQuery: string | null;
  notes: string[];
}

const DATE_CONTEXT_LABEL: Record<FoundDate["context"], string> = {
  payment_deadline: "Payment deadline (found in document)",
  objection_period: "Objection-related date (found in document)",
  date: "Date found in document",
};

export function DocumentUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  async function upload(file: File) {
    setState("uploading");
    setError(null);
    setFilename(file.name);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/documents", { method: "POST", body: form });
      const data = (await res.json()) as { error?: string; documentId?: string; analysis?: Analysis };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setState("idle");
        return;
      }
      setAnalysis(data.analysis ?? null);
      setDocumentId(data.documentId ?? null);
      setState("done");
    } catch {
      setError("Upload failed — please try again.");
      setState("idle");
    }
  }

  async function removeDocument() {
    if (documentId) {
      await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    }
    setAnalysis(null);
    setDocumentId(null);
    setFilename(null);
    setState("idle");
  }

  if (state === "done" && analysis) {
    return (
      <div className="space-y-4 text-left">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{filename}</p>
              <h2 className="mt-1 text-lg font-semibold">What we found in your document</h2>
            </div>
            <button
              type="button"
              onClick={removeDocument}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:border-accent/40 hover:text-accent transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete analysis
            </button>
          </div>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
              <div>
                <p className="font-medium">Issuing authority</p>
                {analysis.authorityMatch ? (
                  <p className="text-ink-soft">
                    Matches {analysis.authorityMatch.name} ({analysis.authorityMatch.officialDomain})
                  </p>
                ) : analysis.authorityHints.length > 0 ? (
                  <p className="text-ink-soft">
                    The wording suggests: {analysis.authorityHints.join(", ")}. The letterhead on your
                    document is authoritative.
                  </p>
                ) : (
                  <p className="text-ink-soft">
                    No known authority recognised — check the letterhead on the document.
                  </p>
                )}
              </div>
            </div>

            {analysis.dates.length > 0 && (
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="font-medium">Dates found</p>
                  <div className="mt-1 space-y-1">
                    {analysis.dates.slice(0, 6).map((d) => (
                      <p key={`${d.iso}-${d.context}`} className="text-ink-soft">
                        <span
                          className={cn(
                            "mr-2 rounded-full px-2 py-0.5 text-xs font-medium",
                            d.context === "payment_deadline"
                              ? "bg-accent-soft text-accent"
                              : d.context === "objection_period"
                                ? "bg-amber-soft text-amber-ink"
                                : "bg-stone-100 text-ink-soft",
                          )}
                        >
                          {DATE_CONTEXT_LABEL[d.context]}
                        </span>
                        {d.raw}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {analysis.amountsChf.length > 0 && (
              <div className="flex items-start gap-3">
                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" />
                <div>
                  <p className="font-medium">Amounts found</p>
                  <p className="text-ink-soft">{analysis.amountsChf.join(" · ")}</p>
                </div>
              </div>
            )}
          </div>

          {analysis.notes.map((n) => (
            <p key={n} className="mt-4 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-ink">
              {n}
            </p>
          ))}
        </Card>

        {analysis.suggestedEventTitle && analysis.suggestedQuery && (
          <Card className="p-6">
            <p className="font-medium">This looks like: {analysis.suggestedEventTitle}</p>
            <p className="mt-1 text-sm text-ink-soft">
              Start the matching workflow to get a checklist with verified sources and the
              responsible authorities.
            </p>
            <Link
              href={`/ask?q=${encodeURIComponent(analysis.suggestedQuery)}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
            >
              Start the workflow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="text-left">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading"}
        className="w-full cursor-pointer rounded-2xl border-2 border-dashed border-line bg-card p-10 text-center transition-colors hover:border-ink/30 disabled:opacity-60"
      >
        {state === "uploading" ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-soft" />
        ) : (
          <FileUp className="mx-auto h-6 w-6 text-ink-soft" />
        )}
        <p className="mt-3 font-medium">
          {state === "uploading" ? "Analysing your document…" : "Upload a PDF or text file"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Up to 10 MB. Scanned images aren&apos;t supported yet — the PDF needs a text layer.
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
      {error && (
        <Card className="mt-4 border-amber-ink/20 bg-amber-soft p-4 text-sm text-amber-ink">{error}</Card>
      )}
    </div>
  );
}
