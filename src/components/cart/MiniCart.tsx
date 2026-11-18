"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartHydrated, useCartStore, useCartTotals } from "@/features/cart/cart.store";
import { formatINR } from "@/lib/utils";
import { CartLine } from "./CartLine";

export function MiniCart() {
  const [open, setOpen] = useState(false);
  const hydrated = useCartHydrated();
  const items = useCartStore((s) => s.items);
  const { subtotal, count } = useCartTotals();
  const rootRef = useRef<HTMLDivElement>(null);
  const showCount = hydrated && count > 0;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cart"
        aria-expanded={open}
        className="relative rounded-full p-2 text-slate-700 hover:text-brand-purple hover:bg-purple-50 transition"
      >
        <ShoppingBag className="h-5 w-5" />
        {showCount && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep px-1 text-[10px] font-bold text-white border-2 border-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] rounded-2xl border border-purple-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-purple-100 px-4 py-3">
            <p className="font-heritage font-bold text-lg text-brand-plum">Your Bag</p>
            <span className="text-xs text-purple-900/60 font-medium">{count} item{count === 1 ? "" : "s"}</span>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-purple-900/60">
              Your bag is empty.
              <Link href="/products" onClick={() => setOpen(false)} className="mt-3 block text-brand-purple hover:underline font-medium">
                Browse sarees →
              </Link>
            </div>
          ) : (
            <>
              <div className="max-h-80 overflow-y-auto px-4">
                {items.map((i) => (
                  <CartLine key={i.variantId} item={i} compact />
                ))}
              </div>
              <div className="border-t border-purple-100 px-4 py-4 bg-purple-50/30 rounded-b-2xl">
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-purple-900/70 font-medium">Subtotal</span>
                  <span className="font-heritage font-bold text-base text-brand-plum">{formatINR(subtotal)}</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/cart" onClick={() => setOpen(false)} className="btn-ghost flex-1 text-center py-2 text-xs font-semibold">
                    View Cart
                  </Link>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary flex-1 text-center py-2 text-xs font-semibold">
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
