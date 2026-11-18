import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";
import { Star, CheckCircle } from "lucide-react";

const QUOTES = [
  {
    body: "I ordered the Royal Plum & Lavender Kanjivaram for my sister's reception. When it arrived — folded in unbleached muslin with a note from weaver Murugan — we were speechless. The zari sheen and butter-soft drape are truly heirloom quality.",
    name: "Meera Iyer",
    role: "Bengaluru",
    weave: "Royal Plum & Lavender Kanjivaram",
    verified: true
  },
  {
    body: "The lilac soft silk is impossibly light and drapes with such effortless grace. Wore it to a temple wedding and received three compliments before even reaching the mandap. Knowing it came straight from an Elampillai pit-loom made it priceless.",
    name: "Ananya Rao",
    role: "Hyderabad",
    weave: "Lilac Floral Soft Silk",
    verified: true
  },
  {
    body: "I've bought handlooms across Chennai and Coimbatore boutiques. Ungal Nesavalan is the first studio that sends the weaver's name and cluster directly on the tag. Authentic Handloom Mark, zero middlemen, and superb customer care.",
    name: "Kavya Shankar",
    role: "Chennai",
    weave: "Elampillai Temple Border Silk",
    verified: true
  }
];

export function Testimonials() {
  return (
    <section className="border-t border-border/70 bg-cream-warm/40 py-16 sm:py-20 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="Direct Loom Testimonials"
          title="Drapes With a Return Address"
          subtitle="Real patron stories celebrating pure handloom silk, Elampillai pit-loom craftsmanship, and honest pricing."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <figure
              key={i}
              className="relative flex h-full flex-col rounded-card border border-border/80 bg-cream p-7 shadow-card transition-all duration-300 hover:border-maroon/30 hover:shadow-elev"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                {q.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-maroon/10 px-2.5 py-0.5 text-[10px] font-medium text-maroon">
                    <CheckCircle className="h-3 w-3" />
                    Verified Patron
                  </span>
                )}
              </div>

              <blockquote className="relative mt-5 flex-1 text-[14.5px] leading-[1.7] text-ink-soft">
                &ldquo;{q.body}&rdquo;
              </blockquote>

              <figcaption className="mt-6 border-t border-border/60 pt-4">
                <p className="font-display text-base font-medium text-ink">{q.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
                  {q.role} &middot; <span className="text-maroon font-medium">{q.weave}</span>
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
