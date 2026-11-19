export interface HeroSlide {
  id: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  headline: string;
  headlineItalic: string;
  subheadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  featureImageUrl: string;
  featureImageAlt: string;
  featureEyebrow: string;
  featureTitle: string;
  featureSubtitle: string;
  // Optional slug of a real published product. When set, clicking the hero's
  // feature card opens the quick-view modal with that product's live price,
  // weave, fabric, length, and images instead of the legacy hardcoded demo.
  featureProductSlug?: string;
  sort: number;
  active: boolean;
}
