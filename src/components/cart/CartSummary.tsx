"use client";
import Link from "next/link";
import { useCartTotals } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import { formatINR } from "@/lib/utils";

export function CartSummary({ showCheckoutButton = true }: { showCheckoutButton?: boolean }) {
  const { subtotal, shipping, total: rawTotal, count } = useCartTotals();
  const applied = useAppliedCouponStore((s) => s.coupon);
  const discount = applied?.subtotalPaise === subtotal ? applied.discountPaise : 0;
  const total = Math.max(0, rawTotal - discount);
  const freeShippingRemaining = 500000 - subtotal;

  return (
    <div className="rounded-card border border-border bg-cream-warm/40 p-6">
      <h2 className="font-display text-xl">Order Summary</h2>

      {subtotal > 0 && freeShippingRemaining > 0 && (
        <p className="mt-3 rounded-card bg-gold/10 px-3 py-2 text-xs text-ink-soft">
          Add {formatINR(freeShippingRemaining)} more for free shipping.
        </p>
      )}

      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">Subtotal ({count} item{count === 1 ? "" : "s"})</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        {discount > 0 && applied && (
          <div className="flex justify-between text-maroon">
            <dt>Coupon {applied.code}</dt>
            <dd>−{formatINR(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-muted">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-border/70 pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatINR(total)}</dd>
        </div>
      </dl>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          aria-disabled={count === 0}
          className={`btn-primary mt-6 w-full ${count === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          Proceed to checkout
        </Link>
      )}

      <p className="mt-4 text-[11px] uppercase tracking-widest text-ink-muted">
        Secure payment · GST included · Handloom Mark certified
      </p>
    </div>
  );
}
