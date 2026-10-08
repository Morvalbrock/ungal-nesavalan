import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { verifyResetToken } from "@/features/auth/password-reset.service";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

interface SearchParams {
  id?: string;
  token?: string;
}

const INVALID_COPY: Record<string, string> = {
  invalid: "This reset link isn’t valid. It may have been mistyped or already used.",
  expired: "This reset link has expired. Request a new one and try again.",
  used: "This reset link has already been used. If you still need to reset your password, request a new link.",
  missing: "This page needs a valid reset link. Start from the forgot-password page."
};

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { id, token } = await searchParams;

  if (!id || !token) {
    return (
      <AuthShell title="Reset your password" tagline={INVALID_COPY.missing}>
        <div className="rounded-card border border-border bg-cream-warm/50 p-4 text-sm text-ink-soft">
          <Link href="/forgot-password" className="link-underline">
            ← Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  const check = await verifyResetToken(id, token);
  if (!check.ok) {
    return (
      <AuthShell title="Reset your password" tagline={INVALID_COPY[check.reason]}>
        <div className="rounded-card border border-border bg-cream-warm/50 p-4 text-sm text-ink-soft">
          <Link href="/forgot-password" className="link-underline">
            ← Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a new password"
      tagline="Enter a new password for your account. Minimum 8 characters."
    >
      <ResetPasswordForm id={id} token={token} />
    </AuthShell>
  );
}
