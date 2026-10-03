import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "./Container";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";
import { MiniCart } from "@/components/cart/MiniCart";
import { AccountMenu } from "./AccountMenu";
import { WishlistHeaderLink } from "./WishlistHeaderLink";

export function Header() {
  return (
    <div className="sticky top-0 z-40">
      <AnnouncementBar />
      <header className="border-b border-border/70 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85">
        <Container className="flex h-[64px] items-center justify-between gap-3 md:h-[72px] md:gap-6">
          <div className="flex items-center gap-2 md:hidden">
            <MobileNav />
          </div>

          <Link href="/" className="flex min-w-0 items-baseline gap-3">
            <span className="whitespace-nowrap font-display text-[17px] font-semibold leading-none tracking-tight text-ink sm:text-[20px] md:text-[22px]">
              Ungal Nesavalan
            </span>
            <span className="hidden text-[10px] uppercase tracking-widest2 text-ink-muted lg:inline">
              · Handloom Sarees
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            <MegaMenu />
            <Link href="/category/bridal-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
              Bridal
            </Link>
            <Link href="/category/silk-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
              Silk
            </Link>
            <Link href="/category/cotton-sarees" className="link-underline text-[13px] uppercase tracking-widest2">
              Cotton
            </Link>
            <Link href="/journal" className="link-underline text-[13px] uppercase tracking-widest2">
              Journal
            </Link>
            <Link href="/about" className="link-underline text-[13px] uppercase tracking-widest2">
              Our Weavers
            </Link>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-0.5 text-ink sm:gap-1">
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
