import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-ink-soft">
        This page doesn&apos;t exist, or the checklist belongs to a different
        session. If you created it as a guest on another device, sign in to
        find it in your dashboard.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-black transition-colors"
      >
        Back to Dumonda
      </Link>
    </div>
  );
}
