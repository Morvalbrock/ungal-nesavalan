"use client";

// Typed event helpers. Every helper is a thin wrapper around window.plausible so
// call sites don't need to know if analytics is even wired up.

type Props = Record<string, string | number>;

function fire(name: string, props?: Props) {
  if (typeof window === "undefined") return;
  const p = (window as unknown as { plausible?: (name: string, opts?: { props?: Props }) => void }).plausible;
  if (!p) return;
  try {
    p(name, props ? { props } : undefined);
  } catch {
    /* noop — analytics must never throw into product flows */
  }
}

export const track = {
  addToCart(input: { productId: string; variantId: string; priceInr: number }) {
    fire("Add to cart", { ...input });
  },
  beginCheckout(input: { subtotalInr: number; itemCount: number }) {
    fire("Begin checkout", { ...input });
  },
  applyCoupon(input: { code: string; discountInr: number }) {
    fire("Apply coupon", { ...input });
  },
  purchase(input: { orderId: string; revenueInr: number; couponCode?: string }) {
    fire("Purchase", input.couponCode ? input : { orderId: input.orderId, revenueInr: input.revenueInr });
  },
  viewWishlist(input: { count: number }) {
    fire("View wishlist", { ...input });
  }
};
