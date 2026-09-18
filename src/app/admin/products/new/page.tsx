import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { categoryRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await categoryRepo.list();
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/products" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Products
        </Link>
        <h1 className="mt-2 font-display text-3xl">New product</h1>
      </header>
      <ProductForm categories={categories} />
    </div>
  );
}
