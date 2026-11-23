import { heroSlideRepo } from "@/server/repositories";
import type { HeroSlide } from "@/types/hero-slide";
import { HeroSlider } from "./HeroSlider";

const FALLBACK: HeroSlide[] = [
  {
    id: "lavender-royal",
    imageUrl: "/images/img.png",
    imageAlt: "Ungal Nesavalan — royal lavender & plum silk with gold zari shuttle",
    eyebrow: "Woven on our Elampillai looms",
    headline: "The saree,",
    headlineItalic: "woven in royalty.",
    subheadline:
      "Pit-loomed silks, dyed in deep purples and finished with pure zari — every drape carries the fingerprint of a weaver and the quiet patience of our pit looms.",
    ctaPrimaryLabel: "Shop the collection",
    ctaPrimaryHref: "/products",
    ctaSecondaryLabel: "The Bridal Edit",
    ctaSecondaryHref: "/category/bridal-sarees",
    featureImageUrl: "/images/img.png",
    featureImageAlt: "Royal purple weave with gold zari",
    featureEyebrow: "Lavender Signature",
    featureTitle: "Royal Plum Kanjivaram",
    featureSubtitle: "Elampillai · Pure Zari",
    sort: 0,
    active: true
  },
  {
    id: "lavender-festive",
    imageUrl: "/images/authentic_indian_handloom_silk_saree.png",
    imageAlt: "Ungal Nesavalan — pure mulberry festive silk saree",
    eyebrow: "Festive Silk Collection",
    headline: "Pure Mulberry,",
    headlineItalic: "whisper soft.",
    subheadline:
      "Featherweight drapes dyed in regal lilac, amethyst, and deep violet tones with intricate temple korvai borders for memorable celebrations.",
    ctaPrimaryLabel: "Explore Festive Silks",
    ctaPrimaryHref: "/category/silk-sarees",
    ctaSecondaryLabel: "Browse Catalogues",
    ctaSecondaryHref: "/products",
    featureImageUrl: "/images/authentic_indian_handloom_silk_saree.png",
    featureImageAlt: "Festive lavender soft silk drape",
    featureEyebrow: "Festive Edit",
    featureTitle: "Amethyst Soft Silk",
    featureSubtitle: "Pure Handloom · Contrast Pallu",
    sort: 1,
    active: true
  },
  {
    id: "lavender-cotton",
    imageUrl: "/images/elegant_south_indian.png",
    imageAlt: "Ungal Nesavalan — artisan handloom daily grace saree",
    eyebrow: "Artisan Direct · Honest Luxury",
    headline: "From Our Hands,",
    headlineItalic: "to your heritage.",
    subheadline:
      "Zero middlemen, zero showroom inflation. Handcrafted heirloom sarees delivered straight from our Elampillai master weavers to your wardrobe.",
    ctaPrimaryLabel: "Discover Daily Grace",
    ctaPrimaryHref: "/category/cotton-sarees",
    ctaSecondaryLabel: "Our Weaver Story",
    ctaSecondaryHref: "/about",
    featureImageUrl: "/images/elegant_south_indian.png",
    featureImageAlt: "Handloom cotton silk saree",
    featureEyebrow: "Heritage Weave",
    featureTitle: "Elampillai Cotton Silk",
    featureSubtitle: "Featherlight · Authentic Loom",
    sort: 2,
    active: true
  }
];

export async function Hero() {
  const slides = await heroSlideRepo.listActive();
  const list = slides.length > 0 ? slides : FALLBACK;
  return <HeroSlider slides={list} />;
}
