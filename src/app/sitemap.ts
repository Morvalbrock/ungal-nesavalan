import type { MetadataRoute } from "next";
import { categoryRepo, productRepo } from "@/server/repositories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cats] = await Promise.all([
    productRepo.list({ perPage: 500 }),
    categoryRepo.list()
  ]);
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 }
  ];

  for (const c of cats) {
    routes.push({
      url: `${BASE}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    });
  }

  for (const p of products.items) {
    routes.push({
      url: `${BASE}/products/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8
    });
  }

  return routes;
}
