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
import { JsonLd } from "@/components/seo/JsonLd";
import { Ornament } from "@/components/home/Ornament";
import {
  orderRepo,
  productRepo,
  categoryRepo,
  catalogRepo,
  questionRepo,
  reviewRepo
} from "@/server/repositories";
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

  const [category, catalog, related, reviewsPage, aggregate, questions, session] = await Promise.all([
    categoryRepo.findById(product.categoryId),
    catalogRepo.findBySlug(product.weave),
    productRepo.list({ category: product.categoryId, perPage: 8 }),
    reviewRepo.listByProduct(product.id, { perPage: 10 }),
    reviewRepo.aggregateFor(product.id),
    questionRepo.listByProduct(product.id),
    getSession()
  ]);
  const catalogLabel = catalog?.name ?? product.weave;
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
    <div className="bg-[#faf7fd] min-h-screen">
      <Container className="py-6 sm:py-10">
        <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />

        <nav aria-label="Breadcrumb" className="mb-5 sm:mb-8 text-xs font-medium text-purple-900/60">
          <Link href="/" className="hover:text-brand-purple transition">Home</Link>
          <span className="mx-2 text-purple-300">/</span>
          <Link href="/products" className="hover:text-brand-purple transition">Sarees</Link>
          {category && (
            <>
              <span className="mx-2 text-purple-300">/</span>
              <Link href={`/category/${category.slug}`} className="hover:text-brand-purple transition">
                {category.name}
              </Link>
            </>
          )}
          <span className="mx-2 text-purple-300">/</span>
          <span className="text-brand-plum font-semibold">{product.name}</span>
        </nav>

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,500px)_minmax(0,1fr)] items-start">
          <div className="w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[500px] mx-auto lg:mx-0">
            <ProductGallery images={product.images} product={product} />
          </div>

          <div className="lg:pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple border border-purple-200">
                {catalogLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200/80 capitalize">
                {product.fabric}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200/80">
                Direct from Elampillai Loom
              </span>
            </div>

            <h1 className="mt-4 sm:mt-5 font-heritage font-bold text-3xl sm:text-4xl md:text-5xl text-brand-plum leading-[1.15]">
              {product.name}
            </h1>

            {aggregate.count > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <RatingStars avg={aggregate.avg} count={aggregate.count} size="md" />
                <span className="text-xs text-purple-900/60">({aggregate.count} weaver reviews)</span>
              </div>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-heritage font-bold text-3xl sm:text-4xl text-brand-plum leading-none">
                {formatINR(displayPrice)}
              </span>
              {onSale && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    {formatINR(product.basePrice)}
                  </span>
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    Save {salePct}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-1.5 text-xs text-purple-900/70 font-medium">
              Inclusive of all taxes · Free shipping across India
            </p>

            <div className="mt-6 border-t border-purple-100 pt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-plum">Weave Description</h2>
              <p className="mt-2 whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-700">
                {product.description}
              </p>
            </div>

            {/* Specifications Card */}
            <div className="mt-6 rounded-2xl border border-purple-100 bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-plum mb-3">Saree Specifications</h3>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs sm:text-sm">
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-purple-900/60">Length</dt>
                  <dd className="mt-1 font-semibold text-slate-800">{product.lengthMeters} Meters</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-purple-900/60">Blouse Piece</dt>
                  <dd className="mt-1 font-semibold text-slate-800">{product.blousePieceIncluded ? "Included with drape" : "Not included"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-purple-900/60">Fabric Type</dt>
                  <dd className="mt-1 font-semibold text-slate-800 capitalize">{product.fabric}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-purple-900/60">Weaving Heritage</dt>
                  <dd className="mt-1 font-semibold text-slate-800">{catalogLabel}</dd>
                </div>
                <div className="col-span-2 pt-2 border-t border-purple-50">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-purple-900/60">Care & Preservation</dt>
                  <dd className="mt-1 font-medium text-purple-950">{product.careInstructions}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-6">
              <PurchasePanel product={product} />
            </div>

            <DeliveryChecker />

            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-purple-100 bg-purple-50/50 p-4 text-center">
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-purple-900/70">Dispatches In</p>
                <p className="mt-1 text-sm font-bold text-brand-plum">24–48 Hours</p>
              </div>
              <div className="border-x border-purple-200/60">
                <p className="text-[11px] uppercase font-bold tracking-wider text-purple-900/70">Authenticity</p>
                <p className="mt-1 text-sm font-bold text-brand-plum">100% Handloom</p>
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-purple-900/70">Returns</p>
                <p className="mt-1 text-sm font-bold text-brand-plum">7-Day Easy</p>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-14 space-y-12">
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
        </div>

        {others.length > 0 && (
          <section className="mt-16 sm:mt-20 border-t border-purple-100 pt-10 sm:pt-14">
            <div className="flex items-end justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-brand-purple tracking-wide uppercase">
                  Related Handlooms
                </span>
                <h2 className="mt-2 font-heritage text-2xl sm:text-3xl text-brand-plum font-bold">You May Also Cherish</h2>
              </div>
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="text-xs sm:text-sm font-semibold text-brand-purple hover:text-brand-plum transition"
                >
                  Explore All {category.name} →
                </Link>
              )}
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4">
              {others.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
