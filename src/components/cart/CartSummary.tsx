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
    <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-xs">
      <h2 className="font-heritage text-2xl font-bold text-brand-plum">Order Summary</h2>

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-purple-900/70 font-medium">Subtotal ({count} item{count === 1 ? "" : "s"})</dt>
          <dd className="font-semibold text-slate-800">{formatINR(subtotal)}</dd>
        </div>
        {discount > 0 && applied && (
          <div className="flex justify-between text-amber-700 font-medium">
            <dt>Coupon Applied ({applied.code})</dt>
            <dd>−{formatINR(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-purple-900/70 font-medium">Shipping</dt>
          <dd>
            {!shippingKnown ? (
              <span className="text-xs text-purple-900/60 font-medium">Calculated at checkout</span>
            ) : shippingPaise === 0 ? (
              <span className="text-emerald-700 font-bold">Free</span>
            ) : (
              <span className="font-semibold text-slate-800">{formatINR(shippingPaise)}</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between border-t border-purple-100 pt-3 text-lg font-bold text-brand-plum font-heritage">
          <dt>Total Amount</dt>
          <dd className="text-xl font-bold">{formatINR(total)}</dd>
        </div>
      </dl>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          aria-disabled={count === 0}
          className={`btn-primary mt-6 w-full font-semibold shadow-md shadow-brand-deep/20 ${count === 0 ? "pointer-events-none opacity-40" : ""}`}
        >
          Proceed to Checkout
        </Link>
      )}

      <div className="mt-4 rounded-xl bg-purple-50/60 p-3 border border-purple-100 text-center text-xs text-purple-900/70">
        100% Weaver Direct · Authentic Handloom · Secure Checkout
      </div>
    </div>
  );
}
