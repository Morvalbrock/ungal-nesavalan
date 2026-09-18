"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2, Plus } from "lucide-react";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { FABRICS, OCCASIONS, WEAVES } from "@/features/products/filters";
import { deleteProduct, upsertProduct, type ProductFormValues } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

type Values = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number | string;
  salePrice: number | string;
  fabric: string;
  weave: string;
  occasion: string[];
  region: string;
  lengthMeters: number | string;
  blousePieceIncluded: boolean;
  careInstructions: string;
  categoryId: string;
  featured: boolean;
  published: boolean;
  images: { id?: string; url: string; alt: string }[];
  variants: {
    id?: string;
    color: string;
    colorHex: string;
    sku: string;
    stock: number | string;
    priceOverride: number | string;
  }[];
};

function toInitial(p?: Product): Values {
  if (!p) {
    return {
      slug: "",
      name: "",
      description: "",
      basePrice: 0,
      salePrice: "",
      fabric: "silk",
      weave: "kanjivaram",
      occasion: ["festive"],
      region: "",
      lengthMeters: 5.5,
      blousePieceIncluded: true,
      careInstructions: "Dry clean only.",
      categoryId: "",
      featured: false,
      published: true,
      images: [{ url: "", alt: "" }],
      variants: [{ color: "", colorHex: "#7a1f2b", sku: "", stock: 1, priceOverride: "" }]
    };
  }
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    basePrice: p.basePrice,
    salePrice: p.salePrice ?? "",
    fabric: p.fabric,
    weave: p.weave,
    occasion: p.occasion,
    region: p.region,
    lengthMeters: p.lengthMeters,
    blousePieceIncluded: p.blousePieceIncluded,
    careInstructions: p.careInstructions,
    categoryId: p.categoryId,
    featured: p.featured,
    published: p.published,
    images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex,
      sku: v.sku,
      stock: v.stock,
      priceOverride: v.priceOverride ?? ""
    }))
  };
}

