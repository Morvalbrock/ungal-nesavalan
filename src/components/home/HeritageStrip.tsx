import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";

const CLUSTERS = [
  { weave: "Kanjivaram", place: "Kanchipuram, TN", href: "/products?weave=kanjivaram" },
  { weave: "Banarasi", place: "Varanasi, UP", href: "/products?weave=banarasi" },
  { weave: "Chanderi", place: "Chanderi, MP", href: "/products?weave=chanderi" },
  { weave: "Patola", place: "Patan, Gujarat", href: "/products?weave=patola" },
  { weave: "Jamdani", place: "Uppada, AP", href: "/products?weave=jamdani" },
  { weave: "Ikat", place: "Pochampally / Sambalpur", href: "/products?weave=ikat" },
  { weave: "Paithani", place: "Paithan, Maharashtra", href: "/products?weave=paithani" },
  { weave: "Bandhani", place: "Kutch, Gujarat", href: "/products?weave=bandhani" },
  { weave: "Muga", place: "Sualkuchi, Assam", href: "/products" },
  { weave: "Baluchari", place: "Bishnupur, WB", href: "/products" }
];

export function HeritageStrip() {
  return (
    <section className="border-t border-border/60 bg-cream py-24">
      <Container>
        <SectionHeading
          eyebrow="Cartography of craft"
          title="Ten weaves. One country."
          subtitle="A short atlas of the looms we work with, from the Coromandel to the Konkan."
        />

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          {CLUSTERS.map((c, i) => (
            <Link
              key={c.weave}
              href={c.href}
              className="group flex flex-col border-t border-border/70 pt-5 transition"
            >
              <span className="text-[11px] font-medium uppercase tracking-widest2 text-ink-muted">
                No. {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-3 font-display text-[22px] text-ink transition group-hover:text-maroon">
                {c.weave}
              </span>
              <span className="mt-1 text-[12.5px] text-ink-muted">{c.place}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
