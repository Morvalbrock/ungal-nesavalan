"use client";
import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import type { HeroSlide } from "@/types/hero-slide";
import { HeroSlideForm } from "@/components/admin/HeroSlideForm";
import { deleteHeroSlide, toggleHeroSlideActive } from "@/features/admin/actions";

type ActiveFilter = "all" | "active" | "inactive";

export function HeroSlidesClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ActiveFilter>("all");

  const filtered = useMemo(() => {
    const n = search.trim().toLowerCase();
    return initialSlides.filter((s) => {
      if (filter === "active" && !s.active) return false;
      if (filter === "inactive" && s.active) return false;
      if (n) {
        const hay = `${s.headline} ${s.headlineItalic ?? ""} ${s.eyebrow ?? ""} ${s.ctaPrimaryLabel ?? ""}`.toLowerCase();
        if (!hay.includes(n)) return false;
      }
      return true;
    });
  }, [initialSlides, search, filter]);

  const refresh = () => {
    setEditing(null);
    setCreating(false);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Storefront</p>
          <h1 className="mt-2 font-display text-3xl">Hero slides</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Slides shown in the homepage banner carousel. Sort order controls sequence. Inactive slides are hidden.
          </p>
        </div>
        {!creating && !editing && (
          <button type="button" onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> New slide
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by headline, eyebrow, CTA…"
            className="w-full rounded-card border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="uppercase tracking-widest">Status</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActiveFilter)}
            className="rounded-card border border-border bg-white px-2 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {creating && <HeroSlideForm onSaved={refresh} onCancel={() => setCreating(false)} />}
      {editing && (
        <HeroSlideForm slide={editing} onSaved={refresh} onCancel={() => setEditing(null)} />
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="min-w-full divide-y divide-border/70 text-sm">
          <thead className="bg-cream-warm text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-left">Preview</th>
              <th className="px-4 py-3 text-left">Headline</th>
              <th className="px-4 py-3 text-left">Primary CTA</th>
              <th className="px-4 py-3 text-left">Sort</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  {initialSlides.length === 0
                    ? "No slides yet. Create one to populate the homepage banner."
                    : "No slides match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-24 overflow-hidden rounded-card bg-cream-warm">
                      {s.imageUrl && (
                        <Image
                          src={s.imageUrl}
                          alt={s.imageAlt || s.headline}
                          fill
                          sizes="96px"
                          className="object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {s.headline}{" "}
                      {s.headlineItalic && <span className="italic text-ink-muted">{s.headlineItalic}</span>}
                    </p>
                    {s.eyebrow && (
                      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-muted">{s.eyebrow}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {s.ctaPrimaryLabel ? (
                      <span>
                        {s.ctaPrimaryLabel} <span className="text-ink-muted/60">→ {s.ctaPrimaryHref}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{s.sort}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await toggleHeroSlideActive(s.id, !s.active);
                          router.refresh();
                        })
                      }
                      className={
                        s.active
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                          : "rounded-full bg-border/70 px-2 py-0.5 text-xs text-ink-muted"
                      }
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        className="inline-flex items-center gap-1 rounded-card border border-border px-2.5 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Delete slide "${s.headline}"? This cannot be undone.`)) return;
                          startTransition(async () => {
                            await deleteHeroSlide(s.id);
                            router.refresh();
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-card border border-border px-2.5 py-1 text-xs text-maroon hover:border-maroon hover:bg-maroon/5"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
