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
      className="relative rounded-full p-2 text-slate-700 hover:text-brand-purple hover:bg-purple-50 transition"
    >
      <Heart className="h-5 w-5" />
      {show && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-deep border-2 border-white px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
