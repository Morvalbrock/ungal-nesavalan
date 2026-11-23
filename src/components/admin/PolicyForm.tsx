"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Save,
  Trash2,
  Eye,
  Edit3,
  Heading2,
  Bold,
  List,
  Link2,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { upsertPolicy, deletePolicy, type PolicyFormValues } from "@/features/admin/actions";
import type { PolicyPage } from "@/types/policy";
import { cn } from "@/lib/utils";

interface Props {
  initialPolicy?: PolicyPage;
}

export function PolicyForm({ initialPolicy }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [banner, setBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [issues, setIssues] = useState<Record<string, string[]>>({});

  const [form, setForm] = useState<PolicyFormValues>({
    id: initialPolicy?.id,
    slug: initialPolicy?.slug ?? "",
    title: initialPolicy?.title ?? "",
    kicker: initialPolicy?.kicker ?? "Legal",
    effectiveDate: initialPolicy?.effectiveDate ?? "1 April 2025",
    lede: initialPolicy?.lede ?? "",
    content: initialPolicy?.content ?? ""
  });

  const insertMarkdown = (prefix: string, suffix = "") => {
    const textarea = document.getElementById("policy-content-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;
    const selected = current.slice(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const next = current.slice(0, start) + replacement + current.slice(end);
    setForm((f) => ({ ...f, content: next }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 10);
  };

  const handleSave = () => {
    setBanner(null);
    setIssues({});

    startTransition(async () => {
      const res = await upsertPolicy(form);
      if (!res.ok) {
        if ("issues" in res && res.issues) {
          setIssues(res.issues);
        }
        setBanner({ type: "error", message: "Please resolve the highlighted validation issues." });
        return;
      }

      setBanner({ type: "success", message: "Policy saved and published successfully." });
      if (!initialPolicy?.id && res.policy?.id) {
        router.push(`/admin/policies/${res.policy.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!initialPolicy?.id) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${form.title}"? This cannot be undone.`);
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deletePolicy(initialPolicy.id);
      if (res.ok) {
        router.push("/admin/policies");
      } else {
        setBanner({ type: "error", message: "Failed to delete policy." });
      }
    });
  };

  return (
    <div className="space-y-6">
      {banner && (
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl border p-4 text-sm font-medium",
            banner.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          )}
        >
          {banner.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs space-y-5">
            <h2 className="font-display text-lg text-ink font-semibold border-b border-border/60 pb-3">
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Privacy Policy, Terms of Service"
                  className={cn(
                    "w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-brand-purple/20",
                    issues.title ? "border-rose-300 bg-rose-50/30" : "border-border bg-white"
                  )}
                />
                {issues.title && <p className="mt-1 text-xs text-rose-600">{issues.title[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  URL Slug *
                </label>
                <div className="flex rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-brand-purple/20">
                  <span className="bg-slate-50 px-3 py-2.5 text-xs text-ink-muted border-r border-border select-none">
                    /
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                      }))
                    }
                    placeholder="privacy"
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                {issues.slug && <p className="mt-1 text-xs text-rose-600">{issues.slug[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Kicker Badge
                </label>
                <input
                  type="text"
                  value={form.kicker}
                  onChange={(e) => setForm((f) => ({ ...f, kicker: e.target.value }))}
                  placeholder="Legal, Policy, Support"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                  Effective Date
                </label>
                <input
                  type="text"
                  value={form.effectiveDate}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))}
                  placeholder="e.g. 1 April 2025"
                  className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1.5">
                Summary / Lede
              </label>
              <textarea
                rows={2}
                value={form.lede}
                onChange={(e) => setForm((f) => ({ ...f, lede: e.target.value }))}
                placeholder="A brief summary sentence introducing the policy."
                className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <h2 className="font-display text-lg text-ink font-semibold">Policy Content (Markdown)</h2>

              {/* View switch tabs */}
              <div className="flex rounded-lg border border-border bg-slate-50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition",
                    activeTab === "edit" ? "bg-white text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1 font-medium transition",
                    activeTab === "preview" ? "bg-white text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>
            </div>

            {activeTab === "edit" ? (
              <div className="space-y-3">
                {/* Formatting Quick Tools */}
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-slate-50/80 p-1.5 text-xs text-ink-muted">
                  <button
                    type="button"
                    onClick={() => insertMarkdown("## ")}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white hover:text-ink transition"
                    title="Section Heading"
                  >
                    <Heading2 className="h-3.5 w-3.5" /> Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("**", "**")}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white hover:text-ink transition"
                    title="Bold Text"
                  >
                    <Bold className="h-3.5 w-3.5" /> Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("* ")}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white hover:text-ink transition"
                    title="Bullet List Item"
                  >
                    <List className="h-3.5 w-3.5" /> Bullet List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("[Link text](", ")")}
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-white hover:text-ink transition"
                    title="Hyperlink"
                  >
                    <Link2 className="h-3.5 w-3.5" /> Link
                  </button>
                </div>

                <textarea
                  id="policy-content-textarea"
                  rows={16}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write the policy clauses in markdown..."
                  className={cn(
                    "w-full rounded-xl border font-mono text-xs leading-relaxed p-4 transition focus:outline-none focus:ring-2 focus:ring-brand-purple/20",
                    issues.content ? "border-rose-300 bg-rose-50/20" : "border-border bg-white"
                  )}
                />
                {issues.content && <p className="mt-1 text-xs text-rose-600">{issues.content[0]}</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-purple-100 bg-[#faf7fd] p-6 max-h-[500px] overflow-y-auto">
                <article className="prose-journal bg-white p-6 rounded-xl border border-border shadow-xs text-sm">
                  {form.content ? (
                    <div className="whitespace-pre-line leading-relaxed space-y-4">
                      {form.content.split("\n\n").map((para, i) => {
                        if (para.startsWith("## ")) {
                          return (
                            <h2 key={i} className="font-display text-xl text-ink font-bold pt-2 border-b border-border/40 pb-1">
                              {para.replace("## ", "")}
                            </h2>
                          );
                        }
                        if (para.startsWith("* ")) {
                          return (
                            <ul key={i} className="list-disc pl-5 space-y-1 text-slate-700">
                              {para.split("\n").map((line, liIdx) => (
                                <li key={liIdx}>{line.replace(/^(\*|-)\s+/, "")}</li>
                              ))}
                            </ul>
                          );
                        }
                        return (
                          <p key={i} className="text-slate-700 leading-relaxed">
                            {para}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-ink-muted italic">No content written yet.</p>
                  )}
                </article>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Quick Links */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-display text-sm font-semibold text-ink uppercase tracking-wider">Actions</h3>

            <button
              type="button"
              disabled={pending}
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-xs transition hover:bg-brand-purple disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {pending ? "Saving..." : initialPolicy ? "Update Policy" : "Publish Policy"}
            </button>

            {form.slug && (
              <Link
                href={`/${form.slug}`}
                target="_blank"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-slate-50 px-4 py-2.5 text-xs font-semibold text-ink-soft transition hover:bg-slate-100 hover:text-ink"
              >
                <ExternalLink className="h-3.5 w-3.5" /> View Live Page (/{form.slug})
              </Link>
            )}

            {initialPolicy && (
              <div className="border-t border-border/60 pt-4">
                <p className="text-[11px] text-ink-muted">
                  Last updated:{" "}
                  {initialPolicy.updatedAt
                    ? new Date(initialPolicy.updatedAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "Default"}
                </p>

                <button
                  type="button"
                  disabled={pending}
                  onClick={handleDelete}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Policy
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/80 bg-amber-50/50 p-5 shadow-xs text-xs space-y-2 text-amber-950">
            <p className="font-semibold text-amber-900">Tips for Legal Pages</p>
            <p className="leading-relaxed">
              Use standard Markdown headings (<code>## Clause Name</code>) and bold text (<code>**text**</code>) for key terms.
            </p>
            <p className="leading-relaxed">
              Updating a policy immediately refreshes the storefront URL and keeps full compliance records for audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
