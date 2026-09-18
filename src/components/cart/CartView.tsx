"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { useCartHydrated, useCartStore } from "@/features/cart/cart.store";
import { CartLine } from "./CartLine";
import { CartSummary } from "./CartSummary";

export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);

  if (!hydrated) {
    return (
      <Container className="py-16">
        <div className="h-6 w-40 animate-pulse rounded bg-ink/5" />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-ink-muted" />
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-ink-muted">Once you add a saree, it will show up here.</p>
        <Link href="/products" className="btn-primary mt-8 inline-flex">
          Explore sarees
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl">Your Bag</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Review your selection before checkout. Handpicked, hand-loomed, shipped from India.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {items.map((i) => (
            <CartLine key={i.variantId} item={i} />
          ))}
        </div>
        <CartSummary />
      </div>
    </Container>
  );
}
