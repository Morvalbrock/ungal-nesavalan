import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { Ornament } from "@/components/home/Ornament";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { productRepo, reviewRepo, pageBannerRepo, catalogRepo, categoryRepo } from "@/server/repositories";

export const metadata = { title: "All Sarees" };

type Search = Record<string, string | string[] | undefined>;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const query = readQueryFromSearchParams(sp);
  const [[{ items, total }, facets], banner, catalogs, categories] = await Promise.all([
    Promise.all([
      productRepo.list({ ...query, perPage: 60 }),
      productRepo.getAvailableFacets()
    ]),
    pageBannerRepo.findByPage("/products"),
    catalogRepo.list(),
    categoryRepo.list()
  ]);
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  const activeWeaveSlug = query.weave?.[0];
  const matchedCatalog = activeWeaveSlug
    ? catalogs.find((c) => c.slug.toLowerCase() === activeWeaveSlug.toLowerCase())
    : null;

  const activeCategory = query.category
    ? categories.find(
        (c) =>
          c.id.toLowerCase() === query.category?.toLowerCase() ||
          c.slug.toLowerCase() === query.category?.toLowerCase()
      )
    : null;

  const bannerImageUrl =
    matchedCatalog?.imageUrl ||
    activeCategory?.headerImage ||
    activeCategory?.image ||
    (banner?.imageUrl && !banner.imageUrl.includes("picsum.photos")
      ? banner.imageUrl
      : "/images/authentic_indian_handloom_silk_saree.png");

  const weaveTitle =
    matchedCatalog?.name ||
    activeCategory?.name ||
    (activeWeaveSlug
      ? activeWeaveSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null);

  const bannerTitle = weaveTitle || banner?.title || "All Sarees";
  const bannerSubtitle =
    activeCategory?.description ||
    banner?.subtitle ||
    "Elampillai silk-cotton sarees woven on our own looms — direct from weaver to wardrobe.";

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1f0525] via-[#2d083b] to-[#14021b] text-white">
        {bannerImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={bannerImageUrl}
              alt={bannerTitle}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1f0525]/80 via-[#2d083b]/50 to-[#14021b]/90" />
          </div>
        )}
        <Container className="relative flex min-h-[300px] sm:min-h-[340px] flex-col justify-end py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-purple-200/80">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-purple-300/40">/</span>
            {weaveTitle ? (
              <>
                <Link href="/products" className="hover:text-white transition-colors">All Sarees</Link>
                <span className="mx-2 text-purple-300/40">/</span>
                <span className="text-white font-semibold">{weaveTitle}</span>
              </>
            ) : (
              <span className="text-white font-semibold">All Sarees</span>
            )}
          </nav>

          <div className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full border border-purple-300/40 bg-purple-900/60 backdrop-blur-md px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-purple-200">
            {weaveTitle ? "Curated Weave Collection" : "Artisan Handloom Collection"}
          </div>
          <h1 className="mt-3 font-heritage text-[40px] font-bold text-white leading-none md:text-[56px]">
            {bannerTitle}
          </h1>
          <Ornament className="mt-4 h-4 w-40" tone="gold" />
          {bannerSubtitle && (
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-purple-100/90">
              {bannerSubtitle}
            </p>
          )}
        </Container>
      </section>

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
