import { notFound } from "next/navigation";
import { demoProducts } from "@/features/products/demo-data";

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = demoProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <strong>₹{product.price.toLocaleString("en-IN")}</strong>
      <p>{product.inStock ? "In Stock" : "Out of Stock"}</p>
    </div>
  );
}
