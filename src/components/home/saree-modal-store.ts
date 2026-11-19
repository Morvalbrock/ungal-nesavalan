import { create } from "zustand";

export interface SareeDetailData {
  productId?: string;
  slug?: string;
  title: string;
  price: string;
  // Only set when the product is genuinely on sale — the modal hides the
  // strikethrough and discount badge otherwise, so we never fabricate a
  // "₹750 ~~₹750~~ 35% OFF" display for a product with no sale price.
  originalPrice?: string;
  discount?: string;
  imageUrl: string;
  badge: string;
  rating?: number;
  reviewCount?: number;
  weave?: string;
  fabric?: string;
  length?: string;
  // When provided, the modal decides blouse-piece copy from the boolean and ignores
  // the free-text suffix in `length`. Omit entirely from legacy/static callers to
  // keep their existing display text intact.
  blousePieceIncluded?: boolean;
  borderWork?: string;
  weaver?: string;
  thumbnails?: string[];
}

interface SareeModalStore {
  isOpen: boolean;
  saree: SareeDetailData | null;
  open: (saree: SareeDetailData) => void;
  close: () => void;
}

const DEFAULT_SAREE: SareeDetailData = {
  productId: "aarani-soft-silk-default",
  slug: "royal-violet-aarani-soft-silk-saree",
  title: "Royal Violet Aarani Soft Silk Saree with Pure Zari Border",
  price: "₹750",
  originalPrice: "₹1,299",
  discount: "35% OFF",
  imageUrl:
    "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg",
  badge: "Aarani Soft Silk",
  rating: 4.9,
  reviewCount: 96,
  weave: "Authentic Elampillai Pit-loom",
  fabric: "Pure Mulberry Soft Silk blend",
  length: "6.2 Meters with Blouse Piece",
  borderWork: "Traditional Floral Peacock Zari Tissue",
  weaver: "Master Weaver Selvam & Family (Loom #42, Elampillai)",
  thumbnails: [
    "https://res.cloudinary.com/khxbcqk3/image/upload/v1792828212/ungal-nesavalan/products/qykhe6ausxa7gskreldn.jpg"
  ]
};

export const useSareeModalStore = create<SareeModalStore>((set) => ({
  isOpen: false,
  saree: DEFAULT_SAREE,
  open: (saree) => set({ isOpen: true, saree }),
  close: () => set({ isOpen: false })
}));
