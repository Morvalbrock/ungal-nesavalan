"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, Search, ExternalLink, Megaphone } from "lucide-react";
import type { Announcement } from "@/types/announcement";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { deleteAnnouncement, toggleAnnouncementActive } from "@/features/admin/actions";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { cn } from "@/lib/utils";

type ActiveFilter = "all" | "active" | "inactive";

interface Props {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsClient({ initialAnnouncements }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ActiveFilter>("all");
  const [confirmDelete, setConfirmDelete] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setEditing(null);
    setCreating(false);
    router.refresh();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialAnnouncements.filter((item) => {
      if (filter === "active" && !item.active) return false;
      if (filter === "inactive" && item.active) return false;
      if (q) {
        const text = `${item.text} ${item.link ?? ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [initialAnnouncements, search, filter]);

  const activeItems = useMemo(
    () => initialAnnouncements.filter((a) => a.active),
    [initialAnnouncements]
  );

  const handleToggle = (id: string, current: boolean) => {
    setError(null);
    startTransition(async () => {
      const res = await toggleAnnouncementActive(id, !current);
      if (!res.ok) {
        setError(res.error || "Failed to update status");
        return;
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setError(null);
    startTransition(async () => {
      const res = await deleteAnnouncement(id);
      if (!res.ok) {
        setError(res.error || "Failed to delete");
        return;
      }
      setConfirmDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Storefront</p>
          <h1 className="mt-2 font-display text-3xl">Announcements</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Manage the moving ticker content shown at the very top of your storefront. Control message order, links, and visibility.
          </p>
        </div>
        {!creating && !editing && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> New announcement
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-card border border-maroon/30 bg-maroon/5 p-4 text-sm text-maroon">
          {error}
        </div>
      )}

      {/* Live Marquee Preview */}
      {activeItems.length > 0 && (
        <div className="rounded-card border border-border bg-cream p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-ink-muted">
            <Megaphone className="h-3.5 w-3.5 text-gold-soft" />
            <span>Storefront Ticker Live Preview</span>
          </div>
          <div className="mt-3 overflow-hidden rounded border border-ink/10 bg-ink text-cream">
            <div className="flex w-max animate-marquee whitespace-nowrap py-2">
              {[...activeItems, ...activeItems, ...activeItems].map((item, i) => (
                <span
                  key={i}
                  className="flex items-center px-6 text-[11px] font-medium uppercase tracking-widest2 text-cream/90"
                >
                  <span className="mr-6 text-gold-soft">✦</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Drawer / Box */}
      {creating && (
        <AnnouncementForm
          onSaved={refresh}
          onCancel={() => setCreating(false)}
        />
      )}
      {editing && (
        <AnnouncementForm
          announcement={editing}
          onSaved={refresh}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-cream p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-full rounded-card border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="uppercase tracking-widest">Status</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActiveFilter)}
            className="rounded-card border border-border bg-white px-2.5 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
          >
            <option value="all">All ({initialAnnouncements.length})</option>
            <option value="active">Active ({activeItems.length})</option>
            <option value="inactive">
              Inactive ({initialAnnouncements.length - activeItems.length})
            </option>
          </select>
        </label>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-border/70 text-sm">
          <thead className="bg-cream-warm text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-4 py-3 text-left">Sort</th>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Link</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-muted">
                  {search
                    ? "No announcements matched your search."
                    : "No announcements found. Click 'New announcement' above to add one."}
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="transition hover:bg-cream/40">
                  <td className="px-4 py-3 text-xs font-mono text-ink-muted">
                    #{item.sort}
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {item.text}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {item.link ? (
                      <span className="inline-flex items-center gap-1 text-ink-soft hover:underline">
                        {item.link}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="text-ink-muted/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id, item.active)}
                      disabled={pending}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition",
                        item.active
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          : "bg-cream-warm text-ink-muted hover:bg-border/60"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          item.active ? "bg-emerald-600" : "bg-ink-muted"
                        )}
                      />
                      {item.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCreating(false);
                          setEditing(item);
                        }}
                        className="rounded p-1.5 text-ink-soft hover:bg-ink/5 hover:text-ink"
                        title="Edit announcement"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(item)}
                        className="rounded p-1.5 text-maroon hover:bg-maroon/10"
                        title="Delete announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title="Delete announcement?"
        body={`Are you sure you want to delete "${confirmDelete?.text}"? This will remove it from the storefront.`}
        confirmLabel="Delete"
        danger
        busy={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
