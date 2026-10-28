import { CatalogManager } from "@/components/admin/CatalogManager";
import { catalogRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function AdminCatalogsPage() {
  const catalogs = await catalogRepo.list();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Catalog taxonomy</p>
        <h1 className="mt-2 font-display text-3xl">Catalogs</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage the catalog list that powers the main menu, product filters, and the
          catalog dropdown on the product form. Add a new catalog whenever a new series
          is released.
        </p>
      </header>
      <CatalogManager catalogs={catalogs} />
    </div>
  );
}
