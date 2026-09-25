"use client";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

type Mode = "guest" | "user";

interface WishlistState {
  productIds: string[];
  mode: Mode;
  has: (productId: string) => boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  setMode: (mode: Mode) => void;
  hydrateFromServer: (productIds: string[]) => void;
  clear: () => void;
}

async function serverAdd(productId: string) {
  await fetch("/api/wishlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  });
}

async function serverRemove(productId: string) {
  await fetch("/api/wishlist", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId })
  });
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      mode: "guest",
      has: (productId) => get().productIds.includes(productId),
      add: async (productId) => {
        if (get().has(productId)) return;
        set((s) => ({ productIds: [...s.productIds, productId] }));
        if (get().mode === "user") await serverAdd(productId);
      },
      remove: async (productId) => {
        if (!get().has(productId)) return;
        set((s) => ({ productIds: s.productIds.filter((id) => id !== productId) }));
        if (get().mode === "user") await serverRemove(productId);
      },
      toggle: async (productId) => {
        const next = !get().has(productId);
        if (next) await get().add(productId);
        else await get().remove(productId);
        return next;
      },
      setMode: (mode) => set({ mode }),
      hydrateFromServer: (productIds) => set({ productIds, mode: "user" }),
      clear: () => set({ productIds: [], mode: "guest" })
    }),
    {
      name: "un-wishlist",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist for guests. Users' state lives on the server and rehydrates via hydrateFromServer.
      partialize: (s) => (s.mode === "guest" ? { productIds: s.productIds, mode: s.mode } : { productIds: [], mode: s.mode })
    }
  )
);

export function useWishlistHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useWishlistStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useWishlistStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
}

export function useWishlistCount(): number {
  return useWishlistStore(useShallow((s) => s.productIds.length));
}

export function useWishlistHas(productId: string): boolean {
  return useWishlistStore((s) => s.productIds.includes(productId));
}
