import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ShopByCategoryGrid } from "@/components/home/ShopByCategoryGrid";
import { NewArrivalsRail } from "@/components/home/NewArrivalsRail";
import { BrandStoryBlock } from "@/components/home/BrandStoryBlock";
import { catalogRepo, productRepo } from "@/server/repositories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ungal Nesavalan — Direct from Our Elampillai Looms",
  description:
    "Silk-cotton sarees woven on our own looms in Elampillai, Tamil Nadu. Own manufacturing, pure handloom, complimentary insured delivery.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ungal Nesavalan — Direct from Our Elampillai Looms",
    description:
      "Elampillai silk-cotton sarees crafted on our own looms in Tamil Nadu. Pure handloom, own manufacturing, honest pricing.",
    url: "/",
    type: "website"
  }
};

export default async function HomePage() {
  const [featured, facets, catalogs] = await Promise.all([
    productRepo.featured(16),
    productRepo.getAvailableFacets(),
    catalogRepo.list()
  ]);

  // Cross-reference admin-managed catalogs with the live facet counts so tiles only
  // appear for catalogs that actually have in-stock products. catalogRepo.list()
  // already sorts non-legacy entries first, so legacy catalogs land at the end.
  const facetCountBySlug = new Map(facets.weaves.map((w) => [w.id.toLowerCase(), w.count]));
  const tileCatalogs = catalogs
    .filter((c) => (facetCountBySlug.get(c.slug.toLowerCase()) ?? 0) > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      imageUrl: c.imageUrl,
      count: facetCountBySlug.get(c.slug.toLowerCase()) ?? 0
    }));

  // Per-weave fallback image sourced from the first featured product tagged with
  // that weave — used only when the catalog itself has no imageUrl set.
  const fallbackImageBySlug: Record<string, string> = {};
  for (const p of featured) {
    const key = p.weave?.toLowerCase();
    if (!key || fallbackImageBySlug[key]) continue;
    const img = p.images[0]?.url;
    if (img) fallbackImageBySlug[key] = img;
  }

  return (
    <div className="flex w-full flex-col bg-cream">
      <Hero />
      <ShopByCategoryGrid catalogs={tileCatalogs} fallbackImageBySlug={fallbackImageBySlug} />
      <NewArrivalsRail products={featured.slice(0, 12)} />
      <BrandStoryBlock />
    </div>
  );
}
