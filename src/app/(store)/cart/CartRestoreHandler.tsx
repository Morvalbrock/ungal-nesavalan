"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/features/cart/cart.store";
import type { CartItem } from "@/features/cart/cart.types";

export function CartRestoreHandler() {
  const sp = useSearchParams();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    const id = sp.get("restore");
    if (!id || ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await fetch(`/api/abandoned-cart/restore?id=${encodeURIComponent(id)}`, {
          cache: "no-store"
        });
        if (res.status === 401) {
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
        router.replace("/cart");
      }
    })();
  }, [sp, router]);

  return null;
}
