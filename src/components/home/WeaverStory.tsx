import Image from "next/image";
import Link from "next/link";
import { Ornament } from "./Ornament";

export function WeaverStory() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <Image
          src="https://picsum.photos/seed/weaver-portrait/1000/1200"
          alt="Master weaver Muniyandi at the pit loom"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] gap-16 px-6 py-24 lg:grid-cols-2">
        <div className="max-w-lg">
          <p className="eyebrow-cream">Meet the loom</p>
          <h2 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[46px]">
            Every saree begins as
            <span className="block italic text-gold-soft">a promise between two hands.</span>
          </h2>
          <Ornament className="mt-6 h-4 w-40" tone="gold" />
          <p className="mt-6 text-[15px] leading-[1.8] text-cream/80">
            Muniyandi has been at the pit loom in Kanchipuram for thirty-two years —
            long enough to see his fingers memorise the count of a temple border. Every
            drape we send you carries the name of the weaver who wove it, the cluster it
            came from, and the day it left the loom.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-cream/15 pt-6">
            <div>
              <p className="font-display text-2xl">92%</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest2 text-cream/60">To weavers</p>
            </div>
            <div>
              <p className="font-display text-2xl">14</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest2 text-cream/60">GI-tagged clusters</p>
            </div>
            <div>
              <p className="font-display text-2xl">180</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest2 text-cream/60">Artisan families</p>
            </div>
          </div>

          <Link href="/about" className="btn-outline-cream mt-10">
            Read the story
          </Link>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-card lg:hidden">
          <Image
            src="https://picsum.photos/seed/weaver-portrait/900/1200"
            alt="Master weaver at the pit loom"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
