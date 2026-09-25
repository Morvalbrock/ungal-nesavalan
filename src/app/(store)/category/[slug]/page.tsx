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
  const { items, total } = await productRepo.list({
    ...query,
    category: category.id,
    perPage: 60
  });
  const ratings = await reviewRepo.aggregateForMany(items.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        {category.image && (
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink/80" />
          </div>
        )}
        <Container className="relative flex min-h-[340px] flex-col justify-end py-16">
          <nav aria-label="Breadcrumb" className="text-[11.5px] uppercase tracking-widest2 text-cream/70">
            <Link href="/" className="hover:text-cream">Home</Link>
            <span className="mx-2 text-cream/40">/</span>
            <Link href="/products" className="hover:text-cream">Sarees</Link>
            <span className="mx-2 text-cream/40">/</span>
            <span className="text-cream">{category.name}</span>
          </nav>

          <p className="eyebrow-cream mt-6">The collection</p>
          <h1 className="mt-3 font-display text-[46px] leading-none md:text-[62px]">{category.name}</h1>
          <Ornament className="mt-4 h-4 w-40" tone="gold" />
          {category.description && (
            <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-cream/80">{category.description}</p>
          )}
        </Container>
      </section>

      <Container className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <p className="text-[12.5px] text-ink-muted">
            Showing <span className="font-medium text-ink">{total}</span> piece{total === 1 ? "" : "s"} in{" "}
            <span className="font-medium text-ink">{category.name}</span>
          </p>
          <SortSelect />
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <FilterSidebar hideCategory />
          <ProductGrid items={items} ratings={ratings} />
        </div>
      </Container>
    </>
  );
}
