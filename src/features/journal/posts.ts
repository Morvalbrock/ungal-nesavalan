import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface PostFrontmatter {
  title: string;
  slug: string;
  excerpt: string;
  heroImage?: string;
  publishedAt: string;
  tags?: string[];
  relatedProductSlugs?: string[];
  draft?: boolean;
}

export interface Post extends PostFrontmatter {
  content: string;
  readingTimeMin: number;
}

const DIR = path.join(process.cwd(), "content", "journal");

async function readAll(): Promise<Post[]> {
  let files: string[];
  try {
    files = await fs.readdir(DIR);
  } catch {
    return [];
  }
  const posts: Post[] = [];
  for (const f of files) {
    if (!f.endsWith(".mdx") && !f.endsWith(".md")) continue;
    const raw = await fs.readFile(path.join(DIR, f), "utf8");
    const parsed = matter(raw);
    const fm = parsed.data as PostFrontmatter;
    posts.push({
      ...fm,
      content: parsed.content,
      readingTimeMin: Math.max(1, Math.round(parsed.content.split(/\s+/).length / 220))
    });
  }
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function listPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  const all = await readAll();
  return includeDrafts ? all : all.filter((p) => !p.draft);
}

export async function findPost(slug: string, opts: { includeDrafts?: boolean } = {}): Promise<Post | null> {
  const posts = await listPosts(opts);
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function listTags(): Promise<string[]> {
  const posts = await listPosts();
  const set = new Set<string>();
  for (const p of posts) for (const t of p.tags ?? []) set.add(t);
  return Array.from(set).sort();
}
