"use client";

import { Loader2 } from "lucide-react";
import type { ProductSummary } from "@/types/product";
import type { ReviewAggregate } from "@/types/review";
import { useFilterLoadingStore } from "@/features/products/filter-loading.store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";

interface Props {
  items: ProductSummary[];
  ratings?: Record<string, ReviewAggregate>;
}

export function ProductGrid({ items, ratings }: Props) {
  const isFiltering = useFilterLoadingStore((s) => s.isFiltering);

  return (
    <div className="relative min-h-[360px]">
      {/* Loading Overlay */}
      {isFiltering && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-24 bg-white/60 backdrop-blur-[2px] rounded-2xl transition-all duration-300"
        >
          <div className="sticky top-44 flex items-center gap-3 px-5 py-3 rounded-full bg-brand-plum text-white shadow-xl border border-purple-300/30 animate-in fade-in zoom-in-95 duration-200">
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            <span className="text-xs font-semibold tracking-wide">
              Applying filters, loading handlooms…
            </span>
          </div>
        </div>
      )}

      {/* Grid Content with Dimming while filtering */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isFiltering && "opacity-35 pointer-events-none select-none"
        )}
      >
        {items.length === 0 ? (
          <div className="rounded-2xl border border-purple-100 bg-[#fdfaff] p-12 text-center shadow-sm">
            <p className="font-heritage text-2xl font-bold text-brand-plum">
              No sarees match those filters.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try clearing a filter or searching for another weave variety.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => {
              const r = ratings?.[p.id];
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  rating={r && r.count > 0 ? { avg: r.avg, count: r.count } : null}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
