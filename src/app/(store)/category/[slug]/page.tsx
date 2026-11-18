import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { Ornament } from "@/components/home/Ornament";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { categoryRepo, productRepo, reviewRepo } from "@/server/repositories";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await categoryRepo.findBySlug(slug);
  if (!c) return { title: "Category not found" };
  return { title: c.name, description: c.description };
}

type Search = Record<string, string | string[] | undefined>;

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Search>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = await categoryRepo.findBySlug(slug);
  if (!category) notFound();

  const query = readQueryFromSearchParams(sp);
  const [{ items, total }, facets] = await Promise.all([
    productRepo.list({
      ...query,
      category: category.id,
      perPage: 60
    }),
    productRepo.getAvailableFacets()
  ]);
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        {(category.headerImage || category.image) && (
          <div className="absolute inset-0">
            <Image
              src={category.headerImage || category.image!}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/80" />
          </div>
        )}
        <Container className="relative flex min-h-[300px] sm:min-h-[340px] flex-col justify-end py-12 sm:py-16">
          <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-purple-200/80">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2 text-purple-300/40">/</span>
            <Link href="/products" className="hover:text-white transition-colors">Sarees</Link>
            <span className="mx-2 text-purple-300/40">/</span>
            <span className="text-white font-semibold">{category.name}</span>
          </nav>

          <div className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full border border-purple-300/40 bg-purple-900/60 backdrop-blur-md px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-purple-200">
            Artisan Handloom Collection
          </div>
          <h1 className="mt-3 font-heritage text-[40px] font-bold text-white leading-none md:text-[56px]">{category.name}</h1>
          <Ornament className="mt-4 h-4 w-40" tone="gold" />
          {category.description && (
            <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-purple-100/90">{category.description}</p>
          )}
        </Container>
      </section>

      <Container className="py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-100 pb-5">
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-brand-plum">{total}</span> piece{total === 1 ? "" : "s"} in{" "}
            <span className="font-semibold text-brand-purple">{category.name}</span>
          </p>
          <SortSelect />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <FilterSidebar
            hideCategory
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
