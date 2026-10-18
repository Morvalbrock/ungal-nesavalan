"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Heart, User, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    heading: "Shop",
    links: [
      { label: "All Sarees", href: "/products" },
      { label: "Bridal", href: "/category/bridal-sarees" },
      { label: "Silk", href: "/category/silk-sarees" },
      { label: "Cotton", href: "/category/cotton-sarees" },
      { label: "Designer", href: "/category/designer-sarees" },
      { label: "Printed", href: "/category/printed-sarees" }
    ]
  },
  {
    heading: "By Weave",
    links: [
      { label: "Kanjivaram", href: "/products?weave=kanjivaram" },
      { label: "Banarasi", href: "/products?weave=banarasi" },
      { label: "Chanderi", href: "/products?weave=chanderi" },
      { label: "Patola", href: "/products?weave=patola" },
      { label: "Jamdani", href: "/products?weave=jamdani" }
    ]
  },
  {
    heading: "Discover",
    links: [
      { label: "Journal", href: "/journal" },
      { label: "Our Weavers", href: "/about" },
      { label: "Care Guide", href: "/care-guide" },
      { label: "Contact", href: "/contact" }
    ]
  }
];

interface MobileNavProps {
  inStockSlugs?: string[];
  availableWeaves?: string[];
}

export function MobileNav({ inStockSlugs, availableWeaves }: MobileNavProps = {}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filteredSections = SECTIONS.map((s) => {
    let links = s.links;
    if (s.heading === "Shop" && inStockSlugs) {
      links = links.filter((l) => {
        if (l.href === "/products") return true;
        const slug = l.href.split("/category/")[1];
        return slug ? inStockSlugs.includes(slug) : true;
      });
    } else if (s.heading === "By Weave" && availableWeaves) {
      links = links.filter((l) => {
        const weave = l.href.split("weave=")[1]?.toLowerCase();
        return weave ? availableWeaves.includes(weave) : true;
      });
    }
    return { ...s, links };
  }).filter((s) => s.links.length > 0);

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Full screen backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-cream shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt=""
              width={36}
              height={36}
              className="h-8 w-8 shrink-0"
            />
            <div>
              <span className="font-display text-base font-semibold text-ink">Ungal Nesavalan</span>
              <span className="block text-[9px] uppercase tracking-widest text-ink-muted">Handloom Sarees</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-full p-2 text-ink hover:bg-ink/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-7">
            {filteredSections.map((s) => (
              <div key={s.heading}>
                <p className="eyebrow text-ink-muted/80">{s.heading}</p>
                <ul className="mt-2.5 space-y-1">
                  {s.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-card px-2.5 py-2 text-[14.5px] font-medium text-ink-soft transition hover:bg-cream-warm hover:text-maroon"
                      >
                        <span>{l.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-ink-muted/40" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Account & Wishlist quick links */}
          <div className="mt-8 border-t border-border/80 pt-6">
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <Link
                href="/account/wishlist"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-card border border-border bg-cream-warm/40 py-2.5 text-ink-soft transition hover:border-ink hover:text-ink"
              >
                <Heart className="h-4 w-4 text-maroon" />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/account/profile"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-card border border-border bg-cream-warm/40 py-2.5 text-ink-soft transition hover:border-ink hover:text-ink"
              >
                <User className="h-4 w-4 text-ink-muted" />
                <span>Account</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer footer CTA */}
        <div className="border-t border-border/80 p-5">
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="btn-primary w-full justify-center text-center"
          >
            Explore All Sarees
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="rounded-full p-2 text-ink hover:bg-ink/5"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
