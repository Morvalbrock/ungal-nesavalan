"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderNavLinksProps {
  inStockSlugs?: string[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  show?: boolean;
}

function HeaderNavLinksInner({ inStockSlugs = [] }: HeaderNavLinksProps) {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");

  // Determine active item based on pathname and category parameter
  const isHomeActive = pathname === "/" && (!categoryParam || categoryParam === "home");
  const isAllSareesActive =
    (pathname === "/products" && !sortParam) ||
    (pathname === "/" && categoryParam === "all");
  const isBridalActive =
    pathname.startsWith("/category/bridal-sarees") ||
    (pathname === "/" && categoryParam === "bridal-sarees");
  const isSilkActive =
    pathname.startsWith("/category/silk-sarees") ||
    (pathname === "/" && categoryParam === "silk-sarees");
  const isCottonActive =
    pathname.startsWith("/category/cotton-sarees") ||
    (pathname === "/" && categoryParam === "cotton-sarees");
  const isNewArrivalsActive =
    (pathname === "/products" && sortParam === "newest") ||
    (pathname === "/" && categoryParam === "new-arrivals");
  const isJournalActive = pathname.startsWith("/journal");
  const isOurWeaversActive = pathname === "/about";

  const navItems: (NavItem & { active: boolean })[] = useMemo(() => {
    const isStorefrontIndex = pathname === "/";

    return [
      {
        id: "home",
        label: "Home",
        href: "/",
        active: isHomeActive
      },
      {
        id: "all-sarees",
        label: "All Sarees",
        href: isStorefrontIndex ? "/?category=all#this-weeks-weave" : "/products",
        active: isAllSareesActive
      },
      {
        id: "bridal-sarees",
        label: "Bridal Sarees",
        href: isStorefrontIndex ? "/?category=bridal-sarees#this-weeks-weave" : "/category/bridal-sarees",
        active: isBridalActive,
        show: inStockSlugs.length === 0 || inStockSlugs.includes("bridal-sarees")
      },
      {
        id: "silk-sarees",
        label: "Silk Sarees",
        href: isStorefrontIndex ? "/?category=silk-sarees#this-weeks-weave" : "/category/silk-sarees",
        active: isSilkActive,
        show: inStockSlugs.length === 0 || inStockSlugs.includes("silk-sarees")
      },
      {
        id: "cotton-sarees",
        label: "Cotton Sarees",
        href: isStorefrontIndex ? "/?category=cotton-sarees#this-weeks-weave" : "/category/cotton-sarees",
        active: isCottonActive,
        show: inStockSlugs.length === 0 || inStockSlugs.includes("cotton-sarees")
      },
      {
        id: "new-arrivals",
        label: "New Arrivals",
        href: isStorefrontIndex ? "/?category=new-arrivals#this-weeks-weave" : "/products?sort=newest",
        active: isNewArrivalsActive,
        badge: "New"
      },
      {
        id: "journal",
        label: "Journal",
        href: "/journal",
        active: isJournalActive
      },
      {
        id: "our-weavers",
        label: "Our Weavers",
        href: "/about",
        active: isOurWeaversActive
      }
    ];
  }, [
    pathname,
    isHomeActive,
    isAllSareesActive,
    isBridalActive,
    isSilkActive,
    isCottonActive,
    isNewArrivalsActive,
    isJournalActive,
    isOurWeaversActive,
    inStockSlugs
  ]);

  return (
    <ul className="flex items-center gap-1 sm:gap-1.5 shrink-0 py-2 text-xs sm:text-[13px]">
      {navItems
        .filter((item) => item.show !== false)
        .map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5",
                item.active
                  ? "text-amber-300 font-bold bg-white/15 border border-amber-300/30 shadow-sm"
                  : "text-purple-100 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="bg-gradient-to-r from-pink-500 to-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          </li>
        ))}
    </ul>
  );
}

function HeaderNavLinksFallback({ inStockSlugs = [] }: HeaderNavLinksProps) {
  return (
    <ul className="flex items-center gap-1 sm:gap-1.5 shrink-0 py-2 text-xs sm:text-[13px]">
      <li>
        <Link
          href="/"
          className="px-3 py-1.5 rounded-full text-amber-300 font-bold bg-white/15 border border-amber-300/30 shadow-sm"
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          href="/products"
          className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          All Sarees
        </Link>
      </li>
      {inStockSlugs.includes("bridal-sarees") && (
        <li>
          <Link
            href="/category/bridal-sarees"
            className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            Bridal Sarees
          </Link>
        </li>
      )}
      {inStockSlugs.includes("silk-sarees") && (
        <li>
          <Link
            href="/category/silk-sarees"
            className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            Silk Sarees
          </Link>
        </li>
      )}
      {inStockSlugs.includes("cotton-sarees") && (
        <li>
          <Link
            href="/category/cotton-sarees"
            className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            Cotton Sarees
          </Link>
        </li>
      )}
      <li>
        <Link
          href="/products"
          className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors inline-flex items-center gap-1.5"
        >
          <span>New Arrivals</span>
          <span className="bg-gradient-to-r from-pink-500 to-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
            New
          </span>
        </Link>
      </li>
      <li>
        <Link
          href="/journal"
          className="px-3 py-1.5 text-purple-100 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          Journal
        </Link>
      </li>
      <li>
        <Link
          href="/about"
          className="px-3 py-1.5 text-purple-100 hover:text-amber-200 hover:bg-white/10 rounded-full transition-colors"
        >
          Our Weavers
        </Link>
      </li>
    </ul>
  );
}

export function HeaderNavLinks(props: HeaderNavLinksProps) {
  return (
    <Suspense fallback={<HeaderNavLinksFallback inStockSlugs={props.inStockSlugs} />}>
      <HeaderNavLinksInner {...props} />
    </Suspense>
  );
}
