"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthField } from "@/components/auth/AuthShell";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

const createPasswordSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: z.string().optional(),
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your new password")
    })
    .superRefine((data, ctx) => {
      if (hasPassword && !data.currentPassword?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your current password",
          path: ["currentPassword"]
        });
      }
      if (data.newPassword !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirmPassword"]
        });
      }
    });

type PasswordFormValues = z.infer<ReturnType<typeof createPasswordSchema>>;

export function ChangePasswordForm() {
  const { user, refresh } = useAuth();
  const hasPassword = Boolean(user?.hasPassword);

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const schema = createPasswordSchema(hasPassword);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setServerError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword || undefined,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(body.message ?? "Failed to update password. Please try again.");
        return;
      }

      setSuccessMsg(body.message ?? (hasPassword ? "Password changed successfully." : "Password set successfully."));
      reset();
      await refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="max-w-md rounded-card border border-border bg-cream-warm/40 p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3 border-b border-border/80 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink">
          {hasPassword ? <KeyRound className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">
            {hasPassword ? "Change Password" : "Set Account Password"}
          </h3>
          <p className="text-xs text-ink-muted">
            {hasPassword
              ? "Ensure your account is using a long, random password to stay secure."
              : "Enable password sign-in for your account so you can log in with email or phone."}
          </p>
        </div>
      </div>

      {!hasPassword && (
        <div className="mb-5 flex items-start gap-2.5 rounded-card border border-gold-deep/30 bg-gold-soft/10 p-3 text-xs leading-relaxed text-ink-soft">
          <ShieldCheck className="h-4 w-4 shrink-0 text-gold-deep mt-0.5" />
          <span>
            You currently log in using <strong>Mobile OTP</strong> or <strong>Google</strong>. Set a password below to also enable password-based sign in anytime!
          </span>
        </div>
      )}

      {serverError && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-maroon/40 bg-maroon/10 p-3 text-xs text-maroon">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-card border border-moss/40 bg-moss/10 p-3 text-xs text-moss">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {hasPassword && (
          <div>
            <AuthField label="Current Password" error={errors.currentPassword?.message}>
              <PasswordInput
                autoComplete="current-password"
                placeholder="Enter current password"
                error={!!errors.currentPassword}
                {...register("currentPassword")}
              />
            </AuthField>
            <div className="mt-1 text-right">
              <Link href="/forgot-password" className="text-[11px] text-ink-muted hover:text-ink underline">
                Forgot current password?
              </Link>
            </div>
          </div>
        )}

        <AuthField label={hasPassword ? "New Password" : "Password"} error={errors.newPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            placeholder="At least 8 characters"
            error={!!errors.newPassword}
            {...register("newPassword")}
          />
        </AuthField>

        <AuthField label="Confirm New Password" error={errors.confirmPassword?.message}>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Re-enter new password"
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </AuthField>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Updating Password…" : hasPassword ? "Update Password" : "Set Password"}
        </button>
      </form>
    </div>
  );
}
