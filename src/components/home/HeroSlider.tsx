"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/hero-slide";
import { Container } from "@/components/layout/Container";
import { Ornament } from "./Ornament";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

const STATS = [
  { k: "40+", v: "Weaving clusters" },
  { k: "180", v: "Master weavers" },
  { k: "0", v: "Middlemen" }
];

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = slides.length;

  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count, paused]);

  return (
    <section
      className="relative overflow-hidden bg-ink text-cream"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="relative">
        {slides.map((slide, i) => (
          <Slide key={slide.id} slide={slide} active={i === index} isFirst={i === 0} />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="group absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-ink/30 p-2.5 text-cream backdrop-blur-sm transition hover:border-cream/60 hover:bg-ink/60 md:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="group absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-ink/30 p-2.5 text-cream backdrop-blur-sm transition hover:border-cream/60 hover:bg-ink/60 md:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink/40 px-3 py-2 backdrop-blur-sm">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-gold" : "w-4 bg-cream/40 hover:bg-cream/70"
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Slide({
  slide,
  active,
  isFirst
}: {
  slide: HeroSlide;
  active: boolean;
  isFirst: boolean;
}) {
  return (
    <div
      className={cn(
        "transition-opacity duration-700 ease-out",
        active ? "relative z-10 opacity-100" : "pointer-events-none absolute inset-0 z-0 opacity-0"
      )}
      aria-hidden={!active}
      role="group"
      aria-roledescription="slide"
    >
      <div className="absolute inset-0">
        <Image
          src={slide.imageUrl}
          alt={slide.imageAlt}
          fill
          sizes="100vw"
          priority={isFirst}
          className="object-cover object-center opacity-55"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
      </div>

      <Container className="relative grid min-h-[640px] items-center gap-12 py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={cn("relative", active && "animate-fadeUp")}>
          {slide.eyebrow && (
            <div className="flex items-center gap-4">
              <span className="h-px w-10 bg-gold" />
              <p className="eyebrow-cream">{slide.eyebrow}</p>
            </div>
          )}

          <h1 className="mt-6 font-display text-[52px] font-medium leading-[1.02] tracking-tight md:text-[76px]">
            {slide.headline}
            {slide.headlineItalic && (
              <span className="block italic text-gold-soft">{slide.headlineItalic}</span>
            )}
          </h1>

          {slide.subheadline && (
            <p className="mt-7 max-w-lg text-[15px] leading-[1.7] text-cream/80">
              {slide.subheadline}
            </p>
          )}

          {(slide.ctaPrimaryLabel || slide.ctaSecondaryLabel) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {slide.ctaPrimaryLabel && slide.ctaPrimaryHref && (
                <Link href={slide.ctaPrimaryHref} className="btn-primary">
                  {slide.ctaPrimaryLabel}
                </Link>
              )}
              {slide.ctaSecondaryLabel && slide.ctaSecondaryHref && (
                <Link href={slide.ctaSecondaryHref} className="btn-outline-cream">
                  {slide.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          )}

          <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-cream/15 pt-6">
            {STATS.map((s) => (
              <div key={s.v}>
                <p className="font-display text-2xl text-cream">{s.k}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest2 text-cream/60">{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {slide.featureImageUrl && (
          <div className="relative hidden lg:block">
            <div className="relative ml-auto aspect-[3/4] w-[86%] overflow-hidden rounded-card shadow-elev ring-1 ring-cream/10">
              <Image
                src={slide.featureImageUrl}
                alt={slide.featureImageAlt || slide.featureTitle}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
                priority={isFirst}
                unoptimized
              />
            </div>
            {slide.featureTitle && (
              <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-card bg-cream p-5 text-ink shadow-elev md:block">
                {slide.featureEyebrow && <p className="eyebrow">{slide.featureEyebrow}</p>}
                <p className="mt-2 font-display text-xl">{slide.featureTitle}</p>
                {slide.featureSubtitle && (
                  <p className="mt-1 text-[12px] text-ink-muted">{slide.featureSubtitle}</p>
                )}
                <Ornament className="mt-3 h-4 w-full" tone="ink" />
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
