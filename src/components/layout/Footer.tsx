import Link from "next/link";
import Image from "next/image";
import { Container } from "./Container";
import { NewsletterForm } from "./NewsletterForm";
import { Ornament } from "@/components/home/Ornament";
import { catalogRepo } from "@/server/repositories";

const baseColumns = [
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
  }
];

const tailColumns = [
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

export async function Footer() {
  const catalogs = await catalogRepo.list();
  const catalogColumn = {
    heading: "By Catalog",
    links: catalogs
      .filter((c) => !c.legacy)
      .slice(0, 8)
      .map((c) => ({ label: c.name, href: `/products?weave=${c.slug}` }))
  };
  const columns = catalogColumn.links.length > 0
    ? [...baseColumns, catalogColumn, ...tailColumns]
    : [...baseColumns, ...tailColumns];
  return (
    <footer className="mt-10 border-t border-border/70 bg-ink text-cream sm:mt-16 md:mt-24">
      <Container className="py-8 sm:py-14 md:py-20">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-14">
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Image
                src="/images/logo.png"
                alt=""
                width={56}
                height={56}
                className="h-9 w-9 shrink-0 sm:h-12 sm:w-12"
              />
              <p className="font-display text-2xl font-medium leading-none sm:text-[30px]">Ungal Nesavalan</p>
            </div>
            <p className="mt-1.5 text-[10px] uppercase tracking-widest2 text-cream/60 sm:mt-2 sm:text-[11px]">
              Direct from Our Elampillai Looms
            </p>
            <Ornament className="mt-3 h-3.5 w-32 sm:mt-5 sm:h-4 sm:w-40" tone="gold" />
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-cream/75 sm:mt-6 sm:text-[14.5px] sm:leading-[1.7]">
              Silk-cotton sarees woven on our own looms in Elampillai, Tamil Nadu —
              direct from our weavers to your drape. Own manufacturing, honest pricing.
            </p>

            <div className="mt-4 sm:mt-6">
              <NewsletterFormOnDark />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-10">
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="text-[10px] font-medium uppercase tracking-widest2 text-cream/60 sm:text-[10.5px]">
                  {col.heading}
                </p>
                <ul className="mt-2.5 space-y-1.5 text-[12.5px] sm:mt-4 sm:space-y-2.5 sm:text-[13.5px]">
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

        <div className="mt-8 grid gap-5 border-t border-cream/10 pt-6 sm:mt-12 sm:gap-6 sm:pt-8 md:mt-16 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest2 text-cream/50 sm:text-[10.5px]">We accept</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px] text-cream/80 sm:mt-3 sm:gap-2 sm:text-[11px]">
              <span className="rounded border border-cream/20 px-1.5 py-0.5 sm:px-2 sm:py-1">UPI</span>
              <span className="rounded border border-cream/20 px-1.5 py-0.5 sm:px-2 sm:py-1">Cards</span>
              <span className="rounded border border-cream/20 px-1.5 py-0.5 sm:px-2 sm:py-1">Netbanking</span>
              <span className="rounded border border-cream/20 px-1.5 py-0.5 sm:px-2 sm:py-1">Wallets</span>
              <span className="rounded border border-cream/20 px-1.5 py-0.5 sm:px-2 sm:py-1">COD</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest2 text-cream/50 sm:text-[10.5px]">Reach us</p>
            <p className="mt-2 text-xs leading-relaxed text-cream/80 sm:mt-3 sm:text-[13px]">
              Nandhakumar, 3/364, KK Nagar West, Edanganasalai, Salem - 637502, Tamil Nadu
            </p>
            <p className="mt-1.5 text-xs text-cream/80 sm:mt-2 sm:text-[13px]">
              <a href="mailto:ungalnesavalan01@gmail.com" className="transition hover:text-gold-soft">
                ungalnesavalan01@gmail.com
              </a>
            </p>
            <p className="text-xs text-cream/80 sm:text-[13px]">
              <a href="tel:+918825810897" className="transition hover:text-gold-soft">
                +91 88258 10897
              </a>{" "}
              · Mon–Sat 10am–7pm
            </p>
          </div>
        </div>
      </Container>

      <div className="border-t border-cream/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-4 text-[10.5px] text-cream/55 sm:flex-row sm:gap-3 sm:py-6 sm:text-[11.5px]">
          <span>© {new Date().getFullYear()} Ungal Nesavalan. All rights reserved.</span>
          <span className="flex items-center gap-1.5 sm:gap-2">
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