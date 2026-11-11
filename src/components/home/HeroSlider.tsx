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
      className="relative px-3 pt-2.5 sm:px-0 sm:pt-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="relative overflow-hidden rounded-2xl bg-ink text-cream shadow-md sm:rounded-none sm:shadow-none">
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
              className="group absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-ink/30 p-2 text-cream backdrop-blur-sm transition hover:border-cream/60 hover:bg-ink/60 md:inline-flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next slide"
              className="group absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-cream/25 bg-ink/30 p-2 text-cream backdrop-blur-sm transition hover:border-cream/60 hover:bg-ink/60 md:inline-flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="pointer-events-none absolute bottom-2.5 left-1/2 z-20 -translate-x-1/2 sm:bottom-4">
              <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-ink/40 px-2.5 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-3 sm:py-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    aria-current={i === index}
                    className={cn(
                      "h-1 rounded-full transition-all sm:h-1.5",
                      i === index ? "w-6 bg-gold sm:w-8" : "w-3 bg-cream/40 hover:bg-cream/70 sm:w-4"
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
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

      <Container className="relative grid min-h-[220px] items-center gap-4 py-8 sm:min-h-[380px] sm:gap-6 sm:py-10 md:min-h-[420px] md:gap-8 md:py-12 lg:min-h-[460px] lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-14">
        <div className={cn("relative", active && "animate-fadeUp")}>
          {slide.eyebrow && (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="h-px w-6 bg-gold sm:w-8" />
              <p className="eyebrow-cream text-[9.5px] sm:text-[10.5px]">{slide.eyebrow}</p>
            </div>
          )}

          <h1 className="mt-2 font-display text-[22px] font-medium leading-[1.12] tracking-tight sm:mt-4 sm:text-[38px] sm:leading-[1.05] md:text-[46px] lg:text-[52px]">
            {slide.headline}
            {slide.headlineItalic && (
              <span className="ml-1.5 inline italic text-gold-soft sm:ml-0 sm:block">{slide.headlineItalic}</span>
            )}
          </h1>

          {slide.subheadline && (
            <p className="mt-2 line-clamp-2 max-w-lg text-[12px] leading-[1.55] text-cream/80 sm:mt-3 sm:line-clamp-3 sm:text-[14px] sm:leading-[1.6] lg:text-[15px]">
              {slide.subheadline}
            </p>
          )}

          {(slide.ctaPrimaryLabel || slide.ctaSecondaryLabel) && (
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
              {slide.ctaPrimaryLabel && slide.ctaPrimaryHref && (
                <Link
                  href={slide.ctaPrimaryHref}
                  className="btn-primary !px-3.5 !py-1.5 !text-[11px] sm:!px-5 sm:!py-2.5 sm:!text-[12.5px]"
                >
                  {slide.ctaPrimaryLabel}
                </Link>
              )}
              {slide.ctaSecondaryLabel && slide.ctaSecondaryHref && (
                <Link
                  href={slide.ctaSecondaryLabel}
                  className="btn-outline-cream !px-3.5 !py-1.5 !text-[11px] sm:!px-4 sm:!py-2 sm:!text-[12.5px]"
                >
                  {slide.ctaSecondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>

        {slide.featureImageUrl && (
          <div className="relative hidden lg:block">
            <div className="relative ml-auto aspect-[3/4] w-[75%] max-w-[320px] overflow-hidden rounded-card shadow-elev ring-1 ring-cream/10">
              <Image
                src={slide.featureImageUrl}
                alt={slide.featureImageAlt || slide.featureTitle}
                fill
                sizes="(min-width: 1024px) 30vw, 100vw"
                className="object-cover"
                priority={isFirst}
                unoptimized
              />
            </div>
            {slide.featureTitle && (
              <div className="absolute -bottom-4 -left-4 hidden w-48 rounded-card bg-cream p-3.5 text-ink shadow-elev md:block">
                {slide.featureEyebrow && <p className="eyebrow">{slide.featureEyebrow}</p>}
                <p className="mt-1 font-display text-base leading-tight">{slide.featureTitle}</p>
                {slide.featureSubtitle && (
                  <p className="mt-0.5 text-[11px] text-ink-muted">{slide.featureSubtitle}</p>
                )}
                <Ornament className="mt-2 h-3 w-full" tone="ink" />
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}