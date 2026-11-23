"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { FABRICS, OCCASIONS, PRICE_BUCKETS, WEAVES } from "@/features/products/filters";
import { useFilterLoadingStore } from "@/features/products/filter-loading.store";
import { cn } from "@/lib/utils";

type MultiKey = "fabric" | "weave" | "occasion";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  hideCategory?: boolean;
  categories?: FilterOption[];
  weaves?: FilterOption[];
  fabrics?: FilterOption[];
  occasions?: FilterOption[];
}

export function FilterSidebar({
  hideCategory = false,
  categories,
  weaves,
  fabrics,
  occasions
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { isFiltering, activeFilterKey, startFiltering, stopFiltering } = useFilterLoadingStore();

  const busy = isPending || isFiltering;

  // Clear loading state once transition settles or searchParams update
  useEffect(() => {
    if (!isPending) {
      stopFiltering();
    }
  }, [isPending, stopFiltering]);

  useEffect(() => {
    stopFiltering();
  }, [sp, stopFiltering]);

  const getList = useCallback(
    (key: MultiKey) => (sp.get(key)?.split(",").filter(Boolean) ?? []) as string[],
    [sp]
  );

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>, filterKey?: string) => {
      if (busy) return;
      startFiltering(filterKey);
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, sp, busy, startFiltering]
  );

  const toggleMulti = useCallback(
    (key: MultiKey, value: string) => {
      if (busy) return;
      const cur = getList(key);
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      updateParams({ [key]: next.length ? next.join(",") : undefined }, `${key}-${value}`);
    },
    [getList, updateParams, busy]
  );

  const currentPrice = `${sp.get("minPrice") ?? ""}-${sp.get("maxPrice") ?? ""}`;
  const setPriceBucket = (min?: number, max?: number) => {
    if (busy) return;
    const bucketKey = `price-${min ?? ""}-${max ?? ""}`;
    updateParams(
      {
        minPrice: min != null ? String(min) : undefined,
        maxPrice: max != null ? String(max) : undefined
      },
      bucketKey
    );
  };

  const hasAny =
    sp.get("fabric") ||
    sp.get("weave") ||
    sp.get("occasion") ||
    sp.get("minPrice") ||
    sp.get("maxPrice") ||
    (!hideCategory && sp.get("category"));

  const clearAll = () => {
    if (busy) return;
    startFiltering("clear");
    const next = new URLSearchParams(sp.toString());
    ["fabric", "weave", "occasion", "minPrice", "maxPrice", "page"].forEach((k) => next.delete(k));
    if (!hideCategory) next.delete("category");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const activeCategory = sp.get("category");
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = [
    getList("fabric").length,
    getList("weave").length,
    getList("occasion").length,
    (!hideCategory && sp.get("category")) ? 1 : 0,
    (sp.get("minPrice") || sp.get("maxPrice")) ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <aside className="space-y-6 lg:space-y-8">
      {/* Mobile filter toggle bar */}
      <div className="flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50/60 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-plum"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-purple" />
          ) : (
            <SlidersHorizontal className="h-4 w-4 text-brand-purple" />
          )}
          <span>
            {busy
              ? "Applying filter…"
              : `Filter Sarees ${activeCount > 0 ? `(${activeCount} active)` : ""}`}
          </span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition", mobileOpen && "rotate-180")} />
        </button>
        {hasAny && (
          <button
            type="button"
            disabled={busy}
            onClick={clearAll}
            className={cn(
              "text-xs font-medium underline text-brand-purple hover:text-brand-plum",
              busy && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {busy && activeFilterKey === "clear" ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Clearing…
              </span>
            ) : (
              "Clear all"
            )}
          </button>
        )}
      </div>

      {/* Filter groups: toggleable on mobile, always visible on desktop */}
      <div
        className={cn(
          "space-y-7 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm lg:p-0 lg:bg-transparent lg:border-0 lg:shadow-none lg:block",
          mobileOpen ? "block" : "hidden"
        )}
      >
        <div className="hidden items-center justify-between lg:flex pb-2 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-plum">Refine Weaves</h2>
            {busy && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-100 text-brand-purple text-[10px] font-semibold border border-purple-200">
                <Loader2 className="h-3 w-3 animate-spin text-brand-purple" />
                Updating…
              </span>
            )}
          </div>
          {hasAny && (
            <button
              type="button"
              disabled={busy}
              onClick={clearAll}
              className={cn(
                "text-xs font-semibold text-brand-purple hover:underline",
                busy && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              {busy && activeFilterKey === "clear" ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Clearing…
                </span>
              ) : (
                "Clear all"
              )}
            </button>
          )}
        </div>

        {!hideCategory && categories && categories.length > 0 && (
          <FilterGroup title="Category">
            {categories.map((c) => {
              const active = activeCategory === c.id;
              const isChipLoading = busy && activeFilterKey === `cat-${c.id}`;
              return (
                <FilterChip
                  key={c.id}
                  active={active}
                  label={c.label}
                  loading={isChipLoading}
                  disabled={busy}
                  onClick={() => updateParams({ category: active ? undefined : c.id }, `cat-${c.id}`)}
                />
              );
            })}
          </FilterGroup>
        )}

        <FilterGroup title="Fabric">
          {(fabrics
            ? fabrics.map((f) => ({ key: f.id, label: f.label }))
            : FABRICS.map((f) => ({ key: f, label: f }))
          ).map((f) => {
            const isChipLoading = busy && activeFilterKey === `fabric-${f.key}`;
            return (
              <FilterChip
                key={f.key}
                active={getList("fabric").includes(f.key)}
                label={f.label}
                loading={isChipLoading}
                disabled={busy}
                onClick={() => toggleMulti("fabric", f.key)}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup title="Catalog">
          {(weaves
            ? weaves.map((w) => ({ key: w.id, label: w.label }))
            : WEAVES.map((w) => ({ key: w, label: w }))
          ).map((w) => {
            const isChipLoading = busy && activeFilterKey === `weave-${w.key}`;
            return (
              <FilterChip
                key={w.key}
                active={getList("weave").includes(w.key)}
                label={w.label}
                loading={isChipLoading}
                disabled={busy}
                onClick={() => toggleMulti("weave", w.key)}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup title="Occasion">
          {(occasions
            ? occasions.map((o) => ({ key: o.id, label: o.label }))
            : OCCASIONS.map((o) => ({ key: o, label: o }))
          ).map((o) => {
            const isChipLoading = busy && activeFilterKey === `occasion-${o.key}`;
            return (
              <FilterChip
                key={o.key}
                active={getList("occasion").includes(o.key)}
                label={o.label}
                loading={isChipLoading}
                disabled={busy}
                onClick={() => toggleMulti("occasion", o.key)}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="flex w-full flex-col gap-1">
            {PRICE_BUCKETS.map((b) => {
              const key = `${b.min ?? ""}-${b.max ?? ""}`;
              const active = currentPrice === key;
              const isBucketLoading = busy && activeFilterKey === `price-${key}`;
              return (
                <button
                  key={b.label}
                  type="button"
                  disabled={busy}
                  onClick={() => (active ? setPriceBucket() : setPriceBucket(b.min, b.max))}
                  className={cn(
                    "flex items-center gap-2 text-left text-sm text-ink-soft transition hover:text-ink",
                    active && "font-medium text-ink",
                    busy && "opacity-60 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-3 w-3 items-center justify-center rounded-full border border-purple-300",
                      active && "border-brand-purple bg-brand-purple"
                    )}
                  />
                  <span>{b.label}</span>
                  {isBucketLoading && <Loader2 className="h-3 w-3 animate-spin text-brand-purple" />}
                </button>
              );
            })}
          </div>
        </FilterGroup>
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  label,
  loading = false,
  disabled = false,
  onClick
}: {
  active: boolean;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "rounded-full border px-3 py-1 text-xs capitalize transition font-medium inline-flex items-center gap-1.5",
        active
          ? "border-brand-purple bg-brand-purple text-white shadow-sm"
          : "border-purple-200 bg-white text-slate-600 hover:border-brand-purple hover:text-brand-plum hover:bg-purple-50/60",
        disabled && "opacity-60 cursor-not-allowed pointer-events-none"
      )}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin text-current" />}
      <span>{label}</span>
    </button>
  );
}
