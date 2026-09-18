"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CartLine } from "@/components/cart/CartLine";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCartStore, useCartTotals } from "@/features/cart/cart.store";
import type { AddressForm } from "@/features/checkout/checkout.schema";

export function ReviewStep({ address, onEdit }: { address: AddressForm; onEdit: () => void }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const totals = useCartTotals();
  const [placing, setPlacing] = useState(false);

  const placeOrder = async () => {
    setPlacing(true);
    const payload = {
      address,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise
      })),
      totals: { subtotal: totals.subtotal, shipping: totals.shipping, total: totals.total }
    };
    console.info("[checkout] order payload (Razorpay integration lands in Phase 5)", payload);
    await new Promise((r) => setTimeout(r, 400));
    clear();
    router.push("/");
    setTimeout(() => alert("Order placed (stub). Razorpay integration lands in Phase 5."), 200);
  };

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

        <button type="button" onClick={placeOrder} disabled={placing} className="btn-primary w-full sm:w-auto">
          {placing ? "Placing order…" : "Place order"}
        </button>
        <p className="text-xs text-ink-muted">
          Payment integration (Razorpay) arrives in Phase 5. Placing now will simulate an order and clear your bag.
        </p>
      </div>

      <div>
        <CartSummary showCheckoutButton={false} />
      </div>
    </div>
  );
}
