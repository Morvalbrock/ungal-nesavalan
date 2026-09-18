import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/types/product";
import { cn, formatINR } from "@/lib/utils";

export function ProductCard({ product, className }: { product: ProductSummary; className?: string }) {
  const primary = product.images[0];
  const onSale = product.salePrice != null && product.salePrice < product.basePrice;
  return (
    <article className={cn("group", className)}>
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-cream-warm">
          {primary ? (
            <Image
              src={primary.url}
              alt={primary.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">No image</div>
          )}
          {onSale && (
            <span className="absolute left-3 top-3 rounded-full bg-maroon px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-cream">
              Sale
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
            {product.weave} · {product.fabric}
          </p>
          <h3 className="font-display text-base font-medium text-ink">{product.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium text-ink">
              {formatINR(product.salePrice ?? product.basePrice)}
            </span>
            {onSale && (
              <span className="text-xs text-ink-muted line-through">{formatINR(product.basePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
