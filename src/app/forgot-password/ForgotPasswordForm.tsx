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
      <div className="rounded-card border border-border bg-cream-warm/50 p-4 text-sm text-ink-soft">
        <p>
          If an account exists for <strong>{email}</strong>, we’ve sent a password reset link.
          Please check your inbox (and spam folder).
        </p>
        <p className="mt-3">
          <Link href="/login" className="link-underline">
            ← Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField label="Email">
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputCls}
        />
      </AuthField>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-xs text-ink-muted">
        Remember your password?{" "}
        <Link href="/login" className="link-underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
