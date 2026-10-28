"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, Search, AlertCircle, Check } from "lucide-react";
import type { Catalog } from "@/types/catalog";
import { deleteCatalog, upsertCatalog } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type Draft = {
  id?: string;
  name: string;
  slug: string;
  sort: number | string;
};

const emptyDraft: Draft = { name: "", slug: "", sort: 0 };

export function CatalogManager({ catalogs }: { catalogs: Catalog[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    if (!n) return catalogs;
    return catalogs.filter(
      (c) => c.name.toLowerCase().includes(n) || c.slug.toLowerCase().includes(n)
    );
  }, [catalogs, search]);

  const activeCount = catalogs.filter((c) => !c.legacy).length;
  const legacyCount = catalogs.length - activeCount;

  const save = () => {
    if (!draft) return;
    setBanner(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await upsertCatalog({
        id: draft.id,
        name: draft.name,
        slug: draft.slug || undefined,
        sort: draft.sort as unknown as number
      });
      if (res.ok) {
        setDraft(null);
        setSuccessMsg(`Catalog "${draft.name}" saved.`);
        router.refresh();
      } else {
        setBanner(res.issues ? Object.values(res.issues).flat()[0] ?? res.error : res.error);
      }
    });
  };

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete catalog "${name}"? Any products still tagged with it will keep the slug but it'll stop appearing in menus.`)) return;
    startTransition(async () => {
      const res = await deleteCatalog(id);
      if (res.ok) {
        setSuccessMsg(`Catalog "${name}" deleted.`);
        router.refresh();
      } else {
        setBanner(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div className="flex items-center gap-2 rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-card border border-moss/40 bg-moss/10 p-3 text-sm text-moss">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
        <span className="rounded-full bg-ink/5 px-2.5 py-1">
          Active catalogs: <strong className="text-ink">{activeCount}</strong>
        </span>
        <span className="rounded-full bg-ink/5 px-2.5 py-1">
          Legacy (from old Weave list): <strong className="text-ink">{legacyCount}</strong>
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalogs by name or slug…"
            className="w-full rounded-card border border-border bg-cream py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        {!draft && (
          <button
            type="button"
            onClick={() => setDraft({ ...emptyDraft })}
            className="btn-primary inline-flex shrink-0 items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> New catalog
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-card border border-border bg-cream shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-border/80 bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
            <tr>
              <th className="p-3">Catalog</th>
              <th className="p-3">Slug</th>
              <th className="p-3 text-center">Sort</th>
              <th className="p-3 text-center">Legacy</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.map((c) => (
              <tr key={c.id} className="transition hover:bg-cream-warm/30">
                <td className="p-3">
                  <span className="font-medium text-ink">{c.name}</span>
                </td>
                <td className="p-3 font-mono text-xs text-ink-muted">?weave={c.slug}</td>
                <td className="p-3 text-center text-xs font-medium text-ink">{c.sort}</td>
                <td className="p-3 text-center">
                  {c.legacy ? (
                    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-widest text-ink-muted">
                      Legacy
                    </span>
                  ) : (
                    <span className="text-ink-muted/40">—</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        sort: c.sort
                      })
                    }
                    className="mr-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c.id, c.name)}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-maroon hover:bg-maroon/10 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-ink-muted">
                  {catalogs.length === 0 ? "No catalogs yet." : "No matching catalogs."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="rounded-card border-2 border-maroon/30 bg-cream p-6 shadow-elev">
          <div className="mb-5 flex items-center justify-between border-b border-border/80 pb-3">
            <div>
              <h3 className="font-display text-xl text-ink">
                {draft.id ? `Edit Catalog: ${draft.name}` : "Create New Catalog"}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">
                A catalog groups a saree family (e.g. &ldquo;Kalyani Silk Cotton&rdquo;). It appears
                in product dropdowns, filters and the main menu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-full p-1.5 text-ink-muted hover:bg-ink/5 hover:text-ink"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                Catalog Name *
              </span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Kalyani Silk Cotton"
                className={inputCls}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                Slug (URL)
              </span>
              <input
                value={draft.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                placeholder="auto-generated from name"
                className={inputCls}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                Sort
              </span>
              <input
                type="number"
                value={draft.sort}
                onChange={(e) => setDraft({ ...draft, sort: e.target.value })}
                className={inputCls}
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-border/80 pt-4">
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={pending} className="btn-primary">
              {pending ? "Saving…" : "Save Catalog"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-card border border-border bg-cream px-3 py-2 text-sm text-ink outline-none transition focus:border-ink";
