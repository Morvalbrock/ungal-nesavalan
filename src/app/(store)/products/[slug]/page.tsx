import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { productRepo } from "@/server/repositories";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await productRepo.findBySlug(slug);
  if (!p) return { title: "Not found" };
  return { title: p.name, description: p.description };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productRepo.findBySlug(slug);
  if (!product) notFound();

  const onSale = product.salePrice != null && product.salePrice < product.basePrice;

  return (
    <Container className="py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {product.images.map((img, i) => (
            <div
              key={img.id}
              className={`relative aspect-[3/4] overflow-hidden rounded-card bg-cream-warm ${
                i === 0 ? "col-span-2" : ""
              }`}
            >
              <Image src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink-muted">
            {product.weave} · {product.fabric} · {product.region}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-medium">{formatINR(product.salePrice ?? product.basePrice)}</span>
            {onSale && <span className="text-base text-ink-muted line-through">{formatINR(product.basePrice)}</span>}
          </div>

          <p className="mt-6 text-ink-soft">{product.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border/70 pt-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Length</dt>
              <dd className="mt-1">{product.lengthMeters} m</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Blouse Piece</dt>
              <dd className="mt-1">{product.blousePieceIncluded ? "Included" : "Not included"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs uppercase tracking-wider text-ink-muted">Care</dt>
              <dd className="mt-1">{product.careInstructions}</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {product.variants.map((v) => (
              <div key={v.id} className="flex items-center gap-2 rounded-card border border-border px-3 py-2 text-sm">
                <span className="h-4 w-4 rounded-full border border-ink/20" style={{ background: v.colorHex }} />
                <span>{v.color}</span>
                <span className="text-xs text-ink-muted">· {v.stock} in stock</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button type="button" className="btn-primary w-full sm:w-auto" disabled>
              Add to Cart (Phase 2)
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
