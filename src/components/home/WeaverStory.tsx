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
          <p className="eyebrow-cream">Our story</p>
          <h2 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[46px]">
            Direct from Our Looms.
            <span className="block italic text-gold-soft">Made with Care.</span>
          </h2>
          <Ornament className="mt-6 h-4 w-40" tone="gold" />
          <p className="mt-2 text-[14px] italic leading-[1.6] text-gold-soft/80">
            Every Saree Has a Story. Every Thread Deserves Quality.
          </p>
          <p className="mt-5 text-[15px] leading-[1.8] text-cream/80">
            At Ungal Nesavalan, we bring you beautiful sarees that celebrate the richness
            of Indian tradition and craftsmanship.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-cream/80">
            Every saree you choose is crafted by us and sold directly to you, without
            unnecessary middlemen. We focus on premium quality, elegant designs and
            attention to detail to offer you the best value.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-cream/80">
            Our promise is simple — premium quality, trusted service and beautiful sarees
            for every special moment.
          </p>

          <div className="mt-8 border-t border-cream/15 pt-6">
            <p className="text-[13px] uppercase tracking-widest2 text-cream/60">
              Quality You Can Trust. Elegance You Deserve.
            </p>
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
