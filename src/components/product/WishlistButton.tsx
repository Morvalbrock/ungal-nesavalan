"use client";
import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlistHas, useWishlistStore } from "@/features/wishlist/wishlist.store";

interface Props {
  productId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function WishlistButton({ productId, variant = "icon", className }: Props) {
  const active = useWishlistHas(productId);
  const toggle = useWishlistStore((s) => s.toggle);
  const [busy, setBusy] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggle(productId);
    } finally {
      setBusy(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-pressed={active}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-card border px-4 py-2.5 text-sm transition",
          active
            ? "border-maroon bg-maroon/5 text-maroon"
            : "border-border text-ink-soft hover:border-ink hover:text-ink",
          className
        )}
      >
        <Heart className={cn("h-4 w-4", active && "fill-current")} />
        {active ? "Saved to wishlist" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur transition hover:bg-cream",
        active && "text-maroon",
        className
      )}
    >
      <Heart className={cn("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
