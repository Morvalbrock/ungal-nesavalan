import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";

const QUOTES = [
  {
    body: "I bought a Kanjivaram for my sister's wedding. When it arrived — folded in muslin with a note from the weaver — I knew this was a house that understood what a saree means to a family.",
    name: "Meera Iyer",
    role: "Bengaluru",
    weave: "Kanjivaram Crimson Gold"
  },
  {
    body: "The Uppada jamdani is impossibly light and impossibly gold. Three compliments before I even reached the reception. Worth the sixty-day wait.",
    name: "Ananya Rao",
    role: "Hyderabad",
    weave: "Uppada Jamdani Ochre"
  },
  {
    body: "I've bought sarees from studios in Chennai and boutiques in Bombay. Ungal Nesavalan is the first to send me the weaver's name and cluster. That alone earns my next order.",
    name: "Kavya Shankar",
    role: "London",
    weave: "Baluchari Wine Mythology"
  }
];

export function Testimonials() {
  return (
    <section className="border-t border-border/60 bg-cream-warm/50 py-24">
      <Container>
        <SectionHeading
          eyebrow="Kind words"
          title="Drapes with a return address"
          subtitle="The people who wear our sarees, in their own words."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <figure
              key={i}
              className="relative flex h-full flex-col rounded-card border border-border/70 bg-cream p-8 shadow-card"
            >
              <svg
                className="absolute left-6 top-4 h-9 w-9 text-maroon/15"
                viewBox="0 0 32 32"
                fill="currentColor"
                aria-hidden
              >
                <path d="M9 22c-3 0-5-2-5-5 0-4 3-8 7-10l1 2c-3 2-5 4-5 7 1-1 2-1 3-1 2 0 3 2 3 4s-1 3-4 3zm12 0c-3 0-5-2-5-5 0-4 3-8 7-10l1 2c-3 2-5 4-5 7 1-1 2-1 3-1 2 0 3 2 3 4s-1 3-4 3z" />
              </svg>

              <blockquote className="relative mt-8 flex-1 text-[15px] leading-[1.7] text-ink-soft">
                {q.body}
              </blockquote>

              <figcaption className="mt-6 border-t border-border/60 pt-4">
                <p className="font-display text-base text-ink">{q.name}</p>
                <p className="text-[11.5px] uppercase tracking-widest2 text-ink-muted">
                  {q.role} · {q.weave}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
