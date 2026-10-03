"use client";

import { useEffect } from "react";
import { create } from "zustand";

interface BulkSelectState {
  selected: Set<string>;
  pageIds: string[];
  toggle: (id: string) => void;
  togglePage: () => void;
  clear: () => void;
  setPageIds: (ids: string[]) => void;
}

export const useBulkSelect = create<BulkSelectState>((set, get) => ({
  selected: new Set(),
  pageIds: [],
  toggle(id) {
    const next = new Set(get().selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selected: next });
  },
  togglePage() {
    const { selected, pageIds } = get();
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allSelected) {
      for (const id of pageIds) next.delete(id);
    } else {
      for (const id of pageIds) next.add(id);
    }
    set({ selected: next });
  },
  clear() {
    set({ selected: new Set() });
  },
  setPageIds(ids) {
    // Keep only selections that still exist in the current page view;
    // otherwise users carry stale ids across filter/page changes.
    const { selected } = get();
    const next = new Set<string>();
    for (const id of ids) {
      if (selected.has(id)) next.add(id);
    }
    set({ pageIds: ids, selected: next });
  }
}));

export function BulkSelectInit({ ids }: { ids: string[] }) {
  const setPageIds = useBulkSelect((s) => s.setPageIds);
  useEffect(() => {
    setPageIds(ids);
  }, [ids, setPageIds]);
  return null;
}

export function BulkCheckbox({ id }: { id: string }) {
  const selected = useBulkSelect((s) => s.selected);
  const toggle = useBulkSelect((s) => s.toggle);
  return (
    <input
      type="checkbox"
      checked={selected.has(id)}
      onChange={() => toggle(id)}
      className="h-4 w-4 accent-maroon"
      aria-label={`Select row ${id}`}
    />
  );
}

export function BulkSelectAllCheckbox() {
  const pageIds = useBulkSelect((s) => s.pageIds);
  const selected = useBulkSelect((s) => s.selected);
  const togglePage = useBulkSelect((s) => s.togglePage);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = !allSelected && pageIds.some((id) => selected.has(id));
  return (
    <input
      type="checkbox"
      checked={allSelected}
      ref={(el) => {
        if (el) el.indeterminate = someSelected;
      }}
      onChange={togglePage}
      className="h-4 w-4 accent-maroon"
      aria-label="Select all on page"
    />
  );
}
