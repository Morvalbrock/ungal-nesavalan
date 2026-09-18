"use client";
import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/features/cart/cart.store";
import { cn, formatINR } from "@/lib/utils";

export function PurchasePanel({ product }: { product: Product }) {
  const firstInStock = useMemo(
    () => product.variants.find((v) => v.stock > 0) ?? product.variants[0],
    [product.variants]
  );
  const [variantId, setVariantId] = useState<string>(firstInStock?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstInStock;
  const unitPrice = variant?.priceOverride ?? product.salePrice ?? product.basePrice;
  const outOfStock = !variant || variant.stock === 0;
  const maxQty = Math.max(1, Math.min(10, variant?.stock ?? 1));

  const handleAdd = () => {
    if (!variant || outOfStock) return;
    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      variantLabel: variant.color,
      image: product.images[0]?.url ?? "",
      unitPricePaise: unitPrice,
      quantity,
      maxStock: variant.stock
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-ink-muted">
          Colour · {variant?.color ?? "—"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const active = v.id === variant?.id;
            const disabled = v.stock === 0;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                }}
                disabled={disabled}
                aria-label={v.color}
                className={cn(
                  "relative flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition",
                  active ? "border-ink" : "border-border hover:border-ink/60",
                  disabled && "opacity-40"
                )}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full border border-ink/20"
                  style={{ background: v.colorHex }}
                />
                <span className="capitalize">{v.color}</span>
                {disabled && <span className="text-ink-muted">· sold out</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-card border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg text-ink-muted hover:text-ink disabled:opacity-40"
            disabled={quantity <= 1 || outOfStock}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="px-3 py-2 text-lg text-ink-muted hover:text-ink disabled:opacity-40"
            disabled={quantity >= maxQty || outOfStock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <span className="text-sm text-ink-muted">
          {outOfStock ? "Out of stock" : `${variant?.stock} available`}
        </span>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={cn(
          "btn-primary w-full transition",
          justAdded && "!bg-ink"
        )}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" /> Added to cart
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Add to cart · {formatINR(unitPrice * quantity)}
          </>
        )}
      </button>

      <p className="text-xs text-ink-muted">
        Free shipping within India · Handloom Mark certified · 7-day return on unworn drapes
      </p>
    </div>
  );
}
