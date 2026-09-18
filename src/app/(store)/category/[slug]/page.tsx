import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { FilterSidebar } from "@/components/product/FilterSidebar";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SortSelect } from "@/components/product/SortSelect";
import { readQueryFromSearchParams } from "@/features/products/filters";
import { categoryRepo, productRepo } from "@/server/repositories";

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
  const { items, total } = await productRepo.list({
    ...query,
    category: category.id,
    perPage: 60
  });

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        {category.image && (
          <div className="absolute inset-0 opacity-50">
            <Image src={category.image} alt={category.name} fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
        <Container className="relative flex min-h-[280px] flex-col justify-end py-14">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cream/70">Collection</p>
          <h1 className="mt-3 font-display text-5xl">{category.name}</h1>
          {category.description && (
            <p className="mt-3 max-w-xl text-cream/80">{category.description}</p>
          )}
        </Container>
      </section>

      <Container className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-ink-muted">{total} piece{total === 1 ? "" : "s"}</p>
          <SortSelect />
        </div>
        <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
          <FilterSidebar hideCategory />
          <ProductGrid items={items} />
        </div>
      </Container>
    </>
  );
}
