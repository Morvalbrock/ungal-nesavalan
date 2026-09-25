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
      <div className="flex items-center justify-between rounded-card border border-maroon/40 bg-maroon/5 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-maroon" />
          <span>
            <strong>{applied.code}</strong> applied — {formatINR(applied.discountPaise)} off
          </span>
        </div>
        <button
          type="button"
          onClick={() => clear()}
          className="rounded p-1 text-ink-muted hover:text-maroon"
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
          placeholder="Coupon code"
          className="flex-1 rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <button type="submit" disabled={pending || !code.trim()} className="btn-ghost">
          {pending ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-maroon">{error}</p>}
    </form>
  );
}
