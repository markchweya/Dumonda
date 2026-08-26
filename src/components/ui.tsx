import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Button ──────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-paper hover:bg-black shadow-sm",
  secondary:
    "bg-card text-ink border border-line hover:border-ink/30 hover:bg-stone-50",
  ghost: "text-ink-soft hover:text-ink hover:bg-stone-100",
  danger: "bg-card text-accent border border-accent/30 hover:bg-accent-soft",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={cn(buttonBase, buttonStyles[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant; href: string }) {
  return (
    <Link href={href} className={cn(buttonBase, buttonStyles[variant], className)} {...props} />
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-card", className)}
      {...props}
    />
  );
}

// ─── Input ───────────────────────────────────────────────────────────────────

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10 transition",
        className,
      )}
      {...props}
    />
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────

export function Badge({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "required" | "may_apply" | "recommended" | "information" | "verified" | "seed" | "danger";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-stone-100 text-ink-soft",
    required: "bg-ink text-paper",
    may_apply: "bg-amber-soft text-amber-ink",
    recommended: "bg-stone-100 text-ink",
    information: "bg-stone-100 text-ink-soft",
    verified: "bg-verified-soft text-verified",
    seed: "bg-amber-soft text-amber-ink",
    danger: "bg-accent-soft text-accent",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
