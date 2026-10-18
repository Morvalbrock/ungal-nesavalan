import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";
import type { CraftCluster } from "@/server/repositories";
import { ALL_CRAFT_CLUSTERS } from "@/server/repositories";

const NUMBER_WORDS: Record<number, string> = {
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten"
};

export function HeritageStrip({ clusters }: { clusters?: CraftCluster[] }) {
  const displayClusters = clusters ?? ALL_CRAFT_CLUSTERS;
  if (displayClusters.length === 0) return null;

  const countWord = NUMBER_WORDS[displayClusters.length] ?? String(displayClusters.length);
  const title = `${countWord} weave${displayClusters.length === 1 ? "" : "s"}. One country.`;

  return (
    <section className="border-t border-border/60 bg-cream py-24">
      <Container>
        <SectionHeading
          eyebrow="Cartography of craft"
          title={title}
          subtitle="A short atlas of the looms we work with, from the Coromandel to the Konkan."
        />

        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
          {displayClusters.map((c, i) => (
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
