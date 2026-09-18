import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { demoProducts } from "@/features/products/demo-data";

export default function HomePage() {
  return (
    <div className="container">
      <section style={{ padding: "64px 0" }}>
        <h1>Ungal Nesavalan</h1>
        <p>Scalable frontend base for products, cart, checkout and orders.</p>
        <Link href="/products">Browse Products →</Link>
      </section>
      <section>
        <h2>Featured Products</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {demoProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}
