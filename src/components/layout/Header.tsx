import Link from "next/link";
import { Search } from "lucide-react";
import { Container } from "./Container";
import { MiniCart } from "@/components/cart/MiniCart";
import { AccountMenu } from "./AccountMenu";
import { WishlistHeaderLink } from "./WishlistHeaderLink";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Ungal Nesavalan
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-muted sm:inline">
            Handloom Sarees
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/products" className="link-underline text-sm">All Sarees</Link>
          <Link href="/category/silk-sarees" className="link-underline text-sm">Silk</Link>
          <Link href="/category/bridal-sarees" className="link-underline text-sm">Bridal</Link>
          <Link href="/category/cotton-sarees" className="link-underline text-sm">Cotton</Link>
          <Link href="/journal" className="link-underline text-sm">Journal</Link>
        </nav>

        <div className="flex items-center gap-2 text-ink">
          <Link href="/search" aria-label="Search" className="rounded-full p-2 hover:bg-ink/5">
            <Search className="h-5 w-5" />
          </Link>
          <WishlistHeaderLink />
          <AccountMenu />
          <MiniCart />
        </div>
      </Container>
    </header>
  );
}
