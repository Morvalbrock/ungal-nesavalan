import Link from "next/link";
import { JournalPostForm } from "@/components/admin/JournalPostForm";

export const dynamic = "force-dynamic";

export default function NewJournalPostPage() {
  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/journal" className="text-xs uppercase tracking-widest text-ink-muted hover:text-ink">
          ← Journal
        </Link>
        <h1 className="mt-2 font-display text-3xl">New post</h1>
      </header>
      <JournalPostForm />
    </div>
  );
}
