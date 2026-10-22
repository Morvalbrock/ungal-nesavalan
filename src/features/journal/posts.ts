import { postRepo } from "@/server/repositories";
import type { JournalPost } from "@/types/post";

export interface Post extends JournalPost {
  readingTimeMin: number;
}

function withReadingTime(p: JournalPost): Post {
  return {
    ...p,
    readingTimeMin: Math.max(1, Math.round((p.content || "").split(/\s+/).filter(Boolean).length / 220))
  };
}

export async function listPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  const rows = await postRepo.list({ includeDrafts });
  return rows.map(withReadingTime);
}

export async function findPost(slug: string, opts: { includeDrafts?: boolean } = {}): Promise<Post | null> {
  const row = await postRepo.findBySlug(slug, opts);
  return row ? withReadingTime(row) : null;
}

export async function listTags(): Promise<string[]> {
  const posts = await listPosts();
  const set = new Set<string>();
  for (const p of posts) for (const t of p.tags ?? []) set.add(t);
  return Array.from(set).sort();
}
