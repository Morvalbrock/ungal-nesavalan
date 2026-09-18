import Link from "next/link";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <div style={{ height: 180, background: "#f4f4f4", borderRadius: 8, display: "grid", placeItems: "center" }}>
        Product Image
      </div>
      <h3>{product.name}</h3>
      <p>₹{product.price.toLocaleString("en-IN")}</p>
      <Link href={`/products/${product.slug}`}>View Product</Link>
    </article>
  );
}
