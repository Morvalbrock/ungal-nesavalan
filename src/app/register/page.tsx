import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Create Patron Account | Ungal Nesavalan - Authentic Elampillai Handlooms",
  description: "Join our handloom patrons circle to enjoy early access to upcoming loom releases and bespoke drapes."
};

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/account/profile");

  return (
    <AuthShell
      title="Join our Patron Circle"
      tagline="Register for exclusive bridal silk previews, loom updates, and heirloom discounts."
      heroBadge="Direct From Elampillai Looms"
      heroSeries="Authentic Salem Weaves"
      heroQuote="A saree is chosen once but wears the memory of every generation that folded it."
      heroSubtext="Create an account to save your favourite drapes, receive authentic loom drop alerts, and enjoy priority wedding trousseau consultation."
      heroImage="/images/login_image.png"
    >
      <RegisterForm />
    </AuthShell>
  );
}

