"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const COLUMNS = [
  {
    heading: "Weave",
    links: [
      { label: "Kanjivaram", href: "/products?weave=kanjivaram" },
      { label: "Banarasi", href: "/products?weave=banarasi" },
      { label: "Chanderi", href: "/products?weave=chanderi" },
      { label: "Patola", href: "/products?weave=patola" },
      { label: "Jamdani", href: "/products?weave=jamdani" },
      { label: "Ikat", href: "/products?weave=ikat" },
      { label: "Bandhani", href: "/products?weave=bandhani" }
    ]
  },
  {
    heading: "Fabric",
    links: [
      { label: "Pure Silk", href: "/products?fabric=silk" },
      { label: "Cotton", href: "/products?fabric=cotton" },
      { label: "Linen", href: "/products?fabric=linen" },
      { label: "Organza", href: "/products?fabric=organza" },
      { label: "Georgette", href: "/products?fabric=georgette" },
      { label: "Tissue", href: "/products?fabric=tissue" }
    ]
  },
  {
    heading: "Occasion",
    links: [
      { label: "Bridal", href: "/products?occasion=bridal" },
      { label: "Festive", href: "/products?occasion=festive" },
      { label: "Party", href: "/products?occasion=party" },
      { label: "Office", href: "/products?occasion=office" },
      { label: "Daily", href: "/products?occasion=daily" },
      { label: "Casual", href: "/products?occasion=casual" }
    ]
  }
];

export function MegaMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="link-underline flex items-center gap-1 text-[13px] uppercase tracking-widest2"
      >
        All Sarees
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="fixed left-0 right-0 top-[calc(72px+32px)] z-40 border-y border-border/70 bg-cream shadow-elev"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-6 py-10 lg:grid-cols-[repeat(3,1fr)_320px]">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <p className="eyebrow">Shop by {col.heading}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
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

            <Link
              href="/category/bridal-sarees"
              onClick={() => setOpen(false)}
              className="group relative block aspect-[4/5] overflow-hidden rounded-card"
            >
              <Image
                src="https://picsum.photos/seed/mega-bridal/640/800"
                alt="Bridal edit"
                fill
                sizes="320px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <p className="eyebrow-cream">Featured</p>
                <p className="mt-1 font-display text-2xl">The Bridal Edit</p>
                <p className="mt-1 text-[13px] text-cream/80">Kanjivaram, Banarasi & Baluchari</p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
