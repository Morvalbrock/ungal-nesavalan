export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  category: Category;
  stock: number;
  inStock: boolean;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}
