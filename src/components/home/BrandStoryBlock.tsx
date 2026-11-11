import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/Container";

export function BrandStoryBlock() {
  return (
    <section className="w-full bg-cream pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-10 md:pb-20">
      <Container>
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <div className="flex items-center gap-2.5" aria-hidden>
            <span className="block h-px w-20 bg-gold/60" />
            <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="block h-px w-20 bg-gold/60" />
          </div>
          <span className="eyebrow mt-6 text-gold-deep" style={{ letterSpacing: "0.3em" }}>
            The Weaver&rsquo;s Mark
          </span>
          <h2 className="mt-5 font-display text-[32px] leading-[1.15] text-ink sm:text-[38px] md:text-[44px]">
            Pit-loomed in Elampillai.{" "}
            <em className="italic text-maroon">Signed by the hands that made it.</em>
          </h2>
          <p className="mt-6 max-w-[580px] text-[15px] leading-[1.7] text-ink-soft md:text-base">
            Every saree leaves our atelier with the weaver&rsquo;s name tied to it. No
            agents, no showrooms, no middle margin — just the loom, the thread, and the
            person who sat with it for a fortnight.
          </p>
          <Link
            href="/about"
            className="group mt-10 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-ink transition-colors hover:text-maroon"
          >
            Meet the Weavers
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
