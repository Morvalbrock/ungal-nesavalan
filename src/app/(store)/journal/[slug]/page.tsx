import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarkdownContent } from "@/components/journal/MarkdownContent";
import { findPost, listPosts } from "@/features/journal/posts";
import { productRepo } from "@/server/repositories";
import type { ProductSummary } from "@/types/product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await listPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/journal/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.heroImage ? [{ url: post.heroImage, width: 1200, height: 720 }] : []
    }
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();

  const related: ProductSummary[] = [];
  if (post.relatedProductSlugs?.length) {
    const found = await Promise.all(
      post.relatedProductSlugs.map((s) => productRepo.findBySlug(s).catch(() => null))
    );
    for (const p of found) {
      if (!p) continue;
      related.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        fabric: p.fabric,
        weave: p.weave,
        occasion: p.occasion,
        images: p.images ?? [],
        categoryId: p.categoryId,
        featured: p.featured
      });
    }
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.heroImage,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Ungal Nesavalan" },
    publisher: { "@type": "Organization", name: "Ungal Nesavalan", logo: `${SITE_URL}/images/logo.png` }
  };

  const formattedDate = post.publishedAt
    ? (() => {
        try {
          return new Date(post.publishedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        } catch {
          return post.publishedAt;
        }
      })()
    : null;

  return (
    <div className="bg-[#faf7fd] min-h-[85vh] py-10 sm:py-14">
      <Container>
        <JsonLd data={articleJsonLd} />
        <div className="mx-auto max-w-3xl">
          <Link href="/journal" className="inline-block text-xs font-semibold text-brand-purple hover:underline">
            ← Back to Journal
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-purple-900/60">
            {formattedDate ? `${formattedDate} · ` : ""}
            {post.readingTimeMin ?? 1} min read
          </p>
          <h1 className="mt-3 font-heritage font-bold text-3xl sm:text-4xl md:text-5xl text-brand-plum leading-[1.15]">
            {post.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-700 leading-relaxed">{post.excerpt}</p>
        </div>

        {post.heroImage && (
          <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border border-purple-100 shadow-sm bg-purple-50">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <article className="prose-journal mx-auto mt-8 max-w-3xl rounded-2xl border border-purple-100 bg-white p-6 sm:p-10 shadow-xs">
          <MarkdownContent content={post.content} />
        </article>

        {related.length > 0 && (
          <section className="mx-auto mt-14 max-w-4xl border-t border-purple-100 pt-10">
            <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-brand-plum">Handloom Sarees Featured</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
