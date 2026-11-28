import { create } from "zustand";

interface AdminListLoadingStore {
  isLoading: boolean;
  activeKey: string | null;
  startLoading: (key?: string) => void;
  stopLoading: () => void;
}

let safetyTimer: ReturnType<typeof setTimeout> | null = null;

export const useAdminListLoadingStore = create<AdminListLoadingStore>((set) => ({
  isLoading: false,
  activeKey: null,
  startLoading: (key) => {
    if (safetyTimer) clearTimeout(safetyTimer);
    set({ isLoading: true, activeKey: key ?? null });
    safetyTimer = setTimeout(() => {
      set({ isLoading: false, activeKey: null });
    }, 8000);
  },
  stopLoading: () => {
    if (safetyTimer) clearTimeout(safetyTimer);
    set({ isLoading: false, activeKey: null });
  }
}));
