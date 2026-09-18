import type { Product } from "@/types/product";

export const demoProducts: Product[] = [
  {
    id: "1",
    name: "Kanchipuram Silk Saree",
    slug: "kanchipuram-silk-saree",
    description: "Demo product for the e-commerce starter.",
    price: 5999,
    images: [],
    category: { id: "silk", name: "Silk Sarees", slug: "silk-sarees" },
    stock: 10,
    inStock: true,
    sku: "SAREE-001",
    rating: 4.5,
    reviewCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Designer Saree",
    slug: "designer-saree",
    description: "Second demo product.",
    price: 3499,
    images: [],
    category: { id: "designer", name: "Designer Sarees", slug: "designer-sarees" },
    stock: 8,
    inStock: true,
    sku: "SAREE-002",
    rating: 4.2,
    reviewCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
