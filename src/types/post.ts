export interface JournalPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  heroImage?: string;
  publishedAt: string;
  tags: string[];
  relatedProductSlugs: string[];
  draft: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}
