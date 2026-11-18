import Link from "next/link";
import Image from "next/image";
import { Search, Award } from "lucide-react";
import { Container } from "./Container";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";
import { HeaderNavLinks } from "./HeaderNavLinks";
import { MiniCart } from "@/components/cart/MiniCart";
import { AccountMenu } from "./AccountMenu";
import { WishlistHeaderLink } from "./WishlistHeaderLink";
import { WhatsAppCta } from "./WhatsAppCta";
import { catalogRepo, categoryRepo, productRepo } from "@/server/repositories";

export async function Header() {
  const [inStockCategories, facets, allCatalogs] = await Promise.all([
    categoryRepo.listWithStock(),
    productRepo.getAvailableFacets(),
    catalogRepo.list()
  ]);

  const inStockSlugs = inStockCategories.map((c) => c.slug);
  const availableWeaves = facets.weaves.map((w) => w.id.toLowerCase());
  const availableFabrics = facets.fabrics.map((f) => f.id.toLowerCase());
  const availableOccasions = facets.occasions.map((o) => o.id.toLowerCase());
  const hasBridal = inStockSlugs.includes("bridal-sarees");

  const catalogMenuItems = allCatalogs
    .filter((c) => !c.legacy)
    .map((c) => ({ label: c.name, slug: c.slug }));

  return (
    <div className="sticky top-0 z-40">
      <AnnouncementBar />

      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur border-b border-purple-100 shadow-sm">
        <Container className="flex h-16 sm:h-[70px] items-center justify-between gap-3 md:gap-6">
          {/* Mobile hamburger menu */}
          <div className="flex shrink-0 items-center lg:hidden">
            <MobileNav
              inStockSlugs={inStockSlugs}
              availableWeaves={availableWeaves}
              catalogs={catalogMenuItems}
            />
          </div>

          {/* Brand Logo Container */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <Image
              src="/images/logo.jpeg"
              alt="Ungal Nesavalan Elampillai Handlooms"
              width={160}
              height={50}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Search Bar (center) */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <form action="/search" method="GET" className="relative flex items-center">
              <input
                name="q"
                type="text"
                placeholder="Search for Kalyani Sarees, Pure Cotton, Aarani Silk..."
                className="w-full pl-5 pr-14 py-2.5 rounded-full border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm bg-purple-50/40 hover:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-deep hover:bg-brand-purple text-white w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* User Utility Navigation */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {/* Search icon for mobile screen */}
            <Link
              href="/search"
              aria-label="Search"
              className="md:hidden text-purple-900 p-2 text-lg hover:text-brand-purple rounded-full"
            >
              <Search className="h-5 w-5" />
            </Link>

            <WhatsAppCta />
            <AccountMenu />
            
            {/* Wishlist & Bag: Hidden on mobile (< lg) because they appear in the sticky bottom bar */}
            <span className="hidden lg:inline-flex">
              <WishlistHeaderLink />
            </span>
            <span className="hidden lg:inline-flex">
              <MiniCart />
            </span>
          </div>
        </Container>
      </header>

      {/* Mobile Quick Search Bar (Matching Stitch Mobile Screen) */}
      <div className="md:hidden px-3.5 pt-2 pb-2.5 bg-white/95 backdrop-blur-md border-b border-purple-100">
        <form action="/search" method="GET" className="relative flex items-center">
          <input
            name="q"
            type="text"
            placeholder="Search Kalyani Cotton, Soft Silk, Loom sarees..."
            className="w-full pl-9 pr-16 py-2 text-xs bg-purple-50/50 rounded-full border border-purple-200 text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-1 focus:ring-brand-purple shadow-xs"
          />
          <Search className="w-4 h-4 absolute left-3 text-purple-500" />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-deep hover:bg-brand-purple text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Category Nav Bar */}
      <nav className="bg-gradient-to-r from-[#2f0837] via-[#430f4e] to-[#2f0837] text-white shadow-inner hidden lg:block">
        <Container className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <MegaMenu
              availableWeaves={availableWeaves}
              availableFabrics={availableFabrics}
              availableOccasions={availableOccasions}
              catalogs={catalogMenuItems}
              showBridalPromo={hasBridal}
            />

            <HeaderNavLinks inStockSlugs={inStockSlugs} />
          </div>

          {/* 100% Authentic Tag */}
          <div className="flex items-center gap-1.5 text-xs text-amber-200/90 pl-4 shrink-0">
            <Award className="h-4 w-4 text-amber-400" />
            <span>100% Authentic Elampillai</span>
          </div>
        </Container>
      </nav>
    </div>
  );
}
