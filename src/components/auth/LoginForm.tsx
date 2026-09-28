"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/auth/auth.provider";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthField, authInputCls } from "./AuthShell";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account/profile";
  const { refresh } = useAuth();
  const oauthError = sp.get("error");
  const [serverError, setServerError] = useState<string | null>(
    oauthError ? "Google sign-in failed. Please try again." : null
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.message ?? "Login failed");
      return;
    }
    await refresh();
    router.push(next);
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <GoogleSignInButton />
      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-ink-muted">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <AuthField label="Email" error={errors.email?.message}>
        <input type="email" autoComplete="email" {...register("email")} className={authInputCls} />
      </AuthField>
      <AuthField label="Password" error={errors.password?.message}>
        <input type="password" autoComplete="current-password" {...register("password")} className={authInputCls} />
      </AuthField>
      {serverError && <p className="text-xs text-maroon">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <Link href="/forgot-password" className="link-underline">Forgot password?</Link>
        <Link href={`/register${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`} className="link-underline">
          Create account
        </Link>
      </div>
      </form>
    </div>
  );
}
