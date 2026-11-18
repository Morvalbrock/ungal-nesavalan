import Link from "next/link";
import Image from "next/image";
import { Sparkles, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function LavenderSpotlight() {
  return (
    <section className="relative w-full overflow-hidden border-y border-border/80 bg-gradient-to-b from-cream via-cream-warm/80 to-cream py-12 sm:py-16 md:py-20">
      {/* Decorative ambient radial lavender glow */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-maroon/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-gold/5 blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* Content side */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-maroon/20 bg-maroon/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-maroon">
              <Sparkles className="h-3.5 w-3.5" />
              The Lavender Storefront Edit
            </div>

            <h2 className="mt-4 font-display text-3xl font-medium leading-[1.12] text-ink sm:text-4xl md:text-[44px]">
              Royal Amethyst &amp; <span className="italic text-maroon">Whispering Lilac.</span>
            </h2>

            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-ink-soft sm:text-[15.5px]">
              Rooted in our Elampillai weaving heritage, each drape in the Lavender collection marries
              subtle pastel lilacs and deep royal plum silk with shimmering zari — crafted patiently on
              traditional pit-looms for modern celebrations.
            </p>

            <div className="mt-6 space-y-3.5 sm:mt-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                <p className="text-[13.5px] text-ink">
                  <strong className="font-semibold text-ink">Pure Mulberry Soft Silk:</strong> Featherweight drape,
                  naturally breathable with an enduring artisanal sheen.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                <p className="text-[13.5px] text-ink">
                  <strong className="font-semibold text-ink">Shot-Silk Lavender Tones:</strong> Warps and wefts dyed in
                  contrasting jewel shades for subtle, shifting iridescence under festive lights.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-maroon" />
                <p className="text-[13.5px] text-ink">
                  <strong className="font-semibold text-ink">Heritage Temple Korvai Zari:</strong> Authentic Elampillai
                  borders interlocked by hand with pure zari threads.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10 sm:gap-4">
              <Link
                href="/products?weave=silk-sarees"
                className="btn-primary !px-6 !py-3 !text-[12.5px]"
              >
                Explore Lavender Silks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/918825810897?text=Hi%20Ungal%20Nesavalan,%20I'm%20interested%20in%20your%20Lavender%20Storefront%20collection."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2 !border-maroon/30 !px-5 !py-3 !text-[12.5px] !text-maroon hover:!bg-maroon hover:!text-cream"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Consultation
              </a>
            </div>
          </div>

          {/* Feature Showcase Card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/80 bg-cream-warm shadow-elev sm:aspect-[3/4]">
              <Image
                src="/images/img.png"
                alt="Ungal Nesavalan Royal Lavender and Plum Handloom Silk Saree"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />

              {/* Top pill badge */}
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-cream/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-maroon shadow-sm backdrop-blur-sm">
                  Loom Fresh
                </span>
              </div>

              {/* Bottom detail card */}
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-white/20 bg-ink/75 p-4 text-cream backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest2 text-gold-soft">
                    Signature Weave
                  </span>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold-soft">
                    Handloom Mark
                  </span>
                </div>
                <h3 className="mt-1 font-display text-lg font-medium text-cream">
                  Royal Plum &amp; Lavender Zari
                </h3>
                <p className="mt-0.5 text-xs text-cream/80">
                  Woven on Pit-Loom #4 · Elampillai Cluster
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5">
                  <span className="text-xs text-cream/70">Direct Loom Price</span>
                  <Link
                    href="/products"
                    className="text-xs font-semibold uppercase tracking-wider text-gold transition hover:text-cream"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
