import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { CartItem } from "./cart.types";
import { makeCartLineKey } from "./cart.types";

// At the input boundary, callers can leave lineKey off — the store derives it
// from variantId + size via makeCartLineKey. At rest, lineKey is always present.
export type CartItemInput = Omit<CartItem, "lineKey"> & { lineKey?: string };

interface CartState {
  items: CartItem[];
  addItem: (item: CartItemInput) => void;
  removeItem: (lineKey: string) => void;
  setQuantity: (lineKey: string, quantity: number) => void;
  clear: () => void;
}

// Dedup-key for a cart line. Same product + colour + size = one line; same
// product + colour + different size = two lines. The product scope here only
// matters to avoid collisions across the rare case of two products sharing a
// variantId, which shouldn't happen but is cheap to guard against.
function dedupeKey(item: Pick<CartItem, "productId" | "lineKey">) {
  return `${item.productId}::${item.lineKey}`;
}

const MAX_PURCHASE_LIMIT = 30;

// Persisted carts from before sizes landed won't have `lineKey` on their rows,
// and `addItem` callers (quick-add buttons across the storefront) may omit it.
// Backfill so legacy lines + new quick-adds render + dedupe consistently.
function ensureLineKey(item: CartItemInput | CartItem): CartItem {
  if (item.lineKey) return item as CartItem;
  return { ...item, lineKey: makeCartLineKey(item.variantId, item.size) } as CartItem;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const incoming = ensureLineKey(item);
          const key = dedupeKey(incoming);
          const existing = state.items.find((x) => dedupeKey(ensureLineKey(x)) === key);
          const maxAllowed = Math.min(MAX_PURCHASE_LIMIT, incoming.maxStock);
          if (existing) {
            return {
              items: state.items.map((x) =>
                dedupeKey(ensureLineKey(x)) === key
                  ? { ...x, quantity: Math.min(maxAllowed, x.quantity + incoming.quantity) }
                  : x
              )
            };
          }
          return {
            items: [
              ...state.items,
              { ...incoming, quantity: Math.min(maxAllowed, incoming.quantity) }
            ]
          };
        }),
      removeItem: (lineKey) =>
        set((state) => ({
          items: state.items.filter((x) => ensureLineKey(x).lineKey !== lineKey)
        })),
      setQuantity: (lineKey, quantity) =>
        set((state) => ({
          items: state.items
            .map((x) =>
              ensureLineKey(x).lineKey === lineKey
                ? { ...x, quantity: Math.max(1, Math.min(Math.min(MAX_PURCHASE_LIMIT, x.maxStock), quantity)) }
                : x
            )
            .filter((x) => x.quantity > 0)
        })),
      clear: () => set({ items: [] })
    }),
    {
      name: "un-cart",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, from) => {
        // v1 → v2: backfill lineKey on rows that predate sizes.
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as { items?: CartItem[] };
        if (!Array.isArray(p.items)) return persisted;
        if (from < 2) {
          p.items = p.items.map(ensureLineKey);
        }
        return p;
      },
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
  // Shipping is state-based and configured in /admin/shipping-charges — it cannot
  // be computed here because the cart doesn't know the delivery state. Callers
  // that need shipping (ReviewStep) compute it via computeShipping() and pass
  // the result into <CartSummary shippingPaise={...} />.
  return useCartStore(
    useShallow((s) => {
      const subtotal = s.items.reduce((n, i) => n + i.unitPricePaise * i.quantity, 0);
      const count = s.items.reduce((n, i) => n + i.quantity, 0);
      return { subtotal, count };
    })
  );
}
