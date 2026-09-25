"use client";
import { useState, useTransition } from "react";
import type { Coupon } from "@/types/coupon";
import { upsertCoupon, type CouponFormValues } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type Values = {
  id?: string;
  code: string;
  kind: "percent" | "fixed";
  value: number | string;
  minSubtotalPaise: number | string;
  maxRedemptions: number | string;
  perUserLimit: number | string;
  expiresAt: string;
  active: boolean;
};

function toInitial(c?: Coupon): Values {
  return c
    ? {
        id: c.id,
        code: c.code,
        kind: c.kind,
        value: c.value,
        minSubtotalPaise: c.minSubtotalPaise,
        maxRedemptions: c.maxRedemptions ?? "",
        perUserLimit: c.perUserLimit,
        expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
        active: c.active
      }
    : {
        code: "",
        kind: "percent",
        value: 10,
        minSubtotalPaise: 0,
        maxRedemptions: "",
        perUserLimit: 1,
        expiresAt: "",
        active: true
      };
}

export function CouponForm({
  coupon,
  onSaved
}: {
  coupon?: Coupon;
  onSaved?: () => void;
}) {
  const [values, setValues] = useState<Values>(() => toInitial(coupon));
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof Values>(key: K, v: Values[K]) => setValues((s) => ({ ...s, [key]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssues({});
    setBanner(null);
    startTransition(async () => {
      const payload: CouponFormValues = {
        ...values,
        code: values.code.trim().toUpperCase(),
        value: values.value as unknown as number,
        minSubtotalPaise: values.minSubtotalPaise as unknown as number,
        maxRedemptions:
          values.maxRedemptions === "" ? null : (values.maxRedemptions as unknown as number),
        perUserLimit: values.perUserLimit as unknown as number,
        expiresAt: values.expiresAt || null
      };
      const res = await upsertCoupon(payload);
      if (res.ok) {
        onSaved?.();
        if (!coupon) setValues(toInitial());
      } else {
        setIssues(res.issues ?? {});
        setBanner(res.error === "invalid_input" ? "Please fix the highlighted fields." : res.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-card border border-border bg-cream p-5">
      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">{banner}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Code" issues={issues.code}>
          <input
            value={values.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            className={inputCls}
            placeholder="WEAVE10"
          />
        </Field>
        <Field label="Type" issues={issues.kind}>
          <select value={values.kind} onChange={(e) => set("kind", e.target.value as Values["kind"])} className={inputCls}>
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed off (paise)</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={values.kind === "percent" ? "Percent (1–100)" : "Amount (paise)"} issues={issues.value}>
          <input type="number" min={1} value={values.value} onChange={(e) => set("value", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Min subtotal (paise)" issues={issues.minSubtotalPaise}>
          <input type="number" min={0} value={values.minSubtotalPaise} onChange={(e) => set("minSubtotalPaise", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Per-user limit" issues={issues.perUserLimit} hint="0 = unlimited">
          <input type="number" min={0} value={values.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Max total redemptions" issues={issues.maxRedemptions} hint="Blank = unlimited">
          <input type="number" min={1} value={values.maxRedemptions} onChange={(e) => set("maxRedemptions", e.target.value)} className={inputCls} />
        </Field>
        <Field label="Expires on" issues={issues.expiresAt} hint="Blank = never">
          <input type="date" value={values.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} className={inputCls} />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={values.active} onChange={(e) => set("active", e.target.checked)} />
        <span>Active</span>
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : coupon ? "Save changes" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  issues,
  children
}: {
  label: string;
  hint?: string;
  issues?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
      {children}
      {hint && !issues && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
      {issues && <span className="mt-1 block text-xs text-maroon">{issues[0]}</span>}
    </label>
  );
}

const inputCls = cn(
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ink"
);
