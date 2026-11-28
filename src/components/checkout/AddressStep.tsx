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
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-purple-100 bg-white p-6 sm:p-8 shadow-xs">
        <div>
          <h2 className="font-heritage text-2xl font-bold text-brand-plum">Delivery Address</h2>
          <p className="mt-1 text-xs text-purple-900/60">Enter the destination for your Elampillai handloom package.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name" error={errors.fullName?.message}>
            <input {...register("fullName")} className={inputCls(!!errors.fullName)} autoComplete="name" placeholder="e.g. Priyadarshini" />
          </Field>
          <Field label="Mobile Number" error={errors.phone?.message}>
            <input {...register("phone")} className={inputCls(!!errors.phone)} inputMode="tel" placeholder="+91 9876543210" />
          </Field>
        </div>

        <Field label="Email Address (Optional)" error={errors.email?.message}>
          <input {...register("email")} type="email" className={inputCls(!!errors.email)} autoComplete="email" placeholder="you@example.com" />
        </Field>

        <Field label="Street Address / Door No" error={errors.line1?.message}>
          <input {...register("line1")} className={inputCls(!!errors.line1)} placeholder="Door no., building, street" autoComplete="address-line1" />
        </Field>

        <Field label="Landmark / Area (Optional)" error={errors.line2?.message}>
          <input {...register("line2")} className={inputCls(!!errors.line2)} placeholder="Near temple, cross road, apartment name" autoComplete="address-line2" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City / Town" error={errors.city?.message}>
            <input {...register("city")} className={inputCls(!!errors.city)} autoComplete="address-level2" placeholder="e.g. Chennai" />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <select {...register("state")} className={inputCls(!!errors.state)} defaultValue="">
              <option value="" disabled>Select State</option>
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="6-Digit Pincode" error={errors.pincode?.message}>
            <input {...register("pincode")} className={inputCls(!!errors.pincode)} inputMode="numeric" maxLength={6} autoComplete="postal-code" placeholder="600001" />
          </Field>
        </div>

        <Field label="Order Notes & Special Instructions (Optional)" error={errors.notes?.message}>
          <textarea {...register("notes")} rows={3} className={inputCls(!!errors.notes)} placeholder="e.g. Call before delivery, handle with care, gift packing…" />
        </Field>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto font-semibold">
          Continue to Review &amp; Payment →
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
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-purple-900/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600 font-medium">{error}</span>}
    </label>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full rounded-xl border bg-purple-50/20 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20",
    hasError ? "border-rose-400 bg-rose-50/30" : "border-purple-200"
  );
}
