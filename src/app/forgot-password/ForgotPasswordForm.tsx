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
      <div className="rounded-xl border border-[#e8dbf2] bg-[#f3ecf8]/80 p-5 text-sm text-slate-800">
        <p className="leading-relaxed">
          If an account exists for <strong className="text-[#3c124d]">{email}</strong>, we&apos;ve sent a secure password reset link.
          Please check your inbox (and spam folder).
        </p>
        <p className="mt-4">
          <Link href="/login" className="text-[#3c124d] font-bold hover:underline text-xs inline-flex items-center gap-1">
            <span>← Return to sign in</span>
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
          placeholder="patron@royalatelier.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputCls}
        />
      </AuthField>
      <div className="pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
        >
          <span>{pending ? "Sending…" : "Send Reset Link"}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
      <p className="text-xs text-slate-600 text-center pt-2">
        Remember your password?{" "}
        <Link href="/login" className="text-[#3c124d] font-bold hover:underline ml-1">
          Sign in →
        </Link>
      </p>
    </form>
  );
}
