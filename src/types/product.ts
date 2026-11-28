export type Fabric =
  | "silk"
  | "cotton"
  | "silk-cotton"
  | "linen"
  | "georgette"
  | "chiffon"
  | "organza"
  | "crepe"
  | "tissue";

// Weave was originally a strict union; it is now an admin-managed "Catalog"
// taxonomy. Values are the slugs stored in the `catalogs` collection — the
// legacy union members (kanchivaram, banarasi, etc.) remain valid alongside
// new entries added via /admin/catalogs.
export type Weave = string;

export type Occasion = "bridal" | "festive" | "party" | "daily" | "office" | "casual";

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort: number;
}

export interface Variant {
  id: string;
  productId: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  priceOverride?: number;
  images: ProductImage[];
}

/**
 * Admin-configured size options for a product. Sizes are product-level metadata
 * (not variant-level inventory) — the customer picks a colour-variant AND a size
 * independently, and the chosen size is snapshotted on the order item. Stock
 * continues to live on Variant, matching the existing unstitched-saree model.
 */
export interface ProductSize {
  label: string;
  enabled: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  salePrice?: number;
  fabric: Fabric;
  weave: Weave;
  occasion: Occasion[];
  lengthMeters: number;
  blousePieceIncluded: boolean;
  careInstructions: string;
  categoryId: string;
  images: ProductImage[];
  variants: Variant[];
  /** Admin-defined size options. Empty / undefined = size selection not required. */
  sizes?: ProductSize[];
  featured: boolean;
  published: boolean;
  // Admin-controlled display order within the category. Lower = shown earlier on the
  // customer-facing category grid. Undefined = oldest products first (createdAt fallback).
  sort?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductSummary = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "basePrice"
  | "salePrice"
  | "fabric"
  | "weave"
  | "occasion"
  | "images"
  | "categoryId"
  | "featured"
> & {
  lengthMeters?: number;
  blousePieceIncluded?: boolean;
  defaultVariantId?: string;
  variants?: Variant[];
  // Surfaced so client-side sorts ("New Arrivals", "Recently added") can key
  // off real data instead of silently comparing undefined vs undefined.
  createdAt?: string;
};

export interface ProductQuery {
  q?: string;
  category?: string;
  fabric?: Fabric[];
  weave?: Weave[];
  occasion?: Occasion[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "featured";
  page?: number;
  perPage?: number;
  includeOutOfStock?: boolean;
}
