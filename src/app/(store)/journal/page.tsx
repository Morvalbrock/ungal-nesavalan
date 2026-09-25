import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { listPosts, listTags } from "@/features/journal/posts";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories from the loom — weaver profiles, saree care notes, and dispatches from Kanchipuram, Varanasi, and beyond.",
  alternates: { canonical: "/journal" }
};

export const revalidate = 300;

export default async function JournalIndexPage({
  searchParams
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const [posts, tags] = await Promise.all([listPosts(), listTags()]);
  const filtered = tag ? posts.filter((p) => (p.tags ?? []).includes(tag)) : posts;

  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Journal</p>
        <h1 className="mt-2 font-display text-4xl">Stories from the loom</h1>
        <p className="mt-3 text-ink-muted">
          Weaver profiles, care notes, and dispatches from India's handloom clusters.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 text-xs">
          <Link
            href="/journal"
            className={
              tag
                ? "rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
                : "rounded-full border border-ink bg-ink px-3 py-1 text-cream"
            }
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/journal?tag=${encodeURIComponent(t)}`}
              className={
                t === tag
                  ? "rounded-full border border-ink bg-ink px-3 py-1 text-cream"
                  : "rounded-full border border-border px-3 py-1 text-ink-soft hover:border-ink hover:text-ink"
              }
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-12 rounded-card border border-border bg-cream-warm p-8 text-center text-ink-muted">
          No posts yet. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
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
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.25em] text-ink-muted">
                  {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}{" "}
                  · {p.readingTimeMin} min read
                </p>
                <h2 className="mt-2 font-display text-xl">{p.title}</h2>
                <p className="mt-2 text-sm text-ink-soft">{p.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
