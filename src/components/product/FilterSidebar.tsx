"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { FABRICS, OCCASIONS, PRICE_BUCKETS, WEAVES } from "@/features/products/filters";
import { cn } from "@/lib/utils";

type MultiKey = "fabric" | "weave" | "occasion";

export function FilterSidebar({ hideCategory = false }: { hideCategory?: boolean }) {
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

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.25em] text-ink-muted">Refine</h2>
        {hasAny && (
          <button type="button" onClick={clearAll} className="text-xs underline text-ink-muted hover:text-ink">
            Clear all
          </button>
        )}
      </div>

      <FilterGroup title="Fabric">
        {FABRICS.map((f) => (
          <FilterChip
            key={f}
            active={getList("fabric").includes(f)}
            label={f}
            onClick={() => toggleMulti("fabric", f)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Weave">
        {WEAVES.map((w) => (
          <FilterChip
            key={w}
            active={getList("weave").includes(w)}
            label={w}
            onClick={() => toggleMulti("weave", w)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Occasion">
        {OCCASIONS.map((o) => (
          <FilterChip
            key={o}
            active={getList("occasion").includes(o)}
            label={o}
            onClick={() => toggleMulti("occasion", o)}
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
