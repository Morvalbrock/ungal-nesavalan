export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId?: string;
  image?: string;
  headerImage?: string;
  description?: string;
  sort: number;
}
