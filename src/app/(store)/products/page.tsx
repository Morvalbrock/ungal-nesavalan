import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { Ornament } from "@/components/home/Ornament";
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
    <>
      <section className="border-b border-border/60 bg-cream-warm/60">
        <Container className="py-14">
          <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-ink-muted">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span className="mx-2 text-ink-muted/60">/</span>
            <span className="text-ink">All Sarees</span>
          </nav>

          <div className="mt-6 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">The full atlas</p>
              <h1 className="mt-2 font-display text-[42px] leading-none md:text-[52px]">All Sarees</h1>
              <p className="mt-3 max-w-lg text-[14.5px] leading-[1.6] text-ink-soft">
                Kanjivaram, Banarasi, Chanderi, Patola, Uppada, Ikat and more —
                every drape sourced directly from the loom.
              </p>
            </div>
            <Ornament className="hidden h-4 w-40 md:block" tone="gold" />
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <p className="text-[12.5px] text-ink-muted">
            Showing <span className="font-medium text-ink">{total}</span> piece{total === 1 ? "" : "s"}
          </p>
          <SortSelect />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <FilterSidebar />
          <ProductGrid items={items} ratings={ratings} />
        </div>
      </Container>
    </>
  );
}
