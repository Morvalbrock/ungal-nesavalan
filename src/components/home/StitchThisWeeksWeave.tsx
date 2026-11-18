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
  Feather,
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

function StitchThisWeeksWeaveInner({ products }: StitchThisWeeksWeaveProps) {
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

  // Filter products by selected category
  const matchingProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    let list = [...products];

    if (activeCategory === "bridal-sarees") {
      const filtered = list.filter(
        (p) =>
          p.categoryId === "cat_bridal" ||
          p.occasion?.includes("bridal") ||
          p.name.toLowerCase().includes("bridal") ||
          p.weave?.toLowerCase().includes("bridal")
      );
      if (filtered.length > 0) list = filtered;
    } else if (activeCategory === "silk-sarees") {
      const filtered = list.filter(
        (p) =>
          p.categoryId === "cat_silk" ||
          p.fabric === "silk" ||
          p.fabric === "silk-cotton" ||
          p.name.toLowerCase().includes("silk")
      );
      if (filtered.length > 0) list = filtered;
    } else if (activeCategory === "cotton-sarees") {
      const filtered = list.filter(
        (p) =>
          p.categoryId === "cat_cotton" ||
          p.fabric === "cotton" ||
          p.fabric === "silk-cotton" ||
          p.name.toLowerCase().includes("cotton")
      );
      if (filtered.length > 0) list = filtered;
    } else if (activeCategory === "new-arrivals") {
      list = [...list].sort((a, b) => {
        const timeA = new Date((a as { createdAt?: string }).createdAt || 0).getTime();
        const timeB = new Date((b as { createdAt?: string }).createdAt || 0).getTime();
        return timeB - timeA;
      });
    }

    return list;
  }, [products, activeCategory]);

  const displayList = useMemo(() => {
    const source = matchingProducts.length > 0 ? matchingProducts : (products && products.length > 0 ? products : []);
    if (source.length === 0) return DEFAULT_PRODUCTS;

    return source.slice(0, 3).map((p, idx) => {
      const d = DEFAULT_PRODUCTS[idx % DEFAULT_PRODUCTS.length];
      const isSale = p.salePrice != null && p.salePrice < p.basePrice;
      const discountPct = isSale
        ? Math.round(((p.basePrice - (p.salePrice as number)) / p.basePrice) * 100)
        : 35;
      const formattedPrice = `₹${Math.round((p.salePrice ?? p.basePrice) / 100)}`;
      const formattedOrig = `₹${Math.round(p.basePrice / 100)}`;

      return {
        id: p.id,
        title: p.name,
        fullTitle: p.name,
        badge: p.weave?.replace(/-/g, " ") || (p.fabric ? `${p.fabric.replace(/-/g, " ")} Handloom` : d.badge),
        tag: idx === 0 ? "NEW" : idx === 1 ? "HOT" : "SILK MARK",
        tagColor: idx === 0 ? "bg-purple-900/80" : idx === 1 ? "bg-emerald-700" : "bg-amber-600",
        rating: 4.9,
        reviews: 40 + idx * 25,
        specs: `${p.fabric ? p.fabric.replace(/-/g, " ") : "Authentic Pit-Loom"} • 6.2m`,
        blouse: "With Running Blouse Piece",
        price: formattedPrice,
        originalPrice: formattedOrig,
        discount: `${discountPct}% OFF`,
        image: p.images[0]?.url || d.image,
        thumbnails:
          p.images && p.images.length > 0
            ? p.images
                .map((img) => img.url)
                .filter((u) => Boolean(u) && !u.includes("img.png") && !u.includes("screen.png"))
            : [d.image]
      };
    });
  }, [matchingProducts, products]);

  const handleDirectBuy = async (item: (typeof displayList)[0]) => {
    if (buyingId) return;
    setBuyingId(item.id);

    try {
      const numericPrice = parseInt(item.price.replace(/[^\d]/g, ""), 10) || 750;
      const pricePaise = numericPrice * 100;

      let targetVariantId = `var_${item.id}`;
      const matched = products?.find((p) => p.id === item.id);
      if (matched?.variants && matched.variants.length > 0) {
        const inStock = matched.variants.find((v) => (Number(v.stock) || 0) > 0) || matched.variants[0];
        targetVariantId = inStock.id;
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
        image: item.image,
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
              {displayList.map((p) => {
                const inWishlist = wishlist.includes(p.id);

                return (
                  <div
                    key={`mobile-${p.id}`}
                    onClick={() =>
                      openModal({
                        productId: p.id,
                        title: p.fullTitle,
                        price: p.price,
                        originalPrice: p.originalPrice,
                        discount: p.discount,
                        imageUrl: p.image,
                        badge: p.badge,
                        rating: p.rating,
                        reviewCount: p.reviews,
                        weave: "Authentic Elampillai Pit-loom",
                        fabric: p.title.includes("Cotton") ? "Pure Cotton" : "Mulberry Soft Silk",
                        length: "6.2 Meters with Blouse Piece",
                        borderWork: "Pure Zari Brocade & Temple Motifs",
                        weaver: "Master Weaver Selvam & Family",
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
                      <span className="absolute bottom-2 left-2 bg-[#4a044e] text-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {p.discount}
                      </span>
                    </div>

                    {/* Metadata & Direct Buy */}
                    <div className="pt-2 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center space-x-1 text-[10px] text-amber-500">
                          <span>★★★★★</span>
                          <span className="text-stone-400 font-sans">({p.reviews})</span>
                        </div>
                        <h4 className="text-xs font-semibold text-purple-950 mt-0.5 truncate">
                          {p.title}
                        </h4>
                        <div className="flex items-baseline space-x-1.5 mt-1">
                          <span className="text-sm font-bold text-purple-950">{p.price}</span>
                          <span className="text-[10px] line-through text-stone-400">
                            {p.originalPrice}
                          </span>
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

          {/* Mobile Artisan Heritage Feature Card (Matching Stitch Mobile Screen) */}
          <div className="mt-4" id="artisan-story" data-purpose="weaver-heritage">
            <div className="bg-gradient-to-br from-[#30012e] via-[#450341] to-[#250123] rounded-2xl p-4 text-white relative overflow-hidden shadow-lg border border-purple-800">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-12 h-12 rounded-full ring-2 ring-amber-400 p-0.5 overflow-hidden flex-shrink-0 bg-purple-900 relative">
                  <Image
                    src="/images/authentic_indian_handloom_silk_saree.png"
                    alt="Elampillai Pitloom Master Art"
                    fill
                    className="object-cover rounded-full"
                    unoptimized
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Pit-Loomed With Pride
                  </span>
                  <h3 className="font-serif text-base font-bold leading-tight !text-white text-white">
                    Master Weaver Tradition
                  </h3>
                  <p className="text-[11px] text-purple-200">Over 350+ Weaver families in Elampillai</p>
                </div>
              </div>
              <p className="text-xs text-purple-100 font-light leading-relaxed italic bg-purple-950/40 p-2.5 rounded-lg border border-purple-800/60 mb-3">
                &ldquo;Every single thread is aligned by our hereditary pit-loom artisans without machine shortcuts. When you wear Ungal Nesavalan, you preserve a generational craft.&rdquo;
              </p>
              <Link
                href="/our-weavers"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-purple-950 font-bold text-xs py-2.5 rounded-xl shadow-md transition active:scale-95"
              >
                <span>Know Our Story &amp; Weaves →</span>
              </Link>
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

            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-brand-purple hover:text-brand-plum flex items-center gap-1 group cursor-pointer shrink-0"
            >
              <span>View All Sarees</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Main Showcase Grid with Heritage Callout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Products Column (Takes 8 columns on large screen) */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {displayList.map((p) => {
                const inWishlist = wishlist.includes(p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() =>
                      openModal({
                        productId: p.id,
                        title: p.fullTitle,
                        price: p.price,
                        originalPrice: p.originalPrice,
                        discount: p.discount,
                        imageUrl: p.image,
                        badge: p.badge,
                        rating: p.rating,
                        reviewCount: p.reviews,
                        weave: "Authentic Elampillai Pit-loom",
                        fabric: p.title.includes("Cotton") ? "Pure Cotton" : "Mulberry Soft Silk",
                        length: "6.2 Meters with Blouse Piece",
                        borderWork: "Pure Zari Brocade & Temple Motifs",
                        weaver: "Master Weaver Selvam & Family",
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
                      <div className="flex items-center gap-1 text-[10px] text-amber-500 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                        ))}
                        <span className="text-slate-400 text-[10px] ml-1">({p.reviews})</span>
                      </div>

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
                        <span className="text-[11px] text-slate-400 line-through">
                          {p.originalPrice}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          {p.discount}
                        </span>
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
                              originalPrice: p.originalPrice,
                              discount: p.discount,
                              imageUrl: p.image,
                              badge: p.badge,
                              rating: p.rating,
                              reviewCount: p.reviews,
                              weave: "Authentic Elampillai Pit-loom",
                              fabric: p.title.includes("Cotton") ? "Pure Cotton" : "Mulberry Soft Silk",
                              length: "6.2 Meters with Blouse Piece",
                              borderWork: "Pure Zari Brocade & Temple Motifs",
                              weaver: "Master Weaver Selvam & Family",
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

            {/* Heritage Story Callout Banner (Takes 4 columns on large screen) */}
            <div
              className="lg:col-span-4 bg-gradient-to-br from-[#3b0946] to-[#25042d] text-white rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden"
              id="heritage-section"
            >
              {/* Background Texture Glow */}
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-amber-300">
                  <Feather className="h-3.5 w-3.5 text-amber-300" />
                  <span>Our Elampillai Heritage</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-heritage font-bold leading-snug !text-white text-white drop-shadow-sm">
                  Pit-loomed with pride. Handwoven for generations.
                </h3>
                <p className="text-purple-100/95 text-xs sm:text-sm font-normal leading-relaxed">
                  Every thread in an Ungal Nesavalan saree carries the sweat, precision, and blessings
                  of Salem&rsquo;s skilled artisan community. Directly bringing handloom glory to your
                  doorstep without middle layers.
                </p>
              </div>

              {/* Weaver Photo Card */}
              <div className="mt-6 pt-5 border-t border-purple-800/80 relative z-10 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300/80 shrink-0">
                  <Image
                    src="/images/authentic_indian_handloom_silk_saree.png"
                    alt="Handloom Weaver Artisan"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h5 className="text-xs font-bold !text-white text-white">Direct Weaver Support</h5>
                  <p className="text-[11px] text-purple-200 font-medium">Over 350+ Weaver families in Elampillai</p>
                </div>
              </div>

              <div className="mt-5 relative z-10">
                <Link
                  href="/about"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-purple-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <span>Know Our Story &amp; Weaves</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StitchThisWeeksWeave(props: StitchThisWeeksWeaveProps) {
  return (
    <Suspense fallback={<div className="min-h-[400px] bg-white animate-pulse" />}>
      <StitchThisWeeksWeaveInner {...props} />
    </Suspense>
  );
}
