import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { productRepo, categoryRepo } from "@/server/repositories";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    productRepo.featured(8),
    categoryRepo.list()
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://picsum.photos/seed/hero-saree/1800/900"
            alt="Draped saree hero"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
        <Container className="relative flex min-h-[520px] flex-col items-start justify-center py-24">
          <p className="text-[11px] uppercase tracking-[0.4em] text-cream/70">Loomed by hand · Woven with story</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.05] md:text-6xl">
            Sarees carried down<br />generations of looms.
          </h1>
          <p className="mt-6 max-w-lg text-cream/80">
            From Kanchipuram to Banaras, Patola to Chanderi — every drape traces back to the artisan who wove it.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn-primary">Shop the collection</Link>
            <Link href="/category/bridal-sarees" className="btn-ghost !border-cream/40 !text-cream hover:!bg-cream hover:!text-ink">
              Bridal edit
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Curated</p>
              <h2 className="mt-2 font-display text-3xl">Featured Sarees</h2>
            </div>
            <Link href="/products" className="link-underline text-sm">View all →</Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border/70 bg-cream-warm py-20">
        <Container>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Shop by weave</p>
          <h2 className="mt-2 font-display text-3xl">Explore collections</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-card"
              >
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                  <p className="font-display text-lg">{c.name}</p>
                  <p className="mt-1 text-xs text-cream/80">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
