import type { Metadata } from "next";
import { StitchHero } from "@/components/home/StitchHero";
import { StitchTrustHighlights } from "@/components/home/StitchTrustHighlights";
import { StitchWeaveFamilies } from "@/components/home/StitchWeaveFamilies";
import { StitchThisWeeksWeave } from "@/components/home/StitchThisWeeksWeave";
import { StitchSareeCareBanner } from "@/components/home/StitchSareeCareBanner";
import { catalogRepo, categoryRepo, heroSlideRepo, productRepo, reviewRepo } from "@/server/repositories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ungal Nesavalan — Authentic Elampillai Handloom Sarees",
  description:
    "Silk-cotton and pure soft silk sarees woven on our own looms in Elampillai, Salem District, Tamil Nadu. Pure handloom, own manufacturing, direct weaver pricing.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ungal Nesavalan — Authentic Elampillai Handloom Sarees",
    description:
      "Direct from our Elampillai pit-looms. Explore Kalyani Silk Cotton, Aarani Soft Silk, and Maheshwari Handlooms at direct weaver rates.",
    url: "/",
    type: "website"
  }
};

export default async function HomePage() {
  const [
    { items: allProducts },
    facets,
    catalogs,
    fallbackImageBySlug,
    heroSlides,
    categories
  ] = await Promise.all([
    productRepo.list({ perPage: 80 }),
    productRepo.getAvailableFacets(),
    catalogRepo.list(),
    productRepo.getCatalogFallbackImages(),
    heroSlideRepo.listActive(),
    categoryRepo.list()
  ]);

  const facetCountBySlug = new Map(facets.weaves.map((w) => [w.id.toLowerCase(), w.count]));

  // Lowest effective price per catalog (weave) slug, so the tile "From ₹X" reflects
  // actual admin-managed product prices instead of a hardcoded preset. Matches the
  // product card's price chain: variant.priceOverride ?? salePrice ?? basePrice.
  const minPricePaiseBySlug = new Map<string, number>();
  for (const p of allProducts) {
    const key = p.weave?.toLowerCase();
    if (!key) continue;
    const headline = p.salePrice ?? p.basePrice;
    const variantPrices = (p.variants ?? [])
      .map((v) => v.priceOverride)
      .filter((x): x is number => typeof x === "number");
    const productMin = Math.min(headline, ...variantPrices);
    const current = minPricePaiseBySlug.get(key);
    if (current == null || productMin < current) minPricePaiseBySlug.set(key, productMin);
  }

  const tileCatalogs = catalogs
    .filter((c) => (facetCountBySlug.get(c.slug.toLowerCase()) ?? 0) > 0 || Boolean(c.imageUrl))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      imageUrl: c.imageUrl,
      count: facetCountBySlug.get(c.slug.toLowerCase()) ?? 0,
      sort: c.sort,
      minPricePaise: minPricePaiseBySlug.get(c.slug.toLowerCase())
    }));

  // Resolve each hero slide's linked product (if any) so the hero's quick-view
  // modal can open with real admin-managed data instead of hardcoded demo copy.
  // Unique slugs only, to avoid N duplicate reads across the collection.
  const slideProductSlugs = Array.from(
    new Set(
      heroSlides
        .map((s) => s.featureProductSlug?.trim())
        .filter((s): s is string => Boolean(s))
    )
  );
  const resolvedFeatureProducts = await Promise.all(
    slideProductSlugs.map((slug) => productRepo.findBySlug(slug))
  );
  const featureProductsBySlideId: Record<string, NonNullable<(typeof resolvedFeatureProducts)[number]>> = {};
  for (const slide of heroSlides) {
    const slug = slide.featureProductSlug?.trim();
    if (!slug) continue;
    const idx = slideProductSlugs.indexOf(slug);
    const product = resolvedFeatureProducts[idx];
    if (product) featureProductsBySlideId[slide.id] = product;
  }

  // Review aggregates for the sampled products powering the "This Week's Weave"
  // section. Rows with count=0 are kept so the component can render "no reviews yet"
  // instead of a fabricated 4.9⭐/48. Same pattern as /products and /category/[slug].
  const productRatings = await reviewRepo.aggregateForMany(allProducts.map((p) => p.id));

  return (
    <div className="flex w-full flex-col bg-[#faf7fd] text-slate-800">
      <StitchHero slides={heroSlides} featureProducts={featureProductsBySlideId} />
      <StitchTrustHighlights />
      <StitchWeaveFamilies
        catalogs={tileCatalogs}
        categories={categories}
        fallbackImageBySlug={fallbackImageBySlug}
      />
      <StitchThisWeeksWeave products={allProducts} ratings={productRatings} />
      <StitchSareeCareBanner />
    </div>
  );
}
