"use client";
import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { Container } from "./Container";
import { useCartStore } from "@/features/cart/cart.store";

export function Header() {
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Ungal Nesavalan
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-muted sm:inline">
            Handloom Sarees
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/products" className="link-underline text-sm">All Sarees</Link>
          <Link href="/category/silk-sarees" className="link-underline text-sm">Silk</Link>
          <Link href="/category/bridal-sarees" className="link-underline text-sm">Bridal</Link>
          <Link href="/category/cotton-sarees" className="link-underline text-sm">Cotton</Link>
          <Link href="/category/designer-sarees" className="link-underline text-sm">Designer</Link>
        </nav>

        <div className="flex items-center gap-3 text-ink">
          <Link href="/products" aria-label="Search" className="rounded-full p-2 hover:bg-ink/5">
            <Search className="h-5 w-5" />
          </Link>
          <Link href="/account/profile" aria-label="Account" className="rounded-full p-2 hover:bg-ink/5">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative rounded-full p-2 hover:bg-ink/5">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-cream">
                {count}
              </span>
            )}
          </Link>
        </div>
      </Container>
    </header>
  );
}
