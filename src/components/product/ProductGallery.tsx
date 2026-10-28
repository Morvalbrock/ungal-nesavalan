"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, Minus } from "lucide-react";
import type { Product, ProductImage } from "@/types/product";
import { useSelectedVariantStore } from "@/features/products/selected-variant.store";
import { cn, formatINR } from "@/lib/utils";
import { ShareButton } from "./ShareButton";

const MAX_VISIBLE_VARIANTS = 5;

export function ProductGallery({
  images,
  product
}: {
  images: ProductImage[];
  product?: Product;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const [showAllVariants, setShowAllVariants] = useState(false);
  // Track image URLs whose <Image> fetch failed (403/404/etc.) so we can render a swatch fallback.
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
  const markBroken = useCallback((url: string) => {
    setBrokenUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  }, []);
  const frameRef = useRef<HTMLDivElement>(null);

  const selectedVariantId = useSelectedVariantStore((s) =>
    product && s.productId === product.id ? s.variantId : null
  );
  const selectVariant = useSelectedVariantStore((s) => s.select);

  // Active variant fallback (if not set in store yet, pick first in-stock or first variant)
  const activeVariantId = useMemo(() => {
    if (selectedVariantId) return selectedVariantId;
    if (!product || !product.variants?.length) return null;
    const firstInStock = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    return firstInStock?.id ?? null;
  }, [selectedVariantId, product]);

  const currentVariant = useMemo(() => {
    if (!product || !activeVariantId) return null;
    return product.variants.find((v) => v.id === activeVariantId) ?? null;
  }, [product, activeVariantId]);

  const mergedImages = useMemo(() => {
    if (!product || !currentVariant) return images;
    const variantImages = currentVariant.images ?? [];
    if (variantImages.length > 0) {
      const variantUrls = new Set(variantImages.map((i) => i.url));
      const rest = images.filter((img) => !variantUrls.has(img.url));
      return [...variantImages, ...rest];
    }
    return images;
  }, [images, product, currentVariant]);

  useEffect(() => {
    setActive(0);
  }, [activeVariantId]);

  // Filter out images whose URL already failed to load so the gallery doesn't try them again.
  const usableImages = useMemo(
    () => mergedImages.filter((img) => !brokenUrls.has(img.url)),
    [mergedImages, brokenUrls]
  );
  const count = usableImages.length;
  const activeImg = usableImages[active] ?? usableImages[0];

  const handleSelectVariant = useCallback(
    (vId: string) => {
      if (!product) return;
      selectVariant(product.id, vId);
      setActive(0);
    },
    [product, selectVariant]
  );

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }, []);

  useEffect(() => {
    if (count <= 1) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count]);

  if (!activeImg) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-card bg-cream-warm text-sm text-ink-muted">
        No images available
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Amazon-style gallery: thumbnails run vertically down the LEFT of the main image on
          sm+ screens; on mobile they collapse to a horizontal strip below the image. */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-3">
        {count > 1 && (
          <div
            className={cn(
              "order-2 mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin",
              "sm:order-1 sm:mt-0 sm:w-16 sm:shrink-0 sm:flex-col sm:gap-2 sm:overflow-x-visible sm:overflow-y-auto sm:max-h-[560px] sm:pb-0"
            )}
          >
            {usableImages.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View photo ${i + 1}`}
                className={cn(
                  "relative aspect-square w-14 shrink-0 overflow-hidden rounded-card border transition-all sm:w-full",
                  i === active
                    ? "border-maroon ring-2 ring-maroon/25 opacity-100"
                    : "border-border/70 opacity-70 hover:opacity-100 hover:border-ink/40"
                )}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="70px"
                  onError={() => markBroken(img.url)}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div
          ref={frameRef}
          onMouseEnter={onMove}
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
          className="relative order-1 aspect-[3/4] w-full flex-1 overflow-hidden rounded-card bg-cream-warm shadow-xs sm:order-2"
        >
          <Image
            src={activeImg.url}
            alt={activeImg.alt || product?.name || "Product image"}
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            onError={() => markBroken(activeImg.url)}
            className="object-cover transition-opacity duration-300"
          />
          {zoom && (
            <div
              className="pointer-events-none absolute inset-0 hidden md:block"
              style={{
                backgroundImage: `url(${activeImg.url})`,
                backgroundSize: "220%",
                backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                opacity: 1
              }}
            />
          )}

          {product && (
            <ShareButton
              productName={product.name}
              productSlug={product.slug}
              className="absolute right-3 top-3 z-10"
            />
          )}

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActive((i) => (i - 1 + count) % count)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-1 text-sm text-ink shadow hover:bg-cream md:hidden"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setActive((i) => (i + 1) % count)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-1 text-sm text-ink shadow hover:bg-cream md:hidden"
              >
                ›
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-2.5 py-0.5 text-[10px] font-medium text-cream shadow-xs">
                {active + 1} / {count}
              </span>
            </>
          )}
        </div>
      </div>

      {/* "Choose a Variant" grid sits directly under the main image so swapping colour
          doesn't force the user to scroll. */}
      {product && product.variants && product.variants.length > 0 && (() => {
        const totalVariants = product.variants.length;
        const needsCollapse = totalVariants > MAX_VISIBLE_VARIANTS;
        const visibleVariants =
          needsCollapse && !showAllVariants
            ? product.variants.slice(0, MAX_VISIBLE_VARIANTS)
            : product.variants;
        const hiddenCount = totalVariants - MAX_VISIBLE_VARIANTS;

        return (
        <div className="mt-4">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-widest2 text-ink-muted">
                Choose a Variant
              </span>
              <span className="rounded-full bg-cream-warm px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                {totalVariants} {totalVariants === 1 ? "Option" : "Options"}
              </span>
            </div>
            {currentVariant && (
              <span className="text-[12px] font-medium text-ink capitalize">
                {currentVariant.color}
              </span>
            )}
          </div>

          <div
            className={cn(
              "grid gap-2.5 sm:gap-3",
              totalVariants === 1
                ? "grid-cols-1 max-w-[160px]"
                : totalVariants === 2
                ? "grid-cols-2 max-w-[320px]"
                : "grid-cols-3 max-w-[500px]"
            )}
          >
            {visibleVariants.map((v) => {
              const isSelected = v.id === activeVariantId;
              const isOutOfStock = v.stock === 0;
              const rawVariantImg = v.images?.[0]?.url || product.images[0]?.url;
              const variantImg = rawVariantImg && !brokenUrls.has(rawVariantImg) ? rawVariantImg : null;
              const vPrice = v.priceOverride ?? product.salePrice ?? product.basePrice;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleSelectVariant(v.id)}
                  disabled={isOutOfStock}
                  aria-label={`Select ${v.color}${isOutOfStock ? " - Out of stock" : ""}`}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-card border text-left transition-all duration-200",
                    isSelected
                      ? "border-maroon ring-2 ring-maroon/20 shadow-md bg-cream-warm/20"
                      : "border-border/80 bg-white hover:border-ink/50 hover:shadow-xs",
                    isOutOfStock && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-warm">
                    {variantImg ? (
                      <Image
                        src={variantImg}
                        alt={v.color}
                        fill
                        sizes="(min-width: 1024px) 15vw, 30vw"
                        onError={() => markBroken(variantImg)}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{ backgroundColor: `${v.colorHex}20` }}
                      >
                        <span
                          className="h-9 w-9 rounded-full border border-ink/20 shadow-xs"
                          style={{ backgroundColor: v.colorHex }}
                        />
                      </div>
                    )}

                    {/* Selected checkmark badge */}
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-maroon text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      </span>
                    )}

                    {/* Out of stock badge */}
                    {isOutOfStock && (
                      <span className="absolute inset-x-0 bottom-0 bg-ink/80 py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-cream">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col p-2 sm:p-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-ink/20 shadow-xs"
                        style={{ backgroundColor: v.colorHex }}
                      />
                      <span className="truncate text-xs font-semibold capitalize text-ink">
                        {v.color}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-ink-muted">
                      <span>{formatINR(vPrice)}</span>
                      {!isOutOfStock && (
                        <span
                          className={cn(
                            "text-[10px] font-medium",
                            v.stock <= 3 ? "text-amber-700" : "text-emerald-700"
                          )}
                        >
                          {v.stock <= 3 ? `${v.stock} left` : "In stock"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {needsCollapse && !showAllVariants && (
              <button
                type="button"
                onClick={() => setShowAllVariants(true)}
                aria-label={`Show ${hiddenCount} more variant${hiddenCount === 1 ? "" : "s"}`}
                className="group relative flex flex-col overflow-hidden rounded-card border border-dashed border-ink/30 bg-cream-warm/40 text-left transition-all duration-200 hover:border-ink/70 hover:bg-cream-warm hover:shadow-xs"
              >
                <div className="relative flex aspect-[4/5] w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/25 text-ink group-hover:border-maroon group-hover:text-maroon">
                      <Plus className="h-5 w-5 stroke-[2.5]" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink">
                      +{hiddenCount}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col p-2.5 sm:p-3">
                  <span className="truncate text-xs font-semibold text-ink">Show more</span>
                  <span className="mt-1 text-[11px] text-ink-muted">
                    {hiddenCount} more {hiddenCount === 1 ? "variant" : "variants"}
                  </span>
                </div>
              </button>
            )}

            {needsCollapse && showAllVariants && (
              <button
                type="button"
                onClick={() => setShowAllVariants(false)}
                aria-label="Show fewer variants"
                className="group relative flex flex-col overflow-hidden rounded-card border border-dashed border-ink/30 bg-cream-warm/40 text-left transition-all duration-200 hover:border-ink/70 hover:bg-cream-warm hover:shadow-xs"
              >
                <div className="relative flex aspect-[4/5] w-full items-center justify-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/25 text-ink group-hover:border-maroon group-hover:text-maroon">
                      <Minus className="h-5 w-5 stroke-[2.5]" />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col p-2.5 sm:p-3">
                  <span className="truncate text-xs font-semibold text-ink">Show less</span>
                  <span className="mt-1 text-[11px] text-ink-muted">Collapse list</span>
                </div>
              </button>
            )}
          </div>
        </div>
        );
      })()}
    </div>
  );
}
