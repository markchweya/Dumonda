import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "Sign in" };

export default async function SignInPage() {
  const locale = await getLocale();
  return (
    <div className="px-4 py-16">
      <AuthForm mode="signin" locale={locale} />
    </div>
  );
}
