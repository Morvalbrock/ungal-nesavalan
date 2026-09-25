import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/types/product";
import { cn, formatINR } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { RatingStars } from "./RatingStars";

interface Props {
  product: ProductSummary;
  className?: string;
  rating?: { avg: number; count: number } | null;
}

const NEW_THRESHOLD_DAYS = 21;

function isNew(iso?: string) {
  if (!iso) return false;
  const now = Date.now();
  const then = new Date(iso).getTime();
  return now - then <= NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({ product, className, rating }: Props) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const onSale = product.salePrice != null && product.salePrice < product.basePrice;
  const salePct =
    onSale && product.salePrice
      ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
      : 0;
  const featuredFlag = product.featured;
  const newFlag = isNew((product as unknown as { createdAt?: string }).createdAt);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <WishlistButton productId={product.id} className="absolute right-3 top-3 z-10" />

      <Link href={`/products/${product.slug}`} className="flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden rounded-card bg-cream-warm">
          {primary ? (
            <>
              <Image
                src={primary.url}
                alt={primary.alt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className={cn(
                  "object-cover transition-all duration-700",
                  secondary ? "group-hover:opacity-0 group-hover:scale-[1.03]" : "group-hover:scale-[1.04]"
                )}
              />
              {secondary && (
                <Image
                  src={secondary.url}
                  alt={secondary.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-muted">No image</div>
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {onSale && (
              <span className="chip-maroon">
                Save {salePct}%
              </span>
            )}
            {newFlag && !onSale && (
              <span className="chip-gold">New</span>
            )}
            {featuredFlag && !newFlag && !onSale && (
              <span className="chip-dark">Bestseller</span>
            )}
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="pointer-events-auto inline-flex items-center justify-center rounded-card bg-ink px-4 py-2 text-[11.5px] font-medium uppercase tracking-widest2 text-cream shadow-elev hover:bg-maroon">
              Quick view
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-muted">
            {product.weave} · {product.fabric}
          </p>
          <h3 className="mt-1.5 font-display text-[17px] leading-snug text-ink transition group-hover:text-maroon">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[15px] font-medium text-ink">
              {formatINR(product.salePrice ?? product.basePrice)}
            </span>
            {onSale && (
              <span className="text-[12.5px] text-ink-muted line-through">
                {formatINR(product.basePrice)}
              </span>
            )}
          </div>

          {rating && rating.count > 0 && (
            <div className="mt-2">
              <RatingStars avg={rating.avg} count={rating.count} size="sm" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
