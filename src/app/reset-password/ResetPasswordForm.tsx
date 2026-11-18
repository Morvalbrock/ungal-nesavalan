"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthField, authInputCls } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/ui/PasswordInput";
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="font-semibold">Password updated successfully! Redirecting to sign in…</p>
        <p className="mt-3">
          <Link href="/login" className="text-brand-purple font-semibold hover:underline text-xs">
            Proceed to sign in →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <AuthField label="New Password">
        <PasswordInput
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </AuthField>
      <AuthField label="Confirm New Password" error={error ?? undefined}>
        <PasswordInput
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="Re-enter password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={!!error}
        />
      </AuthField>
      <button type="submit" disabled={pending} className="btn-primary w-full font-semibold shadow-md shadow-brand-deep/20 py-3">
        {pending ? "Updating Password…" : "Update Password"}
      </button>
    </form>
  );
}
