"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Catalog } from "@/types/catalog";
import type { Category } from "@/types/category";

interface StitchWeaveFamiliesProps {
  catalogs?: (Pick<Catalog, "slug" | "name" | "imageUrl"> & { count: number; sort?: number })[];
  categories?: Category[];
  fallbackImageBySlug?: Record<string, string>;
}

const WEAVE_PRESETS: Record<
  string,
  {
    priceText?: string;
    subtitle?: string;
    tag?: string;
    tagColor?: string;
    defaultImage?: string;
  }
> = {
  "kalyani-silk-cotton": {
    priceText: "From ₹800",
    subtitle: "Rich Zari Floral Buttas",
    tag: "Popular",
    tagColor: "bg-purple-950/80 text-amber-300",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg"
  },
  "maheshwari-cotton": {
    priceText: "From ₹890",
    subtitle: "Mustard & Dark Green",
    tag: "Cool Fabric",
    tagColor: "bg-emerald-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg"
  },
  "aarani-soft-silk": {
    priceText: "From ₹750",
    subtitle: "Gold Tissue Border",
    tag: "Royal Violet",
    tagColor: "bg-amber-600/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg"
  },
  "aarani-checked-sarees": {
    priceText: "From ₹799",
    subtitle: "Traditional Checks",
    tag: "Classic Checks",
    tagColor: "bg-indigo-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792826948/ungal-nesavalan/products/omi8newighip6nx9ohv8.jpg"
  },
  "wedding-silk-sarees": {
    priceText: "From ₹1,499",
    subtitle: "Traditional Crimson",
    tag: "Bridal Zari",
    tagColor: "bg-rose-700/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg"
  },
  "borderless-sarees": {
    priceText: "From ₹750",
    subtitle: "Modern Minimalist Weave",
    tag: "Borderless",
    tagColor: "bg-purple-800/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793848355/ungal-nesavalan/products/xprqgesbiucrsejmfaur.jpg"
  },
  "nayanthara-cotton": {
    priceText: "From ₹850",
    subtitle: "Soft Cotton Saree",
    tag: "Daily Wear",
    tagColor: "bg-teal-700/90 text-white",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg"
  },
  "embossed-sarees": {
    priceText: "From ₹950",
    subtitle: "Embossed Jacquard",
    tag: "Festive Weave",
    tagColor: "bg-purple-900/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1793090878/ungal-nesavalan/products/xlkyzqueh0gj9wchifnj.jpg"
  },
  "bridal-sarees": {
    priceText: "From ₹1,499",
    subtitle: "Muhurtham Silk",
    tag: "Bridal Edit",
    tagColor: "bg-rose-800/90 text-amber-200",
    defaultImage:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg"
  }
};

export function StitchWeaveFamilies({ catalogs, categories, fallbackImageBySlug }: StitchWeaveFamiliesProps) {
  const items = useMemo(() => {
    // If catalogs exist from admin panel, prioritize catalogs with in-stock products or custom image
    const validCatalogs = catalogs && catalogs.length > 0
      ? [...catalogs]
          .filter((c) => c.count > 0 || Boolean(c.imageUrl) || Boolean(WEAVE_PRESETS[c.slug.toLowerCase()]))
          .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
      : Object.keys(WEAVE_PRESETS).map((slug, idx) => ({
          slug,
          name: slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          imageUrl: undefined,
          count: 0,
          sort: idx
        }));

    return validCatalogs.map((cat) => {
      const slugKey = cat.slug.toLowerCase();
      const preset = WEAVE_PRESETS[slugKey];
      const fallbackImg = fallbackImageBySlug && fallbackImageBySlug[slugKey];
      const imageSrc =
        cat.imageUrl ||
        fallbackImg ||
        preset?.defaultImage ||
        "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg";

      return {
        title: cat.name,
        slug: cat.slug,
        priceText: preset?.priceText || "From ₹750",
        subtitle: preset?.subtitle || "Authentic Handloom Weave",
        tag: preset?.tag || (cat.count > 0 ? `${cat.count} Designs` : "Handloom"),
        tagColor: preset?.tagColor || "bg-purple-950/80 text-amber-300",
        image: imageSrc,
        count: cat.count
      };
    });
  }, [catalogs, fallbackImageBySlug]);

  return (
    <section
      className="scroll-mt-24 py-6 sm:py-12 bg-[#fcf9ff] border-t border-purple-100 relative"
      id="collections"
      data-purpose="browse-weave-families"
    >
      <div id="weave-families" className="absolute -top-24 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Mobile Header: Exact Stitch Mobile Screen Header */}
        <div className="flex md:hidden items-end justify-between mb-3">
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-amber-700">
              Elampillai Specials
            </span>
            <h2 className="text-lg font-serif font-bold text-[#350232]">Weave Collections</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-purple-600 font-medium flex items-center">
              Swipe <span>👉</span>
            </span>
            <Link
              href="/products"
              className="text-xs font-semibold text-purple-800 hover:text-amber-700 transition"
            >
              View All →
            </Link>
          </div>
        </div>

        {/* Mobile Swipeable Snap Rail */}
        <div className="md:hidden relative -mx-3.5 px-3.5">
          <div
            id="weaveCollectionRail"
            className="flex space-x-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 pt-0.5 scroll-smooth"
          >
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/products?weave=${item.slug}`}
                className="min-w-[170px] w-[170px] snap-start bg-white rounded-xl overflow-hidden border border-purple-100 shadow-xs flex flex-col group flex-shrink-0 active:scale-95 transition-transform"
              >
                <div className="relative overflow-hidden aspect-[4/3] bg-purple-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="170px"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    unoptimized
                  />
                  <span
                    className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs shadow-xs ${item.tagColor}`}
                  >
                    {item.tag}
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xs text-purple-950 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-stone-500 truncate">{item.subtitle}</p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400">From</span>
                      <span className="text-xs font-bold text-purple-950 ml-0.5">
                        {item.priceText.replace("From ", "")}
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-100 group-hover:bg-amber-500 text-purple-900 group-hover:text-purple-950 flex items-center justify-center transition">
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop View: Traditional Title and Grid */}
        <div className="hidden md:block">
          <div className="text-center max-w-2xl mx-auto mb-10">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/products?weave=${item.slug}`}
                className="card-hover-fx bg-white rounded-2xl p-2.5 sm:p-3 border border-purple-100 shadow-sm flex flex-col items-center text-center group cursor-pointer transition-all hover:border-purple-300 hover:shadow-md"
              >
                <div
                  className="w-full aspect-square rounded-xl overflow-hidden mb-3 border border-[#e9d5ff] relative shadow-inner p-1"
                  style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-brand-deep text-white flex items-center justify-center text-[10px] group-hover:bg-brand-gold transition-colors shadow-sm">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-brand-plum group-hover:text-brand-purple transition-colors truncate w-full">
                  {item.title}
                </h3>
                <span className="text-[11px] text-slate-400 mt-0.5 font-medium">{item.priceText}</span>
                {item.count != null && item.count > 0 && (
                  <span className="text-[10px] text-brand-purple/80 font-medium mt-0.5">
                    {item.count} sarees
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
