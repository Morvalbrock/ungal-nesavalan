import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { Container } from "./Container";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";
import { MiniCart } from "@/components/cart/MiniCart";
import { AccountMenu } from "./AccountMenu";
import { WishlistHeaderLink } from "./WishlistHeaderLink";
import { categoryRepo, productRepo } from "@/server/repositories";

export async function Header() {
  const [inStockCategories, facets] = await Promise.all([
    categoryRepo.listWithStock(),
    productRepo.getAvailableFacets()
  ]);

  const inStockSlugs = inStockCategories.map((c) => c.slug);
  const availableWeaves = facets.weaves.map((w) => w.id.toLowerCase());
  const availableFabrics = facets.fabrics.map((f) => f.id.toLowerCase());
  const availableOccasions = facets.occasions.map((o) => o.id.toLowerCase());
  const hasBridal = inStockSlugs.includes("bridal-sarees");

  return (
    <div className="sticky top-0 z-40">
      <AnnouncementBar />
      <header className="border-b border-border/70 bg-cream">
        <Container className="flex h-[60px] items-center justify-between gap-2 sm:h-[64px] sm:gap-4 md:h-[72px] lg:gap-6">
          <div className="flex shrink-0 items-center lg:hidden">
            <MobileNav inStockSlugs={inStockSlugs} availableWeaves={availableWeaves} />
          </div>

          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5 md:gap-3">
            <Image
              src="/images/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-7 w-7 shrink-0 sm:h-8 sm:w-8 md:h-10 md:w-10"
            />
            <span className="whitespace-nowrap font-display text-[16px] font-semibold leading-none tracking-tight text-ink sm:text-[19px] md:text-[22px]">
              Ungal Nesavalan
            </span>
            <span className="hidden text-[10px] uppercase tracking-widest2 text-ink-muted xl:inline">
              · Handloom Sarees
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden shrink-0 items-center gap-5 whitespace-nowrap lg:flex xl:gap-7">
            <MegaMenu
              availableWeaves={availableWeaves}
              availableFabrics={availableFabrics}
              availableOccasions={availableOccasions}
              showBridalPromo={hasBridal}
            />
            {inStockSlugs.includes("bridal-sarees") && (
              <Link href="/category/bridal-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
                Bridal
              </Link>
            )}
            {inStockSlugs.includes("silk-sarees") && (
              <Link href="/category/silk-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
                Silk
              </Link>
            )}
            {inStockSlugs.includes("cotton-sarees") && (
              <Link href="/category/cotton-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
                Cotton
              </Link>
            )}
            <Link href="/journal" className="link-underline text-[13px] uppercase tracking-widest2">
              Journal
            </Link>
            <Link href="/about" className="link-underline text-[13px] uppercase tracking-widest2">
              Our Weavers
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-0.5 text-ink sm:gap-1">
            <Link href="/search" aria-label="Search" className="rounded-full p-1.5 transition hover:bg-ink/5 sm:p-2">
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <WishlistHeaderLink />
            <AccountMenu />
            <MiniCart />
          </div>
        </Container>
      </header>
    </div>
  );
}
