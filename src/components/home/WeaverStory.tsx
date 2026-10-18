import Image from "next/image";
import Link from "next/link";
import { Ornament } from "./Ornament";

export function WeaverStory() {
  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      {/* Full-width section background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/authentic_indian_handloom_silk_saree.png"
          alt="Master weaver crafting authentic Indian handloom silk saree at the pit loom"
          fill
          sizes="100vw"
          className="object-cover object-[78%_center]"
          priority
        />
        {/* Dark overlays to maintain high contrast for text */}
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/40" />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-6 py-24 md:py-28">
        <div className="max-w-xl">
          <p className="eyebrow-cream">Our story</p>
          <h2 className="mt-4 font-display text-[36px] leading-[1.1] md:text-[46px]">
            Direct from Our Looms.
            <span className="block italic text-gold-soft">Made with Care.</span>
          </h2>
          <Ornament className="mt-6 h-4 w-40" tone="gold" />
          <p className="mt-2 text-[14px] italic leading-[1.6] text-gold-soft/80">
            Every Saree Has a Story. Every Thread Deserves Quality.
          </p>
          <p className="mt-5 text-[15px] leading-[1.8] text-cream/90">
            At Ungal Nesavalan, we bring you beautiful sarees that celebrate the richness
            of Indian tradition and craftsmanship.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-cream/90">
            Every saree you choose is crafted by us and sold directly to you, without
            unnecessary middlemen. We focus on premium quality, elegant designs and
            attention to detail to offer you the best value.
          </p>
          <p className="mt-4 text-[15px] leading-[1.8] text-cream/90">
            Our promise is simple — premium quality, trusted service and beautiful sarees
            for every special moment.
          </p>

          <div className="mt-8 border-t border-cream/20 pt-6">
            <p className="text-[13px] uppercase tracking-widest2 text-cream/70">
              Quality You Can Trust. Elegance You Deserve.
            </p>
          </div>

          <Link href="/about" className="btn-outline-cream mt-10 inline-block">
            Read the story
          </Link>
        </div>
      </div>
    </section>
  );
}
