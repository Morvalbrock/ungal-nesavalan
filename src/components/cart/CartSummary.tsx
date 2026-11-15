"use client";
import Link from "next/link";
import { useCartTotals } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import { formatINR } from "@/lib/utils";

export function CartSummary({
  showCheckoutButton = true,
  shippingPaise
}: {
  showCheckoutButton?: boolean;
  // When undefined, the summary renders "Calculated at checkout" and omits
  // shipping from the total — because shipping is state-based and the state
  // isn't known until the customer picks it in checkout step 2.
  shippingPaise?: number;
}) {
  const { subtotal, count } = useCartTotals();
  const applied = useAppliedCouponStore((s) => s.coupon);
  const discount = applied?.subtotalPaise === subtotal ? applied.discountPaise : 0;
  const shippingKnown = typeof shippingPaise === "number";
  const total = Math.max(0, subtotal - discount + (shippingKnown ? shippingPaise : 0));

  return (
    <div className="rounded-card border border-border bg-cream-warm/40 p-6">
      <h2 className="font-display text-xl">Order Summary</h2>

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
          <dd>
            {!shippingKnown ? (
              <span className="text-xs text-ink-muted">Calculated at checkout</span>
            ) : shippingPaise === 0 ? (
              "Free"
            ) : (
              formatINR(shippingPaise)
            )}
          </dd>
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
