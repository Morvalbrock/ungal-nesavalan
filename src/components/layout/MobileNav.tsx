"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

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

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-cream p-6 shadow-elev">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold">Ungal Nesavalan</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2 hover:bg-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-8">
              {SECTIONS.map((s) => (
                <div key={s.heading}>
                  <p className="eyebrow">{s.heading}</p>
                  <ul className="mt-3 space-y-3">
                    {s.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className="text-[15px] text-ink-soft transition hover:text-maroon"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="btn-primary mt-8 w-full"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
