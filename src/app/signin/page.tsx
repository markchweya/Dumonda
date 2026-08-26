import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="px-4 py-16">
      <AuthForm mode="signin" />
    </div>
  );
}
