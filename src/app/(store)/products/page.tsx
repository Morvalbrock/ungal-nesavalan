import { ProductCard } from "@/components/product/ProductCard";
import { demoProducts } from "@/features/products/demo-data";

export default function ProductsPage() {
  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>Products</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
        {demoProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
