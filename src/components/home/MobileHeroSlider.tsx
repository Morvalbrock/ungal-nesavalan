"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface SlideData {
  id: string;
  image: string;
  alt: string;
  tag: string;
  href: string;
}

const SLIDES: SlideData[] = [
  {
    id: "slide-1",
    image: "/images/img.png",
    alt: "Authentic Elampillai Handloom Silk Cotton Sarees",
    tag: "Pure Silk & Cotton",
    href: "/products?weave=kalyani-silk-cotton"
  },
  {
    id: "slide-2",
    image: "/images/authentic_indian_handloom_silk_saree.png",
    alt: "Bridal Zari Sarees - Elampillai Pit-looms",
    tag: "Bridal Zari Edition",
    href: "/products?category=bridal-sarees"
  },
  {
    id: "slide-3",
    image: "/images/login.png",
    alt: "Maheshwari & Traditional Pure Cotton Sarees",
    tag: "Maheshwari & Kasavu",
    href: "/products?weave=maheshwari-cotton"
  },
  {
    id: "slide-4",
    image: "/images/elegant_south_indian.png",
    alt: "Royal Aarani Soft Silk Sarees with Pure Zari",
    tag: "Aarani Soft Silk",
    href: "/products?weave=aarani-soft-silk"
  }
];

export function MobileHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const hasMovedRef = useRef<boolean>(false);

  const totalSlides = SLIDES.length;

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0) {
        setCurrentIndex(totalSlides - 1);
      } else if (index >= totalSlides) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(index);
      }
    },
    [totalSlides]
  );

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 4000);
  }, [totalSlides]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    stopAutoPlay();
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentXRef.current = e.touches[0].clientX;
    const deltaX = currentXRef.current - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasMovedRef.current = true;
    }
    setDragOffset(deltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 40;

    if (deltaX < -threshold) {
      goToSlide(currentIndex + 1);
    } else if (deltaX > threshold) {
      goToSlide(currentIndex - 1);
    }
    setDragOffset(0);
    startAutoPlay();
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    stopAutoPlay();
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
    const deltaX = currentXRef.current - startXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasMovedRef.current = true;
    }
    setDragOffset(deltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 40;

    if (deltaX < -threshold) {
      goToSlide(currentIndex + 1);
    } else if (deltaX > threshold) {
      goToSlide(currentIndex - 1);
    }
    setDragOffset(0);
    startAutoPlay();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    } else {
      startAutoPlay();
    }
  };

  return (
    <section className="px-3.5 pt-3 pb-1" data-purpose="hero-image-slider">
      {/* Pure Image Slider Viewport (Swipe & Drag Enabled) */}
      <div
        id="heroSliderViewport"
        className="relative overflow-hidden rounded-2xl shadow-md border border-purple-100/80 bg-purple-950 aspect-[16/9] select-none cursor-grab active:cursor-grabbing touch-pan-x"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={stopAutoPlay}
      >
        {/* Horizontal Sliding Track */}
        <div
          id="heroSliderTrack"
          className="flex h-full will-change-transform"
          style={{
            transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)",
            transform: isDragging
              ? `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`
              : `translateX(-${currentIndex * 100}%)`
          }}
        >
          {SLIDES.map((slide, idx) => (
            <Link
              key={slide.id}
              href={slide.href}
              onClick={(e) => {
                if (hasMovedRef.current) {
                  e.preventDefault();
                }
              }}
              className="relative w-full h-full flex-shrink-0 block"
              draggable={false}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, 600px"
                className="w-full h-full object-cover pointer-events-none"
                unoptimized
              />

              {/* Bottom gradient overlay for dot contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Subtle Tag Chip */}
              {slide.tag && (
                <span className="absolute top-2.5 left-2.5 bg-purple-950/80 backdrop-blur-sm text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30 shadow-xs pointer-events-none">
                  {slide.tag}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Minimal Floating Indicator Dots */}
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center space-x-1.5 z-10 pointer-events-none">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(idx);
                startAutoPlay();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-amber-400 shadow-xs"
                  : "w-1.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
