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
      <div className="rounded-xl border border-[#e8dbf2] bg-[#f3ecf8]/80 p-5 text-sm text-slate-800">
        <p className="font-semibold text-slate-900">Password updated successfully! Redirecting to sign in…</p>
        <p className="mt-3">
          <Link href="/login" className="text-[#3c124d] font-bold hover:underline text-xs inline-flex items-center gap-1">
            <span>Proceed to sign in →</span>
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
      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          <span>{pending ? "Updating Password…" : "Update Password"}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </form>
  );
}
