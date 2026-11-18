"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AuthField, authInputCls } from "@/components/auth/AuthShell";
import { submitForgotPassword } from "./actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await submitForgotPassword(trimmed);
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-5 text-sm text-purple-950">
        <p className="leading-relaxed">
          If an account exists for <strong className="text-brand-plum">{email}</strong>, we&apos;ve sent a secure password reset link.
          Please check your inbox (and spam folder).
        </p>
        <p className="mt-4">
          <Link href="/login" className="text-brand-purple font-semibold hover:underline text-xs">
            ← Return to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField label="Account Email Address">
        <input
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputCls}
        />
      </AuthField>
      <button type="submit" disabled={pending} className="btn-primary w-full font-semibold shadow-md shadow-brand-deep/20 py-3">
        {pending ? "Sending…" : "Send Reset Link"}
      </button>
      <p className="text-xs text-purple-900/70 text-center pt-2">
        Remember your password?{" "}
        <Link href="/login" className="text-brand-purple font-semibold hover:underline">
          Sign in →
        </Link>
      </p>
    </form>
  );
}
