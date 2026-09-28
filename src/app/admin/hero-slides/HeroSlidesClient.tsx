"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { HeroSlide } from "@/types/hero-slide";
import { HeroSlideForm } from "@/components/admin/HeroSlideForm";
import { deleteHeroSlide, toggleHeroSlideActive } from "@/features/admin/actions";

export function HeroSlidesClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

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
            {initialSlides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-muted">
                  No slides yet. Create one to populate the homepage banner.
                </td>
              </tr>
            ) : (
              initialSlides.map((s) => (
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
