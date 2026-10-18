import { CheckCircle2, Star } from "lucide-react";

const REVIEWS = [
  {
    quote:
      "The weight of the Korvai border and the subtle, warm luster of genuine tested zari cannot be replicated by commercial mills. Ungal Nesavalan felt like visiting a master weaver's private home salon.",
    author: "Meera Iyer",
    location: "Bengaluru",
    purchase: "Bridal Muhurtham Saree"
  },
  {
    quote:
      "The weaver identity card tucked inside the cedar packaging moved my entire family. Knowing the exact weaver who tensioned the warp for 28 days makes this my daughter's heirloom of a lifetime.",
    author: "Ananya Rao",
    location: "Hyderabad",
    purchase: "Pure Zari Korvai Silk"
  },
  {
    quote:
      "Ordered from London with initial hesitation on international silk transit. The insured archival box arrived in four days in immaculate condition with genuine Silk Mark lab authentication.",
    author: "Kavya Shankar",
    location: "London, UK",
    purchase: "Peacock Temple Pallu"
  }
];

export function PatronReflections() {
  return (
    <section className="w-full bg-[#FBF9F5] py-16 md:py-24 px-4 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7A5817] block mb-1">
            Words from Heirloom Keepers
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-[#1B1C1A]">Patron Reflections</h2>
        </div>

        {/* 3-Column Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.author}
              className="bg-[#F5EFEB] p-6 md:p-8 border border-[#D0C4BF]/40 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-1 text-[#C69C55] mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#C69C55] text-[#C69C55]" />
                  ))}
                </div>
                <p className="font-display text-sm md:text-base text-[#1B1C1A] leading-relaxed mb-6">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#D0C4BF]/30 flex items-center justify-between">
                <div>
                  <h4 className="font-display text-[15px] text-[#1B1C1A] font-semibold">
                    {rev.author}
                  </h4>
                  <span className="text-[11px] text-[#7F7570] block">
                    {rev.location} · {rev.purchase}
                  </span>
                </div>
                <CheckCircle2 className="h-5 w-5 text-[#7A5817] shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
