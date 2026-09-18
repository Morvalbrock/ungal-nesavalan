"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const activeImg = images[active];
  const count = images.length;

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ x, y });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [count]);

  if (!activeImg) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center rounded-card bg-cream-warm text-sm text-ink-muted">
        No images
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start">
      <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            className={cn(
              "relative aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-card border transition md:w-full",
              i === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img.url} alt={img.alt} fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        ref={frameRef}
        onMouseEnter={onMove}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(null)}
        className="relative aspect-[3/4] flex-1 overflow-hidden rounded-card bg-cream-warm"
      >
        <Image
          src={activeImg.url}
          alt={activeImg.alt}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover transition-opacity duration-300"
        />
        {zoom && (
          <div
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              backgroundImage: `url(${activeImg.url})`,
              backgroundSize: "220%",
              backgroundPosition: `${zoom.x}% ${zoom.y}%`,
              opacity: 1
            }}
          />
        )}

        <button
          type="button"
          onClick={() => setActive((i) => (i - 1 + count) % count)}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-1 text-sm text-ink shadow hover:bg-cream md:hidden"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setActive((i) => (i + 1) % count)}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-cream/90 px-3 py-1 text-sm text-ink shadow hover:bg-cream md:hidden"
        >
          ›
        </button>

        <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] text-cream">
          {active + 1} / {count}
        </span>
      </div>
    </div>
  );
}
