import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSession } from "@/features/auth/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/account/profile");
  return (
    <AuthShell title="Welcome back" tagline="Sign in to view your orders, addresses and wishlist.">
      <LoginForm />
    </AuthShell>
  );
}
