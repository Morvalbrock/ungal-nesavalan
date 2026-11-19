import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { verifyResetToken } from "@/features/auth/password-reset.service";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose New Password | Ungal Nesavalan - Authentic Elampillai Handlooms",
  description: "Set a new secure password for your Ungal Nesavalan account."
};
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
      <AuthShell
        title="Reset Your Password"
        tagline={INVALID_COPY.missing}
        heroBadge="Direct From Elampillai Looms"
        heroSeries="Authentic Salem Weaves"
        heroQuote="Every thread carries the sacred prayers and dedication of our master weaver’s loom."
        heroSubtext="Set a strong confidential passphrase to secure your custom bridal drapes and order archives."
        heroImage="/images/login_image.png"
      >
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm text-rose-800">
          <Link href="/forgot-password" className="text-[#3c124d] font-semibold hover:underline">
            ← Request a new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  const check = await verifyResetToken(id, token);
  if (!check.ok) {
    return (
      <AuthShell
        title="Reset Your Password"
        tagline={INVALID_COPY[check.reason]}
        heroBadge="Direct From Elampillai Looms"
        heroSeries="Authentic Salem Weaves"
        heroQuote="Every thread carries the sacred prayers and dedication of our master weaver’s loom."
        heroSubtext="Set a strong confidential passphrase to secure your custom bridal drapes and order archives."
        heroImage="/images/login_image.png"
      >
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-xs sm:text-sm text-rose-800">
          <Link href="/forgot-password" className="text-[#3c124d] font-semibold hover:underline">
            ← Request a new reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Choose a New Password"
      tagline="Enter a new password for your account. Minimum 8 characters."
      heroBadge="Direct From Elampillai Looms"
      heroSeries="Authentic Salem Weaves"
      heroQuote="Every thread carries the sacred prayers and dedication of our master weaver’s loom."
      heroSubtext="Set a strong confidential passphrase to secure your custom bridal drapes and order archives."
      heroImage="/images/login_image.png"
    >
      <ResetPasswordForm id={id} token={token} />
    </AuthShell>
  );
}
