"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Heart, X, Eye } from "lucide-react";
import type { ProductSummary } from "@/types/product";
import { formatINR } from "@/lib/utils";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";
import { useCartStore } from "@/features/cart/cart.store";

interface HeirloomGalleryProps {
  products: ProductSummary[];
  availableWeaves?: { id: string; label: string; count: number }[];
}

export function HeirloomGallery({ products, availableWeaves = [] }: HeirloomGalleryProps) {
  const [selectedCluster, setSelectedCluster] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductSummary | null>(null);

  const wishlist = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const addItemToCart = useCartStore((s) => s.addItem);

  // Extract clusters based on in-stock products
  const clusters = useMemo(() => {
    const list = [{ id: "all", label: "All Sarees" }];
    if (availableWeaves.length > 0) {
      availableWeaves.slice(0, 5).forEach((w) => {
        list.push({ id: w.id.toLowerCase(), label: w.label });
      });
    } else {
      list.push(
        { id: "kanjivaram", label: "Kanchipuram Silk" },
        { id: "jamdani", label: "Bishnupur Jamdani" },
        { id: "banarasi", label: "Banarasi Brocade" },
        { id: "chanderi", label: "Chanderi Zari" },
        { id: "patola", label: "Patola & Ikat" }
      );
    }
    return list;
  }, [availableWeaves]);

  // Filter products by selected cluster
  const filteredProducts = useMemo(() => {
    if (selectedCluster === "all") return products;
    return products.filter((p) => {
      const w = p.weave?.toLowerCase() || "";
      const f = p.fabric?.toLowerCase() || "";
      const n = p.name.toLowerCase();
      return w.includes(selectedCluster) || f.includes(selectedCluster) || n.includes(selectedCluster);
    });
  }, [products, selectedCluster]);

  const displayList = filteredProducts.slice(0, 8);

  const handleAcquire = (product: ProductSummary) => {
    addItemToCart({
      productId: product.id,
      variantId: `${product.id}_default`,
      slug: product.slug,
      name: product.name,
      variantLabel: product.weave || "Authentic Handloom",
      image: product.images[0]?.url || "/images/placeholder.jpg",
      unitPricePaise: product.salePrice ?? product.basePrice,
      quantity: 1,
      maxStock: 10
    });
    setQuickViewProduct(null);
  };

  const qvExtra = quickViewProduct as unknown as { region?: string; description?: string } | null;
  const qvRegion = qvExtra?.region || "Kanchipuram";
  const qvDesc =
    qvExtra?.description ||
    "Authentic handloom drape woven with generational mastery, pure natural silks, and artisanal pride.";

  return (
    <>
      {/* SECTION 2: CURATED WEAVE CLUSTERS (FILTER BAR) */}
      <section className="w-full bg-[#FBF9F5] py-5 px-4 md:px-12 border-b border-[#D0C4BF]/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            {clusters.map((c) => {
              const active = selectedCluster === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCluster(c.id)}
                  className={`px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold transition-all ${
                    active
                      ? "bg-[#1F1916] text-[#E5C378] border border-[#C69C55] shadow-sm"
                      : "bg-[#F5EFEB] text-[#1B1C1A] hover:bg-[#EAE8E4] border border-transparent"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <Link
            href="/products"
            className="group flex items-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7A5817] hover:text-[#1B1C1A] transition-colors whitespace-nowrap"
          >
            <span>View Atlas of Weaves</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* SECTION 3: THE HEIRLOOM GALLERY (4-COLUMN SHOWCASE) */}
      <section className="w-full bg-[#FBF9F5] py-16 md:py-24 px-4 md:px-12" id="featured-drapes">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-[#7A5817] font-semibold block mb-1">
                Pure Handloom Vault · 2025 Release
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-[#1B1C1A]">The Heirloom Gallery</h2>
            </div>
            <p className="text-xs md:text-sm text-[#4D4541] max-w-md text-left md:text-right leading-relaxed">
              Every piece is single-origin, certified pure zari, individually woven by honored master-weavers on ancestral pit looms.
            </p>
          </div>

          {/* 4-Column Responsive Grid */}
          {displayList.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#4D4541]">
              No sarees currently in stock for this weave. Explore our other authentic handloom collections.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayList.map((product) => {
                const inWishlist = wishlist.includes(product.id);
                const firstImage = product.images[0]?.url || "/images/placeholder.jpg";
                const isSale = product.salePrice && product.salePrice < product.basePrice;
                const price = product.salePrice ?? product.basePrice;

                // Feature tag
                const tag =
                  product.weave?.toUpperCase() ||
                  product.fabric?.toUpperCase() ||
                  "PURE HANDLOOM";

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-[#F5EFEB] border border-[#C69C55]/20 p-2.5 transition-all duration-500 hover:shadow-xl hover:border-[#C69C55]/50"
                  >
                    {/* Image Frame */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#EFEEEA] mb-3">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={firstImage}
                          alt={product.name}
                          width={480}
                          height={640}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
                        <span className="px-2 py-0.5 bg-[#7A5817] text-[#FDFBF7] text-[9.5px] uppercase tracking-wider font-semibold">
                          {tag}
                        </span>
                        {(product as unknown as { region?: string }).region && (
                          <span className="px-2 py-0.5 bg-[#1F1916] text-[#E5C378] text-[9.5px] uppercase tracking-wider">
                            {(product as unknown as { region?: string }).region}
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        aria-label="Save to Wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product.id);
                        }}
                        className={`absolute top-2 right-2 h-8 w-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors ${
                          inWishlist
                            ? "bg-[#7D1D24] text-white"
                            : "bg-white/80 text-[#1B1C1A] hover:text-[#7D1D24]"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
                      </button>

                      {/* Quick View Button Overlay */}
                      <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          className="w-full py-2 bg-white/95 backdrop-blur-md text-[#1B1C1A] text-[10.5px] font-semibold tracking-widest uppercase hover:bg-[#1F1916] hover:text-[#FDFBF7] transition-colors shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Quick View
                        </button>
                      </div>
                    </div>

                    {/* Meta & Title */}
                    <div className="flex flex-col flex-1 justify-between px-1 pb-1">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#7A5817] font-semibold block mb-0.5">
                          {(product as unknown as { region?: string }).region || "Kanchipuram Guild"}
                        </span>
                        <Link href={`/products/${product.slug}`} className="block">
                          <h3 className="font-display text-[16px] text-[#1B1C1A] font-medium leading-snug line-clamp-1 group-hover:text-[#7D1D24] transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-[#D0C4BF]/30">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-[#1B1C1A]">
                            {formatINR(price)}
                          </span>
                          {isSale && (
                            <span className="text-xs text-[#7F7570] line-through">
                              {formatINR(product.basePrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-semibold text-[#7A5817] tracking-wider">
                          Silk Mark
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 bg-[#1F1916]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FBF9F5] max-w-3xl w-full p-6 border border-[#C69C55]/40 shadow-2xl relative grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeUp">
            <button
              type="button"
              aria-label="Close modal"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-[#EFEEEA] flex items-center justify-center text-[#1B1C1A] hover:text-[#7D1D24] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="w-full aspect-[3/4] bg-[#EFEEEA] overflow-hidden">
              <Image
                src={quickViewProduct.images[0]?.url || "/images/placeholder.jpg"}
                alt={quickViewProduct.name}
                width={600}
                height={800}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="flex flex-col justify-between pt-1">
              <div>
                <span className="text-[10.5px] uppercase tracking-widest text-[#7A5817] font-semibold block mb-1">
                  {quickViewProduct.weave || "Authentic Handloom"} · {qvRegion}
                </span>
                <h3 className="font-display text-2xl text-[#1B1C1A] mb-2 leading-tight">
                  {quickViewProduct.name}
                </h3>
                <p className="text-xs text-[#4D4541] mb-3 line-clamp-3">
                  {qvDesc}
                </p>

                <div className="text-xl font-bold text-[#1B1C1A] mb-4">
                  {formatINR(quickViewProduct.salePrice ?? quickViewProduct.basePrice)}
                  {quickViewProduct.salePrice && (
                    <span className="ml-2 text-sm text-[#7F7570] font-normal line-through">
                      {formatINR(quickViewProduct.basePrice)}
                    </span>
                  )}
                </div>

                <div className="border-t border-b border-[#D0C4BF]/40 py-3 my-2 space-y-2 text-xs text-[#4D4541]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7A5817] shrink-0" />
                    <span>100% Certified Mulberry Silk & Pure Zari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7A5817] shrink-0" />
                    <span>Pure Zari Hallmarking Certificate Included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#7A5817] shrink-0" />
                    <span>Complimentary Fall, Pico & Silk Care Box</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleAcquire(quickViewProduct)}
                  className="w-full py-3 bg-[#7D1D24] hover:bg-[#94252D] text-[#FDFBF7] text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors shadow-md text-center"
                >
                  Acquire Drape
                </button>
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full py-2 text-center text-[#1B1C1A] text-[11px] uppercase tracking-widest font-semibold hover:text-[#7A5817] transition-colors"
                >
                  View Full Drape Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
