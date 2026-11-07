import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProvenanceStatsBar } from "@/components/home/ProvenanceStatsBar";
import { HeirloomGallery } from "@/components/home/HeirloomGallery";
import { BridalSpotlight } from "@/components/home/BridalSpotlight";
import { DirectFromLooms } from "@/components/home/DirectFromLooms";
import { PatronReflections } from "@/components/home/PatronReflections";
import { TrustAccreditations } from "@/components/home/TrustAccreditations";
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

  // Cross-reference admin-managed catalogs with the live facet counts so we only
  // surface catalogs that actually have in-stock products, and so the chips carry
  // the catalog's proper display name rather than a derived label. catalogRepo.list()
  // already sorts non-legacy entries first, so legacy catalogs land at the end.
  const facetCountBySlug = new Map(facets.weaves.map((w) => [w.id.toLowerCase(), w.count]));
  const catalogChips = catalogs
    .filter((c) => (facetCountBySlug.get(c.slug.toLowerCase()) ?? 0) > 0)
    .map((c) => ({
      id: c.slug.toLowerCase(),
      label: c.name,
      count: facetCountBySlug.get(c.slug.toLowerCase()) ?? 0
    }));

  return (
    <div className="flex flex-col w-full bg-[#FBF9F5]">
      {/* 1. DYNAMIC BANNER / HERO SECTION (Admin Controlled) */}
      <Hero />

      {/* 2. PROVENANCE GUILD STATS BAR */}
      <ProvenanceStatsBar />

      {/* 3. CURATED WEAVE CLUSTERS & THE HEIRLOOM GALLERY SHOWCASE */}
      <HeirloomGallery products={featured} availableWeaves={catalogChips} />

      {/* 4. COUTURE SPOTLIGHT: THE BRIDAL ATELIER & MASTERCRAFT */}
      <BridalSpotlight />

      {/* 5. HERITAGE STORYTELLING: DIRECT FROM OUR LOOMS */}
      <DirectFromLooms />

      {/* 6. PATRON REFLECTIONS (5-STAR EDITORIAL REVIEWS) */}
      <PatronReflections />

      {/* 7. TRUST & HERITAGE ACCREDITATIONS BAR */}
      <TrustAccreditations />
    </div>
  );
}
