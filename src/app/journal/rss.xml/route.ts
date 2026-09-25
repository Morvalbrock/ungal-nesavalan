import { listPosts } from "@/features/journal/posts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const revalidate = 900;

export async function GET() {
  const posts = await listPosts();
  const items = posts
    .map(
      (p) => `<item>
<title>${escapeXml(p.title)}</title>
<link>${SITE_URL}/journal/${p.slug}</link>
<guid>${SITE_URL}/journal/${p.slug}</guid>
<pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
<description><![CDATA[${p.excerpt}]]></description>
</item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>Ungal Nesavalan · Journal</title>
<link>${SITE_URL}/journal</link>
<description>Stories from India's handloom clusters.</description>
<language>en-in</language>
${items}
</channel></rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
  });
}
