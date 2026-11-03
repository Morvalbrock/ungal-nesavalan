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
      className={`flex-1 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
        active
          ? "bg-ink text-white"
          : disabled
            ? "cursor-not-allowed text-ink-muted/40"
            : "text-ink-muted hover:bg-cream"
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

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-ink-muted">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Mode toggle */}
      <div className="relative">
        <div className="flex gap-1 rounded-full border border-border p-1">
          <TabButton
            active={mode === "phone"}
            disabled={isOtpFlowLocked}
            onClick={() => setMode("phone")}
          >
            📱 Mobile OTP
          </TabButton>
          <TabButton
            active={mode === "email"}
            disabled={isOtpFlowLocked}
            onClick={() => setMode("email")}
          >
            ✉️ Email
          </TabButton>
        </div>
        {isOtpFlowLocked && (
          <p className="mt-1.5 text-center text-[10px] text-ink-muted">
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
          <AuthField label="Email" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              className={authInputCls}
            />
          </AuthField>

          <AuthField label="Password" error={errors.password?.message}>
            <PasswordInput
              autoComplete="current-password"
              {...register("password")}
              error={!!errors.password}
            />
          </AuthField>

          {serverError && <p className="text-xs text-maroon">{serverError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <Link href="/forgot-password" className="link-underline">
              Forgot password?
            </Link>
            <Link
              href={`/register${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`}
              className="link-underline"
            >
              Create account
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
