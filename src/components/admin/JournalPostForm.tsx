"use client";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Trash2, Upload } from "lucide-react";
import {
  deleteJournalPost,
  upsertJournalPost,
  type JournalPostFormValues
} from "@/features/admin/actions";
import type { JournalPost } from "@/types/post";
import { cn } from "@/lib/utils";

type Values = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  heroImage: string;
  publishedAt: string;
  tagsText: string;
  relatedProductSlugsText: string;
  draft: boolean;
  content: string;
};

function toInitial(p?: JournalPost): Values {
  if (!p) {
    return {
      slug: "",
      title: "",
      excerpt: "",
      heroImage: "",
      publishedAt: new Date().toISOString().slice(0, 10),
      tagsText: "",
      relatedProductSlugsText: "",
      draft: false,
      content: ""
    };
  }
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    heroImage: p.heroImage ?? "",
    publishedAt: p.publishedAt.slice(0, 10),
    tagsText: (p.tags ?? []).join(", "),
    relatedProductSlugsText: (p.relatedProductSlugs ?? []).join(", "),
    draft: p.draft,
    content: p.content
  };
}

export function JournalPostForm({ post }: { post?: JournalPost }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => toInitial(post));
  const [pending, startTransition] = useTransition();
  const [issues, setIssues] = useState<Record<string, string[]>>({});
  const [banner, setBanner] = useState<string | null>(null);

  const setField = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const splitList = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    setIssues({});
    const payload: JournalPostFormValues = {
      id: values.id,
      slug: values.slug,
      title: values.title,
      excerpt: values.excerpt,
      heroImage: values.heroImage,
      publishedAt: values.publishedAt,
      tags: splitList(values.tagsText),
      relatedProductSlugs: splitList(values.relatedProductSlugsText),
      draft: values.draft,
      content: values.content
    };

    startTransition(async () => {
      const res = await upsertJournalPost(payload);
      if (res.ok) {
        router.push("/admin/journal");
        router.refresh();
      } else {
        setIssues(res.issues ?? {});
        setBanner(res.error === "invalid_input" ? "Please fix the highlighted fields." : res.error);
      }
    });
  };

  const onDelete = () => {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteJournalPost(post.id);
      if (res.ok) {
        router.push("/admin/journal");
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
        <Field label="Title" issues={issues.title}>
          <input
            value={values.title}
            onChange={(e) => setField("title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug (optional)" hint="Leave blank to auto-generate from the title">
            <input
              value={values.slug}
              onChange={(e) => setField("slug", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Published date" issues={issues.publishedAt}>
            <input
              type="date"
              value={values.publishedAt}
              onChange={(e) => setField("publishedAt", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Excerpt" issues={issues.excerpt} hint="One or two sentences shown on the journal index">
          <textarea
            value={values.excerpt}
            onChange={(e) => setField("excerpt", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
      </Section>

      <Section title="Hero image">
        <HeroImageRow
          url={values.heroImage}
          onChange={(url) => setField("heroImage", url)}
          onUploadError={(msg) => setBanner(msg)}
        />
        {issues.heroImage && <p className="text-xs text-maroon">{issues.heroImage[0]}</p>}
      </Section>

      <Section title="Body (Markdown)">
        <Field
          label="Article body"
          issues={issues.content}
          hint="Markdown: # Heading, **bold**, *italic*, [link](url), bullet lists with - , ## for subheads."
        >
          <textarea
            value={values.content}
            onChange={(e) => setField("content", e.target.value)}
            rows={20}
            className={cn(inputCls, "font-mono text-[13px] leading-6")}
            placeholder={"# Heading\n\nWrite your article in Markdown here."}
          />
        </Field>
      </Section>

      <Section title="Meta">
        <Field
          label="Tags"
          hint="Comma-separated. e.g. kanchivaram, care, bridal"
        >
          <input
            value={values.tagsText}
            onChange={(e) => setField("tagsText", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field
          label="Related product slugs"
          hint="Comma-separated product slugs; these appear as cards at the bottom of the article."
        >
          <input
            value={values.relatedProductSlugsText}
            onChange={(e) => setField("relatedProductSlugsText", e.target.value)}
            className={inputCls}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.draft}
            onChange={(e) => setField("draft", e.target.checked)}
          />
          <span>Draft (not visible on the storefront)</span>
        </label>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-6">
        <div>
          {post && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="rounded-card border border-maroon/40 px-4 py-2 text-sm text-maroon hover:bg-maroon/5"
            >
              Delete post
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/admin/journal")} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Saving…" : post ? "Save changes" : "Publish post"}
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

function HeroImageRow({
  url,
  onChange,
  onUploadError
}: {
  url: string;
  onChange: (url: string) => void;
  onUploadError: (msg: string) => void;
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
      const res = await fetch("/api/admin/uploads", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onUploadError(`Image upload failed: ${data.error ?? res.statusText}`);
        return;
      }
      onChange(data.url);
    } catch (err) {
      onUploadError(`Image upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-card border border-border bg-cream-warm/50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="hero preview" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] uppercase tracking-wider text-ink-muted">No img</span>
        )}
      </div>
      <input
        placeholder="https://… or upload →"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputCls, "flex-1")}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="rounded-card border border-border p-2 text-ink-muted hover:border-ink hover:text-ink disabled:opacity-50"
        aria-label="Upload hero image"
        title="Upload hero image"
      >
        <Upload className="h-4 w-4" />
      </button>
      {url && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded p-2 text-ink-muted hover:bg-ink/5 hover:text-maroon"
          aria-label="Clear hero image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
