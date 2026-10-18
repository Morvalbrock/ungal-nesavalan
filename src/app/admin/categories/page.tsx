import { CategoryManager } from "@/components/admin/CategoryManager";
import { categoryRepo, pageBannerRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, pageBanners] = await Promise.all([
    categoryRepo.list(),
    pageBannerRepo.list()
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Catalog & Banners</p>
        <h1 className="mt-2 font-display text-3xl">Categories & Page Headers</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage categories, category hero header images, card mosaic images, and store-wide page banners.
        </p>
      </header>
      <CategoryManager categories={categories} initialPageBanners={pageBanners} />
    </div>
  );
}
