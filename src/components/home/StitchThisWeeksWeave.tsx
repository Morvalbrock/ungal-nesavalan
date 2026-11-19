"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  Award,
  ArrowRight,
  Eye,
  Zap,
  Loader2
} from "lucide-react";
import { useSareeModalStore } from "./saree-modal-store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { useCartStore } from "@/features/cart/cart.store";
import type { ProductSummary } from "@/types/product";
import { cn } from "@/lib/utils";

interface StitchThisWeeksWeaveProps {
  products?: ProductSummary[];
  // Keyed by product id. Rows with count=0 mean the product has no reviews yet —
  // cards and the quick-view modal suppress the rating row in that case instead
  // of showing a fabricated 4.9⭐ / 48 reviews.
  ratings?: Record<string, { avg: number; count: number }>;
}

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    title: "Kalyani Silk Cotton Saree",
    fullTitle: "Kalyani Silk Cotton Saree with Floral Zari",
    badge: "Silk Cotton",
    tag: "NEW",
    tagColor: "bg-purple-900/80",
    rating: 4.8,
    reviews: 42,
    specs: "Zari Floral Motifs • 6.2m",
    blouse: "With Running Blouse Piece",
    price: "₹800",
    originalPrice: "₹1,299",
    discount: "38% OFF",
    image:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg",
    thumbnails: [
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg"
    ]
  },
  {
    id: "p2",
    title: "Maheshwari Cotton Saree",
    fullTitle: "Maheshwari Cotton Saree with Mustard & Green Border",
    badge: "Handloom",
    tag: "HOT",
    tagColor: "bg-emerald-700",
    rating: 5.0,
    reviews: 58,
    specs: "Mustard & Green Zari • 6.2m",
    blouse: "With Contrast Blouse Piece",
    price: "₹890",
    originalPrice: "₹1,450",
    discount: "39% OFF",
    image:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg",
    thumbnails: [
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg"
    ]
  },
  {
    id: "p3",
    title: "Aarani Soft Silk Saree",
    fullTitle: "Royal Violet Aarani Soft Silk Saree with Pure Zari Border",
    badge: "Soft Silk",
    tag: "SILK MARK",
    tagColor: "bg-amber-600",
    rating: 4.9,
    reviews: 96,
    specs: "Royal Violet Gold Zari • 6.2m",
    blouse: "With Rich Brocade Blouse",
    price: "₹750",
    originalPrice: "₹1,150",
    discount: "35% OFF",
    image:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg",
    thumbnails: [
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg"
    ]
  }
];

const CATEGORY_TABS = [
  { id: "all", label: "All Sarees" },
  { id: "bridal-sarees", label: "Bridal Sarees" },
  { id: "silk-sarees", label: "Silk Sarees" },
  { id: "cotton-sarees", label: "Cotton Sarees" },
  { id: "new-arrivals", label: "New Arrivals", badge: "New" }
];

