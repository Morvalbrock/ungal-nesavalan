"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Upload,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  AlertCircle
} from "lucide-react";
import type { Category } from "@/types/category";
import type { PageBanner } from "@/types/page-banner";
import { deleteCategory, upsertCategory, upsertPageBanner } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type DraftCategory = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  headerImage: string;
  sort: number | string;
};

const emptyDraft: DraftCategory = {
  name: "",
  slug: "",
  description: "",
  image: "",
  headerImage: "",
  sort: 0
};

interface CategoryManagerProps {
  categories: Category[];
  initialPageBanners?: PageBanner[];
}

export function CategoryManager({ categories, initialPageBanners = [] }: CategoryManagerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"categories" | "pageBanners">("categories");

  // Category state
  const [draft, setDraft] = useState<DraftCategory | null>(null);
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Page banner state
  const [pageBanners, setPageBanners] = useState<PageBanner[]>(initialPageBanners);
  const [editingBanner, setEditingBanner] = useState<PageBanner | null>(null);

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

  const saveCategory = () => {
    if (!draft) return;
    setBanner(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await upsertCategory({
        id: draft.id,
        name: draft.name,
        slug: draft.slug || undefined,
        description: draft.description || undefined,
        image: draft.image || undefined,
        headerImage: draft.headerImage || undefined,
        sort: draft.sort as unknown as number
      });
      if (res.ok) {
        setDraft(null);
        setSuccessMsg(`Category "${draft.name}" saved successfully.`);
        router.refresh();
      } else {
        setBanner(res.issues ? Object.values(res.issues).flat()[0] ?? res.error : res.error);
      }
    });
  };

  const removeCategory = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.ok) {
        setSuccessMsg(`Category "${name}" deleted.`);
        router.refresh();
      } else {
        setBanner(res.error);
      }
    });
  };

  const saveBanner = (b: PageBanner) => {
    setBanner(null);
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await upsertPageBanner({
        id: b.id,
        page: b.page,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl
      });
      if (res.ok) {
        setPageBanners((prev) => prev.map((item) => (item.id === b.id ? b : item)));
        setEditingBanner(null);
        setSuccessMsg(`Banner for "${b.title}" updated successfully.`);
        router.refresh();
      } else {
        setBanner(res.issues ? Object.values(res.issues).flat()[0] ?? res.error : res.error);
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

      {/* Tabs */}
      <div className="flex border-b border-border/80">
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition",
            activeTab === "categories"
              ? "border-maroon text-maroon"
              : "border-transparent text-ink-muted hover:text-ink"
          )}
        >
          <Layers className="h-4 w-4" />
          <span>Category Headers & Cards</span>
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink-muted">
            {categories.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pageBanners")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition",
            activeTab === "pageBanners"
              ? "border-maroon text-maroon"
              : "border-transparent text-ink-muted hover:text-ink"
          )}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Store Page Banners (/products, /about, etc.)</span>
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink-muted">
            {pageBanners.length}
          </span>
        </button>
      </div>

      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories by name, slug, description…"
                className="w-full rounded-card border border-border bg-cream py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
              />
            </div>
            {!draft && (
              <button
                type="button"
                onClick={() => setDraft({ ...emptyDraft })}
                className="btn-primary inline-flex shrink-0 items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> New category
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-card border border-border bg-cream shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-border/80 bg-ink/[.03] text-left text-[10px] uppercase tracking-widest text-ink-muted">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Header Hero Banner</th>
                  <th className="p-3">Card / Mosaic</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3 text-center">Sort</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => {
                  const headerImg = c.headerImage || c.image;
                  return (
                    <tr key={c.id} className="transition hover:bg-cream-warm/30">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink">{c.name}</span>
                          <Link
                            href={`/category/${c.slug}`}
                            target="_blank"
                            title="View category page"
                            className="text-ink-muted/60 transition hover:text-maroon"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                        {c.description && (
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-ink-muted">
                            {c.description}
                          </p>
                        )}
                      </td>
                      <td className="p-3">
                        {headerImg ? (
                          <div className="group relative aspect-video w-24 overflow-hidden rounded border border-border bg-cream-warm">
                            <Image
                              src={headerImg}
                              alt={c.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                              unoptimized
                            />
                            {c.headerImage ? (
                              <span className="absolute bottom-0 left-0 right-0 bg-ink/70 py-0.5 text-center text-[9px] uppercase tracking-wider text-cream">
                                Custom
                              </span>
                            ) : (
                              <span className="absolute bottom-0 left-0 right-0 bg-ink/50 py-0.5 text-center text-[9px] uppercase tracking-wider text-cream/90">
                                Fallback
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block rounded bg-ink/5 px-2 py-1 text-[11px] text-ink-muted">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {c.image ? (
                          <div className="relative aspect-[4/5] w-12 overflow-hidden rounded border border-border bg-cream-warm">
                            <Image
                              src={c.image}
                              alt={c.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <span className="inline-block rounded bg-ink/5 px-2 py-1 text-[11px] text-ink-muted">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-xs text-ink-muted">/category/{c.slug}</td>
                      <td className="p-3 text-center text-xs font-medium text-ink">{c.sort}</td>
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
                              headerImage: c.headerImage ?? "",
                              sort: c.sort
                            })
                          }
                          className="mr-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-ink-soft hover:bg-ink/5 hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(c.id, c.name)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-maroon hover:bg-maroon/10 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-ink-muted">
                      {categories.length === 0 ? "No categories yet." : "No matching categories."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Edit/Create Modal */}
          {draft && (
            <div className="rounded-card border-2 border-maroon/30 bg-cream p-6 shadow-elev">
              <div className="mb-5 flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <h3 className="font-display text-xl text-ink">
                    {draft.id ? `Edit Category: ${draft.name}` : "Create New Category"}
                  </h3>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Configure category details, full-bleed header hero banner, and mosaic card image.
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

              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                      Category Name *
                    </span>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="e.g. Silk Sarees"
                      className={inputCls}
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                      Slug (URL path)
                    </span>
                    <input
                      value={draft.slug}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                      placeholder="auto-generated from name if blank"
                      className={inputCls}
                    />
                  </label>

                  <label className="block text-sm sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                      Description (shown on page hero banner & mosaic)
                    </span>
                    <input
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="e.g. Handwoven silks from Kanchipuram, Banaras and beyond."
                      className={inputCls}
                    />
                  </label>

                  <label className="block text-sm">
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">
                      Sort Order
                    </span>
                    <input
                      type="number"
                      value={draft.sort}
                      onChange={(e) => setDraft({ ...draft, sort: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                </div>

                {/* Header Image Uploader */}
                <div className="rounded-card border border-border bg-cream-warm/40 p-4">
                  <div className="mb-3">
                    <h4 className="font-display text-base font-semibold text-ink">
                      Page Header Hero Banner
                    </h4>
                    <p className="text-xs text-ink-muted">
                      Displayed full-width at the top of{" "}
                      <code className="rounded bg-ink/5 px-1 font-mono text-[11px]">
                        /category/{draft.slug || "slug"}
                      </code>
                      . Recommended size: 1920×600 px (16:9 or wide format).
                    </p>
                  </div>
                  <ImageUploader
                    value={draft.headerImage}
                    onChange={(url) => setDraft({ ...draft, headerImage: url })}
                    folder="categories"
                    aspect="video"
                    previewHeight={140}
                  />
                </div>

                {/* Card / Mosaic Image Uploader */}
                <div className="rounded-card border border-border bg-cream-warm/40 p-4">
                  <div className="mb-3">
                    <h4 className="font-display text-base font-semibold text-ink">
                      Card / Mosaic Image
                    </h4>
                    <p className="text-xs text-ink-muted">
                      Displayed on homepage Category Mosaic, category grids, and footer.
                      Recommended size: 800×1000 px (4:5 portrait format).
                    </p>
                  </div>
                  <ImageUploader
                    value={draft.image}
                    onChange={(url) => setDraft({ ...draft, image: url })}
                    folder="categories"
                    aspect="portrait"
                    previewHeight={140}
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-border/80 pt-4">
                  <button type="button" onClick={() => setDraft(null)} className="btn-ghost">
                    Cancel
                  </button>
                  <button type="button" onClick={saveCategory} disabled={pending} className="btn-primary">
                    {pending ? "Saving…" : "Save Category"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "pageBanners" && (
        <div className="space-y-6">
          <div className="rounded-card border border-border bg-cream p-4 text-sm text-ink-muted">
            <p>
              Manage dynamic full-width header banners for general store pages like{" "}
              <strong>All Sarees (/products)</strong>, <strong>Our Weavers (/about)</strong>, and{" "}
              <strong>The Journal (/journal)</strong>.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageBanners.map((b) => {
              const isEditing = editingBanner?.id === b.id;
              const current = isEditing ? editingBanner : b;

              return (
                <div
                  key={b.id}
                  className="flex flex-col overflow-hidden rounded-card border border-border bg-cream shadow-sm"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-ink/90 text-cream">
                    {current.imageUrl ? (
                      <Image
                        src={current.imageUrl}
                        alt={current.title}
                        fill
                        sizes="380px"
                        className="object-cover opacity-60"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-cream/40">
                        No image set
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <span className="rounded bg-cream/20 px-2 py-0.5 font-mono text-[10px] text-cream backdrop-blur">
                        {b.page}
                      </span>
                      <h4 className="mt-1 font-display text-lg font-semibold text-cream">
                        {current.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium uppercase tracking-wider text-ink-muted">
                          Title
                          <input
                            value={editingBanner.title}
                            onChange={(e) =>
                              setEditingBanner({ ...editingBanner, title: e.target.value })
                            }
                            className={inputCls}
                          />
                        </label>
                        <label className="block text-xs font-medium uppercase tracking-wider text-ink-muted">
                          Subtitle
                          <textarea
                            rows={2}
                            value={editingBanner.subtitle ?? ""}
                            onChange={(e) =>
                              setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                            }
                            className={inputCls}
                          />
                        </label>
                        <div className="space-y-1">
                          <span className="block text-xs font-medium uppercase tracking-wider text-ink-muted">
                            Header Image
                          </span>
                          <ImageUploader
                            value={editingBanner.imageUrl ?? ""}
                            onChange={(url) =>
                              setEditingBanner({ ...editingBanner, imageUrl: url })
                            }
                            folder="banners"
                            aspect="video"
                            previewHeight={80}
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingBanner(null)}
                            className="btn-ghost px-3 py-1.5 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveBanner(editingBanner)}
                            disabled={pending}
                            className="btn-primary px-3 py-1.5 text-xs"
                          >
                            {pending ? "Saving…" : "Save Banner"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="line-clamp-2 text-xs text-ink-soft">
                            {b.subtitle || "No subtitle configured."}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                          <Link
                            href={b.page}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
                          >
                            <span>Preview page</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEditingBanner({ ...b })}
                            className="inline-flex items-center gap-1 rounded bg-ink/5 px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-ink hover:text-cream"
                          >
                            <Pencil className="h-3 w-3" /> Edit Banner
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  aspect?: "video" | "portrait";
  previewHeight?: number;
}

function ImageUploader({
  value,
  onChange,
  folder,
  aspect = "video",
  previewHeight = 120
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Failed to upload image");
        return;
      }
      onChange(data.url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-[4/5]";

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Preview block */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-card border border-border bg-cream shadow-inner",
            aspectClass
          )}
          style={{ height: previewHeight }}
        >
          {value ? (
            <Image
              src={value}
              alt="Image preview"
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-2 text-center text-[10px] uppercase tracking-wider text-ink-muted/60">
              <ImageIcon className="mb-1 h-5 w-5 opacity-40" />
              <span>No image</span>
            </div>
          )}
        </div>

        {/* Input & actions */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-card border border-border bg-cream px-3 py-1.5 text-xs font-medium text-ink transition hover:border-ink hover:bg-cream-warm disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5 text-maroon" />
              <span>{uploading ? "Uploading…" : value ? "Replace image" : "Upload from device"}</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 text-xs text-maroon hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Or paste external image URL (https://…)"
              className="w-full rounded-card border border-border/80 bg-cream px-3 py-1.5 text-xs text-ink placeholder:text-ink-muted/60 focus:border-ink focus:outline-none"
            />
          </div>

          {uploadError && <p className="text-xs text-maroon">{uploadError}</p>}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-card border border-border bg-cream px-3 py-2 text-sm text-ink outline-none transition focus:border-ink";
