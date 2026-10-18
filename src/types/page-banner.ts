export interface PageBanner {
  id: string; // e.g. "products", "about", "journal"
  page: string; // e.g. "/products", "/about", "/journal"
  title: string;
  subtitle?: string;
  imageUrl?: string;
  updatedAt?: string;
}
