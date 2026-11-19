import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Ornament } from "./Ornament";

export function BrandStoryBlock() {
  return (
    <section className="w-full border-y border-border/80 bg-cream-warm/40 py-14 sm:py-18 md:py-24">
      <Container>
        <div className="mx-auto flex max-w-[800px] flex-col items-center text-center">
          <Ornament className="h-4 w-44" tone="maroon" />

          <span className="eyebrow mt-6 text-maroon font-semibold" style={{ letterSpacing: "0.3em" }}>
            The Weaver&rsquo;s Mark &middot; Elampillai Atelier
          </span>

          <h2 className="mt-4 font-display text-[30px] leading-[1.18] text-ink sm:text-[38px] md:text-[46px]">
            Pit-loomed in Elampillai.{" "}
            <em className="italic text-maroon">Signed by the hands that made it.</em>
          </h2>

          <p className="mt-5 max-w-[620px] text-[15px] leading-[1.75] text-ink-soft md:text-[16px]">
            Every saree leaves our atelier with the weaver&rsquo;s name tied to it. No
            agents, no multi-tier showrooms, no middle margin — just the loom, the thread, and the
            master artisan who sat with it for a fortnight.
          </p>

          {/* 4 Pillars of Trust */}
          <div className="mt-10 grid w-full grid-cols-2 gap-4 border-y border-border/70 py-8 sm:grid-cols-4 sm:gap-6 sm:py-10">
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-maroon sm:text-3xl">40+</span>
              <span className="mt-1 text-[11.5px] uppercase tracking-wider text-ink-muted">Years Heritage</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-maroon sm:text-3xl">100%</span>
              <span className="mt-1 text-[11.5px] uppercase tracking-wider text-ink-muted">Direct to Weaver</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-maroon sm:text-3xl">15k+</span>
              <span className="mt-1 text-[11.5px] uppercase tracking-wider text-ink-muted">Drapes Delivered</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-display text-2xl font-bold text-maroon sm:text-3xl">Govt.</span>
              <span className="mt-1 text-[11.5px] uppercase tracking-wider text-ink-muted">Handloom Mark</span>
            </div>
          </div>

          <Link
            href="/contact"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-maroon/30 bg-cream px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-maroon shadow-sm transition-all hover:bg-maroon hover:text-cream hover:shadow-md"
          >
            Connect With Our Team
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
