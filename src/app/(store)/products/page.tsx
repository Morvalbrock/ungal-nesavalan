import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { productRepo, reviewRepo } from "@/server/repositories";

export const metadata = { title: "All Sarees" };

type Search = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const query = readQueryFromSearchParams(sp);
  const { items, total } = await productRepo.list({ ...query, perPage: 60 });
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  return (
    <Container className="py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Collection</p>
          <h1 className="mt-2 font-display text-4xl">All Sarees</h1>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm text-ink-muted">{total} piece{total === 1 ? "" : "s"}</p>
          <SortSelect />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <FilterSidebar />
        <ProductGrid items={items} ratings={ratings} />
      </div>
    </Container>
  );
}
