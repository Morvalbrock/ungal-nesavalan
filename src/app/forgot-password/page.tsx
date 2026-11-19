import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Ungal Nesavalan - Authentic Elampillai Handlooms",
  description: "Request a secure password reset link for your Ungal Nesavalan account."
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset Your Password"
      tagline="Enter the email associated with your account and we’ll send you a secure link to choose a new password."
      heroBadge="Direct From Elampillai Looms"
      heroSeries="Authentic Salem Weaves"
      heroQuote="Every thread carries the sacred prayers and dedication of our master weaver’s loom."
      heroSubtext="Enter your verified patron email to receive an instant, encrypted single-use recovery link."
      heroImage="/images/login_image.png"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
