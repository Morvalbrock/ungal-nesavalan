"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { Catalog } from "@/types/catalog";
import type { Category } from "@/types/category";

interface StitchWeaveFamiliesProps {
  catalogs?: (Pick<Catalog, "slug" | "name" | "imageUrl"> & {
    count: number;
    sort?: number;
    minPricePaise?: number;
  })[];
  categories?: Category[];
  fallbackImageBySlug?: Record<string, string>;
}

// Presets only carry cosmetic defaults (subtitle/tag/image) for well-known weaves.
// Price is intentionally absent — the tile's "From ₹X" is computed from real product
// data in page.tsx so admin price edits flow through to the home page.
const WEAVE_PRESETS: Record<
  string,
  {
    subtitle?: string;
    tag?: string;
    tagColor?: string;
    defaultImage?: string;
  }
> = {
  "kalyani-silk-cotton": {
    subtitle: "Rich Zari Floral Buttas",
    tag: "Popular",
    tagColor: "bg-purple-950/80 text-amber-300",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg"
  },
  "maheshwari-cotton": {
    subtitle: "Mustard & Dark Green",
    tag: "Cool Fabric",
    tagColor: "bg-emerald-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg"
  },
  "aarani-soft-silk": {
    subtitle: "Gold Tissue Border",
    tag: "Royal Violet",
    tagColor: "bg-amber-600/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg"
  },
  "aarani-checked-sarees": {
    subtitle: "Traditional Checks",
    tag: "Classic Checks",
    tagColor: "bg-indigo-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792826948/ungal-nesavalan/products/omi8newighip6nx9ohv8.jpg"
  },
  "wedding-silk-sarees": {
    subtitle: "Traditional Crimson",
    tag: "Bridal Zari",
    tagColor: "bg-rose-700/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg"
  },
  "borderless-sarees": {
    subtitle: "Modern Minimalist Weave",
    tag: "Borderless",
    tagColor: "bg-purple-800/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793848355/ungal-nesavalan/products/xprqgesbiucrsejmfaur.jpg"
  },
  "nayanthara-cotton": {
    subtitle: "Soft Cotton Saree",
    tag: "Daily Wear",
    tagColor: "bg-teal-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg"
  },
  "embossed-sarees": {
    subtitle: "Embossed Jacquard",
    tag: "Festive Weave",
    tagColor: "bg-purple-900/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg"
  },
  "bridal-sarees": {
    subtitle: "Muhurtham Silk",
    tag: "Bridal Edit",
    tagColor: "bg-rose-800/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg"
  }
};

function formatFromPrice(paise: number | undefined): string | null {
  if (paise == null || !Number.isFinite(paise)) return null;
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export function StitchWeaveFamilies({ catalogs, categories, fallbackImageBySlug }: StitchWeaveFamiliesProps) {
  const items = useMemo(() => {
    // Only surface catalogs that actually have in-stock products (count > 0).
    // Admin-created catalogs with no products yet are hidden so customers never
    // tap a tile that leads to an empty results page.
    const validCatalogs = (catalogs ?? [])
      .filter((c) => c.count > 0)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

    return validCatalogs.map((cat) => {
      const slugKey = cat.slug.toLowerCase();
      const preset = WEAVE_PRESETS[slugKey];
      const fallbackImg = fallbackImageBySlug && fallbackImageBySlug[slugKey];
      const imageSrc =
        cat.imageUrl ||
        fallbackImg ||
        preset?.defaultImage ||
        "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg";
      // "minPricePaise" only exists on live catalog tiles (page.tsx builds it).
      // The fallback preset-only path has no real products yet → leave priceAmount null.
      const minPricePaise = "minPricePaise" in cat ? cat.minPricePaise : undefined;

      return {
        title: cat.name,
        slug: cat.slug,
        priceAmount: formatFromPrice(minPricePaise),
        subtitle: preset?.subtitle || "Authentic Handloom Weave",
        tag: preset?.tag || (cat.count > 0 ? `${cat.count} Designs` : "Handloom"),
        tagColor: preset?.tagColor || "bg-purple-950/80 text-amber-300",
        image: imageSrc,
        count: cat.count
      };
    });
  }, [catalogs, fallbackImageBySlug]);

  // No admin-live catalogs to surface → hide the whole section rather than
  // show a half-empty rail or seed fallbacks.
  if (items.length === 0) return null;

  return (
    <section
      className="scroll-mt-24 py-6 sm:py-12 bg-[#fcf9ff] border-t border-purple-100 relative"
      id="collections"
      data-purpose="browse-weave-families"
    >
      <div id="weave-families" className="absolute -top-24 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Mobile header — compact heading + View All link */}
        <div className="flex md:hidden items-end justify-between mb-3">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-amber-700">
              Elampillai Specials
            </span>
            <h2 className="text-lg font-serif font-bold text-[#350232]">Weave Collections</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-purple-800 hover:text-amber-700 transition"
          >
            View All →
          </Link>
        </div>

        {/* Desktop header — centered title block */}
        <div className="hidden md:block text-center max-w-2xl mx-auto mb-8">
          <div className="gold-divider text-brand-gold text-xs font-semibold uppercase tracking-widest mb-1.5">
            Curated Heritage
          </div>
          <h2 className="text-3xl sm:text-4xl font-heritage font-bold text-brand-plum">
            Browse Our Weave Families
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Discover handpicked varieties woven using traditional jacquard and pit-loom techniques
          </p>
        </div>

        {/* Unified catalog grid. Responsive column count — 2 on mobile, 3 on
             sm (tablet), 4 on md, 6 on lg+ — so a row of 6 catalogs lines up
             exactly on desktop instead of overflowing one tile into row 2.
             Cards auto-size to the column width; overflow wraps left-start. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/products?weave=${item.slug}`}
              className="bg-white rounded-xl overflow-hidden border border-purple-100 shadow-xs hover:shadow-md hover:border-purple-300 flex flex-col group transition-all active:scale-95"
            >
                <div className="relative aspect-[4/3] bg-purple-50 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover group-hover:scale-105 transition duration-500"
                    unoptimized
                  />
                </div>
                <div className="p-2.5 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-purple-950 truncate">
                    {item.title}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    {item.priceAmount ? (
                      <span className="text-[11px] font-semibold text-purple-900">
                        From {item.priceAmount}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-purple-600">Explore</span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-purple-500 group-hover:text-amber-600 transition stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] text-brand-purple/80 font-medium mt-0.5">
                    {item.count} saree{item.count === 1 ? "" : "s"}
                  </span>
                </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
