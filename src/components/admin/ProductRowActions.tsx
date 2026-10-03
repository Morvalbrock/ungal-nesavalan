"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { MoreHorizontal, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import {
  deleteProduct,
  toggleProductFeatured,
  toggleProductPublished
} from "@/features/admin/actions";
import { ConfirmModal } from "./ConfirmModal";

export interface ProductRowActionsProps {
  productId: string;
  productName: string;
  published: boolean;
  featured: boolean;
}

export function ProductRowActions({
  productId,
  productName,
  published,
  featured
}: ProductRowActionsProps) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doToggle(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "failed");
      setOpen(false);
    });
  }

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (!res.ok) {
        setError(res.error ?? "failed");
        return;
      }
      setConfirmDelete(false);
      setOpen(false);
    });
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-card p-2 text-ink-muted hover:bg-ink/5 hover:text-ink"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${productName}`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-card border border-border bg-cream shadow-elev"
          >
            <Link
              href={`/admin/products/${productId}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5"
              role="menuitem"
            >
              <Edit className="h-3.5 w-3.5" /> Edit
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => doToggle(() => toggleProductPublished(productId, !published))}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5 disabled:opacity-50"
              role="menuitem"
            >
              {published ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Set as Draft
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" /> Set as Live
                </>
              )}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => doToggle(() => toggleProductFeatured(productId, !featured))}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-ink/5 disabled:opacity-50"
              role="menuitem"
            >
              <Star className={`h-3.5 w-3.5 ${featured ? "fill-gold text-gold" : ""}`} />
              {featured ? "Unfeature" : "Feature"}
            </button>
            <div className="border-t border-border/70" />
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setConfirmDelete(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-maroon hover:bg-maroon/5 disabled:opacity-50"
              role="menuitem"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmDelete}
        title="Delete product?"
        body={`"${productName}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        busy={pending}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {error && (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap rounded bg-maroon/10 px-2 py-1 text-xs text-maroon">
          {error}
        </p>
      )}
    </div>
  );
}
