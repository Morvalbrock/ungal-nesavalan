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
  region: string;
  lengthMeters: number;
  blousePieceIncluded: boolean;
  careInstructions: string;
  categoryId: string;
  images: ProductImage[];
  variants: Variant[];
  featured: boolean;
  published: boolean;
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
>;

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
