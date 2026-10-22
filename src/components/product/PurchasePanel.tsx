"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/types/product";
import { useCartStore } from "@/features/cart/cart.store";
import { useSelectedVariantStore } from "@/features/products/selected-variant.store";
import { track } from "@/features/analytics/track";
import { cn, formatINR } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

const MAX_PURCHASE_LIMIT = 30;

export function PurchasePanel({ product }: { product: Product }) {
  const firstInStock = useMemo(
    () => product.variants.find((v) => v.stock > 0) ?? product.variants[0],
    [product.variants]
  );
  const [variantId, setVariantId] = useState<string>(firstInStock?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [typedQty, setTypedQty] = useState("1");
  const [justAdded, setJustAdded] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const selectVariant = useSelectedVariantStore((s) => s.select);
  const resetSelectedVariant = useSelectedVariantStore((s) => s.reset);
  const router = useRouter();

  useEffect(() => {
    if (variantId) selectVariant(product.id, variantId);
    return () => resetSelectedVariant();
  }, [product.id, variantId, selectVariant, resetSelectedVariant]);

  const variant = product.variants.find((v) => v.id === variantId) ?? firstInStock;
  const unitPrice = variant?.priceOverride ?? product.salePrice ?? product.basePrice;
  const outOfStock = !variant || variant.stock === 0;
  const maxQty = Math.max(1, Math.min(MAX_PURCHASE_LIMIT, variant?.stock ?? 1));

  const handleStep = (delta: number) => {
    if (outOfStock) return;
    const current = parseInt(typedQty, 10) || quantity;
    const next = Math.max(1, Math.min(maxQty, current + delta));
    setQuantity(next);
    setTypedQty(String(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setTypedQty("");
      return;
    }
    const clean = val.replace(/\D/g, "");
    if (clean === "") {
      setTypedQty("");
      return;
    }
    const num = parseInt(clean, 10);
    if (isNaN(num)) {
      setTypedQty("");
      return;
    }
    if (num > maxQty) {
      setQuantity(maxQty);
      setTypedQty(String(maxQty));
    } else {
      setQuantity(num);
      setTypedQty(clean);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(typedQty, 10);
    if (!typedQty || isNaN(parsed) || parsed < 1) {
      setQuantity(1);
      setTypedQty("1");
    } else {
      const clamped = Math.max(1, Math.min(maxQty, parsed));
      setQuantity(clamped);
      setTypedQty(String(clamped));
    }
  };

  const effectiveQty = Math.max(1, Math.min(maxQty, parseInt(typedQty, 10) || quantity || 1));

  const addToCart = () => {
    if (!variant || outOfStock) return false;
    setQuantity(effectiveQty);
    setTypedQty(String(effectiveQty));
    addItem({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      variantLabel: variant.color,
      image: product.images[0]?.url ?? "",
      unitPricePaise: unitPrice,
      quantity: effectiveQty,
      maxStock: Math.min(MAX_PURCHASE_LIMIT, variant.stock)
    });
    track.addToCart({
      productId: product.id,
      variantId: variant.id,
      priceInr: Math.round(unitPrice / 100)
    });
    return true;
  };

  const handleAdd = () => {
    if (!addToCart()) return;
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!addToCart()) return;
    setBuyingNow(true);
    router.push("/checkout");
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
                  setTypedQty("1");
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
        <div className="inline-flex items-center rounded-card border border-border bg-white shadow-xs">
          <button
            type="button"
            onClick={() => handleStep(-1)}
            className="flex h-10 w-10 items-center justify-center text-lg text-ink-muted transition hover:text-ink hover:bg-cream/40 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={effectiveQty <= 1 || outOfStock}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={typedQty}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={outOfStock}
            className="h-10 w-12 border-x border-border/60 bg-transparent text-center text-sm font-semibold text-ink focus:bg-cream/30 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Quantity"
          />
          <button
            type="button"
            onClick={() => handleStep(1)}
            className="flex h-10 w-10 items-center justify-center text-lg text-ink-muted transition hover:text-ink hover:bg-cream/40 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={effectiveQty >= maxQty || outOfStock}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-ink-muted">
            {outOfStock ? "Out of stock" : `${variant?.stock} available`}
          </span>
          {!outOfStock && variant && variant.stock > MAX_PURCHASE_LIMIT && (
            <span className="text-[11px] text-ink-muted/80">Max 30 per order</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || buyingNow}
          className={cn(
            "btn-ghost flex-1 transition",
            justAdded && "!border-ink !bg-ink !text-cream"
          )}
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4" /> Added to cart
            </>
          ) : outOfStock ? (
            "Sold out"
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock || buyingNow}
          className="btn-primary flex-1 transition"
        >
          <Zap className="h-4 w-4" />
          {buyingNow ? "Redirecting…" : outOfStock ? "Sold out" : `Buy now · ${formatINR(unitPrice * effectiveQty)}`}
        </button>
      </div>

      <WishlistButton productId={product.id} variant="full" />

      <p className="text-xs text-ink-muted">
        Free shipping within India · Handloom Mark certified · 7-day return on unworn drapes
      </p>
    </div>
  );
}
