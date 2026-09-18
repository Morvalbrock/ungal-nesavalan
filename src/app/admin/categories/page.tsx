import { CategoryManager } from "@/components/admin/CategoryManager";
import { categoryRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await categoryRepo.list();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Catalog</p>
        <h1 className="mt-2 font-display text-3xl">Categories</h1>
      </header>
      <CategoryManager categories={categories} />
    </div>
  );
}
