import { create } from "zustand";
import type { CartItem } from "./cart.types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((x) => x.productId === item.productId);
    if (existing) {
      return { items: state.items.map((x) => x.productId === item.productId ? { ...x, quantity: x.quantity + item.quantity } : x) };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((x) => x.productId !== productId) })),
  clear: () => set({ items: [] })
}));
