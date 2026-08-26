import { AuthForm } from "@/components/auth-form";
import { getLocale } from "@/lib/i18n/server";

export const metadata = { title: "Create account" };

export default async function SignUpPage() {
  const locale = await getLocale();
  return (
    <div className="px-4 py-16">
      <AuthForm mode="signup" locale={locale} />
    </div>
  );
}
