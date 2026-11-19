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
import { PhoneOtpFlow, type PhoneFlowStep } from "./PhoneOtpFlow";
import { PasswordInput } from "@/components/ui/PasswordInput";

type AuthMode = "phone" | "email";

function TabButton({
  active,
  disabled,
  children,
  onClick
}: {
  active: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm transition-all duration-200 ${
        active
          ? "bg-[#3c124d] text-white shadow-xs font-semibold"
          : disabled
            ? "cursor-not-allowed text-slate-300"
            : "text-slate-600 hover:text-[#3c124d] font-medium"
      }`}
    >
      {children}
    </button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";
  const { refresh } = useAuth();
  const oauthError = sp.get("error");
  const [mode, setMode] = useState<AuthMode>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneFlowStep>("phone");
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

  const handleOtpSuccess = () => {
    router.push(next);
    router.refresh();
  };

  // Lock tab switching if user is in the middle of OTP verification or profile completion
  const isOtpFlowLocked = mode === "phone" && phoneStep !== "phone";

  return (
    <div className="space-y-5">
      <GoogleSignInButton />

      {/* Divider with Text */}
      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-[#e8dbf2] w-full" />
        <span className="px-3 text-xs text-slate-400 uppercase tracking-widest font-medium bg-[#faf8fc]">
          or
        </span>
        <div className="border-t border-[#e8dbf2] w-full" />
      </div>

      {/* Mode toggle */}
      <div className="relative">
        <div className="p-1 rounded-xl bg-[#f3ecf8] border border-[#e8dbf2]/60 grid grid-cols-2 gap-1 text-sm font-medium">
          <TabButton
            active={mode === "phone"}
            disabled={isOtpFlowLocked}
            onClick={() => setMode("phone")}
          >
            <span>📱 Mobile OTP</span>
          </TabButton>
          <TabButton
            active={mode === "email"}
            disabled={isOtpFlowLocked}
            onClick={() => setMode("email")}
          >
            <span>🔑 Password</span>
          </TabButton>
        </div>
        {isOtpFlowLocked && (
          <p className="mt-1.5 text-center text-[10px] text-slate-500">
            Verification in progress. Click &ldquo;Change&rdquo; above to switch methods.
          </p>
        )}
      </div>

      {mode === "phone" ? (
        <PhoneOtpFlow
          onSuccess={handleOtpSuccess}
          onStepChange={setPhoneStep}
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthField label="Email or Mobile Number" error={errors.email?.message}>
            <input
              type="text"
              autoComplete="username"
              placeholder="you@example.com or 9876543210"
              {...register("email")}
              className={authInputCls}
            />
          </AuthField>

          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs text-[#3c124d] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              autoComplete="current-password"
              placeholder="••••••••••••"
              {...register("password")}
              error={!!errors.password}
            />
            {errors.password?.message && (
              <span className="mt-1 block text-xs text-rose-600 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {serverError && <p className="text-xs text-rose-600 font-medium">{serverError}</p>}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3c124d] to-[#4e1a61] hover:from-[#320f41] hover:to-[#441455] text-white font-medium text-sm rounded-xl shadow-md glow-purple transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isSubmitting ? "Signing in…" : "Sign in to Account"}</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          <div className="pt-2 text-center text-xs text-slate-600">
            <span>New to Ungal Nesavalan?</span>
            <Link
              href={`/register${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`}
              className="text-[#3c124d] font-bold hover:underline ml-1 inline-flex items-center gap-1"
            >
              <span>Create an account</span>
              <span>→</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
