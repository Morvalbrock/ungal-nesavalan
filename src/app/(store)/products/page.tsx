import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { Ornament } from "@/components/home/Ornament";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { productRepo, reviewRepo, pageBannerRepo } from "@/server/repositories";

export const metadata = { title: "All Sarees" };

type Search = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const query = readQueryFromSearchParams(sp);
  const [[{ items, total }, facets], banner] = await Promise.all([
    Promise.all([
      productRepo.list({ ...query, perPage: 60 }),
      productRepo.getAvailableFacets()
    ]),
    pageBannerRepo.findByPage("/products")
  ]);
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  return (
    <>
      {banner?.imageUrl ? (
        <section className="relative overflow-hidden bg-ink text-cream">
          <div className="absolute inset-0">
            <Image
              src={banner.imageUrl}
              alt={banner.title || "All Sarees"}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/80" />
          </div>
          <Container className="relative flex min-h-[340px] flex-col justify-end py-16">
            <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-cream/70">
              <Link href="/" className="hover:text-cream">Home</Link>
              <span className="mx-2 text-cream/40">/</span>
              <span className="text-cream">{banner.title || "All Sarees"}</span>
            </nav>

            <p className="eyebrow-cream mt-6">The full atlas</p>
            <h1 className="mt-3 font-display text-[46px] leading-none md:text-[62px]">
              {banner.title || "All Sarees"}
            </h1>
            <Ornament className="mt-4 h-4 w-40" tone="gold" />
            <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-cream/80">
              {banner.subtitle ||
                "Kanjivaram, Banarasi, Chanderi, Patola, Uppada, Ikat and more — every drape sourced directly from the loom."}
            </p>
          </Container>
        </section>
      ) : (
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
      )}

      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <p className="text-[12.5px] text-ink-muted">
            Showing <span className="font-medium text-ink">{total}</span> piece{total === 1 ? "" : "s"}
          </p>
          <SortSelect />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <FilterSidebar
            categories={facets.categories}
            weaves={facets.weaves}
            fabrics={facets.fabrics}
            occasions={facets.occasions}
          />
          <ProductGrid items={items} ratings={ratings} />
        </div>
      </Container>
    </>
  );
}
