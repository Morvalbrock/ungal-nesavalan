import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Catalog } from "@/types/catalog";
import { Container } from "@/components/layout/Container";

interface ShopByCategoryGridProps {
  catalogs: (Pick<Catalog, "slug" | "name" | "imageUrl"> & { count: number })[];
  fallbackImageBySlug: Record<string, string>;
}

// 8 exquisite royal lavender, amethyst, plum & violet gradients for catalogue tiles.
const TILE_GRADIENTS = [
  "bg-[linear-gradient(135deg,#5B2A86_0%,#2A0E47_100%)]", // Royal Plum
  "bg-[linear-gradient(135deg,#7C3AED_0%,#3B0764_100%)]", // Lavender Amethyst
  "bg-[linear-gradient(135deg,#6D28D9_0%,#2E1065_100%)]", // Deep Violet
  "bg-[linear-gradient(135deg,#8B5CF6_0%,#4C1D95_100%)]", // Lilac Blossom
  "bg-[linear-gradient(135deg,#4A154B_0%,#1B0520_100%)]", // Mulberry Wine
  "bg-[linear-gradient(135deg,#9333EA_0%,#581C87_100%)]", // Purple Orchid
  "bg-[linear-gradient(135deg,#6366F1_0%,#312E81_100%)]", // Indigo Lavender
  "bg-[linear-gradient(135deg,#A855F7_0%,#6B21A8_100%)]"  // Lavender Bloom
];

function tileGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return TILE_GRADIENTS[hash % TILE_GRADIENTS.length];
}

export function ShopByCategoryGrid({ catalogs, fallbackImageBySlug }: ShopByCategoryGridProps) {
  if (catalogs.length === 0) return null;

  return (
    <section className="w-full bg-cream pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20">
      <Container>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-xl">
            <span className="eyebrow text-maroon font-semibold">Signature Catalogues</span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-[42px]">
              Browse Our Weave Families
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-[15px]">
              Each catalogue is a living family of sarees — kept current by the master
              weavers who sit at our Elampillai pit looms.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 self-start text-[11px] font-semibold uppercase tracking-[0.25em] text-maroon transition-colors hover:text-gold-deep md:self-end"
          >
            See Every Catalogue
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {catalogs.map((c) => {
            const src = c.imageUrl || fallbackImageBySlug[c.slug.toLowerCase()];
            return (
              <Link
                key={c.slug}
                href={`/products?weave=${encodeURIComponent(c.slug)}`}
                className="group relative block aspect-square overflow-hidden rounded-card border border-border/80 bg-cream-warm shadow-card transition-all duration-500 hover:border-maroon/40 hover:shadow-elev"
              >
                {src ? (
                  <Image
                    src={src}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className={`absolute inset-0 ${tileGradient(c.slug)}`} />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-3.5 pt-14 sm:p-4 sm:pt-16">
                  <div className="font-display text-sm font-medium leading-tight text-cream sm:text-base md:text-lg">
                    {c.name}
                  </div>
                  <div className="mt-1.5 inline-flex items-center rounded-full bg-cream/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-cream/90 backdrop-blur-sm">
                    {c.count} {c.count === 1 ? "piece" : "pieces"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