function StitchThisWeeksWeaveInner({ products, ratings }: StitchThisWeeksWeaveProps) {
  const openModal = useSareeModalStore((s) => s.open);
  const wishlist = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    } else {
      setActiveCategory("all");
    }
  }, [categoryParam]);

  const handleTabClick = (tabId: string) => {
    setActiveCategory(tabId);
    const url = tabId === "all" ? "/" : `/?category=${tabId}#this-weeks-weave`;
    router.replace(url, { scroll: false });
  };

  // Filter products by selected category. Returns the honest filtered list — an
  // empty result means "no products in this category", not "fall back to all",
  // so clicking Bridal never surfaces cotton sarees. The tab IDs are matched
  // against admin-managed signals (categoryId, category slug, occasion, fabric,
  // and name) so seed and admin-created categories both work without a redeploy.
  const matchingProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    if (activeCategory === "all") return [...products];

    if (activeCategory === "new-arrivals") {
      // createdAt is now surfaced on ProductSummary, so this is a real sort.
      return [...products].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    if (activeCategory === "bridal-sarees") {
      return products.filter(
        (p) =>
          p.categoryId === "cat_bridal" ||
          p.occasion?.includes("bridal") ||
          p.name.toLowerCase().includes("bridal") ||
          p.weave?.toLowerCase().includes("bridal")
      );
    }
    if (activeCategory === "silk-sarees") {
      return products.filter(
        (p) =>
          p.categoryId === "cat_silk" ||
          p.fabric === "silk" ||
          p.fabric === "silk-cotton" ||
          p.name.toLowerCase().includes("silk")
      );
    }
    if (activeCategory === "cotton-sarees") {
      return products.filter(
        (p) =>
          p.categoryId === "cat_cotton" ||
          p.fabric === "cotton" ||
          p.fabric === "silk-cotton" ||
          p.name.toLowerCase().includes("cotton")
      );
    }

    return [...products];
  }, [products, activeCategory]);

  const displayList = useMemo(() => {
    // No live products at all (fresh install, no catalog seeded) — render the
    // static showcase so the page isn't empty. All "live" fields are undefined
    // and the card UI below knows to hide them.
    if (!products || products.length === 0) {
      return DEFAULT_PRODUCTS.map((d) => ({
        ...d,
        onSale: true,
        ratingAvg: undefined as number | undefined,
        ratingCount: undefined as number | undefined,
        weaveLabel: undefined as string | undefined,
        fabricLabel: undefined as string | undefined,
        lengthMeters: undefined as number | undefined,
        blousePieceIncluded: undefined as boolean | undefined,
        variantImage: undefined as string | undefined
      }));
    }

    return matchingProducts.slice(0, 6).map((p, idx) => {
      const d = DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length];
      const onSale = p.salePrice != null && p.salePrice < p.basePrice;
      const discountPct = onSale
        ? Math.round(((p.basePrice - (p.salePrice as number)) / p.basePrice) * 100)
        : 0;
      const formattedPrice = `₹${Math.round((p.salePrice ?? p.basePrice) / 100)}`;
      const formattedOrig = onSale ? `₹${Math.round(p.basePrice / 100)}` : undefined;

      // Real admin data for the quick-view modal. Variant image wins when the
      // first in-stock variant has its own photo, so the modal (and the Direct
      // Buy cart entry) matches the colour the customer is about to buy.
      const firstInStockVariant =
        p.variants?.find((v) => (Number(v.stock) || 0) > 0) ?? p.variants?.[0];
      const variantImage = firstInStockVariant?.images?.[0]?.url;
      const primaryImage = variantImage || p.images[0]?.url || d.image;
      const fabricLabel = p.fabric ? p.fabric.replace(/-/g, " ") : undefined;
      const lengthValue =
        "lengthMeters" in p && typeof (p as { lengthMeters?: number }).lengthMeters === "number"
          ? (p as { lengthMeters: number }).lengthMeters
          : 6.2;
      const blouseIncluded =
        "blousePieceIncluded" in p && typeof (p as { blousePieceIncluded?: boolean }).blousePieceIncluded === "boolean"
          ? (p as { blousePieceIncluded: boolean }).blousePieceIncluded
          : undefined;

      // Real review aggregate per product. count=0 means no reviews yet — the
      // card hides the rating row rather than fabricate "(40)" / "(65)" / "(90)".
      const agg = ratings?.[p.id];
      const ratingCount = agg?.count ?? 0;
      const ratingAvg = ratingCount > 0 ? Number((agg!.avg).toFixed(1)) : undefined;

      return {
        id: p.id,
        title: p.name,
        fullTitle: p.name,
        badge: p.weave?.replace(/-/g, " ") || (p.fabric ? `${p.fabric.replace(/-/g, " ")} Handloom` : d.badge),
        tag: idx === 0 ? "NEW" : idx === 1 ? "HOT" : "SILK MARK",
        tagColor: idx === 0 ? "bg-purple-900/80" : idx === 1 ? "bg-emerald-700" : "bg-amber-600",
        specs: `${fabricLabel ?? "Authentic Pit-Loom"} • ${lengthValue}m`,
        blouse: blouseIncluded === false ? "Direct Loom Finish" : "With Running Blouse Piece",
        price: formattedPrice,
        originalPrice: formattedOrig,
        discount: onSale ? `${discountPct}% OFF` : undefined,
        onSale,
        ratingAvg,
        ratingCount,
        image: primaryImage,
        thumbnails:
          p.images && p.images.length > 0
            ? p.images
                .map((img) => img.url)
                .filter((u) => Boolean(u) && !u.includes("img.png") && !u.includes("screen.png"))
            : [d.image],
        weaveLabel: p.weave?.replace(/-/g, " ") || undefined,
        fabricLabel,
        lengthMeters: lengthValue,
        blousePieceIncluded: blouseIncluded,
        variantImage
      };
    });
  }, [matchingProducts, products, ratings]);


  const handleDirectBuy = async (item: (typeof displayList)[0]) => {
    if (buyingId) return;
    setBuyingId(item.id);

    try {
      const numericPrice = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 750;
      const pricePaise = numericPrice * 100;

      let targetVariantId = `var_${item.id}`;
      // item.image already prefers the first in-stock variant's image from the
      // displayList mapping. If the fetched fallback path picks a different variant,
      // it overrides this so the cart thumbnail stays in sync.
      let targetImage = item.image;
      const matched = products?.find((p) => p.id === item.id);
      if (matched?.variants && matched.variants.length > 0) {
        const inStock = matched.variants.find((v) => (Number(v.stock) || 0) > 0) || matched.variants[0];
        targetVariantId = inStock.id;
        if (inStock.images?.[0]?.url) targetImage = inStock.images[0].url;
      } else if (matched?.slug) {
        try {
          const res = await fetch(`/api/products/${matched.slug}`);
          if (res.ok) {
            const fullProduct = await res.json();
            if (fullProduct.variants && fullProduct.variants.length > 0) {
              const inStock =
                fullProduct.variants.find((v: { stock?: number }) => (Number(v.stock) || 0) > 0) ||
                fullProduct.variants[0];
              targetVariantId = inStock.id;
              if (inStock.images?.[0]?.url) targetImage = inStock.images[0].url;
            }
          }
        } catch {
          // Graceful fallback
        }
      }

      addItem({
        productId: item.id,
        variantId: targetVariantId,
        slug: matched?.slug || "handloom-saree",
        name: item.title,
        variantLabel: item.badge,
        image: targetImage,
        unitPricePaise: pricePaise,
        quantity: 1,
        maxStock: 25
      });

      router.push("/checkout");
    } catch {
      setBuyingId(null);
    }
  };

  return (
    <section className="py-6 sm:py-12 bg-white border-t border-purple-100" id="this-weeks-weave" data-purpose="this-weeks-weaves">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* MOBILE VIEW: Exact Stitch Mobile Swipeable Products Rail  */}
        {/* ========================================================= */}
        <div className="md:hidden">
          {/* Mobile Header with Loom Fresh badge */}
          <div className="flex items-center justify-between mb-2.5 border-b border-purple-50 pb-2">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase">
                Handloom Fresh Arrivals
              </span>
              <h2 className="text-lg font-serif font-bold text-purple-950">This Week&rsquo;s Weave</h2>
            </div>
            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
              Loom Fresh
            </span>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer",
                    isSelected
                      ? "bg-brand-deep text-white shadow-xs"
                      : "bg-purple-50 text-brand-plum border border-purple-200/60"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-gradient-to-r from-pink-500 to-amber-400 text-white text-[8px] font-bold px-1 rounded-full uppercase">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Horizontal Snap Scroll Rail */}
          <div className="relative -mx-3.5 px-3.5">
            <div className="flex space-x-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 scroll-smooth">
              {matchingProducts.length === 0 && products && products.length > 0 ? (
                <EmptyCategoryState />
              ) : displayList.map((p) => {
                const inWishlist = wishlist.includes(p.id);

                return (
                  <div
                    key={`mobile-${p.id}`}
                    onClick={() =>
                      openModal({
                        productId: p.id,
                        title: p.fullTitle,
                        price: p.price,
                        originalPrice: p.onSale ? p.originalPrice : undefined,
                        discount: p.onSale ? p.discount : undefined,
                        imageUrl: p.image,
                        badge: p.badge,
                        rating: p.ratingAvg,
                        reviewCount: p.ratingCount,
                        weave: p.weaveLabel,
                        fabric: p.fabricLabel,
                        length:
                          p.lengthMeters != null
                            ? `${p.lengthMeters} Meters${
                                p.blousePieceIncluded === false
                                  ? " (blouse piece not included)"
                                  : p.blousePieceIncluded === true
                                    ? " with Blouse Piece"
                                    : ""
                              }`
                            : undefined,
                        blousePieceIncluded: p.blousePieceIncluded,
                        thumbnails: p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.image]
                      })
                    }
                    className="min-w-[155px] w-[155px] snap-start flex flex-col group flex-shrink-0 bg-white rounded-xl border border-purple-100 p-2 shadow-xs cursor-pointer"
                  >
                    {/* Square Image Box */}
                    <div className="relative rounded-lg overflow-hidden bg-purple-50 aspect-square">
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="155px"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        unoptimized
                      />
                      <button
                        type="button"
                        aria-label="Add to Wishlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-purple-900 flex items-center justify-center shadow-xs active:scale-90 transition"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            inWishlist ? "fill-rose-500 text-rose-500" : ""
                          }`}
                        />
                      </button>
                      {p.onSale && p.discount && (
                        <span className="absolute bottom-2 left-2 bg-[#4a044e] text-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {p.discount}
                        </span>
                      )}
                    </div>

                    {/* Metadata & Direct Buy */}
                    <div className="pt-2 flex flex-col justify-between flex-1">
                      <div>
                        {p.ratingCount != null && p.ratingCount > 0 && (
                          <div className="flex items-center space-x-1 text-[10px] text-amber-500">
                            <span>★★★★★</span>
                            <span className="text-stone-400 font-sans">({p.ratingCount})</span>
                          </div>
                        )}
                        <h4 className="text-xs font-semibold text-purple-950 mt-0.5 truncate">
                          {p.title}
                        </h4>
                        <div className="flex items-baseline space-x-1.5 mt-1">
                          <span className="text-sm font-bold text-purple-950">{p.price}</span>
                          {p.onSale && p.originalPrice && (
                            <span className="text-[10px] line-through text-stone-400">
                              {p.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDirectBuy(p);
                        }}
                        disabled={buyingId === p.id}
                        className="w-full mt-2 py-1.5 text-[11px] font-bold text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition active:scale-95 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        {buyingId === p.id ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin shrink-0 text-purple-950" />
                            <span>Adding…</span>
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 text-purple-950 fill-purple-950 shrink-0" />
                            <span>+ Direct Buy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DESKTOP VIEW: Multi-Column Grid + Heritage Story Callout  */}
        {/* ========================================================= */}
        <div className="hidden md:block">
          {/* Top header with Title & Interactive Category Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-purple-100 gap-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Handloom Fresh Arrivals
              </span>
              <h2 className="text-2xl sm:text-3xl font-heritage font-bold text-brand-plum mt-0.5">
                This Week&rsquo;s Weave
              </h2>
            </div>

            {/* Interactive Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORY_TABS.map((tab) => {
                const isSelected = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
                      isSelected
                        ? "bg-brand-deep text-white shadow-sm ring-2 ring-brand-purple/20"
                        : "bg-purple-50 text-brand-plum hover:bg-purple-100 border border-purple-200/60"
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="bg-gradient-to-r from-pink-500 to-amber-400 text-white text-[8px] font-bold px-1 rounded-full uppercase tracking-tighter">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Products grid — single row of 6 on desktop (lg:grid-cols-6);
              responsive drops to 3 cols on tablet, 2 on mobile. Right-side
              CTA tile removed; "View All Sarees" button sits centered below. */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {matchingProducts.length === 0 && products && products.length > 0 ? (
              <div className="col-span-2 sm:col-span-3 lg:col-span-6">
                <EmptyCategoryState />
              </div>
            ) : displayList.map((p) => {
                const inWishlist = wishlist.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() =>
                      openModal({
                        productId: p.id,
                        title: p.fullTitle,
                        price: p.price,
                        originalPrice: p.onSale ? p.originalPrice : undefined,
                        discount: p.onSale ? p.discount : undefined,
                        imageUrl: p.image,
                        badge: p.badge,
                        rating: p.ratingAvg,
                        reviewCount: p.ratingCount,
                        weave: p.weaveLabel,
                        fabric: p.fabricLabel,
                        length:
                          p.lengthMeters != null
                            ? `${p.lengthMeters} Meters${
                                p.blousePieceIncluded === false
                                  ? " (blouse piece not included)"
                                  : p.blousePieceIncluded === true
                                    ? " with Blouse Piece"
                                    : ""
                              }`
                            : undefined,
                        blousePieceIncluded: p.blousePieceIncluded,
                        thumbnails: p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.image]
                      })
                    }
                    className="bg-white rounded-2xl border border-purple-100 p-3 flex flex-col justify-between hover:shadow-lg transition-all relative group cursor-pointer"
                  >
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      className="absolute top-5 right-5 z-10 w-7 h-7 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 shadow-sm flex items-center justify-center transition-colors"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          inWishlist ? "fill-rose-500 text-rose-500" : ""
                        }`}
                      />
                    </button>

                    <div
                      className="aspect-[4/5] rounded-xl overflow-hidden mb-2.5 relative border border-[#e9d5ff] p-1 shadow-inner"
                      style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" }}
                    >
                      <Image
                        src={p.image}
                        alt={p.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                      />

                      {/* Tag Badge */}
                      <span
                        className={`absolute top-2.5 left-2.5 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm ${p.tagColor}`}
                      >
                        {p.tag}
                      </span>

                      {/* Category Pill */}
                      <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-brand-plum text-[9px] font-semibold px-2 py-0.5 rounded-full border border-purple-100 shadow-xs capitalize">
                        {p.badge}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div>
                      {p.ratingCount != null && p.ratingCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                          ))}
                          <span className="text-slate-400 text-[10px] ml-1">({p.ratingCount})</span>
                        </div>
                      )}

                      <h3 className="font-semibold text-xs sm:text-sm text-brand-plum truncate">
                        {p.title}
                      </h3>

                      <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                        <p className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-brand-purple" />
                          {p.specs}
                        </p>
                        <p className="text-slate-400">{p.blouse}</p>
                      </div>

                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="font-bold text-sm text-brand-deep">{p.price}</span>
                        {p.onSale && p.originalPrice && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {p.originalPrice}
                          </span>
                        )}
                        {p.onSale && p.discount && (
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {p.discount}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Quick View & Direct Buy */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal({
                              productId: p.id,
                              title: p.fullTitle,
                              price: p.price,
                              originalPrice: p.onSale ? p.originalPrice : undefined,
                              discount: p.onSale ? p.discount : undefined,
                              imageUrl: p.image,
                              badge: p.badge,
                              rating: p.ratingAvg,
                              reviewCount: p.ratingCount,
                              weave: p.weaveLabel,
                              fabric: p.fabricLabel,
                              length:
                                p.lengthMeters != null
                                  ? `${p.lengthMeters} Meters${
                                      p.blousePieceIncluded === false
                                        ? " (blouse piece not included)"
                                        : p.blousePieceIncluded === true
                                          ? " with Blouse Piece"
                                          : ""
                                    }`
                                  : undefined,
                              blousePieceIncluded: p.blousePieceIncluded,
                              thumbnails: p.thumbnails && p.thumbnails.length > 0 ? p.thumbnails : [p.image]
                            });
                          }}
                          className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-purple text-xs font-semibold transition-all shadow-xs flex items-center justify-center shrink-0 border border-purple-200/60"
                          title="View details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline text-[11px] ml-1">View</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectBuy(p);
                          }}
                          disabled={buyingId === p.id}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-gradient-to-r from-brand-deep to-brand-purple hover:from-brand-purple hover:to-brand-deep text-white text-xs font-bold transition-all shadow-sm shadow-brand-deep/20 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-75"
                        >
                          {buyingId === p.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-amber-300" />
                              <span>Buying…</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300 shrink-0" />
                              <span>Direct Buy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Centered CTA below the single-row product grid — replaces the old
              right-side tile now that products span the full width. */}
          <div className="flex justify-center mt-8">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              <span>View All Sarees</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Rendered when the active category tab filters down to zero live products.
// Replaces the previous "silently show every product" fallback so customers
// never see cotton sarees under the Bridal tab.
function EmptyCategoryState() {
  return (
    <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-brand-plum">No sarees in this filter yet</p>
      <p className="mt-1 text-xs text-slate-500">
        Our weavers are still finishing this collection. Browse other weaves while they're on the loom.
      </p>
      <Link
        href="/products"
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:text-brand-plum"
      >
        View all sarees
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function StitchThisWeeksWeave(props: StitchThisWeeksWeaveProps) {
  return (
    <Suspense fallback={<div className="min-h-[400px] bg-white animate-pulse" />}>
      <StitchThisWeeksWeaveInner {...props} />
    </Suspense>
  );
}
