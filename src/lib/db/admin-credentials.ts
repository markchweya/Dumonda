/**
 * The admin account the seed creates.
 *
 * In development the documented defaults apply, so the app runs with no
 * configuration. Against a hosted database (DATABASE_URL set) or on a
 * serverless host, the defaults are refused: they are published in the
 * README, so an admin console seeded with them would be open to anyone.
 */

type Env = Record<string, string | undefined>;

export const DEV_ADMIN_EMAIL = "admin@dumonda.local";
export const DEV_ADMIN_PASSWORD = "dumonda-admin-dev";
export const MIN_ADMIN_PASSWORD_LENGTH = 12;

export function adminCredentials(env: Env = process.env): { email: string; password: string } {
  const email = env.ADMIN_EMAIL?.trim() ?? "";
  const password = env.ADMIN_PASSWORD ?? "";
  const production = Boolean(env.VERCEL) || Boolean(env.DATABASE_URL?.trim());

  if (!production) {
    return { email: email || DEV_ADMIN_EMAIL, password: password || DEV_ADMIN_PASSWORD };
  }
  if (!email || email === DEV_ADMIN_EMAIL) {
    throw new Error("Set ADMIN_EMAIL to a real address before seeding a hosted database.");
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH || password === DEV_ADMIN_PASSWORD) {
    throw new Error(
      `Set ADMIN_PASSWORD (at least ${MIN_ADMIN_PASSWORD_LENGTH} characters, not the development default) before seeding a hosted database.`,
    );
  }
  return { email, password };
}
