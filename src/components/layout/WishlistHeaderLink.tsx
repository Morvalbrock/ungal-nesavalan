"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistCount, useWishlistHydrated } from "@/features/wishlist/wishlist.store";

export function WishlistHeaderLink() {
  const hydrated = useWishlistHydrated();
  const count = useWishlistCount();
  const show = hydrated && count > 0;

  return (
    <Link
      href="/account/wishlist"
      aria-label={`Wishlist${show ? ` (${count})` : ""}`}
      className="relative rounded-full p-2 text-ink hover:bg-ink/5"
    >
      <Heart className="h-5 w-5" />
      {show && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-medium text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
