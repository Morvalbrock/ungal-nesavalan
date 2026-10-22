import Link from "next/link";
import { notFound } from "next/navigation";
import { JournalPostForm } from "@/components/admin/JournalPostForm";
import { postRepo } from "@/server/repositories";

export const dynamic = "force-dynamic";

export default async function EditJournalPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await postRepo.findById(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/journal" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Journal
        </Link>
        <div className="mt-2 flex items-baseline justify-between">
          <h1 className="font-display text-3xl">Edit post</h1>
          {!post.draft && (
            <Link
              href={`/journal/${post.slug}`}
              target="_blank"
              className="text-xs text-ink-muted hover:text-ink"
            >
              View on storefront ↗
            </Link>
          )}
        </div>
      </header>
      <JournalPostForm post={post} />
    </div>
  );
}
