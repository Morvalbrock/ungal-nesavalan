"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthField, authInputCls } from "@/components/auth/AuthShell";
import { submitResetPassword } from "./actions";

export function ResetPasswordForm({ id, token }: { id: string; token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don’t match");
      return;
    }
    startTransition(async () => {
      const res = await submitResetPassword({ id, token, password });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    });
  }

  if (done) {
    return (
      <div className="rounded-card border border-border bg-cream-warm/50 p-4 text-sm text-ink-soft">
        <p>Password updated. Redirecting to sign in…</p>
        <p className="mt-3">
          <Link href="/login" className="link-underline">
            Go to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField label="New password">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputCls}
        />
      </AuthField>
      <AuthField label="Confirm new password" error={error ?? undefined}>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={authInputCls}
        />
      </AuthField>
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
