import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { SettingsForm, type ProfileData } from "@/components/settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/signin");

  const db = await getDb();
  const [profile] = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, session.userId))
    .limit(1);

  const initial: ProfileData = {
    preferredLanguage: profile?.preferredLanguage ?? "en",
    canton: profile?.canton ?? null,
    municipality: profile?.municipality ?? null,
    nationalityCategory: profile?.nationalityCategory ?? null,
    residencePermit: profile?.residencePermit ?? null,
    employmentStatus: profile?.employmentStatus ?? null,
    hasVehicle: profile?.hasVehicle ?? null,
    hasChildren: profile?.hasChildren ?? null,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <div className="mt-6">
        <SettingsForm initial={initial} email={session.email ?? ""} />
      </div>
    </div>
  );
}
