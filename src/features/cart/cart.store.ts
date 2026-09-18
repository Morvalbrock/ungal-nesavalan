import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem } from "./cart.types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
}

function keyFor(item: Pick<CartItem, "productId" | "variantId">) {
  return `${item.productId}::${item.variantId}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const key = keyFor(item);
          const existing = state.items.find((x) => keyFor(x) === key);
          if (existing) {
            return {
              items: state.items.map((x) =>
                keyFor(x) === key
                  ? { ...x, quantity: Math.min(item.maxStock, x.quantity + item.quantity) }
                  : x
              )
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(item.maxStock, item.quantity) }]
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((x) => x.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((x) =>
              x.variantId === variantId
                ? { ...x, quantity: Math.max(1, Math.min(x.maxStock, quantity)) }
                : x
            )
            .filter((x) => x.quantity > 0)
        })),
      clear: () => set({ items: [] })
    }),
    {
      name: "un-cart",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({ items: state.items })
    }
  )
);

export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useCartStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

export function useCartTotals() {
  return useCartStore((s) => {
    const subtotal = s.items.reduce((n, i) => n + i.unitPricePaise * i.quantity, 0);
    const count = s.items.reduce((n, i) => n + i.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= 500000 ? 0 : 9900;
    const total = subtotal + shipping;
    return { subtotal, shipping, total, count };
  });
}
