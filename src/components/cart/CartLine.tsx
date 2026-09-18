"use client";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { CartItem } from "@/features/cart/cart.types";
import { useCartStore } from "@/features/cart/cart.store";
import { formatINR } from "@/lib/utils";

export function CartLine({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

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
          <div className="inline-flex items-center rounded-card border border-border text-sm">
            <button
              type="button"
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
              className="px-2 py-1 text-ink-muted hover:text-ink disabled:opacity-40"
              disabled={item.quantity <= 1}
              aria-label="Decrease"
            >
              −
            </button>
            <span className="w-6 text-center">{item.quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
              className="px-2 py-1 text-ink-muted hover:text-ink disabled:opacity-40"
              disabled={item.quantity >= item.maxStock}
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
