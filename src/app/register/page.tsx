import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/account/profile");
  return (
    <AuthShell title="Create your account" tagline="It only takes a minute.">
      <RegisterForm />
    </AuthShell>
  );
}
