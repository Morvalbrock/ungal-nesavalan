import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { DeliveryChecker } from "@/components/product/DeliveryChecker";
import { RatingStars } from "@/components/product/RatingStars";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { QuestionsSection } from "@/components/product/QuestionsSection";
import { WhatsAppShare } from "@/components/product/WhatsAppShare";
import { JsonLd } from "@/components/seo/JsonLd";
import { Ornament } from "@/components/home/Ornament";
import { orderRepo, productRepo, categoryRepo, questionRepo, reviewRepo } from "@/server/repositories";
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

  const [category, related, reviewsPage, aggregate, questions, session] = await Promise.all([
    categoryRepo.findById(product.categoryId),
    productRepo.list({ category: product.categoryId, perPage: 8 }),
    reviewRepo.listByProduct(product.id, { perPage: 10 }),
    reviewRepo.aggregateFor(product.id),
    questionRepo.listByProduct(product.id),
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
  const salePct =
    onSale && product.salePrice
      ? Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)
      : 0;

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

      <nav aria-label="Breadcrumb" className="mb-8 text-[11.5px] uppercase tracking-widest2 text-ink-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span className="mx-2 text-ink-muted/60">/</span>
        <Link href="/products" className="hover:text-ink">Sarees</Link>
        {category && (
          <>
            <span className="mx-2 text-ink-muted/60">/</span>
            <Link href={`/category/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-ink-muted/60">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <ProductGallery images={product.images} />

        <div>
          <div className="flex flex-wrap gap-1.5">
            <span className="chip capitalize">{product.weave}</span>
            <span className="chip capitalize">{product.fabric}</span>
            <span className="chip">{product.region}</span>
          </div>

          <h1 className="mt-5 font-display text-[36px] leading-[1.1] md:text-[44px]">{product.name}</h1>

          {aggregate.count > 0 && (
            <div className="mt-3">
              <RatingStars avg={aggregate.avg} count={aggregate.count} size="md" />
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-[28px] leading-none">{formatINR(displayPrice)}</span>
            {onSale && (
              <>
                <span className="text-[15px] text-ink-muted line-through">
                  {formatINR(product.basePrice)}
                </span>
                <span className="chip-maroon">Save {salePct}%</span>
              </>
            )}
          </div>
          <p className="mt-1.5 text-[12px] text-ink-muted">Inclusive of all taxes · Free shipping on orders ₹5,000+</p>

          <Ornament className="mt-6 h-4 w-40" tone="gold" />

          <p className="mt-6 whitespace-pre-line text-[15px] leading-[1.75] text-ink-soft">
            {product.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-y-5 border-y border-border/70 py-6 text-sm">
            <div>
              <dt className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">Length</dt>
              <dd className="mt-1.5 text-[14px]">{product.lengthMeters} m</dd>
            </div>
            <div>
              <dt className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">Blouse Piece</dt>
              <dd className="mt-1.5 text-[14px]">{product.blousePieceIncluded ? "Included" : "Not included"}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">Fabric</dt>
              <dd className="mt-1.5 text-[14px] capitalize">{product.fabric}</dd>
            </div>
            <div>
              <dt className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">Weave</dt>
              <dd className="mt-1.5 text-[14px] capitalize">{product.weave}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[10.5px] uppercase tracking-widest2 text-ink-muted">Care</dt>
              <dd className="mt-1.5 text-[14px]">{product.careInstructions}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <DeliveryChecker subtotalPaise={displayPrice} />

          <div className="mt-8 grid grid-cols-3 gap-4 rounded-card border border-border/70 bg-cream-warm/40 p-4 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest2 text-ink-muted">Ships in</p>
              <p className="mt-1 text-[13px] font-medium">3–5 days</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest2 text-ink-muted">Returns</p>
              <p className="mt-1 text-[13px] font-medium">7-day easy</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest2 text-ink-muted">Handloom</p>
              <p className="mt-1 text-[13px] font-medium">Mark certified</p>
            </div>
          </div>

          <div className="mt-6">
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

      <QuestionsSection
        productSlug={product.slug}
        questions={questions}
        signedIn={!!session}
      />

      {others.length > 0 && (
        <section className="mt-24 border-t border-border/70 pt-14">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Continue browsing</p>
              <h2 className="mt-2 font-display text-[28px]">You may also like</h2>
            </div>
            {category && (
              <Link href={`/category/${category.slug}`} className="link-underline text-[13px] uppercase tracking-widest2">
                More in {category.name} →
              </Link>
            )}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {others.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
