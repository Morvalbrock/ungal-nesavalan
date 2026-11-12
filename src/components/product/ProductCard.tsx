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
  compact?: boolean;
}

const NEW_THRESHOLD_DAYS = 21;

function isNew(iso?: string) {
  if (!iso) return false;
  const now = Date.now();
  const then = new Date(iso).getTime();
  return now - then <= NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({ product, className, rating, compact = false }: Props) {
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
      <WishlistButton productId={product.id} className={cn("absolute right-3 top-3 z-10", compact && "scale-90 right-2 top-2")} />

      <Link href={`/products/${product.slug}`} className="flex flex-col">
        <div className={cn(
          "relative overflow-hidden rounded-card bg-cream-warm",
          compact ? "aspect-[4/5]" : "aspect-[3/4]"
        )}>
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

          <div className={cn("absolute left-3 top-3 flex flex-col gap-1.5", compact && "scale-90 origin-top-left left-2 top-2")}>
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
            <span className={cn(
              "pointer-events-auto inline-flex items-center justify-center rounded-card bg-ink font-medium uppercase tracking-widest2 text-cream shadow-elev hover:bg-maroon",
              compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-[11.5px]"
            )}>
              Quick view
            </span>
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col", compact ? "mt-2.5" : "mt-4")}>
          <p className={cn(
            "font-medium uppercase tracking-widest2 text-ink-muted",
            compact ? "text-[9.5px]" : "text-[10.5px]"
          )}>
            {product.weave.replace(/-/g, " ")} · {product.fabric.replace(/-/g, " ")}
          </p>
          <h3 className={cn(
            "font-display leading-snug text-ink transition group-hover:text-maroon line-clamp-1",
            compact ? "mt-1 text-[14px] sm:text-[15px]" : "mt-1.5 text-[17px]"
          )}>
            {product.name}
          </h3>

          <div className={cn("flex items-baseline gap-2", compact ? "mt-1" : "mt-2")}>
            <span className={cn("font-medium text-ink", compact ? "text-[13.5px] sm:text-[14px]" : "text-[15px]")}>
              {formatINR(product.salePrice ?? product.basePrice)}
            </span>
            {onSale && (
              <span className={cn("text-ink-muted line-through", compact ? "text-[11px]" : "text-[12.5px]")}>
                {formatINR(product.basePrice)}
              </span>
            )}
          </div>

          {rating && rating.count > 0 && (
            <div className={cn(compact ? "mt-1" : "mt-2")}>
              <RatingStars avg={rating.avg} count={rating.count} size="sm" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
