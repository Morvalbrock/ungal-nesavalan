"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "./wishlist.store";

// Owns the guest→user handoff for wishlist + cart on login, clears state on logout,
// and keeps the server cart in sync with the client while a user is logged in
// (so a second device sees the same cart after login). Rendered once from root layout.
export function WishlistBoot() {
  const { user } = useAuth();
  const lastUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const prev = lastUserId.current;
    lastUserId.current = user?.id ?? null;

    if (prev === undefined) {
      if (user) void handleLogin();
      return;
    }
    const wasLoggedIn = prev !== null;
    const isLoggedIn = user !== null;
    if (!wasLoggedIn && isLoggedIn) void handleLogin();
    else if (wasLoggedIn && !isLoggedIn) handleLogout();
  }, [user]);

  // Push cart changes to the server for the logged-in user, debounced.
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let first = true;
    const unsub = useCartStore.subscribe((state) => {
      if (first) {
        first = false;
        return;
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: state.items })
        }).catch(() => undefined);
      }, 600);
    });
    return () => {
      if (timer) clearTimeout(timer);
      unsub();
    };
  }, [user]);

  return null;
}

async function handleLogin() {
  const wl = useWishlistStore.getState();
  const localIds = wl.productIds;

  // 1. Merge any guest wishlist into the server.
  if (localIds.length > 0) {
    await fetch("/api/wishlist/merge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: localIds })
    }).catch(() => undefined);
  }
  // 2. Rehydrate wishlist from server.
  try {
    const res = await fetch("/api/wishlist", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { items: { productId: string }[] };
      wl.hydrateFromServer(data.items.map((i) => i.productId));
    } else {
      wl.hydrateFromServer(localIds);
    }
  } catch {
    wl.hydrateFromServer(localIds);
  }

  // 3. Merge guest cart into the server cart, then rehydrate the store.
  const cart = useCartStore.getState();
  if (cart.items.length > 0) {
    try {
      const res = await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.items })
      });
      if (res.ok) {
        const data = (await res.json()) as { items: typeof cart.items };
        useCartStore.setState({ items: data.items });
      }
    } catch {
      /* keep local */
    }
  }
}

function handleLogout() {
  useWishlistStore.getState().clear();
  useCartStore.getState().clear();
}
