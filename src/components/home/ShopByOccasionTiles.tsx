import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";

interface Tile {
  slug: string;
  eyebrow: string;
  title: string;
  blurb: string;
  image: string;
  tag: string;
}

const TILES: Tile[] = [
  {
    slug: "bridal-sarees",
    eyebrow: "For the Muhurtham & Mandap",
    title: "Bridal Sarees",
    blurb: "Kanjivaram heirlooms with pure gold zari borders and rich brocade pallus.",
    image: "/images/authentic_indian_handloom_silk_saree.png",
    tag: "Pure Heirloom"
  },
  {
    slug: "silk-sarees",
    eyebrow: "For Celebrations & Receptions",
    title: "Festive Silks",
    blurb: "Lustrous mulberry silks dyed in royal lavender, plum, and vibrant jewel tones.",
    image: "/images/img.png",
    tag: "Lavender Edit"
  },
  {
    slug: "cotton-sarees",
    eyebrow: "For Everyday Poise",
    title: "Daily Grace Cottons",
    blurb: "Featherweight Elampillai cotton-silks woven for breathable, all-day comfort.",
    image: "/images/elegant_south_indian.png",
    tag: "Featherlight"
  }
];

export function ShopByOccasionTiles() {
  return (
    <section className="w-full bg-cream py-12 sm:py-16 md:py-20">
      <Container>
        <div className="mb-8 flex flex-col items-center text-center sm:mb-10 md:mb-12">
          <span className="eyebrow text-maroon font-semibold">Curated Edits</span>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl md:text-[42px]">
            Shop by Occasion
          </h2>
          <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-transparent via-maroon to-transparent" />
          <p className="mt-3 max-w-lg text-sm text-ink-soft">
            Hand-curated collections from our pit-looms, crafted for life&rsquo;s most memorable moments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3">
          {TILES.map((t) => (
            <Link
              key={t.slug}
              href={`/category/${t.slug}`}
              className="group relative block overflow-hidden rounded-stack border border-border/80 bg-cream-warm shadow-card transition-all duration-500 hover:border-maroon/40 hover:shadow-elev"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[3/4]">
                <Image
                  src={t.image}
                  alt={t.title + " sarees"}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

                <div className="absolute right-4 top-4">
                  <span className="rounded-full bg-cream/90 px-2.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-maroon shadow-sm backdrop-blur-sm">
                    {t.tag}
                  </span>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 text-cream sm:p-6">
                <div className="h-0.5 w-10 bg-gold" aria-hidden="true" />
                <span className="text-[10px] font-medium uppercase tracking-widest2 text-cream/80">
                  {t.eyebrow}
                </span>
                <h3 className="font-display text-[24px] leading-tight text-cream sm:text-[26px]">
                  {t.title}
                </h3>
                <p className="max-w-[24ch] text-[12px] leading-relaxed text-cream/80">
                  {t.blurb}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest2 text-gold-soft transition-colors group-hover:text-cream">
                  Explore Edit &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
