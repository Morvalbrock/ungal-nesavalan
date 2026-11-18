import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { Ornament } from "@/components/home/Ornament";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { productRepo, reviewRepo, pageBannerRepo, catalogRepo } from "@/server/repositories";

export const metadata = { title: "All Sarees" };

type Search = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const query = readQueryFromSearchParams(sp);
  const [[{ items, total }, facets], banner, catalogs] = await Promise.all([
    Promise.all([
      productRepo.list({ ...query, perPage: 60 }),
      productRepo.getAvailableFacets()
    ]),
    pageBannerRepo.findByPage("/products"),
    catalogRepo.list()
  ]);
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  const activeWeaveSlug = query.weave?.[0];
  const matchedCatalog = activeWeaveSlug
    ? catalogs.find((c) => c.slug.toLowerCase() === activeWeaveSlug.toLowerCase())
    : null;

  const weaveTitle =
    matchedCatalog?.name ||
    (activeWeaveSlug
      ? activeWeaveSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null);

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
                "Elampillai silk-cotton sarees woven on our own looms — direct from weaver to wardrobe."}
            </p>
          </Container>
        </section>
      ) : (
        <section className="border-b border-purple-100 bg-lavender-mist">
          <Container className="py-10 sm:py-14">
            <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-slate-500">
              <Link href="/" className="hover:text-brand-purple transition-colors">Home</Link>
              <span className="mx-2 text-purple-300">/</span>
              {weaveTitle ? (
                <>
                  <Link href="/products" className="hover:text-brand-purple transition-colors">All Sarees</Link>
                  <span className="mx-2 text-purple-300">/</span>
                  <span className="text-brand-plum font-semibold">{weaveTitle}</span>
                </>
              ) : (
                <span className="text-brand-plum font-semibold">All Sarees</span>
              )}
            </nav>

            <div className="mt-5 flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-100/90 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-brand-purple">
                  {weaveTitle ? "Weave Family Collection" : "Loom Fresh Atlas"}
                </span>
                <h1 className="mt-3 font-heritage text-[38px] font-bold text-brand-plum leading-tight md:text-[52px]">
                  {weaveTitle || "All Sarees"}
                </h1>
                <p className="mt-2.5 max-w-lg text-sm text-slate-600 leading-relaxed">
                  {weaveTitle
                    ? `Explore our authentic ${weaveTitle} collection woven using traditional jacquard and pit-loom techniques — direct from master weaver to your wardrobe.`
                    : "Elampillai silk-cotton and pure soft silk sarees woven on our own pit-looms — direct from master weaver to your wardrobe."}
                </p>
              </div>
              <Ornament className="hidden h-4 w-40 md:block" tone="maroon" />
            </div>
          </Container>
        </section>
      )}

      <Container className="py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-brand-plum">{total}</span> piece{total === 1 ? "" : "s"}
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
