import { create } from "zustand";

interface SelectedVariantState {
  productId: string | null;
  variantId: string | null;
  select: (productId: string, variantId: string) => void;
  reset: () => void;
}

export const useSelectedVariantStore = create<SelectedVariantState>((set) => ({
  productId: null,
  variantId: null,
  select: (productId, variantId) => set({ productId, variantId }),
  reset: () => set({ productId: null, variantId: null })
}));
