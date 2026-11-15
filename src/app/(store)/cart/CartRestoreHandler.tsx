"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartHydrated, useCartStore } from "@/features/cart/cart.store";
import type { CartItem } from "@/features/cart/cart.types";

export function CartRestoreHandler() {
  const sp = useSearchParams();
  const router = useRouter();
  const hydrated = useCartHydrated();
  const ran = useRef(false);

  useEffect(() => {
    const id = sp.get("restore");
    if (!id || ran.current) return;
    // Wait for Zustand persist to finish hydrating from localStorage before
    // mutating the store — otherwise the hydration step overwrites our
    // restored items with whatever was in localStorage (usually empty) and
    // the shopper lands on an "empty bag" screen.
    if (!hydrated) return;
    ran.current = true;

    (async () => {
      let shouldStripQuery = true;
      try {
        const res = await fetch(`/api/abandoned-cart/restore?id=${encodeURIComponent(id)}`, {
          cache: "no-store"
        });
        if (res.status === 401) {
          // Send the shopper through login and come back to /cart?restore=id.
          // Do NOT fall through to the /cart replace below, or we'd cancel
          // this redirect.
          shouldStripQuery = false;
          const next = encodeURIComponent(`/cart?restore=${id}`);
          router.replace(`/login?next=${next}`);
          return;
        }
        if (!res.ok) return;
        const data = (await res.json()) as { items: CartItem[] };
        if (!Array.isArray(data.items) || data.items.length === 0) return;

        const store = useCartStore.getState();
        store.clear();
        for (const item of data.items) {
          store.addItem(item);
        }
      } finally {
        if (shouldStripQuery) router.replace("/cart");
      }
    })();
  }, [sp, router, hydrated]);

  return null;
}
