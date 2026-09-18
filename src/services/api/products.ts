import { apiGet } from "./client";
import type { Product } from "@/types/product";

export interface ProductQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export function getProducts(query?: ProductQuery) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  return apiGet<Product[]>(`/products?${params.toString()}`);
}
