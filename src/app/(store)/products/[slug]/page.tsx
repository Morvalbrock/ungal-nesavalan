import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { productRepo, categoryRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await productRepo.findBySlug(slug);
  if (!p) return { title: "Not found" };
  return { title: p.name, description: p.description };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) notFound();

  const [category, related] = await Promise.all([
    categoryRepo.findById(product.categoryId),
    productRepo.list({ category: product.categoryId, perPage: 8 })
  ]);
  const others = related.items.filter((p) => p.id !== product.id).slice(0, 4);

  const onSale = product.salePrice != null && product.salePrice < product.basePrice;
  const displayPrice = product.salePrice ?? product.basePrice;

  return (
    <Container className="py-10">
      <nav className="mb-6 text-xs text-ink-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-ink">Sarees</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ProductGallery images={product.images} />

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            {product.weave} · {product.fabric} · {product.region}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatINR(displayPrice)}</span>
            {onSale && (
              <span className="text-base text-ink-muted line-through">{formatINR(product.basePrice)}</span>
            )}
            {onSale && (
              <span className="rounded-full bg-maroon/10 px-2 py-0.5 text-xs text-maroon">
                Save {formatINR(product.basePrice - displayPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-ink-soft">{product.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-border/70 py-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Length</dt>
              <dd className="mt-1">{product.lengthMeters} m</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Blouse Piece</dt>
              <dd className="mt-1">{product.blousePieceIncluded ? "Included" : "Not included"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Fabric</dt>
              <dd className="mt-1 capitalize">{product.fabric}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Weave</dt>
              <dd className="mt-1 capitalize">{product.weave}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Care</dt>
              <dd className="mt-1">{product.careInstructions}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-24 border-t border-border/70 pt-14">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl">You may also like</h2>
            {category && (
              <Link href={`/category/${category.slug}`} className="link-underline text-sm">
                More in {category.name} →
              </Link>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
