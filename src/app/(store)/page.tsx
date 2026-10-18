import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProvenanceStatsBar } from "@/components/home/ProvenanceStatsBar";
import { HeirloomGallery } from "@/components/home/HeirloomGallery";
import { BridalSpotlight } from "@/components/home/BridalSpotlight";
import { DirectFromLooms } from "@/components/home/DirectFromLooms";
import { PatronReflections } from "@/components/home/PatronReflections";
import { TrustAccreditations } from "@/components/home/TrustAccreditations";
import { productRepo } from "@/server/repositories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ungal Nesavalan — Handwoven Sarees, Loomed by Hand",
  description:
    "Discover Kanjivaram, Banarasi, Chanderi, Patola, Uppada and more — handloom sarees sourced directly from master weavers across India. Complimentary insured delivery on pure zari heirlooms.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ungal Nesavalan — Handwoven Sarees",
    description:
      "Kanjivaram, Banarasi, Chanderi and more — handloom sarees sourced directly from master weavers.",
    url: "/",
    type: "website",
    images: [{ url: "https://picsum.photos/seed/hero-saree/1200/630", width: 1200, height: 630 }]
  }
};

export default async function HomePage() {
  const [featured, facets] = await Promise.all([
    productRepo.featured(16),
    productRepo.getAvailableFacets()
  ]);

  return (
    <div className="flex flex-col w-full bg-[#FBF9F5]">
      {/* 1. DYNAMIC BANNER / HERO SECTION (Admin Controlled) */}
      <Hero />

      {/* 2. PROVENANCE GUILD STATS BAR */}
      <ProvenanceStatsBar />

      {/* 3. CURATED WEAVE CLUSTERS & THE HEIRLOOM GALLERY SHOWCASE */}
      <HeirloomGallery products={featured} availableWeaves={facets.weaves} />

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
