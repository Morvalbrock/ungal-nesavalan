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
    categoryRepo.list()
  ]);
  const ratings = items.length ? await reviewRepo.aggregateForMany(items.map((p) => p.id)) : {};

  return (
    <Container className="py-12">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Search</p>
        <h1 className="mt-2 font-display text-4xl">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : "Find your saree"}
        </h1>
        {q && <p className="mt-2 text-sm text-ink-muted">{total} piece{total === 1 ? "" : "s"} match</p>}
      </div>

      <div className="mt-8 max-w-xl">
        <SearchBox autoFocus={!q} />
      </div>

      {!q && (
        <div className="mt-10">
          <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Browse by category</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 12).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm text-ink-soft transition hover:border-ink hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">Try searching</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {["kanjivaram", "banarasi", "bridal red", "cotton daily", "tissue", "patola"].map((s) => (
                <Link
                  key={s}
                  href={`/search?q=${encodeURIComponent(s)}`}
                  className="rounded-full bg-cream-warm px-3 py-1 text-ink-soft hover:text-ink"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {q && (
        <div className="mt-10">
          <ProductGrid items={items} ratings={ratings} />
        </div>
      )}
    </Container>
  );
}
