import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Login & Sign In | Ungal Nesavalan - Authentic Elampillai Handlooms",
  description: "Sign in to view your orders, track shipments, and access your saved drapes."
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/account/profile");

  return (
    <AuthShell
      title="Welcome Back"
      tagline="Sign in to view your orders, track shipments, and access your saved drapes."
      heroBadge="Direct From Elampillai Looms"
      heroSeries="Authentic Salem Weaves"
      heroQuote="Every thread carries the sacred prayers and dedication of our master weaver’s loom."
      heroSubtext="Handwoven directly in Tamil Nadu — crafted with heirloom soft silks, Kalyani organic cottons, and bridal drapes straight from authentic pit-looms."
      heroImage="/images/login_image.png"
    >
      <LoginForm />
    </AuthShell>
  );
}

