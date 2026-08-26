"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, Card, Input, cn } from "@/components/ui";
import { CANTONS } from "@/lib/swiss/cantons";

export interface ProfileData {
  preferredLanguage: "en" | "de" | "fr" | "it";
  canton: string | null;
  municipality: string | null;
  nationalityCategory: "swiss" | "eu_efta" | "third_country" | null;
  residencePermit: "none" | "L" | "B" | "C" | "other" | null;
  employmentStatus: "employed" | "self_employed" | "student" | "unemployed" | "retired" | "other" | null;
  hasVehicle: boolean | null;
  hasChildren: boolean | null;
}

function Select({
  value,
  onChange,
  options,
  allowEmpty = true,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm outline-none focus:border-ink/40 focus:ring-2 focus:ring-ink/10 transition cursor-pointer"
    >
      {allowEmpty && <option value="">Prefer not to say</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsForm({ initial, email }: { initial: ProfileData; email: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setSaved(false);
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h2 className="font-semibold">Your Swiss profile</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Everything here is optional. We only use it to skip questions you&apos;d
          otherwise be asked and to apply the right cantonal rules. Signed in as{" "}
          <span className="font-medium text-ink">{email}</span>.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Preferred language</label>
            <div className="mt-1.5">
              <Select
                value={profile.preferredLanguage}
                allowEmpty={false}
                onChange={(v) => set("preferredLanguage", (v ?? "en") as ProfileData["preferredLanguage"])}
                options={[
                  { value: "en", label: "English" },
                  { value: "de", label: "Deutsch" },
                  { value: "fr", label: "Français" },
                  { value: "it", label: "Italiano" },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Canton</label>
            <p className="text-xs text-ink-soft">Many rules and deadlines are cantonal.</p>
            <div className="mt-1.5">
              <Select
                value={profile.canton}
                onChange={(v) => set("canton", v)}
                options={CANTONS.map((c) => ({ value: c.code, label: c.name }))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Municipality</label>
            <p className="text-xs text-ink-soft">Registration happens at municipal level.</p>
            <div className="mt-1.5">
              <Input
                value={profile.municipality ?? ""}
                onChange={(e) => set("municipality", e.target.value || null)}
                placeholder="e.g. Basel"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Nationality</label>
            <p className="text-xs text-ink-soft">Permit duties differ by category.</p>
            <div className="mt-1.5">
              <Select
                value={profile.nationalityCategory}
                onChange={(v) => set("nationalityCategory", v as ProfileData["nationalityCategory"])}
                options={[
                  { value: "swiss", label: "Swiss citizen" },
                  { value: "eu_efta", label: "EU / EFTA citizen" },
                  { value: "third_country", label: "Other nationality" },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Residence permit</label>
            <div className="mt-1.5">
              <Select
                value={profile.residencePermit}
                onChange={(v) => set("residencePermit", v as ProfileData["residencePermit"])}
                options={[
                  { value: "none", label: "None" },
                  { value: "L", label: "L (short-term)" },
                  { value: "B", label: "B (residence)" },
                  { value: "C", label: "C (settlement)" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Employment</label>
            <div className="mt-1.5">
              <Select
                value={profile.employmentStatus}
                onChange={(v) => set("employmentStatus", v as ProfileData["employmentStatus"])}
                options={[
                  { value: "employed", label: "Employed" },
                  { value: "self_employed", label: "Self-employed" },
                  { value: "student", label: "Student" },
                  { value: "unemployed", label: "Unemployed" },
                  { value: "retired", label: "Retired" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
          </div>
          {(
            [
              ["hasVehicle", "Do you own a vehicle?"],
              ["hasChildren", "Do you have children?"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="text-sm font-medium">{label}</label>
              <div className="mt-1.5 flex gap-2">
                {[
                  { v: true, label: "Yes" },
                  { v: false, label: "No" },
                  { v: null, label: "Skip" },
                ].map((opt) => (
                  <button
                    key={String(opt.v)}
                    type="button"
                    onClick={() => set(key, opt.v)}
                    className={cn(
                      "rounded-xl border px-3.5 py-2 text-sm transition-colors cursor-pointer",
                      profile[key] === opt.v
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-card hover:border-ink/30",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save profile
          </Button>
          {saved && <span className="text-sm text-verified">Saved</span>}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold">Privacy &amp; your data</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
          Dumonda collects only what personalisation genuinely needs, never
          sends more of your data to the AI model than a question requires, and
          keeps analytics free of personal content. Deleting your account
          removes your profile, checklists, conversations and reminders
          permanently.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
          {confirmDelete ? (
            <span className="inline-flex items-center gap-2">
              <Button variant="danger" onClick={deleteAccount} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Permanently delete everything
              </Button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-ink-soft hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
            </span>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete account &amp; data
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