export function ProductForm({
  product,
  categories
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => toInitial(product));
  const [pending, startTransition] = useTransition();
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const setField = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const toggleOccasion = (o: string) => {
    setValues((v) => ({
      ...v,
      occasion: v.occasion.includes(o) ? v.occasion.filter((x) => x !== o) : [...v.occasion, o]
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIssues({});
    const payload: ProductFormValues = {
      ...values,
      basePrice: values.basePrice as unknown as number,
      salePrice: values.salePrice === "" ? undefined : (values.salePrice as unknown as number),
      lengthMeters: values.lengthMeters as unknown as number,
      images: values.images.map((i, idx) => ({
        id: i.id,
        url: i.url,
        alt: i.alt,
        sort: idx
      })),
      variants: values.variants.map((v) => ({
        id: v.id,
        color: v.color,
        colorHex: v.colorHex,
        sku: v.sku,
        stock: v.stock as unknown as number,
        priceOverride: v.priceOverride === "" ? undefined : (v.priceOverride as unknown as number)
      }))
    } as unknown as ProductFormValues;

    startTransition(async () => {
      const res = await upsertProduct(payload);
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setIssues(res.issues ?? {});
        setBanner(res.error === "invalid_input" ? "Please fix the highlighted fields." : res.error);
      }
    });
  };

  const onDelete = () => {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setBanner(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">
          {banner}
        </div>
      )}

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" issues={issues.name}>
            <input value={values.name} onChange={(e) => setField("name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug (optional)" hint="Leave blank to auto-generate">
            <input value={values.slug} onChange={(e) => setField("slug", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Description" issues={issues.description}>
          <textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={4}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Pricing (in paise)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Base price (paise)" issues={issues.basePrice} hint="₹1,000 = 100000">
            <input
              type="number"
              min={0}
              value={values.basePrice}
              onChange={(e) => setField("basePrice", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Sale price (paise, optional)" issues={issues.salePrice}>
            <input
              type="number"
              min={0}
              value={values.salePrice}
              onChange={(e) => setField("salePrice", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      <Section title="Attributes">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fabric" issues={issues.fabric}>
            <select value={values.fabric} onChange={(e) => setField("fabric", e.target.value)} className={inputCls}>
              {FABRICS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Weave" issues={issues.weave}>
            <select value={values.weave} onChange={(e) => setField("weave", e.target.value)} className={inputCls}>
              {WEAVES.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </Field>
          <Field label="Category" issues={issues.categoryId}>
            <select
              value={values.categoryId}
              onChange={(e) => setField("categoryId", e.target.value)}
              className={inputCls}
            >
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Occasion (multi-select)" issues={issues.occasion}>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => toggleOccasion(o)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs capitalize transition",
                  values.occasion.includes(o)
                    ? "border-ink bg-ink text-cream"
                    : "border-border text-ink-soft hover:border-ink hover:text-ink"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Region of origin" issues={issues.region}>
            <input value={values.region} onChange={(e) => setField("region", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Length (metres)" issues={issues.lengthMeters}>
            <input
              type="number"
              step="0.1"
              value={values.lengthMeters}
              onChange={(e) => setField("lengthMeters", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.blousePieceIncluded}
            onChange={(e) => setField("blousePieceIncluded", e.target.checked)}
          />
          <span>Blouse piece included</span>
        </label>

        <Field label="Care instructions" issues={issues.careInstructions}>
          <input
            value={values.careInstructions}
            onChange={(e) => setField("careInstructions", e.target.value)}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Images">
        <div className="space-y-2">
          {values.images.map((img, i) => (
            <div key={i} className="flex items-start gap-2">
              <input
                placeholder="https://…"
                value={img.url}
                onChange={(e) => {
                  const arr = [...values.images];
                  arr[i] = { ...arr[i], url: e.target.value };
                  setField("images", arr);
                }}
                className={cn(inputCls, "flex-1")}
              />
              <input
                placeholder="alt text"
                value={img.alt}
                onChange={(e) => {
                  const arr = [...values.images];
                  arr[i] = { ...arr[i], alt: e.target.value };
                  setField("images", arr);
                }}
                className={cn(inputCls, "w-56")}
              />
              <button
                type="button"
                onClick={() => setField("images", values.images.filter((_, j) => j !== i))}
                className="rounded p-2 text-ink-muted hover:bg-ink/5 hover:text-maroon"
                aria-label="Remove image"
                disabled={values.images.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setField("images", [...values.images, { url: "", alt: "" }])}
            className="btn-ghost inline-flex"
          >
            <Plus className="h-4 w-4" /> Add image URL
          </button>
        </div>
        {issues.images && <p className="text-xs text-maroon">{issues.images[0]}</p>}
        <p className="text-xs text-ink-muted">
          Direct file upload (Cloudinary/S3) arrives in a later polish phase. For now, paste any hosted image URL — try{" "}
          <code className="rounded bg-ink/5 px-1">https://picsum.photos/seed/your-slug/900/1200</code>.
        </p>
      </Section>

      <Section title="Variants">
        <div className="space-y-3">
          {values.variants.map((v, i) => (
            <div key={i} className="grid gap-2 rounded-card border border-border p-3 sm:grid-cols-[1fr_120px_1fr_120px_120px_auto]">
              <input
                placeholder="Colour"
                value={v.color}
                onChange={(e) => {
                  const arr = [...values.variants];
                  arr[i] = { ...arr[i], color: e.target.value };
                  setField("variants", arr);
                }}
                className={inputCls}
              />
              <input
                type="color"
                value={v.colorHex}
                onChange={(e) => {
                  const arr = [...values.variants];
                  arr[i] = { ...arr[i], colorHex: e.target.value };
                  setField("variants", arr);
                }}
                className="h-10 w-full rounded-card border border-border bg-transparent px-1"
              />
              <input
                placeholder="SKU"
                value={v.sku}
                onChange={(e) => {
                  const arr = [...values.variants];
                  arr[i] = { ...arr[i], sku: e.target.value };
                  setField("variants", arr);
                }}
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => {
                  const arr = [...values.variants];
                  arr[i] = { ...arr[i], stock: e.target.value };
                  setField("variants", arr);
                }}
                className={inputCls}
              />
              <input
                type="number"
                min={0}
                placeholder="Price override"
                value={v.priceOverride}
                onChange={(e) => {
                  const arr = [...values.variants];
                  arr[i] = { ...arr[i], priceOverride: e.target.value };
                  setField("variants", arr);
                }}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setField("variants", values.variants.filter((_, j) => j !== i))}
                className="rounded p-2 text-ink-muted hover:bg-ink/5 hover:text-maroon"
                disabled={values.variants.length === 1}
                aria-label="Remove variant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setField("variants", [
                ...values.variants,
                { color: "", colorHex: "#7a1f2b", sku: "", stock: 1, priceOverride: "" }
              ])
            }
            className="btn-ghost inline-flex"
          >
            <Plus className="h-4 w-4" /> Add variant
          </button>
          {issues.variants && <p className="text-xs text-maroon">{issues.variants[0]}</p>}
        </div>
      </Section>

      <Section title="Visibility">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => setField("published", e.target.checked)}
            />
            <span>Published</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.featured}
              onChange={(e) => setField("featured", e.target.checked)}
            />
            <span>Featured on homepage</span>
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-6">
        <div>
          {product && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-card border border-maroon/40 px-4 py-2 text-sm text-maroon hover:bg-maroon/5"
            >
              Delete product
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-card border border-border bg-cream p-5">
      <h2 className="font-display text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  issues,
  children
}: {
  label: string;
  hint?: string;
  issues?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</span>
      {children}
      {hint && !issues && <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>}
      {issues && <span className="mt-1 block text-xs text-maroon">{issues[0]}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ink";
