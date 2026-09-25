import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { findPost, listPosts } from "@/features/journal/posts";
import { productRepo } from "@/server/repositories";
import type { ProductSummary } from "@/types/product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
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
    const found = await Promise.all(post.relatedProductSlugs.map((s) => productRepo.findBySlug(s)));
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
        images: p.images,
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
    publisher: { "@type": "Organization", name: "Ungal Nesavalan", logo: `${SITE_URL}/icon-512.png` }
  };

  return (
    <Container className="py-12">
      <JsonLd data={articleJsonLd} />
      <div className="mx-auto max-w-3xl">
        <Link href="/journal" className="text-[11px] uppercase tracking-[0.3em] text-ink-muted hover:text-ink">
          ← Journal
        </Link>
        <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-ink-muted">
          {new Date(post.publishedAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}{" "}
          · {post.readingTimeMin} min read
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-ink-soft">{post.excerpt}</p>
      </div>

      {post.heroImage && (
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-card bg-cream-warm">
          <Image
            src={post.heroImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <article className="prose-journal mx-auto mt-10 max-w-3xl">
        <MDXRemote source={post.content} />
      </article>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl border-t border-border/70 pt-10">
          <h2 className="font-display text-2xl">Sarees mentioned</h2>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
