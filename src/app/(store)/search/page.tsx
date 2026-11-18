import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchBox } from "@/components/common/SearchBox";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { productRepo, reviewRepo, categoryRepo } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Search",
  description: "Find sarees by weave, colour, region, or occasion.",
  alternates: { canonical: "/search" }
};

type Search = Record<string, string | string[] | undefined>;

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const query = readQueryFromSearchParams(sp);
  const q = query.q?.trim() ?? "";

  const [{ items, total }, categories] = await Promise.all([
    q ? productRepo.list({ ...query, perPage: 60 }) : Promise.resolve({ items: [], total: 0 }),
    categoryRepo.listWithStock()
  ]);
  const ratings = items.length ? await reviewRepo.aggregateForMany(items.map((p) => p.id)) : {};

  return (
    <div className="bg-[#faf7fd] min-h-[75vh]">
      <section className="bg-lavender-mist border-b border-purple-100 py-12">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
              Curated Search
            </span>
            <h1 className="mt-3 font-heritage text-3xl sm:text-4xl text-brand-plum">
              {q ? <>Results for &ldquo;{q}&rdquo;</> : "Find Your Signature Saree"}
            </h1>
            {q && (
              <p className="mt-2 text-sm text-purple-900/70">
                {total} piece{total === 1 ? "" : "s"} found directly from Elampillai master weavers
              </p>
            )}
          </div>

          <div className="mt-6 max-w-xl">
            <SearchBox autoFocus={!q} />
          </div>
        </Container>
      </section>

      <Container className="py-10">
        {!q && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-purple-900/80">
              Browse by Weave & Collection
            </h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {categories.slice(0, 16).map((c) => (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className="rounded-full border border-purple-200/90 bg-white px-4 py-2 text-xs font-medium text-brand-plum shadow-xs transition hover:border-brand-purple hover:bg-purple-100/60"
                >
                  {c.name}
                </Link>
              ))}
            </div>

            <div className="mt-8 border-t border-purple-100 pt-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-purple-900/70">
                Popular Searches
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Kalyani Cotton",
                  "Elampillai Soft Silk",
                  "Bridal Muhurtham",
                  "Gold Zari Jacquard",
                  "Tissue Silk",
                  "Daily Wear Handloom",
                  "Pure Cotton Butta"
                ].map((s) => (
                  <Link
                    key={s}
                    href={`/search?q=${encodeURIComponent(s)}`}
                    className="rounded-full bg-purple-100/70 px-3 py-1 text-xs font-medium text-purple-900 hover:bg-brand-purple hover:text-white transition"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {q && (
          <div>
            <ProductGrid items={items} ratings={ratings} />
          </div>
        )}
      </Container>
    </div>
  );
}
