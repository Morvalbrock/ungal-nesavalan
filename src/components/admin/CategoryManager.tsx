"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";
import type { Category } from "@/types/category";
import { deleteCategory, upsertCategory } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sort: number | string;
};

const emptyDraft: Draft = { name: "", slug: "", description: "", image: "", sort: 0 };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(n) ||
        c.slug.toLowerCase().includes(n) ||
        (c.description ?? "").toLowerCase().includes(n)
    );
  }, [categories, search]);

  const save = () => {
    if (!draft) return;
    setBanner(null);
    startTransition(async () => {
      const res = await upsertCategory({
        id: draft.id,
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description || undefined,
        image: draft.image || undefined,
        sort: draft.sort as unknown as number
      });
      if (res.ok) {
        setDraft(null);
        router.refresh();
      } else {
        setBanner(res.issues ? Object.values(res.issues).flat()[0] ?? res.error : res.error);
      }
    });
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.ok) router.refresh();
      else setBanner(res.error);
    });
  };

  return (
    <div className="space-y-4">
      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">
          {banner}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, slug, description…"
          className="w-full rounded-card border border-border bg-cream py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-cream">
        <table className="w-full text-sm">
          <thead className="bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Sort</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border/70">
                <td className="p-3">
                  <p className="font-medium">{c.name}</p>
                  {c.description && <p className="text-xs text-ink-muted">{c.description}</p>}
                </td>
                <td className="p-3 text-xs text-ink-muted">{c.slug}</td>
                <td className="p-3">{c.sort}</td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        description: c.description ?? "",
                        image: c.image ?? "",
                        sort: c.sort
                      })
                    }
                    className="mr-2 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id, c.name)}
                    className="inline-flex items-center gap-1 text-xs text-maroon hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-ink-muted">
                  {categories.length === 0 ? "No categories yet." : "No matches."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className={cn("rounded-card border border-border bg-cream p-5")}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg">{draft.id ? "Edit category" : "New category"}</h3>
            <button type="button" onClick={() => setDraft(null)} className="text-ink-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Slug (auto)</span>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Description</span>
              <input
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Image URL</span>
              <input
                value={draft.image}
                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                placeholder="https://…"
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs uppercase tracking-wider text-ink-muted">Sort order</span>
              <input
                type="number"
                value={draft.sort}
                onChange={(e) => setDraft({ ...draft, sort: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={pending} className="btn-primary">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setDraft({ ...emptyDraft })} className="btn-ghost inline-flex">
          <Plus className="h-4 w-4" /> New category
        </button>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ink";
