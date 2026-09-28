"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import type { HeroSlide } from "@/types/hero-slide";
import { upsertHeroSlide, type HeroSlideFormValues } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

function toInitial(s?: HeroSlide): HeroSlideFormValues {
  return s
    ? {
        id: s.id,
        imageUrl: s.imageUrl,
        imageAlt: s.imageAlt,
        eyebrow: s.eyebrow,
        headline: s.headline,
        headlineItalic: s.headlineItalic,
        subheadline: s.subheadline,
        ctaPrimaryLabel: s.ctaPrimaryLabel,
        ctaPrimaryHref: s.ctaPrimaryHref,
        ctaSecondaryLabel: s.ctaSecondaryLabel,
        ctaSecondaryHref: s.ctaSecondaryHref,
        featureImageUrl: s.featureImageUrl,
        featureImageAlt: s.featureImageAlt,
        featureEyebrow: s.featureEyebrow,
        featureTitle: s.featureTitle,
        featureSubtitle: s.featureSubtitle,
        sort: s.sort,
        active: s.active
      }
    : {
        imageUrl: "",
        imageAlt: "",
        eyebrow: "",
        headline: "",
        headlineItalic: "",
        subheadline: "",
        ctaPrimaryLabel: "Shop the collection",
        ctaPrimaryHref: "/products",
        ctaSecondaryLabel: "",
        ctaSecondaryHref: "",
        featureImageUrl: "",
        featureImageAlt: "",
        featureEyebrow: "Featured weave",
        featureTitle: "",
        featureSubtitle: "",
        sort: 0,
        active: true
      };
}

