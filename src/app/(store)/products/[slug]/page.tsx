import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { RatingStars } from "@/components/product/RatingStars";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { WhatsAppShare } from "@/components/product/WhatsAppShare";
import { JsonLd } from "@/components/seo/JsonLd";
import { orderRepo, productRepo, categoryRepo, reviewRepo } from "@/server/repositories";
import { getSession } from "@/features/auth/session";
import { formatINR } from "@/lib/utils";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await productRepo.findBySlug(slug);
  if (!p) return { title: "Not found" };
  const canonical = `/products/${p.slug}`;
  const ogImage = `/api/og/products/${p.slug}`;
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical },
    openGraph: {
      title: p.name,
      description: p.description,
      url: canonical,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }]
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) notFound();

  const [category, related, reviewsPage, aggregate, session] = await Promise.all([
    categoryRepo.findById(product.categoryId),
    productRepo.list({ category: product.categoryId, perPage: 8 }),
    reviewRepo.listByProduct(product.id, { perPage: 10 }),
    reviewRepo.aggregateFor(product.id),
    getSession()
  ]);
  const others = related.items.filter((p) => p.id !== product.id).slice(0, 4);

  let eligibility: "eligible" | "already_reviewed" | "not_eligible" | "unauthenticated" = "unauthenticated";
  if (session) {
    const own = await reviewRepo.findByUserAndProduct(session.userId, product.id);
    if (own) eligibility = "already_reviewed";
    else {
      const order = await orderRepo.findEligibleForReview(session.userId, product.id);
      eligibility = order ? "eligible" : "not_eligible";
    }
  }

  const onSale = product.salePrice != null && product.salePrice < product.basePrice;
  const displayPrice = product.salePrice ?? product.basePrice;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${SITE_URL}${i.url}`)),
    brand: { "@type": "Brand", name: "Ungal Nesavalan" },
    sku: product.variants[0]?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (displayPrice / 100).toFixed(0),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.slug}`
    }
  };
  if (aggregate.count > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregate.avg.toFixed(1),
      reviewCount: aggregate.count
    };
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Sarees", item: `${SITE_URL}/products` },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `${SITE_URL}/category/${category.slug}`
            } as const
          ]
        : []),
      {
        "@type": "ListItem",
        position: category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/products/${product.slug}`
      }
    ]
  };

  return (
    <Container className="py-10">
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
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

          {aggregate.count > 0 && (
            <div className="mt-3">
              <RatingStars avg={aggregate.avg} count={aggregate.count} size="md" />
            </div>
          )}

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

          <p className="mt-6 whitespace-pre-line text-ink-soft">{product.description}</p>

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

          <div className="mt-4">
            <WhatsAppShare productName={product.name} productSlug={product.slug} />
          </div>
        </div>
      </div>

      <ReviewsSection
        productSlug={product.slug}
        aggregate={aggregate}
        reviews={reviewsPage.items}
        eligibility={eligibility}
      />

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
