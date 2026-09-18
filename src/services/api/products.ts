import { apiGet } from "./client";
import type { Product, ProductQuery, ProductSummary } from "@/types/product";
import type { Category } from "@/types/category";

export interface ProductListResponse {
  items: ProductSummary[];
  total: number;
}

function toQueryString(query?: ProductQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function fetchProducts(query?: ProductQuery) {
  return apiGet<ProductListResponse>(`/api/products${toQueryString(query)}`);
}

export function fetchProductBySlug(slug: string) {
  return apiGet<Product>(`/api/products/${encodeURIComponent(slug)}`);
}

export function fetchCategories() {
  return apiGet<Category[]>(`/api/categories`);
}
