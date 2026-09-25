import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "./SectionHeading";
import type { ProductSummary } from "@/types/product";

interface Props {
  products: ProductSummary[];
  eyebrow: string;
  title: string;
  subtitle?: string;
  href?: string;
  tone?: "cream" | "warm";
}

export function FeaturedRail({ products, eyebrow, title, subtitle, href, tone = "cream" }: Props) {
  if (products.length === 0) return null;
  const bg = tone === "warm" ? "bg-cream-warm/40" : "bg-cream";
  return (
    <section className={`border-t border-border/60 ${bg} py-24`}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          cta={href ? { label: "View all", href } : undefined}
          align="left"
        />

        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
