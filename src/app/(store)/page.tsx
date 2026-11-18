import type { Metadata } from "next";
import { StitchHero } from "@/components/home/StitchHero";
import { StitchTrustHighlights } from "@/components/home/StitchTrustHighlights";
import { StitchWeaveFamilies } from "@/components/home/StitchWeaveFamilies";
import { StitchThisWeeksWeave } from "@/components/home/StitchThisWeeksWeave";
import { StitchSareeCareBanner } from "@/components/home/StitchSareeCareBanner";
import { catalogRepo, productRepo } from "@/server/repositories";

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
  const [{ items: allProducts }, facets, catalogs, fallbackImageBySlug] = await Promise.all([
    productRepo.list({ perPage: 80 }),
    productRepo.getAvailableFacets(),
    catalogRepo.list(),
    productRepo.getCatalogFallbackImages()
  ]);

  const facetCountBySlug = new Map(facets.weaves.map((w) => [w.id.toLowerCase(), w.count]));
  const tileCatalogs = catalogs
    .filter((c) => (facetCountBySlug.get(c.slug.toLowerCase()) ?? 0) > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      imageUrl: c.imageUrl,
      count: facetCountBySlug.get(c.slug.toLowerCase()) ?? 0
    }));

  return (
    <div className="flex w-full flex-col bg-[#faf7fd] text-slate-800">
      <StitchHero />
      <StitchTrustHighlights />
      <StitchWeaveFamilies catalogs={tileCatalogs} fallbackImageBySlug={fallbackImageBySlug} />
      <StitchThisWeeksWeave products={allProducts} />
      <StitchSareeCareBanner />
    </div>
  );
}
