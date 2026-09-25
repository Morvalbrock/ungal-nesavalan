import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Ornament } from "./Ornament";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/nesavalan-hero-loom/2000/1200"
          alt="Master weaver at the loom"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
      </div>

      <Container className="relative grid min-h-[640px] items-center gap-12 py-24 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative animate-fadeUp">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold" />
            <p className="eyebrow-cream">Est. from the looms of India</p>
          </div>

          <h1 className="mt-6 font-display text-[52px] font-medium leading-[1.02] tracking-tight md:text-[76px]">
            The saree,
            <span className="block italic text-gold-soft">unhurried.</span>
          </h1>

          <p className="mt-7 max-w-lg text-[15px] leading-[1.7] text-cream/80">
            Handloomed by artisans from Kanchipuram to Bishnupur — every drape carries
            the fingerprint of a weaver, the temper of a region, and a lineage
            older than the mill.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Shop the collection
            </Link>
            <Link href="/category/bridal-sarees" className="btn-outline-cream">
              The Bridal Edit
            </Link>
          </div>

          <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-cream/15 pt-6">
            {[
              { k: "40+", v: "Weaving clusters" },
              { k: "180", v: "Master weavers" },
              { k: "0", v: "Middlemen" }
            ].map((s) => (
              <div key={s.v}>
                <p className="font-display text-2xl text-cream">{s.k}</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest2 text-cream/60">
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative ml-auto aspect-[3/4] w-[86%] overflow-hidden rounded-card shadow-elev ring-1 ring-cream/10">
            <Image
              src="https://picsum.photos/seed/nesavalan-hero-drape/900/1200"
              alt="Kanjivaram drape"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden w-56 rounded-card bg-cream p-5 text-ink shadow-elev md:block">
            <p className="eyebrow">Featured weave</p>
            <p className="mt-2 font-display text-xl">Kanjivaram Rose Gold</p>
            <p className="mt-1 text-[12px] text-ink-muted">Kanchipuram · Pure zari</p>
            <Ornament className="mt-3 h-4 w-full" tone="ink" />
          </div>
        </div>
      </Container>
    </section>
  );
}
