"use client";

import { useState, useTransition } from "react";
import type { Announcement } from "@/types/announcement";
import { upsertAnnouncement, type AnnouncementFormValues } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

interface Props {
  announcement?: Announcement;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({ announcement, onSaved, onCancel }: Props) {
  const [text, setText] = useState(announcement?.text ?? "");
  const [link, setLink] = useState(announcement?.link ?? "");
  const [sort, setSort] = useState<number>(announcement?.sort ?? 0);
  const [active, setActive] = useState<boolean>(announcement?.active ?? true);

  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isEdit = Boolean(announcement?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssues({});
    setBanner(null);

    const values: AnnouncementFormValues = {
      id: announcement?.id,
      text: text.trim(),
      link: link.trim(),
      sort: Number(sort) || 0,
      active
    };

    startTransition(async () => {
      const res = await upsertAnnouncement(values);
      if (!res.ok) {
        if (res.issues) setIssues(res.issues);
        setBanner(res.error || "Failed to save announcement");
        return;
      }
      onSaved?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-card border border-border bg-cream p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div>
          <h2 className="font-display text-xl text-ink">
            {isEdit ? "Edit announcement" : "New announcement"}
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Configure the moving ticker message shown at the top of the storefront.
          </p>
        </div>
      </div>

      {banner && (
        <div className="rounded-card border border-maroon/30 bg-maroon/5 p-3 text-sm text-maroon">
          {banner}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-ink">
            Announcement message <span className="text-maroon">*</span>
          </label>
          <input
            type="text"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Free shipping across Tamil Nadu"
            className={cn(
              "mt-1.5 w-full rounded-card border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none",
              issues.text ? "border-maroon" : "border-border"
            )}
          />
          {issues.text && (
            <p className="mt-1 text-xs text-maroon">{issues.text.join(", ")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-ink">
              Link destination (optional)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. /products or /category/bridal-sarees"
              className="mt-1.5 w-full rounded-card border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Leave blank if the text should not be clickable.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-ink">
              Sort sequence
            </label>
            <input
              type="number"
              value={sort}
              onChange={(e) => setSort(Number(e.target.value))}
              placeholder="0"
              className="mt-1.5 w-full rounded-card border border-border bg-white px-3.5 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-ink-muted">
              Lower numbers appear first in the ticker sequence.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-ink focus:ring-ink"
            />
            <span className="text-sm font-medium text-ink">Active</span>
            <span className="text-xs text-ink-muted">
              (Show this announcement in the top moving banner)
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-border/70 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-card border border-border px-4 py-2 text-xs font-medium uppercase tracking-widest2 text-ink hover:bg-ink/5 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Update announcement" : "Create announcement"}
        </button>
      </div>
    </form>
  );
}
