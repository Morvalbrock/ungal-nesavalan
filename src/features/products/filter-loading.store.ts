import { create } from "zustand";

interface FilterLoadingStore {
  isFiltering: boolean;
  activeFilterKey: string | null;
  startFiltering: (key?: string) => void;
  stopFiltering: () => void;
}

let safetyTimer: ReturnType<typeof setTimeout> | null = null;

export const useFilterLoadingStore = create<FilterLoadingStore>((set) => ({
  isFiltering: false,
  activeFilterKey: null,
  startFiltering: (key) => {
    if (safetyTimer) clearTimeout(safetyTimer);
    set({ isFiltering: true, activeFilterKey: key ?? null });
    // Safety fallback: auto-clear after 8 seconds in case of network issue
    safetyTimer = setTimeout(() => {
      set({ isFiltering: false, activeFilterKey: null });
    }, 8000);
  },
  stopFiltering: () => {
    if (safetyTimer) clearTimeout(safetyTimer);
    set({ isFiltering: false, activeFilterKey: null });
  }
}));
