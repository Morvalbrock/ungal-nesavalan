import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      tagline="Enter the email on your account and we’ll send you a secure link to choose a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
