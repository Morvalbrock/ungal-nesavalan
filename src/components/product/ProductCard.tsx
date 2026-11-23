"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Award, Star, Eye, Zap, Loader2 } from "lucide-react";
import type { Product, ProductSummary } from "@/types/product";
import { cn, formatINR } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { useSareeModalStore } from "@/components/home/saree-modal-store";
import { useCartStore } from "@/features/cart/cart.store";
import { track } from "@/features/analytics/track";

interface Props {
  product: ProductSummary;
  className?: string;
  rating?: { avg: number; count: number } | null;
  compact?: boolean;
}

const NEW_THRESHOLD_DAYS = 30;

function isNew(iso?: string) {
  if (!iso) return false;
  const now = Date.now();
  const then = new Date(iso).getTime();
  return now - then <= NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

export function ProductCard({ product, className, rating, compact = false }: Props) {
  const openModal = useSareeModalStore((s) => s.open);

  const primary = product.images[0];
  const secondary = product.images[1];
  const onSale = product.salePrice != null && product.salePrice < product.basePrice;
  const salePct =
    onSale && product.salePrice
      ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
      : 0;
  const newFlag = isNew((product as unknown as { createdAt?: string }).createdAt);

  const formattedPrice = formatINR(product.salePrice ?? product.basePrice);
  const formattedOrig = formatINR(product.basePrice);

  const lengthMeters = "lengthMeters" in product && typeof (product as { lengthMeters?: unknown }).lengthMeters === "number"
    ? (product as { lengthMeters: number }).lengthMeters
    : 6.2;

  const blousePieceLabel = "blousePieceIncluded" in product && !(product as { blousePieceIncluded?: boolean }).blousePieceIncluded
    ? "Direct Loom Finish"
    : "With Running Blouse Piece";

  const [isBuying, setIsBuying] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const blouseIncluded =
      "blousePieceIncluded" in product && typeof (product as { blousePieceIncluded?: boolean }).blousePieceIncluded === "boolean"
        ? (product as { blousePieceIncluded: boolean }).blousePieceIncluded
        : undefined;
    const weaveLabel = product.weave?.replace(/-/g, " ") || "Handloom Weave";
    const lengthSuffix =
      blouseIncluded === false
        ? " (blouse piece not included)"
        : blouseIncluded === true
          ? " with Blouse Piece"
          : "";

    openModal({
      productId: product.id,
      slug: product.slug,
      title: product.name,
      price: formattedPrice,
      // Only expose the strikethrough + discount badge on a genuine sale — otherwise
      // the modal was showing "₹X ~~₹X~~ Authentic Rate" and faking a comparison price.
      originalPrice: onSale ? formattedOrig : undefined,
      discount: onSale ? `${salePct}% OFF` : undefined,
      imageUrl:
        primary?.url ||
        "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg",
      badge: weaveLabel,
      rating: rating?.avg ? Number(rating.avg.toFixed(1)) : undefined,
      reviewCount: rating?.count ?? undefined,
      weave: weaveLabel,
      fabric: product.fabric?.replace(/-/g, " ") || undefined,
      length: `${lengthMeters} Meters${lengthSuffix}`,
      blousePieceIncluded: blouseIncluded,
      // borderWork and weaver are intentionally omitted — those fields don't exist on
      // the Product record, so the modal hides those rows rather than lying.
      thumbnails: product.images
        .map((img) => img.url)
        .filter((u) => Boolean(u) && !u.includes("img.png") && !u.includes("screen.png"))
    });
  };

  const handleDirectBuy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBuying) return;
    setIsBuying(true);

    try {
      let targetVariantId = product.defaultVariantId || "";
      let targetColor = "";
      let targetStock = 25;
      let targetPricePaise = product.salePrice ?? product.basePrice;
      // Prefer the chosen variant's first image so the cart thumbnail matches the
      // colour / variant being purchased instead of defaulting to product.images[0].
      let targetImage = primary?.url || "";

      if (product.variants && product.variants.length > 0) {
        const inStock =
          product.variants.find((v) => (Number(v.stock) || 0) > 0) ||
          product.variants[0];
        targetVariantId = inStock.id;
        targetColor = inStock.color === "Default" ? "" : inStock.color;
        targetStock = inStock.stock;
        if (inStock.priceOverride) targetPricePaise = inStock.priceOverride;
        if (inStock.images?.[0]?.url) targetImage = inStock.images[0].url;
      } else if (!targetVariantId) {
        try {
          const res = await fetch(`/api/products/${product.slug}`);
          if (res.ok) {
            const fullProduct: Product = await res.json();
            if (fullProduct.variants && fullProduct.variants.length > 0) {
              const inStock =
                fullProduct.variants.find((v) => (Number(v.stock) || 0) > 0) ||
                fullProduct.variants[0];
              targetVariantId = inStock.id;
              targetColor = inStock.color === "Default" ? "" : inStock.color;
              targetStock = inStock.stock;
              if (inStock.priceOverride) targetPricePaise = inStock.priceOverride;
              if (inStock.images?.[0]?.url) targetImage = inStock.images[0].url;
            }
          }
        } catch {
          // Graceful fallback
        }
      }

      addItem({
        productId: product.id,
        variantId: targetVariantId || `var_${product.id}`,
        slug: product.slug,
        name: product.name,
        variantLabel: targetColor || (product.weave?.replace(/-/g, " ") ?? "Handloom"),
        image: targetImage || "/images/img.png",
        unitPricePaise: targetPricePaise,
        quantity: 1,
        maxStock: Math.min(30, targetStock || 25)
      });

      track.addToCart({
        productId: product.id,
        variantId: targetVariantId || `var_${product.id}`,
        priceInr: Math.round(targetPricePaise / 100)
      });

      router.push("/checkout");
    } catch {
      setIsBuying(false);
    }
  };

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-purple-100 p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-lg transition-all relative group",
        className
      )}
    >
      {/* Wishlist Button top-right */}
      <div className="absolute top-4 right-4 z-10">
        <WishlistButton
          productId={product.id}
          className="w-7 h-7 !bg-white/90 text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-colors rounded-full"
        />
      </div>

      <div>
        {/* Saree Image Container */}
        <Link href={`/products/${product.slug}`} className="block">
          <div
            className="w-full aspect-[4/5] rounded-xl overflow-hidden mb-2.5 relative border border-[#e9d5ff] p-1 shadow-inner"
            style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" }}
          >
            {primary ? (
              <>
                <Image
                  src={primary.url}
                  alt={primary.alt || product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className={cn(
                    "w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105",
                    secondary && "group-hover:opacity-0"
                  )}
                  unoptimized
                />
                {secondary && (
                  <Image
                    src={secondary.url}
                    alt={secondary.alt || product.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="w-full h-full object-cover rounded-lg opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
                    unoptimized
                  />
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No image
              </div>
            )}

            {/* Top-left Pill Badge */}
            {onSale ? (
              <span className="absolute top-2.5 left-2.5 bg-purple-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                -{salePct}%
              </span>
            ) : newFlag ? (
              <span className="absolute top-2.5 left-2.5 bg-emerald-700 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                NEW
              </span>
            ) : (
              <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                HANDLOOM
              </span>
            )}

            {/* Bottom-left Category Badge */}
            <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-brand-plum text-[9px] font-semibold px-2 py-0.5 rounded-full border border-purple-100 shadow-xs capitalize">
              {product.weave.replace(/-/g, " ")}
            </span>
          </div>
        </Link>

        {/* Product Meta */}
        <div>
          {/* Star Ratings */}
          <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
            ))}
            <span className="text-slate-400 text-[10px] ml-1">
              ({rating?.count || 48})
            </span>
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm text-brand-plum truncate group-hover:text-brand-purple transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Weave & Fabric Spec */}
          <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
            <p className="flex items-center gap-1 truncate capitalize">
              <Award className="h-3 w-3 text-brand-purple shrink-0" />
              <span>
                {product.fabric.replace(/-/g, " ")} &bull; {lengthMeters}m
              </span>
            </p>
            <p className="text-slate-400">
              {blousePieceLabel}
            </p>
          </div>

          {/* Price Row */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-bold text-sm sm:text-base text-brand-deep">
              {formattedPrice}
            </span>
            {onSale && (
              <>
                <span className="text-[11px] text-slate-400 line-through">
                  {formattedOrig}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {salePct}% OFF
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: View & Direct Buy */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleQuickView}
          aria-label="View saree details"
          title="View"
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-purple-50/80 hover:bg-purple-100 text-[#4a044e] text-xs font-semibold transition-all border border-purple-200/80 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
        >
          <Eye className="h-3.5 w-3.5 text-brand-purple shrink-0" />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={handleDirectBuy}
          disabled={isBuying}
          className="flex-1 py-1.5 px-2.5 sm:px-3 rounded-full bg-[#3b0744] hover:bg-[#4d0c58] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 active:scale-95 disabled:opacity-75 whitespace-nowrap cursor-pointer"
        >
          {isBuying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-amber-300" />
              <span className="whitespace-nowrap">Buying…</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Direct Buy</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
