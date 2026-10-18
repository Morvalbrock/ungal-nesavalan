"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { FABRICS, OCCASIONS, PRICE_BUCKETS, WEAVES } from "@/features/products/filters";
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

  const getList = useCallback(
    (key: MultiKey) => (sp.get(key)?.split(",").filter(Boolean) ?? []) as string[],
    [sp]
  );

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, sp]
  );

  const toggleMulti = useCallback(
    (key: MultiKey, value: string) => {
      const cur = getList(key);
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      updateParams({ [key]: next.length ? next.join(",") : undefined });
    },
    [getList, updateParams]
  );

  const currentPrice = `${sp.get("minPrice") ?? ""}-${sp.get("maxPrice") ?? ""}`;
  const setPriceBucket = (min?: number, max?: number) => {
    updateParams({
      minPrice: min != null ? String(min) : undefined,
      maxPrice: max != null ? String(max) : undefined
    });
  };

  const hasAny =
    sp.get("fabric") ||
    sp.get("weave") ||
    sp.get("occasion") ||
    sp.get("minPrice") ||
    sp.get("maxPrice") ||
    (!hideCategory && sp.get("category"));

  const clearAll = () => {
    const next = new URLSearchParams(sp.toString());
    ["fabric", "weave", "occasion", "minPrice", "maxPrice", "page"].forEach((k) => next.delete(k));
    if (!hideCategory) next.delete("category");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
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
      <div className="flex items-center justify-between rounded-card border border-border bg-cream-warm/60 px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ink"
        >
          <SlidersHorizontal className="h-4 w-4 text-maroon" />
          <span>Filter Sarees {activeCount > 0 && `(${activeCount} active)`}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition", mobileOpen && "rotate-180")} />
        </button>
        {hasAny && (
          <button type="button" onClick={clearAll} className="text-xs underline text-ink-muted hover:text-ink">
            Clear all
          </button>
        )}
      </div>

      {/* Filter groups: toggleable on mobile, always visible on desktop */}
      <div className={cn("space-y-8 rounded-card border border-border/80 bg-cream-warm/20 p-4 sm:p-5 lg:border-0 lg:bg-transparent lg:p-0 lg:block", mobileOpen ? "block" : "hidden")}>
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Refine</h2>
          {hasAny && (
            <button type="button" onClick={clearAll} className="text-xs underline text-ink-muted hover:text-ink">
              Clear all
            </button>
          )}
        </div>

        {!hideCategory && categories && categories.length > 0 && (
          <FilterGroup title="Category">
            {categories.map((c) => {
              const active = activeCategory === c.id;
              return (
                <FilterChip
                  key={c.id}
                  active={active}
                  label={c.label}
                  onClick={() => updateParams({ category: active ? undefined : c.id })}
                />
              );
            })}
          </FilterGroup>
        )}

        <FilterGroup title="Fabric">
          {(fabrics
            ? fabrics.map((f) => ({ key: f.id, label: f.label }))
            : FABRICS.map((f) => ({ key: f, label: f }))
          ).map((f) => (
            <FilterChip
              key={f.key}
              active={getList("fabric").includes(f.key)}
              label={f.label}
              onClick={() => toggleMulti("fabric", f.key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Weave">
          {(weaves
            ? weaves.map((w) => ({ key: w.id, label: w.label }))
            : WEAVES.map((w) => ({ key: w, label: w }))
          ).map((w) => (
            <FilterChip
              key={w.key}
              active={getList("weave").includes(w.key)}
              label={w.label}
              onClick={() => toggleMulti("weave", w.key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Occasion">
          {(occasions
            ? occasions.map((o) => ({ key: o.id, label: o.label }))
            : OCCASIONS.map((o) => ({ key: o, label: o }))
          ).map((o) => (
            <FilterChip
              key={o.key}
              active={getList("occasion").includes(o.key)}
              label={o.label}
              onClick={() => toggleMulti("occasion", o.key)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Price">
          <div className="flex w-full flex-col gap-1">
            {PRICE_BUCKETS.map((b) => {
              const key = `${b.min ?? ""}-${b.max ?? ""}`;
              const active = currentPrice === key;
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => (active ? setPriceBucket() : setPriceBucket(b.min, b.max))}
                  className={cn(
                    "flex items-center gap-2 text-left text-sm text-ink-soft transition hover:text-ink",
                    active && "font-medium text-ink"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-3 w-3 items-center justify-center rounded-full border border-ink/40",
                      active && "border-maroon bg-maroon"
                    )}
                  />
                  {b.label}
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

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs capitalize transition",
        active
          ? "border-ink bg-ink text-cream"
          : "border-border text-ink-soft hover:border-ink hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
