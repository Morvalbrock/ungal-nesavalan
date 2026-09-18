import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      tagline="Password reset over email arrives in a later phase. For now, reach out to support and we'll help you back in."
    >
      <div className="rounded-card border border-border bg-cream-warm/50 p-4 text-sm text-ink-soft">
        <p>
          Email <span className="font-medium text-ink">care@ungalnesavalan.local</span> from your registered address and
          we'll manually reset the password within one business day.
        </p>
        <p className="mt-3">
          <Link href="/login" className="link-underline">← Back to sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
}
