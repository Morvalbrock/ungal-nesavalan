"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore, useCartHydrated } from "@/features/cart/cart.store";
import { useWishlistCount, useWishlistHydrated } from "@/features/wishlist/wishlist.store";
import { useMobileNavStore } from "./mobile-nav-store";
import { cn } from "@/lib/utils";

const HIDE_ON_PATHS = ["/checkout"];

export function MobileBottomNav() {
  const pathname = usePathname() || "/";
  const openDrawer = useMobileNavStore((s) => s.openDrawer);
  const drawerOpen = useMobileNavStore((s) => s.open);

  const cartHydrated = useCartHydrated();
  const cartCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );
  const wishlistHydrated = useWishlistHydrated();
  const wishlistCount = useWishlistCount();

  if (HIDE_ON_PATHS.some((p) => pathname.startsWith(p))) return null;

  const isHome = pathname === "/";
  const isWishlist = pathname.startsWith("/account/wishlist");
  const isCart = pathname.startsWith("/cart");
  const isAccount = pathname.startsWith("/account") && !isWishlist;
  const isShopRoute =
    pathname.startsWith("/products") ||
    pathname.startsWith("/category") ||
    pathname.startsWith("/search");
  const isShop = drawerOpen || isShopRoute;

  return (
    <nav
      aria-label="Primary mobile"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-purple-100 bg-white/95 backdrop-blur lg:hidden",
        "shadow-[0_-8px_24px_-16px_rgba(88,28,135,0.12)]"
      )}
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <ul className="mx-auto grid max-w-[560px] grid-cols-5 items-stretch">
        <li>
          <Tab href="/" label="Home" icon={<Home className="h-[20px] w-[20px]" />} active={isHome} />
        </li>
        <li>
          <TabButton
            label="Shop"
            icon={<LayoutGrid className="h-[20px] w-[20px]" />}
            active={isShop}
            onClick={() => openDrawer()}
          />
        </li>
        <li>
          <Tab
            href="/account/wishlist"
            label="Wishlist"
            icon={<Heart className="h-[20px] w-[20px]" />}
            active={isWishlist}
            badge={wishlistHydrated ? wishlistCount : 0}
          />
        </li>
        <li>
          <Tab
            href="/cart"
            label="Bag"
            icon={<ShoppingBag className="h-[20px] w-[20px]" />}
            active={isCart}
            badge={cartHydrated ? cartCount : 0}
          />
        </li>
        <li>
          <Tab
            href="/account/profile"
            label="Account"
            icon={<User className="h-[20px] w-[20px]" />}
            active={isAccount}
          />
        </li>
      </ul>
    </nav>
  );
}

interface TabCore {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}

function TabInner({ label, icon, active, badge }: TabCore) {
  return (
    <span
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 transition-colors",
        active ? "text-brand-purple font-semibold" : "text-purple-900/60 hover:text-brand-plum"
      )}
    >
      <span className="relative">
        {icon}
        {badge && badge > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-brand-deep border border-white px-1 text-[9px] font-bold leading-none text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="text-[10px] font-semibold tracking-wider">
        {label}
      </span>
    </span>
  );
}

function Tab({ href, ...rest }: TabCore & { href: string }) {
  return (
    <Link
      href={href}
      aria-label={rest.label + (rest.badge ? ` (${rest.badge})` : "")}
      aria-current={rest.active ? "page" : undefined}
      className="flex h-full w-full items-center justify-center"
    >
      <TabInner {...rest} />
    </Link>
  );
}

function TabButton({ onClick, ...rest }: TabCore & { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest.label}
      aria-expanded={rest.active}
      className="flex h-full w-full items-center justify-center"
    >
      <TabInner {...rest} />
    </button>
  );
}
