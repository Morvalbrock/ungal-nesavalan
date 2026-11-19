"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Play, Award, ChevronRight, ChevronLeft } from "lucide-react";
import type { HeroSlide } from "@/types/hero-slide";
import type { Product } from "@/types/product";
import { useSareeModalStore } from "./saree-modal-store";
import { MobileHeroSlider } from "./MobileHeroSlider";
import { formatINR } from "@/lib/utils";

interface StitchHeroProps {
  slides?: HeroSlide[];
  // Keyed by slide.id — the resolved Product for each slide's featureProductSlug.
  // Slides without a linked product (or with an invalid slug) are omitted.
  featureProducts?: Record<string, Product>;
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hs_default_1",
    imageUrl: "/images/authentic_indian_handloom_silk_saree.png",
    imageAlt: "Authentic Elampillai Handloom Silk Cotton Saree",
    eyebrow: "Direct From Our Elampillai Looms",
    headline: "Authentic Weaves,",
    headlineItalic: "Timeless Elegance.",
    subheadline:
      "Direct from the master weavers of Elampillai. Pure silk cotton sarees, lightweight festive wear, and intricately designed borders woven for every auspicious celebration.",
    ctaPrimaryLabel: "Shop Sarees",
    ctaPrimaryHref: "/products?weave=kalyani-silk-cotton",
    ctaSecondaryLabel: "Contact Us",
    ctaSecondaryHref: "/contact",
    featureImageUrl:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg",
    featureImageAlt: "Royal Violet Aarani Soft Silk Saree with Pure Zari Border",
    featureEyebrow: "Aarani Soft Silk",
    featureTitle: "Tradition Since 1994",
    featureSubtitle: "Pit-loomed in Salem - Elampillai cluster",
    sort: 0,
    active: true
  },
  {
    id: "hs_default_2",
    imageUrl:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg",
    imageAlt: "Grand Bridal Zari Edit Handloom Saree",
    eyebrow: "The Wedding Edit · Pure Zari",
    headline: "For The Day",
    headlineItalic: "She Remembers.",
    subheadline:
      "Heirloom-grade bridal drapes woven with genuine metallic zari on traditional pit-looms. Designed for weddings, muhurthams, and lifetime celebrations.",
    ctaPrimaryLabel: "Explore Bridal",
    ctaPrimaryHref: "/category/bridal-sarees",
    ctaSecondaryLabel: "Wedding Trousseau",
    ctaSecondaryHref: "/contact",
    featureImageUrl:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792655649/ungal-nesavalan/products/ymfuoncj81pfa6l3ywna.jpg",
    featureImageAlt: "Crimson Bridal Zari Silk Saree",
    featureEyebrow: "Bridal Zari Edition",
    featureTitle: "Heritage Bridal Weave",
    featureSubtitle: "Pure zari pallu with peacock motifs",
    sort: 1,
    active: true
  },
  {
    id: "hs_default_3",
    imageUrl:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg",
    imageAlt: "Maheshwari Handloom Pure Cotton Saree",
    eyebrow: "Daily Handloom · Summer Drapes",
    headline: "Light as Air,",
    headlineItalic: "Pure in Craft.",
    subheadline:
      "Breathable pure cotton and subtle zari borders handcrafted for daytime wear, office comfort, and casual festivities. Never stiff, perfectly soft.",
    ctaPrimaryLabel: "Discover Cottons",
    ctaPrimaryHref: "/products?weave=maheshwari-cotton",
    ctaSecondaryLabel: "Care Guide",
    ctaSecondaryHref: "/care-guide",
    featureImageUrl:
      "https://res.cloudinary.com/khxbcqk3/image/upload/v1792837551/ungal-nesavalan/products/omxjjqed2mkqhxfd0r2o.jpg",
    featureImageAlt: "Maheshwari Handloom Saree in Amber Mustard",
    featureEyebrow: "Maheshwari Handloom",
    featureTitle: "Pure Comfort Handloom",
    featureSubtitle: "Soft breathable drape with micro zari border",
    sort: 2,
    active: true
  }
];

