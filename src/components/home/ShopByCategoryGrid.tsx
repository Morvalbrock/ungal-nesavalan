import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Catalog } from "@/types/catalog";
import { Container } from "@/components/layout/Container";

interface ShopByCategoryGridProps {
  catalogs: (Pick<Catalog, "slug" | "name" | "imageUrl"> & { count: number })[];
  fallbackImageBySlug: Record<string, string>;
}

// 8 warm editorial gradients used when a tile has no imageUrl yet. Picked by
// hashing the slug so every tile keeps its color across renders.
const TILE_GRADIENTS = [
  "bg-[linear-gradient(135deg,#9a3338_0%,#5a151f_100%)]",
  "bg-[linear-gradient(135deg,#c67a37_0%,#753d1f_100%)]",
  "bg-[linear-gradient(135deg,#424d33_0%,#232b1c_100%)]",
  "bg-[linear-gradient(135deg,#d6ae5c_0%,#8f6b2e_100%)]",
  "bg-[linear-gradient(135deg,#33476b_0%,#152343_100%)]",
  "bg-[linear-gradient(135deg,#b7544d_0%,#75262c_100%)]",
  "bg-[linear-gradient(135deg,#66423a_0%,#38211d_100%)]",
  "bg-[linear-gradient(135deg,#dcbf8f_0%,#997a47_100%)]"
];

function tileGradient(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return TILE_GRADIENTS[hash % TILE_GRADIENTS.length];
}

export function ShopByCategoryGrid({ catalogs, fallbackImageBySlug }: ShopByCategoryGridProps) {
  if (catalogs.length === 0) return null;

  return (
    <section className="w-full bg-cream py-16 md:py-24">
      <Container>
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="max-w-xl">
            <span className="eyebrow">Signature Catalogues</span>
            <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-[42px]">
              Browse Our Weave Families
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-[15px]">
              Each catalogue is a living family of sarees — kept current by the master
              weavers who still sit at the loom.
            </p>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 self-start text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-deep transition-colors hover:text-ink md:self-end"
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
                className="group relative block aspect-square overflow-hidden rounded-card border border-border bg-cream-warm/60 shadow-card transition-all duration-300 hover:shadow-elev"
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/45 to-transparent p-3 pt-12 sm:p-4 sm:pt-14">
                  <div className="font-display text-sm font-medium leading-tight text-cream sm:text-base md:text-lg">
                    {c.name}
                  </div>
                  <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-cream/70">
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
