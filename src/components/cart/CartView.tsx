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
      <div className="bg-[#faf7fd] min-h-[60vh] flex items-center justify-center">
        <Container className="py-20 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-brand-purple">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-heritage text-3xl sm:text-4xl text-brand-plum">Your Bag is Empty</h1>
          <p className="mt-2 text-sm text-purple-900/70">Once you select a handloom drape from our weavers, it will appear here.</p>
          <Link href="/products" className="btn-primary mt-8 inline-flex">
            Explore Handloom Sarees
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7fd] min-h-[75vh]">
      <Container className="py-10 sm:py-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
          Your Selection
        </span>
        <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum">Shopping Bag</h1>
        <p className="mt-1 text-sm text-purple-900/70">
          Directly from the looms of Elampillai, Salem · Authentic Handloom
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          <div className="rounded-2xl border border-purple-100 bg-white p-6 shadow-xs">
            {items.map((i) => (
              <CartLine key={i.lineKey} item={i} />
            ))}
          </div>
          <CartSummary />
        </div>
      </Container>
    </div>
  );
}