export function StitchHero({ slides = [], featureProducts = {} }: StitchHeroProps) {
  const openModal = useSareeModalStore((s) => s.open);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const activeSlides = (slides || []).filter((s) => s.active);
  const effectiveSlides = activeSlides.length > 0 ? activeSlides : DEFAULT_HERO_SLIDES;
  const totalSlides = effectiveSlides.length;

  const currentSlide = totalSlides > 0 ? effectiveSlides[activeIdx % totalSlides] : null;

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIdx(((index % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  const nextSlide = useCallback(() => {
    goToSlide(activeIdx + 1);
  }, [goToSlide, activeIdx]);

  const prevSlide = useCallback(() => {
    goToSlide(activeIdx - 1);
  }, [goToSlide, activeIdx]);

  // Autoplay desktop slides if multiple, with pause-on-hover & auto-restart on manual change
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [totalSlides, isPaused, activeIdx]);

  // Keyboard navigation for accessible manual slider changes (Left / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide]);

  const handleHeroCardClick = () => {
    const linkedProduct = currentSlide ? featureProducts[currentSlide.id] : undefined;

    // No linked product → treat the card as a plain CTA. Go to the admin-configured
    // href, or fall back to the products index. This replaces the legacy modal
    // path that invented a fake "Royal Violet Aarani" product for every click.
    if (!linkedProduct) {
      const href =
        currentSlide?.ctaPrimaryHref && currentSlide.ctaPrimaryHref.trim().length > 0
          ? currentSlide.ctaPrimaryHref
          : "/products";
      window.location.href = href;
      return;
    }

    // Linked product resolved → open quick-view with real admin-managed data.
    const headlinePaise = linkedProduct.salePrice ?? linkedProduct.basePrice;
    const onSale =
      linkedProduct.salePrice != null && linkedProduct.salePrice < linkedProduct.basePrice;
    const salePct =
      onSale && linkedProduct.salePrice
        ? Math.round(
            ((linkedProduct.basePrice - linkedProduct.salePrice) / linkedProduct.basePrice) * 100
          )
        : 0;
    const weaveLabel = linkedProduct.weave?.replace(/-/g, " ") || "Handloom Weave";
    const fabricLabel = linkedProduct.fabric?.replace(/-/g, " ");
    const lengthSuffix = linkedProduct.blousePieceIncluded
      ? " with Blouse Piece"
      : " (blouse piece not included)";
    const imageUrl =
      linkedProduct.images[0]?.url ||
      currentSlide?.featureImageUrl ||
      currentSlide?.imageUrl ||
      "";

    openModal({
      productId: linkedProduct.id,
      slug: linkedProduct.slug,
      title: linkedProduct.name,
      price: formatINR(headlinePaise),
      // Only expose comparison price + discount badge for a real sale.
      originalPrice: onSale ? formatINR(linkedProduct.basePrice) : undefined,
      discount: onSale ? `${salePct}% OFF` : undefined,
      imageUrl,
      badge: currentSlide?.featureEyebrow || weaveLabel,
      // Omit rating fields — ProductCard aggregates aren't available here and a
      // fabricated 4.9/96 would just re-introduce the problem we're solving.
      weave: weaveLabel,
      fabric: fabricLabel,
      length: `${linkedProduct.lengthMeters} Meters${lengthSuffix}`,
      blousePieceIncluded: linkedProduct.blousePieceIncluded,
      // borderWork and weaver intentionally omitted — those fields don't exist on
      // the Product record; the modal hides those rows rather than lying.
      thumbnails: linkedProduct.images
        .map((img) => img.url)
        .filter((u) => Boolean(u) && !u.includes("img.png") && !u.includes("screen.png"))
    });
  };

  const eyebrow = currentSlide?.eyebrow || "Direct From Our Elampillai Looms";
  const headline = currentSlide?.headline || "Authentic Weaves,";
  const headlineItalic = currentSlide?.headlineItalic || "Timeless Elegance.";
  const subheadline =
    currentSlide?.subheadline ||
    "Direct from the master weavers of Elampillai. Pure silk cot silk sarees, lightweight festive wear, and intricately designed borders woven for every auspicious celebration.";
  const primaryLabel = currentSlide?.ctaPrimaryLabel || "Shop Sarees";
  const primaryHref = currentSlide?.ctaPrimaryHref || "#weave-families";
  const secondaryLabel = currentSlide?.ctaSecondaryLabel || "Our Weaver Story";
  const secondaryHref = currentSlide?.ctaSecondaryHref || "#heritage-section";
  const visualImage =
    currentSlide?.featureImageUrl ||
    currentSlide?.imageUrl ||
    "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg";
  const visualAlt =
    currentSlide?.featureImageAlt ||
    currentSlide?.imageAlt ||
    "Ungal Nesavalan Authentic Handloom Silk Saree";
  const badgeTitle = currentSlide?.featureTitle || "Tradition Since 1994";
  const badgeSubtitle = currentSlide?.featureSubtitle || "Pit-loomed in Salem - Elampillai cluster";

  return (
    <>
      {/* Mobile-Only Movable Touch, Drag & Arrow Slider (Stitch Screen Design) */}
      <div className="block lg:hidden">
        <MobileHeroSlider slides={effectiveSlides} />
      </div>

      {/* Desktop Hero Layout */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative bg-lavender-mist overflow-hidden border-b border-purple-100 py-6 md:py-10 hidden lg:block"
        aria-roledescription="carousel"
        aria-label="Hero featured collections"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Copy & CTA */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left z-10">
              <div key={activeIdx} className="space-y-5 animate-fadeUp">
                {/* Heritage badge */}
                <div className="inline-flex items-center gap-2 bg-purple-100/90 border border-purple-200/80 px-4 py-1.5 rounded-full text-brand-purple text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>{eyebrow}</span>
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heritage font-bold text-brand-plum tracking-tight leading-[1.12]">
                    {headline} <br />
                    <span className="italic text-brand-purple">{headlineItalic}</span>
                  </h1>
                  <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed pt-1">
                    {subheadline}
                  </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    href={primaryHref}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-deep to-brand-purple text-white font-semibold text-sm shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{primaryLabel}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={secondaryHref}
                    className="px-7 py-3.5 rounded-full bg-white border border-purple-200 text-brand-plum font-semibold text-sm hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>{secondaryLabel}</span>
                    <Play className="h-3 w-3 fill-brand-purple text-brand-purple" />
                  </Link>
                </div>
              </div>

              {/* Mini trust counters & Manual Slider Switcher Deck */}
              <div className="pt-4 flex items-center justify-between border-t border-purple-200/60 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-5 text-xs text-slate-500">
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
                    <p>No Middlemen</p>
                  </div>
                </div>

                {/* Desktop Manual Slide Switcher Bar */}
                {totalSlides > 1 && (
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-purple-200/80 shadow-xs">
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={prevSlide}
                      className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 text-brand-plum flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1.5 px-0.5">
                      {effectiveSlides.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to slide ${i + 1}`}
                          onClick={() => goToSlide(i)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            i === (activeIdx % totalSlides)
                              ? "w-6 bg-brand-purple"
                              : "w-2 bg-purple-200 hover:bg-purple-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={nextSlide}
                      className="w-7 h-7 rounded-full bg-purple-50 hover:bg-purple-100 text-brand-plum flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <span className="text-[11px] font-bold text-brand-plum tabular-nums pl-1 border-l border-purple-200/80">
                      {String((activeIdx % totalSlides) + 1).padStart(2, "0")}/{String(totalSlides).padStart(2, "0")}
                    </span>
                  </div>
                )}
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
                <div key={activeIdx} className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden animate-fadeUp">
                  <Image
                    src={visualImage}
                    alt={visualAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transform hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>

                {/* Manual Previous & Next Chevron Controls directly on Hero Image Showcase Card */}
                {totalSlides > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous slide"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                      }}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-brand-plum hover:text-brand-purple shadow-xl backdrop-blur-md border border-purple-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next slide"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                      }}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-brand-plum hover:text-brand-purple shadow-xl backdrop-blur-md border border-purple-100 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Floating tag for authentic craft */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-purple-100 shadow-lg flex items-center justify-between z-10 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-brand-plum uppercase tracking-wide">
                        {badgeTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500">{badgeSubtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-purple flex items-center gap-1 group-hover:translate-x-1 transition-transform pointer-events-auto">
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
