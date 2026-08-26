import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="px-4 py-16">
      <AuthForm mode="signup" />
    </div>
  );
}
