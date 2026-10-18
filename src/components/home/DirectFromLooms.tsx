import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function DirectFromLooms() {
  return (
    <section className="w-full bg-[#14100E] text-[#FDFBF7] py-16 md:py-24 px-4 md:px-12 overflow-hidden relative">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Narrative Console */}
        <div className="col-span-12 lg:col-span-7 flex flex-col pr-0 lg:pr-8 z-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#E5C378] mb-2 block">
            Transparent Ancestral Lineage
          </span>

          <h2 className="font-display text-3xl md:text-5xl text-[#FDFBF7] leading-tight mb-2">
            Direct from Our Looms. <br />
            Made with Care.
          </h2>

          <p className="font-display italic text-[#EDBF75] text-base md:text-lg mb-6">
            Every Saree Has a Story. Every Thread Deserves Quality.
          </p>

          <div className="space-y-4 text-white/85 text-sm md:text-base leading-relaxed mb-8">
            <p>
              At Ungal Nesavalan, we bring you beautiful sarees that celebrate the richness of Indian tradition and craftsmanship. Every saree you choose is crafted by us and sold directly to you, without unnecessary middlemen. We focus on premium quality, elegant designs and attention to detail to offer you the best value. Our promise is simple — premium quality, trusted service and beautiful sarees for every special moment.
            </p>
          </div>

          {/* Master Weaver Quote Block */}
          <div className="border-l-2 border-[#C69C55] pl-4 py-2 bg-white/5 mb-8">
            <p className="font-display italic text-base md:text-lg text-[#FDFBF7] mb-2">
              &ldquo;When you drape this cloth, you wear three generations of our home&apos;s patience.&rdquo;
            </p>
            <span className="text-[10.5px] uppercase tracking-widest text-[#E5C378] block font-semibold">
              — Ramanathan K., 4th Generation Master Weaver, Pillaiyarpalayam Loom
            </span>
          </div>

          <div>
            <Link
              href="/about"
              className="inline-flex items-center text-[11px] uppercase font-semibold tracking-[0.2em] text-[#E5C378] hover:text-white transition-colors pb-1 border-b border-[#E5C378]/50"
            >
              Read The Weaver Lineage
              <ArrowRight className="h-3.5 w-3.5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Right Atmospheric Loom Image Frame */}
        <div className="col-span-12 lg:col-span-5 relative mt-8 lg:mt-0">
          <div className="relative bg-white/5 p-2.5 border border-white/15 shadow-2xl">
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-black/40">
              <Image
                src="https://lh3.googleusercontent.com/aida/AEtjO1WKyBG6ouFUTOeg45D0_DQtNKXAp3GKArbYcxp7sjGSZVWho-0GOqQRmV5UY0v0UecOU0RlBblmnglhcPRgGPhYhBuJHYlurSbHXZ92nkSJIE-jJB_5qbb26Eri42Gx_Omj3qtu-oiLLM_EQYkZIyAGQwOqfRq1bw2uDzJbtc5ZVZo-qcn6ZzfffxqcBTqrsljuP_7Py6U-Dk4NTrFFeKBNELpAQgWJDpiftft6Er3iysAdX3xLAQ"
                alt="Traditional South Indian handloom pit-loom with rich silk and gold zari brocade"
                width={600}
                height={800}
                className="w-full h-full object-cover object-center filter saturate-90 contrast-105 transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="p-3 flex items-center justify-between text-[10px] uppercase font-semibold tracking-wider text-white/70">
              <span>Kanchipuram Guild Atelier #04</span>
              <span>Hand-Thrown Shuttle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
