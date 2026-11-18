"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Heart, User, ChevronRight } from "lucide-react";
import { useMobileNavStore } from "./mobile-nav-store";

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
  catalogs?: Array<{ label: string; slug: string }>;
}

export function MobileNav({ inStockSlugs, availableWeaves, catalogs }: MobileNavProps = {}) {
  const open = useMobileNavStore((s) => s.open);
  const openDrawer = useMobileNavStore((s) => s.openDrawer);
  const closeDrawer = useMobileNavStore((s) => s.closeDrawer);
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

  const catalogSection = catalogs && catalogs.length > 0
    ? {
        heading: "By Catalog",
        links: catalogs
          .map((c) => ({ label: c.label, href: `/products?weave=${c.slug}` }))
          .filter((l) => {
            if (!availableWeaves) return true;
            const slug = l.href.split("weave=")[1]?.toLowerCase();
            return slug ? availableWeaves.includes(slug) : true;
          })
      }
    : null;

  const filteredSections = [
    ...SECTIONS.map((s) => {
      let links = s.links;
      if (s.heading === "Shop" && inStockSlugs) {
        links = links.filter((l) => {
          if (l.href === "/products") return true;
          const slug = l.href.split("/category/")[1];
          return slug ? inStockSlugs.includes(slug) : true;
        });
      }
      return { ...s, links };
    }),
    ...(catalogSection ? [catalogSection] : [])
  ].filter((s) => s.links.length > 0);

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex">
      {/* Full screen backdrop */}
      <div
        className="fixed inset-0 bg-[#1f0525]/70 backdrop-blur-sm transition-opacity"
        onClick={() => closeDrawer()}
        aria-hidden="true"
      />

      {/* Slide-out drawer panel */}
      <div className="relative z-10 flex h-full w-[85%] max-w-sm flex-col bg-[#faf7fd] shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-purple-100 bg-white px-6 py-4">
          <Link href="/" onClick={() => closeDrawer()} className="flex items-center">
            <Image
              src="/images/logo.jpeg"
              alt="Ungal Nesavalan"
              width={140}
              height={44}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => closeDrawer()}
            aria-label="Close menu"
            className="rounded-full p-2 text-slate-700 hover:bg-purple-50 hover:text-brand-plum"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            {filteredSections.map((s) => (
              <div key={s.heading}>
                <p className="font-heritage font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-purple-100 pb-1.5">{s.heading}</p>
                <ul className="mt-2 space-y-1">
                  {s.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        onClick={() => closeDrawer()}
                        className="flex items-center justify-between rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-purple-100/70 hover:text-brand-purple"
                      >
                        <span>{l.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-purple-300" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Account & Wishlist quick links */}
          <div className="mt-8 border-t border-purple-100 pt-6">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/account/wishlist"
                onClick={() => closeDrawer()}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white py-2.5 font-semibold text-slate-700 transition hover:border-brand-purple hover:text-brand-plum shadow-xs"
              >
                <Heart className="h-4 w-4 text-brand-purple fill-purple-100" />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/account/profile"
                onClick={() => closeDrawer()}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white py-2.5 font-semibold text-slate-700 transition hover:border-brand-purple hover:text-brand-plum shadow-xs"
              >
                <User className="h-4 w-4 text-purple-700" />
                <span>Account</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Drawer footer CTA */}
        <div className="border-t border-purple-100 p-5 bg-white">
          <Link
            href="/products"
            onClick={() => closeDrawer()}
            className="btn-primary w-full justify-center text-center font-semibold"
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
        onClick={() => openDrawer()}
        className="rounded-full p-2 text-ink hover:bg-ink/5"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
