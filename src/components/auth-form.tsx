"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { t, type Locale } from "@/lib/i18n";

export function AuthForm({ mode, locale = "en" }: { mode: "signin" | "signup"; locale?: Locale }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-sm p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight">
        {mode === "signin" ? t(locale, "auth.welcomeBack") : t(locale, "auth.createTitle")}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "signin" ? t(locale, "auth.signInSub") : t(locale, "auth.createSub")}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="email">{t(locale, "auth.email")}</label>
          <div className="mt-1.5">
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="password">{t(locale, "auth.password")}</label>
          <div className="mt-1.5">
            <Input
              id="password"
              type="password"
              required
              minLength={mode === "signup" ? 8 : 1}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "signup" && (
            <p className="mt-1 text-xs text-ink-soft">{t(locale, "auth.minChars")}</p>
          )}
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "signin" ? t(locale, "auth.signIn") : t(locale, "auth.create")}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === "signin" ? (
          <>
            New to Dumonda?{" "}
            <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-ink underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </Card>
  );
}
