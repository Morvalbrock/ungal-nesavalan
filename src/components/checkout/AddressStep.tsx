"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, INDIAN_STATES, type AddressForm } from "@/features/checkout/checkout.schema";
import { CartSummary } from "@/components/cart/CartSummary";
import { cn } from "@/lib/utils";

export function AddressStep({
  initial,
  onSubmit
}: {
  initial?: AddressForm;
  onSubmit: (data: AddressForm) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "India", ...initial }
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <h2 className="font-display text-2xl">Shipping address</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.fullName?.message}>
            <input {...register("fullName")} className={inputCls(!!errors.fullName)} autoComplete="name" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <input {...register("phone")} className={inputCls(!!errors.phone)} inputMode="tel" placeholder="+91 9876543210" />
          </Field>
        </div>

        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} type="email" className={inputCls(!!errors.email)} autoComplete="email" />
        </Field>

        <Field label="Address line 1" error={errors.line1?.message}>
          <input {...register("line1")} className={inputCls(!!errors.line1)} placeholder="House / flat, street" autoComplete="address-line1" />
        </Field>

        <Field label="Address line 2 (optional)" error={errors.line2?.message}>
          <input {...register("line2")} className={inputCls(!!errors.line2)} placeholder="Landmark, area" autoComplete="address-line2" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City" error={errors.city?.message}>
            <input {...register("city")} className={inputCls(!!errors.city)} autoComplete="address-level2" />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <select {...register("state")} className={inputCls(!!errors.state)} defaultValue="">
              <option value="" disabled>Select a state</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Pincode" error={errors.pincode?.message}>
            <input {...register("pincode")} className={inputCls(!!errors.pincode)} inputMode="numeric" maxLength={6} autoComplete="postal-code" />
          </Field>
        </div>

        <Field label="Order notes (optional)" error={errors.notes?.message}>
          <textarea {...register("notes")} rows={3} className={inputCls(!!errors.notes)} placeholder="Delivery instructions, gifting note…" />
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          Continue to review
        </button>
      </form>

      <div>
        <CartSummary showCheckoutButton={false} />
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-maroon">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-card border bg-transparent px-3 py-2.5 text-sm outline-none transition focus:border-ink",
    hasError ? "border-maroon" : "border-border"
  );
}
