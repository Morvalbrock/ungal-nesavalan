import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Hero } from "@/components/home/Hero";
import { UspStrip } from "@/components/home/UspStrip";
import { SectionHeading } from "@/components/home/SectionHeading";
import { CategoryMosaic } from "@/components/home/CategoryMosaic";
import { WeaverStory } from "@/components/home/WeaverStory";
import { Testimonials } from "@/components/home/Testimonials";
import { JournalPreview } from "@/components/home/JournalPreview";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { NewsletterCta } from "@/components/home/NewsletterCta";
import { FeaturedRail } from "@/components/home/FeaturedRail";
import { HeritageStrip } from "@/components/home/HeritageStrip";
import { productRepo, categoryRepo } from "@/server/repositories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ungal Nesavalan — Handwoven Sarees, Loomed by Hand",
  description:
    "Discover Kanjivaram, Banarasi, Chanderi, Patola, Uppada and more — handloom sarees sourced directly from master weavers across India. Free shipping on orders above ₹5,000.",
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
  const [featured, bridal, newest, categories] = await Promise.all([
    productRepo.featured(8),
    productRepo.list({ category: "cat_bridal", perPage: 4, sort: "featured" }),
    productRepo.list({ sort: "newest", perPage: 4 }),
    categoryRepo.list()
  ]);

  return (
    <>
      <Hero />
      <UspStrip />

      <FeaturedRail
        products={featured}
        eyebrow="Curator's selection"
        title="Featured drapes"
        subtitle="A rotating shortlist from the studio — chosen for weave, story and season."
        href="/products"
      />

      <section className="border-t border-border/60 bg-cream-warm/50 py-24">
        <Container>
          <SectionHeading
            eyebrow="Shop by weave"
            title="Explore the collection"
            subtitle="From the pit looms of Kanchipuram to the jala looms of Bishnupur — each collection is a region, a story, a rhythm of the shuttle."
          />
          <div className="mt-14">
            <CategoryMosaic categories={categories} />
          </div>
        </Container>
      </section>

      <WeaverStory />

      <FeaturedRail
        products={bridal.items}
        eyebrow="For the biggest day"
        title="The Bridal Edit"
        subtitle="Kanjivaram, Banarasi, Baluchari — bridal drapes with room in the border for a lineage."
        href="/category/bridal-sarees"
        tone="warm"
      />

      <HeritageStrip />

      <FeaturedRail
        products={newest.items}
        eyebrow="Off the loom"
        title="New arrivals"
        subtitle="This month's drapes, freshly cut from the beam."
        href="/products?sort=newest"
      />

      <Testimonials />

      <JournalPreview />

      <InstagramGrid />

      <NewsletterCta />
    </>
  );
}
