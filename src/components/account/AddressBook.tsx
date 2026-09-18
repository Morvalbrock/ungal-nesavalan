"use client";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Address } from "@/types/address";
import { INDIAN_STATES } from "@/features/checkout/checkout.schema";
import { AuthField, authInputCls } from "@/components/auth/AuthShell";

const schema = z.object({
  fullName: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().regex(/^(\+91[- ]?)?[6-9]\d{9}$/, "Invalid phone"),
  line1: z.string().trim().min(4, "Address is too short"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.enum(INDIAN_STATES, { message: "Select a state" }),
  pincode: z.string().trim().regex(/^\d{6}$/, "6-digit pincode"),
  isDefault: z.boolean().optional()
});
type FormValues = z.infer<typeof schema>;

export function AddressBook() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/account/addresses", { cache: "no-store" });
    const data = await res.json();
    setItems(data.addresses ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { isDefault: false } });

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, country: "India" })
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? "Could not save address");
      return;
    }
    reset();
    setShowForm(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    await load();
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true })
    });
    await load();
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="h-4 w-40 animate-pulse rounded bg-ink/5" />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-muted">You haven't saved an address yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <li key={a.id} className="rounded-card border border-border p-4 text-sm">
              <div className="flex items-start justify-between">
                <p className="font-medium">{a.fullName}</p>
                {a.isDefault ? (
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-gold">
                    Default
                  </span>
                ) : (
                  <button type="button" onClick={() => setDefault(a.id)} className="text-[10px] uppercase tracking-widest text-ink-muted hover:text-ink">
                    Make default
                  </button>
                )}
              </div>
              <p className="mt-1 leading-relaxed">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.pincode}
                <br />
                {a.country} · {a.phone}
              </p>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="mt-3 text-xs text-maroon underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-card border border-border p-5 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center justify-between">
            <p className="font-display text-lg">New address</p>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-ink-muted hover:text-ink">
              Cancel
            </button>
          </div>
          <AuthField label="Full name" error={errors.fullName?.message}>
            <input {...register("fullName")} className={authInputCls} />
          </AuthField>
          <AuthField label="Phone" error={errors.phone?.message}>
            <input inputMode="tel" placeholder="+91 9876543210" {...register("phone")} className={authInputCls} />
          </AuthField>
          <div className="sm:col-span-2">
            <AuthField label="Address line 1" error={errors.line1?.message}>
              <input {...register("line1")} className={authInputCls} />
            </AuthField>
          </div>
          <div className="sm:col-span-2">
            <AuthField label="Address line 2 (optional)" error={errors.line2?.message}>
              <input {...register("line2")} className={authInputCls} />
            </AuthField>
          </div>
          <AuthField label="City" error={errors.city?.message}>
            <input {...register("city")} className={authInputCls} />
          </AuthField>
          <AuthField label="State" error={errors.state?.message}>
            <select {...register("state")} className={authInputCls} defaultValue="">
              <option value="" disabled>Select a state</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </AuthField>
          <AuthField label="Pincode" error={errors.pincode?.message}>
            <input inputMode="numeric" maxLength={6} {...register("pincode")} className={authInputCls} />
          </AuthField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isDefault")} />
            <span>Set as default</span>
          </label>
          {error && <p className="sm:col-span-2 text-xs text-maroon">{error}</p>}
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)} className="btn-ghost">
          + Add a new address
        </button>
      )}
    </div>
  );
}
