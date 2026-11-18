"use client";
import { useState, useTransition } from "react";
import { Tag, X } from "lucide-react";
import { useCartTotals } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import { formatINR } from "@/lib/utils";

export function CouponBox() {
  const { subtotal } = useCartTotals();
  const applied = useAppliedCouponStore((s) => s.coupon);
  const apply = useAppliedCouponStore((s) => s.apply);
  const clear = useAppliedCouponStore((s) => s.clear);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Reapply / drop the coupon if the subtotal changed since it was applied.
  if (applied && applied.subtotalPaise !== subtotal) {
    clear();
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/checkout/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotalPaise: subtotal })
      });
      const data = (await res.json().catch(() => ({}))) as {
        code?: string;
        kind?: "percent" | "fixed";
        value?: number;
        discountPaise?: number;
        message?: string;
      };
      if (!res.ok || !data.code || !data.kind || data.discountPaise == null) {
        setError(data.message ?? "That code isn't valid.");
        return;
      }
      apply({
        code: data.code,
        kind: data.kind,
        value: data.value ?? 0,
        discountPaise: data.discountPaise,
        subtotalPaise: subtotal
      });
      const { track } = await import("@/features/analytics/track");
      track.applyCoupon({ code: data.code, discountInr: Math.round(data.discountPaise / 100) });
      setCode("");
    });
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 px-4 py-3 text-sm text-purple-950">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-brand-purple" />
          <span>
            <strong className="text-brand-plum">{applied.code}</strong> applied — {formatINR(applied.discountPaise)} discount
          </span>
        </div>
        <button
          type="button"
          onClick={() => clear()}
          className="rounded-full p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          aria-label="Remove coupon"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 rounded-xl border border-purple-200 bg-purple-50/20 px-3.5 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-purple focus:bg-white focus:ring-2 focus:ring-brand-purple/20"
        />
        <button type="submit" disabled={pending || !code.trim()} className="btn-ghost rounded-xl !border-purple-300 hover:!bg-purple-50 !text-brand-plum text-xs font-semibold px-4">
          {pending ? "Checking…" : "Apply Code"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </form>
  );
}
