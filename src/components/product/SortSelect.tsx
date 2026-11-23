"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SORT_OPTIONS } from "@/features/products/filters";
import { useFilterLoadingStore } from "@/features/products/filter-loading.store";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "featured";
  const [isPending, startTransition] = useTransition();
  const { isFiltering, startFiltering, stopFiltering } = useFilterLoadingStore();

  const busy = isPending || isFiltering;

  useEffect(() => {
    if (!isPending) {
      stopFiltering();
    }
  }, [isPending, stopFiltering]);

  useEffect(() => {
    stopFiltering();
  }, [sp, stopFiltering]);

  const onChange = (value: string) => {
    if (busy) return;
    startFiltering("sort");
    const next = new URLSearchParams(sp.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-muted">Sort</span>
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-purple" />}
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        disabled={busy}
        className="rounded-card border border-border bg-transparent px-3 py-1.5 text-sm focus:border-ink focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
