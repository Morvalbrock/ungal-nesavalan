"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/features/auth/AuthContext";
import { AuthField, authInputCls } from "@/components/auth/AuthShell";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number")
    .optional()
    .or(z.literal(""))
});
type Form = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, refresh } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<Form>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", phone: user?.phone ?? "" }
  });

  const onSubmit = async (data: Form) => {
    setError(null);
    setNotice(null);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, phone: data.phone || undefined })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "Update failed");
      return;
    }
    await refresh();
    setNotice("Profile updated");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      <AuthField label="Full name" error={errors.name?.message}>
        <input {...register("name")} className={authInputCls} />
      </AuthField>
      <AuthField label="Email">
        <input value={user?.email ?? ""} disabled className={`${authInputCls} opacity-60`} />
      </AuthField>
      <AuthField label="Mobile" error={errors.phone?.message}>
        <input inputMode="tel" placeholder="+91 9876543210" {...register("phone")} className={authInputCls} />
      </AuthField>
      {error && <p className="text-xs text-maroon">{error}</p>}
      {notice && <p className="text-xs text-ink-soft">{notice}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
