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
      <div className="rounded-card border border-border/70 bg-cream-warm/50 px-6 py-24 text-center">
        <p className="font-display text-2xl text-ink">No sarees match those filters.</p>
        <p className="mt-2 text-sm text-ink-muted">Try clearing a filter or two.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
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
