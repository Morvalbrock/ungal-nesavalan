import type { ProductSummary } from "@/types/product";
import type { ReviewAggregate } from "@/types/review";
import { ProductCard } from "./ProductCard";

interface Props {
  items: ProductSummary[];
  ratings?: Record<string, ReviewAggregate>;
}

export function ProductGrid({ items, ratings }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-purple-100 bg-[#fdfaff] p-12 text-center shadow-sm">
        <p className="font-heritage text-2xl font-bold text-brand-plum">
          No sarees match those filters.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Try clearing a filter or searching for another weave variety.
        </p>
      </div>
    );
  }

  return (
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
  );
}
