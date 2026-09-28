import { heroSlideRepo } from "@/server/repositories";
import type { HeroSlide } from "@/types/hero-slide";
import { HeroSlider } from "./HeroSlider";

const FALLBACK: HeroSlide[] = [
  {
    id: "fallback",
    imageUrl: "https://picsum.photos/seed/nesavalan-hero-loom/2000/1200",
    imageAlt: "Master weaver at the loom",
    eyebrow: "Est. from the looms of India",
    headline: "The saree,",
    headlineItalic: "unhurried.",
    subheadline:
      "Handloomed by artisans from Kanchipuram to Bishnupur — every drape carries the fingerprint of a weaver, the temper of a region, and a lineage older than the mill.",
    ctaPrimaryLabel: "Shop the collection",
    ctaPrimaryHref: "/products",
    ctaSecondaryLabel: "The Bridal Edit",
    ctaSecondaryHref: "/category/bridal-sarees",
    featureImageUrl: "https://picsum.photos/seed/nesavalan-hero-drape/900/1200",
    featureImageAlt: "Kanjivaram drape",
    featureEyebrow: "Featured weave",
    featureTitle: "Kanjivaram Rose Gold",
    featureSubtitle: "Kanchipuram · Pure zari",
    sort: 0,
    active: true
  }
];

export async function Hero() {
  const slides = await heroSlideRepo.listActive();
  const list = slides.length > 0 ? slides : FALLBACK;
  return <HeroSlider slides={list} />;
}
