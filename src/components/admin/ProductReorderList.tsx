"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { GripVertical, ChevronsUp, ChevronsDown } from "lucide-react";
import { reorderCatalogProducts } from "@/features/admin/actions";
import { formatINR } from "@/lib/utils";

export interface ReorderableProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  priceDisplayPaise: number;
  published: boolean;
}

export function ProductReorderList({
  catalogSlug,
  catalogName,
  initialProducts
}: {
  catalogSlug: string;
  catalogName: string;
  initialProducts: ReorderableProduct[];
}) {
  const [items, setItems] = useState(initialProducts);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const dirty = items.some((p, i) => p.id !== initialProducts[i]?.id);

  const onDragStart = (i: number) => (e: React.DragEvent) => {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
    // Firefox requires setData for drag to initialise.
    e.dataTransfer.setData("text/plain", String(i));
  };

  const onDragOver = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (i !== overIndex) setOverIndex(i);
  };

  const onDrop = (i: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex == null || dragIndex === i) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = items.slice();
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    setItems(next);
    setDragIndex(null);
    setOverIndex(null);
    setMessage(null);
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const nudge = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = items.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    setMessage(null);
  };

  const moveToTop = (from: number) => nudge(from, 0);
  const moveToBottom = (from: number) => nudge(from, items.length - 1);

  const onSave = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await reorderCatalogProducts(
        catalogSlug,
        items.map((p) => p.id)
      );
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      setMessage(`Saved — ${items.length} products reordered.`);
    });
  };

  const onReset = () => {
    setItems(initialProducts);
    setMessage(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-cream p-4">
        <div className="text-sm">
          <p className="font-medium">
            Reordering: <span className="text-maroon">{catalogName}</span>
          </p>
          <p className="text-xs text-ink-muted">
            Drag the handle, nudge with ↑ / ↓, or jump with ⇑ / ⇓ (to top / to bottom). Top of this list shows first to customers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              disabled={pending}
              className="btn-ghost text-xs"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={pending || !dirty}
            className="btn-primary text-xs disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-card border border-border bg-cream-warm/60 px-4 py-2 text-xs text-ink-soft">
          {message}
        </div>
      )}

      <ul className="divide-y divide-border/60 rounded-card border border-border bg-cream">
        {items.map((p, i) => {
          const isDragging = dragIndex === i;
          const isOver = overIndex === i && dragIndex !== null && dragIndex !== i;
          return (
            <li
              key={p.id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDrop={onDrop(i)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 p-3 transition ${
                isDragging ? "opacity-40" : ""
              } ${isOver ? "bg-gold/5 ring-1 ring-gold/40" : ""}`}
            >
              <span
                className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center text-ink-muted hover:text-ink active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <span className="w-8 shrink-0 text-center text-xs font-medium text-ink-muted">
                {i + 1}
              </span>
              {p.imageUrl ? (
                <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-cream-warm">
                  <Image src={p.imageUrl} alt={p.name} fill sizes="60px" className="object-cover" />
                </div>
              ) : (
                <div className="h-12 w-9 shrink-0 rounded bg-cream-warm" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-ink-muted">
                  {formatINR(p.priceDisplayPaise)}
                  {!p.published && (
                    <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-[9px] uppercase tracking-widest">
                      Draft
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveToTop(i)}
                  disabled={i === 0 || pending}
                  className="rounded border border-border p-1 text-ink-soft hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label="Move to top"
                  title="Move to top"
                >
                  <ChevronsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => nudge(i, i - 1)}
                  disabled={i === 0 || pending}
                  className="rounded border border-border px-2 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label="Move up one"
                  title="Move up one"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => nudge(i, i + 1)}
                  disabled={i === items.length - 1 || pending}
                  className="rounded border border-border px-2 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label="Move down one"
                  title="Move down one"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => moveToBottom(i)}
                  disabled={i === items.length - 1 || pending}
                  className="rounded border border-border p-1 text-ink-soft hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label="Move to bottom"
                  title="Move to bottom"
                >
                  <ChevronsDown className="h-3.5 w-3.5" />
                </button>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="ml-1 text-xs text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="p-6 text-center text-sm text-ink-muted">
            No products in this category yet.
          </li>
        )}
      </ul>
    </div>
  );
}
