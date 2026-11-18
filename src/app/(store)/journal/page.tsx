import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { listPosts, listTags } from "@/features/journal/posts";
import { pageBannerRepo } from "@/server/repositories";

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
  const [posts, tags, banner] = await Promise.all([
    listPosts(),
    listTags(),
    pageBannerRepo.findByPage("/journal")
  ]);
  const filtered = tag ? posts.filter((p) => (p.tags ?? []).includes(tag)) : posts;

  return (
    <div className="bg-[#faf7fd] min-h-[75vh]">
      {banner?.imageUrl ? (
        <section className="relative overflow-hidden bg-[#1f0525] text-white">
          <div className="absolute inset-0">
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Stories from the loom"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-deep/80 via-[#2f0837]/75 to-[#1f0525]" />
          </div>
          <Container className="relative flex min-h-[300px] flex-col justify-end py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-900/60 border border-purple-400/30 px-3 py-1 text-xs font-semibold text-amber-300 tracking-wide uppercase w-fit">
              Loom Chronicles
            </span>
            <h1 className="mt-3 font-heritage text-4xl md:text-5xl text-white font-bold">
              {banner.title || "Stories From the Handloom"}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-purple-100/90">
              {banner.subtitle || "Weaver profiles, saree preservation guides, and dispatches from Elampillai."}
            </p>
          </Container>
        </section>
      ) : (
        <section className="bg-lavender-mist border-b border-purple-100 py-12">
          <Container>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
                Weaving Chronicles
              </span>
              <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum font-bold">Stories From the Loom</h1>
              <p className="mt-2 text-sm text-purple-900/70">
                Artisan profiles, handloom care rituals, and heritage dispatches directly from Salem &amp; Elampillai weavers.
              </p>
            </div>
          </Container>
        </section>
      )}

      <Container className="py-10 sm:py-12">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Link
              href="/journal"
              className={
                tag
                  ? "rounded-full border border-purple-200 bg-white px-3.5 py-1 text-purple-900 font-medium hover:border-brand-purple hover:bg-purple-50 transition"
                  : "rounded-full border border-brand-purple bg-brand-deep px-3.5 py-1 text-white font-semibold shadow-xs"
              }
            >
              All Articles
            </Link>
            {tags.map((t) => (
              <Link
                key={t}
                href={`/journal?tag=${encodeURIComponent(t)}`}
                className={
                  t === tag
                    ? "rounded-full border border-brand-purple bg-brand-deep px-3.5 py-1 text-white font-semibold shadow-xs"
                    : "rounded-full border border-purple-200 bg-white px-3.5 py-1 text-purple-900 font-medium hover:border-brand-purple hover:bg-purple-50 transition"
                }
              >
                {t}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-purple-100 bg-purple-50/50 p-8 text-center text-purple-900/60 text-sm">
            No journal articles found. Check back soon for new weaver chronicles.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/journal/${p.slug}`}
                className="group block rounded-2xl border border-purple-100 bg-white p-4 shadow-xs hover:shadow-md transition-all"
              >
                {p.heroImage && (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-purple-50">
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-900/60">
                    {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}{" "}
                    · {p.readingTimeMin} min read
                  </p>
                  <h2 className="mt-1.5 font-heritage font-bold text-xl text-brand-plum group-hover:text-brand-purple transition">{p.title}</h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
