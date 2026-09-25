import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "./SectionHeading";
import { listPosts } from "@/features/journal/posts";

export async function JournalPreview() {
  const all = await listPosts();
  const posts = all.slice(0, 3);

  const filler = [
    {
      slug: "care-for-your-kanjivaram",
      title: "How to care for a Kanjivaram — a weaver's checklist",
      excerpt:
        "Muslin, silica and the humble neem leaf. What master weavers do at home to keep pure zari from tarnishing.",
      heroImage: "https://picsum.photos/seed/journal-care/900/600",
      publishedAt: "2026-05-14",
      readingTimeMin: 6
    },
    {
      slug: "geography-of-a-drape",
      title: "The geography of a drape: 14 clusters, mapped",
      excerpt:
        "From the salt pans of Kutch to the lanes of Kanchipuram — where India's most storied weaves come from.",
      heroImage: "https://picsum.photos/seed/journal-map/900/600",
      publishedAt: "2026-03-09",
      readingTimeMin: 8
    }
  ];

  const items = [
    ...posts,
    ...filler
  ].slice(0, 3);

  return (
    <section className="py-24">
      <Container>
        <SectionHeading
          eyebrow="Field notes"
          title="From the journal"
          subtitle="Weaver profiles, craft dispatches, and the quiet science of a good drape."
          cta={{ label: "Read the journal", href: "/journal" }}
          align="left"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              className="group block"
            >
              {p.heroImage && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream-warm">
                  <Image
                    src={p.heroImage}
                    alt={p.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
              )}
              <div className="mt-5">
                <p className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">
                  {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}{" "}
                  · {p.readingTimeMin} min read
                </p>
                <h3 className="mt-2 font-display text-[22px] leading-tight text-ink transition group-hover:text-maroon">
                  {p.title}
                </h3>
                <p className="mt-2 text-[14.5px] leading-[1.65] text-ink-soft line-clamp-3">{p.excerpt}</p>
                <span className="mt-4 inline-block text-[12px] uppercase tracking-widest2 text-maroon">
                  Read essay →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
