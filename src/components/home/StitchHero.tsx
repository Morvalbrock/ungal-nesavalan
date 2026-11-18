"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Award, ChevronRight } from "lucide-react";
import { useSareeModalStore } from "./saree-modal-store";
import { MobileHeroSlider } from "./MobileHeroSlider";

export function StitchHero() {
  const openModal = useSareeModalStore((s) => s.open);

  const handleHeroCardClick = () => {
    openModal({
      productId: "hero_royal_violet",
      slug: "royal-violet-aarani-soft-silk-saree",
      title: "Royal Violet Aarani Soft Silk Saree with Pure Zari Border",
      price: "₹750",
      originalPrice: "₹1,299",
      discount: "35% OFF",
      imageUrl:
        "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg",
      badge: "Aarani Soft Silk",
      rating: 4.9,
      reviewCount: 96,
      weave: "Authentic Elampillai Pit-loom",
      fabric: "Pure Mulberry Soft Silk blend",
      length: "6.2 Meters with Blouse Piece",
      borderWork: "Traditional Floral Peacock Zari Tissue",
      weaver: "Master Weaver Selvam & Family",
      thumbnails: [
        "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg"
      ]
    });
  };

  return (
    <>
      {/* Mobile-Only Movable Touch & Drag Slider (Stitch Screen Design) */}
      <div className="block lg:hidden">
        <MobileHeroSlider />
      </div>

      {/* Desktop Hero Layout */}
      <section className="relative bg-lavender-mist overflow-hidden border-b border-purple-100 py-6 md:py-10 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Copy & CTA */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left z-10">
              {/* Heritage badge */}
              <div className="inline-flex items-center gap-2 bg-purple-100/90 border border-purple-200/80 px-4 py-1.5 rounded-full text-brand-purple text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Direct From Our Elampillai Looms</span>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heritage font-bold text-brand-plum tracking-tight leading-[1.12]">
                  Authentic Weaves, <br />
                  <span className="italic text-brand-purple">Timeless Elegance.</span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed pt-1">
                  Direct from the master weavers of Elampillai. Pure silk cot silk sarees, lightweight
                  festive wear, and intricately designed borders woven for every auspicious celebration.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#weave-families"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-deep to-brand-purple text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Sarees</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#heritage-section"
                  className="px-7 py-3.5 rounded-full bg-white border border-purple-200 text-brand-plum font-semibold text-sm hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Our Weaver Story</span>
                  <Play className="h-3 w-3 fill-brand-purple text-brand-purple" />
                </a>
              </div>

              {/* Mini trust counters */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 border-t border-purple-200/60 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-brand-plum font-bold text-base">50,000+</p>
                  <p>Happy Customers</p>
                </div>
                <div className="w-px h-8 bg-purple-200" />
                <div>
                  <p className="text-brand-plum font-bold text-base">100% Genuine</p>
                  <p>Handloom Weaves</p>
                </div>
                <div className="w-px h-8 bg-purple-200" />
                <div>
                  <p className="text-brand-plum font-bold text-base">Direct Rates</p>
                  <p>No Middlemen Markup</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-6 relative">
              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl pointer-events-none" />

              <div
                onClick={handleHeroCardClick}
                className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white group cursor-pointer"
              >
                <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src="/images/img.png"
                    alt="Ungal Nesavalan Royal Silk Sarees Banner"
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transform hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Floating tag for authentic craft */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-purple-100 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-brand-plum uppercase tracking-wide">
                        Tradition Since 1994
                      </h4>
                      <p className="text-[11px] text-slate-500">Pit-loomed in Salem - Elampillai cluster</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-purple flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
