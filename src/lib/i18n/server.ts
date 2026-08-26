import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isLocale, type Locale } from "./index";

export const LOCALE_COOKIE = "dumonda_locale";

/**
 * Resolves the UI locale: explicit cookie (footer switcher) → signed-in
 * profile preference → English.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  try {
    const session = await getSession();
    if (session?.userId) {
      const db = await getDb();
      const [profile] = await db
        .select({ lang: schema.profiles.preferredLanguage })
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, session.userId))
        .limit(1);
      if (profile && isLocale(profile.lang)) return profile.lang;
    }
  } catch {
    // locale resolution must never break a page
  }
  return "en";
}
