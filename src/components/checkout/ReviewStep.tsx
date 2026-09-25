"use client";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore, useCartTotals } from "@/features/cart/cart.store";
import { useAppliedCouponStore } from "@/features/coupons/applied-coupon.store";
import type { AddressForm } from "@/features/checkout/checkout.schema";
import { CouponBox } from "./CouponBox";
import { PayButton } from "./PayButton";

export function ReviewStep({ address, onEdit }: { address: AddressForm; onEdit: () => void }) {
  const items = useCartStore((s) => s.items);
  const totals = useCartTotals();
  const applied = useAppliedCouponStore((s) => s.coupon);
  const discount = applied?.subtotalPaise === totals.subtotal ? applied.discountPaise : 0;
  const payable = Math.max(0, totals.total - discount);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Shipping to</h2>
            <button type="button" onClick={onEdit} className="text-sm underline text-ink-muted hover:text-ink">
              Edit
            </button>
          </div>
          <div className="mt-3 rounded-card border border-border p-4 text-sm leading-relaxed">
            <p className="font-medium">{address.fullName}</p>
            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            <p>{address.city}, {address.state} {address.pincode}</p>
            <p>{address.country} · {address.phone}</p>
            <p className="text-ink-muted">{address.email}</p>
            {address.notes && <p className="mt-2 text-ink-soft">Note: {address.notes}</p>}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Your order</h2>
          <div className="mt-3">
            {items.map((i) => <CartLine key={i.variantId} item={i} compact />)}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Coupon</h2>
          <div className="mt-3">
            <CouponBox />
          </div>
        </section>

        <PayButton
          address={address}
          amountPaise={payable}
          couponCode={applied?.code}
          disabled={items.length === 0}
        />
      </div>

      <div>
        <CartSummary showCheckoutButton={false} />
      </div>
    </div>
  );
}
