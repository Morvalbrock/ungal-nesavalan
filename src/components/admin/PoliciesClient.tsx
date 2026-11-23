"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Edit, ShieldCheck, FileText, Search } from "lucide-react";
import type { PolicyPage } from "@/types/policy";

interface Props {
  initialPolicies: PolicyPage[];
}

export function PoliciesClient({ initialPolicies }: Props) {
  const [query, setQuery] = useState("");

  const filtered = initialPolicies.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase()) ||
      p.kicker.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">Compliance &amp; Governance</p>
          <h1 className="mt-1 font-display text-3xl text-ink">Legal &amp; Policy Pages</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Manage Privacy Policy, Terms of Service, Shipping &amp; Returns, and customer-facing legal terms.
          </p>
        </div>

        <Link
          href="/admin/policies/new"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-cream shadow-xs transition hover:bg-brand-purple"
        >
          <Plus className="h-4 w-4" /> New Policy Page
        </Link>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 max-w-sm shadow-xs focus-within:ring-2 focus-within:ring-brand-purple/20">
        <Search className="h-4 w-4 text-ink-muted" />
        <input
          type="text"
          placeholder="Filter policies by title or slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full text-xs text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </div>

      {/* Policy Table */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-3.5">Policy Page</th>
                <th className="px-6 py-3.5">Live Route</th>
                <th className="px-6 py-3.5">Effective Date</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-ink-muted">
                    No policy pages found matching &ldquo;{query}&rdquo;.
                  </td>
                </tr>
              ) : (
                filtered.map((policy) => (
                  <tr key={policy.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-purple-50 p-2 text-brand-purple shrink-0 mt-0.5">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-ink text-sm block">{policy.title}</span>
                          <span className="inline-block mt-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-purple bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            {policy.kicker || "Legal"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/${policy.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-700 hover:text-brand-purple hover:underline"
                      >
                        <span>/{policy.slug}</span>
                        <ExternalLink className="h-3 w-3 text-ink-muted" />
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {policy.effectiveDate || "—"}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {policy.updatedAt
                        ? new Date(policy.updatedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })
                        : "Initial"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/policies/${policy.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 hover:border-brand-purple/40 transition"
                      >
                        <Edit className="h-3.5 w-3.5 text-brand-purple" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
