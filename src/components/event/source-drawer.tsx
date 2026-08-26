"use client";

import { useEffect } from "react";
import { ExternalLink, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { cn } from "@/components/ui";

export interface SourceInfo {
  id: string;
  title: string;
  authorityName: string;
  authorityLevel: string;
  canton: string | null;
  url: string;
  verification: string;
  lastVerifiedAt: string | null;
  fetchedAt: string | null;
  excerpt: string | null;
}

const LEVEL_LABEL: Record<string, string> = {
  federal: "Federal",
  cantonal: "Cantonal",
  municipal: "Municipal",
  private_public_service: "Official service provider",
};

export function verificationLabel(v: string): { label: string; verified: boolean } {
  switch (v) {
    case "verified":
      return { label: "Verified source", verified: true };
    case "seed_demo":
      return { label: "Seed data — pending verification", verified: false };
    case "pending_review":
      return { label: "Pending review", verified: false };
    case "stale":
      return { label: "May be outdated", verified: false };
    default:
      return { label: "Unverified", verified: false };
  }
}

export function SourceDrawer({
  sources,
  open,
  onClose,
}: {
  sources: SourceInfo[];
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Sources for this task">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-line bg-card p-5 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[26rem] sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-l sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Sources for this answer</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-soft hover:bg-stone-100 hover:text-ink transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {sources.map((s) => {
            const v = verificationLabel(s.verification);
            return (
              <div key={s.id} className="rounded-2xl border border-line p-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    v.verified ? "bg-verified-soft text-verified" : "bg-amber-soft text-amber-ink",
                  )}
                >
                  {v.verified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {v.label}
                </span>
                <p className="mt-2.5 text-sm font-medium leading-snug">{s.title}</p>
                <div className="mt-2 space-y-1 text-xs text-ink-soft">
                  <p>{s.authorityName}</p>
                  <p>
                    {LEVEL_LABEL[s.authorityLevel] ?? s.authorityLevel}
                    {s.canton ? ` (${s.canton})` : " (applies nationally)"}
                  </p>
                  <p>
                    Last checked:{" "}
                    {s.lastVerifiedAt
                      ? new Date(s.lastVerifiedAt).toLocaleDateString("en-CH", { day: "numeric", month: "long", year: "numeric" })
                      : "not yet verified against the live page"}
                  </p>
                </div>
                {s.excerpt && (
                  <p className="mt-3 border-l-2 border-line pl-3 text-xs leading-relaxed text-ink-soft">
                    {s.excerpt}
                  </p>
                )}
                {!v.verified && (
                  <p className="mt-3 rounded-lg bg-amber-soft px-3 py-2 text-xs text-amber-ink">
                    This summary was seeded during development and has not yet
                    been verified against the live official page. Please verify
                    on the official website before acting.
                  </p>
                )}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void fetch("/api/source-click", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ sourceId: s.id }),
                    });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-ink-soft"
                >
                  Open official website
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
