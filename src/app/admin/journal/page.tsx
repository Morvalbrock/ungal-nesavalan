import Link from "next/link";
import { Plus } from "lucide-react";
import { postRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  const posts = await postRepo.list({ includeDrafts: true });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Journal</h1>
          <p className="mt-1 text-sm text-ink-muted">Compose and manage articles that appear at /journal.</p>
        </div>
        <Link href="/admin/journal/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-card border border-border bg-cream p-8 text-center text-ink-muted">
          No posts yet. Click <strong>New post</strong> to write your first article.
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border bg-cream">
          <table className="w-full text-sm">
            <thead className="bg-cream-warm/60 text-left text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-cream-warm/40">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.slug}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </td>
                  <td className="px-4 py-3">
                    {p.draft ? (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink-soft">Draft</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Published</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/journal/${p.id}`} className="text-sm underline hover:text-ink">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
