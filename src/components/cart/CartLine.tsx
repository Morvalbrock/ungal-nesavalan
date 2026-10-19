"use client";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CartItem } from "@/features/cart/cart.types";
import { useCartStore } from "@/features/cart/cart.store";
import { formatINR } from "@/lib/utils";

const MAX_PURCHASE_LIMIT = 30;

export function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const maxAllowed = Math.min(MAX_PURCHASE_LIMIT, item.maxStock);

  const [typedQty, setTypedQty] = useState(String(item.quantity));

  useEffect(() => {
    setTypedQty(String(item.quantity));
  }, [item.quantity]);

  const handleStep = (delta: number) => {
    const current = parseInt(typedQty, 10) || item.quantity;
    const next = Math.max(1, Math.min(maxAllowed, current + delta));
    setQuantity(item.variantId, next);
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
    if (num > maxAllowed) {
      setQuantity(item.variantId, maxAllowed);
      setTypedQty(String(maxAllowed));
    } else {
      setQuantity(item.variantId, num);
      setTypedQty(clean);
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(typedQty, 10);
    if (!typedQty || isNaN(parsed) || parsed < 1) {
      setQuantity(item.variantId, 1);
      setTypedQty("1");
    } else {
      const clamped = Math.max(1, Math.min(maxAllowed, parsed));
      setQuantity(item.variantId, clamped);
      setTypedQty(String(clamped));
    }
  };

  return (
    <div className="flex gap-4 border-b border-border/70 py-4 last:border-b-0">
      <Link
        href={`/products/${item.slug}`}
        className={`relative shrink-0 overflow-hidden rounded-card bg-cream-warm ${
          compact ? "h-20 w-16" : "h-28 w-24"
        }`}
      >
        {item.image && (
          <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
        )}
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/products/${item.slug}`} className="font-display text-base leading-tight hover:underline">
              {item.name}
            </Link>
            <p className="mt-1 text-xs text-ink-muted">Colour · {item.variantLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            aria-label={`Remove ${item.name}`}
            className="rounded-full p-1 text-ink-muted transition hover:bg-ink/5 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center rounded-card border border-border bg-white text-sm">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="h-8 w-8 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-cream/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={item.quantity <= 1}
              aria-label="Decrease"
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
              className="h-8 w-10 border-x border-border/60 bg-transparent text-center text-xs font-semibold text-ink focus:bg-cream/30 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="h-8 w-8 flex items-center justify-center text-ink-muted hover:text-ink hover:bg-cream/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={item.quantity >= maxAllowed}
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <p className="font-medium">{formatINR(item.unitPricePaise * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
}
