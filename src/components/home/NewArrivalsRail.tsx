"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Plus } from "lucide-react";
import type { ProductSummary } from "@/types/product";
import { Container } from "@/components/layout/Container";
import { cn, formatINR } from "@/lib/utils";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";

interface NewArrivalsRailProps {
  products: ProductSummary[];
}

const PLACEHOLDER = "/images/placeholder.jpg";

export function NewArrivalsRail({ products }: NewArrivalsRailProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const wishlist = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItemToCart = useCartStore((s) => s.addItem);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-rail-card]");
    const gap = window.innerWidth >= 768 ? 20 : 16;
    const step = card ? card.offsetWidth + gap : 300;
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  const quickAdd = (p: ProductSummary) => {
    addItemToCart({
      productId: p.id,
      variantId: `${p.id}_default`,
      slug: p.slug,
      name: p.name,
      variantLabel: p.weave || "Authentic Handloom",
      image: p.images[0]?.url || PLACEHOLDER,
      unitPricePaise: p.salePrice ?? p.basePrice,
      quantity: 1,
      maxStock: 30
    });
  };

  return (
    <section className="w-full bg-cream-warm/40 pt-6 pb-10 sm:pt-8 sm:pb-14 md:pt-10 md:pb-16">
      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-xl">
            <span className="eyebrow">Just Off the Pit-Loom</span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-[42px]">
              This Week&rsquo;s Weave
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-[15px]">
              A rotating edit of sarees that left the loom this week — first pick goes to
              whoever reaches the cart first.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-end">
            <Link
              href="/products"
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-deep transition-colors hover:text-ink"
            >
              Open the Whole Shelf →
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                aria-label="Scroll left"
                disabled={!canScrollLeft}
                onClick={() => scrollBy(-1)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-cream text-ink transition",
                  canScrollLeft
                    ? "hover:border-ink hover:bg-ink hover:text-cream cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll right"
                disabled={!canScrollRight}
                onClick={() => scrollBy(1)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-cream text-ink transition",
                  canScrollRight
                    ? "hover:border-ink hover:bg-ink hover:text-cream cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="snap-x snap-mandatory overflow-x-auto scroll-smooth py-2 -my-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          <div className="flex gap-4 md:gap-5">
            {products.map((p) => {
              const img = p.images[0]?.url || PLACEHOLDER;
              const isSale = p.salePrice != null && p.salePrice < p.basePrice;
              const price = p.salePrice ?? p.basePrice;
              const discount = isSale
                ? Math.round(((p.basePrice - (p.salePrice as number)) / p.basePrice) * 100)
                : 0;
              const inWishlist = wishlist.includes(p.id);
              return (
                <div
                  key={p.id}
                  data-rail-card
                  className="group relative flex w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-card border border-border bg-cream shadow-card transition-shadow hover:shadow-elev sm:w-[calc((100%_-_1rem)/2)] md:w-[calc((100%_-_2.5rem)/3)] lg:w-[calc((100%_-_3.75rem)/4)]"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-cream-warm/60">
                    <Link href={`/products/${p.slug}`} className="block h-full w-full">
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 280px"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>

                    {isSale && (
                      <span className="absolute left-2 top-2 rounded-sm bg-maroon px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cream">
                        -{discount}%
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(p.id);
                      }}
                      className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md shadow-sm transition-colors ${
                        inWishlist
                          ? "bg-maroon text-cream"
                          : "bg-cream/85 text-ink hover:text-maroon"
                      }`}
                    >
                      <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-3 p-3">
                    <Link href={`/products/${p.slug}`} className="block">
                      <h3 className="font-display text-[15px] font-medium leading-snug text-ink line-clamp-1 group-hover:text-maroon">
                        {p.name}
                      </h3>
                    </Link>
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-ink">{formatINR(price)}</span>
                        {isSale && (
                          <span className="text-xs text-ink-muted line-through">
                            {formatINR(p.basePrice)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => quickAdd(p)}
                        className="inline-flex items-center gap-1 rounded-sm border border-ink/80 bg-cream px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink transition hover:bg-ink hover:text-cream"
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
