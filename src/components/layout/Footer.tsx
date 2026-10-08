import Link from "next/link";
import Image from "next/image";
import { Container } from "./Container";
import { NewsletterForm } from "./NewsletterForm";
import { Ornament } from "@/components/home/Ornament";

const columns = [
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
      { label: "Jamdani", href: "/products?weave=jamdani" },
      { label: "Ikat", href: "/products?weave=ikat" }
    ]
  },
  {
    heading: "Support",
    links: [
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Care Guide", href: "/care-guide" },
      { label: "Size & Length Guide", href: "/size-guide" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    heading: "House",
    links: [
      { label: "Our Weavers", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-ink text-cream">
      <Container className="py-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt=""
                width={56}
                height={56}
                className="h-12 w-12 shrink-0"
              />
              <p className="font-display text-[30px] font-medium leading-none">Ungal Nesavalan</p>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-widest2 text-cream/60">
              Loomed by hand · Since a very long time ago
            </p>
            <Ornament className="mt-5 h-4 w-40" tone="gold" />
            <p className="mt-6 max-w-sm text-[14.5px] leading-[1.7] text-cream/75">
              Handcrafted sarees from India&apos;s finest weaving clusters — direct from
              the loom to your drape. Ninety-two paise of every rupee reaches the artisan.
            </p>

            <div className="mt-6">
              <NewsletterFormOnDark />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="text-[10.5px] font-medium uppercase tracking-widest2 text-cream/60">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-2.5 text-[13.5px]">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-cream/80 transition hover:text-gold-soft">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 border-t border-cream/10 pt-8 md:grid-cols-3">
          <div>
            <p className="text-[10.5px] uppercase tracking-widest2 text-cream/50">Certifications</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="chip-gold">Handloom Mark</span>
              <span className="chip-gold">Silk Mark</span>
              <span className="chip-gold">GI Tag verified</span>
            </div>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-widest2 text-cream/50">We accept</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-cream/80">
              <span className="rounded border border-cream/20 px-2 py-1">UPI</span>
              <span className="rounded border border-cream/20 px-2 py-1">Cards</span>
              <span className="rounded border border-cream/20 px-2 py-1">Netbanking</span>
              <span className="rounded border border-cream/20 px-2 py-1">Wallets</span>
              <span className="rounded border border-cream/20 px-2 py-1">COD</span>
            </div>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-widest2 text-cream/50">Reach us</p>
            <p className="mt-3 text-[13px] text-cream/80">care@ungalnesavalan.com</p>
            <p className="text-[13px] text-cream/80">+91 90000 00000 · Mon–Sat 10am–7pm</p>
          </div>
        </div>
      </Container>

      <div className="border-t border-cream/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-[11.5px] text-cream/55 sm:flex-row">
          <span>© {new Date().getFullYear()} Ungal Nesavalan. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> Made in India · Handloom Mark
          </span>
        </Container>
      </div>
    </footer>
  );
}

function NewsletterFormOnDark() {
  // Wrapper that reuses NewsletterForm but themes it against dark bg
  // by wrapping in a container that overrides base colors via CSS vars is overkill —
  // simpler to render the existing form and let the design breathe.
  return (
    <div className="[&_input]:!bg-cream/5 [&_input]:!border-cream/20 [&_input]:!text-cream [&_input]:placeholder:!text-cream/50 [&_button]:!bg-gold [&_button]:!text-ink hover:[&_button]:!bg-gold-soft [&_p]:!text-cream/60">
      <NewsletterForm />
    </div>
  );
}