export function HeroSlideForm({
  slide,
  onSaved,
  onCancel
}: {
  slide?: HeroSlide;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<HeroSlideFormValues>(() => toInitial(slide));
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof HeroSlideFormValues>(key: K, v: HeroSlideFormValues[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setIssues({});
    setBanner(null);
    startTransition(async () => {
      const res = await upsertHeroSlide(values);
      if (res.ok) {
        onSaved?.();
        if (!slide) setValues(toInitial());
      } else {
        setIssues(res.issues ?? {});
        setBanner(res.error === "invalid_input" ? "Please fix the highlighted fields." : res.error);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 rounded-card border border-border bg-cream p-5">
      {banner && (
        <div className="rounded-card border border-maroon/40 bg-maroon/5 p-3 text-sm text-maroon">{banner}</div>
      )}

      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">Background image</p>
        <ImageUploader
          folder="hero"
          url={values.imageUrl}
          aspect="4/5"
          previewWidth={240}
          onChange={(url) => set("imageUrl", url)}
          onError={setBanner}
        />
        {issues.imageUrl && <p className="text-xs text-maroon">{issues.imageUrl[0]}</p>}
        <Field label="Image alt text" issues={issues.imageAlt}>
          <input
            value={values.imageAlt}
            onChange={(e) => set("imageAlt", e.target.value)}
            className={inputCls}
            placeholder="Bride draped in a red Kanjivaram silk saree"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">Copy</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow" issues={issues.eyebrow} hint="Small line above the headline">
            <input
              value={values.eyebrow}
              onChange={(e) => set("eyebrow", e.target.value)}
              className={inputCls}
              placeholder="Est. from the looms of India"
            />
          </Field>
          <Field label="Headline" issues={issues.headline}>
            <input
              value={values.headline}
              onChange={(e) => set("headline", e.target.value)}
              className={inputCls}
              placeholder="The saree,"
            />
          </Field>
          <Field label="Italic headline (2nd line)" issues={issues.headlineItalic}>
            <input
              value={values.headlineItalic}
              onChange={(e) => set("headlineItalic", e.target.value)}
              className={inputCls}
              placeholder="unhurried."
            />
          </Field>
          <Field label="Sort order" issues={issues.sort} hint="Lower numbers show first">
            <input
              type="number"
              value={values.sort as number}
              onChange={(e) => set("sort", e.target.value as unknown as number)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Subheadline" issues={issues.subheadline}>
          <textarea
            value={values.subheadline}
            onChange={(e) => set("subheadline", e.target.value)}
            className={cn(inputCls, "min-h-[88px]")}
            placeholder="Handloomed by artisans from Kanchipuram to Bishnupur…"
          />
        </Field>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">Call-to-action buttons</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary label" issues={issues.ctaPrimaryLabel}>
            <input
              value={values.ctaPrimaryLabel}
              onChange={(e) => set("ctaPrimaryLabel", e.target.value)}
              className={inputCls}
              placeholder="Shop the collection"
            />
          </Field>
          <Field label="Primary link" issues={issues.ctaPrimaryHref}>
            <input
              value={values.ctaPrimaryHref}
              onChange={(e) => set("ctaPrimaryHref", e.target.value)}
              className={inputCls}
              placeholder="/products"
            />
          </Field>
          <Field label="Secondary label" issues={issues.ctaSecondaryLabel} hint="Leave blank to hide">
            <input
              value={values.ctaSecondaryLabel}
              onChange={(e) => set("ctaSecondaryLabel", e.target.value)}
              className={inputCls}
              placeholder="The Bridal Edit"
            />
          </Field>
          <Field label="Secondary link" issues={issues.ctaSecondaryHref}>
            <input
              value={values.ctaSecondaryHref}
              onChange={(e) => set("ctaSecondaryHref", e.target.value)}
              className={inputCls}
              placeholder="/category/bridal-sarees"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
          Featured weave card <span className="normal-case tracking-normal text-ink-muted/70">(right side, optional)</span>
        </p>
        <div className="space-y-4">
          <ImageUploader
            folder="hero"
            url={typeof values.featureImageUrl === "string" ? values.featureImageUrl : ""}
            aspect="3/4"
            previewWidth={180}
            onChange={(url) => set("featureImageUrl", url)}
            onError={setBanner}
            allowClear
          />
          {issues.featureImageUrl && <p className="text-xs text-maroon">{issues.featureImageUrl[0]}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Card image alt" issues={issues.featureImageAlt}>
              <input
                value={values.featureImageAlt}
                onChange={(e) => set("featureImageAlt", e.target.value)}
                className={inputCls}
                placeholder="Kanjivaram Rose Gold saree"
              />
            </Field>
            <Field label="Card eyebrow" issues={issues.featureEyebrow}>
              <input
                value={values.featureEyebrow}
                onChange={(e) => set("featureEyebrow", e.target.value)}
                className={inputCls}
                placeholder="Featured weave"
              />
            </Field>
            <Field label="Card title" issues={issues.featureTitle}>
              <input
                value={values.featureTitle}
                onChange={(e) => set("featureTitle", e.target.value)}
                className={inputCls}
                placeholder="Kanjivaram Rose Gold"
              />
            </Field>
            <Field label="Card subtitle" issues={issues.featureSubtitle}>
              <input
                value={values.featureSubtitle}
                onChange={(e) => set("featureSubtitle", e.target.value)}
                className={inputCls}
                placeholder="Kanchipuram · Pure zari"
              />
            </Field>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.active as boolean}
          onChange={(e) => set("active", e.target.checked)}
        />
        <span>Active (shown in the homepage carousel)</span>
      </label>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-card border border-border px-4 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink"
          >
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Saving…" : slide ? "Save changes" : "Create slide"}
        </button>
      </div>
    </form>
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

const inputCls = cn(
  "w-full rounded-card border border-border bg-transparent px-3 py-2 text-sm outline-none transition focus:border-ink"
);

const ASPECT_CLASS: Record<string, string> = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]"
};

function ImageUploader({
  folder,
  url,
  aspect,
  previewWidth,
  onChange,
  onError,
  allowClear
}: {
  folder: string;
  url: string;
  aspect: "4/5" | "3/4";
  previewWidth: number;
  onChange: (url: string) => void;
  onError: (msg: string) => void;
  allowClear?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onError(`Upload failed: ${data.error ?? res.statusText}`);
        return;
      }
      onChange(data.url);
    } catch (err) {
      onError(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "relative overflow-hidden rounded-card bg-cream-warm ring-1 ring-border",
          ASPECT_CLASS[aspect]
        )}
        style={{ width: previewWidth }}
      >
        {url ? (
          <Image
            src={url}
            alt="Preview"
            fill
            sizes={`${previewWidth}px`}
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-widest text-ink-muted">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={onFile}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-card border border-border bg-cream px-3 py-2 text-sm text-ink-soft hover:border-ink hover:text-ink disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : url ? "Replace image" : "Upload image"}
        </button>
        {allowClear && url && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 rounded-card px-2 py-1 text-xs text-ink-muted hover:text-maroon"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        )}
        <p className="text-[11px] text-ink-muted">
          JPG / PNG / WebP / AVIF · up to 5 MB. Saved to <code className="text-ink">/images/hero/</code>.
        </p>
      </div>
    </div>
  );
}
